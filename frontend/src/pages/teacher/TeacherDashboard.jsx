import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { StatCard, PageHeader, Spinner } from "../../components/common";
import { referenceApi, attendanceApi } from "../../api";

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
      if (!user?.schoolId) return;
      try {
        const today = new Date().toISOString().split("T")[0];
        // Fetch grades to find student's grade level ID.
        // Assuming teacher is associated with a grade or can select one.
        // For dashboard summary, fetch for a default or first grade.
        const gRes = await referenceApi.getGradeLevels();
        if (gRes.data.length > 0) {
          const res = await attendanceApi.getClassAttendance({
            schoolId: user.schoolId,
            date: today,
            gradeLevelId: gRes.data[0].id,
          });

          const data = res.data || [];
          const stats = data.reduce(
            (acc, curr) => {
              acc.total += 1;
              if (curr.status === "PRESENT") acc.present += 1;
              else if (curr.status === "ABSENT") acc.absent += 1;
              else if (curr.status === "LATE") acc.late += 1;
              return acc;
            },
            { total: 0, present: 0, absent: 0, late: 0 },
          );

          setStats(stats);
        }
      } catch (e) {
        console.error("Failed to load attendance stats", e);
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
