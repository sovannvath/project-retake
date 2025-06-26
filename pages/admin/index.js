import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth/authContext';
import Layout from '../../components/layout/Layout';
import apiClient from '../../lib/api/client';
import { 
  Shield, 
  Package, 
  Users, 
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  BarChart3,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchRecentOrders();
    fetchLowStockProducts();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await apiClient.getAdminDashboard();
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
        setRecentOrders(response.data.slice(0, 5));
      }
    } catch (error) {
      console.error('Orders error:', error);
    }
  };

  const fetchLowStockProducts = async () => {
    try {
      const response = await apiClient.getLowStockProducts();
      if (response.success) {
        setLowStockProducts(response.data.slice(0, 5));
      }
    } catch (error) {
      console.error('Low stock products error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Total Revenue',
      value: `$${dashboardData?.total_revenue || 0}`,
      icon: DollarSign,
      color: 'from-[#3D52A0] to-[#7091E6]',
      change: '+12.5%',
      description: 'This month'
    },
    {
      title: 'Total Orders',
      value: dashboardData?.total_orders || 0,
      icon: ShoppingCart,
      color: 'from-[#7091E6] to-[#8697C4]',
      change: '+8.2%',
      description: 'All time'
    },
    {
      title: 'Total Users',
      value: dashboardData?.total_users || 0,
      icon: Users,
      color: 'from-[#8697C4] to-[#ADBBDA]',
      change: '+15.3%',
      description: 'Registered users'
    },
    {
      title: 'Total Products',
      value: dashboardData?.total_products || 0,
      icon: Package,
      color: 'from-[#ADBBDA] to-[#3D52A0]',
      change: '+5.1%',
      description: 'In catalog'
    }
  ];

  const quickActions = [
    {
      title: 'Manage Products',
      description: 'Add, edit, and manage product catalog',
      icon: Package,
      color: 'from-[#3D52A0] to-[#7091E6]',
      href: '/admin/products'
    },
    {
      title: 'View Orders',
      description: 'Monitor and manage all orders',
      icon: ShoppingCart,
      color: 'from-[#7091E6] to-[#8697C4]',
      href: '/admin/orders'
    },
    {
      title: 'Request Orders',
      description: 'Review inventory requests',
      icon: FileText,
      color: 'from-[#8697C4] to-[#ADBBDA]',
      href: '/admin/request-orders'
    },
    {
      title: 'User Management',
      description: 'Manage user accounts and roles',
      icon: Users,
      color: 'from-[#ADBBDA] to-[#3D52A0]',
      href: '/admin/users'
    },
    {
      title: 'Analytics',
      description: 'View detailed reports and analytics',
      icon: BarChart3,
      color: 'from-[#3D52A0] to-[#7091E6]',
      href: '/admin/analytics'
    },
    {
      title: 'System Settings',
      description: 'Configure system preferences',
      icon: Settings,
      color: 'from-[#7091E6] to-[#8697C4]',
      href: '/admin/settings'
    }
  ];

  const getOrderStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'processing':
        return <Clock className="text-yellow-500" size={16} />;
      case 'shipped':
        return <Activity className="text-blue-500" size={16} />;
      default:
        return <AlertTriangle className="text-gray-500" size={16} />;
    }
  };

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
                Admin Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back, {user?.name}! Here's your complete system overview.
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-gradient-to-r from-[#3D52A0] to-[#7091E6] rounded-full flex items-center justify-center">
                <Shield size={40} className="text-white" />
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
                <p className="text-gray-600 text-sm font-medium mb-1">{stat.title}</p>
                <p className="text-gray-500 text-xs">{stat.description}</p>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
              <button 
                onClick={() => window.location.href = '/admin/orders'}
                className="text-[#3D52A0] hover:text-[#7091E6] font-medium"
              >
                View All
              </button>
            </div>

            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                    onClick={() => window.location.href = `/admin/orders/${order.id}`}
                  >
                    <div className="flex items-center space-x-3">
                      {getOrderStatusIcon(order.order_status)}
                      <div>
                        <p className="font-medium text-gray-900">
                          Order #{order.id}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.user?.name || 'N/A'}
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
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No recent orders</p>
              </div>
            )}
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Low Stock Alert</h2>
              <button 
                onClick={() => window.location.href = '/admin/products?filter=low-stock'}
                className="text-[#3D52A0] hover:text-[#7091E6] font-medium"
              >
                View All
              </button>
            </div>

            {lowStockProducts.length > 0 ? (
              <div className="space-y-4">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-4 border border-red-200 bg-red-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#EDE8F5] to-[#ADBBDA] rounded-lg flex items-center justify-center">
                        <Package size={20} className="text-[#3D52A0]" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Stock: {product.quantity} / Threshold: {product.low_stock_threshold}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                        Low Stock
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle size={48} className="mx-auto text-green-400 mb-4" />
                <p className="text-gray-600">All products well stocked</p>
              </div>
            )}
          </div>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Summary */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">New Orders</span>
                <span className="font-bold text-[#3D52A0]">
                  {dashboardData?.orders_today || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">New Users</span>
                <span className="font-bold text-gray-900">
                  {dashboardData?.users_today || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Revenue</span>
                <span className="font-bold text-green-600">
                  ${dashboardData?.revenue_today || 0}
                </span>
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">API Status</span>
                <span className="flex items-center text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Database</span>
                <span className="flex items-center text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Storage</span>
                <span className="flex items-center text-yellow-600">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                  75% Used
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Pending Requests</span>
                <span className="font-bold text-yellow-600">
                  {dashboardData?.pending_requests || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Active Users</span>
                <span className="font-bold text-blue-600">
                  {dashboardData?.active_users || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Conversion Rate</span>
                <span className="font-bold text-green-600">
                  {dashboardData?.conversion_rate || 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users size={20} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">
                  New user registration: John Doe
                </p>
                <p className="text-xs text-blue-700">2 minutes ago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <ShoppingCart size={20} className="text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900">
                  Order #1234 completed successfully
                </p>
                <p className="text-xs text-green-700">5 minutes ago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertTriangle size={20} className="text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900">
                  Low stock alert: Product ABC
                </p>
                <p className="text-xs text-yellow-700">10 minutes ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;

