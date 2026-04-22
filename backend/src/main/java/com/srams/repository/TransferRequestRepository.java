package com.srams.repository;

import com.srams.entity.TransferRequest;
import com.srams.enums.TransferStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TransferRequestRepository extends JpaRepository<TransferRequest, Long> {
    @Query("SELECT tr FROM TransferRequest tr " +
            "JOIN FETCH tr.student " +
            "JOIN FETCH tr.fromSchool " +
            "JOIN FETCH tr.toSchool " +
            "LEFT JOIN FETCH tr.requestedBy " +
            "WHERE tr.student.id = :studentId")
    List<TransferRequest> findByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT tr FROM TransferRequest tr " +
            "JOIN FETCH tr.student " +
            "JOIN FETCH tr.fromSchool " +
            "JOIN FETCH tr.toSchool " +
            "LEFT JOIN FETCH tr.requestedBy " +
            "WHERE tr.fromSchool.id = :schoolId AND tr.status = :status")
    List<TransferRequest> findByFromSchoolIdAndStatus(@Param("schoolId") Long schoolId, @Param("status") TransferStatus status);

    @Query("SELECT tr FROM TransferRequest tr " +
            "JOIN FETCH tr.student " +
            "JOIN FETCH tr.fromSchool " +
            "JOIN FETCH tr.toSchool " +
            "LEFT JOIN FETCH tr.requestedBy " +
            "WHERE tr.toSchool.id = :schoolId AND tr.status = :status")
    List<TransferRequest> findByToSchoolIdAndStatus(@Param("schoolId") Long schoolId, @Param("status") TransferStatus status);

    @Query("SELECT tr FROM TransferRequest tr " +
            "JOIN FETCH tr.student " +
            "JOIN FETCH tr.fromSchool " +
            "JOIN FETCH tr.toSchool " +
            "LEFT JOIN FETCH tr.requestedBy " +
            "WHERE tr.student.id = :studentId " +
            "AND tr.status IN ('PENDING','SENDING_APPROVED','RECEIVING_CONFIRMED')")
    Optional<TransferRequest> findActiveTransferForStudent(@Param("studentId") Long studentId);

    long countByFromSchoolIdAndStatus(Long schoolId, TransferStatus transferStatus);

    long countByStatus(TransferStatus status);
}
