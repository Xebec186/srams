import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { usersApi } from "../../api";
import { PageHeader, Spinner } from "../../components/common";

export default function TeacherProfile() {
  const { user } = useAuth();
  const { error: toastError } = useToast();
  const userId = user?.userId;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setError("User profile not found.");
      return;
    }
    usersApi
      .getById(userId)
      .then((r) => setProfile(r.data))
      .catch((err) => {
        const message = err.response?.data?.message || "Failed to load profile.";
        setError(message);
        toastError(message);
      })
      .finally(() => setLoading(false));
  }, [userId, toastError]);

  if (loading) return <Spinner center />;
  if (error) return <div className="text-neutral-500">{error}</div>;
  if (!profile) return <div>Profile not found.</div>;

  const initial = (profile.firstName || "?").charAt(0).toUpperCase();

  return (
    <div>
      <PageHeader
        title="My Profile"
        subtitle="View your account and school details"
      />

      <div className="bg-primary-900 rounded-lg p-7 flex items-center gap-5 mb-6">
        <div className="w-18 h-18 rounded-full bg-primary-400 flex items-center justify-center text-2xl font-bold text-white">
          {initial}
        </div>
        <div className="flex-1">
          <div className="text-xl font-bold text-white">
            {profile.firstName} {profile.lastName}
          </div>
          <div className="mt-2">
            <span className="usid-tag bg-white/10 border-white/20 text-white text-sm">
              {profile.role.replace("_", " ")}
            </span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <InfoCard
          title="Account Information"
          rows={[
            ["First Name", profile.firstName],
            ["Last Name", profile.lastName],
            ["Username", profile.username],
            ["Email Address", profile.email],
          ]}
        />
        <InfoCard
          title="School & System Details"
          rows={[
            ["School", profile.schoolName || "N/A"],
            ["Role", profile.role.replace("_", " ")],
            ["Status", profile.active ? "Active" : "Inactive"],
            [
              "Last Login",
              profile.lastLogin
                ? new Date(profile.lastLogin).toLocaleString()
                : "Never",
            ],
          ]}
        />
      </div>
    </div>
  );
}

function InfoCard({ title, rows }) {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">{title}</span>
      </div>
      <div className="card-body">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex justify-between py-2 border-b border-neutral-100 text-sm"
          >
            <span className="text-neutral-500">{label}</span>
            <span className="font-medium">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
