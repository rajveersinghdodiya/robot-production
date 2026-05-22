import os
import shutil
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from werkzeug.utils import secure_filename
from app.utils.database import get_db_connection
from app.routes.admin import admin_auth_required

blogs_bp = Blueprint('blogs', __name__)

# Uploads directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads', 'blogs')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def get_image_full_url(image_path, image_url=None):
    if image_path:
        host_url = request.url_root.rstrip('/')
        return f"{host_url}/api{image_path}"
    return image_url


@blogs_bp.route('/blogs', methods=['GET'])
def list_blogs():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM blogs ORDER BY created_at DESC')
    rows = cursor.fetchall()
    conn.close()

    blogs = []
    for row in rows:
        blogs.append({
            'id': row['id'],
            'title': row['title'],
            'description': row['description'],
            'content': row['content'],
            'image_path': row['image_path'],
            'image_url': row['image_url'],
            'image_full_url': get_image_full_url(row['image_path'], row['image_url']),
            'video_url': row['video_url'],
            'category': row['category'],
            'created_at': row['created_at'],
            'updated_at': row['updated_at'],
        })

    return jsonify(blogs), 200


@blogs_bp.route('/blogs/<int:blog_id>', methods=['GET'])
def get_blog(blog_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM blogs WHERE id = ?', (blog_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return jsonify({'error': 'Blog not found'}), 404

    blog = {
        'id': row['id'],
        'title': row['title'],
        'description': row['description'],
        'content': row['content'],
        'image_path': row['image_path'],
        'image_url': row['image_url'],
        'image_full_url': get_image_full_url(row['image_path'], row['image_url']),
        'video_url': row['video_url'],
        'category': row['category'],
        'created_at': row['created_at'],
        'updated_at': row['updated_at'],
    }

    return jsonify(blog), 200


@blogs_bp.route('/admin/blogs', methods=['POST'])
@admin_auth_required
def create_blog():
    # Support multipart/form-data for image upload or application/json
    title = request.form.get('title') or (request.get_json(silent=True) or {}).get('title')
    description = request.form.get('description') or (request.get_json(silent=True) or {}).get('description')
    content = request.form.get('content') or (request.get_json(silent=True) or {}).get('content')
    image_url = request.form.get('image_url') or (request.get_json(silent=True) or {}).get('image_url')
    video_url = request.form.get('video_url') or (request.get_json(silent=True) or {}).get('video_url')
    category = request.form.get('category') or (request.get_json(silent=True) or {}).get('category')

    image_path = None
    if 'image' in request.files:
        file = request.files['image']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            # make unique
            filename = f"{int(__import__('time').time())}_{filename}"
            dest = os.path.join(UPLOAD_FOLDER, filename)
            file.save(dest)
            image_path = f"/uploads/blogs/{filename}"

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        '''INSERT INTO blogs (title, description, content, image_path, image_url, video_url, category)
           VALUES (?, ?, ?, ?, ?, ?, ?)''',
        (title, description, content, image_path, image_url, video_url, category)
    )
    conn.commit()
    blog_id = cursor.lastrowid
    cursor.execute('SELECT * FROM blogs WHERE id = ?', (blog_id,))
    row = cursor.fetchone()
    conn.close()

    blog = {
        'id': row['id'],
        'title': row['title'],
        'description': row['description'],
        'content': row['content'],
        'image_path': row['image_path'],
        'image_url': row['image_url'],
        'image_full_url': get_image_full_url(row['image_path'], row['image_url']),
        'video_url': row['video_url'],
        'category': row['category'],
        'created_at': row['created_at'],
        'updated_at': row['updated_at'],
    }

    return jsonify({'message': 'Blog created', 'blog': blog}), 201


@blogs_bp.route('/admin/blogs/<int:blog_id>', methods=['PUT'])
@admin_auth_required
def update_blog(blog_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM blogs WHERE id = ?', (blog_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return jsonify({'error': 'Blog not found'}), 404

    title = request.form.get('title') or (request.get_json(silent=True) or {}).get('title')
    description = request.form.get('description') or (request.get_json(silent=True) or {}).get('description')
    content = request.form.get('content') or (request.get_json(silent=True) or {}).get('content')
    image_url = request.form.get('image_url') or (request.get_json(silent=True) or {}).get('image_url')
    video_url = request.form.get('video_url') or (request.get_json(silent=True) or {}).get('video_url')
    category = request.form.get('category') or (request.get_json(silent=True) or {}).get('category')

    image_path = row['image_path']
    # handle new image upload
    if 'image' in request.files:
        file = request.files['image']
        if file and allowed_file(file.filename):
            # delete old image if exists
            if image_path:
                old = os.path.join(BASE_DIR, image_path.lstrip('/').replace('/', os.sep))
                try:
                    if os.path.exists(old):
                        os.remove(old)
                except Exception:
                    pass
            filename = secure_filename(file.filename)
            filename = f"{int(__import__('time').time())}_{filename}"
            dest = os.path.join(UPLOAD_FOLDER, filename)
            file.save(dest)
            image_path = f"/uploads/blogs/{filename}"

    cursor.execute(
        '''UPDATE blogs SET title = ?, description = ?, content = ?, image_path = ?, image_url = ?, video_url = ?, category = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?''',
        (title or row['title'], description or row['description'], content or row['content'], image_path, image_url or row['image_url'], video_url or row['video_url'], category or row['category'], blog_id)
    )
    conn.commit()
    cursor.execute('SELECT * FROM blogs WHERE id = ?', (blog_id,))
    updated = cursor.fetchone()
    conn.close()

    blog = {
        'id': updated['id'],
        'title': updated['title'],
        'description': updated['description'],
        'content': updated['content'],
        'image_path': updated['image_path'],
        'image_url': updated['image_url'],
        'image_full_url': get_image_full_url(updated['image_path'], updated['image_url']),
        'video_url': updated['video_url'],
        'category': updated['category'],
        'created_at': updated['created_at'],
        'updated_at': updated['updated_at'],
    }

    return jsonify({'message': 'Blog updated', 'blog': blog}), 200


@blogs_bp.route('/admin/blogs/<int:blog_id>', methods=['DELETE'])
@admin_auth_required
def delete_blog(blog_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM blogs WHERE id = ?', (blog_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return jsonify({'error': 'Blog not found'}), 404

    image_path = row['image_path']
    if image_path:
        file_path = os.path.join(BASE_DIR, image_path.lstrip('/').replace('/', os.sep))
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception:
            pass

    cursor.execute('DELETE FROM blogs WHERE id = ?', (blog_id,))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Blog deleted'}), 200


@blogs_bp.route('/uploads/blogs/<path:filename>', methods=['GET'])
def serve_uploaded_image(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)
