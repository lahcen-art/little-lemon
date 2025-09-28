from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Q
from .models import Booking
from .serializers import BookingSerializer, AvailableSlotsSerializer
from datetime import date, datetime

class BookingListCreateView(generics.ListCreateAPIView):
    """
    API endpoint that allows bookings to be viewed or created.
    """
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.AllowAny]  # Allow anyone to create bookings
    
    def get_queryset(self):
        """
        Optionally filter bookings by date.
        """
        queryset = super().get_queryset()
        date_param = self.request.query_params.get('date', None)
        
        if date_param:
            try:
                # Parse the date parameter (expected format: YYYY-MM-DD)
                filter_date = datetime.strptime(date_param, '%Y-%m-%d').date()
                queryset = queryset.filter(reservation_date=filter_date)
            except ValueError:
                # If date format is invalid, return no results
                return Booking.objects.none()
                
        return queryset.order_by('reservation_date', 'reservation_slot')
    
    def perform_create(self, serializer):
        """
        Save the booking with the current user.
        """
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            serializer.save()


class AvailableSlotsView(APIView):
    """
    API endpoint that returns available time slots for a given date.
    """
    permission_classes = [permissions.AllowAny]
    def get(self, request, format=None):
        """
        Return a list of available time slots for the specified date.
        If no date is provided, use today's date.
        """
        from datetime import date
        
        date_param = request.query_params.get('date', None)
        
        if date_param:
            try:
                # Parse the date parameter (expected format: YYYY-MM-DD)
                selected_date = date.fromisoformat(date_param)
            except (ValueError, TypeError):
                return Response(
                    {"error": "Invalid date format. Use YYYY-MM-DD."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            selected_date = date.today()
        
        try:
            # Get available slots for the selected date
            available_slots = Booking.get_available_slots(selected_date)
            
            # Serialize the data
            serializer = AvailableSlotsSerializer(available_slots, many=True)
            
            return Response({
                'date': selected_date.isoformat(),
                'available_slots': serializer.data
            })
            
        except Exception as e:
            return Response(
                {"error": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class BookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API endpoint that allows a single booking to be viewed, updated or deleted.
    """
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'id'
