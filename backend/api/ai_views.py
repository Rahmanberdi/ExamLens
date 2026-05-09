from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .ai_utils import refresh_exam_summary
from .models import Exam
from .permissions import IsAdminOrTeacher

SUPPORTED_LANGS = {'en', 'zh', 'ru'}


class ExamAiSummaryView(APIView):
    permission_classes = [IsAdminOrTeacher]

    def get(self, request, exam_id):
        lang = request.query_params.get('lang', 'en')
        if lang not in SUPPORTED_LANGS:
            lang = 'en'

        try:
            exam = Exam.objects.select_related('subject').get(pk=exam_id)
        except Exam.DoesNotExist:
            return Response({'error': 'Exam not found'}, status=status.HTTP_404_NOT_FOUND)

        # Serve cached version for this language unless refresh is requested
        cached = (exam.ai_summary or {}).get(lang)
        if cached and not request.query_params.get('refresh'):
            return Response({'summary': cached})

        summary = refresh_exam_summary(exam_id, lang=lang)
        return Response({'summary': summary})
