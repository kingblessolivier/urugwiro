from django.apps import AppConfig


class urugwiroConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'urugwiro'

    def ready(self):
        import urugwiro.signals  # noqa: F401 — registers all signal handlers

