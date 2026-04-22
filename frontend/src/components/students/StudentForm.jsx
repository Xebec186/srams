import React, { useState, useEffect } from "react";
import { studentsApi, schoolsApi, referenceApi } from "../../api";

const EMPTY = {
  firstName: "",
  middleName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  schoolId: "",
  gradeLevelId: "",
  enrollmentDate: "",
  enrollmentYear: new Date().getFullYear(),
  guardianName: "",
  guardianPhone: "",
  guardianRelation: "",
  address: "",
  nationality: "Ghanaian",
};

export default function StudentForm({
  onSuccess,
  onCancel,
  schoolId: presetSchoolId,
}) {
  const [form, setForm] = useState({
    ...EMPTY,
    schoolId: presetSchoolId || "",
  });
  const [schools, setSchools] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    referenceApi.getGradeLevels().then((r) => setGrades(r.data));
    if (!presetSchoolId)
      schoolsApi
        .list({ size: 200 })
        .then((r) => setSchools(r.data.content || []));
  }, [presetSchoolId]);

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await studentsApi.create({
        ...form,
        schoolId: Number(form.schoolId),
        gradeLevelId: Number(form.gradeLevelId),
        enrollmentYear: Number(form.enrollmentYear),
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to register student.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-danger">{error}</div>}

      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-3">
        Personal Information
      </p>

      <div className="form-grid-3">
        <div className="form-group">
          <label className="form-label">First Name *</label>
          <input
            className="form-control"
            value={form.firstName}
            onChange={set("firstName")}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Middle Name</label>
          <input
            className="form-control"
            value={form.middleName}
            onChange={set("middleName")}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Last Name *</label>
          <input
            className="form-control"
            value={form.lastName}
            onChange={set("lastName")}
            required
          />
        </div>
      </div>

      <div className="form-grid-3">
        <div className="form-group">
          <label className="form-label">Date of Birth *</label>
          <input
            className="form-control"
            type="date"
            value={form.dateOfBirth}
            onChange={set("dateOfBirth")}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Gender *</label>
          <select
            className="form-control"
            value={form.gender}
            onChange={set("gender")}
            required
          >
            <option value="">Select...</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Nationality</label>
          <input
            className="form-control"
            value={form.nationality}
            onChange={set("nationality")}
          />
        </div>
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 my-4">
        School & Enrolment
      </p>

      <div className="form-grid-2">
        {!presetSchoolId && (
          <div className="form-group">
            <label className="form-label">School *</label>
            <select
              className="form-control"
              value={form.schoolId}
              onChange={set("schoolId")}
              required
            >
              <option value="">Select school...</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="form-group">
          <label className="form-label">Grade Level *</label>
          <select
            className="form-control"
            value={form.gradeLevelId}
            onChange={set("gradeLevelId")}
            required
          >
            <option value="">Select grade...</option>
            {grades.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Enrolment Date *</label>
          <input
            className="form-control"
            type="date"
            value={form.enrollmentDate}
            onChange={set("enrollmentDate")}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Enrolment Year *</label>
          <input
            className="form-control"
            type="number"
            min="2000"
            max="2099"
            value={form.enrollmentYear}
            onChange={set("enrollmentYear")}
            required
          />
        </div>
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 my-4">
        Guardian & Contact
      </p>

      <div className="form-grid-3">
        <div className="form-group">
          <label className="form-label">Guardian Name</label>
          <input
            className="form-control"
            value={form.guardianName}
            onChange={set("guardianName")}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Guardian Phone</label>
          <input
            className="form-control"
            type="tel"
            value={form.guardianPhone}
            onChange={set("guardianPhone")}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Relation</label>
          <select
            className="form-control"
            value={form.guardianRelation}
            onChange={set("guardianRelation")}
          >
            <option value="">Select...</option>
            <option value="Parent">Parent</option>
            <option value="Guardian">Guardian</option>
            <option value="Relative">Relative</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Home Address</label>
        <input
          className="form-control"
          value={form.address}
          onChange={set("address")}
        />
      </div>

      <div className="flex justify-end gap-3 mt-2">
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Registering..." : "Register Student"}
        </button>
      </div>
    </form>
  );
}
