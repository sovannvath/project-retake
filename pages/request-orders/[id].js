import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/layout/Layout";
import apiClient from "../../lib/api/client";
import {
  ClipboardList,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowLeft,
  User,
  Calendar,
  Package,
  FileText,
  Edit,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";

const RequestOrderDetailPage = () => {
  const [requestOrder, setRequestOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [userRole, setUserRole] = useState("customer"); // This should come from auth context
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetchRequestOrder();
    }
  }, [id]);

  const fetchRequestOrder = async () => {
    try {
      const response = await apiClient.getRequestOrder(id);
      if (response.success) {
        setRequestOrder(response.data);
      } else {
        toast.error("Request order not found");
        router.push("/request-orders");
      }
    } catch (error) {
      console.error("Request order detail error:", error);
      toast.error("Error loading request order");
      router.push("/request-orders");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminApproval = async (approved) => {
    setUpdating(true);

    try {
      const response = await apiClient.updateRequestOrderAdminApproval(
        id,
        approved,
      );
      if (response.success) {
        setRequestOrder({ ...requestOrder, admin_approved: approved });
        toast.success(`Request ${approved ? "approved" : "rejected"} by admin`);
      } else {
        toast.error("Failed to update approval status");
      }
    } catch (error) {
      console.error("Admin approval error:", error);
      toast.error("Error updating approval status");
    } finally {
      setUpdating(false);
    }
  };

  const handleWarehouseApproval = async (approved) => {
    setUpdating(true);

    try {
      const response = await apiClient.updateRequestOrderWarehouseApproval(
        id,
        approved,
      );
      if (response.success) {
        setRequestOrder({ ...requestOrder, warehouse_approved: approved });
        toast.success(
          `Request ${approved ? "approved" : "rejected"} by warehouse`,
        );
      } else {
        toast.error("Failed to update approval status");
      }
    } catch (error) {
      console.error("Warehouse approval error:", error);
      toast.error("Error updating approval status");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="text-green-500" size={24} />;
      case "pending":
        return <Clock className="text-yellow-500" size={24} />;
      case "rejected":
        return <AlertTriangle className="text-red-500" size={24} />;
      default:
        return <ClipboardList className="text-gray-500" size={24} />;
    }
  };

  const getStatusColor = (status) => {
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

  const getApprovalStatus = (order) => {
    if (!order.admin_approved) return "Pending Admin Approval";
    if (order.admin_approved && !order.warehouse_approved)
      return "Pending Warehouse Approval";
    if (order.admin_approved && order.warehouse_approved)
      return "Fully Approved";
    return "Under Review";
  };

  const getApprovalTimeline = (order) => {
    const timeline = [
      {
        step: "Request Created",
        date: order.created_at,
        completed: true,
        icon: ClipboardList,
        user: order.requested_by,
      },
      {
        step: "Admin Review",
        date: order.admin_approved ? order.admin_approved_at : null,
        completed: order.admin_approved !== null,
        icon: User,
        user: order.admin_approved_by,
      },
      {
        step: "Warehouse Review",
        date: order.warehouse_approved ? order.warehouse_approved_at : null,
        completed: order.warehouse_approved !== null,
        icon: Package,
        user: order.warehouse_approved_by,
      },
      {
        step: "Request Completed",
        date:
          order.admin_approved && order.warehouse_approved
            ? order.warehouse_approved_at
            : null,
        completed: order.admin_approved && order.warehouse_approved,
        icon: CheckCircle,
        user: null,
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

  if (!requestOrder) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Request order not found
          </h2>
          <button
            onClick={() => router.push("/request-orders")}
            className="btn-primary"
          >
            Back to Request Orders
          </button>
        </div>
      </Layout>
    );
  }

  const timeline = getApprovalTimeline(requestOrder);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <button
              onClick={() => router.push("/request-orders")}
              className="hover:text-[#3D52A0] transition-colors duration-200"
            >
              Request Orders
            </button>
            <span>/</span>
            <span className="text-gray-900 font-medium">
              Request #{requestOrder.id}
            </span>
          </div>
        </div>

        {/* Request Header */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              {getStatusIcon(requestOrder.status)}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Request #{requestOrder.id}
                </h1>
                <p className="text-gray-600">
                  Created on{" "}
                  {new Date(requestOrder.created_at).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(requestOrder.status)}`}
              >
                {requestOrder.status?.charAt(0).toUpperCase() +
                  requestOrder.status?.slice(1)}
              </span>
            </div>
          </div>

          {/* Request Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <User size={20} className="text-[#3D52A0] mr-2" />
                <h3 className="font-semibold text-gray-900">Requested By</h3>
              </div>
              <p className="text-lg font-medium text-gray-900">
                {requestOrder.requested_by || "N/A"}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Package size={20} className="text-[#3D52A0] mr-2" />
                <h3 className="font-semibold text-gray-900">Total Items</h3>
              </div>
              <p className="text-lg font-medium text-gray-900">
                {requestOrder.items?.length || 0} item(s)
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Calendar size={20} className="text-[#3D52A0] mr-2" />
                <h3 className="font-semibold text-gray-900">Status</h3>
              </div>
              <p className="text-lg font-medium text-gray-900">
                {getApprovalStatus(requestOrder)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Request Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Approval Timeline */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Approval Timeline
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
                          {step.step}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          {step.date && (
                            <span>
                              {new Date(step.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                          {step.user && (
                            <>
                              <span>•</span>
                              <span>by {step.user}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {step.completed && (
                        <CheckCircle size={20} className="text-green-500" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Request Items */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Requested Items
              </h2>

              {requestOrder.items && requestOrder.items.length > 0 ? (
                <div className="space-y-4">
                  {requestOrder.items.map((item, index) => (
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
                            Requested Quantity: {item.quantity}
                          </span>
                          <span className="text-sm text-gray-600">
                            Available Stock: {item.product?.quantity || 0}
                          </span>
                        </div>
                        {item.notes && (
                          <p className="text-sm text-gray-600 mt-1">
                            Notes: {item.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">
                  No items found for this request.
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Request Description */}
            {requestOrder.description && (
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Description
                </h3>
                <div className="flex items-start space-x-3">
                  <FileText size={16} className="text-gray-400 mt-1" />
                  <p className="text-gray-900">{requestOrder.description}</p>
                </div>
              </div>
            )}

            {/* Approval Actions */}
            {(userRole === "admin" || userRole === "warehouse") && (
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Approval Actions
                </h3>

                {userRole === "admin" && !requestOrder.admin_approved && (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Admin approval required
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAdminApproval(true)}
                        disabled={updating}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors duration-200"
                      >
                        {updating ? "Processing..." : "Approve"}
                      </button>
                      <button
                        onClick={() => handleAdminApproval(false)}
                        disabled={updating}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors duration-200"
                      >
                        {updating ? "Processing..." : "Reject"}
                      </button>
                    </div>
                  </div>
                )}

                {userRole === "warehouse" &&
                  requestOrder.admin_approved &&
                  !requestOrder.warehouse_approved && (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        Warehouse approval required
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleWarehouseApproval(true)}
                          disabled={updating}
                          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors duration-200"
                        >
                          {updating ? "Processing..." : "Approve"}
                        </button>
                        <button
                          onClick={() => handleWarehouseApproval(false)}
                          disabled={updating}
                          className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors duration-200"
                        >
                          {updating ? "Processing..." : "Reject"}
                        </button>
                      </div>
                    </div>
                  )}

                {((userRole === "admin" && requestOrder.admin_approved) ||
                  (userRole === "warehouse" &&
                    requestOrder.warehouse_approved)) && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle size={16} />
                    <span className="text-sm">Already approved by you</span>
                  </div>
                )}
              </div>
            )}

            {/* Request Status */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Request Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Admin Approval</span>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-3 h-3 rounded-full ${requestOrder.admin_approved ? "bg-green-500" : "bg-yellow-500"}`}
                    ></div>
                    <span className="text-sm font-medium">
                      {requestOrder.admin_approved ? "Approved" : "Pending"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Warehouse Approval
                  </span>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-3 h-3 rounded-full ${requestOrder.warehouse_approved ? "bg-green-500" : "bg-yellow-500"}`}
                    ></div>
                    <span className="text-sm font-medium">
                      {requestOrder.warehouse_approved ? "Approved" : "Pending"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push("/request-orders")}
                  className="w-full flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Requests
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RequestOrderDetailPage;
