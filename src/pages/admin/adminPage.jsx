import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "../../components/admin/Layout";

import ManageVacancies from "./ManageVacaancies";
import ManageUsers from "./ManageUsers";


export default function AdminPage() {
  return (
    <div className="w-full h-screen bg-amber-500">
      <Routes>
        <Route path="/*" element={<Layout />}>
          {/* default: /admin → /admin/users */}
          <Route index element={<Navigate to="users" replace />} />

          {/* ✅ RELATIVE paths */}
          <Route path="users" element={<ManageUsers />} />
          <Route path="vacancies" element={<ManageVacancies />} />
         
        </Route>
      </Routes>
    </div>
  );
}
