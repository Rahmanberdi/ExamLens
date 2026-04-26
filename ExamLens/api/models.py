from django.contrib.auth.models import AbstractUser
from django.contrib.postgres.fields import JSONField
from django.db import models

# Create your models here.

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'admin','Admin'
        TEACHER = 'teacher','Teacher'
        STUDENT = 'student','Student'

    role = models.CharField(
        max_length = 10,
        choices = Role.choices,
        default = Role.STUDENT
    )

class Subject(models.Model):
    name = models.CharField(max_length = 100)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
class Exam(models.Model):
    subject = models.ForeignKey(Subject,on_delete=models.CASCADE,related_name='exams')
    name = models.CharField(max_length = 200)
    exam_date = models.DateField()
    total_score = models.DecimalField(max_digits=5,decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f'{self.subject.name} - {self.name} at {self.exam_date}'

class Question(models.Model):
    QUESTION_TYPES_CHOICES = [
        ('single_choice', '单选题'),
        ('multiple_choice', '多选题'),
        ('true_false', '判断题'),
        ('fill_blank', '填空题'),
    ]

    exam = models.ForeignKey(Exam,on_delete=models.CASCADE,related_name='questions')
    question_number = models.PositiveIntegerField()
    question_type = models.CharField(max_length=20,choices=QUESTION_TYPES_CHOICES)
    content = models.TextField()
    options = models.JSONField(
        default=dict,
        blank=True,

    )
    correct_answer = models.JSONField(
        default = list,
    )
    max_score = models.DecimalField(max_digits=5,decimal_places=2)
    class Meta:
        unique_together = ['exam', 'question_number']
        ordering = ('exam','question_number')

    def __str__(self):
        return f'{self.exam} - 第{self.question_number}题'



