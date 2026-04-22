import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { transfersApi, schoolsApi } from "../../api";
import {
  PageHeader,
  Spinner,
  Badge,
  Modal,
  EmptyState,
} from "../../components/common";
import { formatDate, getStatusBadgeClass, getTransferStep } from "../../utils";

const STEP_LABELS = [
  "Pending",
  "Sending Approved",
  "Receiving Confirmed",
  "Completed",
];

function TransferTimeline({ status }) {
  const current = getTransferStep(status);
  const isTerminal = ["REJECTED", "CANCELLED"].includes(status);
  return (
    <div className="transfer-timeline my-4">
      {STEP_LABELS.map((label, i) => (
        <div
          key={label}
          className={`timeline-step ${i < current ? "completed" : ""}`}
        >
          <div
            className={`timeline-dot ${!isTerminal && i === current ? "active" : i < current ? "completed" : ""}`}
          >
            {i < current ? "✓" : i + 1}
          </div>
          <div className="timeline-label">{label}</div>
        </div>
      ))}
    </div>
  );
}

export default function StudentTransfers() {
  const { user } = useAuth();
  const { warning, success, error: toastError } = useToast();
  const studentId = user?.studentId;
  const [transfers, setTransfers] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ toSchoolId: "", reason: "" });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    if (!studentId) return;
    setLoading(true);
    transfersApi
      .getByStudent(studentId)
      .then((r) => setTransfers(Array.isArray(r.data) ? r.data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [studentId]);
  useEffect(() => {
    schoolsApi
      .list({ size: 200 })
      .then((r) => setSchools(r.data.content || []));
  }, []);

  const hasActiveTransfer = transfers.some((t) =>
    ["PENDING", "SENDING_APPROVED", "RECEIVING_CONFIRMED"].includes(t.status),
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await transfersApi.initiate({
        studentId,
        toSchoolId: Number(form.toSchoolId),
        reason: form.reason,
      });
      setShowForm(false);
      setForm({ toSchoolId: "", reason: "" });
      success("Transfer request submitted successfully.");
      load();
    } catch (err) {
      toastError(
        err.response?.data?.message || "Failed to submit transfer request.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (hasActiveTransfer) {
      warning(
        "You have an active transfer request in progress. You cannot submit another until it is resolved.",
      );
    }
  }, [hasActiveTransfer, warning]);

  return (
    <div>
      <PageHeader
        title="Transfer Requests"
        subtitle="Submit and track your school transfer applications"
        action={
          !hasActiveTransfer && (
            <button
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              + Request Transfer
            </button>
          )
        }
      />

      {loading ? (
        <Spinner center />
      ) : transfers.length === 0 ? (
        <EmptyState
          icon="transfer"
          title="No Transfer Requests"
          description="You have not submitted any transfer requests yet."
        />
      ) : (
        <div className="space-y-3">
          {transfers.map((t) => (
            <div key={t.id} className="card p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm font-semibold mb-1">
                    {t.fromSchoolName} → {t.toSchoolName}
                  </div>
                  <div className="text-xs text-neutral-400">
                    Submitted {formatDate(t.requestDate)}
                    {t.reason ? ` · ${t.reason}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getStatusBadgeClass(t.status)}>
                    {t.status.replace("_", " ")}
                  </Badge>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => setSelected(t)}
                  >
                    Details
                  </button>
                </div>
              </div>
              {!["COMPLETED", "REJECTED", "CANCELLED"].includes(t.status) && (
                <TransferTimeline status={t.status} />
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Request School Transfer"
        footer={
          <>
            <button
              className="btn btn-outline"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Destination School *</label>
          <select
            className="form-control"
            value={form.toSchoolId}
            onChange={(e) =>
              setForm((f) => ({ ...f, toSchoolId: e.target.value }))
            }
            required
          >
            <option value="">Select school...</option>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.district}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Reason for Transfer</label>
          <textarea
            className="form-control"
            rows={3}
            placeholder="Briefly explain why you are requesting a transfer..."
            value={form.reason}
            onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
          />
        </div>
        <div className="text-sm text-neutral-400">
          Your request will be reviewed by your current school and the
          destination school. You can track the approval status on this page.
        </div>
      </Modal>

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Transfer Details"
      >
        {selected && (
          <div>
            <TransferTimeline status={selected.status} />
            <div className="space-y-2">
              {[
                ["From School", selected.fromSchoolName],
                ["To School", selected.toSchoolName],
                ["Request Date", formatDate(selected.requestDate)],
                ["Status", selected.status.replace("_", " ")],
                ["Reason", selected.reason || "—"],
                ["Rejection Reason", selected.rejectionReason || "—"],
              ].map(([label, value]) => (
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
        )}
      </Modal>
    </div>
  );
}
