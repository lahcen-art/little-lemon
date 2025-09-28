from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    email = models.EmailField(unique=True)
    groups = models.ManyToManyField(
        Group,
        verbose_name=_('groups'),
        blank=True,
        help_text=_(
            'The groups this user belongs to. A user will get all permissions '
            'granted to each of their groups.'
        ),
        related_name="littlelemon_user_set",
        related_query_name="user",
    )
    user_permissions = models.ManyToManyField(
        Permission,
        verbose_name=_('user permissions'),
        blank=True,
        help_text=_('Specific permissions for this user.'),
        related_name="littlelemon_user_set",
        related_query_name="user",
    )

    def __str__(self):
        return self.email

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name

class MenuItem(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    description = models.TextField()
    image = models.ImageField(upload_to='menu_images/')
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='menu_items')
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Cart(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    quantity = models.SmallIntegerField()
    unit_price = models.DecimalField(max_digits=6, decimal_places=2)
    price = models.DecimalField(max_digits=6, decimal_places=2)

    class Meta:
        unique_together = ('user', 'menu_item')

    def save(self, *args, **kwargs):
        self.price = self.unit_price * self.quantity
        super().save(*args, **kwargs)

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    delivery_crew = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='delivery_crew_orders'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    date = models.DateField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order {self.id} - {self.user.username} - {self.status}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    quantity = models.SmallIntegerField()
    unit_price = models.DecimalField(max_digits=6, decimal_places=2)
    price = models.DecimalField(max_digits=6, decimal_places=2)

    class Meta:
        unique_together = ('order', 'menu_item')

    def save(self, *args, **kwargs):
        self.price = self.unit_price * self.quantity
        super().save(*args, **kwargs)
        # Update order total
        order = self.order
        order.total = sum(item.price for item in order.items.all())
        order.save()
