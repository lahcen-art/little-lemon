from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'littlelemonapi'

router = DefaultRouter()

urlpatterns = [
    # Categories
    path('categories/', views.CategoryListCreateView.as_view(), name='category-list'),
    path('categories/<int:id>/', views.CategoryRetrieveUpdateDestroyView.as_view(), name='category-detail'),
    
    # Menu Items
    path('menu-items/', views.MenuItemListCreateView.as_view(), name='menuitem-list'),
    path('menu-items/<int:id>/', views.MenuItemRetrieveUpdateDestroyView.as_view(), name='menuitem-detail'),
    
    # Cart
    path('cart/menu-items/', views.CartView.as_view(), name='cart'),
    
    # Orders
    path('orders/', views.OrderListCreateView.as_view(), name='order-list'),
    path('orders/<int:pk>/', views.OrderRetrieveUpdateDestroyView.as_view(), name='order-detail'),
    
    # User Groups
    path('groups/manager/users/', views.ManagerUserListView.as_view(), name='manager-list'),
    path('groups/manager/users/<int:pk>/', views.ManagerUserDetailView.as_view(), name='manager-detail'),
    path('groups/delivery-crew/users/', views.DeliveryCrewUserListView.as_view(), name='delivery-crew-list'),
    path('groups/delivery-crew/users/<int:pk>/', views.DeliveryCrewUserDetailView.as_view(), name='delivery-crew-detail'),
]
