import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { StatCard, PageHeader, Spinner } from "../../components/common";
import { referenceApi, attendanceApi, teacherAssignmentsApi } from "../../api";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
  });

  useEffect(() => {
    async function loadStats() {
      if (!user?.schoolId || !user?.userId) {
        setLoading(false);
        return;
      }
      try {
        const today = new Date().toISOString().split("T")[0];
        const [assignmentRes, yearRes] = await Promise.all([
          teacherAssignmentsApi.getByTeacher(user.userId),
          referenceApi.getCurrentYear(),
        ]);
        const assignedGrades = Array.from(
          new Set(
            (assignmentRes.data || [])
              .filter((a) => a.active)
              .map((a) => String(a.gradeLevelId)),
          ),
        );

        if (assignedGrades.length === 0) {
          setStats({ total: 0, present: 0, absent: 0, late: 0 });
          return;
        }

        const termsRes = await referenceApi.getTerms(yearRes.data.id);
        const termIds = new Set((termsRes.data || []).map((t) => Number(t.id)));
        const classAttendanceResults = await Promise.all(
          assignedGrades.map((gradeLevelId) =>
            attendanceApi.getClassAttendance({
              schoolId: user.schoolId,
              date: today,
              gradeLevelId,
            }),
          ),
        );

        const teacherRecords = classAttendanceResults
          .flatMap((r) => r.data || [])
          .filter(
            (r) =>
              Number(r.markedByUserId) === Number(user.userId) &&
              termIds.has(Number(r.termId)),
          );

        const computed = teacherRecords.reduce(
          (acc, curr) => {
            acc.total += 1;
            if (curr.status === "PRESENT") acc.present += 1;
            else if (curr.status === "ABSENT") acc.absent += 1;
            else if (curr.status === "LATE") acc.late += 1;
            return acc;
          },
          { total: 0, present: 0, absent: 0, late: 0 },
        );
        setStats(computed);
      } catch (e) {
        console.error("Failed to load attendance stats", e);
        setStats({ total: 0, present: 0, absent: 0, late: 0 });
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [user]);

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.fullName?.split(" ")[0]}`}
        subtitle="Manage attendance and grades for your assigned classes"
      />

      {loading ? (
        <Spinner center />
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-4">
          <StatCard
            icon="users"
            value={stats.total}
            label="Total Students"
            color="blue"
          />
          <StatCard
            icon="check"
            value={stats.present}
            label="Present Today"
            color="green"
          />
          <StatCard
            icon="x"
            value={stats.absent}
            label="Absent Today"
            color="red"
          />
          <StatCard
            icon="clock"
            value={stats.late}
            label="Late Today"
            color="amber"
          />
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <span className="card-title">Quick Actions</span>
        </div>
        <div className="card-body flex flex-wrap gap-3">
          <a href="/teacher/attendance" className="btn btn-primary">
            Mark Attendance
          </a>
          <a href="/teacher/grades" className="btn btn-primary">
            Enter Grades
          </a>
        </div>
      </div>
    </div>
  );
}
