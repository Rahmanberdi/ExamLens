from django.core.management.base import BaseCommand

from api.ai_utils import refresh_exam_summary_all_langs
from api.models import Exam, StudentAnswer


class Command(BaseCommand):
    help = 'Generate AI summaries (all languages) for exams that have student answers'

    def add_arguments(self, parser):
        parser.add_argument('--overwrite', action='store_true',
                            help='Regenerate even if summaries already exist')

    def handle(self, *args, **options):
        overwrite = options['overwrite']
        exam_ids_with_answers = (
            StudentAnswer.objects.values_list('question__exam_id', flat=True).distinct()
        )
        exams = Exam.objects.filter(pk__in=exam_ids_with_answers).select_related('subject')
        if not overwrite:
            # Skip exams that already have all 3 languages
            exams = [e for e in exams if len(e.ai_summary or {}) < 3]

        self.stdout.write(f'Processing {len(exams)} exam(s)...')

        for exam in exams:
            refresh_exam_summary_all_langs(exam.pk)
            exam.refresh_from_db()
            langs_done = list(exam.ai_summary.keys())
            self.stdout.write(self.style.SUCCESS(
                f'  done  #{exam.pk} {exam.name} {langs_done}'
            ))

        self.stdout.write('Finished.')
