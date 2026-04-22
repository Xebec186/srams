import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { studentsApi } from "../../api";
import { PageHeader, Spinner } from "../../components/common";
import { formatDate } from "../../utils";
import { jwtDecode } from "jwt-decode";

export default function StudentProfile() {
  const { user } = useAuth();
  const token = user?.token;
  // const decodedToken = jwtDecode(token);
  // const studentId = decodedToken?.studentId;
  const studentId = "111"; // Using mock student ID for testing

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!studentId) return;
    studentsApi
      .getById(studentId)
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load profile.");
      })
      .then((r) => {
        console.log("Student profile data:", r.data);
        setStudent(r.data);
      })
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return <Spinner center />;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!student) return <div>Profile not found.</div>;

  return (
    <div>
      <PageHeader
        title="My Profile"
        subtitle="Your personal and academic details"
      />

      <div className="bg-primary-900 rounded-lg p-7 flex items-center gap-5 mb-6">
        <div className="w-18 h-18 rounded-full bg-primary-400 flex items-center justify-center text-2xl font-bold text-white">
          {student.fullName?.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="text-xl font-bold text-white">{student.fullName}</div>
          <div className="mt-2">
            <span className="usid-tag bg-white/10 border-white/20 text-white text-sm">
              {student.usid}
            </span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <InfoCard
          title="Personal Details"
          rows={[
            ["Full Name", student.fullName],
            ["Date of Birth", formatDate(student.dateOfBirth)],
            ["Gender", student.gender],
            ["Nationality", student.nationality],
          ]}
        />
        <InfoCard
          title="School Details"
          rows={[
            ["School", student.schoolName],
            ["Grade", student.gradeName],
            ["Enrolment Date", formatDate(student.enrollmentDate)],
            ["Status", student.status],
          ]}
        />
        <InfoCard
          title="Guardian Information"
          rows={[
            ["Guardian Name", student.guardianName || "—"],
            ["Phone", student.guardianPhone || "—"],
            ["Relation", student.guardianRelation || "—"],
            ["Address", student.address || "—"],
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
