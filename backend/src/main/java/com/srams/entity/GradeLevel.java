package com.srams.entity;

import com.srams.enums.SchoolType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "grade_levels")
@Getter @Setter @NoArgsConstructor
public class GradeLevel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", columnDefinition = "TINYINT UNSIGNED")
    private Short id;

    @Column(name = "code", nullable = false, unique = true, length = 10)
    private String code;

    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @Column(name = "level_order", nullable = false, columnDefinition = "TINYINT UNSIGNED")
    private Byte levelOrder;

    @Enumerated(EnumType.STRING)
    @Column(name = "school_type", nullable = false, length = 10)
    private SchoolType schoolType;
}
