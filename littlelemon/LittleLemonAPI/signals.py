from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group

User = get_user_model()

@receiver(post_save, sender=User)
def add_default_group(sender, instance, created, **kwargs):
    """
    Add new users to the 'Customer' group by default.
    """
    if created:
        try:
            customer_group = Group.objects.get(name='Customer')
            instance.groups.add(customer_group)
        except Group.DoesNotExist:
            # Create the Customer group if it doesn't exist
            customer_group = Group.objects.create(name='Customer')
            instance.groups.add(customer_group)
