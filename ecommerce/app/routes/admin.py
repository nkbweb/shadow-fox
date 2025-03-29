from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_required, current_user
from app.models.product import Product
from app.models.order import Order, OrderItem
from app import db
from app.utils.decorators import shop_owner_required

bp = Blueprint('admin', __name__, url_prefix='/admin')

@bp.route('/')
@login_required
@shop_owner_required
def dashboard():
    # Show only products owned by the current shop owner
    owner_products = Product.query.filter(Product.seller_id == current_user.id)
    
    # Get count of unclaimed products
    unclaimed_count = Product.query.filter(Product.seller_id == None).count()
    
    # Get product IDs belonging to this shop owner
    owner_product_ids = [p.id for p in owner_products.all()]
    
    # Get total products count
    total_products = owner_products.count()
    
    # Only count orders and revenue related to this owner's products
    if owner_product_ids:
        # Get orders that contain this shop owner's products
        owner_orders = db.session.query(Order).join(Order.items).filter(
            OrderItem.product_id.in_(owner_product_ids)
        ).distinct()
        
        total_orders = owner_orders.count()
        
        # Calculate total revenue from this shop owner's products
        total_revenue = db.session.query(
            db.func.sum(OrderItem.price * OrderItem.quantity)
        ).filter(
            OrderItem.product_id.in_(owner_product_ids)
        ).scalar() or 0
        
        # Get recent orders for this shop owner
        recent_orders = owner_orders.order_by(Order.created_at.desc()).limit(5).all()
    else:
        total_orders = 0
        total_revenue = 0
        recent_orders = []
    
    # Get low stock products
    low_stock_products = owner_products.filter(Product.stock < 10).all()
    
    return render_template('admin/dashboard.html',
                         total_products=total_products,
                         total_orders=total_orders,
                         total_revenue=total_revenue,
                         recent_orders=recent_orders,
                         low_stock_products=low_stock_products,
                         unclaimed_count=unclaimed_count)

@bp.route('/products')
@login_required
@shop_owner_required
def products():
    # Strictly show only products owned by the current user
    products = Product.query.filter(Product.seller_id == current_user.id).all()
    
    # Get number of unclaimed products (for display in the UI)
    unclaimed_count = Product.query.filter(Product.seller_id == None).count()
    
    return render_template('admin/products.html', 
                          products=products,
                          unclaimed_count=unclaimed_count)

@bp.route('/products/add', methods=['GET', 'POST'])
@login_required
@shop_owner_required
def add_product():
    if request.method == 'POST':
        product = Product(
            name=request.form.get('name'),
            description=request.form.get('description'),
            price=float(request.form.get('price')),
            stock=int(request.form.get('stock')),
            image_url=request.form.get('image_url'),
            category=request.form.get('category'),
            seller_id=current_user.id
        )
        db.session.add(product)
        db.session.commit()
        flash('Product added successfully', 'success')
        return redirect(url_for('admin.products'))
    
    return render_template('admin/product_form.html')

@bp.route('/products/edit/<int:id>', methods=['GET', 'POST'])
@login_required
@shop_owner_required
def edit_product(id):
    product = Product.query.get_or_404(id)
    
    # Check if product has a seller and if current user is the owner
    if product.seller_id is not None and product.seller_id != current_user.id:
        flash('You can only edit products that you own.', 'danger')
        return redirect(url_for('admin.products'))
    
    if request.method == 'POST':
        product.name = request.form.get('name')
        product.description = request.form.get('description')
        product.price = float(request.form.get('price'))
        product.stock = int(request.form.get('stock'))
        product.image_url = request.form.get('image_url')
        product.category = request.form.get('category')
        
        # If this is a product without an owner, assign it to current user
        if product.seller_id is None:
            product.seller_id = current_user.id
            
        db.session.commit()
        flash('Product updated successfully', 'success')
        return redirect(url_for('admin.products'))
    
    return render_template('admin/product_form.html', product=product)

@bp.route('/products/delete/<int:id>')
@login_required
@shop_owner_required
def delete_product(id):
    product = Product.query.get_or_404(id)
    
    # Check if product has a seller and if current user is the owner
    if product.seller_id is not None and product.seller_id != current_user.id:
        flash('You can only delete products that you own.', 'danger')
        return redirect(url_for('admin.products'))
    
    db.session.delete(product)
    db.session.commit()
    flash('Product deleted successfully', 'success')
    return redirect(url_for('admin.products'))

@bp.route('/orders')
@login_required
@shop_owner_required
def orders():
    # Get the IDs of products owned by the current user
    user_product_ids = [p.id for p in Product.query.filter_by(seller_id=current_user.id).all()]
    
    # Query orders that contain the user's products
    seller_orders = db.session.query(Order).join(Order.items).filter(
        OrderItem.product_id.in_(user_product_ids)
    ).distinct().order_by(Order.created_at.desc()).all()
    
    return render_template('admin/orders.html', orders=seller_orders)

@bp.route('/orders/<int:id>')
@login_required
@shop_owner_required
def order_detail(id):
    order = Order.query.get_or_404(id)
    
    # Get the IDs of products owned by the current user
    seller_product_ids = [p.id for p in Product.query.filter_by(seller_id=current_user.id).all()]
    
    # Check if this order contains any of the seller's products
    if not any(item.product_id in seller_product_ids for item in order.items):
        flash('You can only view orders containing your products.', 'danger')
        return redirect(url_for('admin.orders'))
    
    # Filter order_items to only show items for this seller's products
    seller_order_items = [item for item in order.items if item.product_id in seller_product_ids]
    
    return render_template('admin/order_detail.html', 
                          order=order,
                          seller_order_items=seller_order_items)

@bp.route('/orders/update_status/<int:id>', methods=['POST'])
@login_required
@shop_owner_required
def update_order_status(id):
    order = Order.query.get_or_404(id)
    
    # Get the IDs of products owned by the current user
    seller_product_ids = [p.id for p in Product.query.filter_by(seller_id=current_user.id).all()]
    
    # Check if this order contains any of the seller's products
    if not any(item.product_id in seller_product_ids for item in order.items):
        flash('You can only update orders containing your products.', 'danger')
        return redirect(url_for('admin.orders'))
    
    new_status = request.form.get('status')
    
    if new_status in ['pending', 'processing', 'shipped', 'delivered', 'cancelled']:
        order.status = new_status
        db.session.commit()
        flash('Order status updated successfully', 'success')
    else:
        flash('Invalid status', 'danger')
    
    return redirect(url_for('admin.order_detail', id=id))

@bp.route('/products/unclaimed')
@login_required
@shop_owner_required
def unclaimed_products():
    # Show only products that have no owner
    unclaimed = Product.query.filter(Product.seller_id == None).all()
    return render_template('admin/unclaimed_products.html', products=unclaimed)

@bp.route('/products/claim/<int:id>')
@login_required
@shop_owner_required
def claim_product(id):
    product = Product.query.get_or_404(id)
    
    # Only allow claiming products that don't have an owner
    if product.seller_id is not None:
        flash('This product already has an owner.', 'danger')
        return redirect(url_for('admin.unclaimed_products'))
    
    # Set the current user as the owner
    product.seller_id = current_user.id
    db.session.commit()
    
    flash(f'You have successfully claimed "{product.name}".', 'success')
    return redirect(url_for('admin.products')) 