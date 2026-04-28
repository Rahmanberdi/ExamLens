from .models import User, Subject, Exam, Question,StudentAnswer
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'real_name', 'role', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ('id', 'name', 'description', 'created_at')
        read_only_fields = ('created_at',)

class ExamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exam
        fields = ('id', 'subject', 'name', 'exam_date', 'total_score', 'created_at')
        read_only_fields = ('created_at',)

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ('id', 'exam', 'question_number', 'question_type', 'content', 'options', 'correct_answer', 'max_score')

class StudentAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentAnswer
        fields = ('id', 'question', 'student', 'selected_answer', 'is_correct', 'score_obtained', 'submitted_at')
        read_only_fields = ('is_correct', 'score_obtained', 'submitted_at')


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['real_name'] = user.real_name
        return token