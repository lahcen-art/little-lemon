# Little Lemon API

This is the API for the Little Lemon restaurant project, built with Django REST Framework.

## Features

- User authentication with JWT and Djoser
- Menu item management
- Shopping cart functionality
- Order management
- User role-based access control (Manager, Delivery Crew, Customer)

## Setup

1. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run migrations:
   ```bash
   python manage.py migrate
   ```

3. Create a superuser and set up initial data:
   ```bash
   python manage.py setup_initial_data
   ```

4. Run the development server:
   ```bash
   python manage.py runserver
   ```

## API Endpoints

### Authentication

- `POST /api/auth/users/` - Register a new user
- `POST /api/auth/token/login/` - Obtain JWT token
- `POST /api/token/` - Obtain JWT token (alternative)
- `POST /api/token/refresh/` - Refresh JWT token

### Menu Items

- `GET /api/menu-items/` - List all menu items
- `POST /api/menu-items/` - Create a new menu item (Manager only)
- `GET /api/menu-items/{id}/` - Get a specific menu item
- `PUT /api/menu-items/{id}/` - Update a menu item (Manager only)
- `DELETE /api/menu-items/{id}/` - Delete a menu item (Manager only)

### Categories

- `GET /api/categories/` - List all categories
- `POST /api/categories/` - Create a new category (Manager only)
- `GET /api/categories/{id}/` - Get a specific category
- `PUT /api/categories/{id}/` - Update a category (Manager only)
- `DELETE /api/categories/{id}/` - Delete a category (Manager only)

### Cart

- `GET /api/cart/menu-items/` - View cart items
- `POST /api/cart/menu-items/` - Add item to cart
- `DELETE /api/cart/menu-items/` - Clear cart

### Orders

- `GET /api/orders/` - List orders (filtered by user role)
- `POST /api/orders/` - Create a new order from cart
- `GET /api/orders/{id}/` - Get order details
- `PUT /api/orders/{id}/` - Update order status (Manager/Delivery Crew)
- `DELETE /api/orders/{id}/` - Delete order (Manager only)

### User Management

- `GET /api/groups/manager/users/` - List all managers (Manager only)
- `POST /api/groups/manager/users/` - Add a user to managers group (Manager only)
- `DELETE /api/groups/manager/users/{id}/` - Remove user from managers group (Manager only)
- `GET /api/groups/delivery-crew/users/` - List all delivery crew (Manager only)
- `POST /api/groups/delivery-crew/users/` - Add a user to delivery crew (Manager only)
- `DELETE /api/groups/delivery-crew/users/{id}/` - Remove user from delivery crew (Manager only)

## Authentication

Include the JWT token in the Authorization header for authenticated requests:

```
Authorization: Token your_jwt_token_here
```

## Permissions

- **Manager**: Full access to all endpoints
- **Delivery Crew**: Can view and update order status
- **Customer**: Can view menu, manage cart, and place orders

## Development

### Running Tests

```bash
python manage.py test
```

### Linting

```bash
flake8
```

### Formatting

```bash
black .
```
