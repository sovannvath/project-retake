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
  Edit,
  CreditCard,
  User,
  Calendar,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";

const OrderManagePage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [updating, setUpdating] = useState({});
  const router = useRouter();

  // Get filters from URL params
  useEffect(() => {
    const { status, payment } = router.query;
    if (status) setStatusFilter(status);
    if (payment) setPaymentFilter(payment);
  }, [router.query]);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter, paymentFilter]);

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
    if (!Array.isArray(orders)) {
      return;
    }
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.id.toString().includes(searchTerm) ||
          order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (order) => order.order_status === statusFilter,
      );
    }

    // Payment filter
    if (paymentFilter !== "all") {
      filtered = filtered.filter(
        (order) => order.payment_status === paymentFilter,
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdating({ ...updating, [`order_${orderId}`]: true });

    try {
      const response = await apiClient.updateOrderStatus(orderId, newStatus);
      if (response.success) {
        setOrders(
          orders.map((order) =>
            order.id === orderId
              ? { ...order, order_status: newStatus }
              : order,
          ),
        );
        toast.success("Order status updated successfully");
      } else {
        toast.error("Failed to update order status");
      }
    } catch (error) {
      console.error("Update order status error:", error);
      toast.error("Error updating order status");
    } finally {
      setUpdating({ ...updating, [`order_${orderId}`]: false });
    }
  };

  const updatePaymentStatus = async (orderId, newStatus) => {
    setUpdating({ ...updating, [`payment_${orderId}`]: true });

    try {
      const response = await apiClient.updatePaymentStatus(orderId, newStatus);
      if (response.success) {
        setOrders(
          orders.map((order) =>
            order.id === orderId
              ? { ...order, payment_status: newStatus }
              : order,
          ),
        );
        toast.success("Payment status updated successfully");
      } else {
        toast.error("Failed to update payment status");
      }
    } catch (error) {
      console.error("Update payment status error:", error);
      toast.error("Error updating payment status");
    } finally {
      setUpdating({ ...updating, [`payment_${orderId}`]: false });
    }
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
        return "border-l-4 border-red-500 bg-red-50";
      case "medium":
        return "border-l-4 border-yellow-500 bg-yellow-50";
      default:
        return "border-l-4 border-green-500 bg-white";
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Management
          </h1>
          <p className="text-gray-600">
            Process and manage customer orders efficiently
          </p>
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
                placeholder="Search orders, customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>

            {/* Order Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Order Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Payment Status Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Payment Statuses</option>
              <option value="pending">Payment Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Payment Failed</option>
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
            filteredOrders.map((order) => {
              const priority = getPriorityLevel(order);
              return (
                <div
                  key={order.id}
                  className={`rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 ${getPriorityColor(priority)}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(order.order_status)}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.id}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <User size={14} className="mr-1" />
                            {order.user?.name || "N/A"}
                          </div>
                          <div className="flex items-center">
                            <Calendar size={14} className="mr-1" />
                            {new Date(order.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <DollarSign size={14} className="mr-1" />$
                            {order.total}
                          </div>
                        </div>
                      </div>
                    </div>

                    {priority === "high" && (
                      <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">
                        High Priority
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Order Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Order Status
                      </label>
                      <div className="flex items-center space-x-2">
                        <select
                          value={order.order_status}
                          onChange={(e) =>
                            updateOrderStatus(order.id, e.target.value)
                          }
                          disabled={updating[`order_${order.id}`]}
                          className="input flex-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        {updating[`order_${order.id}`] && (
                          <div className="spinner"></div>
                        )}
                      </div>
                    </div>

                    {/* Payment Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Status
                      </label>
                      <div className="flex items-center space-x-2">
                        <select
                          value={order.payment_status}
                          onChange={(e) =>
                            updatePaymentStatus(order.id, e.target.value)
                          }
                          disabled={updating[`payment_${order.id}`]}
                          className="input flex-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="failed">Failed</option>
                        </select>
                        {updating[`payment_${order.id}`] && (
                          <div className="spinner"></div>
                        )}
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Customer Details
                      </label>
                      <div className="text-sm text-gray-900">
                        <p className="font-medium">
                          {order.user?.name || "N/A"}
                        </p>
                        <p className="text-gray-600">
                          {order.user?.email || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  {order.items && order.items.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Order Items:
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

                  {/* Notes */}
                  {order.notes && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Customer Notes:
                      </p>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                        {order.notes}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
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

                    <div className="flex space-x-2">
                      <button
                        onClick={() => router.push(`/orders/${order.id}`)}
                        className="flex items-center px-4 py-2 border border-[#3D52A0] text-[#3D52A0] rounded-lg hover:bg-[#3D52A0] hover:text-white transition-colors duration-200"
                      >
                        <Eye size={16} className="mr-2" />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-xl p-12 shadow-lg text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-[#EDE8F5] to-[#ADBBDA] rounded-full flex items-center justify-center mx-auto mb-6">
                <Package size={48} className="text-[#3D52A0]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                No orders found
              </h2>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all" || paymentFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "No orders available at the moment."}
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default OrderManagePage;
