from django.core.management.base import BaseCommand

from api.ai_utils import generate_knowledge_points_all_langs
from api.models import Question


class Command(BaseCommand):
    help = 'Backfill knowledge_point (all languages) for questions'

    def add_arguments(self, parser):
        parser.add_argument('--overwrite', action='store_true',
                            help='Regenerate even if knowledge_point already exists')

    def handle(self, *args, **options):
        qs = Question.objects.all()
        if not options['overwrite']:
            qs = [q for q in qs if len(q.knowledge_point or {}) < 3]

        self.stdout.write(f'Processing {len(qs)} question(s)...')

        for q in qs:
            kp = generate_knowledge_points_all_langs(q.content, q.question_type)
            if kp:
                Question.objects.filter(pk=q.pk).update(knowledge_point=kp)
                self.stdout.write(self.style.SUCCESS(
                    f'  #{q.pk} {kp}'
                ))
            else:
                self.stdout.write(self.style.WARNING(f'  #{q.pk} failed'))

        self.stdout.write('Finished.')
