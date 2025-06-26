import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/layout/Layout";
import apiClient from "../../lib/api/client";
import {
  ShoppingCart,
  Package,
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle,
  Eye,
  Plus,
  Bell,
  Heart,
  Star,
} from "lucide-react";
import { toast } from "sonner";

const CustomerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await apiClient.getCustomerDashboard();
      if (response.success) {
        setDashboardData(response.data);
        setRecentOrders(response.data.recent_orders || []);
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="text-green-500" size={16} />;
      case "processing":
        return <Clock className="text-yellow-500" size={16} />;
      case "shipped":
        return <Package className="text-blue-500" size={16} />;
      default:
        return <Package className="text-gray-500" size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
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
          <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
          <p className="text-blue-100">
            Here's your shopping overview and recent activity
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <Package size={24} className="text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp size={16} className="text-green-500 mr-1" />
              <span className="text-sm text-green-600">
                +12% from last month
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${dashboardData?.total_spent || "0.00"}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CreditCard size={24} className="text-green-600" />
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
                <p className="text-sm font-medium text-gray-600">Cart Items</p>
                <p className="text-3xl font-bold text-gray-900">
                  {dashboardData?.cart_items || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <ShoppingCart size={24} className="text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => router.push("/cart")}
                className="text-sm text-purple-600 hover:text-purple-800 font-medium"
              >
                View Cart →
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Saved Items</p>
                <p className="text-3xl font-bold text-gray-900">
                  {dashboardData?.saved_items || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Heart size={24} className="text-red-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-gray-600">Wishlist items</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
              <button
                onClick={() => router.push("/orders")}
                className="text-sm text-[#3D52A0] hover:text-[#2A3A7C] font-medium"
              >
                View All →
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
                      {getStatusIcon(order.order_status)}
                      <div>
                        <p className="font-medium text-gray-900">
                          Order #{order.id}
                        </p>
                        <p className="text-sm text-gray-600">
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
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}`}
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
                <Package size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No recent orders
                </h3>
                <p className="text-gray-600 mb-4">
                  Start shopping to see your orders here
                </p>
                <button
                  onClick={() => router.push("/products")}
                  className="btn-primary inline-flex items-center"
                >
                  <Plus size={16} className="mr-2" />
                  Start Shopping
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions & Notifications */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push("/products")}
                  className="w-full flex items-center px-4 py-3 bg-[#3D52A0] text-white rounded-lg hover:bg-[#2A3A7C] transition-colors duration-200"
                >
                  <Package size={20} className="mr-3" />
                  Browse Products
                </button>

                <button
                  onClick={() => router.push("/cart")}
                  className="w-full flex items-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <ShoppingCart size={20} className="mr-3" />
                  View Cart
                </button>

                <button
                  onClick={() => router.push("/orders")}
                  className="w-full flex items-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <Eye size={20} className="mr-3" />
                  Order History
                </button>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Notifications
                </h3>
                <button
                  onClick={() => router.push("/notifications")}
                  className="text-sm text-[#3D52A0] hover:text-[#2A3A7C] font-medium"
                >
                  View All →
                </button>
              </div>

              <div className="space-y-3">
                {dashboardData?.notifications
                  ?.slice(0, 3)
                  .map((notification, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <Bell size={16} className="text-[#3D52A0] mt-1" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-600">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  )) || (
                  <p className="text-sm text-gray-600">No new notifications</p>
                )}
              </div>
            </div>

            {/* Recommended Products */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Recommended for You
              </h3>
              <div className="space-y-3">
                {dashboardData?.recommended_products
                  ?.slice(0, 2)
                  .map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-[#EDE8F5] to-[#ADBBDA] rounded-lg flex items-center justify-center">
                        <div className="text-lg text-[#3D52A0] opacity-50">
                          📦
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {product.name}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-[#3D52A0]">
                            ${product.price}
                          </span>
                          <div className="flex items-center">
                            <Star
                              size={12}
                              className="text-yellow-400 fill-current"
                            />
                            <span className="text-xs text-gray-600 ml-1">
                              4.5
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )) || (
                  <p className="text-sm text-gray-600">
                    No recommendations available
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CustomerDashboard;
