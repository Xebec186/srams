package com.srams.service;

import com.srams.dto.response.SchoolStatsResponse;

import java.time.LocalDate;

public interface SchoolStatsService {
    SchoolStatsResponse getSchoolStats(Long schoolId, LocalDate date);
}