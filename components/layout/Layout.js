import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/auth/authContext';
import { 
  Menu, 
  X, 
  ShoppingCart, 
  User, 
  Settings, 
  LogOut,
  Bell,
  Home,
  Package,
  Users,
  BarChart3,
  Truck
} from 'lucide-react';
import { toast } from 'sonner';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { user, logout, isAuthenticated, getUserRole } = useAuth();
  const router = useRouter();

  const userRole = getUserRole();

  // Navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: `/${userRole}`, icon: Home },
    ];

    switch (userRole) {
      case 'customer':
        return [
          ...baseItems,
          { name: 'Products', href: '/customer/products', icon: Package },
          { name: 'Cart', href: '/customer/cart', icon: ShoppingCart },
          { name: 'Orders', href: '/customer/orders', icon: Truck },
        ];
      case 'admin':
        return [
          ...baseItems,
          { name: 'Products', href: '/admin/products', icon: Package },
          { name: 'Orders', href: '/admin/orders', icon: Truck },
          { name: 'Request Orders', href: '/admin/request-orders', icon: BarChart3 },
          { name: 'Users', href: '/admin/users', icon: Users },
        ];
      case 'staff':
        return [
          ...baseItems,
          { name: 'Orders', href: '/staff/orders', icon: Truck },
          { name: 'Products', href: '/staff/products', icon: Package },
        ];
      case 'warehouse':
        return [
          ...baseItems,
          { name: 'Request Orders', href: '/warehouse/request-orders', icon: BarChart3 },
          { name: 'Inventory', href: '/warehouse/inventory', icon: Package },
        ];
      default:
        return baseItems;
    }
  };

  const navigationItems = getNavigationItems();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      router.push('/auth/login');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EDE8F5] to-[#ADBBDA]">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-[#3D52A0]">Supply Chain</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="mt-8">
          <div className="px-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = router.pathname === item.href;
              
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    router.push(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#3D52A0] to-[#7091E6] text-white shadow-lg'
                      : 'text-gray-700 hover:bg-[#EDE8F5] hover:text-[#3D52A0]'
                  }`}
                >
                  <Icon size={20} className="mr-3" />
                  {item.name}
                </button>
              );
            })}
          </div>
        </nav>

        {/* User info and logout */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-[#3D52A0] to-[#7091E6] rounded-full flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{userRole}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors duration-200"
          >
            <LogOut size={18} className="mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 text-gray-500 hover:text-[#3D52A0] transition-colors duration-200">
              <Bell size={20} />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Settings */}
            <button className="p-2 text-gray-500 hover:text-[#3D52A0] transition-colors duration-200">
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

