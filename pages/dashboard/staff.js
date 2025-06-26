import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/layout/Layout";
import apiClient from "../../lib/api/client";
import {
  Package,
  ShoppingCart,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Eye,
  CreditCard,
  Users,
  Calendar,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";

const StaffDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await apiClient.getStaffDashboard();
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
      case "shipped":
        return <Package className="text-blue-500" size={16} />;
      case "cancelled":
        return <AlertTriangle className="text-red-500" size={16} />;
      default:
        return <ShoppingCart className="text-gray-500" size={16} />;
    }
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityLevel = (order) => {
    const daysSinceOrder = Math.floor(
      (new Date() - new Date(order.created_at)) / (1000 * 60 * 60 * 24),
    );

    if (order.payment_status === "failed") return "high";
    if (order.order_status === "pending" && daysSinceOrder > 2) return "high";
    if (order.order_status === "processing" && daysSinceOrder > 1)
      return "medium";
    return "low";
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-green-100 text-green-800";
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
          <h1 className="text-3xl font-bold mb-2">Staff Dashboard</h1>
          <p className="text-blue-100">
            Manage orders, process payments, and provide customer support
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Orders Processed
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {dashboardData?.orders_processed || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <ShoppingCart size={24} className="text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp size={16} className="text-green-500 mr-1" />
              <span className="text-sm text-green-600">
                +12% from yesterday
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Orders
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {dashboardData?.pending_orders || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock size={24} className="text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-sm text-gray-600">Requires attention</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Payment Issues
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {dashboardData?.payment_issues || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <CreditCard size={24} className="text-red-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <AlertTriangle size={16} className="text-red-500 mr-1" />
              <span className="text-sm text-red-600">Needs resolution</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Customer Inquiries
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {dashboardData?.customer_inquiries || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Users size={24} className="text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-sm text-gray-600">
                Active conversations
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Priority Orders */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Priority Orders
              </h2>
              <button
                onClick={() => router.push("/orders/manage")}
                className="text-sm text-[#3D52A0] hover:text-[#2A3A7C] font-medium"
              >
                View All →
              </button>
            </div>

            {dashboardData?.priority_orders?.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.priority_orders.map((order) => {
                  const priority = getPriorityLevel(order);
                  return (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-4">
                        {getOrderStatusIcon(order.order_status)}
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-gray-900">
                              Order #{order.id}
                            </p>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(priority)}`}
                            >
                              {priority.charAt(0).toUpperCase() +
                                priority.slice(1)}{" "}
                              Priority
                            </span>
                          </div>
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
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.order_status)}`}
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
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No priority orders
                </h3>
                <p className="text-gray-600">
                  All orders are being processed normally
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions & Alerts */}
          <div className="space-y-6">
            {/* Alerts */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Action Required
              </h3>
              <div className="space-y-3">
                {dashboardData?.payment_issues > 0 && (
                  <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <CreditCard size={16} className="text-red-600 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800">
                        Payment Issues
                      </p>
                      <p className="text-xs text-red-700">
                        {dashboardData.payment_issues} orders have payment
                        problems
                      </p>
                      <button
                        onClick={() =>
                          router.push("/orders/manage?payment=failed")
                        }
                        className="text-xs text-red-800 underline mt-1"
                      >
                        Review Orders →
                      </button>
                    </div>
                  </div>
                )}

                {dashboardData?.pending_orders > 0 && (
                  <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <Clock size={16} className="text-yellow-600 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-800">
                        Pending Orders
                      </p>
                      <p className="text-xs text-yellow-700">
                        {dashboardData.pending_orders} orders need processing
                      </p>
                      <button
                        onClick={() =>
                          router.push("/orders/manage?status=pending")
                        }
                        className="text-xs text-yellow-800 underline mt-1"
                      >
                        Process Orders →
                      </button>
                    </div>
                  </div>
                )}

                {!dashboardData?.payment_issues &&
                  !dashboardData?.pending_orders && (
                    <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle size={16} className="text-green-600 mt-1" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-800">
                          All Caught Up!
                        </p>
                        <p className="text-xs text-green-700">
                          No urgent actions required
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
                  onClick={() => router.push("/orders/manage")}
                  className="w-full flex items-center px-4 py-3 bg-[#3D52A0] text-white rounded-lg hover:bg-[#2A3A7C] transition-colors duration-200"
                >
                  <ShoppingCart size={20} className="mr-3" />
                  Manage Orders
                </button>

                <button
                  onClick={() =>
                    router.push("/orders/manage?status=processing")
                  }
                  className="w-full flex items-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <Clock size={20} className="mr-3" />
                  Process Orders
                </button>

                <button
                  onClick={() => router.push("/orders/manage?payment=failed")}
                  className="w-full flex items-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <CreditCard size={20} className="mr-3" />
                  Payment Issues
                </button>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Today's Performance
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Orders Processed
                  </span>
                  <span className="font-bold text-gray-900">
                    {dashboardData?.today_processed || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Average Processing Time
                  </span>
                  <span className="font-bold text-gray-900">
                    {dashboardData?.avg_processing_time || "0"} min
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Customer Satisfaction
                  </span>
                  <span className="font-bold text-gray-900">
                    {dashboardData?.satisfaction_rate || 0}%
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      Efficiency Score
                    </span>
                    <div className="flex items-center">
                      <TrendingUp size={16} className="text-green-500 mr-1" />
                      <span className="text-sm font-bold text-green-600">
                        {dashboardData?.efficiency_score || 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                {dashboardData?.recent_activities
                  ?.slice(0, 3)
                  .map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-2">
                      <div className="w-2 h-2 bg-[#3D52A0] rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-600">
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  )) || (
                  <p className="text-sm text-gray-600">No recent activity</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StaffDashboard;
