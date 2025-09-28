from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone

class Booking(models.Model):
    """Model representing a table booking at the restaurant."""
    
    # Define time slots (you can adjust these based on your needs)
    TIME_SLOTS = [
        (11, '11:00 AM - 12:00 PM'),
        (12, '12:00 PM - 1:00 PM'),
        (13, '1:00 PM - 2:00 PM'),
        (18, '6:00 PM - 7:00 PM'),
        (19, '7:00 PM - 8:00 PM'),
        (20, '8:00 PM - 9:00 PM'),
        (21, '9:00 PM - 10:00 PM'),
    ]
    
    first_name = models.CharField(max_length=100)
    reservation_date = models.DateField()
    reservation_slot = models.SmallIntegerField(choices=TIME_SLOTS)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('reservation_date', 'reservation_slot')
        ordering = ['reservation_date', 'reservation_slot']
    
    def __str__(self):
        return f"{self.first_name} - {self.get_reservation_slot_display()} on {self.reservation_date}"
    
    @classmethod
    def get_available_slots(cls, date):
        """Get available time slots for a given date."""
        # Convert date to datetime.date if it's a string
        if isinstance(date, str):
            from datetime import datetime
            date = datetime.strptime(date, '%Y-%m-%d').date()
            
        # Get all booked slots for the given date
        booked_slots = list(cls.objects.filter(
            reservation_date=date
        ).values_list('reservation_slot', flat=True))
        
        available_slots = []
        for slot_value, slot_display in cls.TIME_SLOTS:
            is_available = slot_value not in booked_slots
            available_slots.append({
                'value': slot_value,
                'display': slot_display,
                'is_available': is_available
            })
        
        return available_slots
