// src/pages/admin/AdminReports.js
// Exports both AdminAttendanceReport and AdminPerformanceReport

import React, { useState, useEffect } from 'react';
import { schoolsApi, referenceApi, attendanceApi, performanceApi } from '../../api';
import { PageHeader, Spinner } from '../../components/common';
import { formatPercent } from '../../utils';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, LineChart, Line, Legend,
} from 'recharts';

// ============================================================
// Admin — System Attendance Report
// ============================================================
export function AdminAttendanceReport() {
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    schoolsApi.list({ size: 200 }).then(r => setSchools(r.data.content || []));
  }, []);

  const generate = async () => {
    if (!selectedSchool) return;
    setLoading(true); setSearched(true);
    try {
      const res = await attendanceApi.getSchoolReport(selectedSchool, { from: fromDate, to: toDate });
      setReport(Array.isArray(res.data)
        ? res.data
        : res.data
          ? [{
              attendanceDate: res.data.to || toDate,
              present: res.data.present || 0,
              absent: res.data.absent || 0,
              totalMarked: res.data.total || 0,
            }]
          : []);
    } finally { setLoading(false); }
  };

  // Aggregate by date
  const byDate = Object.values(
    report.reduce((acc, r) => {
      const k = r.attendanceDate;
      if (!acc[k]) acc[k] = { date: k, present: 0, absent: 0, total: 0 };
      acc[k].present += r.present || 0;
      acc[k].absent  += r.absent  || 0;
      acc[k].total   += r.totalMarked || 0;
      return acc;
    }, {})
  ).sort((a, b) => a.date.localeCompare(b.date))
   .map(d => ({
     ...d,
     rate: d.total > 0 ? Math.round(d.present / d.total * 100) : 0,
     label: new Date(d.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
   }));

  return (
    <div>
      <PageHeader title="Attendance Reports" subtitle="System-wide attendance analysis by school" />

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body">
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ marginBottom: 0, minWidth: 240 }}>
              <label className="form-label">School *</label>
              <select className="form-control" value={selectedSchool}
                onChange={e => setSelectedSchool(e.target.value)}>
                <option value="">Select school...</option>
                {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">From</label>
              <input className="form-control" type="date" value={fromDate}
                max={toDate} onChange={e => setFromDate(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">To</label>
              <input className="form-control" type="date" value={toDate}
                min={fromDate} max={new Date().toISOString().split('T')[0]}
                onChange={e => setToDate(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={generate} disabled={loading || !selectedSchool}>
              {loading ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>
      </div>

      {loading ? <Spinner center /> : searched && (
        byDate.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--color-neutral-400)' }}>
            No attendance data for the selected school and date range.
          </div>
        ) : (
          <>
            <div className="stat-grid" style={{ marginBottom: 16 }}>
              {[
                { label: 'Avg Rate', value: `${(byDate.reduce((s,d)=>s+d.rate,0)/byDate.length).toFixed(1)}%`, color: 'teal' },
                { label: 'Total Present', value: byDate.reduce((s,d)=>s+d.present,0).toLocaleString(), color: 'green' },
                { label: 'Total Absent', value: byDate.reduce((s,d)=>s+d.absent,0).toLocaleString(), color: 'red' },
                { label: 'Days Covered', value: byDate.length, color: 'blue' },
              ].map(({label, value, color}) => (
                <div key={label} className="stat-card">
                  <div className={`stat-icon ${color}`}>📅</div>
                  <div><div className="stat-value">{value}</div><div className="stat-label">{label}</div></div>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="card-header"><span className="card-title">Daily Attendance Rate</span></div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={byDate}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-neutral-100)" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0,100]} tickFormatter={v=>`${v}%`} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={v=>`${v}%`} />
                    <Line type="monotone" dataKey="rate" stroke="var(--color-primary-500)"
                      strokeWidth={2.5} dot={{ r: 3 }} name="Rate" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
}

// ============================================================
// Admin — System Performance Report
// ============================================================
export function AdminPerformanceReport() {
  const [schools, setSchools] = useState([]);
  const [grades, setGrades] = useState([]);
  const [terms, setTerms] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    async function loadRef() {
      const [sRes, gRes, yRes] = await Promise.all([
        schoolsApi.list({ size: 200 }),
        referenceApi.getGradeLevels(),
        referenceApi.getCurrentYear(),
      ]);
      setSchools(sRes.data.content || []);
      setGrades(gRes.data);
      const tRes = await referenceApi.getTerms(yRes.data.id);
      setTerms(tRes.data);
      if (tRes.data.length) setSelectedTerm(String(tRes.data[tRes.data.length-1].id));
    }
    loadRef();
  }, []);

  const generate = async () => {
    if (!selectedSchool || !selectedGrade || !selectedTerm) return;
    setLoading(true); setSearched(true);
    try {
      const res = await performanceApi.getClassResults({
        schoolId: selectedSchool, gradeLevelId: selectedGrade, termId: selectedTerm,
      });
      setResults(res.data || []);
    } finally { setLoading(false); }
  };

  // Grade distribution
  const gradeDist = ['A1','B2','B3','C4','C5','C6','D7','E8','F9'].map(g => ({
    grade: g, count: results.filter(r => r.grade === g).length,
  }));

  const avgScore = results.length > 0
    ? (results.reduce((s,r) => s+(r.totalScore||0), 0) / results.length).toFixed(1)
    : null;

  return (
    <div>
      <PageHeader title="Performance Reports" subtitle="Academic performance analysis across schools" />

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body">
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ marginBottom: 0, minWidth: 220 }}>
              <label className="form-label">School *</label>
              <select className="form-control" value={selectedSchool}
                onChange={e => setSelectedSchool(e.target.value)}>
                <option value="">Select school...</option>
                {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0, minWidth: 160 }}>
              <label className="form-label">Grade Level *</label>
              <select className="form-control" value={selectedGrade}
                onChange={e => setSelectedGrade(e.target.value)}>
                <option value="">Select grade...</option>
                {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0, minWidth: 180 }}>
              <label className="form-label">Term *</label>
              <select className="form-control" value={selectedTerm}
                onChange={e => setSelectedTerm(e.target.value)}>
                {terms.map(t => <option key={t.id} value={t.id}>Term {t.termNumber} — {t.academicYear?.label}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" onClick={generate}
              disabled={loading || !selectedSchool || !selectedGrade}>
              {loading ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>
      </div>

      {loading ? <Spinner center /> : searched && (
        results.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--color-neutral-400)' }}>
            No grade records found for the selected criteria.
          </div>
        ) : (
          <>
            <div className="stat-grid" style={{ marginBottom: 16 }}>
              {[
                { label: 'Total Records', value: results.length, color: 'teal' },
                { label: 'Avg Score', value: avgScore ? `${avgScore}/100` : '—', color: 'blue' },
                { label: 'Pass Rate', value: `${((results.filter(r=>(r.totalScore||0)>=50).length/results.length)*100).toFixed(1)}%`, color: 'green' },
                { label: 'Distinction (A1)', value: results.filter(r=>r.grade==='A1').length, color: 'amber' },
              ].map(({label,value,color}) => (
                <div key={label} className="stat-card">
                  <div className={`stat-icon ${color}`}>📊</div>
                  <div><div className="stat-value">{value}</div><div className="stat-label">{label}</div></div>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="card-header"><span className="card-title">Grade Distribution</span></div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={gradeDist}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-neutral-100)" />
                    <XAxis dataKey="grade" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" name="Students" radius={[4,4,0,0]}>
                      {gradeDist.map((entry, i) => (
                        <rect key={i} fill={
                          entry.grade === 'A1' ? '#059669'
                          : ['B2','B3'].includes(entry.grade) ? '#2563eb'
                          : ['C4','C5','C6'].includes(entry.grade) ? '#d97706'
                          : '#dc2626'
                        } />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
}
