import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { adminApi, type Question, type Exam } from '../../api/admin';
import { Shell } from '../../shared/Shell';
import { FormField } from '../../shared/FormField';
import { inputStyle, selectStyle } from '../../shared/styles';
import { EndpointFooter } from '../../shared/EndpointFooter';
import { getPayload } from '../../api/auth';
import { useAdminNav } from './adminNav';

type QType = Question['question_type'];

const OPTION_KEYS = ['A', 'B', 'C', 'D'];

interface QuestionFormProps {
  existing?: Question;
  exams?: Exam[];
  onSave: (payload: Omit<Question, 'id'>) => void;
  onCancel: () => void;
  isPending: boolean;
  error: string;
}

function QuestionForm({ existing, exams, onSave, onCancel, isPending, error }: QuestionFormProps) {
  const { t } = useTranslation();
  const [examId, setExamId] = useState(existing ? String(existing.exam) : '');
  const [qNumber, setQNumber] = useState(existing ? String(existing.question_number) : '');
  const [qType, setQType] = useState<QType>(existing ? existing.question_type : 'single_choice');
  const [content, setContent] = useState(existing ? existing.content : '');
  const [options, setOptions] = useState<Record<string, string>>(
    existing?.options ? (existing.options as Record<string, string>) : { A: '', B: '', C: '', D: '' }
  );
  const [singleAnswer, setSingleAnswer] = useState(() => {
    if (existing?.question_type === 'single_choice') return existing.correct_answer[0] as string;
    return 'A';
  });
  const [multiAnswers, setMultiAnswers] = useState<string[]>(() => {
    if (existing?.question_type === 'multiple_choice') return existing.correct_answer as string[];
    return [];
  });
  const [tfAnswer, setTfAnswer] = useState<boolean>(() => {
    if (existing?.question_type === 'true_false') return existing.correct_answer[0] as boolean;
    return true;
  });
  const [fillAnswer, setFillAnswer] = useState(() => {
    if (existing?.question_type === 'fill_blank') return existing.correct_answer[0] as string;
    return '';
  });
  const [maxScore, setMaxScore] = useState(existing ? existing.max_score : '');

  const handleSave = () => {
    let correct_answer: (string | boolean)[];
    let opts: Record<string, string> = {};
    if (qType === 'single_choice') {
      correct_answer = [singleAnswer];
      opts = options;
    } else if (qType === 'multiple_choice') {
      correct_answer = [...multiAnswers].sort();
      opts = options;
    } else if (qType === 'true_false') {
      correct_answer = [tfAnswer];
    } else {
      correct_answer = [fillAnswer];
    }
    onSave({
      exam: Number(examId),
      question_number: Number(qNumber),
      question_type: qType,
      content,
      options: opts,
      correct_answer,
      max_score: maxScore,
    });
  };

  const showOptions = qType === 'single_choice' || qType === 'multiple_choice';

  return (
    <div style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <FormField label={t('exam')}>
          <select style={{ ...selectStyle, minWidth: 180 }} value={examId} onChange={(e) => setExamId(e.target.value)}>
            <option value="">—</option>
            {exams?.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label={t('questionNumber')}>
          <input
            type="number"
            style={{ ...inputStyle, width: 80 }}
            value={qNumber}
            onChange={(e) => setQNumber(e.target.value)}
          />
        </FormField>
      </div>

      <FormField label={t('type')}>
        <select style={selectStyle} value={qType} onChange={(e) => setQType(e.target.value as QType)}>
          <option value="single_choice">{t('qt_single_choice')}</option>
          <option value="multiple_choice">{t('qt_multiple_choice')}</option>
          <option value="true_false">{t('qt_true_false')}</option>
          <option value="fill_blank">{t('qt_fill_blank')}</option>
        </select>
      </FormField>

      <FormField label={t('content')}>
        <textarea
          style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </FormField>

      {showOptions && (
        <div>
          <div
            style={{
              fontSize: 11,
              color: 'var(--ink-3)',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 8,
            }}
          >
            {t('options')}
          </div>
          {OPTION_KEYS.map((key) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span
                style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", width: 16, color: 'var(--ink-3)' }}
              >
                {key}
              </span>
              <input
                style={{ ...inputStyle, flex: 1 }}
                value={options[key] ?? ''}
                onChange={(e) => setOptions((o) => ({ ...o, [key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
      )}

      <FormField label={t('correctAnswer')}>
        {qType === 'single_choice' && (
          <div style={{ display: 'flex', gap: 12 }}>
            {OPTION_KEYS.map((k) => (
              <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                <input type="radio" name="single" checked={singleAnswer === k} onChange={() => setSingleAnswer(k)} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{k}</span>
              </label>
            ))}
          </div>
        )}
        {qType === 'multiple_choice' && (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {OPTION_KEYS.map((k) => (
              <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={multiAnswers.includes(k)}
                  onChange={(e) =>
                    setMultiAnswers((prev) => (e.target.checked ? [...prev, k] : prev.filter((x) => x !== k)))
                  }
                />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{k}</span>
              </label>
            ))}
          </div>
        )}
        {qType === 'true_false' && (
          <div style={{ display: 'flex', gap: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
              <input type="radio" name="tf" checked={tfAnswer === true} onChange={() => setTfAnswer(true)} />
              {t('trueLabel')}
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
              <input type="radio" name="tf" checked={tfAnswer === false} onChange={() => setTfAnswer(false)} />
              {t('falseLabel')}
            </label>
          </div>
        )}
        {qType === 'fill_blank' && (
          <input style={inputStyle} value={fillAnswer} onChange={(e) => setFillAnswer(e.target.value)} />
        )}
      </FormField>

      <FormField label={t('maxScore')}>
        <input
          type="number"
          step="0.5"
          style={{ ...inputStyle, width: 120 }}
          value={maxScore}
          onChange={(e) => setMaxScore(e.target.value)}
        />
      </FormField>

      {error && (
        <div
          style={{
            fontSize: 12,
            color: 'var(--wrong)',
            border: '1px solid var(--wrong)',
            padding: '6px 10px',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={handleSave}
          disabled={isPending}
          style={{ padding: '6px 16px', background: 'var(--accent)', color: '#fff', border: 'none', fontSize: 13, cursor: 'pointer' }}
        >
          {t('save')}
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: '6px 16px',
            border: '1px solid var(--line-2)',
            fontSize: 13,
            cursor: 'pointer',
            color: 'var(--ink-2)',
          }}
        >
          {t('cancel')}
        </button>
      </div>
    </div>
  );
}

export function AdminQuestionEditor() {
  const { t } = useTranslation();
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const qc = useQueryClient();
  const user = getPayload()!;
  const nav = useAdminNav();

  const { data: exams } = useQuery({ queryKey: ['exams'], queryFn: adminApi.getExams });
  const { data: existing, isLoading } = useQuery({
    queryKey: ['question', id],
    queryFn: () => adminApi.getQuestions().then((qs) => qs.find((q) => q.id === Number(id))),
    enabled: isEdit,
  });

  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: (payload: Omit<Question, 'id'>) =>
      isEdit ? adminApi.updateQuestion(Number(id), payload) : adminApi.createQuestion(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['questions'] });
      navigate('/admin/questions');
    },
    onError: () => setError('Failed to save question'),
  });

  if (isEdit && isLoading) return <Shell user={user} nav={nav}>{t('loading')}</Shell>;

  return (
    <Shell user={user} nav={nav}>
      <h1 style={{ fontSize: 16, fontWeight: 600, marginBottom: 24 }}>
        {isEdit ? t('edit') : t('newQuestion')}
      </h1>

      <QuestionForm
        key={existing?.id ?? 'new'}
        existing={existing}
        exams={exams}
        onSave={(p) => mutation.mutate(p)}
        onCancel={() => navigate('/admin/questions')}
        isPending={mutation.isPending}
        error={error}
      />

      <EndpointFooter
        method={isEdit ? 'PUT' : 'POST'}
        path={isEdit ? `/api/admin/questions/${id}/` : '/api/admin/questions/'}
      />
    </Shell>
  );
}
