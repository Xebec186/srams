package com.srams.service;

import com.srams.dto.request.InitiateTransferRequest;
import com.srams.dto.request.RejectTransferRequest;
import com.srams.dto.response.TransferResponse;
import com.srams.enums.TransferStatus;

import java.util.List;

public interface TransferService {
    TransferResponse initiateTransfer(InitiateTransferRequest request, Long requestedByUserId);
    TransferResponse approveSending(Long transferId, Long approvedByUserId);
    TransferResponse confirmReceiving(Long transferId, Long confirmedByUserId);
    TransferResponse completeTransfer(Long transferId);
    TransferResponse rejectTransfer(Long transferId, String reason, Long rejectedByUserId);
    TransferResponse cancelTransfer(Long transferId, Long cancelledByUserId);
    List<TransferResponse> getTransfersByStudent(Long studentId);
    List<TransferResponse> getTransfersBySchool(Long schoolId, TransferStatus status, String direction);
    List<TransferResponse> getAllTransfers(TransferStatus status);
    TransferResponse getTransferById(Long id);
}
