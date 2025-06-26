import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/layout/Layout";
import apiClient from "../../lib/api/client";
import {
  ClipboardList,
  Plus,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  User,
  Calendar,
  Package,
} from "lucide-react";
import { toast } from "sonner";

const RequestOrdersPage = () => {
  const [requestOrders, setRequestOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    items: [{ product_id: "", quantity: "", notes: "" }],
  });
  const [products, setProducts] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchRequestOrders();
    fetchProducts();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [requestOrders, searchTerm, statusFilter, approvalFilter]);

  const fetchRequestOrders = async () => {
    try {
      const response = await apiClient.getRequestOrders();
      if (response.success) {
        setRequestOrders(response.data);
        setFilteredOrders(response.data);
      } else {
        toast.error("Failed to load request orders");
      }
    } catch (error) {
      console.error("Request orders error:", error);
      toast.error("Error loading request orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await apiClient.getProducts();
      if (response.success) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error("Products error:", error);
    }
  };

  const filterOrders = () => {
    let filtered = [...requestOrders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.id.toString().includes(searchTerm) ||
          order.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.requested_by?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Approval filter
    if (approvalFilter !== "all") {
      if (approvalFilter === "admin-pending") {
        filtered = filtered.filter((order) => !order.admin_approved);
      } else if (approvalFilter === "warehouse-pending") {
        filtered = filtered.filter(
          (order) => order.admin_approved && !order.warehouse_approved,
        );
      }
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    setFilteredOrders(filtered);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="text-green-500" size={20} />;
      case "pending":
        return <Clock className="text-yellow-500" size={20} />;
      case "rejected":
        return <AlertTriangle className="text-red-500" size={20} />;
      default:
        return <ClipboardList className="text-gray-500" size={20} />;
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

  const handleCreateRequest = async (e) => {
    e.preventDefault();

    try {
      const response = await apiClient.createRequestOrder(formData);
      if (response.success) {
        toast.success("Request order created successfully");
        fetchRequestOrders();
        setShowCreateModal(false);
        setFormData({
          description: "",
          items: [{ product_id: "", quantity: "", notes: "" }],
        });
      } else {
        toast.error("Failed to create request order");
      }
    } catch (error) {
      console.error("Create request error:", error);
      toast.error("Error creating request order");
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product_id: "", quantity: "", notes: "" }],
    });
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData({
        ...formData,
        items: formData.items.filter((_, i) => i !== index),
      });
    }
  };

  const updateItem = (index, field, value) => {
    const updatedItems = formData.items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    );
    setFormData({ ...formData, items: updatedItems });
  };

  const CreateRequestModal = () => {
    if (!showCreateModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Create Request Order
          </h3>

          <form onSubmit={handleCreateRequest} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="input w-full resize-none"
                placeholder="Describe the purpose of this request..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requested Items
              </label>
              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg"
                  >
                    <select
                      value={item.product_id}
                      onChange={(e) =>
                        updateItem(index, "product_id", e.target.value)
                      }
                      className="input flex-1"
                      required
                    >
                      <option value="">Select Product</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} (Stock: {product.quantity})
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, "quantity", e.target.value)
                      }
                      placeholder="Qty"
                      className="input w-20"
                      min="1"
                      required
                    />

                    <input
                      type="text"
                      value={item.notes}
                      onChange={(e) =>
                        updateItem(index, "notes", e.target.value)
                      }
                      placeholder="Notes (optional)"
                      className="input flex-1"
                    />

                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <AlertTriangle size={16} />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center px-3 py-2 text-[#3D52A0] border border-[#3D52A0] rounded-lg hover:bg-[#3D52A0] hover:text-white transition-colors duration-200"
                >
                  <Plus size={16} className="mr-2" />
                  Add Item
                </button>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button type="submit" className="flex-1 btn-primary">
                Create Request
              </button>
            </div>
          </form>
        </div>
      </div>
    );
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Request Orders
              </h1>
              <p className="text-gray-600">
                Manage inventory requests and approvals
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center"
            >
              <Plus size={20} className="mr-2" />
              Create Request
            </button>
          </div>
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
                placeholder="Search requests..."
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
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Approval Filter */}
            <select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Approvals</option>
              <option value="admin-pending">Admin Pending</option>
              <option value="warehouse-pending">Warehouse Pending</option>
            </select>

            {/* Results Count */}
            <div className="flex items-center justify-center bg-gray-50 rounded-lg px-4 py-2">
              <span className="text-sm text-gray-600">
                {filteredOrders.length} requests found
              </span>
            </div>
          </div>
        </div>

        {/* Request Orders List */}
        <div className="space-y-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(order.status)}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Request #{order.id}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <User size={14} className="mr-1" />
                          {order.requested_by || "N/A"}
                        </div>
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-1" />
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Package size={14} className="mr-1" />
                          {order.items?.length || 0} items
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                    >
                      {order.status?.charAt(0).toUpperCase() +
                        order.status?.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Request Description */}
                {order.description && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Description:
                    </p>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {order.description}
                    </p>
                  </div>
                )}

                {/* Approval Status */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Approval Status:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-3 h-3 rounded-full ${order.admin_approved ? "bg-green-500" : "bg-yellow-500"}`}
                      ></div>
                      <span className="text-sm text-gray-900">
                        Admin: {order.admin_approved ? "Approved" : "Pending"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-3 h-3 rounded-full ${order.warehouse_approved ? "bg-green-500" : "bg-yellow-500"}`}
                      ></div>
                      <span className="text-sm text-gray-900">
                        Warehouse:{" "}
                        {order.warehouse_approved ? "Approved" : "Pending"}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Overall Status: {getApprovalStatus(order)}
                  </p>
                </div>

                {/* Request Items Preview */}
                {order.items && order.items.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Requested Items:
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
                              Qty: {item.quantity}
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
                    <span className="text-sm text-gray-600">
                      Status: {getApprovalStatus(order)}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => router.push(`/request-orders/${order.id}`)}
                      className="flex items-center px-4 py-2 border border-[#3D52A0] text-[#3D52A0] rounded-lg hover:bg-[#3D52A0] hover:text-white transition-colors duration-200"
                    >
                      <Eye size={16} className="mr-2" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl p-12 shadow-lg text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-[#EDE8F5] to-[#ADBBDA] rounded-full flex items-center justify-center mx-auto mb-6">
                <ClipboardList size={48} className="text-[#3D52A0]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                No request orders found
              </h2>
              <p className="text-gray-600 mb-8">
                {searchTerm ||
                statusFilter !== "all" ||
                approvalFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by creating your first request order."}
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary inline-flex items-center"
              >
                <Plus size={20} className="mr-2" />
                Create First Request
              </button>
            </div>
          )}
        </div>

        {/* Create Request Modal */}
        <CreateRequestModal />
      </div>
    </Layout>
  );
};

export default RequestOrdersPage;
