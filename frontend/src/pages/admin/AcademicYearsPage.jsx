// src/pages/admin/AcademicYearsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { referenceApi } from '../../api';
import { PageHeader, Spinner, Badge, Modal, EmptyState } from '../../components/common';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils';
import client from '../../api';

const EMPTY_YEAR = { label: '', startDate: '', endDate: '' };
const EMPTY_TERM = { termNumber: 1, startDate: '', endDate: '' };

export default function AcademicYearsPage() {
  const { success, error: toastError } = useToast();
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showYearForm, setShowYearForm] = useState(false);
  const [showTermForm, setShowTermForm] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);
  const [yearForm, setYearForm] = useState(EMPTY_YEAR);
  const [termForm, setTermForm] = useState(EMPTY_TERM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await referenceApi.getAcademicYears();
      setYears(res.data || []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const setY = f => e => setYearForm(v => ({ ...v, [f]: e.target.value }));
  const setT = f => e => setTermForm(v => ({ ...v, [f]: e.target.value }));

  const handleAddYear = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await client.post('/academic-years', yearForm);
      success('Academic year created successfully.');
      setShowYearForm(false); setYearForm(EMPTY_YEAR); load();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to create academic year.');
    } finally { setSaving(false); }
  };

  const handleSetCurrent = async (yearId) => {
    try {
      await client.put(`/academic-years/${yearId}/set-current`);
      success('Current academic year updated.');
      load();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to set current year.');
    }
  };

  const handleAddTerm = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await client.post(`/academic-years/${selectedYear.id}/terms`, {
        termNumber: Number(termForm.termNumber),
        startDate: termForm.startDate,
        endDate: termForm.endDate,
      });
      success('Term added successfully.');
      setShowTermForm(false); setTermForm(EMPTY_TERM); load();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to add term.');
    } finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader
        title="Academic Years"
        subtitle="Manage academic calendar years and terms"
        action={
          <button className="btn btn-primary" onClick={() => setShowYearForm(true)}>
            + Add Academic Year
          </button>
        }
      />

      {loading ? <Spinner center /> : years.length === 0 ? (
        <EmptyState icon="🗓" title="No academic years configured"
          description="Add the current academic year to get started." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {years.map(year => (
            <div key={year.id} className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="card-title">{year.label}</span>
                  {year.current && <Badge className="badge-success">Current</Badge>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {!year.current && (
                    <button className="btn btn-outline btn-sm" onClick={() => handleSetCurrent(year.id)}>
                      Set as Current
                    </button>
                  )}
                  <button className="btn btn-primary btn-sm" onClick={() => {
                    setSelectedYear(year);
                    setShowTermForm(true);
                  }}>
                    + Add Term
                  </button>
                </div>
              </div>

              <div className="card-body">
                <div style={{ fontSize: 13, color: 'var(--color-neutral-500)', marginBottom: 12 }}>
                  {formatDate(year.startDate)} — {formatDate(year.endDate)}
                </div>

                {year.terms && year.terms.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {year.terms.map(term => (
                      <div key={term.id} style={{
                        background: 'var(--color-neutral-50)',
                        border: '1px solid var(--color-neutral-200)',
                        borderRadius: 8, padding: '12px 16px',
                      }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary-700)',
                          marginBottom: 6 }}>
                          Term {term.termNumber}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>
                          {formatDate(term.startDate)} — {formatDate(term.endDate)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: 'var(--color-neutral-400)', fontStyle: 'italic' }}>
                    No terms added yet.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Academic Year Modal */}
      <Modal isOpen={showYearForm} onClose={() => setShowYearForm(false)} title="Add Academic Year"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setShowYearForm(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddYear} disabled={saving}>
              {saving ? 'Saving...' : 'Add Year'}
            </button>
          </>
        }>
        <div className="form-group">
          <label className="form-label">Label (e.g. 2024/2025) *</label>
          <input className="form-control" value={yearForm.label} onChange={setY('label')}
            placeholder="2024/2025" required />
        </div>
        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Start Date *</label>
            <input className="form-control" type="date" value={yearForm.startDate}
              onChange={setY('startDate')} required />
          </div>
          <div className="form-group">
            <label className="form-label">End Date *</label>
            <input className="form-control" type="date" value={yearForm.endDate}
              onChange={setY('endDate')} required />
          </div>
        </div>
      </Modal>

      {/* Add Term Modal */}
      <Modal isOpen={showTermForm} onClose={() => setShowTermForm(false)}
        title={`Add Term — ${selectedYear?.label}`}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setShowTermForm(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddTerm} disabled={saving}>
              {saving ? 'Saving...' : 'Add Term'}
            </button>
          </>
        }>
        <div className="form-group">
          <label className="form-label">Term Number *</label>
          <select className="form-control" value={termForm.termNumber} onChange={setT('termNumber')}>
            <option value={1}>Term 1</option>
            <option value={2}>Term 2</option>
            <option value={3}>Term 3</option>
          </select>
        </div>
        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Start Date *</label>
            <input className="form-control" type="date" value={termForm.startDate}
              onChange={setT('startDate')} required />
          </div>
          <div className="form-group">
            <label className="form-label">End Date *</label>
            <input className="form-control" type="date" value={termForm.endDate}
              onChange={setT('endDate')} required />
          </div>
        </div>
      </Modal>
    </div>
  );
}
