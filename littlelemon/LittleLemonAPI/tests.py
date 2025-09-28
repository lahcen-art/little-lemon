from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from rest_framework.authtoken.models import Token
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class UserRegistrationTest(APITestCase):
    def test_user_registration(self):
        """Test user registration with valid data"""
        url = reverse('user-register')
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'testpass123',
            'password2': 'testpass123',
            'first_name': 'New',
            'last_name': 'User'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(User.objects.get().username, 'newuser')
        self.assertIn('token', response.data)
        self.assertIn('user', response.data)

class TokenObtainPairViewTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.url = reverse('token_obtain_pair')

    def test_token_obtain_pair(self):
        """Test JWT token obtain with valid credentials"""
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_token_obtain_invalid_credentials(self):
        """Test JWT token obtain with invalid credentials"""
        data = {
            'username': 'testuser',
            'password': 'wrongpassword'
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class MenuItemAPITest(APITestCase):
    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            is_staff=True  # Staff user for testing permissions
        )
        # Create JWT token
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        # Menu item data
        self.menu_item_data = {
            'title': 'Test Pizza',
            'price': '12.99',
            'featured': True,
            'category': 'Main Course'
        }
        self.menu_item = self.client.post(
            reverse('menu-items-list'),
            self.menu_item_data,
            format='json'
        ).data

    def test_create_menu_item(self):
        """Test creating a new menu item"""
        new_item = {
            'title': 'New Pizza',
            'price': '14.99',
            'featured': True,
            'category': 'Main Course'
        }
        response = self.client.post(
            reverse('menu-items-list'),
            new_item,
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], new_item['title'])

    def test_get_menu_items(self):
        """Test retrieving menu items"""
        response = self.client.get(reverse('menu-items-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data), 0)

    def test_get_single_menu_item(self):
        """Test retrieving a single menu item"""
        response = self.client.get(
            reverse('menu-items-detail', kwargs={'pk': self.menu_item['id']})
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], self.menu_item['title'])

    def test_update_menu_item(self):
        """Test updating a menu item"""
        updated_data = self.menu_item_data.copy()
        updated_data['title'] = 'Updated Pizza'
        response = self.client.put(
            reverse('menu-items-detail', kwargs={'pk': self.menu_item['id']}),
            updated_data,
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Updated Pizza')

    def test_delete_menu_item(self):
        """Test deleting a menu item"""
        response = self.client.delete(
            reverse('menu-items-detail', kwargs={'pk': self.menu_item['id']})
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

class OrderAPITest(APITestCase):
    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        # Create JWT token
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        # Create a menu item
        self.menu_item = self.client.post(
            reverse('menu-items-list'),
            {
                'title': 'Test Pizza',
                'price': '12.99',
                'featured': True,
                'category': 'Main Course'
            },
            format='json'
        ).data
        
        # Create an order
        self.order = self.client.post(
            reverse('orders-list'),
            {
                'delivery_crew': None,
                'status': False,
                'total': '12.99',
                'date': '2023-01-01'
            },
            format='json'
        ).data

    def test_create_order(self):
        """Test creating a new order"""
        response = self.client.post(
            reverse('orders-list'),
            {
                'delivery_crew': None,
                'status': False,
                'total': '24.98',
                'date': '2023-01-02'
            },
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['total'], '24.98')

    def test_get_orders(self):
        """Test retrieving orders"""
        response = self.client.get(reverse('orders-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data), 0)

    def test_update_order_status(self):
        """Test updating order status"""
        # Create a delivery crew user
        delivery_user = User.objects.create_user(
            username='delivery',
            email='delivery@example.com',
            password='testpass123'
        )
        
        response = self.client.patch(
            reverse('orders-detail', kwargs={'pk': self.order['id']}),
            {
                'status': True,
                'delivery_crew': delivery_user.id
            },
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['status'])
