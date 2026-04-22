import React, { useState, useEffect, useCallback } from "react";
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

export default function SchoolTransfers() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const schoolId = user?.schoolId;

  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [direction, setDirection] = useState("both");
  const [statusFilter, setStatusFilter] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [showInitiate, setShowInitiate] = useState(false);
  const [schools, setSchools] = useState([]);
  const [form, setForm] = useState({
    studentId: "",
    toSchoolId: "",
    reason: "",
  });
  const [formSaving, setFormSaving] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    schoolsApi
      .list({ size: 200 })
      .then((r) => setSchools(r.data.content || []));
  }, []);

  const load = useCallback(async () => {
    if (!schoolId) return;
    setLoading(true);
    try {
      const res = await transfersApi.getBySchool(schoolId, {
        status: statusFilter || undefined,
        direction,
      });
      setTransfers(Array.isArray(res.data) ? res.data : []);
    } finally {
      setLoading(false);
    }
  }, [schoolId, statusFilter, direction]);

  useEffect(() => {
    load();
  }, [load]);

  const doAction = async (action, reason = null) => {
    setActionLoading(true);
    try {
      if (action === "approve") await transfersApi.approveSending(selected.id);
      else if (action === "confirm")
        await transfersApi.confirmReceiving(selected.id);
      else if (action === "reject")
        await transfersApi.reject(selected.id, reason);
      setSelected(null);
      setShowReject(false);
      setRejectReason("");
      success("Transfer status updated.");
      load();
    } catch (err) {
      toastError(err.response?.data?.message || "Failed to update transfer.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleInitiate = async (e) => {
    e.preventDefault();
    setFormSaving(true);
    try {
      await transfersApi.initiate({
        studentId: Number(form.studentId),
        toSchoolId: Number(form.toSchoolId),
        reason: form.reason,
      });
      setShowInitiate(false);
      setForm({ studentId: "", toSchoolId: "", reason: "" });
      success("Transfer request initiated successfully.");
      load();
    } catch (err) {
      toastError(err.response?.data?.message || "Failed to initiate transfer.");
    } finally {
      setFormSaving(false);
    }
  };

  const isOutgoing = (t) => t.fromSchoolId === schoolId;
  const isIncoming = (t) => t.toSchoolId === schoolId;

  return (
    <div>
      <PageHeader
        title="Transfer Requests"
        subtitle="Manage incoming and outgoing student transfers"
        action={
          <button
            className="btn btn-primary"
            onClick={() => setShowInitiate(true)}
          >
            + Initiate Transfer
          </button>
        }
      />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <label className="text-sm text-neutral-500">Direction:</label>
          <select
            className="form-control w-40"
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
          >
            <option value="both">All</option>
            <option value="outgoing">Outgoing</option>
            <option value="incoming">Incoming</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-neutral-500">Status:</label>
          <select
            className="form-control w-48"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="SENDING_APPROVED">Sending Approved</option>
            <option value="RECEIVING_CONFIRMED">Receiving Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <Spinner center />
        ) : transfers.length === 0 ? (
          <EmptyState
            icon="transfer"
            title="No transfer requests found"
            description="Adjust the filters above or initiate a new transfer."
          />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Student</th>
                  <th>USID</th>
                  <th>From School</th>
                  <th>To School</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-bold ${isOutgoing(t) ? "bg-warning-100 text-warning-600" : "bg-info-100 text-info-600"}`}
                      >
                        {isOutgoing(t) ? "OUT" : "IN"}
                      </span>
                    </td>
                    <td className="font-medium">{t.studentName}</td>
                    <td>
                      <span className="usid-tag">{t.studentUsid}</span>
                    </td>
                    <td className="text-sm text-neutral-500">
                      {t.fromSchoolName}
                    </td>
                    <td className="text-sm">{t.toSchoolName}</td>
                    <td className="text-sm">{formatDate(t.requestDate)}</td>
                    <td>
                      <Badge className={getStatusBadgeClass(t.status)}>
                        {t.status.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => setSelected(t)}
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Transfer Request"
        size="modal-lg"
      >
        {selected && (
          <div>
            <TransferTimeline status={selected.status} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-4">
              {[
                ["Student", selected.studentName],
                ["USID", selected.studentUsid],
                ["From School", selected.fromSchoolName],
                ["To School", selected.toSchoolName],
                ["Requested By", selected.requestedByName || "—"],
                ["Request Date", formatDate(selected.requestDate)],
                ["Reason", selected.reason || "—"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="bg-neutral-50 border border-neutral-200 rounded-md p-3"
                >
                  <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                    {label}
                  </div>
                  <div className="text-sm font-medium">{value}</div>
                </div>
              ))}
            </div>

            {selected.rejectionReason && (
              <div className="mb-3 text-sm text-danger-600">
                Rejection reason: {selected.rejectionReason}
              </div>
            )}

            <div className="flex justify-end gap-3">
              {selected.status === "PENDING" && isOutgoing(selected) && (
                <>
                  <button
                    className="btn btn-danger"
                    onClick={() => setShowReject(true)}
                    disabled={actionLoading}
                  >
                    Reject
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => doAction("approve")}
                    disabled={actionLoading}
                  >
                    Approve Sending
                  </button>
                </>
              )}
              {selected.status === "SENDING_APPROVED" &&
                isIncoming(selected) && (
                  <button
                    className="btn btn-primary"
                    onClick={() => doAction("confirm")}
                    disabled={actionLoading}
                  >
                    Confirm Receiving
                  </button>
                )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showReject}
        onClose={() => setShowReject(false)}
        title="Reject Transfer Request"
        footer={
          <>
            <button
              className="btn btn-outline"
              onClick={() => setShowReject(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-danger"
              disabled={!rejectReason.trim() || actionLoading}
              onClick={() => doAction("reject", rejectReason.trim())}
            >
              {actionLoading ? "Rejecting..." : "Confirm Reject"}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Rejection reason *</label>
          <textarea
            className="form-control"
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Enter reason for rejection..."
          />
        </div>
      </Modal>

      <Modal
        isOpen={showInitiate}
        onClose={() => setShowInitiate(false)}
        title="Initiate Transfer Request"
        footer={
          <>
            <button
              className="btn btn-outline"
              onClick={() => setShowInitiate(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleInitiate}
              disabled={formSaving}
            >
              {formSaving ? "Submitting..." : "Submit Request"}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Student USID or Name *</label>
          <input
            className="form-control"
            placeholder="Enter student USID..."
            value={form.studentId}
            onChange={(e) =>
              setForm((f) => ({ ...f, studentId: e.target.value }))
            }
          />
          <div className="form-error">
            Enter the student's numeric ID or search by USID.
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Destination School *</label>
          <select
            className="form-control"
            value={form.toSchoolId}
            onChange={(e) =>
              setForm((f) => ({ ...f, toSchoolId: e.target.value }))
            }
          >
            <option value="">Select school...</option>
            {schools
              .filter((s) => s.id !== schoolId)
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.district}
                </option>
              ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Reason</label>
          <textarea
            className="form-control"
            rows={3}
            value={form.reason}
            onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
            placeholder="State the reason for this transfer request..."
          />
        </div>
      </Modal>
    </div>
  );
}
