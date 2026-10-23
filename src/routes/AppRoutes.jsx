import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import ProtectedRoute from "@/routes/ProtectedRoute";
import AdminRoute from "@/routes/AdminRoute";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import UserListPage from "@/pages/users/UserListPage";
import UserDetailPage from "@/pages/users/UserDetailPage";
import TaskListPage from "@/pages/tasks/TaskListPage";
import TaskDetailPage from "@/pages/tasks/TaskDetailPage";
import FileListPage from "@/pages/files/FileListPage";
import FileDetailPage from "@/pages/files/FileDetailPage";
import ProfilePage from "@/pages/profile/ProfilePage";
import NotFoundPage from "@/pages/errors/NotFoundPage";
import HomePage from "@/pages/home/HomPage";
import { RouteErrorPage } from "@/components/errors";
import HealthMonitor from "@/pages/health/HealthMonitor";

const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute />,
    errorElement: <RouteErrorPage />,
    children: [
      { path: "dashboard", element: <DashboardPage /> },
      { path: "tasks", element: <TaskListPage /> },
      { path: "tasks/:taskId", element: <TaskDetailPage /> },
      { path: "files", element: <FileListPage /> },
      { path: "files/:fileId", element: <FileDetailPage /> },
      { path: "profile",element: <ProfilePage /> },
      { path: "settings/health",element: <HealthMonitor /> },
      {
        element: <AdminRoute />,
        children: [
          { path: "users", element: <UserListPage /> },
          { path: "users/:userId", element: <UserDetailPage /> },
        ],
      },
    ],
  },
  { index: true, element: <HomePage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "*", element: <NotFoundPage /> },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
