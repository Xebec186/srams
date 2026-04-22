// TransferRequest.java
package com.srams.entity;

import com.srams.enums.TransferStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.*;

@Entity @Table(name = "transfer_requests")
@Getter @Setter @NoArgsConstructor
public class TransferRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", columnDefinition = "INT UNSIGNED")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "from_school_id", nullable = false)
    private School fromSchool;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "to_school_id", nullable = false)
    private School toSchool;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by")
    private User requestedBy;

    @Column(name = "reason", length = 500)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 25)
    private TransferStatus status = TransferStatus.PENDING;

    @Column(name = "request_date", nullable = false)
    private LocalDate requestDate = LocalDate.now();

    @Column(name = "sending_approved_at")
    private LocalDateTime sendingApprovedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sending_approved_by")
    private User sendingApprovedBy;

    @Column(name = "receiving_confirmed_at")
    private LocalDateTime receivingConfirmedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiving_confirmed_by")
    private User receivingConfirmedBy;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate public void onUpdate() { this.updatedAt = LocalDateTime.now(); }
}