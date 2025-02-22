// components/Navbar.tsx
"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

const Navbar: React.FC = () => {
  const { token, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <nav className="bg-white shadow p-4 flex justify-between items-center">
      <div>
        <Link href="/tasks" className="text-xl font-bold">
          Task Manager
        </Link>
      </div>
      <div>
        {token ? (
          <button onClick={handleLogout} className="text-red-500">
            Logout
          </button>
        ) : (
          <>
            <Link href="/login" className="mr-4 text-blue-500">
              Login
            </Link>
            <Link href="/register" className="text-blue-500">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
