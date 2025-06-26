import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../lib/auth/authContext";

const Dashboard = () => {
  const { isAuthenticated, getUserRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        const role = getUserRole();
        router.push(`/dashboard/${role}`);
      } else {
        router.push("/login");
      }
    }
  }, [isAuthenticated, loading, router, getUserRole]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#EDE8F5] to-[#ADBBDA]">
      <div className="text-center">
        <div className="spinner mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to dashboard...</p>
      </div>
    </div>
  );
};

export default Dashboard;
