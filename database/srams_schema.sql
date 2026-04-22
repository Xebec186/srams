CREATE DATABASE srams; 

use srams; 

-- ============================================================
-- TABLE: regions
-- Ghana's 16 administrative regions
-- ============================================================
CREATE TABLE regions (
    id          TINYINT UNSIGNED    NOT NULL AUTO_INCREMENT,
    code        CHAR(2)             NOT NULL COMMENT 'Two-letter region code e.g. AS, GR, WR',
    name        VARCHAR(80)         NOT NULL,
    created_at  TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uq_regions_code UNIQUE (code),
    CONSTRAINT uq_regions_name UNIQUE (name)
); 

-- Seed Ghana's 16 regions
INSERT INTO regions (code, name) VALUES
    ('AS', 'Ashanti'),
    ('BA', 'Bono'),
    ('BE', 'Bono East'),
    ('AH', 'Ahafo'),
    ('CE', 'Central'),
    ('EA', 'Eastern'),
    ('GR', 'Greater Accra'),
    ('NE', 'North East'),
    ('NO', 'Northern'),
    ('OT', 'Oti'),
    ('SA', 'Savannah'),
    ('UE', 'Upper East'),
    ('UW', 'Upper West'),
    ('VO', 'Volta'),
    ('WE', 'Western'),
    ('WN', 'Western North');


