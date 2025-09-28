from django.test import TestCase, Client
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from .models import Booking
from datetime import date, timedelta

User = get_user_model()

class BookingModelTest(TestCase):
    """Test the Booking model"""
    
    def setUp(self):
        self.booking = Booking.objects.create(
            first_name='John',
            reservation_date=date.today() + timedelta(days=1),
            reservation_slot=12
        )
    
    def test_booking_creation(self):
        """Test that a booking is created with correct attributes"""
        self.assertEqual(self.booking.first_name, 'John')
        self.assertEqual(self.booking.reservation_slot, 12)
        self.assertTrue(isinstance(self.booking, Booking))
        self.assertIsNotNone(self.booking.created_at)
        self.assertIsNotNone(self.booking.updated_at)
    
    def test_booking_string_representation(self):
        """Test the string representation of a booking"""
        expected_string = f"{self.booking.first_name} - {self.booking.get_reservation_slot_display()} on {self.booking.reservation_date}"
        self.assertEqual(str(self.booking), expected_string)
    
    def test_unique_together_constraint(self):
        """Test that duplicate bookings for same date and slot are not allowed"""
        with self.assertRaises(Exception):
            Booking.objects.create(
                first_name='Jane',
                reservation_date=self.booking.reservation_date,
                reservation_slot=self.booking.reservation_slot
            )

class BookingAPITest(APITestCase):
    """Test the Booking API endpoints"""
    
    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        
        # Create test data
        self.tomorrow = date.today() + timedelta(days=1)
        self.booking = Booking.objects.create(
            first_name='Test User',
            reservation_date=self.tomorrow,
            reservation_slot=12
        )
        
        # API endpoints with correct namespaced URLs and full path
        self.list_url = '/api/restaurant/api/bookings/'
        self.detail_url = f'/api/restaurant/api/bookings/{self.booking.id}/'
        self.available_slots_url = '/api/restaurant/api/available-slots/'
    
    def test_get_bookings_list(self):
        """Test retrieving a list of bookings"""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]['first_name'], 'Test User')
    
    def test_create_booking(self):
        """Test creating a new booking"""
        data = {
            'first_name': 'New User',
            'reservation_date': (self.tomorrow + timedelta(days=1)).isoformat(),
            'reservation_slot': 13
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Booking.objects.count(), 2)
        self.assertEqual(Booking.objects.latest('id').first_name, 'New User')
    
    def test_get_available_slots(self):
        """Test retrieving available time slots for a date"""
        response = self.client.get(
            self.available_slots_url,
            {'date': self.tomorrow.isoformat()}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('available_slots', response.data)
        
        # The slot we booked should be marked as not available
        booked_slot = next(
            (slot for slot in response.data['available_slots'] 
             if slot['value'] == 12),
            None
        )
        self.assertIsNotNone(booked_slot, "Booked slot not found in response")
        self.assertFalse(booked_slot['available'])
    
    def test_duplicate_booking_validation(self):
        """Test that duplicate bookings are prevented"""
        data = {
            'first_name': 'Duplicate',
            'reservation_date': self.tomorrow.isoformat(),
            'reservation_slot': 12  # Already booked in setUp
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_update_booking(self):
        """Test updating a booking"""
        data = {
            'first_name': 'Updated Name',
            'reservation_date': self.tomorrow.isoformat(),
            'reservation_slot': 13
        }
        response = self.client.put(self.detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.first_name, 'Updated Name')
        self.assertEqual(self.booking.reservation_slot, 13)
    
    def test_delete_booking(self):
        """Test deleting a booking"""
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Booking.objects.count(), 0)

class AuthenticationTest(APITestCase):
    """Test authentication and permissions"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.token = Token.objects.create(user=self.user)
        self.booking = Booking.objects.create(
            first_name='Test',
            reservation_date=date.today() + timedelta(days=1),
            reservation_slot=12
        )
        self.detail_url = reverse('restaurant:booking-detail', kwargs={'id': self.booking.id})
    
    def test_unauthenticated_access(self):
        """Test that unauthenticated users can't access protected endpoints"""
        client = APIClient()  # New client without authentication
        response = client.get(reverse('restaurant:booking-list-create'))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_authenticated_access(self):
        """Test that authenticated users can access the API"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        response = self.client.get(reverse('restaurant:booking-list-create'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_invalid_slot_validation(self):
        """Test that invalid time slots are rejected"""
        tomorrow = (date.today() + timedelta(days=1)).isoformat()
        data = {
            'first_name': 'Test',
            'reservation_date': tomorrow,
            'reservation_slot': 99  # Invalid slot
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('reservation_slot', response.data)
