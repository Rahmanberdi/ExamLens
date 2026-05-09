import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../../api/admin';
import { Shell } from '../../shared/Shell';
import { Th, Td, EmptyRow, SkeletonRows } from '../../shared/Table';
import { FormField } from '../../shared/FormField';
import { inputStyle, selectStyle, btnPrimary, btnGhost } from '../../shared/styles';
import { getPayload } from '../../api/auth';
import { useAdminNav } from './adminNav';

const mono = "'JetBrains Mono', monospace";

function StatusBadge({ correct, label }: { correct: boolean; label: string }) {
  return (
    <span style={{
      fontSize: 11,
      padding: '1px 6px',
      color: correct ? 'var(--ink-2)' : 'var(--wrong)',
      border: '1px solid',
      borderColor: correct ? 'var(--line-2)' : 'var(--wrong)',
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
    }}>
      {label}
    </span>
  );
}

export function AdminAnswers() {
  const { t } = useTranslation();
  const user = getPayload()!;
  const nav = useAdminNav();
  const qc = useQueryClient();

  const [questionId, setQuestionId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [answerInput, setAnswerInput] = useState('');
  const [formError, setFormError] = useState('');

  const { data: answers, isLoading } = useQuery({ queryKey: ['answers'], queryFn: adminApi.getAnswers });
  const { data: questions } = useQuery({ queryKey: ['questions'], queryFn: adminApi.getQuestions });
  const { data: students } = useQuery({ queryKey: ['students'], queryFn: adminApi.getStudents });

  const questionNumberMap = Object.fromEntries((questions ?? []).map((q) => [q.id, q.question_number]));
  const studentNameMap = Object.fromEntries((students ?? []).map((s) => [s.id, s.real_name || s.username]));

  const selectedQuestion = questions?.find((q) => q.id === Number(questionId));

  const buildAnswer = (): (string | boolean)[] => {
    if (!selectedQuestion) return [answerInput];
    const qt = selectedQuestion.question_type;
    if (qt === 'true_false') return [answerInput === 'true'];
    if (qt === 'multiple_choice') return answerInput.split(',').map((s) => s.trim()).filter(Boolean).sort();
    return [answerInput];
  };

  const mutation = useMutation({
    mutationFn: () =>
      adminApi.createAnswer({
        question: Number(questionId),
        student: Number(studentId),
        selected_answer: buildAnswer(),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['answers'] });
      setQuestionId(''); setStudentId(''); setAnswerInput(''); setFormError('');
    },
    onError: () => setFormError('Failed to submit answer'),
  });

  return (
    <Shell user={user} nav={nav}>
      <div style={{ height: '100%', display: 'grid', gridTemplateColumns: '1fr 380px' }}>
        {/* Left pane */}
        <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--line)', minWidth: 0 }}>
          <div style={{ flex: 1, overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <Th w={44}>{t('id')}</Th>
                  <Th w={40}>Q</Th>
                  <Th>{t('student')}</Th>
                  <Th w={140}>{t('selectedAnswer')}</Th>
                  <Th w={90}>{t('status')}</Th>
                  <Th w={70} align="right">{t('score')}</Th>
                  <Th w={90} align="right">{t('submittedAt')}</Th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <SkeletonRows cols={7} />
                ) : !answers?.length ? (
                  <EmptyRow cols={7} label={t('noData')} />
                ) : (
                  answers.map((a) => (
                    <tr key={a.id} style={{ borderBottom: '1px solid var(--line)' }}>
                      <Td mono>#{a.id}</Td>
                      <Td mono>{questionNumberMap[a.question] ?? a.question}</Td>
                      <Td>
                        <span style={{ fontFamily: mono, fontSize: 11, color: 'var(--ink-3)' }}>{a.student}</span>
                        {' '}{studentNameMap[a.student] ?? ''}
                      </Td>
                      <Td mono>{JSON.stringify(a.selected_answer)}</Td>
                      <Td>
                        <StatusBadge correct={a.is_correct} label={a.is_correct ? t('correct') : t('wrong')} />
                      </Td>
                      <Td mono align="right">{a.score_obtained}</Td>
                      <Td mono align="right">{a.submitted_at.slice(11, 19)}</Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right pane — enter answer form */}
        <aside style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)' }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{t('enterAnswer')}</div>
          </div>
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, flex: 1, overflow: 'auto' }}>
            <FormField label={t('selectQuestion')}>
              <select style={selectStyle} value={questionId} onChange={(e) => setQuestionId(e.target.value)}>
                <option value="">—</option>
                {questions?.map((q) => (
                  <option key={q.id} value={q.id}>{q.id} — {q.content.slice(0, 40)}</option>
                ))}
              </select>
            </FormField>
            <FormField label={t('selectStudent')}>
              <select style={selectStyle} value={studentId} onChange={(e) => setStudentId(e.target.value)}>
                <option value="">—</option>
                {students?.map((s) => (
                  <option key={s.id} value={s.id}>{s.id} — {s.real_name || s.username}</option>
                ))}
              </select>
            </FormField>
            <FormField label={t('selectedAnswer')} hint={t('answerHelp')}>
              <input
                style={{ ...inputStyle, fontFamily: mono }}
                value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value)}
                placeholder={
                  selectedQuestion?.question_type === 'true_false' ? 'true / false' :
                  selectedQuestion?.question_type === 'multiple_choice' ? 'A,C' : ''
                }
              />
            </FormField>
            <div style={{
              padding: 12,
              border: '1px dashed var(--line-2)',
              fontSize: 11,
              color: 'var(--ink-3)',
              fontFamily: mono,
              lineHeight: 1.5,
            }}>
              {t('autoGraded')}
            </div>
            {formError && <span style={{ fontSize: 12, color: 'var(--wrong)' }}>{formError}</span>}

            <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
              <button
                onClick={() => { setQuestionId(''); setStudentId(''); setAnswerInput(''); setFormError(''); }}
                style={{ ...btnGhost, flex: 1 }}
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending}
                style={{ ...btnPrimary, flex: 1 }}
              >
                {t('submit')}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </Shell>
  );
}
