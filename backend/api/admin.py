from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Subject, Exam, Question, StudentAnswer


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Role Info', {'fields': ('role', 'real_name')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Role Info', {'fields': ('role', 'real_name')}),
    )
    list_display = ('username', 'real_name', 'role', 'email', 'is_active')
    list_filter = ('role', 'is_active')
    search_fields = ('username', 'real_name', 'email')


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'created_at')
    search_fields = ('name',)


class QuestionInline(admin.TabularInline):
    model = Question
    extra = 1
    fields = ('question_number', 'question_type', 'content', 'options', 'correct_answer', 'max_score')


@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = ('name', 'subject', 'exam_date', 'total_score')
    list_filter = ('subject',)
    search_fields = ('name',)
    inlines = [QuestionInline]


class StudentAnswerInline(admin.TabularInline):
    model = StudentAnswer
    extra = 0
    fields = ('student', 'selected_answer', 'is_correct', 'score_obtained', 'submitted_at')
    readonly_fields = ('is_correct', 'score_obtained', 'submitted_at')


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'question_type', 'max_score')
    list_filter = ('question_type', 'exam__subject')
    search_fields = ('content',)
    inlines = [StudentAnswerInline]


@admin.register(StudentAnswer)
class StudentAnswerAdmin(admin.ModelAdmin):
    list_display = ('student', 'question', 'is_correct', 'score_obtained', 'submitted_at')
    list_filter = ('is_correct',)
    search_fields = ('student__real_name', 'student__username')
    readonly_fields = ('is_correct', 'score_obtained', 'submitted_at')
