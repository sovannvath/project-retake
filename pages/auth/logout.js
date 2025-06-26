import { useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/layout/Layout";
import apiClient from "../../lib/api/client";
import { LogOut, CheckCircle } from "lucide-react";

const LogoutPage = () => {
  const router = useRouter();

  useEffect(() => {
    handleLogout();
  }, []);

  const handleLogout = async () => {
    try {
      // Call logout API
      await apiClient.logout();

      // Clear any local storage or session data
      localStorage.clear();
      sessionStorage.clear();

      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, redirect to login
      router.push("/auth/login");
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Successfully Logged Out
            </h2>
            <p className="text-gray-600 mb-8">
              You have been safely logged out of your account.
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 text-gray-500">
                <div className="spinner"></div>
                <span>Redirecting to login...</span>
              </div>

              <button
                onClick={() => router.push("/auth/login")}
                className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#3D52A0] hover:bg-[#2A3A7C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3D52A0] transition-colors duration-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LogoutPage;
