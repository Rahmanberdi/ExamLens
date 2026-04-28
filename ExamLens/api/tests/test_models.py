from django.test import TestCase
from django.db import IntegrityError
from decimal import Decimal
from api.models import User, Subject, Exam, Question

class UserModelTest(TestCase):
    def test_create_user_with_default_role(self):
        user = User.objects.create_user(username='student1', password='password123')
        self.assertEqual(user.role, User.Role.STUDENT)
        self.assertEqual(user.username, 'student1')

    def test_create_user_with_teacher_role(self):
        user = User.objects.create_user(username='teacher1', password='password123', role=User.Role.TEACHER)
        self.assertEqual(user.role, User.Role.TEACHER)

    def test_create_user_with_admin_role(self):
        user = User.objects.create_user(username='admin1', password='password123', role=User.Role.ADMIN)
        self.assertEqual(user.role, User.Role.ADMIN)

    def test_create_superuser(self):
        user = User.objects.create_superuser(username='superadmin', password='password123', email='admin@test.com')
        self.assertTrue(user.is_superuser)
        self.assertTrue(user.is_staff)
        # Note: In Django, create_superuser doesn't automatically set our custom 'role' field
        # unless we override the manager. Let's see if it should.
        # Based on models.py, it's just a CharField with a default.
        self.assertEqual(user.role, User.Role.STUDENT) # Default if not specified

    def test_real_name_saves_correctly(self):
        user = User.objects.create_user(username='teacher2', password='password123', real_name='张老师')
        self.assertEqual(user.real_name, '张老师')

    def test_real_name_defaults_to_empty(self):
        user = User.objects.create_user(username='student2', password='password123')
        self.assertEqual(user.real_name, '')


class SubjectModelTest(TestCase):
    def test_create_subject(self):
        subject = Subject.objects.create(name='数学', description='高中数学')
        self.assertEqual(str(subject), '数学')

    def test_name_is_unique(self):
        Subject.objects.create(name='物理', description='高中物理')
        with self.assertRaises(IntegrityError):
            Subject.objects.create(name='物理', description='重复科目')


class ExamModelTest(TestCase):
    def setUp(self):
        self.subject = Subject.objects.create(name='数学', description='高中数学')

    def test_create_exam(self):
        exam = Exam.objects.create(
            subject=self.subject,
            name='期中考试',
            exam_date='2025-06-01',
            total_score=Decimal('100.00'),
        )
        self.assertEqual(exam.subject, self.subject)
        self.assertEqual(exam.total_score, Decimal('100.00'))

    def test_str(self):
        exam = Exam.objects.create(
            subject=self.subject,
            name='期中考试',
            exam_date='2025-06-01',
            total_score=Decimal('100.00'),
        )
        self.assertIn('数学', str(exam))
        self.assertIn('期中考试', str(exam))


class QuestionModelTest(TestCase):
    def setUp(self):
        subject = Subject.objects.create(name='数学', description='高中数学')
        self.exam = Exam.objects.create(
            subject=subject,
            name='期中考试',
            exam_date='2025-06-01',
            total_score=Decimal('100.00'),
        )

    def test_question_type_choices(self):
        question = Question.objects.create(
            exam=self.exam,
            question_number=1,
            question_type=Question.QuestionType.SINGLE_CHOICE,
            content='巴黎是哪个国家的首都？',
            options={'A': '德国', 'B': '法国', 'C': '意大利'},
            correct_answer=['B'],
            max_score=Decimal('5.00'),
        )
        self.assertEqual(question.question_type, 'single_choice')

    def test_options_defaults_to_empty_dict(self):
        question = Question.objects.create(
            exam=self.exam,
            question_number=2,
            question_type=Question.QuestionType.TRUE_FALSE,
            content='地球是圆的。',
            correct_answer=[True],
            max_score=Decimal('2.00'),
        )
        self.assertEqual(question.options, {})

    def test_correct_answer_defaults_to_empty_list(self):
        question = Question.objects.create(
            exam=self.exam,
            question_number=3,
            question_type=Question.QuestionType.FILL_BLANK,
            content='中国的首都是___。',
            max_score=Decimal('3.00'),
        )
        self.assertEqual(question.correct_answer, [])

    def test_unique_together_question_number(self):
        Question.objects.create(
            exam=self.exam,
            question_number=1,
            question_type=Question.QuestionType.SINGLE_CHOICE,
            content='第一题',
            correct_answer=['A'],
            max_score=Decimal('5.00'),
        )
        with self.assertRaises(IntegrityError):
            Question.objects.create(
                exam=self.exam,
                question_number=1,
                question_type=Question.QuestionType.MULTIPLE_CHOICE,
                content='重复题号',
                correct_answer=['A', 'B'],
                max_score=Decimal('5.00'),
            )
