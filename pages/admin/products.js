import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/layout/Layout';
import apiClient from '../../lib/api/client';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Eye,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Hash,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    low_stock_threshold: '',
    status: true
  });
  const [updating, setUpdating] = useState({});
  const router = useRouter();

  // Get filters from URL params
  useEffect(() => {
    const { filter } = router.query;
    if (filter === 'low-stock') setStockFilter('low');
  }, [router.query]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, statusFilter, stockFilter]);

  const fetchProducts = async () => {
    try {
      const response = await apiClient.getProducts();
      if (response.success) {
        setProducts(response.data);
        setFilteredProducts(response.data);
      } else {
        toast.error('Failed to load products');
      }
    } catch (error) {
      console.error('Products error:', error);
      toast.error('Error loading products');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter(product => product.status === isActive);
    }

    // Stock filter
    if (stockFilter !== 'all') {
      switch (stockFilter) {
        case 'low':
          filtered = filtered.filter(product => product.quantity <= product.low_stock_threshold);
          break;
        case 'out':
          filtered = filtered.filter(product => product.quantity === 0);
          break;
        case 'in':
          filtered = filtered.filter(product => product.quantity > product.low_stock_threshold);
          break;
      }
    }

    setFilteredProducts(filtered);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      quantity: '',
      low_stock_threshold: '',
      status: true
    });
  };

  const handleCreate = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      quantity: product.quantity.toString(),
      low_stock_threshold: product.low_stock_threshold.toString(),
      status: product.status
    });
    setShowEditModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity),
      low_stock_threshold: parseInt(formData.low_stock_threshold),
      status: formData.status
    };

    try {
      let response;
      if (showCreateModal) {
        response = await apiClient.createProduct(productData);
      } else {
        response = await apiClient.updateProduct(selectedProduct.id, productData);
      }

      if (response.success) {
        toast.success(`Product ${showCreateModal ? 'created' : 'updated'} successfully`);
        fetchProducts();
        setShowCreateModal(false);
        setShowEditModal(false);
        resetForm();
      } else {
        toast.error(`Failed to ${showCreateModal ? 'create' : 'update'} product`);
      }
    } catch (error) {
      console.error('Product operation error:', error);
      toast.error(`Error ${showCreateModal ? 'creating' : 'updating'} product`);
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    setUpdating({ ...updating, [productId]: true });
    
    try {
      const response = await apiClient.deleteProduct(productId);
      if (response.success) {
        toast.success('Product deleted successfully');
        setProducts(products.filter(p => p.id !== productId));
      } else {
        toast.error('Failed to delete product');
      }
    } catch (error) {
      console.error('Delete product error:', error);
      toast.error('Error deleting product');
    } finally {
      setUpdating({ ...updating, [productId]: false });
    }
  };

  const getStockStatus = (product) => {
    if (product.quantity === 0) {
      return { status: 'Out of Stock', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
    } else if (product.quantity <= product.low_stock_threshold) {
      return { status: 'Low Stock', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle };
    } else {
      return { status: 'In Stock', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    }
  };

  const ProductModal = ({ show, onClose, title, onSubmit }) => {
    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
          
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="input w-full resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="input w-full"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Low Stock Threshold
              </label>
              <input
                type="number"
                value={formData.low_stock_threshold}
                onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })}
                className="input w-full"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="status"
                checked={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="status" className="text-sm font-medium text-gray-700">
                Active Product
              </label>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 btn-primary"
              >
                {title.includes('Create') ? 'Create' : 'Update'} Product
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Management</h1>
              <p className="text-gray-600">Manage your product catalog and inventory</p>
            </div>
            <button
              onClick={handleCreate}
              className="btn-primary flex items-center"
            >
              <Plus size={20} className="mr-2" />
              Add Product
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
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
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Stock Filter */}
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Stock Levels</option>
              <option value="in">In Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>

            {/* Results Count */}
            <div className="flex items-center justify-center bg-gray-50 rounded-lg px-4 py-2">
              <span className="text-sm text-gray-600">
                {filteredProducts.length} products found
              </span>
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          {filteredProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Product</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Price</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Stock</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const stockInfo = getStockStatus(product);
                    const StockIcon = stockInfo.icon;
                    
                    return (
                      <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#EDE8F5] to-[#ADBBDA] rounded-lg flex items-center justify-center">
                              <Package size={20} className="text-[#3D52A0]" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{product.name}</p>
                              <p className="text-sm text-gray-600 line-clamp-1">{product.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <DollarSign size={16} className="text-gray-400 mr-1" />
                            <span className="font-medium text-gray-900">{product.price}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">{product.quantity}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockInfo.color} flex items-center`}>
                              <StockIcon size={12} className="mr-1" />
                              {stockInfo.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Threshold: {product.low_stock_threshold}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            product.status 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {product.status ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => router.push(`/admin/products/${product.id}`)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleEdit(product)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                              title="Edit Product"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              disabled={updating[product.id]}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
                              title="Delete Product"
                            >
                              {updating[product.id] ? (
                                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-br from-[#EDE8F5] to-[#ADBBDA] rounded-full flex items-center justify-center mx-auto mb-6">
                <Package size={48} className="text-[#3D52A0]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No products found</h2>
              <p className="text-gray-600 mb-8">
                {searchTerm || statusFilter !== 'all' || stockFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by adding your first product to the catalog.'
                }
              </p>
              <button
                onClick={handleCreate}
                className="btn-primary inline-flex items-center"
              >
                <Plus size={20} className="mr-2" />
                Add First Product
              </button>
            </div>
          )}
        </div>

        {/* Create Product Modal */}
        <ProductModal
          show={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Product"
          onSubmit={handleSubmit}
        />

        {/* Edit Product Modal */}
        <ProductModal
          show={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Product"
          onSubmit={handleSubmit}
        />
      </div>
    </Layout>
  );
};

export default AdminProductsPage;

