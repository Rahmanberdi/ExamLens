# CLAUDE.md

This file gives AI assistants (Claude Code, etc.) the context needed to understand and review this project.

---

## Project Overview

**智能错题管理系统** — an AI-powered test/quiz management system with a wrong-answer (错题) tracking focus. Built as a 2-day technical assessment submission.

The system has three user roles:
- **Admin (管理员)** — creates subjects, exams, questions; manages student accounts; enters student answers
- **Teacher (教师)** — views all wrong answers across the cohort, filters by keyword, sees per-question student breakdowns
- **Student (学生)** — views own exams, scores, and wrong answers

The system is **test-based**: questions are structured (single-choice, multiple-choice, true/false, optional fill-in-blank), with predefined options and machine-gradable correct answers. Grading is automatic — when a student's answer is saved, it's compared to the correct answer and `is_correct` + `score_obtained` are set automatically.

---

## Tech Stack

- **Backend:** Django 5 + Django REST Framework
- **Auth:** djangorestframework-simplejwt (JWT access + refresh tokens)
- **Database:** SQLite for development (PostgreSQL-compatible code — uses JSONField)
- **Frontend:** (Vue 3 / React — separate project, REST consumer)
- **No Celery, no Redis, no Docker** in current scope (deferred)
- **No AI/LangGraph** in current scope (deferred — was a bonus point in the original spec)

---

## Project Structure

Single Django app called `core` containing all domain models and views. This is intentional — the project is small enough that splitting into multiple apps would add friction without benefit.

```
backend/
├── config/                    # Django project settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── core/                      # Single app, all domain logic
│   ├── models.py              # User, Subject, Exam, Question, StudentAnswer
│   ├── serializers.py         # DRF serializers
│   ├── views.py               # API views (admin, teacher, student)
│   ├── permissions.py         # IsAdmin, IsTeacher, IsStudent
│   ├── urls.py                # API routes (role-prefixed)
│   ├── admin.py               # Django admin customization
│   └── migrations/
├── manage.py
└── requirements.txt
```

URLs are role-prefixed: `/api/admin/...`, `/api/teacher/...`, `/api/student/...`. Each prefix is gated by the matching permission class. This makes RBAC violations structurally impossible rather than relying on per-query filters.

---

## Data Model

Five models. Relationships:

```
User (custom, with role field)
  └─ StudentAnswer (when role='student')

Subject ──< Exam ──< Question ──< StudentAnswer >── User (student)
```

### User
Custom user model extending `AbstractUser`. Adds:
- `role`: CharField with choices ('admin', 'teacher', 'student') — uses `TextChoices`
- `real_name`: CharField, the student/teacher's real name (shown in teacher's wrong-answer student list)

`AUTH_USER_MODEL = 'core.User'` is set in settings. **Must not be changed after first migration.**

### Subject (科目)
- `name` (unique), `description`, `created_at`
- E.g. "数学", "物理"

### Exam (考试)
- FK to Subject (CASCADE)
- `name`, `exam_date`, `total_score`
- E.g. "2025期中考试"

### Question (题目)
The structured test question. Fields:
- FK to Exam (CASCADE, related_name='questions')
- `question_number`: PositiveIntegerField, unique within an exam
- `question_type`: CharField with TextChoices — `single_choice` / `multiple_choice` / `true_false` / `fill_blank`
- `content`: TextField (the question prompt)
- `options`: JSONField, default=dict — for choice questions: `{"A": "Paris", "B": "London", ...}`. Empty `{}` for true/false and fill_blank.
- `correct_answer`: JSONField, default=list — **always a list**, regardless of type:
  - single_choice: `["B"]`
  - multiple_choice: `["A", "C"]` (sorted)
  - true_false: `[true]` or `[false]`
  - fill_blank: `["北京"]`
- `max_score`: DecimalField(5, 2)

Meta: `unique_together = [('exam', 'question_number')]`, `ordering = ['exam', 'question_number']`.

Has a method `is_answer_correct(selected_answer)` that compares sorted lists.

### StudentAnswer (学生答题)
- FK to Question (CASCADE, related_name='answers')
- FK to User (CASCADE, related_name='answers', `limit_choices_to={'role': 'student'}`)
- `selected_answer`: JSONField — same shape as `Question.correct_answer`
- `is_correct`: BooleanField — **computed in `save()`** via `question.is_answer_correct(selected_answer)`
- `score_obtained`: DecimalField — **computed in `save()`**: `max_score if is_correct else 0`
- `submitted_at`: DateTimeField, auto_now_add

Meta:
- `unique_together = [('question', 'student')]` — one answer per student per question
- Indexes: `(student, is_correct)` and `(question, is_correct)` — power the wrong-answer queries

---

## Key Design Decisions

### 1. Uniform list shape for answers
Both `Question.correct_answer` and `StudentAnswer.selected_answer` are **always JSON lists**, even for single-answer types. This unifies grading into one function: sort both lists, compare equality. No per-type switch logic.

### 2. Options as dict, not list
`Question.options` is `{"A": "...", "B": "..."}` rather than `["...", "..."]`. Selected answers reference labels (`"A"`), not positions. Reordering options never changes what `"A"` means.

### 3. JSONField over normalized Option/Answer tables
Options and correct answers are read/written as a unit, never queried into. A separate `Option` table would add joins and models for zero benefit. JSON is correct for "structured data treated as a single value."

