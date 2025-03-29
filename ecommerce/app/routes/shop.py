from flask import Blueprint, render_template, redirect, url_for, flash, request, jsonify
from flask_login import login_required, current_user
from app.models.product import Product
from app.models.order import Order, OrderItem, CartItem
from app.models.review import Review
from app import db
from sqlalchemy import func, or_

bp = Blueprint('shop', __name__)

@bp.route('/products')
def products():
    page = request.args.get('page', 1, type=int)
    category = request.args.get('category')
    search_query = request.args.get('q')
    
    query = Product.query
    
    # Filter by category if provided
    if category:
        query = query.filter_by(category=category)
        
    # Search by name or description if provided
    if search_query:
        query = query.filter(or_(
            Product.name.ilike(f'%{search_query}%'),
            Product.description.ilike(f'%{search_query}%')
        ))
    
    products = query.paginate(page=page, per_page=12, error_out=False)
    categories = db.session.query(Product.category).distinct().all()
    
    return render_template('shop/products.html', 
                         products=products, 
                         categories=[c[0] for c in categories],
                         search_query=search_query)

@bp.route('/search', methods=['GET', 'POST'])
def search():
    if request.method == 'POST':
        search_query = request.form.get('query', '')
        return redirect(url_for('shop.products', q=search_query))
    
    return redirect(url_for('shop.products'))

@bp.route('/product/<int:id>')
def product_detail(id):
    product = Product.query.get_or_404(id)
    # Get related products from the same category, excluding the current product
    related_products = Product.query.filter(
        Product.category == product.category,
        Product.id != product.id
    ).limit(4).all()
    
    # Get reviews for this product
    reviews = Review.query.filter_by(product_id=id).order_by(Review.created_at.desc()).all()
    
    # Check if user has already reviewed this product
    user_reviewed = False
    if current_user.is_authenticated:
        user_reviewed = Review.query.filter_by(
            user_id=current_user.id, 
            product_id=id
        ).first() is not None
    
    return render_template('shop/product_detail.html', 
                          product=product,
                          related_products=related_products,
                          reviews=reviews,
                          user_reviewed=user_reviewed)

@bp.route('/product/<int:id>/review', methods=['POST'])
@login_required
def add_review(id):
    product = Product.query.get_or_404(id)
    
    # Check if user has already reviewed this product
    existing_review = Review.query.filter_by(
        user_id=current_user.id, 
        product_id=id
    ).first()
    
    if existing_review:
        flash('You have already reviewed this product.', 'warning')
        return redirect(url_for('shop.product_detail', id=id))
    
    rating = request.form.get('rating', type=int)
    comment = request.form.get('comment')
    
    if not rating or rating < 1 or rating > 5:
        flash('Please provide a valid rating between 1 and 5.', 'danger')
        return redirect(url_for('shop.product_detail', id=id))
    
    review = Review(
        user_id=current_user.id,
        product_id=id,
        rating=rating,
        comment=comment
    )
    
    db.session.add(review)
    db.session.commit()
    
    flash('Your review has been added!', 'success')
    return redirect(url_for('shop.product_detail', id=id))

@bp.route('/cart')
@login_required
def cart():
    cart_items = CartItem.query.filter_by(user_id=current_user.id).all()
    total = sum(item.product.price * item.quantity for item in cart_items)
    return render_template('shop/cart.html', cart_items=cart_items, total=total)

@bp.route('/cart/add/<int:product_id>', methods=['POST'])
@login_required
def add_to_cart(product_id):
    product = Product.query.get_or_404(product_id)
    quantity = int(request.form.get('quantity', 1))
    
    if quantity > product.stock:
        flash('Not enough stock available', 'danger')
        return redirect(url_for('shop.product_detail', id=product_id))
    
    cart_item = CartItem.query.filter_by(
        user_id=current_user.id,
        product_id=product_id
    ).first()
    
    if cart_item:
        cart_item.quantity += quantity
    else:
        cart_item = CartItem(
            user_id=current_user.id,
            product_id=product_id,
            quantity=quantity
        )
        db.session.add(cart_item)
    
    db.session.commit()
    flash('Product added to cart', 'success')
    return redirect(url_for('shop.cart'))

