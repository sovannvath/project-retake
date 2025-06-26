import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth/authContext';
import Layout from '../../components/layout/Layout';
import apiClient from '../../lib/api/client';
import { 
  Warehouse, 
  Package, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  FileText,
  Truck,
  Users,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

const WarehouseDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [requestOrders, setRequestOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchRequestOrders();
    fetchLowStockProducts();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await apiClient.getWarehouseDashboard();
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

  const fetchRequestOrders = async () => {
    try {
      const response = await apiClient.getRequestOrders();
      if (response.success) {
        setRequestOrders(response.data.slice(0, 5)); // Get last 5 request orders
      }
    } catch (error) {
      console.error('Request orders error:', error);
    }
  };

  const fetchLowStockProducts = async () => {
    try {
      const response = await apiClient.getLowStockProducts();
      if (response.success) {
        setLowStockProducts(response.data.slice(0, 5)); // Get top 5 low stock products
      }
    } catch (error) {
      console.error('Low stock products error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRequestStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'pending':
        return <Clock className="text-yellow-500" size={20} />;
      case 'rejected':
        return <AlertTriangle className="text-red-500" size={20} />;
      default:
        return <FileText className="text-gray-500" size={20} />;
    }
  };

  const statsCards = [
    {
      title: 'Pending Requests',
      value: dashboardData?.pending_requests || 0,
      icon: Clock,
      color: 'from-[#3D52A0] to-[#7091E6]',
      change: '+3',
      description: 'Awaiting warehouse approval'
    },
    {
      title: 'Low Stock Items',
      value: dashboardData?.low_stock_items || 0,
      icon: AlertTriangle,
      color: 'from-[#7091E6] to-[#8697C4]',
      change: '+2',
      description: 'Items below threshold'
    },
    {
      title: 'Total Inventory',
      value: dashboardData?.total_inventory || 0,
      icon: Package,
      color: 'from-[#8697C4] to-[#ADBBDA]',
      change: '+15',
      description: 'Items in warehouse'
    },
    {
      title: 'Approved Today',
      value: dashboardData?.approved_today || 0,
      icon: CheckCircle,
      color: 'from-[#ADBBDA] to-[#3D52A0]',
      change: '+8',
      description: 'Requests approved today'
    }
  ];

  const quickActions = [
    {
      title: 'Review Requests',
      description: 'Approve or reject pending requests',
      icon: FileText,
      color: 'from-[#3D52A0] to-[#7091E6]',
      href: '/warehouse/request-orders?status=pending'
    },
    {
      title: 'Inventory Check',
      description: 'Review low stock items',
      icon: Package,
      color: 'from-[#7091E6] to-[#8697C4]',
      href: '/warehouse/inventory'
    },
    {
      title: 'Stock Reports',
      description: 'Generate inventory reports',
      icon: BarChart3,
      color: 'from-[#8697C4] to-[#ADBBDA]',
      href: '/warehouse/reports'
    },
    {
      title: 'Shipment Tracking',
      description: 'Track outgoing shipments',
      icon: Truck,
      color: 'from-[#ADBBDA] to-[#3D52A0]',
      href: '/warehouse/shipments'
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
                Warehouse Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back, {user?.name}! Manage inventory and approve requests efficiently.
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-gradient-to-r from-[#3D52A0] to-[#7091E6] rounded-full flex items-center justify-center">
                <Warehouse size={40} className="text-white" />
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Request Orders */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Pending Requests</h2>
              <button 
                onClick={() => window.location.href = '/warehouse/request-orders'}
                className="text-[#3D52A0] hover:text-[#7091E6] font-medium"
              >
                View All
              </button>
            </div>

            {requestOrders.length > 0 ? (
              <div className="space-y-4">
                {requestOrders.filter(req => req.warehouse_approval_status === 'pending').slice(0, 3).map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                    onClick={() => window.location.href = `/warehouse/request-orders/${request.id}`}
                  >
                    <div className="flex items-center space-x-4">
                      {getRequestStatusIcon(request.warehouse_approval_status)}
                      <div>
                        <p className="font-medium text-gray-900">
                          Request #{request.id}
                        </p>
                        <p className="text-sm text-gray-600">
                          Product: {request.product?.name || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Qty: {request.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 capitalize">
                        {request.warehouse_approval_status}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No pending requests</p>
              </div>
            )}
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Low Stock Alert</h2>
              <button 
                onClick={() => window.location.href = '/warehouse/inventory'}
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
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#EDE8F5] to-[#ADBBDA] rounded-lg flex items-center justify-center">
                        <Package size={20} className="text-[#3D52A0]" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Current: {product.quantity} | Threshold: {product.low_stock_threshold}
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
                <p className="text-gray-600">All items well stocked</p>
              </div>
            )}
          </div>
        </div>

        {/* Warehouse Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Activity */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Requests Reviewed</span>
                <span className="font-bold text-[#3D52A0]">
                  {dashboardData?.requests_reviewed_today || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Items Restocked</span>
                <span className="font-bold text-gray-900">
                  {dashboardData?.items_restocked_today || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Shipments Processed</span>
                <span className="font-bold text-green-600">
                  {dashboardData?.shipments_processed_today || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Inventory Status */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Products</span>
                <span className="font-bold text-gray-900">
                  {dashboardData?.total_products || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">In Stock</span>
                <span className="font-bold text-green-600">
                  {dashboardData?.in_stock_products || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Out of Stock</span>
                <span className="font-bold text-red-600">
                  {dashboardData?.out_of_stock_products || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Urgent Tasks */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Urgent Tasks</h3>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle size={16} className="text-red-600 mr-3" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">
                    {dashboardData?.critical_stock_items || 0} critical stock items
                  </p>
                  <p className="text-xs text-red-700">Immediate restocking needed</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Clock size={16} className="text-yellow-600 mr-3" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-900">
                    {dashboardData?.overdue_requests || 0} overdue requests
                  </p>
                  <p className="text-xs text-yellow-700">Pending approval for 24+ hours</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Activity size={16} className="text-blue-600 mr-3" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">
                    {dashboardData?.pending_shipments || 0} pending shipments
                  </p>
                  <p className="text-xs text-blue-700">Ready for dispatch</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WarehouseDashboard;

