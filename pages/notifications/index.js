import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/layout/Layout";
import apiClient from "../../lib/api/client";
import {
  Bell,
  BellRing,
  Check,
  CheckCircle,
  Trash2,
  Eye,
  Search,
  Filter,
  MoreVertical,
  Package,
  ShoppingCart,
  CreditCard,
  AlertCircle,
  Info,
} from "lucide-react";
import { toast } from "sonner";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updating, setUpdating] = useState({});
  const router = useRouter();

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [notifications, searchTerm, typeFilter, statusFilter]);

  const fetchNotifications = async () => {
    try {
      const response = await apiClient.getNotifications();
      if (response.success) {
        setNotifications(response.data);
        setFilteredNotifications(response.data);
      } else {
        toast.error("Failed to load notifications");
      }
    } catch (error) {
      console.error("Notifications error:", error);
      toast.error("Error loading notifications");
    } finally {
      setLoading(false);
    }
  };

  const filterNotifications = () => {
    if (!Array.isArray(notifications)) {
      return;
    }
    let filtered = [...notifications];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (notification) =>
          notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notification.message.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(
        (notification) => notification.type === typeFilter,
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      const isRead = statusFilter === "read";
      filtered = filtered.filter(
        (notification) => !!notification.read_at === isRead,
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    setFilteredNotifications(filtered);
  };

  const markAsRead = async (notificationId) => {
    setUpdating({ ...updating, [notificationId]: true });

    try {
      const response = await apiClient.markNotificationAsRead(notificationId);
      if (response.success) {
        setNotifications(
          notifications.map((notification) =>
            notification.id === notificationId
              ? { ...notification, read_at: new Date().toISOString() }
              : notification,
          ),
        );
        toast.success("Notification marked as read");
      } else {
        toast.error("Failed to mark notification as read");
      }
    } catch (error) {
      console.error("Mark as read error:", error);
      toast.error("Error marking notification as read");
    } finally {
      setUpdating({ ...updating, [notificationId]: false });
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await apiClient.markAllNotificationsAsRead();
      if (response.success) {
        const now = new Date().toISOString();
        setNotifications(
          notifications.map((notification) =>
            !notification.read_at
              ? { ...notification, read_at: now }
              : notification,
          ),
        );
        toast.success("All notifications marked as read");
      } else {
        toast.error("Failed to mark all notifications as read");
      }
    } catch (error) {
      console.error("Mark all as read error:", error);
      toast.error("Error marking all notifications as read");
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!confirm("Are you sure you want to delete this notification?")) return;

    setUpdating({ ...updating, [notificationId]: true });

    try {
      const response = await apiClient.deleteNotification(notificationId);
      if (response.success) {
        setNotifications(notifications.filter((n) => n.id !== notificationId));
        toast.success("Notification deleted");
      } else {
        toast.error("Failed to delete notification");
      }
    } catch (error) {
      console.error("Delete notification error:", error);
      toast.error("Error deleting notification");
    } finally {
      setUpdating({ ...updating, [notificationId]: false });
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "order":
        return <ShoppingCart className="text-blue-500" size={20} />;
      case "payment":
        return <CreditCard className="text-green-500" size={20} />;
      case "product":
        return <Package className="text-purple-500" size={20} />;
      case "system":
        return <Info className="text-gray-500" size={20} />;
      case "alert":
        return <AlertCircle className="text-red-500" size={20} />;
      default:
        return <Bell className="text-gray-500" size={20} />;
    }
  };

  const getNotificationTypeColor = (type) => {
    switch (type) {
      case "order":
        return "bg-blue-100 text-blue-800";
      case "payment":
        return "bg-green-100 text-green-800";
      case "product":
        return "bg-purple-100 text-purple-800";
      case "system":
        return "bg-gray-100 text-gray-800";
      case "alert":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatRelativeTime = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInSeconds = Math.floor((now - notificationDate) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return notificationDate.toLocaleDateString();
  };

  const unreadCount = notifications.filter((n) => !n.read_at).length;

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
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell size={32} className="text-[#3D52A0]" />
                {unreadCount > 0 && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Notifications
                </h1>
                <p className="text-gray-600">
                  {unreadCount > 0
                    ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                    : "You're all caught up!"}
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center px-4 py-2 bg-[#3D52A0] text-white rounded-lg hover:bg-[#2A3A7C] transition-colors duration-200"
              >
                <CheckCircle size={16} className="mr-2" />
                Mark All as Read
              </button>
            )}
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
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Types</option>
              <option value="order">Orders</option>
              <option value="payment">Payments</option>
              <option value="product">Products</option>
              <option value="system">System</option>
              <option value="alert">Alerts</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>

            {/* Results Count */}
            <div className="flex items-center justify-center bg-gray-50 rounded-lg px-4 py-2">
              <span className="text-sm text-gray-600">
                {filteredNotifications.length} notification(s)
              </span>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 ${
                  !notification.read_at ? "border-l-4 border-[#3D52A0]" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3
                          className={`font-semibold ${!notification.read_at ? "text-gray-900" : "text-gray-700"}`}
                        >
                          {notification.title}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getNotificationTypeColor(notification.type)}`}
                        >
                          {notification.type?.charAt(0).toUpperCase() +
                            notification.type?.slice(1)}
                        </span>
                        {!notification.read_at && (
                          <div className="w-2 h-2 bg-[#3D52A0] rounded-full"></div>
                        )}
                      </div>

                      <p
                        className={`${!notification.read_at ? "text-gray-900" : "text-gray-600"} mb-3`}
                      >
                        {notification.message}
                      </p>

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>
                          {formatRelativeTime(notification.created_at)}
                        </span>
                        {notification.read_at && (
                          <span>
                            Read {formatRelativeTime(notification.read_at)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.read_at && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        disabled={updating[notification.id]}
                        className="p-2 text-gray-400 hover:text-[#3D52A0] hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
                        title="Mark as read"
                      >
                        {updating[notification.id] ? (
                          <div className="w-4 h-4 border-2 border-[#3D52A0] border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Check size={16} />
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => deleteNotification(notification.id)}
                      disabled={updating[notification.id]}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
                      title="Delete notification"
                    >
                      {updating[notification.id] ? (
                        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Additional Actions for Order/Payment notifications */}
                {(notification.type === "order" ||
                  notification.type === "payment") &&
                  notification.related_id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() =>
                          router.push(`/orders/${notification.related_id}`)
                        }
                        className="flex items-center px-3 py-2 text-sm text-[#3D52A0] border border-[#3D52A0] rounded-lg hover:bg-[#3D52A0] hover:text-white transition-colors duration-200"
                      >
                        <Eye size={14} className="mr-2" />
                        View Order
                      </button>
                    </div>
                  )}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl p-12 shadow-lg text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-[#EDE8F5] to-[#ADBBDA] rounded-full flex items-center justify-center mx-auto mb-6">
                <Bell size={48} className="text-[#3D52A0]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {searchTerm || typeFilter !== "all" || statusFilter !== "all"
                  ? "No notifications found"
                  : "No notifications yet"}
              </h2>
              <p className="text-gray-600">
                {searchTerm || typeFilter !== "all" || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "You'll receive notifications here when there's important activity"}
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default NotificationsPage;
