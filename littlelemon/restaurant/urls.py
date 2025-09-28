from django.urls import path
from . import views

app_name = 'restaurant'

urlpatterns = [
    # API endpoints
    path('api/bookings/', views.BookingListCreateView.as_view(), name='booking-list-create'),
    path('api/bookings/<int:id>/', views.BookingDetailView.as_view(), name='booking-detail'),
    path('api/available-slots/', views.AvailableSlotsView.as_view(), name='available-slots'),
]
