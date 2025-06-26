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
  ArrowLeft,
  User,
  Calendar,
  DollarSign,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

const OrderDetailPage = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await apiClient.getOrder(id);
      if (response.success) {
        setOrder(response.data);
      } else {
        toast.error("Order not found");
        router.push("/orders");
      }
    } catch (error) {
      console.error("Order detail error:", error);
      toast.error("Error loading order");
      router.push("/orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="text-green-500" size={24} />;
      case "processing":
        return <Clock className="text-yellow-500" size={24} />;
      case "shipped":
        return <Truck className="text-blue-500" size={24} />;
      case "cancelled":
        return <AlertCircle className="text-red-500" size={24} />;
      default:
        return <Package className="text-gray-500" size={24} />;
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

  const getOrderTimeline = (order) => {
    const timeline = [
      {
        status: "Order Placed",
        date: order.created_at,
        completed: true,
        icon: Package,
      },
      {
        status: "Payment Confirmed",
        date: order.payment_status === "paid" ? order.updated_at : null,
        completed: order.payment_status === "paid",
        icon: CreditCard,
      },
      {
        status: "Processing",
        date: ["processing", "shipped", "completed"].includes(
          order.order_status,
        )
          ? order.updated_at
          : null,
        completed: ["processing", "shipped", "completed"].includes(
          order.order_status,
        ),
        icon: Clock,
      },
      {
        status: "Shipped",
        date: ["shipped", "completed"].includes(order.order_status)
          ? order.updated_at
          : null,
        completed: ["shipped", "completed"].includes(order.order_status),
        icon: Truck,
      },
      {
        status: "Delivered",
        date: order.order_status === "completed" ? order.updated_at : null,
        completed: order.order_status === "completed",
        icon: CheckCircle,
      },
    ];

    return timeline;
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

  if (!order) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Order not found
          </h2>
          <button
            onClick={() => router.push("/orders")}
            className="btn-primary"
          >
            Back to Orders
          </button>
        </div>
      </Layout>
    );
  }

  const timeline = getOrderTimeline(order);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <button
              onClick={() => router.push("/orders")}
              className="hover:text-[#3D52A0] transition-colors duration-200"
            >
              Orders
            </button>
            <span>/</span>
            <span className="text-gray-900 font-medium">Order #{order.id}</span>
          </div>
        </div>

        {/* Order Header */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              {getStatusIcon(order.order_status)}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Order #{order.id}
                </h1>
                <p className="text-gray-600">
                  Placed on{" "}
                  {new Date(order.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.order_status)}`}
              >
                {order.order_status?.charAt(0).toUpperCase() +
                  order.order_status?.slice(1)}
              </span>
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${getPaymentStatusColor(order.payment_status)}`}
              >
                Payment:{" "}
                {order.payment_status?.charAt(0).toUpperCase() +
                  order.payment_status?.slice(1)}
              </span>
            </div>
          </div>

          {/* Order Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <DollarSign size={20} className="text-[#3D52A0] mr-2" />
                <h3 className="font-semibold text-gray-900">Total Amount</h3>
              </div>
              <p className="text-2xl font-bold text-[#3D52A0]">
                ${order.total}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Package size={20} className="text-[#3D52A0] mr-2" />
                <h3 className="font-semibold text-gray-900">Items</h3>
              </div>
              <p className="text-xl font-bold text-gray-900">
                {order.items?.length || 0} item(s)
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <CreditCard size={20} className="text-[#3D52A0] mr-2" />
                <h3 className="font-semibold text-gray-900">Payment Method</h3>
              </div>
              <p className="text-lg font-medium text-gray-900">
                {order.payment_method?.name || "N/A"}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Calendar size={20} className="text-[#3D52A0] mr-2" />
                <h3 className="font-semibold text-gray-900">Last Updated</h3>
              </div>
              <p className="text-sm text-gray-600">
                {new Date(order.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timeline */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Order Timeline
              </h2>

              <div className="space-y-4">
                {timeline.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={index} className="flex items-center space-x-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          step.completed
                            ? "bg-[#3D52A0] text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        <Icon size={20} />
                      </div>

                      <div className="flex-1">
                        <h3
                          className={`font-medium ${step.completed ? "text-gray-900" : "text-gray-500"}`}
                        >
                          {step.status}
                        </h3>
                        {step.date && (
                          <p className="text-sm text-gray-600">
                            {new Date(step.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        )}
                      </div>

                      {step.completed && (
                        <CheckCircle size={20} className="text-green-500" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Order Items
              </h2>

              {order.items && order.items.length > 0 ? (
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-[#EDE8F5] to-[#ADBBDA] rounded-lg flex items-center justify-center flex-shrink-0">
                        <div className="text-xl text-[#3D52A0] opacity-50">
                          📦
                        </div>
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {item.product?.name || "Product"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {item.product?.description ||
                            "No description available"}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-gray-600">
                            Quantity: {item.quantity}
                          </span>
                          <span className="text-sm text-gray-600">
                            Unit Price: ${item.price}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-bold text-[#3D52A0]">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Order Total */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span className="text-gray-900">Order Total:</span>
                      <span className="text-[#3D52A0]">${order.total}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">No items found for this order.</p>
              )}
            </div>
          </div>

          {/* Order Details Sidebar */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Customer Information
              </h3>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <User size={16} className="text-gray-400" />
                  <span className="text-gray-900">
                    {order.user?.name || "N/A"}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail size={16} className="text-gray-400" />
                  <span className="text-gray-900">
                    {order.user?.email || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Notes */}
            {order.notes && (
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Notes
                </h3>
                <div className="flex items-start space-x-3">
                  <FileText size={16} className="text-gray-400 mt-1" />
                  <p className="text-gray-900">{order.notes}</p>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>

              <div className="space-y-3">
                {order.order_status === "completed" && (
                  <button className="w-full btn-primary">Reorder Items</button>
                )}

                {order.order_status === "shipped" && (
                  <button className="w-full px-4 py-2 border border-[#3D52A0] text-[#3D52A0] rounded-lg hover:bg-[#3D52A0] hover:text-white transition-colors duration-200">
                    Track Package
                  </button>
                )}

                <button
                  onClick={() => router.push("/orders")}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Back to Orders
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderDetailPage;
