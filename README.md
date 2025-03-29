# ShadowFox Marketplace

A modern e-commerce platform built with Flask and Python.

## Project Structure

```
ShadowFox/
├── ecommerce/           # Main e-commerce application
│   ├── app/            # Application package
│   ├── config.py       # Configuration settings
│   ├── requirements.txt # Project dependencies
│   └── run.py         # Application entry point
└── README.md          # This file
```

## Features

- Modern, responsive UI design
- User authentication and authorization
- Product catalog with categories
- Shopping cart functionality
- AJAX-powered cart operations
- Real-time cart updates
- Admin dashboard for product management

## Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ShadowFox.git
cd ShadowFox/ecommerce
```

2. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the application:
```bash
flask run --port=5005
```

5. Visit http://127.0.0.1:5005 in your browser

## Technologies Used

- Python 3.x
- Flask
- SQLAlchemy
- Flask-Login
- Flask-WTF
- Bootstrap 5
- JavaScript (AJAX)

## License

This project is licensed under the MIT License - see the LICENSE file for details. 