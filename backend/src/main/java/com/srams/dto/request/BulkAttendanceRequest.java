package com.srams.dto.request;

import java.util.List;

public record BulkAttendanceRequest(
        List<MarkAttendanceRequest> records) {
}
