import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import TaskPage from "./pages/TaskPage";
import Notes from "./pages/Notes";
import Expenses from "./pages/Expenses";
import ActivityGraph from "./pages/ActivityGraph";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
}

import Layout from "./components/Layout";

function App() {
  return (
    <Routes>

      {/* Auth pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected routes wrapped in Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout title="Task Manager">
              <TaskPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/notes"
        element={
          <ProtectedRoute>
            <Layout title="Notes">
              <Notes />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/daily-expense"
        element={
          <ProtectedRoute>
            <Layout title="Expenses">
              <Expenses />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <Layout title="Activity Graph">
              <ActivityGraph />
            </Layout>
          </ProtectedRoute>
        }
      />


      {/* Unknown route */}
      <Route path="*" element={<Navigate to="/" />} />

    </Routes>
  );
}

export default App;