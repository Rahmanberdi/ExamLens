from datetime import date
from decimal import Decimal, InvalidOperation

from django.db import transaction
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework import status

from .models import User, Subject, Exam, Question, StudentAnswer
from .permissions import IsAdmin
from .import_utils import parse_file, parse_question_type, parse_answer_value, parse_date
from .ai_utils import generate_knowledge_points_all_langs, refresh_exam_summary_all_langs


class ImportQuestionsView(APIView):
    permission_classes = [IsAdmin]
    parser_classes = [MultiPartParser]

    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            rows = parse_file(file)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        imported = 0
        skipped = []
        created_exam_ids = set()

        for i, row in enumerate(rows, start=2):
            question = None
            try:
                with transaction.atomic():
                    subject_name = row.get('subject_name', '').strip()
                    if not subject_name:
                        raise ValueError('subject_name is required.')

                    exam_name = row.get('exam_name', '').strip()
                    if not exam_name:
                        raise ValueError('exam_name is required.')

                    q_num_raw = row.get('question_number', '').strip()
                    if not q_num_raw:
                        raise ValueError('question_number is required.')
                    try:
                        question_number = int(float(q_num_raw))
                    except (ValueError, TypeError):
                        raise ValueError(f'question_number must be an integer, got: "{q_num_raw}"')
                    if question_number < 1:
                        raise ValueError('question_number must be >= 1.')

                    question_type = parse_question_type(row.get('question_type', ''))

                    content = row.get('content', '').strip()
                    if not content:
                        raise ValueError('content is required.')

                    max_score_raw = row.get('max_score', '').strip()
                    try:
                        max_score = Decimal(max_score_raw)
                    except InvalidOperation:
                        raise ValueError(f'max_score must be a number, got: "{max_score_raw}"')

                    correct_answer = parse_answer_value(
                        row.get('correct_answer', ''), question_type
                    )

                    options = {}
                    for key in ['a', 'b', 'c', 'd']:
                        val = row.get(f'option_{key}', '').strip()
                        if val:
                            options[key.upper()] = val

                    subject, _ = Subject.objects.get_or_create(
                        name=subject_name,
                        defaults={'description': row.get('subject_description', '').strip()},
                    )

                    exam_date_raw = row.get('exam_date', '').strip()
                    exam_date = parse_date(exam_date_raw) if exam_date_raw else date.today()

                    exam, exam_created = Exam.objects.get_or_create(
                        name=exam_name,
                        subject=subject,
                        defaults={'exam_date': exam_date, 'total_score': Decimal('0')},
                    )
                    if exam_created:
                        created_exam_ids.add(exam.id)

                    question, _ = Question.objects.update_or_create(
                        exam=exam,
                        question_number=question_number,
                        defaults={
                            'question_type': question_type,
                            'content': content,
                            'options': options,
                            'correct_answer': correct_answer,
                            'max_score': max_score,
                        },
                    )
                    imported += 1
            except Exception as e:
                skipped.append({'row': i, 'error': str(e)})
                continue
            # Best-effort knowledge point outside the transaction
            if not question.knowledge_point:
                kp = generate_knowledge_points_all_langs(question.content, question.question_type)
                if kp:
                    Question.objects.filter(pk=question.pk).update(knowledge_point=kp)

        # Set total_score for newly created exams to sum of their questions' max_score
        for exam_id in created_exam_ids:
            try:
                exam_qs = Exam.objects.filter(id=exam_id)
                total = sum(q.max_score for q in Question.objects.filter(exam_id=exam_id))
                exam_qs.update(total_score=total)
            except Exception:
                pass

        return Response({'imported': imported, 'skipped': skipped})


class ImportAnswersView(APIView):
    permission_classes = [IsAdmin]
    parser_classes = [MultiPartParser]

    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            rows = parse_file(file)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        imported = 0
        skipped = []
        affected_exam_ids: set = set()

        for i, row in enumerate(rows, start=2):
            try:
                with transaction.atomic():
                    student_username = row.get('student_username', '').strip()
                    if not student_username:
                        raise ValueError('student_username is required.')

                    subject_name = row.get('subject_name', '').strip()
                    if not subject_name:
                        raise ValueError('subject_name is required.')

                    exam_name = row.get('exam_name', '').strip()
                    if not exam_name:
                        raise ValueError('exam_name is required.')

                    q_num_raw = row.get('question_number', '').strip()
                    if not q_num_raw:
                        raise ValueError('question_number is required.')
                    try:
                        question_number = int(float(q_num_raw))
                    except (ValueError, TypeError):
                        raise ValueError(f'question_number must be an integer, got: "{q_num_raw}"')

                    selected_raw = row.get('selected_answer', '').strip()

                    try:
                        student = User.objects.get(username=student_username, role=User.Role.STUDENT)
                    except User.DoesNotExist:
                        raise ValueError(f'Student "{student_username}" not found.')

                    try:
                        subject = Subject.objects.get(name=subject_name)
                    except Subject.DoesNotExist:
                        raise ValueError(f'Subject "{subject_name}" not found.')

                    try:
                        exam = Exam.objects.get(name=exam_name, subject=subject)
                    except Exam.DoesNotExist:
                        raise ValueError(
                            f'Exam "{exam_name}" not found under subject "{subject_name}".'
                        )

                    try:
                        question = Question.objects.get(exam=exam, question_number=question_number)
                    except Question.DoesNotExist:
                        raise ValueError(
                            f'Question #{question_number} not found in exam "{exam_name}".'
                        )

                    selected_answer = parse_answer_value(selected_raw, question.question_type)

                    StudentAnswer.objects.update_or_create(
                        question=question,
                        student=student,
                        defaults={'selected_answer': selected_answer},
                    )
                    imported += 1
                    affected_exam_ids.add(exam.id)
            except Exception as e:
                skipped.append({'row': i, 'error': str(e)})

        # Regenerate AI summary once per affected exam, all languages in one shot
        for exam_id in affected_exam_ids:
            try:
                refresh_exam_summary_all_langs(exam_id)
            except Exception:
                pass

        return Response({'imported': imported, 'skipped': skipped})
