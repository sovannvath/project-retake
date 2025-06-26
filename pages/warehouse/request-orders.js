import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/layout/Layout';
import apiClient from '../../lib/api/client';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Eye,
  Search,
  Filter,
  User,
  Package,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

const WarehouseRequestOrdersPage = () => {
  const [requestOrders, setRequestOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [adminStatusFilter, setAdminStatusFilter] = useState('all');
  const [updating, setUpdating] = useState({});
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState('');
  const router = useRouter();

  // Get filters from URL params
  useEffect(() => {
    const { status } = router.query;
    if (status) setStatusFilter(status);
  }, [router.query]);

  useEffect(() => {
    fetchRequestOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [requestOrders, searchTerm, statusFilter, adminStatusFilter]);

  const fetchRequestOrders = async () => {
    try {
      const response = await apiClient.getRequestOrders();
      if (response.success) {
        setRequestOrders(response.data);
        setFilteredOrders(response.data);
      } else {
        toast.error('Failed to load request orders');
      }
    } catch (error) {
      console.error('Request orders error:', error);
      toast.error('Error loading request orders');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...requestOrders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toString().includes(searchTerm) ||
        order.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Warehouse status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.warehouse_approval_status === statusFilter);
    }

    // Admin status filter
    if (adminStatusFilter !== 'all') {
      filtered = filtered.filter(order => order.admin_approval_status === adminStatusFilter);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    setFilteredOrders(filtered);
  };

  const handleApproval = (request, action) => {
    setSelectedRequest(request);
    setApprovalAction(action);
    setApprovalNotes('');
    setShowApprovalModal(true);
  };

  const submitApproval = async () => {
    if (!selectedRequest || !approvalAction) return;

    setUpdating({ ...updating, [selectedRequest.id]: true });
    
    try {
      const response = await apiClient.warehouseApproval(selectedRequest.id, {
        warehouse_approval_status: approvalAction,
        warehouse_notes: approvalNotes
      });
      
      if (response.success) {
        setRequestOrders(requestOrders.map(order => 
          order.id === selectedRequest.id 
            ? { 
                ...order, 
                warehouse_approval_status: approvalAction,
                warehouse_notes: approvalNotes 
              } 
            : order
        ));
        toast.success(`Request ${approvalAction} successfully`);
        setShowApprovalModal(false);
      } else {
        toast.error(`Failed to ${approvalAction} request`);
      }
    } catch (error) {
      console.error('Approval error:', error);
      toast.error(`Error ${approvalAction}ing request`);
    } finally {
      setUpdating({ ...updating, [selectedRequest.id]: false });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'rejected':
        return <XCircle className="text-red-500" size={20} />;
      case 'pending':
        return <Clock className="text-yellow-500" size={20} />;
      default:
        return <AlertCircle className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLevel = (request) => {
    const daysSinceRequest = Math.floor((new Date() - new Date(request.created_at)) / (1000 * 60 * 60 * 24));
    
    if (request.admin_approval_status === 'approved' && request.warehouse_approval_status === 'pending') {
      if (daysSinceRequest > 2) return 'high';
      if (daysSinceRequest > 1) return 'medium';
    }
    return 'low';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-red-500 bg-red-50';
      case 'medium':
        return 'border-l-4 border-yellow-500 bg-yellow-50';
      default:
        return 'border-l-4 border-green-500 bg-white';
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Request Orders</h1>
          <p className="text-gray-600">Review and approve inventory requests from admin</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>

            {/* Warehouse Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Warehouse Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Admin Status Filter */}
            <select
              value={adminStatusFilter}
              onChange={(e) => setAdminStatusFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Admin Status</option>
              <option value="pending">Admin Pending</option>
              <option value="approved">Admin Approved</option>
              <option value="rejected">Admin Rejected</option>
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
            filteredOrders.map((request) => {
              const priority = getPriorityLevel(request);
              return (
                <div 
                  key={request.id} 
                  className={`rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 ${getPriorityColor(priority)}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(request.warehouse_approval_status)}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Request #{request.id}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <User size={14} className="mr-1" />
                            {request.user?.name || 'N/A'}
                          </div>
                          <div className="flex items-center">
                            <Calendar size={14} className="mr-1" />
                            {new Date(request.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {priority === 'high' && (
                        <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">
                          High Priority
                        </div>
                      )}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.admin_approval_status)}`}>
                        Admin: {request.admin_approval_status?.charAt(0).toUpperCase() + request.admin_approval_status?.slice(1)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.warehouse_approval_status)}`}>
                        Warehouse: {request.warehouse_approval_status?.charAt(0).toUpperCase() + request.warehouse_approval_status?.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Product Info */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Details
                      </label>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#EDE8F5] to-[#ADBBDA] rounded-lg flex items-center justify-center">
                          <Package size={20} className="text-[#3D52A0]" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {request.product?.name || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-600">
                            Current Stock: {request.product?.quantity || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Request Details */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Request Details
                      </label>
                      <div>
                        <p className="text-lg font-bold text-[#3D52A0]">
                          Quantity: {request.quantity}
                        </p>
                        <p className="text-sm text-gray-600">
                          Requested by: {request.user?.name || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Status Timeline */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Approval Status
                      </label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(request.admin_approval_status)}
                          <span className="text-sm text-gray-900">
                            Admin: {request.admin_approval_status?.charAt(0).toUpperCase() + request.admin_approval_status?.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(request.warehouse_approval_status)}
                          <span className="text-sm text-gray-900">
                            Warehouse: {request.warehouse_approval_status?.charAt(0).toUpperCase() + request.warehouse_approval_status?.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {(request.admin_notes || request.warehouse_notes) && (
                    <div className="mb-4 space-y-2">
                      {request.admin_notes && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Admin Notes:</p>
                          <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                            {request.admin_notes}
                          </p>
                        </div>
                      )}
                      {request.warehouse_notes && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Warehouse Notes:</p>
                          <p className="text-sm text-gray-900 bg-blue-50 p-3 rounded-lg">
                            {request.warehouse_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        Created: {new Date(request.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => router.push(`/warehouse/request-orders/${request.id}`)}
                        className="flex items-center px-4 py-2 border border-[#3D52A0] text-[#3D52A0] rounded-lg hover:bg-[#3D52A0] hover:text-white transition-colors duration-200"
                      >
                        <Eye size={16} className="mr-2" />
                        View Details
                      </button>
                      
                      {request.warehouse_approval_status === 'pending' && request.admin_approval_status === 'approved' && (
                        <>
                          <button
                            onClick={() => handleApproval(request, 'approved')}
                            disabled={updating[request.id]}
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
                          >
                            <CheckCircle size={16} className="mr-2" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleApproval(request, 'rejected')}
                            disabled={updating[request.id]}
                            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
                          >
                            <XCircle size={16} className="mr-2" />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-xl p-12 shadow-lg text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-[#EDE8F5] to-[#ADBBDA] rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText size={48} className="text-[#3D52A0]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No request orders found</h2>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' || adminStatusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'No request orders available at the moment.'
                }
              </p>
            </div>
          )}
        </div>

        {/* Approval Modal */}
        {showApprovalModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {approvalAction === 'approved' ? 'Approve' : 'Reject'} Request #{selectedRequest?.id}
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder={`Add notes for ${approvalAction === 'approved' ? 'approval' : 'rejection'}...`}
                  rows={3}
                  className="input w-full resize-none"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={submitApproval}
                  disabled={updating[selectedRequest?.id]}
                  className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 ${
                    approvalAction === 'approved' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {updating[selectedRequest?.id] ? (
                    <div className="spinner mx-auto"></div>
                  ) : (
                    `${approvalAction === 'approved' ? 'Approve' : 'Reject'} Request`
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default WarehouseRequestOrdersPage;

