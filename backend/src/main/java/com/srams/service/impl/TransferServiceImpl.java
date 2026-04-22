package com.srams.service.impl;

import com.srams.dto.request.InitiateTransferRequest;
import com.srams.dto.response.TransferResponse;
import com.srams.entity.School;
import com.srams.entity.Student;
import com.srams.entity.TransferRequest;
import com.srams.entity.User;
import com.srams.enums.TransferStatus;
import com.srams.enums.StudentStatus;
import com.srams.exception.BadRequestException;
import com.srams.exception.ConflictException;
import com.srams.exception.ResourceNotFoundException;
import com.srams.repository.StudentRepository;
import com.srams.repository.SchoolRepository;
import com.srams.repository.TransferRequestRepository;
import com.srams.repository.UserRepository;
import com.srams.service.TransferService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransferServiceImpl implements TransferService {

    private final TransferRequestRepository transferRepository;
    private final StudentRepository studentRepository;
    private final SchoolRepository schoolRepository;
    private final UserRepository userRepository;

    @Transactional
    @Override
    public TransferResponse initiateTransfer(InitiateTransferRequest request, Long requestedByUserId) {
        Student student = studentRepository.findById(request.studentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        transferRepository.findActiveTransferForStudent(student.getId()).ifPresent(t -> {
            throw new ConflictException("Student already has an active transfer in progress");
        });

        School toSchool = schoolRepository.findById(request.toSchoolId())
                .orElseThrow(() -> new ResourceNotFoundException("Destination school not found"));

        if (student.getSchool().getId().equals(toSchool.getId())) {
            throw new BadRequestException("Source and destination schools must be different");
        }

        User requestedBy = userRepository.findById(requestedByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        TransferRequest transfer = new TransferRequest();
        transfer.setStudent(student);
        transfer.setFromSchool(student.getSchool());
        transfer.setToSchool(toSchool);
        transfer.setReason(request.reason());
        transfer.setRequestedBy(requestedBy);
        transfer.setStatus(TransferStatus.PENDING);

        return TransferResponse.from(transferRepository.save(transfer));
    }

    @Transactional
    @Override
    public TransferResponse approveSending(Long transferId, Long approvedByUserId) {
        TransferRequest transfer = getTransferOrThrow(transferId);
        validateTransition(transfer, TransferStatus.PENDING, TransferStatus.SENDING_APPROVED);

        User approver = userRepository.findById(approvedByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        transfer.setStatus(TransferStatus.SENDING_APPROVED);
        transfer.setSendingApprovedAt(LocalDateTime.now());
        transfer.setSendingApprovedBy(approver);
        return TransferResponse.from(transferRepository.save(transfer));
    }

    @Transactional
    @Override
    public TransferResponse confirmReceiving(Long transferId, Long confirmedByUserId) {
        TransferRequest transfer = getTransferOrThrow(transferId);
        validateTransition(transfer, TransferStatus.SENDING_APPROVED, TransferStatus.RECEIVING_CONFIRMED);

        User confirmer = userRepository.findById(confirmedByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        transfer.setStatus(TransferStatus.RECEIVING_CONFIRMED);
        transfer.setReceivingConfirmedAt(LocalDateTime.now());
        transfer.setReceivingConfirmedBy(confirmer);
        return TransferResponse.from(transferRepository.save(transfer));
    }

    @Transactional
    @Override
    public TransferResponse completeTransfer(Long transferId) {
        TransferRequest transfer = getTransferOrThrow(transferId);
        validateTransition(transfer, TransferStatus.RECEIVING_CONFIRMED, TransferStatus.COMPLETED);

        transfer.setStatus(TransferStatus.COMPLETED);
        transfer.setCompletedAt(LocalDateTime.now());

        Student student = transfer.getStudent();
        student.setSchool(transfer.getToSchool());
        student.setStatus(StudentStatus.ACTIVE);
        studentRepository.save(student);

        return TransferResponse.from(transferRepository.save(transfer));
    }

    @Transactional
    @Override
    public TransferResponse rejectTransfer(Long transferId, String reason, Long rejectedByUserId) {
        TransferRequest transfer = getTransferOrThrow(transferId);
        if (transfer.getStatus() == TransferStatus.COMPLETED ||
                transfer.getStatus() == TransferStatus.REJECTED ||
                transfer.getStatus() == TransferStatus.CANCELLED) {
            throw new BadRequestException("Cannot reject a transfer in status: " + transfer.getStatus());
        }
        transfer.setStatus(TransferStatus.REJECTED);
        transfer.setRejectionReason(reason);
        return TransferResponse.from(transferRepository.save(transfer));
    }

    @Transactional(readOnly = true)
    @Override
    public TransferResponse getTransferById(Long id) {
        return TransferResponse.from(getTransferOrThrow(id));
    }

    @Transactional
    @Override
    public TransferResponse cancelTransfer(Long transferId, Long cancelledByUserId) {
        TransferRequest transfer = getTransferOrThrow(transferId);
        if (transfer.getStatus() == TransferStatus.COMPLETED || transfer.getStatus() == TransferStatus.CANCELLED) {
            throw new BadRequestException("Cannot cancel transfer in status: " + transfer.getStatus());
        }
        transfer.setStatus(TransferStatus.CANCELLED);
        return TransferResponse.from(transferRepository.save(transfer));
    }

    @Transactional(readOnly = true)
    @Override
    public List<TransferResponse> getTransfersByStudent(Long studentId) {
        return transferRepository.findByStudentId(studentId).stream()
                .map(TransferResponse::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @Override
    public List<TransferResponse> getTransfersBySchool(Long schoolId, TransferStatus status, String direction) {
        return transferRepository.findAll().stream()
                .filter(tr -> {
                    boolean dirMatch;
                    String d = direction == null ? "both" : direction.toLowerCase();
                    if (d.equals("incoming")) dirMatch = tr.getToSchool() != null && tr.getToSchool().getId().equals(schoolId);
                    else if (d.equals("outgoing")) dirMatch = tr.getFromSchool() != null && tr.getFromSchool().getId().equals(schoolId);
                    else dirMatch = (tr.getFromSchool() != null && tr.getFromSchool().getId().equals(schoolId)) ||
                            (tr.getToSchool() != null && tr.getToSchool().getId().equals(schoolId));
                    boolean statusMatch = status == null || tr.getStatus() == status;
                    return dirMatch && statusMatch;
                })
                .map(TransferResponse::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @Override
    public List<TransferResponse> getAllTransfers(TransferStatus status) {
        return transferRepository.findAll().stream()
                .filter(tr -> status == null || tr.getStatus() == status)
                .map(TransferResponse::from)
                .collect(Collectors.toList());
    }

    private TransferRequest getTransferOrThrow(Long id) {
        return transferRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transfer request not found"));
    }

    private void validateTransition(TransferRequest t, TransferStatus required, TransferStatus next) {
        if (t.getStatus() != required) {
            throw new BadRequestException(
                    "Transfer must be in " + required + " status to move to " + next +
                            ". Current status: " + t.getStatus());
        }
    }
}
