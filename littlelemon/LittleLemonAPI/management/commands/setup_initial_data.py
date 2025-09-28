from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from LittleLemonAPI.models import Category, MenuItem

User = get_user_model()

class Command(BaseCommand):
    help = 'Sets up initial data for the Little Lemon API'

    def handle(self, *args, **options):
        self.stdout.write('Setting up initial data...')
        
        # Create groups if they don't exist
        manager_group, created = Group.objects.get_or_create(name='Manager')
        delivery_crew_group, created = Group.objects.get_or_create(name='Delivery Crew')
        customer_group, created = Group.objects.get_or_create(name='Customer')
        
        # Add permissions to groups
        self.add_permissions_to_group(manager_group, [
            'add_menuitem', 'change_menuitem', 'delete_menuitem', 'view_menuitem',
            'add_category', 'change_category', 'delete_category', 'view_category',
            'add_order', 'change_order', 'view_order',
            'add_user', 'change_user', 'delete_user', 'view_user',
        ])
        
        self.add_permissions_to_group(delivery_crew_group, [
            'view_order', 'change_order',
        ])
        
        self.add_permissions_to_group(customer_group, [
            'view_menuitem', 'view_category', 'add_order', 'view_order',
        ])
        
        self.stdout.write(self.style.SUCCESS('Successfully set up groups and permissions'))
        
        # Create a superuser if one doesn't exist
        if not User.objects.filter(is_superuser=True).exists():
            self.stdout.write('Creating superuser...')
            User.objects.create_superuser(
                username='admin',
                email='admin@littlelemon.com',
                password='admin123',
                first_name='Admin',
                last_name='User'
            )
            self.stdout.write(self.style.SUCCESS('Created superuser: admin / admin123'))
        
        # Create some sample categories and menu items
        self.create_sample_data()
    
    def add_permissions_to_group(self, group, permission_codenames):
        """Add permissions to a group by codename."""
        for codename in permission_codenames:
            try:
                # Try to find the permission by codename
                app_label = 'LittleLemonAPI'
                if codename.startswith(('add_', 'change_', 'delete_', 'view_')):
                    model_name = codename.split('_', 1)[1]
                    content_type = ContentType.objects.get(app_label=app_label, model=model_name)
                    permission = Permission.objects.get(
                        content_type=content_type,
                        codename=codename
                    )
                    group.permissions.add(permission)
            except (ContentType.DoesNotExist, Permission.DoesNotExist):
                self.stdout.write(
                    self.style.WARNING(f'Permission {codename} not found')
                )
    
    def create_sample_data(self):
        """Create some sample categories and menu items."""
        # Create categories
        categories = [
            {'name': 'Appetizers', 'slug': 'appetizers'},
            {'name': 'Main Course', 'slug': 'main-course'},
            {'name': 'Desserts', 'slug': 'desserts'},
            {'name': 'Beverages', 'slug': 'beverages'},
        ]
        
        for cat_data in categories:
            Category.objects.get_or_create(
                name=cat_data['name'],
                defaults={'slug': cat_data['slug']}
            )
        
        # Create some sample menu items
        menu_items = [
            {
                'name': 'Bruschetta',
                'price': '8.99',
                'description': 'Toasted bread topped with tomatoes, garlic, and fresh basil',
                'category': 'Appetizers',
                'is_featured': True
            },
            {
                'name': 'Greek Salad',
                'price': '12.99',
                'description': 'Fresh vegetables, feta cheese, and olives with olive oil dressing',
                'category': 'Main Course',
                'is_featured': True
            },
            {
                'name': 'Lemon Dessert',
                'price': '6.99',
                'description': 'Homemade lemon meringue pie with a graham cracker crust',
                'category': 'Desserts',
                'is_featured': True
            },
        ]
        
        for item_data in menu_items:
            category = Category.objects.get(name=item_data.pop('category'))
            MenuItem.objects.get_or_create(
                name=item_data['name'],
                defaults={
                    **item_data,
                    'category': category
                }
            )
        
        self.stdout.write(self.style.SUCCESS('Created sample categories and menu items'))
