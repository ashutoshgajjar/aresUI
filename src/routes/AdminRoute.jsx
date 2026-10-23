import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/UI/Loader";

export default function AdminRoute() {
  const { isAdmin, loading } = useAuth();

  if (loading) return <Loader />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return <Outlet />;
}
