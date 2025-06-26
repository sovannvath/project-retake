import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/layout/Layout";
import apiClient from "../../lib/api/client";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  BarChart3,
  PieChart,
} from "lucide-react";
import { toast } from "sonner";

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await apiClient.getAdminDashboard();
      if (response.success) {
        setDashboardData(response.data);
      } else {
        toast.error("Failed to load dashboard data");
      }
    } catch (error) {
      console.error("Dashboard error:", error);
      toast.error("Error loading dashboard");
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="text-green-500" size={16} />;
      case "processing":
        return <Clock className="text-yellow-500" size={16} />;
      case "cancelled":
        return <AlertTriangle className="text-red-500" size={16} />;
      default:
        return <Package className="text-gray-500" size={16} />;
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
        <div className="bg-gradient-to-r from-[#3D52A0] to-[#7091E6] rounded-xl p-6 text-white shadow-lg">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-blue-100">
            Comprehensive overview of your e-commerce operations
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Revenue
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  ${dashboardData?.total_revenue || "0.00"}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign size={24} className="text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp size={16} className="text-green-500 mr-1" />
              <span className="text-sm text-green-600">
                +15% from last month
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Orders
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {dashboardData?.total_orders || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <ShoppingCart size={24} className="text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp size={16} className="text-green-500 mr-1" />
              <span className="text-sm text-green-600">
                +8% from last month
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Products
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {dashboardData?.total_products || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Package size={24} className="text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-sm text-gray-600">
                {dashboardData?.low_stock_products || 0} low stock
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Users
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {dashboardData?.active_users || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Users size={24} className="text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp size={16} className="text-green-500 mr-1" />
              <span className="text-sm text-green-600">
                +5% from last month
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
              <button
                onClick={() => router.push("/orders/manage")}
                className="text-sm text-[#3D52A0] hover:text-[#2A3A7C] font-medium"
              >
                View All →
              </button>
            </div>

            {dashboardData?.recent_orders?.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recent_orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      {getOrderStatusIcon(order.order_status)}
                      <div>
                        <p className="font-medium text-gray-900">
                          Order #{order.id}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.user?.name} •{" "}
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          ${order.total}
                        </p>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.order_status === "completed"
                              ? "bg-green-100 text-green-800"
                              : order.order_status === "processing"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {order.order_status?.charAt(0).toUpperCase() +
                            order.order_status?.slice(1)}
                        </span>
                      </div>
                      <button
                        onClick={() => router.push(`/orders/${order.id}`)}
                        className="p-2 text-gray-400 hover:text-[#3D52A0] transition-colors duration-200"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart
                  size={48}
                  className="text-gray-300 mx-auto mb-4"
                />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No recent orders
                </h3>
                <p className="text-gray-600">
                  Orders will appear here as they come in
                </p>
              </div>
            )}
          </div>

          {/* Alerts & Quick Actions */}
          <div className="space-y-6">
            {/* Alerts */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                System Alerts
              </h3>
              <div className="space-y-3">
                {dashboardData?.low_stock_products > 0 && (
                  <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertTriangle size={16} className="text-yellow-600 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-800">
                        Low Stock Alert
                      </p>
                      <p className="text-xs text-yellow-700">
                        {dashboardData.low_stock_products} products are running
                        low
                      </p>
                      <button
                        onClick={() =>
                          router.push("/products/manage?filter=low-stock")
                        }
                        className="text-xs text-yellow-800 underline mt-1"
                      >
                        View Products →
                      </button>
                    </div>
                  </div>
                )}

                {dashboardData?.pending_orders > 0 && (
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Clock size={16} className="text-blue-600 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-800">
                        Pending Orders
                      </p>
                      <p className="text-xs text-blue-700">
                        {dashboardData.pending_orders} orders need attention
                      </p>
                      <button
                        onClick={() =>
                          router.push("/orders/manage?status=pending")
                        }
                        className="text-xs text-blue-800 underline mt-1"
                      >
                        Review Orders →
                      </button>
                    </div>
                  </div>
                )}

                {!dashboardData?.low_stock_products &&
                  !dashboardData?.pending_orders && (
                    <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle size={16} className="text-green-600 mt-1" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-800">
                          All Good!
                        </p>
                        <p className="text-xs text-green-700">
                          No critical alerts at this time
                        </p>
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push("/products/manage")}
                  className="w-full flex items-center px-4 py-3 bg-[#3D52A0] text-white rounded-lg hover:bg-[#2A3A7C] transition-colors duration-200"
                >
                  <Package size={20} className="mr-3" />
                  Manage Products
                </button>

                <button
                  onClick={() => router.push("/orders/manage")}
                  className="w-full flex items-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <ShoppingCart size={20} className="mr-3" />
                  View Orders
                </button>

                <button
                  onClick={() => router.push("/request-orders")}
                  className="w-full flex items-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <Eye size={20} className="mr-3" />
                  Request Orders
                </button>
              </div>
            </div>

            {/* Sales Summary */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Sales Summary
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Today's Sales</span>
                  <span className="font-bold text-gray-900">
                    ${dashboardData?.today_sales || "0.00"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">This Week</span>
                  <span className="font-bold text-gray-900">
                    ${dashboardData?.week_sales || "0.00"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">This Month</span>
                  <span className="font-bold text-gray-900">
                    ${dashboardData?.month_sales || "0.00"}
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      Growth Rate
                    </span>
                    <div className="flex items-center">
                      <TrendingUp size={16} className="text-green-500 mr-1" />
                      <span className="text-sm font-bold text-green-600">
                        +{dashboardData?.growth_rate || 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
