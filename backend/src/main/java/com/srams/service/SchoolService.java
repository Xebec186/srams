package com.srams.service;

import com.srams.dto.request.CreateSchoolRequest;
import com.srams.dto.request.UpdateSchoolRequest;
import com.srams.dto.response.SchoolResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface SchoolService {
    SchoolResponse createSchool(CreateSchoolRequest request);
    SchoolResponse getSchoolById(Long id);
    Page<SchoolResponse> getAllSchools(Pageable pageable);
    List<SchoolResponse> getSchoolsByRegion(Integer regionId);
    SchoolResponse updateSchool(Long id, UpdateSchoolRequest request);
}