### 4. Auto-grading on save
`StudentAnswer.save()` overrides set `is_correct` and `score_obtained` automatically by calling `question.is_answer_correct()`. The admin/student never enters scores manually — they enter the student's *selection*, and grading is derived.

### 5. Single Django app
Multi-app architecture rejected as over-engineering for this size. All domain models live in `core/models.py`.

### 6. Role-prefixed URLs + permission classes
RBAC enforced at the URL/view level via three permission classes (`IsAdmin`, `IsTeacher`, `IsStudent`). Cleaner than filtering shared endpoints by role.

### 7. JWT token includes role
The access token payload embeds `role` and `real_name` so the frontend can route to the correct portal without an extra `/me` call. Customized via a `TokenObtainPairSerializer` subclass.

### 8. No Enrollment table
Whether a student "took" an exam is derived from the existence of StudentAnswer rows. No separate enrollment model.

### 9. `default=dict` and `default=list` (not `{}` or `[]`)
Mutable default values must be passed as callables, not literals, to avoid shared-state bugs.

---

## What Is Deliberately Out of Scope

These were in the original spec but cut due to time. They are **not** failures or oversights — they are deliberate scoping decisions:

- ❌ AI Agent (LangGraph) for auto-tagging question types and knowledge points
- ❌ Bulk Excel import (questions and scores)
- ❌ Error-rate slider filtering on teacher view (keep simple keyword filter only)
- ❌ Knowledge point filters and statistics charts
- ❌ Knowledge-point heatmap
- ❌ Docker deployment / docker-compose
- ❌ Celery + Redis async task queue
- ❌ Knowledge-point and difficulty fields on Question model
- ❌ Statistics/analytics page
- ❌ Soft-delete, audit logs, history tracking

If asked to add any of these, surface that they were deliberately scoped out and ask whether the scope is changing before adding them.

---

## API Endpoints (planned)

```
POST   /api/auth/login                    → JWT access + refresh + role
POST   /api/auth/refresh

# Admin
POST   /api/admin/subjects/
GET    /api/admin/subjects/
POST   /api/admin/exams/
GET    /api/admin/exams/
POST   /api/admin/questions/
GET    /api/admin/questions/
POST   /api/admin/students/               (create student accounts)
POST   /api/admin/answers/                (enter student selections)

# Teacher
GET    /api/teacher/wrong-questions/?keyword=...
GET    /api/teacher/questions/{id}/        (with student-list of who got it wrong)

# Student
GET    /api/student/exams/                 (own exams + total scores)
GET    /api/student/exams/{id}/questions/  (own answers per exam)
GET    /api/student/wrong-questions/       (own wrong answers)
```

The Django admin (at `/admin-django/` to avoid the `/api/admin/` clash) is also used for fast data seeding and as a backup admin UI.

---

## Code Style and Conventions

- **Chinese comments are okay** for domain terms (题号, 题干, 答题), since the domain itself is Chinese-language.
- **TextChoices** for any enumerated field, with the constants on the model class (e.g. `Question.QuestionType.SINGLE_CHOICE`).
- **String references for FKs** (`'core.Exam'`) rather than imported classes — avoids circular import issues.
- **`related_name`** explicitly set on every FK for readable reverse access.
- **`on_delete=CASCADE`** for ownership relationships (Question → Exam, StudentAnswer → Question).
- **`limit_choices_to`** on FKs that should only point to a specific role (e.g. StudentAnswer.student → User where role='student').
- **Decimal** for all monetary/score fields, never Float.
- **`save()` overrides** are used for derived fields (`is_correct`, `score_obtained` on StudentAnswer). Always call `super().save(*args, **kwargs)` after setting derived fields.

---

## When Reviewing My Code

When I ask you to check my code, please:

1. **Verify alignment with the design decisions above.** If something deviates, point it out and ask if it's intentional.
2. **Check that `is_correct` and `score_obtained` are not being set manually anywhere outside `StudentAnswer.save()`** — they're derived fields.
3. **Check that JSONField defaults are callables (`dict`, `list`), not literals (`{}`, `[]`).**
4. **Check that mutable answer/option data is being treated correctly** — comparison should always sort first; storage of multi-select answers should be sorted.
5. **Flag any N+1 query risks**, especially on the teacher's wrong-question list endpoint (use `select_related('exam__subject')` and `prefetch_related('answers__student')` where needed).
6. **Verify RBAC is applied via permission classes**, not by query-time filtering alone.
7. **Don't suggest re-adding scoped-out features** (AI, Docker, bulk import, etc.) unless I explicitly ask. If you think one is genuinely needed, say so once and move on.
8. **Don't refactor into multiple Django apps.** Single-app structure is intentional.
9. **Be honest, not deferential.** If a design choice in the code is wrong, say so directly and explain why. Don't hedge.
10. **Suggest improvements only when they're real improvements** — not stylistic preferences. Working code under deadline beats elegant code that breaks.

---

## Current Phase

(Update this section as the project progresses.)

- [x] Models defined (User, Subject, Exam, Question, StudentAnswer)
- [ ] Migrations run
- [ ] Django admin customization
- [ ] JWT auth + custom token serializer
- [ ] Permission classes
- [ ] Admin API endpoints
- [ ] Teacher API endpoints
- [ ] Student API endpoints
- [ ] Frontend auth flow
- [ ] Frontend admin pages (or use Django admin)
- [ ] Frontend teacher portal
- [ ] Frontend student portal
- [ ] Seed demo data
- [ ] Record demo video
