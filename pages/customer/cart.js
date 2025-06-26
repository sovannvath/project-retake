import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/layout/Layout';
import apiClient from '../../lib/api/client';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard,
  ArrowLeft,
  Package,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [processingOrder, setProcessingOrder] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchCart();
    fetchPaymentMethods();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await apiClient.getCart();
      if (response.success) {
        setCartItems(response.data.items || []);
      } else {
        toast.error('Failed to load cart');
      }
    } catch (error) {
      console.error('Cart error:', error);
      toast.error('Error loading cart');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await apiClient.getPaymentMethods();
      if (response.success) {
        setPaymentMethods(response.data);
        if (response.data.length > 0) {
          setSelectedPaymentMethod(response.data[0].id);
        }
      }
    } catch (error) {
      console.error('Payment methods error:', error);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdating({ ...updating, [itemId]: true });
    
    try {
      const response = await apiClient.updateCartItem(itemId, newQuantity);
      if (response.success) {
        setCartItems(cartItems.map(item => 
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        ));
        toast.success('Cart updated');
      } else {
        toast.error('Failed to update cart');
      }
    } catch (error) {
      console.error('Update cart error:', error);
      toast.error('Error updating cart');
    } finally {
      setUpdating({ ...updating, [itemId]: false });
    }
  };

  const removeItem = async (itemId) => {
    setUpdating({ ...updating, [itemId]: true });
    
    try {
      const response = await apiClient.removeCartItem(itemId);
      if (response.success) {
        setCartItems(cartItems.filter(item => item.id !== itemId));
        toast.success('Item removed from cart');
      } else {
        toast.error('Failed to remove item');
      }
    } catch (error) {
      console.error('Remove item error:', error);
      toast.error('Error removing item');
    } finally {
      setUpdating({ ...updating, [itemId]: false });
    }
  };

  const clearCart = async () => {
    try {
      const response = await apiClient.clearCart();
      if (response.success) {
        setCartItems([]);
        toast.success('Cart cleared');
      } else {
        toast.error('Failed to clear cart');
      }
    } catch (error) {
      console.error('Clear cart error:', error);
      toast.error('Error clearing cart');
    }
  };

  const createOrder = async () => {
    if (!selectedPaymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    setProcessingOrder(true);
    
    try {
      const response = await apiClient.createOrder({
        payment_method_id: selectedPaymentMethod,
        notes: orderNotes
      });
      
      if (response.success) {
        toast.success('Order created successfully!');
        setCartItems([]);
        router.push('/customer/orders');
      } else {
        toast.error('Failed to create order');
      }
    } catch (error) {
      console.error('Create order error:', error);
      toast.error('Error creating order');
    } finally {
      setProcessingOrder(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0).toFixed(2);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0).toFixed(2);
  };

  const tax = (calculateSubtotal() * 0.1).toFixed(2);
  const shipping = cartItems.length > 0 ? 10.00 : 0;
  const total = (parseFloat(calculateSubtotal()) + parseFloat(tax) + shipping).toFixed(2);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="spinner"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
                <p className="text-gray-600">{cartItems.length} items in your cart</p>
              </div>
            </div>
            {cartItems.length > 0 && (
              <button
                onClick={clearCart}
                className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              >
                <Trash2 size={16} className="mr-2" />
                Clear Cart
              </button>
            )}
          </div>
        </div>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center space-x-4">
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-gradient-to-br from-[#EDE8F5] to-[#ADBBDA] rounded-lg flex items-center justify-center flex-shrink-0">
                      <div className="text-2xl text-[#3D52A0] opacity-20">📦</div>
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {item.product.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {item.product.description}
                      </p>
                      <p className="text-xl font-bold text-[#3D52A0]">
                        ${item.product.price}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || updating[item.id]}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus size={16} />
                      </button>
                      
                      <span className="w-12 text-center font-medium">
                        {updating[item.id] ? (
                          <div className="spinner mx-auto"></div>
                        ) : (
                          item.quantity
                        )}
                      </span>
                      
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={updating[item.id]}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={updating[item.id]}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Item Total */}
                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-gray-600">Item Total:</span>
                    <span className="text-lg font-bold text-gray-900">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">${calculateSubtotal()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (10%):</span>
                    <span className="font-medium">${tax}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium">${shipping.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-gray-900">Total:</span>
                      <span className="text-lg font-bold text-[#3D52A0]">${total}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
                
                {paymentMethods.length > 0 ? (
                  <select
                    value={selectedPaymentMethod}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="input w-full"
                  >
                    {paymentMethods.map((method) => (
                      <option key={method.id} value={method.id}>
                        {method.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertCircle size={16} className="text-yellow-600 mr-2" />
                    <span className="text-sm text-yellow-700">
                      No payment methods available
                    </span>
                  </div>
                )}
              </div>

              {/* Order Notes */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Notes</h3>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Add any special instructions..."
                  rows={3}
                  className="input w-full resize-none"
                />
              </div>

              {/* Checkout Button */}
              <button
                onClick={createOrder}
                disabled={processingOrder || !selectedPaymentMethod}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {processingOrder ? (
                  <>
                    <div className="spinner mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard size={20} className="mr-2" />
                    Proceed to Checkout
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Empty Cart */
          <div className="bg-white rounded-xl p-12 shadow-lg text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-[#EDE8F5] to-[#ADBBDA] rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart size={48} className="text-[#3D52A0]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <button
              onClick={() => router.push('/customer/products')}
              className="btn-primary inline-flex items-center"
            >
              <Package size={20} className="mr-2" />
              Start Shopping
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CartPage;

