import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/layout/Layout";
import apiClient from "../../lib/api/client";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Search,
  Filter,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const router = useRouter();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter, dateFilter]);

  const fetchOrders = async () => {
    try {
      const response = await apiClient.getOrders();
      if (response.success) {
        setOrders(response.data);
        setFilteredOrders(response.data);
      } else {
        toast.error("Failed to load orders");
      }
    } catch (error) {
      console.error("Orders error:", error);
      toast.error("Error loading orders");
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.id.toString().includes(searchTerm) ||
          order.notes?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (order) => order.order_status === statusFilter,
      );
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const filterDate = new Date();

      switch (dateFilter) {
        case "week":
          filterDate.setDate(now.getDate() - 7);
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case "year":
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      if (dateFilter !== "all") {
        filtered = filtered.filter(
          (order) => new Date(order.created_at) >= filterDate,
        );
      }
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    setFilteredOrders(filtered);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="text-green-500" size={20} />;
      case "processing":
        return <Clock className="text-yellow-500" size={20} />;
      case "shipped":
        return <Truck className="text-blue-500" size={20} />;
      case "cancelled":
        return <AlertCircle className="text-red-500" size={20} />;
      default:
        return <Package className="text-gray-500" size={20} />;
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
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
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
        {/* Header */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your order history</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Time</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </select>

            {/* Results Count */}
            <div className="flex items-center justify-center bg-gray-50 rounded-lg px-4 py-2">
              <span className="text-sm text-gray-600">
                {filteredOrders.length} orders found
              </span>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(order.order_status)}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.id}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Placed on{" "}
                        {new Date(order.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}`}
                    >
                      {order.order_status?.charAt(0).toUpperCase() +
                        order.order_status?.slice(1)}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}
                    >
                      Payment:{" "}
                      {order.payment_status?.charAt(0).toUpperCase() +
                        order.payment_status?.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                    <p className="text-xl font-bold text-[#3D52A0]">
                      ${order.total}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Items</p>
                    <p className="font-medium text-gray-900">
                      {order.items?.length || 0} item(s)
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                    <p className="font-medium text-gray-900">
                      {order.payment_method?.name || "N/A"}
                    </p>
                  </div>
                </div>

                {order.notes && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Notes</p>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {order.notes}
                    </p>
                  </div>
                )}

                {/* Order Items Preview */}
                {order.items && order.items.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Items in this order:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg"
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-[#EDE8F5] to-[#ADBBDA] rounded flex items-center justify-center flex-shrink-0">
                            <div className="text-xs text-[#3D52A0] opacity-50">
                              📦
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.product?.name || "Product"}
                            </p>
                            <p className="text-xs text-gray-600">
                              Qty: {item.quantity} × ${item.price}
                            </p>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="flex items-center justify-center bg-gray-50 p-2 rounded-lg">
                          <span className="text-sm text-gray-600">
                            +{order.items.length - 3} more items
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    {order.order_status === "shipped" && (
                      <div className="flex items-center text-blue-600">
                        <Truck size={16} className="mr-1" />
                        <span className="text-sm">Tracking available</span>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => router.push(`/orders/${order.id}`)}
                      className="flex items-center px-4 py-2 border border-[#3D52A0] text-[#3D52A0] rounded-lg hover:bg-[#3D52A0] hover:text-white transition-colors duration-200"
                    >
                      <Eye size={16} className="mr-2" />
                      View Details
                    </button>

                    {order.order_status === "completed" && (
                      <button className="btn-primary">Reorder</button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl p-12 shadow-lg text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-[#EDE8F5] to-[#ADBBDA] rounded-full flex items-center justify-center mx-auto mb-6">
                <Package size={48} className="text-[#3D52A0]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                No orders found
              </h2>
              <p className="text-gray-600 mb-8">
                {searchTerm || statusFilter !== "all" || dateFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "You haven't placed any orders yet. Start shopping to see your orders here."}
              </p>
              <button
                onClick={() => router.push("/products")}
                className="btn-primary inline-flex items-center"
              >
                <Package size={20} className="mr-2" />
                Start Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default OrdersPage;
