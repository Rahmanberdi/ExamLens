import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../../api/admin';
import { Shell } from '../../shared/Shell';
import { Th, Td, EmptyRow, SkeletonRows } from '../../shared/Table';
import { FormField } from '../../shared/FormField';
import { inputStyle, selectStyle } from '../../shared/styles';
import { EndpointFooter } from '../../shared/EndpointFooter';
import { getPayload } from '../../api/auth';
import { useAdminNav } from './adminNav';

export function AdminAnswers() {
  const { t } = useTranslation();
  const user = getPayload()!;
  const nav = useAdminNav();
  const qc = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [questionId, setQuestionId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [answerInput, setAnswerInput] = useState('');
  const [formError, setFormError] = useState('');

  const { data: answers, isLoading } = useQuery({ queryKey: ['answers'], queryFn: adminApi.getAnswers });
  const { data: questions } = useQuery({ queryKey: ['questions'], queryFn: adminApi.getQuestions });
  const { data: students } = useQuery({ queryKey: ['students'], queryFn: adminApi.getStudents });

  const questionMap = Object.fromEntries((questions ?? []).map((q) => [q.id, `Q${q.question_number}: ${q.content.slice(0, 30)}`]));
  const studentMap = Object.fromEntries((students ?? []).map((s) => [s.id, s.real_name || s.username]));

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
      adminApi.createAnswer({ question: Number(questionId), student: Number(studentId), selected_answer: buildAnswer() }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['answers'] });
      setShowForm(false);
      setQuestionId(''); setStudentId(''); setAnswerInput('');
    },
    onError: () => setFormError('Failed to submit answer'),
  });

  return (
    <Shell
      user={user}
      nav={nav}
      headerRight={
        <button onClick={() => setShowForm(true)} style={{ padding: '5px 12px', border: '1px solid var(--accent)', color: 'var(--accent)', fontSize: 12, cursor: 'pointer' }}>
          + {t('enterAnswer')}
        </button>
      }
    >
      <h1 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>{t('answers')}</h1>

      {showForm && (
        <div style={{ border: '1px solid var(--line)', padding: 16, marginBottom: 20, maxWidth: 480 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <FormField label={t('question')}>
              <select style={selectStyle} value={questionId} onChange={(e) => setQuestionId(e.target.value)}>
                <option value="">—</option>
                {questions?.map((q) => <option key={q.id} value={q.id}>{questionMap[q.id]}</option>)}
              </select>
            </FormField>
            <FormField label={t('student')}>
              <select style={selectStyle} value={studentId} onChange={(e) => setStudentId(e.target.value)}>
                <option value="">—</option>
                {students?.map((s) => <option key={s.id} value={s.id}>{s.real_name || s.username}</option>)}
              </select>
            </FormField>
            <FormField label={t('selectedAnswer')} error={selectedQuestion?.question_type === 'multiple_choice' ? 'Comma-separated, e.g. A,C' : selectedQuestion?.question_type === 'true_false' ? 'true or false' : undefined}>
              <input style={inputStyle} value={answerInput} onChange={(e) => setAnswerInput(e.target.value)} placeholder={selectedQuestion?.question_type === 'true_false' ? 'true / false' : ''} />
            </FormField>
            {formError && <span style={{ fontSize: 12, color: 'var(--wrong)' }}>{formError}</span>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => mutation.mutate()} disabled={mutation.isPending} style={{ padding: '5px 12px', background: 'var(--accent)', color: '#fff', border: 'none', fontSize: 12, cursor: 'pointer' }}>
                {t('submit')}
              </button>
              <button onClick={() => setShowForm(false)} style={{ padding: '5px 12px', border: '1px solid var(--line-2)', fontSize: 12, cursor: 'pointer', color: 'var(--ink-2)' }}>
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      <table>
        <thead>
          <tr>
            <Th>ID</Th>
            <Th>{t('question')}</Th>
            <Th>{t('student')}</Th>
            <Th>{t('selectedAnswer')}</Th>
            <Th>{t('status')}</Th>
            <Th right>{t('scoreObtained')}</Th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? <SkeletonRows cols={6} /> : !answers?.length ? <EmptyRow cols={6} label={t('noData')} /> : (
            answers.map((a) => (
              <tr key={a.id}>
                <Td mono>{a.id}</Td>
                <Td>{questionMap[a.question] ?? a.question}</Td>
                <Td>{studentMap[a.student] ?? a.student}</Td>
                <Td mono>{JSON.stringify(a.selected_answer)}</Td>
                <Td>
                  <span style={{ color: a.is_correct ? 'var(--ink)' : 'var(--wrong)', fontSize: 12 }}>
                    {a.is_correct ? t('correct') : t('wrong')}
                  </span>
                </Td>
                <Td right mono>{a.score_obtained}</Td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <EndpointFooter method="GET" path="/api/admin/answers/" />
    </Shell>
  );
}
