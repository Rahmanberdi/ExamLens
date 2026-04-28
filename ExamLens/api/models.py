from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'admin', 'Admin'
        TEACHER = 'teacher', 'Teacher'
        STUDENT = 'student', 'Student'

    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.STUDENT,
    )
    real_name = models.CharField(max_length=100, blank=True)


class Subject(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Exam(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='exams')
    name = models.CharField(max_length=200)
    exam_date = models.DateField()
    total_score = models.DecimalField(max_digits=5, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.subject.name} - {self.name} at {self.exam_date}'


class Question(models.Model):
    class QuestionType(models.TextChoices):
        SINGLE_CHOICE = 'single_choice', '单选题'
        MULTIPLE_CHOICE = 'multiple_choice', '多选题'
        TRUE_FALSE = 'true_false', '判断题'
        FILL_BLANK = 'fill_blank', '填空题'

    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='questions')
    question_number = models.PositiveIntegerField()
    question_type = models.CharField(max_length=20, choices=QuestionType.choices)
    content = models.TextField()
    options = models.JSONField(default=dict, blank=True)
    correct_answer = models.JSONField(default=list)
    max_score = models.DecimalField(max_digits=5, decimal_places=2)

    class Meta:
        unique_together = [('exam', 'question_number')]
        ordering = ['exam', 'question_number']

    def __str__(self):
        return f'{self.exam} - 第{self.question_number}题'

    def is_answer_correct(self,selected_answer):
        return sorted(str(x) for x in self.correct_answer) == sorted(str(x) for x in selected_answer)

class StudentAnswer(models.Model):
    question = models.ForeignKey(Question,on_delete=models.CASCADE,related_name='answers')
    student = models.ForeignKey(User,on_delete=models.CASCADE,related_name='answers',limit_choices_to={'role':'student'})
    selected_answer = models.JSONField(default=list)
    is_correct = models.BooleanField(default=False)
    score_obtained = models.DecimalField(max_digits=5, decimal_places=2,default=0)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [('question', 'student')]
        indexes = [
            models.Index(fields=['student', 'is_correct']),
            models.Index(fields=['question', 'is_correct']),
        ]

    def save(self, *args, **kwargs):
        self.is_correct = self.question.is_answer_correct(self.selected_answer)
        self.score_obtained = self.question.max_score if self.is_correct else 0
        super().save(*args, **kwargs)
