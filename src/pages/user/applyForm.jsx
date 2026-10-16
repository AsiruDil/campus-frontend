import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiFileText,
  FiUploadCloud,
} from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../../api/axios";

const MAX_CV = 2 * 1024 * 1024;
const MAX_SUPPORT = 5 * 1024 * 1024;
const categories = [
  ["lecturer", "Lecturer"],
  ["probationary", "Probationary lecturer"],
  ["demo", "Demonstrator"],
];
const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500";

export default function ApplyForm() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { jobId, jobTitle } = state || {};
  const [profile] = useState(() => {
    try {
      return jwtDecode(localStorage.getItem("token"));
    } catch {
      return {};
    }
  });
  const [nic, setNic] = useState("");
  const [mobile, setMobile] = useState("");
  const [category, setCategory] = useState(state?.category || "");
  const [cv, setCv] = useState(null);
  const [supporting, setSupporting] = useState([]);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function chooseCV(event) {
    const file = event.target.files[0];
    if (
      file &&
      (!file.name.toLowerCase().endsWith(".pdf") ||
        file.size > MAX_CV ||
        !file.size)
    ) {
      setError("Choose a PDF CV no larger than 2 MB.");
      setCv(null);
      event.target.value = "";
      return;
    }
    setCv(file || null);
    setError("");
  }
  function chooseSupporting(event) {
    const files = Array.from(event.target.files);
    if (
      files.length > 10 ||
      files.some(
        (file) =>
          !/\.(pdf|png|jpe?g)$/i.test(file.name) ||
          !file.size ||
          file.size > MAX_SUPPORT,
      )
    ) {
      setError(
        "Choose up to 10 PDF, PNG or JPEG documents, each no larger than 5 MB.",
      );
      event.target.value = "";
      setSupporting([]);
      return;
    }
    setSupporting(files);
    setError("");
  }
  async function submit(event) {
    event.preventDefault();
    if (!cv) return setError("Please select your CV.");
    if (!/^(\d{9}[VX]|\d{12})$/i.test(nic.trim()))
      return setError("Enter a valid NIC: 9 digits and V/X, or 12 digits.");
    setBusy(true);
    setError("");
    const data = new FormData();
    data.append("jobId", jobId);
    data.append("nic", nic.trim().toUpperCase());
    data.append("mobileNumber", mobile);
    data.append("category", category);
    data.append("cv", cv);
    supporting.forEach((file) => data.append("supporting", file));
    try {
      await api.post("/api/apply/", data);
      setSubmitted(true);
      toast.success("Application submitted successfully.");
    } catch (failure) {
      setError(
        failure.response?.data?.message ||
          "Could not submit your application. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (!jobId)
    return (
      <main className="max-w-xl mx-auto p-10">
        <h1 className="text-2xl font-bold">Choose a vacancy first</h1>
        <p className="my-4">
          Your application needs a position. Browse the available vacancies to
          continue.
        </p>
        <button
          className="bg-blue-600 text-white px-5 py-3 rounded-xl"
          onClick={() => navigate("/home")}
        >
          Browse vacancies
        </button>
      </main>
    );
  if (submitted)
    return (
      <main className="max-w-xl mx-auto p-10 text-center">
        <FiCheckCircle className="text-emerald-600 mx-auto mb-6" size={56} />
        <h1 className="text-3xl font-bold">Application received</h1>
        <p className="my-5 text-slate-600">
          Your application for {jobTitle || jobId}, CV and supporting documents
          have been submitted together.
        </p>
        <button
          className="bg-blue-600 text-white px-6 py-3 rounded-xl"
          onClick={() => navigate("/home")}
        >
          Back to home
        </button>
      </main>
    );
  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-slate-600"
        >
          <FiArrowLeft /> Back to vacancy
        </button>
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <header className="bg-blue-700 text-white p-7 sm:p-9">
            <p className="text-blue-100 text-sm mb-2">YOUR NEXT OPPORTUNITY</p>
            <h1 className="text-3xl font-bold">
              Apply for {jobTitle || jobId}
            </h1>
            <p className="mt-3 text-blue-100">
              Complete your details and attach your documents in one place.
            </p>
          </header>
          <form
            onSubmit={submit}
            className="p-6 sm:p-9 space-y-8"
            aria-busy={busy}
          >
            <section>
              <h2 className="text-xl font-semibold mb-4">1. Your details</h2>
              <p className="bg-slate-50 rounded-xl p-4 mb-5 text-slate-600">
                Applying as{" "}
                <strong>
                  {profile.firstName} {profile.lastName}
                </strong>
                <br />
                {profile.email}
              </p>
              <div className="grid sm:grid-cols-2 gap-5">
                <label className="space-y-2">
                  <span className="block font-medium">
                    NIC number <span className="text-red-600">*</span>
                  </span>
                  <input
                    className={fieldClass}
                    value={nic}
                    onChange={(e) => setNic(e.target.value.toUpperCase())}
                    required
                    maxLength={12}
                    pattern="([0-9]{9}[VvXx]|[0-9]{12})"
                    placeholder="e.g. 200012345678"
                    autoComplete="off"
                  />
                  <span className="block text-sm text-slate-500">
                    Enter your own National Identity Card number.
                  </span>
                </label>
                <label className="space-y-2">
                  <span className="block font-medium">
                    Mobile number <span className="text-red-600">*</span>
                  </span>
                  <input
                    className={fieldClass}
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                    pattern="[+0-9 ()\-]{7,20}"
                    autoComplete="tel"
                    placeholder="+94 …"
                  />
                </label>
                <label className="space-y-2 sm:col-span-2">
                  <span className="block font-medium">
                    Position category <span className="text-red-600">*</span>
                  </span>
                  <select
                    className={fieldClass}
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="">Choose the position category</option>
                    {categories.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <span className="block text-sm text-slate-500">
                    The vacancy’s category takes precedence when already
                    assigned.
                  </span>
                </label>
              </div>
            </section>
            <section className="space-y-5">
              <h2 className="text-xl font-semibold">
                2. Application documents
              </h2>
              <p className="text-slate-500 text-sm">
                Upload the files below. We automatically package your CV and all
                supporting documents into a single ZIP. You do not need to
                create a ZIP yourself.
              </p>
              <label className="block border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-2xl p-5">
                <span className="flex items-center gap-2 font-semibold">
                  <FiUploadCloud /> CV — PDF, maximum 2 MB *
                </span>
                <input
                  className="mt-4 block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-blue-100 file:px-4 file:py-2 file:text-blue-800"
                  type="file"
                  accept=".pdf,application/pdf"
                  required
                  onChange={chooseCV}
                />
                {cv && (
                  <span className="block mt-3 text-sm text-emerald-700">
                    {cv.name} · {(cv.size / 1024).toFixed(0)} KB
                  </span>
                )}
              </label>
              <label className="block rounded-2xl border border-slate-200 p-5">
                <span className="flex items-center gap-2 font-semibold">
                  <FiFileText /> Certificates & research papers{" "}
                  <span className="text-slate-400 font-normal">(optional)</span>
                </span>
                <span className="block text-sm text-slate-500 mt-2">
                  Up to 10 files. PDF, PNG or JPEG; maximum 5 MB each.
                </span>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="mt-4 block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2"
                  onChange={chooseSupporting}
                />
              </label>
              {supporting.length > 0 && (
                <ul className="space-y-1 text-sm text-slate-600">
                  {supporting.map((file, i) => (
                    <li key={`${file.name}-${i}`}>
                      {file.name} · {(file.size / 1024).toFixed(0)} KB
                    </li>
                  ))}
                </ul>
              )}
            </section>
            {error && (
              <p role="alert" className="p-4 rounded-xl bg-red-50 text-red-700">
                {error}
              </p>
            )}
            <button
              disabled={busy}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl py-4 font-semibold"
            >
              {busy ? "Uploading and submitting…" : "Submit application"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
