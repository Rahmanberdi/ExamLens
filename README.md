# ExamLens — Frontend Build Spec

A handoff doc for **Claude Code** to build the production frontend from the approved design (`ExamLens Dashboard.html`).

---

## 1 · Stack

- **Framework:** React 18 + TypeScript + Vite
- **Routing:** React Router v6
- **State:** TanStack Query (server) + Zustand (UI)
- **HTTP:** Axios (with JWT interceptor)
- **Styling:** CSS variables + CSS Modules (or Tailwind with custom tokens)
- **i18n:** `react-i18next` (EN, ZH, RU)
- **Theming:** `data-theme="light|dark"` on `<html>`; persisted to `localStorage`

---

## 2 · Backend

- Base URL: `http://localhost:8000/api`
- Auth: JWT Bearer (`POST /api/token/`), refresh via `/api/token/refresh/`, blacklist via `/api/token/logout/`
- Token payload contains `user_id`, `role` (`admin`|`teacher`|`student`), `real_name`, `class_number` — read directly, no `/me` endpoint
- See `API_REFERENCE.md` for the full surface

---

## 3 · Design Tokens

Define both light and dark, switched via `[data-theme]` on `<html>`:

```css
:root, [data-theme="light"] {
  --bg: oklch(0.992 0.003 240);
  --ink: oklch(0.18 0.01 240);
  --ink-2: oklch(0.36 0.01 240);
  --ink-3: oklch(0.58 0.01 240);
  --ink-4: oklch(0.74 0.01 240);
  --line: oklch(0.93 0.005 240);
  --line-2: oklch(0.86 0.006 240);
  --ink-bg-active: oklch(0.96 0.005 240);
  --accent: oklch(0.55 0.15 264);
  --wrong: oklch(0.55 0.18 25);
  --wrong-bg: oklch(0.97 0.02 25);
}
[data-theme="dark"] {
  --bg: oklch(0.16 0.005 240);
  --ink: oklch(0.97 0.005 240);
  --ink-2: oklch(0.80 0.008 240);
  --ink-3: oklch(0.60 0.008 240);
  --ink-4: oklch(0.42 0.008 240);
  --line: oklch(0.24 0.006 240);
  --line-2: oklch(0.32 0.008 240);
  --ink-bg-active: oklch(0.22 0.006 240);
  --accent: oklch(0.72 0.14 264);
  --wrong: oklch(0.70 0.16 25);
  --wrong-bg: oklch(0.26 0.06 25);
}
```

**Type:**
- UI: `Inter` 400/500/600 (with `PingFang SC`, `Noto Sans SC` fallback for CJK)
- Mono (IDs, scores, JSON, paths): `JetBrains Mono` 400/500
- Sizes: 11 (eyebrow/badge), 12–13 (body), 14–16 (titles), 22–32 (display)
- All numeric tables use `font-variant-numeric: tabular-nums`

**Aesthetic rules:**
- Hairline 1px borders only — no shadows, no rounded corners (everything is square), no gradients
- Mono font for: IDs, scores, dates, JSON snippets, API paths, usernames, codes
- Status colors are restrained: `--ink` for correct, `--wrong` for incorrect — never green
- Hit targets ≥ 30px; sidebar items 32px tall
- Numbers right-align in tables

---

## 4 · Routes

```
/login                              → LoginPage
/admin                              → AdminOverview
/admin/subjects                     → AdminSubjects
/admin/exams                        → AdminExams
/admin/questions                    → AdminQuestions
/admin/questions/new                → AdminQuestionEditor (create)
/admin/questions/:id/edit           → AdminQuestionEditor (edit)
/admin/answers                      → AdminAnswers
/admin/students                     → AdminStudents
/teacher                            → TeacherWrongQuestions (?keyword=)
/teacher/questions/:id              → opens detail pane in same view
/student                            → StudentExams
/student/exams/:examId              → StudentExamDetail
/student/wrong                      → StudentWrong
```

Role-gate each route via the JWT `role` claim. Redirect to `/login` on 401; refresh token transparently in the axios interceptor.

---

## 5 · Components & Files

