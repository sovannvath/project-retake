import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth/authContext';

const Home = () => {
  const { isAuthenticated, getUserRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        const role = getUserRole();
        router.push(`/${role}`);
      } else {
        router.push('/auth/login');
      }
    }
  }, [isAuthenticated, loading, router, getUserRole]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#EDE8F5] to-[#ADBBDA]">
      <div className="text-center">
        <div className="spinner mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
};

export default Home;

