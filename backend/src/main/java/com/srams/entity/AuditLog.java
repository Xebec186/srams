package com.srams.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigInteger;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "audit_log",
        indexes = {
                @Index(name = "idx_audit_table_record", columnList = "table_name, record_id"),
                @Index(name = "idx_audit_changed_at",   columnList = "changed_at")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false, columnDefinition = "BIGINT UNSIGNED")
    private BigInteger id;

    @Column(name = "table_name", nullable = false, length = 60)
    private String tableName;

    @Column(name = "record_id", nullable = false, columnDefinition = "BIGINT UNSIGNED")
    private BigInteger recordId;

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false, length = 10)
    private AuditAction action;

    /**
     * Nullable — NULL means the change was made by the system or a trigger.
     * We store just the raw ID to avoid a heavy FK join on every audit write.
     */
    @Column(name = "changed_by", columnDefinition = "INT UNSIGNED")
    private Long changedBy;

    /**
     * Stored as JSON text in MySQL.
     * Use String if you want raw JSON, or Map<String,Object> with a converter.
     */
    @Column(name = "old_values", columnDefinition = "JSON")
    private String oldValues;

    @Column(name = "new_values", columnDefinition = "JSON")
    private String newValues;

    @CreationTimestamp
    @Column(name = "changed_at", nullable = false, updatable = false)
    private LocalDateTime changedAt;


    // ----------------------------------------------------------------
    // Enum matching the MySQL ENUM('INSERT','UPDATE','DELETE')
    // ----------------------------------------------------------------
    public enum AuditAction {
        INSERT, UPDATE, DELETE
    }
}
