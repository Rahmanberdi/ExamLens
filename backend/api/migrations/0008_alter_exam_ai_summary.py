from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_exam_ai_summary'),
    ]

    operations = [
        # Reset to valid JSON before altering the column type
        migrations.RunSQL(
            "UPDATE api_exam SET ai_summary = '{}';",
            reverse_sql=migrations.RunSQL.noop,
        ),
        migrations.RunSQL(
            "ALTER TABLE api_exam ALTER COLUMN ai_summary TYPE jsonb USING ai_summary::jsonb;",
            reverse_sql="ALTER TABLE api_exam ALTER COLUMN ai_summary TYPE text USING ai_summary::text;",
        ),
    ]
