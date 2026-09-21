from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('urugwiro', '0033_announcement'),
    ]

    operations = [
        migrations.CreateModel(
            name='PropertyImage',
            fields=[
                ('id',          models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image',       models.ImageField(upload_to='property_images')),
                ('caption',     models.CharField(blank=True, max_length=100)),
                ('order',       models.PositiveSmallIntegerField(default=0)),
                ('uploaded_at', models.DateTimeField(auto_now_add=True)),
                ('property',    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='extra_images', to='urugwiro.property')),
            ],
            options={'ordering': ['order', 'uploaded_at']},
        ),
    ]
