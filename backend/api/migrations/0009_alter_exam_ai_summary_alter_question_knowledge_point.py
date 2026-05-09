from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0008_alter_exam_ai_summary'),
    ]

    operations = [
        # ai_summary was already JSONField in the DB from migration 0008, no change needed
        migrations.AlterField(
            model_name='exam',
            name='ai_summary',
            field=models.JSONField(blank=True, default=dict),
        ),
        # knowledge_point: convert existing text → {"zh": value}, then change type
        migrations.RunSQL(
            """
            ALTER TABLE api_question
              ADD COLUMN knowledge_point_json jsonb DEFAULT '{}'::jsonb;
            UPDATE api_question
              SET knowledge_point_json = jsonb_build_object('zh', knowledge_point)
              WHERE knowledge_point IS NOT NULL AND knowledge_point <> '';
            ALTER TABLE api_question DROP COLUMN knowledge_point;
            ALTER TABLE api_question RENAME COLUMN knowledge_point_json TO knowledge_point;
            """,
            reverse_sql=migrations.RunSQL.noop,
        ),
        migrations.AlterField(
            model_name='question',
            name='knowledge_point',
            field=models.JSONField(blank=True, default=dict),
        ),
    ]
