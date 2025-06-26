import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/layout/Layout";
import apiClient from "../../lib/api/client";
import {
  Package,
  Truck,
  ClipboardList,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Eye,
  Archive,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";

const WarehouseDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await apiClient.getWarehouseDashboard();
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

  const getRequestStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="text-green-500" size={16} />;
      case "pending":
        return <Clock className="text-yellow-500" size={16} />;
      case "rejected":
        return <AlertTriangle className="text-red-500" size={16} />;
      default:
        return <ClipboardList className="text-gray-500" size={16} />;
    }
  };

  const getRequestStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
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
          <h1 className="text-3xl font-bold mb-2">Warehouse Dashboard</h1>
          <p className="text-blue-100">
            Manage inventory, fulfill orders, and track warehouse operations
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Inventory
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {dashboardData?.total_inventory || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Package size={24} className="text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <Archive size={16} className="text-gray-500 mr-1" />
              <span className="text-sm text-gray-600">
                {dashboardData?.unique_products || 0} unique products
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Low Stock Items
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {dashboardData?.low_stock_items || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <AlertTriangle size={24} className="text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingDown size={16} className="text-red-500 mr-1" />
              <span className="text-sm text-red-600">Needs attention</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Requests
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {dashboardData?.pending_requests || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <ClipboardList size={24} className="text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <Clock size={16} className="text-orange-500 mr-1" />
              <span className="text-sm text-orange-600">Awaiting approval</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Orders to Fulfill
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {dashboardData?.orders_to_fulfill || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Truck size={24} className="text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp size={16} className="text-green-500 mr-1" />
              <span className="text-sm text-green-600">Ready to ship</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Request Orders */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Recent Request Orders
              </h2>
              <button
                onClick={() => router.push("/request-orders")}
                className="text-sm text-[#3D52A0] hover:text-[#2A3A7C] font-medium"
              >
                View All →
              </button>
            </div>

            {dashboardData?.recent_request_orders?.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recent_request_orders.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      {getRequestStatusIcon(request.status)}
                      <div>
                        <p className="font-medium text-gray-900">
                          Request #{request.id}
                        </p>
                        <p className="text-sm text-gray-600">
                          {request.requested_by} •{" "}
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {request.items_count} items
                        </p>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getRequestStatusColor(request.status)}`}
                        >
                          {request.status?.charAt(0).toUpperCase() +
                            request.status?.slice(1)}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          router.push(`/request-orders/${request.id}`)
                        }
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
                <ClipboardList
                  size={48}
                  className="text-gray-300 mx-auto mb-4"
                />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No recent requests
                </h3>
                <p className="text-gray-600">Request orders will appear here</p>
              </div>
            )}
          </div>

          {/* Quick Actions & Inventory Alerts */}
          <div className="space-y-6">
            {/* Inventory Alerts */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Inventory Alerts
              </h3>
              <div className="space-y-3">
                {dashboardData?.low_stock_items > 0 && (
                  <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertTriangle size={16} className="text-yellow-600 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-800">
                        Low Stock Alert
                      </p>
                      <p className="text-xs text-yellow-700">
                        {dashboardData.low_stock_items} products need restocking
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

                {dashboardData?.out_of_stock_items > 0 && (
                  <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle size={16} className="text-red-600 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800">
                        Out of Stock
                      </p>
                      <p className="text-xs text-red-700">
                        {dashboardData.out_of_stock_items} products are out of
                        stock
                      </p>
                      <button
                        onClick={() =>
                          router.push("/products/manage?filter=out-of-stock")
                        }
                        className="text-xs text-red-800 underline mt-1"
                      >
                        View Products →
                      </button>
                    </div>
                  </div>
                )}

                {!dashboardData?.low_stock_items &&
                  !dashboardData?.out_of_stock_items && (
                    <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle size={16} className="text-green-600 mt-1" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-800">
                          Inventory Healthy
                        </p>
                        <p className="text-xs text-green-700">
                          All products are adequately stocked
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
                  onClick={() => router.push("/request-orders")}
                  className="w-full flex items-center px-4 py-3 bg-[#3D52A0] text-white rounded-lg hover:bg-[#2A3A7C] transition-colors duration-200"
                >
                  <ClipboardList size={20} className="mr-3" />
                  View Requests
                </button>

                <button
                  onClick={() => router.push("/products/manage")}
                  className="w-full flex items-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <Package size={20} className="mr-3" />
                  Manage Inventory
                </button>

                <button
                  onClick={() =>
                    router.push("/orders/manage?status=processing")
                  }
                  className="w-full flex items-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <Truck size={20} className="mr-3" />
                  Fulfill Orders
                </button>
              </div>
            </div>

            {/* Warehouse Summary */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Warehouse Summary
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Storage Utilization
                  </span>
                  <span className="font-bold text-gray-900">
                    {dashboardData?.storage_utilization || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#3D52A0] h-2 rounded-full"
                    style={{
                      width: `${dashboardData?.storage_utilization || 0}%`,
                    }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Requests</span>
                  <span className="font-bold text-gray-900">
                    {dashboardData?.active_requests || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completed Today</span>
                  <span className="font-bold text-gray-900">
                    {dashboardData?.completed_today || 0}
                  </span>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      Efficiency Rate
                    </span>
                    <div className="flex items-center">
                      <TrendingUp size={16} className="text-green-500 mr-1" />
                      <span className="text-sm font-bold text-green-600">
                        {dashboardData?.efficiency_rate || 0}%
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

export default WarehouseDashboard;
