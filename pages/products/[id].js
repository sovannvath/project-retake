import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/layout/Layout";
import apiClient from "../../lib/api/client";
import {
  ShoppingCart,
  Heart,
  Star,
  Minus,
  Plus,
  ArrowLeft,
  Share2,
  CheckCircle,
  AlertTriangle,
  Package,
  Truck,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

const ProductDetailPage = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedTab, setSelectedTab] = useState("description");
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await apiClient.getProduct(id);
      if (response.success) {
        setProduct(response.data);
      } else {
        toast.error("Product not found");
        router.push("/products");
      }
    } catch (error) {
      console.error("Product detail error:", error);
      toast.error("Error loading product");
      router.push("/products");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    setAddingToCart(true);

    try {
      const response = await apiClient.addToCart(product.id, quantity);
      if (response.success) {
        toast.success(`${quantity} item(s) added to cart!`);
      } else {
        toast.error("Failed to add product to cart");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Error adding to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const updateQuantity = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= product.quantity) {
      setQuantity(newQuantity);
    }
  };

  const getStockStatus = () => {
    if (product.quantity === 0) {
      return {
        status: "Out of Stock",
        color: "text-red-600",
        icon: AlertTriangle,
      };
    } else if (product.quantity <= product.low_stock_threshold) {
      return {
        status: "Low Stock",
        color: "text-yellow-600",
        icon: AlertTriangle,
      };
    } else {
      return { status: "In Stock", color: "text-green-600", icon: CheckCircle };
    }
  };

  const shareProduct = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success("Product link copied to clipboard!");
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

  if (!product) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Product not found
          </h2>
          <button
            onClick={() => router.push("/products")}
            className="btn-primary"
          >
            Back to Products
          </button>
        </div>
      </Layout>
    );
  }

  const stockInfo = getStockStatus();
  const StockIcon = stockInfo.icon;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <button
              onClick={() => router.push("/products")}
              className="hover:text-[#3D52A0] transition-colors duration-200"
            >
              Products
            </button>
            <span>/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="aspect-square bg-gradient-to-br from-[#EDE8F5] to-[#ADBBDA] rounded-xl flex items-center justify-center">
                <div className="text-9xl text-[#3D52A0] opacity-20">📦</div>
              </div>
            </div>

            {/* Additional features */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-lg text-center">
                <Truck size={24} className="text-[#3D52A0] mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">
                  Free Shipping
                </p>
                <p className="text-xs text-gray-600">On orders over $50</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-lg text-center">
                <Shield size={24} className="text-[#3D52A0] mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Warranty</p>
                <p className="text-xs text-gray-600">1 year warranty</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-lg text-center">
                <Package size={24} className="text-[#3D52A0] mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Returns</p>
                <p className="text-xs text-gray-600">30-day returns</p>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">
                {product.name}
              </h1>
              <div className="flex space-x-2">
                <button
                  onClick={shareProduct}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <Share2 size={20} className="text-gray-600" />
                </button>
                <button className="p-2 border border-gray-300 rounded-lg hover:bg-red-50 transition-colors duration-200">
                  <Heart
                    size={20}
                    className="text-gray-600 hover:text-red-500"
                  />
                </button>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={`${i < 4 ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 ml-2">
                (4.0) • 128 reviews
              </span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <span className="text-4xl font-bold text-[#3D52A0]">
                ${product.price}
              </span>
            </div>

            {/* Stock Status */}
            <div className="flex items-center mb-6">
              <StockIcon size={20} className={stockInfo.color} />
              <span className={`ml-2 font-medium ${stockInfo.color}`}>
                {stockInfo.status}
              </span>
              <span className="text-gray-600 ml-2">
                ({product.quantity} available)
              </span>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => updateQuantity(quantity - 1)}
                  disabled={quantity <= 1}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus size={16} />
                </button>

                <span className="w-16 text-center font-medium text-lg">
                  {quantity}
                </span>

                <button
                  onClick={() => updateQuantity(quantity + 1)}
                  disabled={quantity >= product.quantity}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="space-y-3 mb-6">
              <button
                onClick={addToCart}
                disabled={product.quantity === 0 || addingToCart}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {addingToCart ? (
                  <>
                    <div className="spinner mr-2"></div>
                    Adding to Cart...
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} className="mr-2" />
                    Add to Cart
                  </>
                )}
              </button>

              <button className="w-full px-6 py-3 border border-[#3D52A0] text-[#3D52A0] rounded-lg hover:bg-[#3D52A0] hover:text-white transition-colors duration-200">
                Buy Now
              </button>
            </div>

            {/* Product Info Tabs */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex space-x-4 mb-4">
                {["description", "specifications", "reviews"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      selectedTab === tab
                        ? "bg-[#3D52A0] text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              <div className="min-h-[100px]">
                {selectedTab === "description" && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Product Description
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                )}

                {selectedTab === "specifications" && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Specifications
                    </h3>
                    <dl className="grid grid-cols-1 gap-2">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">SKU:</dt>
                        <dd className="font-medium text-gray-900">
                          #{product.id}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Stock Threshold:</dt>
                        <dd className="font-medium text-gray-900">
                          {product.low_stock_threshold}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Status:</dt>
                        <dd className="font-medium text-gray-900">
                          {product.status ? "Active" : "Inactive"}
                        </dd>
                      </div>
                    </dl>
                  </div>
                )}

                {selectedTab === "reviews" && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Customer Reviews
                    </h3>
                    <p className="text-gray-600">
                      No reviews yet. Be the first to review this product!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <button
            onClick={() => router.push("/products")}
            className="flex items-center text-[#3D52A0] hover:bg-[#3D52A0] hover:text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Products
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetailPage;
