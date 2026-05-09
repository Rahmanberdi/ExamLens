import csv
import io
from datetime import datetime, date

import openpyxl

from .models import Question

TYPE_MAP = {
    'single_choice': Question.QuestionType.SINGLE_CHOICE,
    'single': Question.QuestionType.SINGLE_CHOICE,
    '单选': Question.QuestionType.SINGLE_CHOICE,
    '单选题': Question.QuestionType.SINGLE_CHOICE,
    'multiple_choice': Question.QuestionType.MULTIPLE_CHOICE,
    'multiple': Question.QuestionType.MULTIPLE_CHOICE,
    '多选': Question.QuestionType.MULTIPLE_CHOICE,
    '多选题': Question.QuestionType.MULTIPLE_CHOICE,
    'true_false': Question.QuestionType.TRUE_FALSE,
    'truefalse': Question.QuestionType.TRUE_FALSE,
    't/f': Question.QuestionType.TRUE_FALSE,
    '判断': Question.QuestionType.TRUE_FALSE,
    '判断题': Question.QuestionType.TRUE_FALSE,
    'fill_blank': Question.QuestionType.FILL_BLANK,
    'fill': Question.QuestionType.FILL_BLANK,
    'fillblank': Question.QuestionType.FILL_BLANK,
    '填空': Question.QuestionType.FILL_BLANK,
    '填空题': Question.QuestionType.FILL_BLANK,
}


def _cell_to_str(v):
    if v is None:
        return ''
    if isinstance(v, (datetime, date)):
        return v.strftime('%Y-%m-%d')
    return str(v).strip()


def parse_file(file):
    name = file.name.lower()
    if name.endswith('.csv'):
        content = file.read().decode('utf-8-sig')
        reader = csv.DictReader(io.StringIO(content))
        return [
            {k.strip().lower(): (v or '').strip() for k, v in row.items() if k is not None}
            for row in reader
        ]
    elif name.endswith('.xlsx'):
        wb = openpyxl.load_workbook(file, read_only=True, data_only=True)
        ws = wb.active
        rows = list(ws.iter_rows(values_only=True))
        if not rows:
            return []
        headers = [
            _cell_to_str(h).lower() if h is not None else f'col_{i}'
            for i, h in enumerate(rows[0])
        ]
        result = []
        for row in rows[1:]:
            if all(v is None for v in row):
                continue
            result.append({headers[i]: _cell_to_str(v) for i, v in enumerate(row)})
        return result
    else:
        raise ValueError('Unsupported file type. Upload a .csv or .xlsx file.')


def parse_question_type(raw):
    key = raw.strip().lower().replace(' ', '_').replace('-', '_')
    if key not in TYPE_MAP:
        raise ValueError(
            f'Unknown question_type: "{raw}". '
            'Use single_choice, multiple_choice, true_false, or fill_blank.'
        )
    return TYPE_MAP[key]


def parse_answer_value(raw, question_type):
    raw = raw.strip()
    if question_type == Question.QuestionType.SINGLE_CHOICE:
        if not raw:
            raise ValueError('correct_answer is required for single_choice.')
        return [raw.upper()]
    elif question_type == Question.QuestionType.MULTIPLE_CHOICE:
        parts = [x.strip().upper() for x in raw.replace('|', ',').split(',') if x.strip()]
        if not parts:
            raise ValueError('correct_answer is required for multiple_choice.')
        return sorted(parts)
    elif question_type == Question.QuestionType.TRUE_FALSE:
        lower = raw.lower()
        if lower in ('true', '对', '是', '1', 'yes', 'correct', '正确'):
            return [True]
        elif lower in ('false', '错', '否', '0', 'no', 'incorrect', '错误'):
            return [False]
        else:
            raise ValueError(
                f'Invalid true/false value: "{raw}". Use true/false, 对/错, yes/no, or 1/0.'
            )
    elif question_type == Question.QuestionType.FILL_BLANK:
        if not raw:
            raise ValueError('correct_answer is required for fill_blank.')
        return [raw]
    else:
        raise ValueError(f'Unknown question type: {question_type}')


def parse_date(raw):
    raw = raw.strip()
    for fmt in ('%Y-%m-%d', '%Y/%m/%d', '%d-%m-%Y', '%d/%m/%Y', '%Y.%m.%d'):
        try:
            return datetime.strptime(raw, fmt).date()
        except ValueError:
            continue
    raise ValueError(f'Cannot parse date: "{raw}". Use YYYY-MM-DD format.')
