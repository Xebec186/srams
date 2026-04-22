package com.srams.service;

import com.srams.dto.response.SchoolStatsResponse;
import com.srams.dto.response.SystemStatsResponse;

import java.time.LocalDate;

public interface SchoolStatsService {
    SchoolStatsResponse getSchoolStats(Long schoolId, LocalDate date);
    SystemStatsResponse getSystemStats(LocalDate date);
}