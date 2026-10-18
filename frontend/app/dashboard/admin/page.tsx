"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

interface School {
  id: number;
  name: string;
  slug: string;
  ai_name: string;
  primary_color: string;
  is_active: boolean;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [schools, setSchools] = useState<School[]>([]);
  const [tab, setTab] = useState<"schools" | "add-school" | "add-user">("schools");

  // school form
  const [schoolForm, setSchoolForm] = useState({ name: "", slug: "", ai_name: "", primary_color: "#4F46E5" });

  // user form
  const [userForm, setUserForm] = useState({ first_name: "", last_name: "", email: "", phone: "", role: "student", school: "" });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function getToken() {
    return localStorage.getItem("access");
  }

  function authHeader() {
    return { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };
  }

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) { router.push("/"); return; }
    const parsed = JSON.parse(user);
    if (parsed.role !== "company_admin") { router.push("/"); return; }
    fetchSchools();
  }, [router]);

  async function fetchSchools() {
    const res = await fetch(`${BACKEND}/api/schools/`, { headers: authHeader() });
    if (res.ok) setSchools(await res.json());
  }

  async function handleAddSchool(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setMessage("");
    const res = await fetch(`${BACKEND}/api/schools/`, {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify(schoolForm),
    });
    if (res.ok) {
      setMessage("School created successfully.");
      setSchoolForm({ name: "", slug: "", ai_name: "", primary_color: "#4F46E5" });
      fetchSchools();
      setTab("schools");
    } else {
      const data = await res.json();
      setError(JSON.stringify(data));
    }
  }

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setMessage("");
    const payload = { ...userForm, username: userForm.email };
    const res = await fetch(`${BACKEND}/api/users/`, {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setMessage("User added successfully. They can now login via OTP.");
      setUserForm({ first_name: "", last_name: "", email: "", phone: "", role: "student", school: "" });
    } else {
      const data = await res.json();
      setError(JSON.stringify(data));
    }
  }

  function logout() {
    localStorage.clear();
    router.push("/");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f4f4f5" }}>

      {/* Header */}
      <div style={{ background: "#4f46e5", color: "#fff", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>CampusAI — Admin Panel</h2>
        <button onClick={logout} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", padding: "6px 14px", borderRadius: 6, cursor: "pointer" }}>
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, padding: "20px 32px 0" }}>
        {(["schools", "add-school", "add-user"] as const).map((t) => (
          <button key={t} onClick={() => { setTab(t); setMessage(""); setError(""); }}
            style={{ padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14,
              background: tab === t ? "#4f46e5" : "#fff", color: tab === t ? "#fff" : "#18181b" }}>
            {t === "schools" ? "Schools" : t === "add-school" ? "+ Add School" : "+ Add User"}
          </button>
        ))}
      </div>

      <div style={{ padding: "24px 32px" }}>
        {message && <p style={{ color: "#16a34a", marginBottom: 16, fontWeight: 500 }}>{message}</p>}
        {error && <p style={{ color: "#ef4444", marginBottom: 16 }}>{error}</p>}

        {/* Schools list */}
        {tab === "schools" && (
          <div>
            <h3 style={{ marginBottom: 16, fontWeight: 600 }}>All Schools ({schools.length})</h3>
            {schools.length === 0 && <p style={{ color: "#71717a" }}>No schools yet. Add one to get started.</p>}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {schools.map((s) => (
                <div key={s.id} style={{ background: "#fff", padding: "16px 20px", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: s.primary_color }} />
                  <div>
                    <p style={{ fontWeight: 600 }}>{s.name}</p>
                    <p style={{ fontSize: 13, color: "#71717a" }}>AI Name: {s.ai_name} · Slug: {s.slug}</p>
                  </div>
                  <span style={{ marginLeft: "auto", fontSize: 12, padding: "3px 10px", borderRadius: 20, background: s.is_active ? "#dcfce7" : "#fee2e2", color: s.is_active ? "#16a34a" : "#ef4444" }}>
                    {s.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add school form */}
        {tab === "add-school" && (
          <div style={{ background: "#fff", padding: 28, borderRadius: 12, maxWidth: 480, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <h3 style={{ marginBottom: 20, fontWeight: 600 }}>Onboard New School</h3>
            <form onSubmit={handleAddSchool} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "School Name", key: "name", placeholder: "Don Bosco School" },
                { label: "Slug", key: "slug", placeholder: "don-bosco" },
                { label: "AI Name", key: "ai_name", placeholder: "Bosco AI" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 4 }}>{label}</label>
                  <input value={schoolForm[key as keyof typeof schoolForm]}
                    onChange={(e) => setSchoolForm((p) => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder} required
                    style={{ width: "100%", padding: "9px 12px", border: "1px solid #e4e4e7", borderRadius: 8, fontSize: 14 }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 4 }}>Brand Color</label>
                <input type="color" value={schoolForm.primary_color}
                  onChange={(e) => setSchoolForm((p) => ({ ...p, primary_color: e.target.value }))}
                  style={{ width: 48, height: 36, border: "none", cursor: "pointer" }} />
              </div>
              <button type="submit" style={{ background: "#4f46e5", color: "#fff", border: "none", padding: "10px", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
                Create School
              </button>
            </form>
          </div>
        )}

        {/* Add user form */}
        {tab === "add-user" && (
          <div style={{ background: "#fff", padding: 28, borderRadius: 12, maxWidth: 480, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <h3 style={{ marginBottom: 20, fontWeight: 600 }}>Add User to School</h3>
            <form onSubmit={handleAddUser} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "First Name", key: "first_name", placeholder: "Rahul" },
                { label: "Last Name", key: "last_name", placeholder: "Sharma" },
                { label: "Email", key: "email", placeholder: "rahul@school.com", type: "email" },
                { label: "Phone", key: "phone", placeholder: "+91 9876543210" },
              ].map(({ label, key, placeholder, type }) => (
                <div key={key}>
                  <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 4 }}>{label}</label>
                  <input type={type || "text"} value={userForm[key as keyof typeof userForm]}
                    onChange={(e) => setUserForm((p) => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder} required={key !== "phone"}
                    style={{ width: "100%", padding: "9px 12px", border: "1px solid #e4e4e7", borderRadius: 8, fontSize: 14 }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 4 }}>Role</label>
                <select value={userForm.role} onChange={(e) => setUserForm((p) => ({ ...p, role: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #e4e4e7", borderRadius: 8, fontSize: 14 }}>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="principal">Principal</option>
                  <option value="office">Office Staff</option>
                  <option value="parent">Parent</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 4 }}>School</label>
                <select value={userForm.school} onChange={(e) => setUserForm((p) => ({ ...p, school: e.target.value }))} required
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #e4e4e7", borderRadius: 8, fontSize: 14 }}>
                  <option value="">Select a school</option>
                  {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <button type="submit" style={{ background: "#4f46e5", color: "#fff", border: "none", padding: "10px", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
                Add User
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
