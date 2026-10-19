import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function ActivityLog() {
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [page, setPage] = useState(1);
  const [role, setRole] = useState('');
  const [userName, setUserName] = useState('');
  const [search, setSearch] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    api.get('/api/activity-logs', { params: { page, role, userName: search } })
      .then(({ data }) => { if (!cancelled) setData(data); })
      .catch(error => {
        if (cancelled) return;
        const status = error.response?.status;
        setError(status === 404
          ? 'Activity Log is unavailable on the running backend. Restart the backend server to load the latest changes.'
          : status === 403
            ? 'Only super admins can view the activity log.'
            : !error.response
              ? 'Cannot connect to the backend. Check that the backend server is running and try again.'
              : 'Unable to load activity. Please try again.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, role, search, refresh]);

  const reload = () => { setLoading(true); setError(''); };
  return (
    <section className="p-4 md:p-8 text-gray-800">
      <h1 className="text-2xl font-bold">Activity Log</h1>
      <p className="text-gray-500 mt-2">Successful account actions, visible only to super admins. Times use your local timezone.</p>
      <form className="flex flex-wrap gap-3 my-6" onSubmit={event => { event.preventDefault(); reload(); setPage(1); setSearch(userName.trim()); setRefresh(value => value + 1); }}>
        <input aria-label="Exact username" placeholder="Exact username" value={userName} onChange={event => setUserName(event.target.value)} className="border rounded-lg px-3 py-2" maxLength={200} />
        <select aria-label="Filter by role" value={role} onChange={event => { reload(); setPage(1); setRole(event.target.value); }} className="border rounded-lg px-3 py-2">
          <option value="">All roles</option><option value="user">User</option><option value="admin">Admin</option><option value="superadmin">Super Admin</option>
        </select>
        <button className="bg-blue-600 text-white rounded-lg px-4 py-2">Search / Refresh</button>
      </form>
      {error ? <p role="alert" className="text-red-600">{error}</p> : loading ? <p role="status">Loading activity...</p> : <>
        <p className="text-sm text-gray-500 mb-3">{data.total} activities</p>
        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50"><tr>{['Time', 'Username', 'Role', 'Action', 'Target'].map(label => <th key={label} className="p-4">{label}</th>)}</tr></thead>
            <tbody>{data.items.map(item => <tr key={item._id} className="border-t border-gray-100">
              <td className="p-4 whitespace-nowrap">{new Date(item.occurredAt).toLocaleString()}</td>
              <td className="p-4">{item.userName}</td><td className="p-4">{item.role === 'superadmin' ? 'Super Admin' : item.role}</td>
              <td className="p-4">{item.action}</td><td className="p-4 break-all">{item.target || '—'}</td>
            </tr>)}</tbody>
          </table>
          {!data.items.length && <p className="p-6 text-gray-500">No activity found. New actions will appear here after they occur.</p>}
        </div>
        <div className="flex items-center gap-4 mt-4">
          <button disabled={page <= 1} className="border rounded px-3 py-2 disabled:opacity-40" onClick={() => { reload(); setPage(page - 1); }}>Previous</button>
          <span>Page {page} of {data.pages}</span>
          <button disabled={page >= data.pages} className="border rounded px-3 py-2 disabled:opacity-40" onClick={() => { reload(); setPage(page + 1); }}>Next</button>
        </div>
      </>}
    </section>
  );
}
