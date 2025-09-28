from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Category, MenuItem, Cart, Order, OrderItem

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name']
        extra_kwargs = {
            'password': {'write_only': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            password=validated_data['password']
        )
        return user

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description']

class MenuItemSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = MenuItem
        fields = ['id', 'name', 'description', 'price', 'image', 'category', 'category_id', 
                 'is_featured', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class CartSerializer(serializers.ModelSerializer):
    menu_item = MenuItemSerializer(read_only=True)
    menu_item_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Cart
        fields = ['id', 'menu_item', 'menu_item_id', 'quantity', 'unit_price', 'price']
        read_only_fields = ['user', 'unit_price', 'price']
    
    def create(self, validated_data):
        menu_item_id = validated_data.pop('menu_item_id')
        menu_item = MenuItem.objects.get(id=menu_item_id)
        
        cart, created = Cart.objects.update_or_create(
            user=self.context['request'].user,
            menu_item=menu_item,
            defaults={
                'quantity': validated_data.get('quantity', 1),
                'unit_price': menu_item.price,
                'price': menu_item.price * validated_data.get('quantity', 1)
            }
        )
        return cart

class OrderItemSerializer(serializers.ModelSerializer):
    menu_item = MenuItemSerializer(read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'menu_item', 'quantity', 'unit_price', 'price']
        read_only_fields = ['unit_price', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user = UserSerializer(read_only=True)
    delivery_crew = UserSerializer(read_only=True)
    
    class Meta:
        model = Order
        fields = ['id', 'user', 'delivery_crew', 'status', 'total', 'date', 
                 'created_at', 'updated_at', 'items']
        read_only_fields = ['user', 'total', 'date', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        user = self.context['request'].user
        cart_items = Cart.objects.filter(user=user)
        
        if not cart_items.exists():
            raise serializers.ValidationError("Your cart is empty")
        
        # Calculate total
        total = sum(item.price for item in cart_items)
        
        # Create order
        order = Order.objects.create(
            user=user,
            total=total,
            status='pending'
        )
        
        # Create order items
        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                menu_item=item.menu_item,
                quantity=item.quantity,
                unit_price=item.unit_price,
                price=item.price
            )
        
        # Clear the cart
        cart_items.delete()
        
        return order