@bp.route('/cart/add-ajax', methods=['POST'])
@login_required
def add_to_cart_ajax():
    try:
        data = request.get_json()
        product_id = data.get('product_id')
        quantity = int(data.get('quantity', 1))
        
        product = Product.query.get_or_404(product_id)
        
        if quantity > product.stock:
            return jsonify({'success': False, 'message': 'Not enough stock available'})
        
        cart_item = CartItem.query.filter_by(
            user_id=current_user.id,
            product_id=product_id
        ).first()
        
        if cart_item:
            cart_item.quantity += quantity
        else:
            cart_item = CartItem(
                user_id=current_user.id,
                product_id=product_id,
                quantity=quantity
            )
            db.session.add(cart_item)
        
        db.session.commit()
        
        # Calculate cart count after update
        cart_count = db.session.query(func.sum(CartItem.quantity)).filter_by(user_id=current_user.id).scalar() or 0
        
        return jsonify({
            'success': True, 
            'message': 'Product added to cart', 
            'cart_count': cart_count
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@bp.route('/cart/remove/<int:product_id>', methods=['POST'])
@login_required
def remove_from_cart(product_id):
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    
    cart_item = CartItem.query.filter_by(
        user_id=current_user.id,
        product_id=product_id
    ).first_or_404()
    
    db.session.delete(cart_item)
    db.session.commit()
    
    if is_ajax:
        # Calculate updated cart count and total
        cart_count = db.session.query(func.sum(CartItem.quantity)).filter_by(user_id=current_user.id).scalar() or 0
        cart_total = db.session.query(func.sum(Product.price * CartItem.quantity)).\
            join(CartItem, Product.id == CartItem.product_id).\
            filter(CartItem.user_id == current_user.id).scalar() or 0
            
        return jsonify({
            'success': True, 
            'message': 'Product removed from cart',
            'cart_count': cart_count,
            'cart_total': round(cart_total, 2)
        })
    else:
        flash('Product removed from cart', 'success')
        return redirect(url_for('shop.cart'))

@bp.route('/cart/update/<int:product_id>', methods=['POST'])
@login_required
def update_cart(product_id):
    cart_item = CartItem.query.filter_by(
        user_id=current_user.id,
        product_id=product_id
    ).first_or_404()
    
    quantity = int(request.form.get('quantity', 1))
    if quantity > cart_item.product.stock:
        return jsonify({'error': 'Not enough stock available'}), 400
    
    cart_item.quantity = quantity
    db.session.commit()
    
    # Calculate updated cart info
    cart_count = db.session.query(func.sum(CartItem.quantity)).filter_by(user_id=current_user.id).scalar() or 0
    cart_total = db.session.query(func.sum(Product.price * CartItem.quantity)).\
        join(CartItem, Product.id == CartItem.product_id).\
        filter(CartItem.user_id == current_user.id).scalar() or 0
        
    return jsonify({
        'quantity': cart_item.quantity,
        'subtotal': round(cart_item.quantity * cart_item.product.price, 2),
        'cart_count': cart_count,
        'cart_total': round(cart_total, 2)
    })

@bp.route('/checkout')
@login_required
def checkout():
    cart_items = CartItem.query.filter_by(user_id=current_user.id).all()
    if not cart_items:
        flash('Your cart is empty', 'warning')
        return redirect(url_for('shop.cart'))
    
    total = sum(item.product.price * item.quantity for item in cart_items)
    return render_template('shop/checkout.html', cart_items=cart_items, total=total)

@bp.route('/checkout/process', methods=['POST'])
@login_required
def process_checkout():
    cart_items = CartItem.query.filter_by(user_id=current_user.id).all()
    if not cart_items:
        flash('Your cart is empty', 'warning')
        return redirect(url_for('shop.cart'))
    
    total = sum(item.product.price * item.quantity for item in cart_items)
    
    # Create order
    order = Order(
        user_id=current_user.id, 
        total_amount=total,
        status='pending',
        shipping_address=request.form.get('address', ''),
        shipping_city=request.form.get('city', ''),
        shipping_state=request.form.get('state', ''),
        shipping_zip=request.form.get('zip_code', ''),
        shipping_phone=request.form.get('phone', '')
    )
    db.session.add(order)
    db.session.commit()  # Commit to get order.id
    
    # Create order items and update stock
    for cart_item in cart_items:
        if cart_item.quantity > cart_item.product.stock:
            flash('Not enough stock available', 'danger')
            return redirect(url_for('shop.checkout'))
        
        order_item = OrderItem(
            order_id=order.id,
            product_id=cart_item.product_id,
            quantity=cart_item.quantity,
            price=cart_item.product.price
        )
        db.session.add(order_item)
        
        # Update stock
        cart_item.product.stock -= cart_item.quantity
    
    # Clear cart
    CartItem.query.filter_by(user_id=current_user.id).delete()
    db.session.commit()
    
    flash('Order placed successfully!', 'success')
    return redirect(url_for('shop.order_confirmation', order_id=order.id))

@bp.route('/order/<int:order_id>')
@login_required
def order_confirmation(order_id):
    order = Order.query.get_or_404(order_id)
    if order.user_id != current_user.id:
        flash('Access denied', 'danger')
        return redirect(url_for('main.index'))
    
    return render_template('shop/order_confirmation.html', order=order)

@bp.route('/orders')
@login_required
def order_history():
    orders = Order.query.filter_by(user_id=current_user.id).order_by(Order.created_at.desc()).all()
    return render_template('shop/order_history.html', orders=orders)

@bp.route('/cart/count', methods=['GET'])
def cart_count():
    if not current_user.is_authenticated:
        return jsonify({'success': True, 'cart_count': 0})
    
    cart_items = CartItem.query.filter_by(user_id=current_user.id).all()
    cart_count = sum(item.quantity for item in cart_items)
    
    return jsonify({'success': True, 'cart_count': cart_count}) 