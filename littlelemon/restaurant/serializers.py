from rest_framework import serializers
from .models import Booking

class BookingSerializer(serializers.ModelSerializer):
    """Serializer for the Booking model."""
    
    class Meta:
        model = Booking
        fields = ['id', 'first_name', 'reservation_date', 'reservation_slot', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, data):
        """Validate that the slot is available for the selected date."""
        reservation_date = data.get('reservation_date')
        reservation_slot = data.get('reservation_slot')
        
        # Check if the slot is already booked
        if Booking.objects.filter(
            reservation_date=reservation_date,
            reservation_slot=reservation_slot
        ).exists():
            raise serializers.ValidationError(
                "This time slot is already booked. Please choose another time."
            )
            
        return data


class AvailableSlotsSerializer(serializers.Serializer):
    """Serializer for available time slots."""
    value = serializers.IntegerField()
    display = serializers.CharField()
    is_available = serializers.BooleanField()