```
src/
  api/
    client.ts             # axios + JWT interceptor + refresh queue
    auth.ts               # login/logout/refresh
    admin.ts              # subjects/exams/questions/answers/students
    teacher.ts            # wrong-questions, question-detail
    student.ts            # exams, exam-questions, wrong-questions
  app/
    routes.tsx
    AuthGuard.tsx         # role-based route guard
  features/
    auth/LoginPage.tsx
    admin/
      AdminOverview.tsx
      AdminSubjects.tsx
      AdminExams.tsx
      AdminQuestions.tsx
      AdminQuestionEditor.tsx     # type-aware form (single/multi/T-F/fill)
      AdminAnswers.tsx
      AdminStudents.tsx
    teacher/
      TeacherWrongQuestions.tsx   # split-pane: list + detail
    student/
      StudentExams.tsx
      StudentExamDetail.tsx
      StudentWrong.tsx
  shared/
    Shell.tsx             # sidebar + top bar (consumes role from token)
    ControlsBar.tsx       # language + theme toggle
    Table.tsx             # Th/Td primitives
    FormField.tsx
    TypeBadge.tsx         # qt_short_single|multi|tf|fill
    RoleBadge.tsx
    EndpointFooter.tsx    # bottom strip showing METHOD path
  i18n/
    index.ts
    en.json
    zh.json
    ru.json
  styles/
    tokens.css            # the CSS vars above
    reset.css
  store/
    theme.ts              # light/dark, localStorage
    lang.ts               # en/zh/ru, localStorage
```

---

## 6 · Question-Type Form Logic

`AdminQuestionEditor` swaps the answer/options inputs based on `question_type`:

| Type | options input | correct_answer input |
|---|---|---|
| `single_choice` | A/B/C/D text rows | radio: pick one letter |
| `multiple_choice` | A/B/C/D text rows | checkboxes: pick letters (sort on save) |
| `true_false` | hidden, send `{}` | radio: True / False → `[true]` / `[false]` |
| `fill_blank` | hidden, send `{}` | text input → `["string"]` |

Always send `correct_answer` as a JSON array. Never send `is_correct` or `score_obtained` — backend computes them.

---

## 7 · i18n Keys

Three locales — copy keys from `screens/i18n.jsx` in the design file. Required namespaces:

- **global:** appName, signIn, continue, role_admin, role_teacher, role_student, language, theme, light, dark
- **nav:** overview, subjects, exams, questions, answers, students, wrongQuestions, byExam, byStudent, myExams, wrongAnswers
- **labels:** id, exam, no, type, content, correctAnswer, score, total, name, date, subject, className, realName, status, correct, wrong, yourAnswer, selectedAnswer, submittedAt, maxScore
- **buttons:** create, cancel, save, submit, newSubject, newExam, newStudent, newQuestion, enterAnswer, exportCsv, viewAll, viewDetails, backToAll
- **types:** qt_single_choice, qt_multiple_choice, qt_true_false, qt_fill_blank, plus qt_short_* variants for badges

ZH and RU translations are in the design file's `STRINGS` constant — copy them verbatim.

---

## 8 · Shell / Layout

`Shell` props: `roleKey`, `user`, `classNumber`, `nav[]`, `active`, `headerRight`, `children`.

- Left sidebar 210px: logo, role label, nav (with optional counts), `ControlsBar` (lang + theme), avatar block
- Top bar 52px: breadcrumb (`role / activePage`) + slot for action buttons
- Content area scrolls; sidebar and header stay fixed

`ControlsBar` is a small segmented control: `[EN | 中 | RU]` and `[☀ | ☾]`. Clicking writes to localStorage and to `<html data-theme>` / `i18n.changeLanguage()`.

---

## 9 · Behavior Notes

- **Student detail view never shows `correct_answer`** — the API doesn't return it; do not infer or render it
- **Teacher keyword filter** is a debounced query param (`?keyword=`) on `/api/teacher/wrong-questions/`
- **Score bars** use `width: ${score/total*100}%` against `var(--line)` track filled with `var(--ink)`
- **Empty cells** show `—` in `var(--ink-4)`, never blank
- **Loading state:** skeleton rows of `var(--ink-bg-active)` matching final row height
- **Errors:** inline strip below the toolbar, `var(--wrong)` border, monospace message

---

## 10 · Acceptance

- [ ] All 17 endpoints from `API_REFERENCE.md` are wired
- [ ] Role gate works for each route (admin/teacher/student)
- [ ] Toggling EN/ZH/RU updates every label live
- [ ] Toggling light/dark updates every screen, no hardcoded colors
- [ ] JWT refresh works transparently on 401
- [ ] Question editor sends correct payload shape per type
- [ ] Visual regression matches `ExamLens Dashboard.html` artboards within reason

---

## 11 · Reference Files

- `ExamLens Dashboard.html` — open in browser to see all 13 artboards, switch language and theme to verify
- `screens/*.jsx` — each artboard maps 1:1 to a feature page; lift the JSX structure and styles
- `API_REFERENCE.md` — endpoint contracts, payload shapes, auto-graded fields
