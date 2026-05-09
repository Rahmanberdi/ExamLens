from collections import defaultdict

from django.conf import settings
from django.db.models import Count, Q
from openai import OpenAI


def _client():
    return OpenAI(api_key=settings.DEEPSEEK_API_KEY, base_url='https://api.deepseek.com')


def generate_knowledge_points_all_langs(content: str, question_type: str) -> dict:
    """Generate a 1-4 word knowledge point in EN/ZH/RU in one API call. Returns dict or {}."""
    import json as _json
    if not settings.DEEPSEEK_API_KEY or not content:
        return {}
    try:
        resp = _client().chat.completions.create(
            model='deepseek-chat',
            max_tokens=128,
            response_format={'type': 'json_object'},
            messages=[{
                'role': 'user',
                'content': (
                    'Identify the knowledge point or topic of this exam question in 1-4 words. '
                    'Return a JSON object with exactly three keys: '
                    '"en" (English), "zh" (Chinese Simplified), "ru" (Russian). '
                    'No explanation, no markdown — only the JSON.\n\n' + content
                ),
            }],
        )
        result = _json.loads(resp.choices[0].message.content)
        return {k: str(v).strip()[:100] for k, v in result.items() if k in ('en', 'zh', 'ru')}
    except Exception:
        return {}


LANG_INSTRUCTION = {
    'en': 'Write your response in English.',
    'zh': '请用中文回答。',
    'ru': 'Напишите ответ на русском языке.',
}


def generate_exam_summary(exam, questions_with_counts, lang: str = 'en') -> str:
    """
    Brief AI summary of student performance for an exam.
    questions_with_counts: Question objects annotated with wrong_count and total_count.
    """
    if not settings.DEEPSEEK_API_KEY:
        return ''

    kp_stats: dict = defaultdict(lambda: {'wrong': 0, 'total': 0})
    for q in questions_with_counts:
        kp_dict = q.knowledge_point or {}
        kp = kp_dict.get(lang) or kp_dict.get('zh') or kp_dict.get('en') or 'General'
        kp_stats[kp]['wrong'] += q.wrong_count
        kp_stats[kp]['total'] += q.total_count

    total_answers = sum(v['total'] for v in kp_stats.values())
    if total_answers == 0:
        return 'No student answers recorded for this exam yet.'

    sorted_kps = sorted(
        kp_stats.items(),
        key=lambda x: -(x[1]['wrong'] / max(x[1]['total'], 1)),
    )
    breakdown = '\n'.join(
        f'- {kp}: {s["wrong"]}/{s["total"]} wrong ({round(s["wrong"]/max(s["total"],1)*100)}%)'
        for kp, s in sorted_kps
        if s['total'] > 0
    )

    lang_instr = LANG_INSTRUCTION.get(lang, LANG_INSTRUCTION['en'])
    prompt = (
        f'Exam: "{exam.name}" | Subject: {exam.subject.name} | Date: {exam.exam_date}\n'
        f'Total questions: {len(questions_with_counts)}\n\n'
        f'Student error rates by knowledge point:\n{breakdown}\n\n'
        f'{lang_instr} '
        'Write 2-3 plain sentences for the teacher. '
        'Translate all topic names into the response language — do not leave any foreign-language words. '
        'Name the weakest topics and give one practical suggestion. '
        'No headers, no bullet points, no markdown, no formatting — plain text only.'
    )

    try:
        resp = _client().chat.completions.create(
            model='deepseek-chat',
            max_tokens=200,
            messages=[{'role': 'user', 'content': prompt}],
        )
        text = resp.choices[0].message.content.strip()
        # Strip markdown bold/italic markers
        text = text.replace('**', '').replace('__', '').replace('*', '').replace('_', ' ').strip()
        return text
    except Exception as e:
        return f'Summary unavailable: {e}'


def refresh_exam_summary(exam_id: int, lang: str = 'en') -> str:
    """Generate a fresh AI summary for an exam in the given language and persist it."""
    from .models import Exam, Question  # local import to avoid circular

    try:
        exam = Exam.objects.select_related('subject').get(pk=exam_id)
    except Exception:
        return ''

    questions = list(
        Question.objects.filter(exam=exam).annotate(
            wrong_count=Count('answers', filter=Q(answers__is_correct=False), distinct=True),
            total_count=Count('answers', distinct=True),
        )
    )

    summary = generate_exam_summary(exam, questions, lang=lang)
    if summary:
        # Re-fetch the latest value and merge to avoid overwriting other languages
        latest = dict(Exam.objects.values_list('ai_summary', flat=True).get(pk=exam_id) or {})
        latest[lang] = summary
        Exam.objects.filter(pk=exam_id).update(ai_summary=latest)
    return summary


def refresh_exam_summary_all_langs(exam_id: int) -> None:
    """Generate summaries for all languages in one pass and save atomically."""
    from .models import Exam, Question

    try:
        exam = Exam.objects.select_related('subject').get(pk=exam_id)
    except Exception:
        return

    questions = list(
        Question.objects.filter(exam=exam).annotate(
            wrong_count=Count('answers', filter=Q(answers__is_correct=False), distinct=True),
            total_count=Count('answers', distinct=True),
        )
    )

    current = dict(exam.ai_summary or {})
    for lang in LANG_INSTRUCTION:
        summary = generate_exam_summary(exam, questions, lang=lang)
        if summary:
            current[lang] = summary

    Exam.objects.filter(pk=exam_id).update(ai_summary=current)
