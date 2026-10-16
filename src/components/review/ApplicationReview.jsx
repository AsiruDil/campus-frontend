import { useEffect, useMemo, useState } from "react";
import {
  FiDownload,
  FiMail,
  FiSearch,
  FiRefreshCw,
  FiTrash2,
  FiCheckCircle,
  FiUsers,
} from "react-icons/fi";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import api from "../../api/axios";
import ReviewDialog from "./ReviewDialog";

const categories = {
  lecturer: "Lecturer",
  probationary: "Probationary lecturer",
  demo: "Demonstrator",
};
const statuses = {
  pending: "Pending",
  shortlisted: "Shortlisted",
  selected: "Selected",
  rejected: "Rejected",
  hold: "On hold",
};
const statusStyles = {
  pending: "bg-amber-50 text-amber-800",
  shortlisted: "bg-blue-50 text-blue-700",
  selected: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
  hold: "bg-purple-50 text-purple-700",
};
const input =
  "w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white";
const button =
  "rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed";
const errorMessage = (error) =>
  error.response?.data?.message || "The request failed. Please try again.";

export default function ApplicationReview() {
  const [role] = useState(() => {
    try {
      return jwtDecode(localStorage.getItem("token")).role;
    } catch {
      return "";
    }
  });
  const superAdmin = role === "superadmin";
  const [applications, setApplications] = useState([]);
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [job, setJob] = useState("");
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const [compose, setCompose] = useState(false);
  const [subject, setSubject] = useState("Application update");
  const [message, setMessage] = useState("");
  const [retention, setRetention] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [retentionError, setRetentionError] = useState("");
  const [details, setDetails] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let alive = true;
    try {
      const user = jwtDecode(localStorage.getItem("token"));
      api
        .get(`/api/users/${encodeURIComponent(user.userName)}`)
        .then((response) => {
          if (alive) setProfile(response.data);
        })
        .catch(() => {});
    } catch {
      /* Authentication is handled by the route. */
    }
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/api/apply", {
          params: {
            category: category || undefined,
            status: status || undefined,
          },
          signal: controller.signal,
        });
        setApplications(response.data);
      } catch (failure) {
        if (!controller.signal.aborted) setError(errorMessage(failure));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [category, status, revision]);
  useEffect(() => {
    if (!superAdmin) return;
    let alive = true;
    api
      .get("/api/apply/retention")
      .then((response) => {
        if (alive) {
          setRetention(response.data);
        }
      })
      .catch((failure) => {
        if (alive) setRetentionError(errorMessage(failure));
      });
    return () => {
      alive = false;
    };
  }, [superAdmin, revision]);

  const filtered = useMemo(
    () =>
      applications.filter(
        (application) =>
          (!job || application.jobId === job) &&
          [
            application.firstName,
            application.lastName,
            application.userName,
            application.email,
            application.nic,
            application.jobRole,
          ].some((value) =>
            String(value || "")
              .toLowerCase()
              .includes(query.toLowerCase()),
          ),
      ),
    [applications, query, job],
  );
  const visiblePage = Math.min(
    page,
    Math.max(1, Math.ceil(filtered.length / 10)),
  );
  const rows = filtered.slice((visiblePage - 1) * 10, visiblePage * 10);
  const selectedApplications = applications.filter((application) =>
    selected.includes(application._id),
  );
  const allOnPage =
    rows.length > 0 &&
    rows.every((application) => selected.includes(application._id));
  const selectedEligible =
    selectedApplications.length > 0 &&
    selectedApplications.every((application) =>
      ["shortlisted", "selected"].includes(application.status),
    );
  const jobs = [
    ...new Map(
      applications.map((application) => [
        application.jobId,
        application.jobRole,
      ]),
    ).entries(),
  ];
  function refresh() {
    setSelected([]);
    setRevision((value) => value + 1);
  }
  function changeFilter(setter, value) {
    setter(value);
    setSelected([]);
    setPage(1);
  }
  function toggle(id) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  }
  async function decide(ids, nextStatus) {
    setBusy(true);
    const results = await Promise.allSettled(
      ids.map((id) =>
        api.patch(`/api/apply/${id}/status`, { status: nextStatus }),
      ),
    );
    const failed = results.filter((result) => result.status === "rejected");
    if (failed.length)
      toast.error(
        `${ids.length - failed.length} updated; ${failed.length} failed. ${errorMessage(failed[0].reason)}`,
      );
    else
      toast.success(
        `${ids.length} application(s) marked ${statuses[nextStatus].toLowerCase()}.`,
      );
    setBusy(false);
    refresh();
  }
  async function download(application, type) {
    setBusy(true);
    try {
      const response = await api.get(`/api/apply/${application._id}/${type}`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `application-${application.jobId}-${application._id}.${type === "cv" ? "pdf" : "zip"}`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (failure) {
      let text = "Could not download this document.";
      try {
        text = JSON.parse(await failure.response.data.text()).message || text;
      } catch {
        /* Keep the readable fallback. */
      }
      toast.error(text);
    } finally {
      setBusy(false);
    }
  }
  async function sendEmail(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const response = await api.post("/api/apply/email", {
        applicationIds: selected,
        subject,
        message,
        shortlistedOnly: selectedEligible,
      });
      if (response.data.failed) toast.error(response.data.message);
      else toast.success(response.data.message);
      setCompose(false);
      setMessage("");
      refresh();
    } catch (failure) {
      toast.error(errorMessage(failure));
    } finally {
      setBusy(false);
    }
  }
  async function removeExpired() {
    setBusy(true);
    try {
      const response = await api.delete("/api/apply/retention", {
        data: { confirm: "DELETE_EXPIRED_DOCUMENTS" },
      });
      if (response.data.failed) {
        setRetentionError(
          response.data.failures
            .map((failure) => failure.message)
            .filter((v, i, a) => a.indexOf(v) === i)
            .join(" "),
        );
        toast.error(response.data.message);
      } else {
        toast.success(response.data.message);
      }
      setConfirmDelete(false);
      refresh();
    } catch (failure) {
      toast.error(errorMessage(failure));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="text-slate-800 space-y-6 pb-12">
      <header className="flex flex-wrap gap-4 justify-between items-start">
        <div>
          <p className="text-sm text-blue-600 font-semibold mb-2">
            RECRUITMENT WORKSPACE
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
          <p className="text-slate-500 mt-2">
            Review documents, build your shortlist and keep applicants informed.
          </p>
          {!superAdmin && profile && (
            <p className="text-sm text-slate-600 mt-2">
              {profile.faculty && profile.department
                ? `${profile.faculty} / ${profile.department}`
                : "Ask a Super Admin to assign your faculty and department before reviewing applications."}
            </p>
          )}
        </div>
        <button
          className={`${button} flex items-center gap-2`}
          disabled={loading || busy}
          onClick={refresh}
        >
          <FiRefreshCw /> Refresh
        </button>
      </header>
      <div className="grid sm:grid-cols-3 gap-4">
        <Summary
          icon={<FiUsers />}
          label="Matching applications"
          value={loading ? "…" : filtered.length}
        />
        <Summary
          icon={<FiCheckCircle />}
          label="Shortlisted / selected in results"
          value={
            loading
              ? "…"
              : filtered.filter((a) =>
                  ["shortlisted", "selected"].includes(a.status),
                ).length
          }
        />
        <Summary
          icon={<FiMail />}
          label="Selected for action"
          value={selected.length}
        />
      </div>
      <section
        className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        aria-label="Application list"
      >
        <div className="p-5 grid sm:grid-cols-2 xl:grid-cols-4 gap-4 border-b border-slate-100">
          <label>
            <span className="text-sm font-medium block mb-2">
              Search applicants
            </span>
            <div className="relative">
              <FiSearch className="absolute top-3.5 left-3 text-slate-400" />
              <input
                className={`${input} pl-9`}
                type="search"
                placeholder="Name, NIC or email"
                value={query}
                onChange={(e) => changeFilter(setQuery, e.target.value)}
              />
            </div>
          </label>
          <label>
            <span className="text-sm font-medium block mb-2">
              Position category
            </span>
            <select
              className={input}
              value={category}
              onChange={(e) => changeFilter(setCategory, e.target.value)}
            >
              <option value="">All categories</option>
              {Object.entries(categories).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="text-sm font-medium block mb-2">
              Review status
            </span>
            <select
              className={input}
              value={status}
              onChange={(e) => changeFilter(setStatus, e.target.value)}
            >
              <option value="">All statuses</option>
              {Object.entries(statuses).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="text-sm font-medium block mb-2">Vacancy</span>
            <select
              className={input}
              value={job}
              onChange={(e) => changeFilter(setJob, e.target.value)}
            >
              <option value="">All vacancies</option>
              {jobs.map(([id, title]) => (
                <option key={id} value={id}>
                  {title} · {id}
                </option>
              ))}
            </select>
          </label>
        </div>
        {selected.length > 0 && (
          <div className="bg-blue-50 border-b border-blue-100 p-4 flex flex-wrap items-center gap-3">
            <span className="font-semibold text-blue-900 mr-auto">
              {selected.length} selected
            </span>
            <button
              disabled={busy || loading}
              className={button}
              onClick={() => decide(selected, "shortlisted")}
            >
              Shortlist selected
            </button>
            <button
              disabled={busy || loading || selected.length > 200}
              className="bg-blue-600 text-white rounded-xl px-4 py-2.5 font-semibold text-sm disabled:opacity-50"
              onClick={() => setCompose(true)}
            >
              {selectedEligible
                ? "Email shortlist"
                : "Email selected applicants"}
            </button>
            <button
              className={button}
              disabled={busy}
              onClick={() => setSelected([])}
            >
              Clear
            </button>
          </div>
        )}
        {error ? (
          <div role="alert" className="p-8 text-red-700">
            {error}
            <button className={`${button} ml-4`} onClick={refresh}>
              Try again
            </button>
          </div>
        ) : loading ? (
          <p role="status" className="p-14 text-center text-slate-500">
            Loading applications…
          </p>
        ) : !rows.length ? (
          <div className="text-center px-6 py-16">
            <FiUsers className="mx-auto text-slate-300 mb-4" size={40} />
            <h2 className="font-semibold text-lg">No applications found</h2>
            <p className="text-slate-500 mt-2">
              Try a different search or filter. New applications will appear
              here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="p-4">
                    <input
                      type="checkbox"
                      aria-label="Select all applications on this page"
                      checked={allOnPage}
                      disabled={busy}
                      onChange={(e) =>
                        setSelected((current) =>
                          e.target.checked
                            ? [
                                ...new Set([
                                  ...current,
                                  ...rows.map((a) => a._id),
                                ]),
                              ]
                            : current.filter(
                                (id) => !rows.some((a) => a._id === id),
                              ),
                        )
                      }
                    />
                  </th>
                  {[
                    "Applicant",
                    "Position",
                    "Status",
                    "Documents",
                    "Review",
                  ].map((label) => (
                    <th
                      key={label}
                      className="p-4 font-semibold whitespace-nowrap"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((application) => (
                  <tr
                    key={application._id}
                    className={
                      selected.includes(application._id)
                        ? "bg-blue-50/50"
                        : "hover:bg-slate-50/70"
                    }
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        aria-label={`Select ${application.firstName} ${application.lastName} for ${application.jobRole}`}
                        checked={selected.includes(application._id)}
                        disabled={busy}
                        onChange={() => toggle(application._id)}
                      />
                    </td>
                    <td className="p-4">
                      <button
                        className="font-semibold text-blue-700 hover:underline text-left"
                        onClick={() => setDetails(application)}
                      >
                        {application.firstName} {application.lastName}
                      </button>
                      <p className="text-slate-500 mt-1">{application.email}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(application.date).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium">{application.jobRole}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {categories[application.category] ||
                          "Legacy · uncategorized"}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {application.jobId}
                      </p>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${statusStyles[application.status]}`}
                      >
                        {statuses[application.status]}
                      </span>
                      {application.lastNotifiedAt && (
                        <p className="text-xs text-slate-400 mt-2">
                          Emailed{" "}
                          {new Date(
                            application.lastNotifiedAt,
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </td>
                    <td className="p-4">
                      {application.documentsDeletedAt ? (
                        <span className="text-slate-400 text-xs">
                          Removed after 5 years
                        </span>
                      ) : application.hasArchive ? (
                        <div className="flex flex-col items-start gap-2">
                          <button
                            disabled={busy}
                            onClick={() => download(application, "documents")}
                            className="flex items-center gap-1 text-blue-700 font-medium disabled:opacity-40"
                          >
                            <FiDownload /> ZIP package
                          </button>
                          <button
                            disabled={busy}
                            onClick={() => download(application, "cv")}
                            className="text-xs text-slate-500 underline disabled:opacity-40"
                          >
                            CV only (PDF)
                          </button>
                        </div>
                      ) : application.cv &&
                        /^https:\/\//.test(application.cv) ? (
                        <a
                          href={application.cv}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-700 underline"
                        >
                          Legacy CV ↗
                        </a>
                      ) : (
                        <span className="text-slate-400">Unavailable</span>
                      )}
                    </td>
                    <td className="p-4">
                      <ReviewActions
                        application={application}
                        busy={busy}
                        onDecide={(next) => decide([application._id], next)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <footer className="border-t border-slate-100 p-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
          <span>
            {filtered.length
              ? `${(visiblePage - 1) * 10 + 1}–${Math.min(visiblePage * 10, filtered.length)} of ${filtered.length}`
              : "0 applications"}
          </span>
          <div className="flex items-center gap-3">
            <button
              className={button}
              disabled={visiblePage <= 1 || loading}
              onClick={() => setPage(visiblePage - 1)}
            >
              Previous
            </button>
            <span>Page {visiblePage}</span>
            <button
              className={button}
              disabled={visiblePage * 10 >= filtered.length || loading}
              onClick={() => setPage(visiblePage + 1)}
            >
              Next
            </button>
          </div>
        </footer>
      </section>
      {superAdmin && (
        <section className="border border-red-100 bg-white rounded-2xl p-6 flex flex-wrap justify-between gap-5 items-center">
          <div>
            <h2 className="font-semibold text-lg">
              Five-year document retention
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Delete CVs and supporting files from applications submitted at
              least five years ago. Application records and decisions remain.
            </p>
            {retention && (
              <p className="text-sm text-slate-600 mt-2">
                {retention.count} document package(s) eligible · submitted on or
                before {new Date(retention.cutoff).toLocaleDateString()}
              </p>
            )}
            {retentionError && (
              <p role="alert" className="text-red-700 text-sm mt-2">
                {retentionError}
              </p>
            )}
          </div>
          <button
            className={`${button} text-red-700 flex items-center gap-2 border-red-200`}
            disabled={busy || !retention?.count}
            onClick={() => setConfirmDelete(true)}
          >
            <FiTrash2 /> Delete expired documents
          </button>
        </section>
      )}
      {compose && (
        <ReviewDialog
          title={
            selectedEligible
              ? "Email shortlisted applicants"
              : "Email selected applicants"
          }
          onClose={() => !busy && setCompose(false)}
        >
          <form onSubmit={sendEmail} className="space-y-4">
            <p className="text-sm text-slate-500">
              One message to{" "}
              {new Set(selectedApplications.map((a) => a.email)).size} unique
              applicant(s). Recipients’ email addresses are hidden from each
              other.
            </p>
            <label className="block">
              <span className="block mb-2 font-medium">Subject</span>
              <input
                className={input}
                required
                maxLength={200}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="block mb-2 font-medium">Message</span>
              <textarea
                className={input}
                required
                maxLength={10000}
                rows={7}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Include the position, next steps and any interview details."
              />
            </label>
            <div className="flex justify-end gap-3">
              <button
                className={button}
                type="button"
                disabled={busy}
                onClick={() => setCompose(false)}
              >
                Cancel
              </button>
              <button
                disabled={busy}
                className="rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white disabled:opacity-50"
              >
                {busy ? "Sending…" : "Send email to all"}
              </button>
            </div>
          </form>
        </ReviewDialog>
      )}
      {confirmDelete && (
        <ReviewDialog
          title="Delete documents older than five years?"
          onClose={() => !busy && setConfirmDelete(false)}
        >
          <p className="text-slate-600 mb-4">
            This permanently deletes {retention?.count} eligible CV/document
            package(s). Application records remain. Recent documents are
            preserved. This action cannot be undone.
          </p>
          <p className="text-sm text-slate-500 mb-6">
            Any files that cannot be deleted will be reported and preserved for
            retry.
          </p>
          <div className="flex justify-end gap-3">
            <button
              className={button}
              disabled={busy}
              onClick={() => setConfirmDelete(false)}
            >
              Cancel
            </button>
            <button
              className="bg-red-600 text-white px-4 py-2.5 rounded-xl font-semibold disabled:opacity-50"
              disabled={busy}
              onClick={removeExpired}
            >
              {busy ? "Deleting…" : "Permanently delete expired documents"}
            </button>
          </div>
        </ReviewDialog>
      )}
      {details && (
        <ReviewDialog
          title="Application details"
          onClose={() => setDetails(null)}
        >
          <dl className="grid grid-cols-2 gap-4 text-sm">
            {[
              ["Applicant", `${details.firstName} ${details.lastName}`],
              ["NIC", details.nic || "Not recorded (legacy application)"],
              ["Email", details.email],
              ["Mobile", details.mobileNumber],
              ["Position", details.jobRole],
              [
                "Faculty / department",
                `${details.faculty || "Not recorded"} / ${details.department || "Not recorded"}`,
              ],
              ["Status", statuses[details.status]],
              [
                "Supporting files",
                details.supportingDocuments
                  ?.map((file) => file.name)
                  .join(", ") || "None",
              ],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-slate-500">{label}</dt>
                <dd className="font-medium mt-1 break-words">{value}</dd>
              </div>
            ))}
          </dl>
          <h3 className="font-semibold mt-6 mb-3">Review history</h3>
          {details.reviewHistory?.length ? (
            <ol className="text-sm space-y-2">
              {details.reviewHistory.map((review, i) => (
                <li key={i}>
                  {statuses[review.status]} · {review.by} ·{" "}
                  {new Date(review.date).toLocaleString()}
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-slate-500">No review decisions yet.</p>
          )}
        </ReviewDialog>
      )}
    </div>
  );
}

function Summary({ icon, label, value }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4">
      <span className="p-3 rounded-xl bg-blue-50 text-blue-600 text-xl">
        {icon}
      </span>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-slate-500 mt-1">{label}</p>
      </div>
    </div>
  );
}
function ReviewActions({ application, busy, onDecide }) {
  const [status, setStatus] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onDecide(status);
        setStatus("");
      }}
      className="flex items-center gap-2"
    >
      <select
        aria-label={`Review decision for ${application.firstName} ${application.lastName}`}
        className="border border-slate-200 rounded-lg px-2 py-2 bg-white max-w-36"
        value={status}
        required
        disabled={busy}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="">Choose action</option>
        {[
          ["shortlisted", "Shortlist"],
          ["selected", "Approve / select"],
          ["rejected", "Reject"],
          ["hold", "Hold"],
          ["pending", "Return to pending"],
        ]
          .filter(([value]) => value !== application.status)
          .map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
      </select>
      <button
        disabled={busy || !status}
        className="text-blue-700 font-semibold disabled:text-slate-300"
      >
        Apply
      </button>
    </form>
  );
}
