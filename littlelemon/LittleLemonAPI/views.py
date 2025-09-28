from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from .models import Category, MenuItem, Cart, Order, OrderItem
from .serializers import (
    CategorySerializer, MenuItemSerializer, CartSerializer,
    OrderSerializer, OrderItemSerializer, UserSerializer
)

User = get_user_model()

# Category Views
class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminUser()]
        return super().get_permissions()

class CategoryRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'id'
    permission_classes = [IsAdminUser]

# Menu Item Views
class MenuItemListCreateView(generics.ListCreateAPIView):
    queryset = MenuItem.objects.select_related('category').all()
    serializer_class = MenuItemSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminUser()]
        return super().get_permissions()
    
    def get_queryset(self):
        queryset = super().get_queryset()
        category = self.request.query_params.get('category')
        featured = self.request.query_params.get('featured')
        
        if category:
            queryset = queryset.filter(category__name__iexact=category)
        if featured and featured.lower() == 'true':
            queryset = queryset.filter(is_featured=True)
            
        return queryset

class MenuItemRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer
    lookup_field = 'id'
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAdminUser()]
        return [IsAuthenticated()]

# Cart Views
class CartView(generics.ListCreateAPIView):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    def delete(self, request, *args, **kwargs):
        Cart.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# Order Views
class OrderListCreateView(generics.ListCreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.groups.filter(name='Manager').exists():
            return Order.objects.all()
        elif user.groups.filter(name='Delivery Crew').exists():
            return Order.objects.filter(delivery_crew=user)
        return Order.objects.filter(user=user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class OrderRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.groups.filter(name='Manager').exists():
            return Order.objects.all()
        elif user.groups.filter(name='Delivery Crew').exists():
            return Order.objects.filter(delivery_crew=user)
        return Order.objects.filter(user=user)
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH']:
            # Allow managers to update any field, delivery crew to update only status
            return [permissions.IsAuthenticated()]
        return super().get_permissions()
    
    def perform_update(self, serializer):
        user = self.request.user
        if user.groups.filter(name='Delivery Crew').exists():
            # Only allow delivery crew to update status
            if 'status' in self.request.data:
                serializer.save()
        else:
            serializer.save()

# User Management Views
class ManagerUserListView(generics.ListCreateAPIView):
    queryset = User.objects.filter(groups__name='Manager')
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
    
    def perform_create(self, serializer):
        user = serializer.save()
        manager_group = Group.objects.get(name='Manager')
        user.groups.add(manager_group)
        user.save()

class ManagerUserDetailView(generics.DestroyAPIView):
    queryset = User.objects.filter(groups__name='Manager')
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
    
    def get_object(self):
        user = get_object_or_404(User, pk=self.kwargs['pk'])
        if not user.groups.filter(name='Manager').exists():
            raise Http404("No manager found with the given ID.")
        return user

class DeliveryCrewUserListView(generics.ListCreateAPIView):
    queryset = User.objects.filter(groups__name='Delivery Crew')
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser | permissions.IsAdminUser]
    
    def perform_create(self, serializer):
        user = serializer.save()
        delivery_group = Group.objects.get(name='Delivery Crew')
        user.groups.add(delivery_group)
        user.save()

class DeliveryCrewUserDetailView(generics.DestroyAPIView):
    queryset = User.objects.filter(groups__name='Delivery Crew')
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
    
    def get_object(self):
        user = get_object_or_404(User, pk=self.kwargs['pk'])
        if not user.groups.filter(name='Delivery Crew').exists():
            raise Http404("No delivery crew member found with the given ID.")
        return user
