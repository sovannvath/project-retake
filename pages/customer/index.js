import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth/authContext';
import Layout from '../../components/layout/Layout';
import apiClient from '../../lib/api/client';
import { 
  ShoppingCart, 
  Package, 
  Truck, 
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchRecentOrders();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await apiClient.getCustomerDashboard();
      if (response.success) {
        setDashboardData(response.data);
      } else {
        toast.error('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error('Error loading dashboard');
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const response = await apiClient.getOrders();
      if (response.success) {
        setRecentOrders(response.data.slice(0, 5)); // Get last 5 orders
      }
    } catch (error) {
      console.error('Orders error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'processing':
        return <Clock className="text-yellow-500" size={20} />;
      case 'shipped':
        return <Truck className="text-blue-500" size={20} />;
      default:
        return <AlertCircle className="text-gray-500" size={20} />;
    }
  };

  const statsCards = [
    {
      title: 'Total Orders',
      value: dashboardData?.total_orders || 0,
      icon: Package,
      color: 'from-[#3D52A0] to-[#7091E6]',
      change: '+12%'
    },
    {
      title: 'Pending Orders',
      value: dashboardData?.pending_orders || 0,
      icon: Clock,
      color: 'from-[#7091E6] to-[#8697C4]',
      change: '+5%'
    },
    {
      title: 'Total Spent',
      value: `$${dashboardData?.total_spent || 0}`,
      icon: CreditCard,
      color: 'from-[#8697C4] to-[#ADBBDA]',
      change: '+18%'
    },
    {
      title: 'Cart Items',
      value: dashboardData?.cart_items || 0,
      icon: ShoppingCart,
      color: 'from-[#ADBBDA] to-[#3D52A0]',
      change: '+3%'
    }
  ];

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
        {/* Welcome Header */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-gray-600">
                Here's what's happening with your orders and account
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-gradient-to-r from-[#3D52A0] to-[#7091E6] rounded-full flex items-center justify-center">
                <TrendingUp size={40} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <span className="text-green-500 text-sm font-medium">
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </h3>
                <p className="text-gray-600 text-sm">{stat.title}</p>
              </div>
            );
          })}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
            <button className="text-[#3D52A0] hover:text-[#7091E6] font-medium">
              View All
            </button>
          </div>

          {recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-4">
                    {getOrderStatusIcon(order.status)}
                    <div>
                      <p className="font-medium text-gray-900">
                        Order #{order.id}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      ${order.total}
                    </p>
                    <p className="text-sm text-gray-600 capitalize">
                      {order.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No orders yet</p>
              <button className="mt-4 btn-primary">
                Start Shopping
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#3D52A0] to-[#7091E6] rounded-full flex items-center justify-center mx-auto mb-4">
                <Package size={32} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Browse Products
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Discover our latest products and deals
              </p>
              <button className="btn-primary w-full">
                Shop Now
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#7091E6] to-[#8697C4] rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart size={32} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                View Cart
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Review items in your shopping cart
              </p>
              <button className="btn-secondary w-full">
                Go to Cart
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#8697C4] to-[#ADBBDA] rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck size={32} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Track Orders
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Monitor your order status and delivery
              </p>
              <button className="btn-secondary w-full">
                Track Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CustomerDashboard;