-- ============================================================
-- TABLE: schools
-- Public basic education schools in Ghana
-- ============================================================
CREATE TABLE schools (
    id              INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    school_code     CHAR(4)             NOT NULL COMMENT 'Zero-padded 4-digit code unique within region',
    region_id       TINYINT UNSIGNED    NOT NULL,
    name            VARCHAR(200)        NOT NULL,
    district        VARCHAR(100)        NOT NULL,
    address         VARCHAR(255)            NULL,
    phone           VARCHAR(20)             NULL,
    email           VARCHAR(150)            NULL,
    school_type     ENUM('PRIMARY','JHS','COMBINED') NOT NULL DEFAULT 'COMBINED'
                    COMMENT 'PRIMARY=KG-P6, JHS=JHS1-3, COMBINED=both',
    is_active       TINYINT(1)          NOT NULL DEFAULT 1,
    created_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uq_schools_code_region UNIQUE (school_code, region_id),
    CONSTRAINT fk_schools_region FOREIGN KEY (region_id)
        REFERENCES regions(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ;

CREATE INDEX idx_schools_region    ON schools(region_id);
CREATE INDEX idx_schools_district  ON schools(district);
CREATE INDEX idx_schools_active    ON schools(is_active);


-- ============================================================
-- TABLE: users
-- All system users: ADMIN, SCHOOL_ADMIN, TEACHER, STUDENT
-- ============================================================
CREATE TABLE users (
    id              INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    school_id       INT UNSIGNED            NULL COMMENT 'NULL for ADMIN role (district/GES level)',
    username        VARCHAR(60)         NOT NULL,
    email           VARCHAR(150)        NOT NULL,
    password_hash   VARCHAR(255)        NOT NULL COMMENT 'BCrypt hash',
    first_name      VARCHAR(80)         NOT NULL,
    last_name       VARCHAR(80)         NOT NULL,
    role            ENUM('ADMIN','SCHOOL_ADMIN','TEACHER') NOT NULL,
    is_active       TINYINT(1)          NOT NULL DEFAULT 1,
    last_login      TIMESTAMP               NULL,
    created_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uq_users_username UNIQUE (username),
    CONSTRAINT uq_users_email    UNIQUE (email),
    CONSTRAINT fk_users_school   FOREIGN KEY (school_id)
        REFERENCES schools(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ;

CREATE INDEX idx_users_school  ON users(school_id);
CREATE INDEX idx_users_role    ON users(role);
CREATE INDEX idx_users_active  ON users(is_active);


-- ============================================================
-- TABLE: teachers
-- Teacher professional profile (linked to users)
-- ============================================================
CREATE TABLE teachers (
    id              INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    user_id         INT UNSIGNED        NOT NULL,
    school_id       INT UNSIGNED        NOT NULL,
    staff_id        VARCHAR(30)             NULL COMMENT 'GES staff number if available',
    date_of_birth   DATE                    NULL,
    gender          ENUM('MALE','FEMALE','OTHER') NULL,
    phone           VARCHAR(20)             NULL,
    qualification   VARCHAR(100)            NULL,
    date_employed   DATE                    NULL,
    is_active       TINYINT(1)          NOT NULL DEFAULT 1,
    created_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uq_teachers_user   UNIQUE (user_id),
    CONSTRAINT fk_teachers_user   FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_teachers_school FOREIGN KEY (school_id)
        REFERENCES schools(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ;

CREATE INDEX idx_teachers_school ON teachers(school_id);
CREATE INDEX idx_teachers_active ON teachers(is_active);


-- ============================================================
-- TABLE: grade_levels
-- Ghana basic education grade structure
-- ============================================================
CREATE TABLE grade_levels (
    id          TINYINT UNSIGNED    NOT NULL AUTO_INCREMENT,
    code        VARCHAR(10)         NOT NULL COMMENT 'e.g. KG1, KG2, P1...P6, JHS1, JHS2, JHS3',
    name        VARCHAR(50)         NOT NULL,
    level_order TINYINT UNSIGNED    NOT NULL COMMENT 'Sort order: 1=KG1 ... 9=JHS3',
    school_type ENUM('PRIMARY','JHS') NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_grade_code UNIQUE (code)
) ;

INSERT INTO grade_levels (code, name, level_order, school_type) VALUES
    ('KG1',  'Kindergarten 1',  1, 'PRIMARY'),
    ('KG2',  'Kindergarten 2',  2, 'PRIMARY'),
    ('P1',   'Primary 1',       3, 'PRIMARY'),
    ('P2',   'Primary 2',       4, 'PRIMARY'),
    ('P3',   'Primary 3',       5, 'PRIMARY'),
    ('P4',   'Primary 4',       6, 'PRIMARY'),
    ('P5',   'Primary 5',       7, 'PRIMARY'),
    ('P6',   'Primary 6',       8, 'PRIMARY'),
    ('JHS1', 'JHS 1',           9, 'JHS'),
    ('JHS2', 'JHS 2',          10, 'JHS'),
    ('JHS3', 'JHS 3',          11, 'JHS');


-- ============================================================
-- TABLE: academic_years
-- Academic calendar years (e.g. 2023/2024)
-- ============================================================
CREATE TABLE academic_years (
    id          SMALLINT UNSIGNED   NOT NULL AUTO_INCREMENT,
    label       VARCHAR(12)         NOT NULL COMMENT 'e.g. 2023/2024',
    start_date  DATE                NOT NULL,
    end_date    DATE                NOT NULL,
    is_current  TINYINT(1)          NOT NULL DEFAULT 0,
    created_at  TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uq_academic_year_label UNIQUE (label),
    CONSTRAINT chk_academic_year_dates CHECK (end_date > start_date)
) ;


-- ============================================================
-- TABLE: terms
-- Three terms per academic year
-- ============================================================
CREATE TABLE terms (
    id              SMALLINT UNSIGNED   NOT NULL AUTO_INCREMENT,
    academic_year_id SMALLINT UNSIGNED  NOT NULL,
    term_number     TINYINT UNSIGNED    NOT NULL COMMENT '1, 2, or 3',
    start_date      DATE                NOT NULL,
    end_date        DATE                NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_term_year_number UNIQUE (academic_year_id, term_number),
    CONSTRAINT chk_term_number     CHECK (term_number BETWEEN 1 AND 3),
    CONSTRAINT chk_term_dates      CHECK (end_date > start_date),
    CONSTRAINT fk_terms_academic_year FOREIGN KEY (academic_year_id)
        REFERENCES academic_years(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ;


-- ============================================================
-- TABLE: subjects
-- Subjects taught in Ghana public basic schools
-- ============================================================
CREATE TABLE subjects (
    id      SMALLINT UNSIGNED   NOT NULL AUTO_INCREMENT,
    code    VARCHAR(10)         NOT NULL,
    name    VARCHAR(100)        NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_subject_code UNIQUE (code)
) ;

INSERT INTO subjects (code, name) VALUES
    ('ENG',  'English Language'),
    ('MATH', 'Mathematics'),
    ('SCI',  'Integrated Science'),
    ('SOC',  'Social Studies'),
    ('RME',  'Religious and Moral Education'),
    ('ICT',  'Information and Communication Technology'),
    ('GHA',  'Ghanaian Language'),
    ('FREN', 'French'),
    ('CREA', 'Creative Arts'),
    ('PE',   'Physical Education'),
    ('OWC',  'Our World Our People');


-- ============================================================
-- TABLE: students
-- Core student profile — the central entity
-- ============================================================
CREATE TABLE students (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    usid                VARCHAR(22)         NOT NULL COMMENT 'Format: GH-RR-SSSS-YYYY-NNNN-C',
    school_id           INT UNSIGNED        NOT NULL COMMENT 'Current enrolled school',
    grade_level_id      TINYINT UNSIGNED    NOT NULL COMMENT 'Current grade level',
    first_name          VARCHAR(80)         NOT NULL,
    middle_name         VARCHAR(80)             NULL,
    last_name           VARCHAR(80)         NOT NULL,
    date_of_birth       DATE                NOT NULL,
    gender              ENUM('MALE','FEMALE','OTHER') NOT NULL,
    nationality         VARCHAR(60)         NOT NULL DEFAULT 'Ghanaian',
    guardian_name       VARCHAR(160)            NULL,
    guardian_phone      VARCHAR(20)             NULL,
    guardian_relation   VARCHAR(40)             NULL,
    address             VARCHAR(255)            NULL,
    enrollment_date     DATE                NOT NULL,
    enrollment_year     YEAR                NOT NULL,
    status              ENUM('ACTIVE','TRANSFERRED','GRADUATED','WITHDRAWN','DECEASED')
                        NOT NULL DEFAULT 'ACTIVE',
    photo_url           VARCHAR(300)            NULL,
    created_by          INT UNSIGNED            NULL COMMENT 'users.id of registering admin',
    created_at          TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uq_students_usid     UNIQUE (usid),
    CONSTRAINT fk_students_school   FOREIGN KEY (school_id)
        REFERENCES schools(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_students_grade    FOREIGN KEY (grade_level_id)
        REFERENCES grade_levels(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_students_creator  FOREIGN KEY (created_by)
        REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ;

CREATE INDEX idx_students_school       ON students(school_id);
CREATE INDEX idx_students_grade        ON students(grade_level_id);
CREATE INDEX idx_students_status       ON students(status);
CREATE INDEX idx_students_enroll_year  ON students(enrollment_year);
CREATE INDEX idx_students_name         ON students(last_name, first_name);


-- ============================================================
-- TABLE: attendance_records
-- Daily attendance per student per period
-- High-volume table — indexed for performance
-- ============================================================
CREATE TABLE attendance_records (
    id              BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    student_id      INT UNSIGNED        NOT NULL,
    school_id       INT UNSIGNED        NOT NULL COMMENT 'Denormalized for fast school-level queries',
    grade_level_id  TINYINT UNSIGNED    NOT NULL COMMENT 'Grade at time of attendance',
    term_id         SMALLINT UNSIGNED   NOT NULL,
    attendance_date DATE                NOT NULL,
    period          ENUM('MORNING','AFTERNOON') NOT NULL,
    status          ENUM('PRESENT','ABSENT','LATE','EXCUSED') NOT NULL,
    absence_reason  VARCHAR(255)            NULL,
    marked_by       INT UNSIGNED            NULL COMMENT 'users.id of teacher who marked',
    marked_at       TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uq_attendance_unique UNIQUE (student_id, attendance_date, period),
    CONSTRAINT fk_att_student   FOREIGN KEY (student_id)
        REFERENCES students(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_att_school    FOREIGN KEY (school_id)
        REFERENCES schools(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_att_grade     FOREIGN KEY (grade_level_id)
        REFERENCES grade_levels(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_att_term      FOREIGN KEY (term_id)
        REFERENCES terms(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_att_teacher   FOREIGN KEY (marked_by)
        REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ;

-- Composite indexes optimized for common query patterns
CREATE INDEX idx_att_school_date    ON attendance_records(school_id, attendance_date);
CREATE INDEX idx_att_student_term   ON attendance_records(student_id, term_id);
CREATE INDEX idx_att_date_status    ON attendance_records(attendance_date, status);
CREATE INDEX idx_att_term_grade     ON attendance_records(term_id, grade_level_id);


-- ============================================================
-- TABLE: academic_performance
-- Term-based subject grades per student
-- ============================================================
CREATE TABLE academic_performance (
    id              INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    student_id      INT UNSIGNED        NOT NULL,
    school_id       INT UNSIGNED        NOT NULL COMMENT 'School at time of record',
    term_id         SMALLINT UNSIGNED   NOT NULL,
    grade_level_id  TINYINT UNSIGNED    NOT NULL,
    subject_id      SMALLINT UNSIGNED   NOT NULL,
    class_score     DECIMAL(5,2)            NULL COMMENT 'Class score out of 30 (Ghana basic)',
    exam_score      DECIMAL(5,2)            NULL COMMENT 'End-of-term exam out of 70',
    total_score     DECIMAL(5,2)            NULL COMMENT 'Computed: class + exam (max 100)',
    grade           CHAR(2)                 NULL COMMENT 'A1, B2, B3, C4, C5, C6, D7, E8, F9',
    position        SMALLINT UNSIGNED       NULL COMMENT 'Class position for subject',
    remarks         VARCHAR(255)            NULL,
    recorded_by     INT UNSIGNED            NULL,
    created_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uq_perf_student_term_subject UNIQUE (student_id, term_id, subject_id),
    CONSTRAINT chk_class_score  CHECK (class_score IS NULL OR class_score BETWEEN 0 AND 30),
    CONSTRAINT chk_exam_score   CHECK (exam_score IS NULL OR exam_score BETWEEN 0 AND 70),
    CONSTRAINT chk_total_score  CHECK (total_score IS NULL OR total_score BETWEEN 0 AND 100),
    CONSTRAINT fk_perf_student  FOREIGN KEY (student_id)
        REFERENCES students(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_perf_school   FOREIGN KEY (school_id)
        REFERENCES schools(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_perf_term     FOREIGN KEY (term_id)
        REFERENCES terms(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_perf_grade    FOREIGN KEY (grade_level_id)
        REFERENCES grade_levels(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_perf_subject  FOREIGN KEY (subject_id)
        REFERENCES subjects(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_perf_recorder FOREIGN KEY (recorded_by)
        REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ;

CREATE INDEX idx_perf_student      ON academic_performance(student_id);
CREATE INDEX idx_perf_school_term  ON academic_performance(school_id, term_id);
CREATE INDEX idx_perf_term_grade   ON academic_performance(term_id, grade_level_id);
CREATE INDEX idx_perf_subject      ON academic_performance(subject_id);


-- ============================================================
-- TABLE: transfer_requests
-- Multi-stage student transfer workflow
-- ============================================================
-- ============================================================
-- TABLE: transfer_requests (fixed)
-- ============================================================
CREATE TABLE transfer_requests (
    id                      INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    student_id              INT UNSIGNED    NOT NULL,
    from_school_id          INT UNSIGNED    NOT NULL,
    to_school_id            INT UNSIGNED    NOT NULL,
    requested_by            INT UNSIGNED        NULL,
    reason                  VARCHAR(500)        NULL,
    status                  ENUM(
                                'PENDING',
                                'SENDING_APPROVED',
                                'RECEIVING_CONFIRMED',
                                'COMPLETED',
                                'REJECTED',
                                'CANCELLED'
                            ) NOT NULL DEFAULT 'PENDING',
    request_date            DATE            NOT NULL DEFAULT (CURRENT_DATE),
    sending_approved_at     TIMESTAMP           NULL,
    sending_approved_by     INT UNSIGNED        NULL,
    receiving_confirmed_at  TIMESTAMP           NULL,
    receiving_confirmed_by  INT UNSIGNED        NULL,
    completed_at            TIMESTAMP           NULL,
    rejection_reason        VARCHAR(500)        NULL,
    notes                   TEXT                NULL,
    created_at              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    -- ↓ CHECK constraint REMOVED — enforced by trigger below instead
    CONSTRAINT fk_tr_student      FOREIGN KEY (student_id)
        REFERENCES students(id)  ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_tr_from_school  FOREIGN KEY (from_school_id)
        REFERENCES schools(id)   ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_tr_to_school    FOREIGN KEY (to_school_id)
        REFERENCES schools(id)   ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_tr_requested_by FOREIGN KEY (requested_by)
        REFERENCES users(id)     ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_tr_sending_by   FOREIGN KEY (sending_approved_by)
        REFERENCES users(id)     ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_tr_receiving_by FOREIGN KEY (receiving_confirmed_by)
        REFERENCES users(id)     ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX idx_tr_student      ON transfer_requests(student_id);
CREATE INDEX idx_tr_from_school  ON transfer_requests(from_school_id);
CREATE INDEX idx_tr_to_school    ON transfer_requests(to_school_id);
CREATE INDEX idx_tr_status       ON transfer_requests(status);
CREATE INDEX idx_tr_request_date ON transfer_requests(request_date);


-- ============================================================
-- TRIGGERS: enforce from_school_id <> to_school_id
-- ============================================================
DELIMITER $$

CREATE TRIGGER trg_transfer_requests_bi
BEFORE INSERT ON transfer_requests
FOR EACH ROW
BEGIN
    IF NEW.from_school_id = NEW.to_school_id THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Transfer request: from_school_id and to_school_id must be different.';
    END IF;
END$$

CREATE TRIGGER trg_transfer_requests_bu
BEFORE UPDATE ON transfer_requests
FOR EACH ROW
BEGIN
    IF NEW.from_school_id = NEW.to_school_id THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Transfer request: from_school_id and to_school_id must be different.';
    END IF;
END$$

DELIMITER ;

-- ============================================================
-- TABLE: transfer_documents
-- Supporting documents attached to transfer requests
-- ============================================================
CREATE TABLE transfer_documents (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    transfer_request_id INT UNSIGNED        NOT NULL,
    document_type       VARCHAR(80)         NOT NULL COMMENT 'e.g. Progress Report, Birth Certificate',
    file_name           VARCHAR(255)        NOT NULL,
    file_path           VARCHAR(500)        NOT NULL COMMENT 'Server path or object storage key',
    uploaded_by         INT UNSIGNED            NULL,
    uploaded_at         TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_tdoc_transfer FOREIGN KEY (transfer_request_id)
        REFERENCES transfer_requests(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_tdoc_uploader FOREIGN KEY (uploaded_by)
        REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ;

CREATE INDEX idx_tdoc_transfer ON transfer_documents(transfer_request_id);


-- ============================================================
-- TABLE: audit_log
-- Immutable audit trail for critical data changes
-- ============================================================
CREATE TABLE audit_log (
    id              BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    table_name      VARCHAR(60)         NOT NULL,
    record_id       BIGINT UNSIGNED     NOT NULL,
    action          ENUM('INSERT','UPDATE','DELETE') NOT NULL,
    changed_by      INT UNSIGNED            NULL COMMENT 'users.id; NULL = system/trigger',
    old_values      JSON                    NULL,
    new_values      JSON                    NULL,
    changed_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ;

CREATE INDEX idx_audit_table_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_changed_at   ON audit_log(changed_at);

DELIMITER $$

-- ============================================================
-- FUNCTION: fn_usid_check_digit(base VARCHAR)
-- Computes a single Luhn-style check digit (mod 10)
-- for the base portion of the USID string (digits only)
-- ============================================================
CREATE FUNCTION fn_usid_check_digit(base_digits VARCHAR(20))
RETURNS TINYINT
DETERMINISTIC
BEGIN
    DECLARE total     INT DEFAULT 0;
    DECLARE i         INT DEFAULT 1;
    DECLARE digit     INT;
    DECLARE len       INT;
    DECLARE alternate TINYINT DEFAULT 0;

    SET len = CHAR_LENGTH(base_digits);

    -- Traverse right-to-left
    WHILE i <= len DO
        SET digit = CAST(SUBSTRING(base_digits, len - i + 1, 1) AS UNSIGNED);
        IF alternate THEN
            SET digit = digit * 2;
            IF digit > 9 THEN SET digit = digit - 9; END IF;
        END IF;
        SET total = total + digit;
        SET alternate = NOT alternate;
        SET i = i + 1;
    END WHILE;

    RETURN (10 - (total MOD 10)) MOD 10;
END$$


-- ============================================================
-- PROCEDURE: sp_generate_usid
-- Generates a unique USID for a new student
--
-- Parameters:
--   p_region_code   CHAR(2)       — e.g. 'AS'
--   p_school_code   CHAR(4)       — e.g. '0042'
--   p_enroll_year   YEAR          — e.g. 2024
--   OUT p_usid      VARCHAR(22)   — generated USID
--
-- USID Format: GH-RR-SSSS-YYYY-NNNN-C
--   RR   = 2-char region code
--   SSSS = 4-char school code
--   YYYY = enrollment year
--   NNNN = 4-digit zero-padded sequence (per school per year)
--   C    = 1-digit check digit
-- ============================================================
DELIMITER $$

CREATE PROCEDURE sp_generate_usid(
    IN  p_region_code  CHAR(2),
    IN  p_school_code  CHAR(4),
    IN  p_enroll_year  YEAR,
    OUT p_usid         VARCHAR(22)
)
BEGIN
    DECLARE v_sequence     INT DEFAULT 1;
    DECLARE v_base_digits  VARCHAR(20);
    DECLARE v_check        TINYINT;
    DECLARE v_candidate    VARCHAR(22);
    DECLARE v_exists       TINYINT DEFAULT 1;
    DECLARE v_max_attempts INT DEFAULT 10000;
    DECLARE v_attempts     INT DEFAULT 0;

    -- Extract the NNNN segment (position 5) from existing USIDs
    -- USID format: GH - RR - SSSS - YYYY - NNNN - C  (6 segments)
    SELECT COALESCE(
        MAX(CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(usid, '-', 5), '-', -1) AS UNSIGNED))
    , 0) + 1
    INTO v_sequence
    FROM students
    WHERE usid LIKE CONCAT('GH-', p_region_code, '-', p_school_code, '-', p_enroll_year, '-%');

    -- Loop to guarantee uniqueness (handles concurrent inserts)
    WHILE v_exists = 1 AND v_attempts < v_max_attempts DO

        -- Build digit string for check digit: school_code + year + sequence
        SET v_base_digits = CONCAT(
            LPAD(p_school_code, 4, '0'),
            p_enroll_year,
            LPAD(v_sequence, 4, '0')
        );

        SET v_check = fn_usid_check_digit(v_base_digits);

        SET v_candidate = CONCAT(
            'GH-',
            UPPER(p_region_code), '-',
            LPAD(p_school_code, 4, '0'), '-',
            p_enroll_year, '-',
            LPAD(v_sequence, 4, '0'), '-',
            v_check
        );

        -- Collision check
        SELECT COUNT(*) INTO v_exists
        FROM students WHERE usid = v_candidate;

        IF v_exists = 1 THEN
            SET v_sequence = v_sequence + 1;
        END IF;

        SET v_attempts = v_attempts + 1;
    END WHILE;

    IF v_attempts >= v_max_attempts THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'USID generation failed: too many collisions. Check sequence.';
    END IF;

    SET p_usid = v_candidate;
END$$

DELIMITER ;


-- ============================================================
-- PROCEDURE: sp_get_attendance_summary
-- Returns attendance summary for a student over a term
--
-- Parameters:
--   p_student_id  INT UNSIGNED
--   p_term_id     SMALLINT UNSIGNED
-- ============================================================
DELIMITER $$

CREATE PROCEDURE sp_get_attendance_summary(
    IN p_student_id INT UNSIGNED,
    IN p_term_id    SMALLINT UNSIGNED
)
BEGIN
    SELECT
        s.usid,
        CONCAT(s.first_name, ' ', s.last_name)                         AS student_name,
        t.term_number,
        ay.label                                                        AS academic_year,
        COUNT(*)                                                        AS total_sessions,
        SUM(ar.status = 'PRESENT')                                      AS present_count,
        SUM(ar.status = 'ABSENT')                                       AS absent_count,
        SUM(ar.status = 'LATE')                                         AS late_count,
        SUM(ar.status = 'EXCUSED')                                      AS excused_count,
        ROUND(
            SUM(ar.status IN ('PRESENT', 'LATE')) * 100.0 / COUNT(*),
        2)                                                              AS attendance_pct
    FROM attendance_records ar
    JOIN students s        ON s.id  = ar.student_id
    JOIN terms t           ON t.id  = ar.term_id
    JOIN academic_years ay ON ay.id = t.academic_year_id
    WHERE ar.student_id = p_student_id
      AND ar.term_id    = p_term_id
    GROUP BY s.usid, student_name, t.term_number, ay.label;
END$$

DELIMITER ;


-- ============================================================
-- PROCEDURE: sp_get_school_attendance_report
-- Returns daily attendance counts for a school on a date range
-- ============================================================
DELIMITER $$
CREATE PROCEDURE sp_get_school_attendance_report(
    IN p_school_id  INT UNSIGNED,
    IN p_from_date  DATE,
    IN p_to_date    DATE
)
BEGIN
    SELECT
        ar.attendance_date,
        ar.period,
        COUNT(*)                        AS total_marked,
        SUM(ar.status = 'PRESENT')      AS present,
        SUM(ar.status = 'ABSENT')       AS absent,
        SUM(ar.status = 'LATE')         AS late,
        SUM(ar.status = 'EXCUSED')      AS excused,
        ROUND(SUM(ar.status IN ('PRESENT','LATE')) * 100.0 / COUNT(*), 2) AS attendance_rate
    FROM attendance_records ar
    WHERE ar.school_id       = p_school_id
      AND ar.attendance_date BETWEEN p_from_date AND p_to_date
    GROUP BY ar.attendance_date, ar.period
    ORDER BY ar.attendance_date, ar.period;
END$$
audit_log
DELIMITER ;


-- ============================================================
-- VIEWS
-- ============================================================

-- View: Student full profile with school and region
CREATE VIEW vw_student_profile AS
SELECT
    s.id,
    s.usid,
    CONCAT(s.first_name, IFNULL(CONCAT(' ', s.middle_name), ''), ' ', s.last_name) AS full_name,
    s.date_of_birth,
    s.gender,
    s.status,
    s.enrollment_date,
    s.enrollment_year,
    sc.name         AS school_name,
    sc.school_code,
    r.name          AS region,
    gl.code         AS grade_code,
    gl.name         AS grade_name,
    s.guardian_name,
    s.guardian_phone
FROM students s
JOIN schools sc     ON sc.id = s.school_id
JOIN regions r      ON r.id  = sc.region_id
JOIN grade_levels gl ON gl.id = s.grade_level_id;


-- View: Term academic performance summary per student
CREATE VIEW vw_student_term_summary AS
SELECT
    ap.student_id,
    s.usid,
    CONCAT(s.first_name, ' ', s.last_name) AS student_name,
    ay.label           AS academic_year,
    t.term_number,
    gl.code            AS grade,
    COUNT(ap.id)       AS subjects_recorded,
    ROUND(AVG(ap.total_score), 2)  AS avg_total_score,
    MIN(ap.total_score)            AS min_score,
    MAX(ap.total_score)            AS max_score
FROM academic_performance ap
JOIN students s         ON s.id  = ap.student_id
JOIN terms t            ON t.id  = ap.term_id
JOIN academic_years ay  ON ay.id = t.academic_year_id
JOIN grade_levels gl    ON gl.id = ap.grade_level_id
GROUP BY ap.student_id, s.usid, student_name,
         ay.label, t.term_number, gl.code;
         
-- ============================================================
-- SRAMS Schema Patch: Student role + Teacher class assignments
-- Run AFTER the Phase 1 schema
-- ============================================================

-- 1. Add STUDENT to users role ENUM
ALTER TABLE users
    MODIFY COLUMN role ENUM('ADMIN','SCHOOL_ADMIN','TEACHER','STUDENT') NOT NULL;

-- 2. Add student_id FK to users (NULL for non-student accounts)
ALTER TABLE users
    ADD COLUMN student_id INT UNSIGNED NULL AFTER school_id,
    ADD CONSTRAINT uq_users_student_id UNIQUE (student_id),
    ADD CONSTRAINT fk_users_student FOREIGN KEY (student_id)
        REFERENCES students(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- 3. Teacher-class assignment table
CREATE TABLE teacher_class_assignments (
    id              INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    teacher_id      INT UNSIGNED        NOT NULL,
    school_id       INT UNSIGNED        NOT NULL,
    grade_level_id  TINYINT UNSIGNED    NOT NULL,
    term_id         SMALLINT UNSIGNED   NOT NULL,
    is_active       TINYINT(1)          NOT NULL DEFAULT 1,
    created_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uq_teacher_class UNIQUE (teacher_id, grade_level_id, term_id),
    CONSTRAINT fk_tca_teacher FOREIGN KEY (teacher_id)
        REFERENCES teachers(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_tca_school FOREIGN KEY (school_id)
        REFERENCES schools(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_tca_grade FOREIGN KEY (grade_level_id)
        REFERENCES grade_levels(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_tca_term FOREIGN KEY (term_id)
        REFERENCES terms(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX idx_tca_teacher ON teacher_class_assignments(teacher_id);
CREATE INDEX idx_tca_school_grade_term ON teacher_class_assignments(school_id, grade_level_id, term_id);