import { useState } from "react";
import { usersApi } from "../../api";
import { useToast } from "../../context/ToastContext";
import { FiEye, FiEyeOff, FiRefreshCw } from "react-icons/fi";

export default function TeacherForm({ schoolId, onSuccess, onCancel }) {
  const toast = useToast();
  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    username: "",
    email: "",
    password: "Password123!",

    staffId: "",
    gender: "",
    phone: "",
    qualification: "",
    dateOfBirth: "",
    dateEmployed: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function generatePassword() {
    const chars =
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let generated = "";
    for (let i = 0; i < 12; i += 1) {
      generated += chars[Math.floor(Math.random() * chars.length)];
    }
    setForm((prev) => ({ ...prev, password: generated }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!schoolId) {
      toast.error("School context is missing. Please reload and try again.");
      return;
    }
    setLoading(true);
    try {
      await usersApi.create({
        ...form,
        role: "TEACHER",
        schoolId,
      });
      toast.success("Teacher registered successfully");
      onSuccess();
    } catch (err) {
      console.error("Teacher creation failed:", err);
      const message =
        err.response?.data?.message ||
        "Failed to register teacher. Please check if username/email already exists.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ===== BASIC INFO ===== */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-500 mb-2">
          Basic Information
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <input
            name="firstName"
            placeholder="First Name"
            className="input border border-black/10 p-1 rounded"
            value={form.firstName}
            onChange={handleChange}
            required
          />
          <input
            name="middleName"
            placeholder="Middle Name (Optional)"
            className="input border border-black/10 p-1 rounded"
            value={form.middleName}
            onChange={handleChange}
          />
          <input
            name="lastName"
            placeholder="Last Name"
            className="input border border-black/10 p-1 rounded"
            value={form.lastName}
            onChange={handleChange}
            required
          />
          <label for="date-of-birth">
            <span className="text-neutral-500">Date of Birth: </span>
            <input
              type="date"
              id="date-of-birth"
              name="dateOfBirth"
              className="input border border-black/10 p-1 rounded"
              value={form.dateOfBirth}
              onChange={handleChange}
              required
              title="Date of Birth"
            />
          </label>
        </div>
      </div>

      {/* ===== ACCOUNT INFO ===== */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-500 mb-2">
          Account Details
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <input
            name="username"
            placeholder="Username"
            className="input border border-black/10 p-1 rounded"
            value={form.username}
            onChange={handleChange}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="input border border-black/10 p-1 rounded"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mt-3">
          <label className="text-xs text-neutral-400">
            Temporary Password *
          </label>
          <div className="relative mt-1">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              minLength={8}
              className="input border border-black/10 p-1 rounded w-full pr-24"
              required
            />
            <div className="absolute inset-y-0 right-2 flex items-center gap-1">
              <button
                type="button"
                className="p-1 text-neutral-500 hover:text-neutral-700"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={
                  showPassword ? "Hide password value" : "Show password value"
                }
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
              <button
                type="button"
                className="p-1 text-neutral-500 hover:text-neutral-700"
                onClick={generatePassword}
                aria-label="Generate a secure password"
                title="Generate password"
              >
                <FiRefreshCw size={16} />
              </button>
            </div>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Use at least 8 characters. Teacher should change this password on
            first login.
          </p>
        </div>
      </div>

      {/* ===== PROFESSIONAL INFO ===== */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-500 mb-2">
          Professional Details
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <input
            name="staffId"
            placeholder="Staff ID (Optional)"
            className="input border border-black/10 p-1 rounded"
            value={form.staffId}
            onChange={handleChange}
          />
          <input
            name="qualification"
            placeholder="Qualification (e.g. Diploma in Education)"
            className="input border border-black/10 p-1 rounded"
            value={form.qualification}
            onChange={handleChange}
          />
          <label for="date-employed">
            <span className="text-neutral-500">Date Employed: </span>
            <input
              type="date"
              id="date-employed"
              name="dateEmployed"
              className="input border border-black/10 p-1 rounded"
              value={form.dateEmployed}
              onChange={handleChange}
            />
          </label>
        </div>
      </div>

      {/* ===== PERSONAL INFO ===== */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-500 mb-2">
          Personal Details
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <select
            name="gender"
            className="input border border-black/10 p-1 rounded"
            value={form.gender}
            onChange={handleChange}
            required
          >
            <option value="">Gender *</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <input
          name="phone"
          placeholder="Phone Number"
          className="input mt-3 border border-black/10 p-1 rounded w-full"
          value={form.phone}
          onChange={handleChange}
          required
        />
      </div>

      {/* ===== ACTIONS ===== */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Creating..." : "Create Teacher"}
        </button>
      </div>
    </form>
  );
}
