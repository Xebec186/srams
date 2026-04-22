import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { usersApi } from "../../api";
import {
  PageHeader,
  Spinner,
  Badge,
  EmptyState,
} from "../../components/common";
import { formatDate } from "../../utils";

export default function SchoolTeachers() {
  const { user } = useAuth();
  const schoolId = user?.schoolId;
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!schoolId) return;
    setLoading(true);
    try {
      const res = await usersApi.list({ schoolId, role: "TEACHER", size: 100 });
      setTeachers(res.data.content || []);
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <PageHeader title="Teachers" subtitle="Teaching staff at your school" />

      <div className="card">
        {loading ? (
          <Spinner center />
        ) : teachers.length === 0 ? (
          <EmptyState
            icon="teacher"
            title="No teachers found"
            description="Teachers are added by GES Admin. Contact your district office."
          />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Last Login</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((t) => (
                  <tr key={t.id}>
                    <td className="font-medium">
                      {t.firstName} {t.lastName}
                    </td>
                    <td className="font-mono text-sm">{t.username}</td>
                    <td className="text-sm text-neutral-500">{t.email}</td>
                    <td>
                      <Badge
                        className={t.active ? "badge-success" : "badge-neutral"}
                      >
                        {t.active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="text-sm text-neutral-400">
                      {t.lastLogin ? formatDate(t.lastLogin) : "Never"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
