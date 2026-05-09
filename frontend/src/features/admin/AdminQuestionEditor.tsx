import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { adminApi, type Question, type Exam, type Subject } from '../../api/admin';
import { Shell } from '../../shared/Shell';
import { FormField } from '../../shared/FormField';
import { inputStyle, selectStyle, btnPrimary, btnGhost } from '../../shared/styles';
import { getPayload } from '../../api/auth';
import { useAdminNav } from './adminNav';

const mono = "'JetBrains Mono', monospace";

type QType = Question['question_type'];

const OPTION_KEYS = ['A', 'B', 'C', 'D'];

const Q_TYPES: { value: QType; labelKey: string }[] = [
  { value: 'single_choice', labelKey: 'qt_single_choice' },
  { value: 'multiple_choice', labelKey: 'qt_multiple_choice' },
  { value: 'true_false', labelKey: 'qt_true_false' },
  { value: 'fill_blank', labelKey: 'qt_fill_blank' },
];

interface QuestionFormProps {
  existing?: Question;
  exams?: Exam[];
  subjects?: Subject[];
  onSave: (payload: Omit<Question, 'id'>) => void;
  isPending: boolean;
  error: string;
}

function QuestionForm({ existing, exams, subjects, onSave, isPending, error }: QuestionFormProps) {
  const { t } = useTranslation();

  const [examId, setExamId] = useState(existing ? String(existing.exam) : '');
  const [qNumber, setQNumber] = useState(existing ? String(existing.question_number) : '');
  const [qType, setQType] = useState<QType>(existing ? existing.question_type : 'single_choice');
  const [content, setContent] = useState(existing ? existing.content : '');
  const [options, setOptions] = useState<Record<string, string>>(
    existing?.options && Object.keys(existing.options).length > 0
      ? (existing.options as Record<string, string>)
      : { A: '', B: '', C: '', D: '' }
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

  const subjectMap = Object.fromEntries((subjects ?? []).map((s) => [s.id, s.name]));

  const computedCorrect: (string | boolean)[] =
    qType === 'single_choice' ? [singleAnswer]
    : qType === 'multiple_choice' ? [...multiAnswers].sort()
    : qType === 'true_false' ? [tfAnswer]
    : [fillAnswer];

  const computedOptions = (qType === 'single_choice' || qType === 'multiple_choice') ? options : {};

  const handleSave = () => {
    onSave({
      exam: Number(examId),
      question_number: Number(qNumber),
      question_type: qType,
      content,
      options: computedOptions,
      correct_answer: computedCorrect,
      max_score: maxScore,
    });
  };

  const showOptions = qType === 'single_choice' || qType === 'multiple_choice';

  return (
    <>
      {/* Exam + Q number */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <FormField label={t('exam')}>
          <select style={selectStyle} value={examId} onChange={(e) => setExamId(e.target.value)}>
            <option value="">—</option>
            {exams?.map((e) => (
              <option key={e.id} value={e.id}>
                {e.id} — {subjectMap[e.subject] ?? `S${e.subject}`} · {e.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label={t('no')}>
          <input
            type="number"
            style={{ ...inputStyle, fontFamily: mono }}
            value={qNumber}
            onChange={(e) => setQNumber(e.target.value)}
          />
        </FormField>
      </div>

      {/* Type picker */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          {t('questionType')}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', border: '1px solid var(--line-2)' }}>
          {Q_TYPES.map(({ value, labelKey }, i) => {
            const active = qType === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setQType(value)}
                style={{
                  padding: '9px 0',
                  textAlign: 'center',
                  fontSize: 12,
                  background: active ? 'var(--ink)' : 'transparent',
                  color: active ? 'var(--bg)' : 'var(--ink-2)',
                  borderLeft: i ? '1px solid var(--line-2)' : 'none',
                  cursor: 'pointer',
                  fontWeight: active ? 500 : 400,
                  fontFamily: 'inherit',
                }}
              >
                {t(labelKey)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ marginBottom: 20 }}>
        <FormField label={t('questionContent')}>
          <textarea
            style={{ ...inputStyle, height: 'auto', minHeight: 60, resize: 'vertical', whiteSpace: 'pre-wrap' }}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </FormField>
      </div>

      {/* Options */}
      {showOptions && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            {t('options')}
          </div>
          <div style={{ borderTop: '1px solid var(--line)' }}>
            {OPTION_KEYS.map((key) => {
              const isCorrect = qType === 'single_choice'
                ? singleAnswer === key
                : multiAnswers.includes(key);
              return (
                <div key={key} style={{
                  padding: '10px 0',
                  borderBottom: '1px solid var(--line)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (qType === 'single_choice') {
                        setSingleAnswer(key);
                      } else {
                        setMultiAnswers((prev) =>
                          prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]
                        );
                      }
                    }}
                    style={{
                      width: 22,
                      height: 22,
                      border: '1px solid',
                      borderColor: isCorrect ? 'var(--ink)' : 'var(--line-2)',
                      background: isCorrect ? 'var(--ink)' : 'transparent',
                      color: isCorrect ? 'var(--bg)' : 'var(--ink-2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: mono,
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    {key}
                  </button>
                  <input
                    style={{
                      flex: 1,
                      height: 32,
                      border: '1px solid var(--line-2)',
                      padding: '0 10px',
                      fontSize: 13,
                      fontFamily: mono,
                      background: 'var(--bg)',
                      color: 'var(--ink)',
                    }}
                    value={options[key] ?? ''}
                    placeholder={t(`option${key}` as 'optionA' | 'optionB' | 'optionC' | 'optionD')}
                    onChange={(e) => setOptions((o) => ({ ...o, [key]: e.target.value }))}
                  />
                  <span style={{
                    minWidth: 60,
                    fontSize: 11,
                    color: 'var(--ink-3)',
                    fontFamily: mono,
                  }}>
                    {isCorrect ? `✓ ${t('correct').toLowerCase()}` : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* True/False */}
      {qType === 'true_false' && (
        <div style={{ marginBottom: 20 }}>
          <FormField label={t('correctAnswer')}>
            <div style={{ display: 'flex', border: '1px solid var(--line-2)' }}>
              {[true, false].map((v) => {
                const active = tfAnswer === v;
                return (
                  <button
                    key={String(v)}
                    type="button"
                    onClick={() => setTfAnswer(v)}
                    style={{
                      flex: 1,
                      padding: '7px 0',
                      textAlign: 'center',
                      fontSize: 12,
                      border: 'none',
                      cursor: 'pointer',
                      background: active ? 'var(--ink)' : 'transparent',
                      color: active ? 'var(--bg)' : 'var(--ink-2)',
                      fontFamily: 'inherit',
                    }}
                  >
                    {v ? t('true_') : t('false_')}
                  </button>
                );
              })}
            </div>
          </FormField>
        </div>
      )}

      {/* Fill blank */}
      {qType === 'fill_blank' && (
        <div style={{ marginBottom: 20 }}>
          <FormField label={t('correctAnswer')} hint={t('answerHelp')}>
            <input
              style={{ ...inputStyle, fontFamily: mono }}
              value={fillAnswer}
              onChange={(e) => setFillAnswer(e.target.value)}
            />
          </FormField>
        </div>
      )}

      {/* Computed correct + max score */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <FormField label={t('correctAnswer')} hint={t('answerHelp')}>
          <div style={{
            height: 32,
            border: '1px solid var(--line-2)',
            padding: '7px 10px',
            fontSize: 13,
            fontFamily: mono,
            color: 'var(--ink-2)',
            background: 'var(--ink-bg-active)',
            display: 'flex',
            alignItems: 'center',
          }}>
            {JSON.stringify(computedCorrect)}
          </div>
        </FormField>
        <FormField label={t('maxScore')}>
          <input
            type="number"
            step="0.5"
            style={{ ...inputStyle, fontFamily: mono }}
            value={maxScore}
            onChange={(e) => setMaxScore(e.target.value)}
          />
        </FormField>
      </div>

      {/* JSON preview */}
      <pre style={{
        margin: 0,
        padding: 14,
        border: '1px dashed var(--line-2)',
        fontSize: 12,
        color: 'var(--ink-3)',
        fontFamily: mono,
        lineHeight: 1.6,
        whiteSpace: 'pre-wrap',
      }}>
{JSON.stringify({
  exam: examId ? Number(examId) : null,
  question_number: qNumber ? Number(qNumber) : null,
  question_type: qType,
  content,
  options: computedOptions,
  correct_answer: computedCorrect,
  max_score: maxScore,
}, null, 2)}
      </pre>

      {error && (
        <div style={{
          marginTop: 12,
          fontSize: 12,
          color: 'var(--wrong)',
          border: '1px solid var(--wrong)',
          padding: '6px 10px',
          fontFamily: mono,
        }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={handleSave} disabled={isPending} style={btnPrimary}>
          {t('save')}
        </button>
      </div>
    </>
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
  const { data: subjects } = useQuery({ queryKey: ['subjects'], queryFn: adminApi.getSubjects });
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

  return (
    <Shell
      user={user}
      nav={nav}
      headerRight={
        <>
          <button onClick={() => navigate('/admin/questions')} style={btnGhost}>
            {t('cancel')}
          </button>
        </>
      }
    >
      <div style={{ height: '100%', overflow: 'auto', padding: '24px 32px' }}>
        <div style={{ maxWidth: 760 }}>
          {/* Title */}
          <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 28 }}>
            {isEdit ? t('edit') : t('newQuestion')}
          </div>

          {isEdit && isLoading ? (
            <div style={{ color: 'var(--ink-4)', fontSize: 13 }}>{t('loading')}</div>
          ) : (
            <QuestionForm
              key={existing?.id ?? 'new'}
              existing={existing}
              exams={exams}
              subjects={subjects}
              onSave={(p) => mutation.mutate(p)}
              isPending={mutation.isPending}
              error={error}
            />
          )}
        </div>
      </div>
    </Shell>
  );
}
