package com.srams.service.impl;

import com.srams.dto.request.CreateSchoolRequest;
import com.srams.dto.request.UpdateSchoolRequest;
import com.srams.dto.response.SchoolResponse;
import com.srams.entity.Region;
import com.srams.entity.School;
import com.srams.enums.SchoolType;
import com.srams.exception.ConflictException;
import com.srams.exception.ResourceNotFoundException;
import com.srams.repository.RegionRepository;
import com.srams.repository.SchoolRepository;
import com.srams.service.SchoolService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SchoolServiceImpl implements SchoolService {

    private final SchoolRepository schoolRepository;
    private final RegionRepository regionRepository;

    @Transactional
    @Override
    public SchoolResponse createSchool(CreateSchoolRequest request) {
        Region region = regionRepository.findById(request.regionId())
                .orElseThrow(() -> new ResourceNotFoundException("Region not found with ID: " + request.regionId()));

        schoolRepository.findBySchoolCodeAndRegionId(request.schoolCode(), request.regionId())
                .ifPresent(s -> { throw new ConflictException("School code already exists in region"); });

        School s = new School();
        s.setSchoolCode(request.schoolCode());
        s.setRegion(region);
        s.setName(request.name());
        s.setDistrict(request.district());
        s.setAddress(request.address());
        s.setPhone(request.phone());
        s.setEmail(request.email());
        try {
            s.setSchoolType(request.schoolType() != null ? SchoolType.valueOf(request.schoolType().toUpperCase()) : null);
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid school type: " + request.schoolType());
        }

        School saved = schoolRepository.save(s);
        return SchoolResponse.from(saved);
    }

    @Override
    public SchoolResponse getSchoolById(Long id) {
        School s = schoolRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("School not found with ID: " + id));
        return SchoolResponse.from(s);
    }

    @Override
    public Page<SchoolResponse> getAllSchools(Pageable pageable) {
        return schoolRepository.findByActiveTrue(pageable)
                .map(SchoolResponse::from);
    }

    @Override
    public List<SchoolResponse> getSchoolsByRegion(Integer regionId) {
        return schoolRepository.findByRegionIdAndActiveTrue(regionId)
                .stream().map(SchoolResponse::from).collect(Collectors.toList());
    }

    @Transactional
    @Override
    public SchoolResponse updateSchool(Long id, UpdateSchoolRequest request) {
        School s = schoolRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("School not found with ID: " + id));
        if (request.name() != null) s.setName(request.name());
        if (request.district() != null) s.setDistrict(request.district());
        if (request.address() != null) s.setAddress(request.address());
        if (request.phone() != null) s.setPhone(request.phone());
        if (request.email() != null) s.setEmail(request.email());
        if (request.schoolType() != null) s.setSchoolType(SchoolType.valueOf(request.schoolType().toUpperCase()));
        if (request.active() != null) s.setActive(request.active());

        School updated = schoolRepository.save(s);
        return SchoolResponse.from(updated);
    }
}
