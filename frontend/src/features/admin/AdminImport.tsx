import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../../api/admin';
import type { ImportResult } from '../../api/admin';
import { Shell } from '../../shared/Shell';
import { getPayload } from '../../api/auth';
import { useAdminNav } from './adminNav';
import { btnPrimary, btnGhost } from '../../shared/styles';

const mono = "'JetBrains Mono', monospace";

const QUESTIONS_TEMPLATE = [
  'subject_name,exam_name,exam_date,question_number,question_type,content,option_a,option_b,option_c,option_d,correct_answer,max_score',
  '数学,期中考试,2025-06-01,1,single_choice,首都是哪里？,北京,上海,广州,深圳,A,5',
  '数学,期中考试,2025-06-01,2,multiple_choice,以下哪些是亚洲国家？,中国,法国,日本,英国,A|C,10',
  '数学,期中考试,2025-06-01,3,true_false,地球围绕太阳转,,,,，true,3',
  '数学,期中考试,2025-06-01,4,fill_blank,中国的首都是____,,,,,北京,5',
].join('\n');

const ANSWERS_TEMPLATE = [
  'student_username,subject_name,exam_name,question_number,selected_answer',
  'zhang_san,数学,期中考试,1,A',
  'zhang_san,数学,期中考试,2,A|C',
  'zhang_san,数学,期中考试,3,true',
  'zhang_san,数学,期中考试,4,北京',
].join('\n');

function downloadCsv(filename: string, content: string) {
  const blob = new Blob(['﻿' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

interface ColDef {
  name: string;
  required: boolean;
  note?: string;
}

interface UploadSectionProps {
  title: string;
  columns: ColDef[];
  templateName: string;
  templateContent: string;
  onUpload: (file: File) => Promise<ImportResult>;
}

function UploadSection({ title, columns, templateName, templateContent, onUpload }: UploadSectionProps) {
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const res = await onUpload(file);
      setResult(res);
      if (fileRef.current) fileRef.current.value = '';
      setFile(null);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      setError(err?.response?.data?.error ?? 'Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>

      <div>
        <div style={{
          fontSize: 10,
          color: 'var(--ink-4)',
          fontFamily: mono,
          marginBottom: 10,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}>
          {t('columnFormat')}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {columns.map((col) => (
            <span key={col.name} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              padding: '3px 8px',
              border: `1px solid ${col.required ? 'var(--ink-3)' : 'var(--line-2)'}`,
              fontFamily: mono,
              fontSize: 11,
              color: col.required ? 'var(--ink)' : 'var(--ink-3)',
            }}>
              {col.name}
              {col.required && <span style={{ color: 'var(--wrong)', lineHeight: 1 }}>*</span>}
              {col.note && (
                <span style={{ color: 'var(--ink-4)', fontSize: 10 }}>({col.note})</span>
              )}
            </span>
          ))}
        </div>
        <div style={{ marginTop: 8, fontSize: 11, color: 'var(--ink-4)', fontFamily: mono }}>
          * {t('required')} &nbsp;|&nbsp; {t('multipleAnswerHint')}
        </div>
      </div>

      <button
        type="button"
        style={{ ...btnGhost, width: 'fit-content', fontFamily: mono, fontSize: 11 }}
        onClick={() => downloadCsv(templateName, templateContent)}
      >
        ↓ {t('downloadTemplate')}
      </button>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.xlsx"
          onChange={handleFile}
          style={{ display: 'none' }}
        />
        <button
          type="button"
          style={{ ...btnGhost, fontFamily: mono, fontSize: 11, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          onClick={() => fileRef.current?.click()}
        >
          {file ? file.name : t('chooseFile')}
        </button>
        <button
          type="button"
          style={{ ...btnPrimary, fontFamily: mono, fontSize: 11, opacity: (!file || loading) ? 0.5 : 1 }}
          onClick={handleSubmit}
          disabled={!file || loading}
        >
          {loading ? t('importing') : t('importBtn')}
        </button>
      </div>

      {error && (
        <div style={{ fontSize: 12, color: 'var(--wrong)', fontFamily: mono, padding: '8px 12px', border: '1px solid var(--wrong)' }}>
          {error}
        </div>
      )}

      {result && (
        <div>
          <div style={{ fontSize: 12, fontFamily: mono, marginBottom: 10, display: 'flex', gap: 16 }}>
            <span style={{ color: 'var(--ink)' }}>
              {t('imported')}: <strong>{result.imported}</strong>
            </span>
            {result.skipped.length > 0 && (
              <span style={{ color: 'var(--wrong)' }}>
                {t('skipped')}: <strong>{result.skipped.length}</strong>
              </span>
            )}
            {result.skipped.length === 0 && (
              <span style={{ color: 'var(--ink-3)' }}>{t('noSkipped')}</span>
            )}
          </div>
          {result.skipped.length > 0 && (
            <div style={{ borderTop: '1px solid var(--line)' }}>
              {result.skipped.map((s, idx) => (
                <div key={idx} style={{
                  padding: '8px 0',
                  borderBottom: '1px solid var(--line)',
                  fontSize: 11,
                  fontFamily: mono,
                  display: 'flex',
                  gap: 12,
                }}>
                  <span style={{ color: 'var(--wrong)', flexShrink: 0 }}>row {s.row}</span>
                  <span style={{ color: 'var(--ink-3)' }}>{s.error}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AdminImport() {
  const { t } = useTranslation();
  const user = getPayload()!;
  const nav = useAdminNav();

  const questionColumns: ColDef[] = [
    { name: 'subject_name', required: true, note: t('autoCreated') },
    { name: 'exam_name', required: true, note: t('autoCreated') },
    { name: 'exam_date', required: false, note: 'YYYY-MM-DD' },
    { name: 'question_number', required: true },
    { name: 'question_type', required: true },
    { name: 'content', required: true },
    { name: 'option_a', required: false },
    { name: 'option_b', required: false },
    { name: 'option_c', required: false },
    { name: 'option_d', required: false },
    { name: 'correct_answer', required: true },
    { name: 'max_score', required: true },
    { name: 'subject_description', required: false },
  ];

  const answerColumns: ColDef[] = [
    { name: 'student_username', required: true, note: t('mustExist') },
    { name: 'subject_name', required: true, note: t('mustExist') },
    { name: 'exam_name', required: true, note: t('mustExist') },
    { name: 'question_number', required: true, note: t('mustExist') },
    { name: 'selected_answer', required: true },
  ];

  return (
    <Shell user={user} nav={nav}>
      <div style={{ height: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        <div style={{ padding: 28, borderRight: '1px solid var(--line)', overflow: 'auto' }}>
          <UploadSection
            title={t('importQuestions')}
            columns={questionColumns}
            templateName="questions_template.csv"
            templateContent={QUESTIONS_TEMPLATE}
            onUpload={adminApi.importQuestions}
          />
        </div>
        <div style={{ padding: 28, overflow: 'auto' }}>
          <UploadSection
            title={t('importAnswers')}
            columns={answerColumns}
            templateName="answers_template.csv"
            templateContent={ANSWERS_TEMPLATE}
            onUpload={adminApi.importAnswers}
          />
        </div>
      </div>
    </Shell>
  );
}
