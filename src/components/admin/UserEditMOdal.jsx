import { useEffect, useState } from "react";
import ReviewDialog from "../review/ReviewDialog";
import api from "../../api/axios";

export default function UserEditModal({ isOpen, onClose, user, onSave }) {
  const [role, setRole] = useState(user?.role || "user");
  const [faculty, setFaculty] = useState(user?.faculty || "");
  const [department, setDepartment] = useState(user?.department || "");
  const [jobs, setJobs] = useState([]);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    api
      .get("/api/jobs")
      .then((response) => {
        if (active) setJobs(response.data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [isOpen]);
  if (!isOpen || !user) return null;
  const faculties = [...new Set(jobs.map((job) => job.faculty))].filter(
    Boolean,
  );
  const departments = [
    ...new Set(
      jobs
        .filter((job) => faculty === "*" || job.faculty === faculty)
        .map((job) => job.department),
    ),
  ].filter(Boolean);
  return (
    <ReviewDialog
      title="Manage role and access"
      onClose={() => !busy && onClose()}
    >
      <form
        className="space-y-5"
        onSubmit={async (event) => {
          event.preventDefault();
          setBusy(true);
          try {
            await onSave(user.userName, {
              role,
              faculty: faculty.trim(),
              department: department.trim(),
            });
          } finally {
            setBusy(false);
          }
        }}
      >
        <p className="text-slate-500">
          {user.userName} · {user.email}
        </p>
        <label className="block">
          <span className="block font-semibold mb-2">Role</span>
          <select
            className="w-full border border-slate-200 rounded-xl p-3"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Super Admin</option>
          </select>
        </label>
        {role === "admin" && (
          <>
            <p className="text-sm text-slate-500">
              Choose a specific faculty and department, or enable all to give
              this admin a wider application review scope.
            </p>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={faculty === "*"} onChange={e => {
                setFaculty(e.target.checked ? "*" : "");
                setDepartment("");
              }}/> Assign all faculties
            </label>
            <label className="block">
              <span className="block font-semibold mb-2">Assigned faculty</span>
              <input
                className="w-full border border-slate-200 rounded-xl p-3"
                list="role-faculties"
                disabled={faculty === "*"}
                placeholder={faculty === "*" ? "All faculties" : "Select or enter a faculty"}
                required
                maxLength={150}
                value={faculty === "*" ? "All faculties" : faculty}
                onChange={(e) => {
                  setFaculty(e.target.value);
                  setDepartment("");
                }}
              />
              <datalist id="role-faculties">
                {faculties.map((value) => (
                  <option key={value} value={value} />
                ))}
              </datalist>
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={department === "*"} onChange={e => setDepartment(e.target.checked ? "*" : "")}/> Assign all departments
            </label>
            <label className="block">
              <span className="block font-semibold mb-2">
                Assigned department
              </span>
              <input
                className="w-full border border-slate-200 rounded-xl p-3"
                list="role-departments"
                disabled={department === "*"}
                placeholder={department === "*" ? "All departments" : "Select or enter a department"}
                required
                maxLength={150}
                value={department === "*" ? "All departments" : department}
                onChange={(e) => setDepartment(e.target.value)}
              />
              <datalist id="role-departments">
                {departments.map((value) => (
                  <option key={value} value={value} />
                ))}
              </datalist>
            </label>
          </>
        )}
        {role === "admin" && faculty && department && <p className="rounded-xl bg-blue-50 p-3 text-sm text-blue-800" role="status">Application access: {faculty === "*" ? "All faculties" : faculty} / {department === "*" ? "All departments" : department}.</p>}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="border rounded-xl px-4 py-2"
            disabled={busy}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            disabled={busy}
            className="bg-blue-600 text-white rounded-xl px-5 py-2"
          >
            {busy ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </ReviewDialog>
  );
}
