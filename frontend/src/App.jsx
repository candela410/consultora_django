import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import Login from "./Login";
import Zonas from "./Zonas";
import Usuarios from "./Usuarios"; // <-- 1. Importas tu componente
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/zonas"
            element={
              <ProtectedRoute>
                <Zonas />
              </ProtectedRoute>
            }
          />
          {/* 2. Añades la ruta protegida para el CRUD de usuarios */}
          <Route
            path="/usuarios"
            element={
              <ProtectedRoute>
                <Usuarios />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;