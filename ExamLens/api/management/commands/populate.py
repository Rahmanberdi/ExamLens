from decimal import Decimal
from django.core.management.base import BaseCommand
from api.models import User, Subject, Exam, Question


class Command(BaseCommand):
    help = 'Seed the database with demo data'

    def handle(self, *args, **kwargs):
        self._create_users()
        self._create_subjects_and_exams()
        self.stdout.write(self.style.SUCCESS('Database populated successfully.'))

    def _create_users(self):
        users = [
            dict(username='admin1', password='admin123', real_name='管理员', role=User.Role.ADMIN, is_staff=True),
            dict(username='teacher1', password='teacher123', real_name='李老师', role=User.Role.TEACHER),
            dict(username='student1', password='student123', real_name='张三', role=User.Role.STUDENT),
            dict(username='student2', password='student123', real_name='李四', role=User.Role.STUDENT),
            dict(username='student3', password='student123', real_name='王五', role=User.Role.STUDENT),
        ]
        for data in users:
            if not User.objects.filter(username=data['username']).exists():
                password = data.pop('password')
                user = User(**data)
                user.set_password(password)
                user.save()
                self.stdout.write(f"  Created user: {data['username']}")

    def _create_subjects_and_exams(self):
        math, _ = Subject.objects.get_or_create(name='数学', defaults={'description': '高中数学'})
        physics, _ = Subject.objects.get_or_create(name='物理', defaults={'description': '高中物理'})

        self._create_exam(math, '2025期中考试', '2025-06-01', [
            dict(question_number=1, question_type=Question.QuestionType.SINGLE_CHOICE,
                 content='下列哪个是质数？',
                 options={'A': '1', 'B': '2', 'C': '4', 'D': '9'},
                 correct_answer=['B'], max_score=Decimal('5.00')),
            dict(question_number=2, question_type=Question.QuestionType.MULTIPLE_CHOICE,
                 content='下列哪些是偶数？',
                 options={'A': '2', 'B': '3', 'C': '4', 'D': '5'},
                 correct_answer=['A', 'C'], max_score=Decimal('5.00')),
            dict(question_number=3, question_type=Question.QuestionType.TRUE_FALSE,
                 content='0是自然数。',
                 options={}, correct_answer=[True], max_score=Decimal('3.00')),
            dict(question_number=4, question_type=Question.QuestionType.FILL_BLANK,
                 content='π的近似值是___（保留两位小数）。',
                 options={}, correct_answer=['3.14'], max_score=Decimal('5.00')),
        ])

        self._create_exam(physics, '2025期中考试', '2025-06-02', [
            dict(question_number=1, question_type=Question.QuestionType.SINGLE_CHOICE,
                 content='光在真空中的速度约为？',
                 options={'A': '3×10⁸ m/s', 'B': '3×10⁶ m/s', 'C': '3×10⁴ m/s', 'D': '3×10² m/s'},
                 correct_answer=['A'], max_score=Decimal('5.00')),
            dict(question_number=2, question_type=Question.QuestionType.MULTIPLE_CHOICE,
                 content='下列属于矢量的是？',
                 options={'A': '速度', 'B': '质量', 'C': '力', 'D': '温度'},
                 correct_answer=['A', 'C'], max_score=Decimal('5.00')),
            dict(question_number=3, question_type=Question.QuestionType.TRUE_FALSE,
                 content='重力的方向总是竖直向下。',
                 options={}, correct_answer=[True], max_score=Decimal('3.00')),
            dict(question_number=4, question_type=Question.QuestionType.FILL_BLANK,
                 content='牛顿第一定律又称___定律。',
                 options={}, correct_answer=['惯性'], max_score=Decimal('5.00')),
        ])

    def _create_exam(self, subject, name, exam_date, questions):
        exam, created = Exam.objects.get_or_create(
            subject=subject,
            name=name,
            defaults={
                'exam_date': exam_date,
                'total_score': sum(q['max_score'] for q in questions),
            }
        )
        if created:
            self.stdout.write(f"  Created exam: {subject.name} - {name}")
        for q in questions:
            Question.objects.get_or_create(
                exam=exam,
                question_number=q['question_number'],
                defaults={k: v for k, v in q.items() if k != 'question_number'},
            )
