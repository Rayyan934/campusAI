"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

const ROLE_ROUTES: Record<string, string> = {
  company_admin: "/dashboard/admin",
  student: "/dashboard/student",
  teacher: "/dashboard/teacher",
  principal: "/dashboard/principal",
  office: "/dashboard/office",
  parent: "/dashboard/parent",
};

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND}/api/auth/request-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      setStep("otp");
    } catch {
      setError("Could not connect to server.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Step 1: verify OTP → get tokens
      const res = await fetch(`${BACKEND}/api/auth/verify-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid OTP.");
        return;
      }

      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);

      // Step 2: get user role → redirect
      const meRes = await fetch(`${BACKEND}/api/auth/me/`, {
        headers: { Authorization: `Bearer ${data.access}` },
      });

      const user = await meRes.json();
      localStorage.setItem("user", JSON.stringify(user));

      const route = ROLE_ROUTES[user.role] || "/dashboard/student";
      router.push(route);
    } catch {
      setError("Could not connect to server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>CampusAI</h1>

        {step === "email" ? (
          <>
            <p>Enter your school email to receive a login code</p>
            {error && <p className="error-msg">{error}</p>}
            <form onSubmit={handleRequestOtp}>
              <input
                type="email"
                placeholder="you@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          </>
        ) : (
          <>
            <p>Enter the 6-digit code sent to {email}</p>
            {error && <p className="error-msg">{error}</p>}
            <form onSubmit={handleVerifyOtp}>
              <input
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? "Verifying..." : "Verify & Login"}
              </button>
            </form>
            <p
              style={{ marginTop: 14, fontSize: 13, color: "#71717a", cursor: "pointer" }}
              onClick={() => { setStep("email"); setError(""); setOtp(""); }}
            >
              ← Use a different email
            </p>
          </>
        )}
      </div>
    </div>
  );
}
