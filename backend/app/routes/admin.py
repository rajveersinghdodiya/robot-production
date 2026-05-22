import os
import secrets
from functools import wraps
from datetime import datetime
from flask import Blueprint, request, jsonify
from app.utils.database import get_db_connection

admin_bp = Blueprint('admin', __name__)

ADMIN_USERNAME = os.getenv('ADMIN_USERNAME', 'admin')
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'admin123')
ADMIN_TOKENS = set()


def generate_token():
    return secrets.token_urlsafe(32)


def admin_auth_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Unauthorized'}), 401

        token = auth_header.split(' ', 1)[1].strip()
        if not token or token not in ADMIN_TOKENS:
            return jsonify({'error': 'Unauthorized'}), 401

        return fn(*args, **kwargs)

    return wrapper


@admin_bp.route('/admin/login', methods=['POST'])
def admin_login():
    """Admin login endpoint"""
    data = request.get_json()

    if not data:
        return jsonify({'success': False, 'error': 'Request body must be JSON'}), 400

    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'success': False, 'error': 'Username and password are required'}), 400

    if username != ADMIN_USERNAME or password != ADMIN_PASSWORD:
        return jsonify({'success': False, 'error': 'Invalid username or password'}), 401

    token = generate_token()
    ADMIN_TOKENS.add(token)

    return jsonify({
        'success': True,
        'token': token,
        'admin': {
            'username': ADMIN_USERNAME,
        }
    }), 200


@admin_bp.route('/admin/logout', methods=['POST'])
@admin_auth_required
def admin_logout():
    auth_header = request.headers.get('Authorization', '')
    token = auth_header.split(' ', 1)[1].strip() if ' ' in auth_header else ''
    ADMIN_TOKENS.discard(token)
    return jsonify({'success': True, 'message': 'Logged out successfully'}), 200


@admin_bp.route('/admin/stats', methods=['GET'])
@admin_auth_required
def admin_stats():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('SELECT COUNT(*) AS total FROM products')
    total_products = cursor.fetchone()['total']

    cursor.execute('SELECT COUNT(*) AS total FROM contacts')
    total_inquiries = cursor.fetchone()['total']

    today = datetime.utcnow().strftime('%Y-%m-%d')
    cursor.execute(
        "SELECT COUNT(*) AS total FROM contacts WHERE DATE(created_at) = ?",
        (today,)
    )
    todays_inquiries = cursor.fetchone()['total']

    conn.close()

    return jsonify({
        'total_products': total_products,
        'total_inquiries': total_inquiries,
        'todays_inquiries': todays_inquiries,
    }), 200


@admin_bp.route('/admin/inquiries', methods=['GET'])
@admin_auth_required
def get_inquiries():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        SELECT id, name, organization, email, phone, inquiry_type, message, created_at
        FROM contacts
        ORDER BY created_at DESC
    ''')
    rows = cursor.fetchall()
    conn.close()

    inquiries = [
        {
            'id': row['id'],
            'name': row['name'],
            'organization': row['organization'],
            'email': row['email'],
            'phone': row['phone'],
            'inquiry_type': row['inquiry_type'],
            'message': row['message'],
            'created_at': row['created_at'],
        }
        for row in rows
    ]

    return jsonify(inquiries), 200


@admin_bp.route('/admin/inquiries/<int:inquiry_id>', methods=['DELETE'])
@admin_auth_required
def delete_inquiry(inquiry_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('SELECT id FROM contacts WHERE id = ?', (inquiry_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return jsonify({'error': 'Inquiry not found'}), 404

    cursor.execute('DELETE FROM contacts WHERE id = ?', (inquiry_id,))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Inquiry deleted successfully'}), 200
