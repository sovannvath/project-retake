import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth/authContext';
import Layout from '../../components/layout/Layout';
import apiClient from '../../lib/api/client';
import { 
  Truck, 
  Package, 
  CreditCard, 
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  DollarSign,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

const StaffDashboard = () => {
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
      const response = await apiClient.getStaffDashboard();
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
      title: 'Pending Orders',
      value: dashboardData?.pending_orders || 0,
      icon: Clock,
      color: 'from-[#3D52A0] to-[#7091E6]',
      change: '+5%',
      description: 'Orders awaiting processing'
    },
    {
      title: 'Processing Orders',
      value: dashboardData?.processing_orders || 0,
      icon: Package,
      color: 'from-[#7091E6] to-[#8697C4]',
      change: '+12%',
      description: 'Currently being processed'
    },
    {
      title: 'Shipped Today',
      value: dashboardData?.shipped_today || 0,
      icon: Truck,
      color: 'from-[#8697C4] to-[#ADBBDA]',
      change: '+8%',
      description: 'Orders shipped today'
    },
    {
      title: 'Payment Issues',
      value: dashboardData?.payment_issues || 0,
      icon: CreditCard,
      color: 'from-[#ADBBDA] to-[#3D52A0]',
      change: '-3%',
      description: 'Orders with payment problems'
    }
  ];

  const quickActions = [
    {
      title: 'Process Orders',
      description: 'Review and process pending orders',
      icon: Package,
      color: 'from-[#3D52A0] to-[#7091E6]',
      href: '/staff/orders?status=pending'
    },
    {
      title: 'Update Shipments',
      description: 'Update order shipping status',
      icon: Truck,
      color: 'from-[#7091E6] to-[#8697C4]',
      href: '/staff/orders?status=processing'
    },
    {
      title: 'Payment Management',
      description: 'Handle payment status updates',
      icon: CreditCard,
      color: 'from-[#8697C4] to-[#ADBBDA]',
      href: '/staff/orders?payment=pending'
    },
    {
      title: 'Order Reports',
      description: 'View detailed order analytics',
      icon: Activity,
      color: 'from-[#ADBBDA] to-[#3D52A0]',
      href: '/staff/reports'
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
                Staff Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back, {user?.name}! Manage orders and customer requests efficiently.
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-gradient-to-r from-[#3D52A0] to-[#7091E6] rounded-full flex items-center justify-center">
                <Users size={40} className="text-white" />
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
                  <span className={`text-sm font-medium ${
                    stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </h3>
                <p className="text-gray-600 text-sm font-medium mb-1">{stat.title}</p>
                <p className="text-gray-500 text-xs">{stat.description}</p>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                onClick={() => window.location.href = action.href}
              >
                <div className="text-center">
                  <div className={`w-16 h-16 bg-gradient-to-r ${action.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon size={32} className="text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {action.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {action.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
            <button 
              onClick={() => window.location.href = '/staff/orders'}
              className="text-[#3D52A0] hover:text-[#7091E6] font-medium"
            >
              View All Orders
            </button>
          </div>

          {recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                  onClick={() => window.location.href = `/staff/orders/${order.id}`}
                >
                  <div className="flex items-center space-x-4">
                    {getOrderStatusIcon(order.order_status)}
                    <div>
                      <p className="font-medium text-gray-900">
                        Order #{order.id}
                      </p>
                      <p className="text-sm text-gray-600">
                        Customer: {order.user?.name || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      ${order.total}
                    </p>
                    <p className="text-sm text-gray-600 capitalize">
                      {order.order_status}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      Payment: {order.payment_status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No recent orders</p>
            </div>
          )}
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Performance */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Performance</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Orders Processed</span>
                <span className="font-bold text-[#3D52A0]">
                  {dashboardData?.orders_processed_today || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Average Processing Time</span>
                <span className="font-bold text-gray-900">
                  {dashboardData?.avg_processing_time || '0'} min
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Customer Satisfaction</span>
                <span className="font-bold text-green-600">
                  {dashboardData?.customer_satisfaction || '0'}%
                </span>
              </div>
            </div>
          </div>

          {/* Urgent Tasks */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Urgent Tasks</h3>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle size={16} className="text-red-600 mr-3" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">
                    {dashboardData?.overdue_orders || 0} overdue orders
                  </p>
                  <p className="text-xs text-red-700">Require immediate attention</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Clock size={16} className="text-yellow-600 mr-3" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-900">
                    {dashboardData?.pending_payments || 0} pending payments
                  </p>
                  <p className="text-xs text-yellow-700">Need payment verification</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Truck size={16} className="text-blue-600 mr-3" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">
                    {dashboardData?.ready_to_ship || 0} ready to ship
                  </p>
                  <p className="text-xs text-blue-700">Orders ready for shipment</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StaffDashboard;

