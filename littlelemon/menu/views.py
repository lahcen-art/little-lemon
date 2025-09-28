from django.shortcuts import render

# Create your views here.
from django.shortcuts import render, get_object_or_404
from .models import MenuItem

def home(request):
    return render(request, 'menu/home.html')

def about(request):
    return render(request, 'menu/about.html')

def menu(request):
    items = MenuItem.objects.all().order_by('name')
    return render(request, 'menu/menu.html', {'items': items})

def book(request):
    return render(request, 'menu/book.html')

def menu_item(request, item_id):
    item = get_object_or_404(MenuItem, id=item_id)
    return render(request, 'menu/menu_item.html', {'item': item})
