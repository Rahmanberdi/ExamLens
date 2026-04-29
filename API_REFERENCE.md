# ExamLens — Backend API Reference

Base URL: `http://localhost:8000/api`

---

## User Roles

| Role | Username (demo) | Password | What they can do |
|---|---|---|---|
| **Admin** (管理员) | `admin1` | `admin123` | Create subjects, exams, questions; create student accounts; enter student answers |
| **Teacher** (教师) | `teacher1` | `teacher123` | View all wrong answers across the class; filter by keyword; see per-question student breakdown |
| **Student** (学生) | `student1` / `student2` / `student3` | `student123` | View own exams and scores; view own wrong answers |

---

## Authentication

All endpoints except `/api/token/` require a JWT `Authorization: Bearer <access_token>` header.

The token payload embeds `role`, `real_name`, and `class_number` — the frontend can read these without a `/me` call.

### POST /api/token/
Login. Returns access + refresh tokens.

**Request:**
```json
{ "username": "student1", "password": "student123" }
```

**Response:**
```json
{
    "refresh": "<refresh_token>",
    "access": "<access_token>"
}
```

Decoded access token payload:
```json
{
    "user_id": "3",
    "role": "student",
    "real_name": "张三",
    "class_number": ""
}
```

### POST /api/token/refresh/
Exchange a refresh token for a new access token.

**Request:** `{ "refresh": "<refresh_token>" }`
**Response:** `{ "access": "<new_access_token>" }`

### POST /api/token/logout/
Blacklist the refresh token (logout).

**Request:** `{ "refresh": "<refresh_token>" }`
**Response:** `{}` (204)

---

## Admin Endpoints
All require role = `admin`.

### POST /api/admin/students/
Create a new student (or teacher) account.

**Request:**
```json
{
    "username": "student4",
    "password": "student123",
    "real_name": "赵六",
    "role": "student",
    "class_number": "高三1班"
}
```

### GET /api/admin/subjects/
List all subjects.
```json
[
    { "id": 1, "name": "数学", "description": "高中数学", "created_at": "2026-04-29T06:44:18.986706Z" },
    { "id": 2, "name": "物理", "description": "高中物理", "created_at": "2026-04-29T06:44:18.992398Z" }
]
```

### POST /api/admin/subjects/
Create a subject. Fields: `name` (unique), `description`.

### GET /api/admin/exams/
List all exams. `subject` is the Subject ID (FK).
```json
[
    { "id": 1, "subject": 1, "name": "2025期中考试", "exam_date": "2025-06-01", "total_score": "18.00", "created_at": "2026-04-29T06:44:18.998535Z" },
    { "id": 2, "subject": 2, "name": "2025期中考试", "exam_date": "2025-06-02", "total_score": "18.00", "created_at": "2026-04-29T06:44:19.022089Z" }
]
```

### POST /api/admin/exams/
Create an exam. Fields: `subject` (ID), `name`, `exam_date` (YYYY-MM-DD), `total_score`.

### GET /api/admin/questions/
List all questions. `exam` is the Exam ID (FK).
```json
[
    {
        "id": 1,
        "exam": 1,
        "question_number": 1,
        "question_type": "single_choice",
        "content": "下列哪个是质数？",
        "options": { "A": "1", "B": "2", "C": "4", "D": "9" },
        "correct_answer": ["B"],
        "max_score": "5.00"
    },
    {
        "id": 2,
        "exam": 1,
        "question_number": 2,
        "question_type": "multiple_choice",
        "content": "下列哪些是偶数？",
        "options": { "A": "2", "B": "3", "C": "4", "D": "5" },
        "correct_answer": ["A", "C"],
        "max_score": "5.00"
    },
    {
        "id": 3,
        "exam": 1,
        "question_number": 3,
        "question_type": "true_false",
        "content": "0是自然数。",
        "options": {},
        "correct_answer": [true],
        "max_score": "3.00"
    },
    {
        "id": 4,
        "exam": 1,
        "question_number": 4,
        "question_type": "fill_blank",
        "content": "π的近似值是___（保留两位小数）。",
        "options": {},
        "correct_answer": ["3.14"],
        "max_score": "5.00"
    }
]
```

### POST /api/admin/questions/
Create a question. See field meanings below.

### GET /api/admin/answers/
List all student answers (raw, for admin inspection).
```json
[
    {
        "id": 1,
        "question": 1,
        "student": 3,
        "selected_answer": ["B"],
        "is_correct": true,
        "score_obtained": "5.00",
        "submitted_at": "2026-04-29T06:44:19.051076Z"
    },
    {
        "id": 2,
        "question": 1,
        "student": 4,
        "selected_answer": ["A"],
        "is_correct": false,
        "score_obtained": "0.00",
        "submitted_at": "2026-04-29T06:44:19.057799Z"
    }
]
```

### POST /api/admin/answers/
Enter a student's answer. `is_correct` and `score_obtained` are computed automatically — do not send them.

**Request:**
```json
{
    "question": 1,
    "student": 3,
    "selected_answer": ["B"]
}
```

---

## Teacher Endpoints
All require role = `teacher`.

### GET /api/teacher/wrong-questions/
List all questions that at least one student answered incorrectly. Supports optional `?keyword=` filter on question content.

