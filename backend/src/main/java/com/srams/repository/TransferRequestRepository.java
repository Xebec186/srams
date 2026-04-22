package com.srams.repository;

import com.srams.entity.TransferRequest;
import com.srams.enums.TransferStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TransferRequestRepository extends JpaRepository<TransferRequest, Long> {
    List<TransferRequest> findByStudentId(Long studentId);
    List<TransferRequest> findByFromSchoolIdAndStatus(Long schoolId, TransferStatus status);
    List<TransferRequest> findByToSchoolIdAndStatus(Long schoolId, TransferStatus status);

    @Query("SELECT tr FROM TransferRequest tr WHERE tr.student.id = :studentId " +
            "AND tr.status IN ('PENDING','SENDING_APPROVED','RECEIVING_CONFIRMED')")
    Optional<TransferRequest> findActiveTransferForStudent(@Param("studentId") Long studentId);
}
