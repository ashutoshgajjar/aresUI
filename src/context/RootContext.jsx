import { createContext, useContext, useMemo } from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { authApi, filesApi, healthApi, tasksApi, usersApi } from "@/api";

const RootContext = createContext(null);

function RootContextValue({ children }) {
  const auth = useAuth();

  const value = useMemo(
    () => ({
      ...auth,
      api: {
        auth: authApi,
        users: usersApi,
        tasks: tasksApi,
        files: filesApi,
        health: healthApi,
      },
    }),
    [auth],
  );

  return <RootContext.Provider value={value}>{children}</RootContext.Provider>;
}

export function RootProvider({ children }) {
  return (
    <AuthProvider>
      <RootContextValue>{children}</RootContextValue>
    </AuthProvider>
  );
}

export function useRoot() {
  const context = useContext(RootContext);
  if (!context) throw new Error("useRoot must be used inside RootProvider.");
  return context;
}
