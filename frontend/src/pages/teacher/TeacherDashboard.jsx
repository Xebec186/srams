import React from "react";
import { useAuth } from "../../context/AuthContext";
import { StatCard, PageHeader } from "../../components/common";

export default function TeacherDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.fullName?.split(" ")[0]}`}
        subtitle="Manage attendance and grades for your assigned classes"
      />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-4">
        <StatCard
          icon="calendar"
          value="32"
          label="Students in Class"
          colorClass="teal"
        />
        <StatCard
          icon="check"
          value="29"
          label="Present Today"
          colorClass="green"
        />
        <StatCard icon="x" value="2" label="Absent Today" colorClass="red" />
        <StatCard
          icon="clock"
          value="1"
          label="Late Today"
          colorClass="amber"
        />
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Today's Quick Actions</span>
        </div>
        <div className="card-body flex flex-wrap gap-3">
          <a href="/teacher/attendance" className="btn btn-primary">
            Mark Morning Attendance
          </a>
          <a href="/teacher/attendance" className="btn btn-outline">
            Mark Afternoon Attendance
          </a>
          <a href="/teacher/grades" className="btn btn-outline">
            Enter Grades
          </a>
        </div>
      </div>
    </div>
  );
}
