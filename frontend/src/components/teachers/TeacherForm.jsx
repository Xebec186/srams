import { useState } from "react";
import { usersApi } from "../../api";
import { useToast } from "../../context/ToastContext";

export default function TeacherForm({ schoolId, onSuccess, onCancel }) {
  const toast = useToast();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "Password123!",

    gender: "",
    phone: "",
    qualification: "",
    dateOfBirth: "",
    dateEmployed: "",
  });

  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
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
      const message = err.response?.data?.message || "Failed to register teacher. Please check if username/email already exists.";
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
            onChange={handleChange}
            required
          />
          <input
            name="lastName"
            placeholder="Last Name"
            className="input border border-black/10 p-1 rounded"
            onChange={handleChange}
            required
          />
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
            onChange={handleChange}
            required
          />
          <input
            name="email"
            placeholder="Email"
            className="input border border-black/10 p-1 rounded"
            onChange={handleChange}
            required
          />
        </div>

        <div className="mt-3">
            <label className="text-xs text-neutral-400">Default Password</label>
            <input
                name="password"
                type="password"
                value={form.password}
                className="input border border-black/10 p-1 rounded w-full"
                disabled
            />
        </div>
      </div>

      {/* ===== PROFESSIONAL INFO ===== */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-500 mb-2">
          Professional Details
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <input
            name="qualification"
            placeholder="Qualification"
            className="input border border-black/10 p-1 rounded"
            onChange={handleChange}
          />
          <input
            type="date"
            name="dateEmployed"
            className="input border border-black/10 p-1 rounded"
            onChange={handleChange}
          />
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
            onChange={handleChange}
          >
            <option value="">Gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>

          <input
            type="date"
            name="dateOfBirth"
            className="input border border-black/10 p-1 rounded"
            onChange={handleChange}
          />
        </div>

        <input
          name="phone"
          placeholder="Phone Number"
          className="input mt-3 border border-black/10 p-1 rounded w-full"
          onChange={handleChange}
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
