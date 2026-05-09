from .models import User, Subject, Exam, Question,StudentAnswer
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.db.models import Sum


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'real_name', 'class_number', 'role', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, data):
        role = data.get('role', getattr(self.instance, 'role', None))
        if role == User.Role.ADMIN and data.get('class_number'):
            raise serializers.ValidationError({'class_number': 'Admins cannot have a class number.'})
        return data

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


class StudentQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ('id', 'exam', 'question_number', 'question_type', 'content', 'options', 'max_score')

class StudentAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentAnswer
        fields = ('id', 'question', 'student', 'selected_answer', 'is_correct', 'score_obtained', 'submitted_at')
        read_only_fields = ('is_correct', 'score_obtained', 'submitted_at')

class TeacherStudentAnswerSerializer(serializers.ModelSerializer):
    """One student's submission for a question, with student fields inlined.

    Used by the teacher detail view so a teacher can see who answered what (correct or wrong).
    """
    student_id = serializers.IntegerField(source='student.id', read_only=True)
    username = serializers.CharField(source='student.username', read_only=True)
    real_name = serializers.CharField(source='student.real_name', read_only=True)
    class_number = serializers.CharField(source='student.class_number', read_only=True)

    class Meta:
        model = StudentAnswer
        fields = ('id', 'student_id', 'username', 'real_name', 'class_number',
                  'selected_answer', 'is_correct', 'score_obtained', 'submitted_at')

class TeacherQuestionSerializer(serializers.ModelSerializer):
    student_answers = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = ('id', 'exam', 'question_number', 'question_type', 'content',
                  'options', 'correct_answer', 'max_score', 'student_answers')

    def get_student_answers(self, obj):
        answers = obj.answers.all().select_related('student').order_by('is_correct', 'submitted_at')
        return TeacherStudentAnswerSerializer(answers, many=True).data


class TeacherQuestionListSerializer(serializers.ModelSerializer):
    """Question summary for the teacher list view, with answer-count annotations."""
    wrong_count = serializers.IntegerField(read_only=True)
    correct_count = serializers.IntegerField(read_only=True)
    total_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Question
        fields = ('id', 'exam', 'question_number', 'question_type', 'content',
                  'options', 'correct_answer', 'max_score',
                  'wrong_count', 'correct_count', 'total_count')

class StudentExamSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    score_obtained = serializers.SerializerMethodField()

    class Meta:
        model = Exam
        fields = ('id', 'subject', 'subject_name', 'name', 'exam_date', 'total_score', 'score_obtained')

    def get_score_obtained(self,obj):
        student = self.context['request'].user
        result = StudentAnswer.objects.filter(student=student, question__exam=obj).aggregate(total=Sum('score_obtained'))
        return result['total'] or 0

class StudentAnswerWithQuestionSerializer(serializers.ModelSerializer):
    question = StudentQuestionSerializer(read_only=True)
    class Meta:
        model = StudentAnswer
        fields = ('id','question','selected_answer','is_correct','score_obtained','submitted_at')




class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['real_name'] = user.real_name
        token['class_number'] = user.class_number
        return token