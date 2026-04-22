import React, { useState, useEffect, useCallback } from "react";
import { transfersApi } from "../../api";
import {
  PageHeader,
  Spinner,
  Badge,
  EmptyState,
  Modal,
} from "../../components/common";
import { formatDate, getStatusBadgeClass, getTransferStep } from "../../utils";

const STEPS = [
  "Pending",
  "Sending Approved",
  "Receiving Confirmed",
  "Completed",
];

function TransferTimeline({ status }) {
  const current = getTransferStep(status);
  const rejected = status === "REJECTED" || status === "CANCELLED";
  return (
    <div className="transfer-timeline">
      {STEPS.map((label, i) => (
        <div
          key={label}
          className={`timeline-step ${i < current ? "completed" : ""}`}
        >
          <div
            className={`timeline-dot ${rejected ? "" : i === current ? "active" : i < current ? "completed" : ""}`}
          >
            {i < current ? "✓" : i + 1}
          </div>
          <div className="timeline-label">{label}</div>
        </div>
      ))}
    </div>
  );
}

export default function AdminTransfers() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await transfersApi.getBySchool(null, {
        status: statusFilter || undefined,
        direction: "both",
      });
      setTransfers(Array.isArray(res.data) ? res.data : []);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const doAction = async (action) => {
    setActionLoading(true);
    try {
      if (action === "approve") await transfersApi.approveSending(selected.id);
      else if (action === "confirm")
        await transfersApi.confirmReceiving(selected.id);
      else if (action === "complete") await transfersApi.complete(selected.id);
      setSelected(null);
      load();
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Transfer Requests"
        subtitle="Manage student transfer workflows system-wide"
      />

      <div className="card">
        <div className="card-header flex items-center gap-3">
          <div className="flex items-center gap-3">
            <label className="text-sm text-neutral-500">Filter:</label>
            <select
              className="form-control w-52"
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

        {loading ? (
          <Spinner center />
        ) : transfers.length === 0 ? (
          <EmptyState
            title="No transfer requests found"
            description="Adjust the filter or try again later."
          />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>USID</th>
                  <th>From School</th>
                  <th>To School</th>
                  <th>Requested</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((t) => (
                  <tr key={t.id}>
                    <td className="font-semibold">{t.studentName}</td>
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
                        {t.status.replace("_", " ")}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-5">
              {[
                ["Student", selected.studentName],
                ["USID", selected.studentUsid],
                ["From School", selected.fromSchoolName],
                ["To School", selected.toSchoolName],
                ["Requested By", selected.requestedByName || "—"],
                ["Request Date", formatDate(selected.requestDate)],
                ["Reason", selected.reason || "—"],
                ["Status", selected.status.replace("_", " ")],
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

            <div className="flex justify-end gap-3">
              {selected.status === "PENDING" && (
                <button
                  className="btn btn-primary"
                  onClick={() => doAction("approve")}
                  disabled={actionLoading}
                >
                  Approve Sending
                </button>
              )}
              {selected.status === "SENDING_APPROVED" && (
                <button
                  className="btn btn-primary"
                  onClick={() => doAction("confirm")}
                  disabled={actionLoading}
                >
                  Confirm Receiving
                </button>
              )}
              {selected.status === "RECEIVING_CONFIRMED" && (
                <button
                  className="btn btn-accent"
                  onClick={() => doAction("complete")}
                  disabled={actionLoading}
                >
                  Complete Transfer
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
