from flask import Blueprint, request, jsonify
from app.utils.database import get_db_connection
from app.routes.admin import admin_auth_required

products_bp = Blueprint('products', __name__)

@products_bp.route('/products', methods=['GET'])
def get_products():
    """Get all products"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM products ORDER BY created_at DESC')
    products = cursor.fetchall()
    
    conn.close()
    
    products_list = []
    for product in products:
        products_list.append({
            'id': product['id'],
            'name': product['name'],
            'description': product['description'],
            'price': product['price'],
            'image_url': product['image_url'],
            'video_url': product['video_url'],
            'created_at': product['created_at']
        })
    
    return jsonify(products_list), 200

@products_bp.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """Get a single product by id"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM products WHERE id = ?', (product_id,))
    product = cursor.fetchone()
    conn.close()

    if not product:
        return jsonify({'error': 'Product not found'}), 404

    return jsonify({
        'id': product['id'],
        'name': product['name'],
        'description': product['description'],
        'price': product['price'],
        'image_url': product['image_url'],
        'video_url': product['video_url'],
        'created_at': product['created_at'],
    }), 200

@products_bp.route('/products', methods=['POST'])
@admin_auth_required
def create_product():
    """Create a new product"""
    data = request.get_json()
    
    if not data or not data.get('name'):
        return jsonify({'error': 'Product name is required'}), 400
    
    name = data['name']
    description = data.get('description', '')
    price = data.get('price')
    image_url = data.get('image_url', '')
    video_url = data.get('video_url', '')
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO products (name, description, price, image_url, video_url)
        VALUES (?, ?, ?, ?, ?)
    ''', (name, description, price, image_url, video_url))
    
    conn.commit()
    product_id = cursor.lastrowid
    conn.close()
    
    return jsonify({
        'message': 'Product created successfully',
        'product': {
            'id': product_id,
            'name': name,
            'description': description,
            'price': price,
            'image_url': image_url,
            'video_url': video_url
        }
    }), 201

@products_bp.route('/products/<int:product_id>', methods=['PUT'])
@admin_auth_required
def update_product(product_id):
    """Update a product"""
    data = request.get_json()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM products WHERE id = ?', (product_id,))
    product = cursor.fetchone()
    
    if not product:
        conn.close()
        return jsonify({'error': 'Product not found'}), 404
    
    name = data.get('name', product['name'])
    description = data.get('description', product['description'])
    price = data.get('price', product['price'])
    image_url = data.get('image_url', product['image_url'])
    video_url = data.get('video_url', product['video_url'])
    
    cursor.execute('''
        UPDATE products
        SET name = ?, description = ?, price = ?, image_url = ?, video_url = ?
        WHERE id = ?
    ''', (name, description, price, image_url, video_url, product_id))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'message': 'Product updated successfully',
        'product': {
            'id': product_id,
            'name': name,
            'description': description,
            'price': price,
            'image_url': image_url,
            'video_url': video_url
        }
    }), 200

@products_bp.route('/products/<int:product_id>', methods=['DELETE'])
@admin_auth_required
def delete_product(product_id):
    """Delete a product"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM products WHERE id = ?', (product_id,))
    product = cursor.fetchone()
    
    if not product:
        conn.close()
        return jsonify({'error': 'Product not found'}), 404
    
    cursor.execute('DELETE FROM products WHERE id = ?', (product_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Product deleted successfully'}), 200