**GET /api/teacher/wrong-questions/?keyword=偶数**
```json
[
    {
        "id": 2,
        "exam": 1,
        "question_number": 2,
        "question_type": "multiple_choice",
        "content": "下列哪些是偶数？",
        "options": { "A": "2", "B": "3", "C": "4", "D": "5" },
        "correct_answer": ["A", "C"],
        "max_score": "5.00"
    }
]
```

### GET /api/teacher/questions/{id}/
Get a single question with the list of students who answered it incorrectly.

**GET /api/teacher/questions/2/**
```json
{
    "id": 2,
    "exam": 1,
    "question_number": 2,
    "question_type": "multiple_choice",
    "content": "下列哪些是偶数？",
    "options": { "A": "2", "B": "3", "C": "4", "D": "5" },
    "correct_answer": ["A", "C"],
    "max_score": "5.00",
    "wrong_answer_students": [
        { "id": 4, "username": "student2", "real_name": "李四" },
        { "id": 5, "username": "student3", "real_name": "王五" }
    ]
}
```

---

## Student Endpoints
All require role = `student`. Each endpoint is scoped to the requesting student — students only see their own data.

### GET /api/student/exams/
List exams the student has answered, with their total score for each.

```json
[
    {
        "id": 1,
        "subject": 1,
        "subject_name": "数学",
        "name": "2025期中考试",
        "exam_date": "2025-06-01",
        "total_score": "18.00",
        "score_obtained": 13.0
    },
    {
        "id": 2,
        "subject": 2,
        "subject_name": "物理",
        "name": "2025期中考试",
        "exam_date": "2025-06-02",
        "total_score": "18.00",
        "score_obtained": 13.0
    }
]
```

### GET /api/student/exams/{exam_id}/questions/
List the student's answers for all questions in a specific exam. Questions are nested inline. **`correct_answer` is never returned to students.**

```json
[
    {
        "id": 1,
        "question": {
            "id": 1,
            "exam": 1,
            "question_number": 1,
            "question_type": "single_choice",
            "content": "下列哪个是质数？",
            "options": { "A": "1", "B": "2", "C": "4", "D": "9" },
            "max_score": "5.00"
        },
        "selected_answer": ["B"],
        "is_correct": true,
        "score_obtained": "5.00",
        "submitted_at": "2026-04-29T06:44:19.051076Z"
    },
    {
        "id": 10,
        "question": {
            "id": 4,
            "exam": 1,
            "question_number": 4,
            "question_type": "fill_blank",
            "content": "π的近似值是___（保留两位小数）。",
            "options": {},
            "max_score": "5.00"
        },
        "selected_answer": ["3.15"],
        "is_correct": false,
        "score_obtained": "0.00",
        "submitted_at": "2026-04-29T06:44:19.105729Z"
    }
]
```

### GET /api/student/wrong-questions/
List the student's wrong answers across all exams.

```json
[
    {
        "id": 10,
        "question": {
            "id": 4,
            "exam": 1,
            "question_number": 4,
            "question_type": "fill_blank",
            "content": "π的近似值是___（保留两位小数）。",
            "options": {},
            "max_score": "5.00"
        },
        "selected_answer": ["3.15"],
        "is_correct": false,
        "score_obtained": "0.00",
        "submitted_at": "2026-04-29T06:44:19.137190Z"
    },
    {
        "id": 16,
        "question": {
            "id": 6,
            "exam": 2,
            "question_number": 2,
            "question_type": "multiple_choice",
            "content": "下列属于矢量的是？",
            "options": { "A": "速度", "B": "质量", "C": "力", "D": "温度" },
            "max_score": "5.00"
        },
        "selected_answer": ["A", "B"],
        "is_correct": false,
        "score_obtained": "0.00",
        "submitted_at": "2026-04-29T06:44:19.137190Z"
    }
]
```

---

## Field Reference

### question_type
| Value | Display | options shape | correct_answer shape |
|---|---|---|---|
| `single_choice` | 单选题 | `{"A": "...", "B": "..."}` | `["B"]` — one letter |
| `multiple_choice` | 多选题 | `{"A": "...", "B": "..."}` | `["A", "C"]` — multiple letters, sorted |
| `true_false` | 判断题 | `{}` (empty) | `[true]` or `[false]` |
| `fill_blank` | 填空题 | `{}` (empty) | `["answer text"]` |

### selected_answer
Same shape as `correct_answer`. Always a JSON list, regardless of question type. Examples:
- Single choice: `["B"]`
- Multiple choice: `["A", "C"]`
- True/false: `[true]`
- Fill blank: `["3.14"]`

### is_correct
Boolean. Computed automatically on the server when an answer is saved — never set manually. `true` means the student's `selected_answer` matches `correct_answer` (order-insensitive for multi-select).

### score_obtained
Decimal. Either `max_score` (if `is_correct = true`) or `0.00`. Computed automatically.

### score_obtained (on exam)
Float. Sum of the student's `score_obtained` across all questions in that exam.

### total_score (on exam)
Decimal. The maximum possible score for the exam (sum of all question `max_score` values).

---

## Demo Credentials Summary

| Username | Password | Role |
|---|---|---|
| admin1 | admin123 | Admin |
| teacher1 | teacher123 | Teacher |
| student1 | student123 | Student (张三) |
| student2 | student123 | Student (李四) |
| student3 | student123 | Student (王五) |
