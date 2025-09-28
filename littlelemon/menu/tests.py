from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()

class MenuViewTest(TestCase):
    def setUp(self):
        # Set up test client
        self.client = Client()
        
    def test_menu_page_loads(self):
        """Test that the menu page loads successfully"""
        response = self.client.get(reverse('menu'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'menu/menu.html')

    def test_menu_page_contains_menu_items(self):
        """Test that the menu page displays menu items"""
        # Note: Adjust this test based on your actual menu item model and context
        response = self.client.get(reverse('menu'))
        self.assertContains(response, 'Our Menu')
        # Add more specific assertions based on your template

class MenuItemModelTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        # Set up non-modified objects used by all test methods
        from .models import MenuItem
        MenuItem.objects.create(
            name='Test Item',
            description='Test Description',
            price=9.99,
            category='Main Course',
            is_vegetarian=False
        )

    def test_name_label(self):
        menu_item = MenuItem.objects.get(id=1)
        field_label = menu_item._meta.get_field('name').verbose_name
        self.assertEqual(field_label, 'name')

    def test_name_max_length(self):
        menu_item = MenuItem.objects.get(id=1)
        max_length = menu_item._meta.get_field('name').max_length
        self.assertEqual(max_length, 200)

    def test_object_name_is_name(self):
        menu_item = MenuItem.objects.get(id=1)
        expected_object_name = f'{menu_item.name} - ${menu_item.price}'
        self.assertEqual(str(menu_item), expected_object_name)

class MenuAPITest(APITestCase):
    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        
        # Create test menu items
        self.menu_item_data = {
            'name': 'Test Item',
            'description': 'Test Description',
            'price': '9.99',
            'category': 'Main Course',
            'is_vegetarian': False
        }
        self.menu_item = MenuItem.objects.create(**self.menu_item_data)
        self.list_url = reverse('menu-item-list')
        self.detail_url = reverse('menu-item-detail', kwargs={'pk': self.menu_item.pk})

    def test_get_menu_items(self):
        """Test retrieving menu items"""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], self.menu_item_data['name'])

    def test_create_menu_item_authenticated(self):
        """Test creating a new menu item as an authenticated user"""
        new_item = {
            'name': 'New Item',
            'description': 'New Description',
            'price': '12.99',
            'category': 'Dessert',
            'is_vegetarian': True
        }
        response = self.client.post(self.list_url, new_item, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(MenuItem.objects.count(), 2)
        self.assertEqual(MenuItem.objects.latest('id').name, 'New Item')

    def test_update_menu_item(self):
        """Test updating a menu item"""
        updated_data = self.menu_item_data.copy()
        updated_data['name'] = 'Updated Item'
        response = self.client.put(
            self.detail_url,
            updated_data,
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.menu_item.refresh_from_db()
        self.assertEqual(self.menu_item.name, 'Updated Item')

    def test_delete_menu_item(self):
        """Test deleting a menu item"""
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(MenuItem.objects.count(), 0)
