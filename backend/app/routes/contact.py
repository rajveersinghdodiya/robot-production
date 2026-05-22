import logging
import os
import re
import smtplib
from datetime import datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from flask import Blueprint, request, jsonify
from app.utils.database import get_db_connection

logger = logging.getLogger(__name__)

contact_bp = Blueprint('contact', __name__)

EMAIL_REGEX = re.compile(r"^\S+@\S+\.\S+$")
OTP_EXPIRY_MINUTES = 5


def _now_utc_str():
    return datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")


def _expiry_utc_str():
    return (datetime.utcnow() + timedelta(minutes=OTP_EXPIRY_MINUTES)).strftime("%Y-%m-%d %H:%M:%S")


def send_email_via_smtp(to_email: str, code: str) -> None:
    smtp_email = os.getenv('SMTP_EMAIL')
    smtp_password = os.getenv('SMTP_PASSWORD')
    if not smtp_email or not smtp_password:
        raise RuntimeError('SMTP_EMAIL and SMTP_PASSWORD must be configured')

    sender_email = os.getenv('SMTP_FROM_EMAIL', smtp_email)
    message = MIMEMultipart()
    message['From'] = sender_email
    message['To'] = to_email
    message['Subject'] = 'Your IQNAAX verification code'

    body = f'Your IQNAAX OTP is {code}. It expires in {OTP_EXPIRY_MINUTES} minutes.'
    message.attach(MIMEText(body, 'plain'))

    try:
        with smtplib.SMTP('smtp.gmail.com', 587, timeout=20) as smtp:
            smtp.ehlo()
            smtp.starttls()
            smtp.ehlo()
            smtp.login(smtp_email, smtp_password)
            smtp.sendmail(sender_email, [to_email], message.as_string())
    except Exception as exc:
        logger.error('SMTP send failed: %s', exc, exc_info=True)
        raise RuntimeError(f'SMTP send failed: {exc}')


@contact_bp.route('/send-otp', methods=['POST'])
def send_otp():
    data = request.get_json()
    if not data or not data.get('email'):
        return jsonify({'error': 'Email is required'}), 400

    email = data['email'].strip().lower()
    if not EMAIL_REGEX.match(email):
        return jsonify({'error': 'Invalid email address'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('DELETE FROM otp_codes WHERE email = ?', (email,))

    code = f"{__import__('random').randint(0, 999999):06d}"
    expires_at = _expiry_utc_str()
    cursor.execute(
        'INSERT INTO otp_codes (email, code, expires_at, used) VALUES (?, ?, ?, 0)',
        (email, code, expires_at),
    )
    conn.commit()

    # Log the stored OTP row for debugging
    try:
        last_id = cursor.lastrowid
        cursor.execute('SELECT id, email, code, expires_at, used, created_at FROM otp_codes WHERE id = ?', (last_id,))
        stored = cursor.fetchone()
        logger.info('OTP stored: %s', dict(stored) if stored else {'id': last_id})
    except Exception:
        logger.exception('Failed to fetch stored OTP row')

    conn.close()

    try:
        send_email_via_smtp(email, code)
    except Exception as err:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM otp_codes WHERE email = ?', (email,))
        conn.commit()
        conn.close()
        return jsonify({'error': str(err)}), 500

    return jsonify({'message': 'OTP sent successfully'}), 200


@contact_bp.route('/debug-resend', methods=['GET'])
def debug_resend():
    smtp_email = os.getenv('SMTP_EMAIL')
    smtp_password = os.getenv('SMTP_PASSWORD')
    sender_email = os.getenv('SMTP_FROM_EMAIL', smtp_email)
    return jsonify({
        'smtp_configured': bool(smtp_email and smtp_password),
        'smtp_email_loaded': bool(smtp_email),
        'sender_email': sender_email,
        'smtp_host': 'smtp.gmail.com',
        'smtp_port': 587,
        'smtp_status': 'configured' if smtp_email and smtp_password else 'missing_credentials',
    }), 200


@contact_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('otp'):
        return jsonify({'error': 'Email and OTP are required'}), 400

    email = data['email'].strip().lower()
    otp = str(data['otp']).strip()
    if not EMAIL_REGEX.match(email) or not otp.isdigit() or len(otp) != 6:
        return jsonify({'error': 'Invalid email or OTP'}), 400

    # Log received values for debugging
    logger.debug('Verify attempt for email=%s otp=%s', email, otp)

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('DELETE FROM otp_codes WHERE expires_at < ?', (_now_utc_str(),))
    conn.commit()

    cursor.execute(
        'SELECT id, email, code, expires_at, used, created_at FROM otp_codes WHERE email = ? AND code = ? AND used = 0 AND expires_at >= ? ORDER BY created_at DESC LIMIT 1',
        (email, otp, _now_utc_str()),
    )
    row = cursor.fetchone()
    if not row:
        # fetch latest row for email to aid debugging
        try:
            cursor.execute('SELECT id, email, code, expires_at, used, created_at FROM otp_codes WHERE email = ? ORDER BY created_at DESC LIMIT 1', (email,))
            latest = cursor.fetchone()
            logger.warning('OTP verify failed for %s. Latest row: %s', email, dict(latest) if latest else None)
        except Exception:
            logger.exception('Failed fetching latest OTP row for debugging')
        conn.close()
        return jsonify({'error': 'OTP is invalid or has expired'}), 400

    cursor.execute('UPDATE otp_codes SET used = 1 WHERE id = ?', (row['id'],))
    conn.commit()
    conn.close()

    return jsonify({'message': 'OTP verified successfully', 'success': True}), 200


@contact_bp.route('/debug-otp', methods=['GET'])
def debug_otp():
    email = request.args.get('email', '').strip().lower()
    if not email:
        return jsonify({'error': 'email query parameter is required'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT id, email, code, expires_at, used, created_at FROM otp_codes WHERE email = ? ORDER BY created_at DESC LIMIT 1', (email,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return jsonify({'error': 'no otp found for email'}), 404

    is_expired = row['expires_at'] < _now_utc_str()
    return jsonify({
        'stored_otp': row['code'],
        'email': row['email'],
        'created_at': row['created_at'],
        'expires_at': row['expires_at'],
        'used': bool(row['used']),
        'is_expired': is_expired,
    }), 200


@contact_bp.route('/contact', methods=['POST'])
def create_contact():
    """Create a new contact submission"""
    data = request.get_json()
    if not data or not data.get('name') or not data.get('email'):
        return jsonify({'error': 'Name and email are required'}), 400

    name = data['name']
    email = data['email']
    phone = data.get('phone', '')
    organization = data.get('organization', '')
    inquiry_type = data.get('inquiry_type', '')
    message = data.get('message') or f"Inquiry type: {inquiry_type or 'N/A'}; Organization: {organization or 'N/A'}"

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        INSERT INTO contacts (name, email, phone, organization, inquiry_type, message)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (name, email, phone, organization, inquiry_type, message))

    conn.commit()
    contact_id = cursor.lastrowid
    conn.close()

    return jsonify({
        'message': 'Contact submission created successfully',
        'contact': {
            'id': contact_id,
            'name': name,
            'email': email,
            'phone': phone,
            'organization': organization,
            'inquiry_type': inquiry_type,
            'message': message,
        }
    }), 201
