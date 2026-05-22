# IQNAAX Backend API

Flask + SQLite backend for the IQNAAX robotics website.

## Setup Instructions

### Prerequisites
- Python 3.8 or higher
- pip

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
- Windows:
```bash
venv\Scripts\activate
```
- Mac/Linux:
```bash
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Create environment file:
```bash
cp .env.example .env
```

6. Edit `.env` and configure your settings:
- Set a secure `SECRET_KEY`
- Configure Cloudinary credentials (for image/video uploads in Phase 2)
- Adjust `FLASK_PORT` and `FLASK_HOST` if needed

### Running the Server

Development mode:
```bash
python app.py
```

The server will start on `http://127.0.0.1:5000` by default.

### Testing the API

Health check endpoint:
```bash
curl http://127.0.0.1:5000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "IQNAAX Backend API",
  "timestamp": "2024-01-01T00:00:00",
  "version": "1.0.0"
}
```

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── models/          # Database models (Phase 2)
│   ├── routes/          # API routes
│   │   ├── __init__.py
│   │   └── health.py    # Health check endpoint
│   └── utils/           # Utility modules
│       ├── __init__.py
│       └── database.py  # Database configuration
├── app.py               # Flask application entry point
├── requirements.txt     # Python dependencies
├── .env.example         # Environment variables template
└── .gitignore          # Git ignore rules
```

## Architecture

- **Flask**: Web framework
- **SQLite**: Database (file-based, no external DB required)
- **Flask-CORS**: Cross-origin resource sharing for frontend integration
- **Cloudinary**: Image/video upload service (configured for Phase 2)
- **Flask-SQLAlchemy**: ORM for database operations

## Phase 1 Status

✅ Completed:
- Flask backend setup
- SQLite database configuration
- Folder structure
- Flask-CORS setup
- requirements.txt
- Environment variable structure
- Database utility module
- app.py with CORS
- Health check route
- Frontend API config file

## Next Steps (Phase 2)

- Create database models for products, contacts, lab setups
- Implement CRUD API endpoints
- Integrate Cloudinary for image/video uploads
- Implement authentication and admin APIs
