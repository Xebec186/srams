"""
SRAMS Schema Seeder
===================
Seeds the Ghana basic education schema:
- regions
- schools
- users (ADMIN, SCHOOL_ADMIN, TEACHER, STUDENT)
- teachers
- grade_levels
- academic_years / terms
- subjects
- students
- teacher_class_assignments
- attendance_records
- academic_performance
- transfer_requests
- transfer_documents
- audit_log

Requirements:
    pip install mysql-connector-python bcrypt faker

Usage:
    python seed_srams.py

Edit the DB settings below before running.
"""

from __future__ import annotations

import json
import random
import re
from collections import defaultdict
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from typing import Dict, List, Tuple

import bcrypt
import mysql.connector
from faker import Faker

# -----------------------------------------------------------------------------
# Connection config
# -----------------------------------------------------------------------------
HOST = "localhost"
PORT = 3306
USER = "root"
PASSWORD = "mosh584"
DATABASE = "srams"

# -----------------------------------------------------------------------------
# Controls
# -----------------------------------------------------------------------------
SEED = 42
RESET_EXISTING_DATA = True

# Volume knobs
SCHOOLS_PER_REGION = (2, 2)          # fixed 2 schools per region
TEACHERS_PER_SCHOOL = (3, 5)
STUDENTS_PER_SCHOOL = (12, 22)
ATTENDANCE_DAYS_PER_TERM_PER_GRADE = (4, 6)
TRANSFER_REQUESTS_TOTAL = 18
TRANSFER_DOCS_PER_REQUEST = (1, 2)

# -----------------------------------------------------------------------------
# Static data
# -----------------------------------------------------------------------------
REGIONS = [
    ("AS", "Ashanti"),
    ("BA", "Bono"),
    ("BE", "Bono East"),
    ("AH", "Ahafo"),
    ("CE", "Central"),
    ("EA", "Eastern"),
    ("GR", "Greater Accra"),
    ("NE", "North East"),
    ("NO", "Northern"),
    ("OT", "Oti"),
    ("SA", "Savannah"),
    ("UE", "Upper East"),
    ("UW", "Upper West"),
    ("VO", "Volta"),
    ("WE", "Western"),
    ("WN", "Western North"),
]

GRADE_LEVELS = [
    ("KG1", "Kindergarten 1", 1, "PRIMARY"),
    ("KG2", "Kindergarten 2", 2, "PRIMARY"),
    ("P1", "Primary 1", 3, "PRIMARY"),
    ("P2", "Primary 2", 4, "PRIMARY"),
    ("P3", "Primary 3", 5, "PRIMARY"),
    ("P4", "Primary 4", 6, "PRIMARY"),
    ("P5", "Primary 5", 7, "PRIMARY"),
    ("P6", "Primary 6", 8, "PRIMARY"),
    ("JHS1", "JHS 1", 9, "JHS"),
    ("JHS2", "JHS 2", 10, "JHS"),
    ("JHS3", "JHS 3", 11, "JHS"),
]

SUBJECTS = [
    ("ENG", "English Language"),
    ("MATH", "Mathematics"),
    ("SCI", "Integrated Science"),
    ("SOC", "Social Studies"),
    ("RME", "Religious and Moral Education"),
    ("ICT", "Information and Communication Technology"),
    ("GHA", "Ghanaian Language"),
    ("FREN", "French"),
    ("CREA", "Creative Arts"),
    ("PE", "Physical Education"),
    ("OWC", "Our World Our People"),
]

SCHOOL_TYPES = ["PRIMARY", "JHS", "COMBINED"]
SCHOOL_TYPE_WEIGHTS = [0.42, 0.18, 0.40]

# Grade groupings for each school type
AVAILABLE_GRADE_CODES = {
    "PRIMARY": ["KG1", "KG2", "P1", "P2", "P3", "P4", "P5", "P6"],
    "JHS": ["JHS1", "JHS2", "JHS3"],
    "COMBINED": ["KG1", "KG2", "P1", "P2", "P3", "P4", "P5", "P6", "JHS1", "JHS2", "JHS3"],
}

SUBJECT_SETS = {
    "KG1": ["ENG", "MATH", "GHA", "CREA", "PE", "OWC"],
    "KG2": ["ENG", "MATH", "GHA", "CREA", "PE", "OWC"],
    "P1": ["ENG", "MATH", "GHA", "SCI", "SOC", "RME", "ICT", "CREA", "PE"],
    "P2": ["ENG", "MATH", "GHA", "SCI", "SOC", "RME", "ICT", "CREA", "PE"],
    "P3": ["ENG", "MATH", "GHA", "SCI", "SOC", "RME", "ICT", "CREA", "PE"],
    "P4": ["ENG", "MATH", "GHA", "SCI", "SOC", "RME", "ICT", "FREN", "CREA", "PE"],
    "P5": ["ENG", "MATH", "GHA", "SCI", "SOC", "RME", "ICT", "FREN", "CREA", "PE"],
    "P6": ["ENG", "MATH", "GHA", "SCI", "SOC", "RME", "ICT", "FREN", "CREA", "PE"],
    "JHS1": ["ENG", "MATH", "GHA", "SCI", "SOC", "RME", "ICT", "FREN", "CREA"],
    "JHS2": ["ENG", "MATH", "GHA", "SCI", "SOC", "RME", "ICT", "FREN", "CREA"],
    "JHS3": ["ENG", "MATH", "GHA", "SCI", "SOC", "RME", "ICT", "FREN", "CREA"],
}

ATTENDANCE_STATUSES = ["PRESENT", "ABSENT", "LATE", "EXCUSED"]
ATTENDANCE_WEIGHTS = [0.78, 0.11, 0.07, 0.04]

TRANSFER_REASONS = [
    "Family relocation",
    "Change of residence",
    "School proximity",
    "Health-related transfer",
    "Parent request",
    "Household re-assignment",
    "Access to transport",
    "Academic support needs",
]

TRANSFER_DOC_TYPES = [
    "Transfer Letter",
    "Progress Report",
    "Birth Certificate",
    "Immunisation Card",
    "Report Card",
    "Parent Consent Letter",
]

# -----------------------------------------------------------------------------
# Faker / randomness
# -----------------------------------------------------------------------------
random.seed(SEED)
fake = Faker("en_GB")
Faker.seed(SEED)

# -----------------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------------
PASSWORD_HASH = bcrypt.hashpw(b"Password123!", bcrypt.gensalt()).decode("utf-8")


def weighted_choice(options, weights):
    return random.choices(options, weights=weights, k=1)[0]


def rand_date(start: date, end: date) -> date:
    if end <= start:
        return start
    delta = (end - start).days
    return start + timedelta(days=random.randint(0, delta))


def rand_dt(d: date) -> datetime:
    return datetime(d.year, d.month, d.day, random.randint(7, 18), random.randint(0, 59), random.randint(0, 59))


def clean_slug(text: str) -> str:
    text = re.sub(r"[^A-Za-z0-9]+", ".", text.strip().lower())
    return text.strip(".")


def luhn_check_digit(base_digits: str) -> int:
    total = 0
    alternate = False
    for ch in reversed(base_digits):
        digit = int(ch)
        if alternate:
            digit *= 2
            if digit > 9:
                digit -= 9
        total += digit
        alternate = not alternate
    return (10 - (total % 10)) % 10


def generate_usid(region_code: str, school_code: str, enroll_year: int, sequence: int) -> str:
    base_digits = f"{school_code}{enroll_year}{sequence:04d}"
    check = luhn_check_digit(base_digits)
    return f"GH-{region_code}-{school_code}-{enroll_year}-{sequence:04d}-{check}"


def calc_grade(total: float) -> str:
    if total >= 80:
        return "A1"
    if total >= 75:
        return "B2"
    if total >= 70:
        return "B3"
    if total >= 65:
        return "C4"
    if total >= 60:
        return "C5"
    if total >= 55:
        return "C6"
    if total >= 50:
        return "D7"
    if total >= 40:
        return "E8"
    return "F9"


def school_name(region_name: str, district: str, school_type: str, idx: int) -> str:
    base = fake.last_name()
    if school_type == "PRIMARY":
        suffix = "Basic School"
    elif school_type == "JHS":
        suffix = "Junior High School"
    else:
        suffix = "Basic School"
    return f"{district} {base} {suffix} {idx}"


def dob_for_grade(code: str) -> date:
    today = date.today()
    if code.startswith("KG"):
        start_year, end_year = today.year - 6, today.year - 4
    elif code.startswith("P"):
        start_year, end_year = today.year - 12, today.year - 6
    else:
        start_year, end_year = today.year - 15, today.year - 12
    year = random.randint(start_year, end_year)
    month = random.randint(1, 12)
    day = random.randint(1, 28)
    return date(year, month, day)


def academic_year_bounds(year_start: int) -> Tuple[date, date]:
    return date(year_start, 9, 1), date(year_start + 1, 8, 31)


def term_bounds(year_start: int) -> List[Tuple[int, date, date]]:
    return [
        (1, date(year_start, 9, 1), date(year_start, 12, 6)),
        (2, date(year_start + 1, 1, 6), date(year_start + 1, 3, 28)),
        (3, date(year_start + 1, 4, 15), date(year_start + 1, 7, 31)),
    ]


def school_days(start: date, end: date, count: int) -> List[date]:
    days = []
    attempts = 0
    while len(days) < count and attempts < count * 30:
        attempts += 1
        d = rand_date(start, end)
        if d.weekday() >= 5:
            continue
        if d not in days:
            days.append(d)
    days.sort()
    return days


def json_dump(value) -> str:
    return json.dumps(value, default=str, ensure_ascii=False)


@dataclass
class School:
    id: int
    region_id: int
    region_code: str
    region_name: str
    school_code: str
    name: str
    district: str
    school_type: str


@dataclass
class User:
    id: int
    school_id: int | None
    role: str
    first_name: str
    last_name: str
    email: str


@dataclass
class Teacher:
    id: int
    user_id: int
    school_id: int
    full_name: str


@dataclass
class Student:
    id: int
    usid: str
    school_id: int
    school_region_id: int
    school_region_code: str
    school_code: str
    grade_level_id: int
    grade_code: str
    first_name: str
    last_name: str
    enrollment_year: int
    school_admin_id: int


# -----------------------------------------------------------------------------
# Schema reset
# -----------------------------------------------------------------------------
TABLES_IN_INSERT_ORDER = [
    "audit_log",
    "transfer_documents",
    "transfer_requests",
    "academic_performance",
    "attendance_records",
    "teacher_class_assignments",
    "users",
    "students",
    "teachers",
    "terms",
    "academic_years",
    "subjects",
    "grade_levels",
    "schools",
    "regions",
]


def reset_tables(cur):
    cur.execute("SET FOREIGN_KEY_CHECKS = 0")
    for table in TABLES_IN_INSERT_ORDER:
        cur.execute(f"TRUNCATE TABLE {table}")
    cur.execute("SET FOREIGN_KEY_CHECKS = 1")


# -----------------------------------------------------------------------------
# Main seed routine
# -----------------------------------------------------------------------------
def main():
    conn = mysql.connector.connect(
        host=HOST,
        port=PORT,
        user=USER,
        password=PASSWORD,
        database=DATABASE,
    )
    cur = conn.cursor()

    counts = defaultdict(int)
    audit_rows = []

    try:
        if RESET_EXISTING_DATA:
            print("Resetting tables...")
            reset_tables(cur)
            conn.commit()

        # 1) REGIONS ---------------------------------------------------------
        print("Seeding regions...")
        for code, name in REGIONS:
            cur.execute(
                "INSERT INTO regions (code, name) VALUES (%s, %s)",
                (code, name),
            )
            counts["regions"] += 1
        cur.execute("SELECT id, code, name FROM regions ORDER BY id")
        region_rows = cur.fetchall()
        regions = {row[0]: {"id": row[0], "code": row[1], "name": row[2]} for row in region_rows}

        # 2) GRADE LEVELS ----------------------------------------------------
        print("Seeding grade levels...")
        for code, name, level_order, school_type in GRADE_LEVELS:
            cur.execute(
                """INSERT INTO grade_levels (code, name, level_order, school_type)
                   VALUES (%s, %s, %s, %s)""",
                (code, name, level_order, school_type),
            )
            counts["grade_levels"] += 1
        cur.execute("SELECT id, code FROM grade_levels ORDER BY level_order")
        grade_map = {code: gid for gid, code in cur.fetchall()}

        # 3) SUBJECTS --------------------------------------------------------
        print("Seeding subjects...")
        for code, name in SUBJECTS:
            cur.execute(
                "INSERT INTO subjects (code, name) VALUES (%s, %s)",
                (code, name),
            )
            counts["subjects"] += 1
        cur.execute("SELECT id, code FROM subjects")
        subject_map = {code: sid for sid, code in cur.fetchall()}

        # 4) ACADEMIC YEARS / TERMS ------------------------------------------
        print("Seeding academic years and terms...")
        today = date.today()
        current_start_year = today.year if today.month >= 9 else today.year - 1
        year_starts = [current_start_year - 1, current_start_year, current_start_year + 1]

        academic_year_id_by_start = {}
        term_id_by_key = {}
        current_ay_id = None
        current_term_id = None

        for ys in year_starts:
            start_date, end_date = academic_year_bounds(ys)
            label = f"{ys}/{ys + 1}"
            is_current = 1 if ys == current_start_year else 0
            cur.execute(
                """INSERT INTO academic_years (label, start_date, end_date, is_current)
                   VALUES (%s, %s, %s, %s)""",
                (label, start_date, end_date, is_current),
            )
            ay_id = cur.lastrowid
            academic_year_id_by_start[ys] = ay_id
            counts["academic_years"] += 1
            if is_current:
                current_ay_id = ay_id

            for term_number, t_start, t_end in term_bounds(ys):
                cur.execute(
                    """INSERT INTO terms (academic_year_id, term_number, start_date, end_date)
                       VALUES (%s, %s, %s, %s)""",
                    (ay_id, term_number, t_start, t_end),
                )
                term_id = cur.lastrowid
                term_id_by_key[(ys, term_number)] = term_id
                counts["terms"] += 1
                if is_current and t_start <= today <= t_end:
                    current_term_id = term_id

        # 5) SCHOOLS ---------------------------------------------------------
        print("Seeding schools...")
        schools: List[School] = []
        school_counter_by_region: Dict[int, int] = defaultdict(int)
        school_types = SCHOOL_TYPES
        for region_id, region_code, region_name in [(r["id"], r["code"], r["name"]) for r in regions.values()]:
            for _ in range(random.randint(*SCHOOLS_PER_REGION)):
                school_counter_by_region[region_id] += 1
                idx = school_counter_by_region[region_id]
                school_code = f"{idx:04d}"
                school_type = weighted_choice(school_types, SCHOOL_TYPE_WEIGHTS)
                district = fake.city()
                name = school_name(region_name, district, school_type, idx)
                address = f"{fake.street_name()}, {district}, {region_name}"
                phone = fake.phone_number()[:20]
                email = f"info.{clean_slug(name)}@srams.edu.gh"
                cur.execute(
                    """INSERT INTO schools
                           (school_code, region_id, name, district, address, phone, email, school_type, is_active)
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 1)""",
                    (school_code, region_id, name, district, address, phone, email, school_type),
                )
                school_id = cur.lastrowid
                schools.append(
                    School(
                        id=school_id,
                        region_id=region_id,
                        region_code=region_code,
                        region_name=region_name,
                        school_code=school_code,
                        name=name,
                        district=district,
                        school_type=school_type,
                    )
                )
                counts["schools"] += 1
                audit_rows.append(
                    (
                        "schools",
                        school_id,
                        "INSERT",
                        1,
                        None,
                        json_dump({"name": name, "region": region_name, "school_type": school_type}),
                    )
                )

        # 6) USERS (admin, school admins, teachers) --------------------------
        print("Seeding users and teachers...")
        users: List[User] = []
        teachers: List[Teacher] = []
        school_admin_by_school: Dict[int, User] = {}
        teachers_by_school: Dict[int, List[Teacher]] = defaultdict(list)
        used_emails = set()
        used_usernames = set()

        def unique_email(first: str, last: str, suffix: str) -> str:
            base = f"{first.lower()}.{last.lower()}.{suffix}@srams.edu.gh"
            candidate = base
            n = 1
            while candidate in used_emails:
                candidate = f"{first.lower()}.{last.lower()}.{suffix}.{n}@srams.edu.gh"
                n += 1
            used_emails.add(candidate)
            return candidate

        def unique_username(first: str, last: str, suffix: str) -> str:
            base = f"{clean_slug(first)}.{clean_slug(last)}.{suffix}"
            candidate = base
            n = 1
            while candidate in used_usernames:
                candidate = f"{base}.{n}"
                n += 1
            used_usernames.add(candidate)
            return candidate

        # ADMIN
        admin_first = "System"
        admin_last = "Administrator"
        admin_email = "admin@srams.edu.gh"
        admin_username = "admin"
        used_emails.add(admin_email)
        used_usernames.add(admin_username)
        cur.execute(
            """INSERT INTO users
                   (school_id, username, email, password_hash, first_name, last_name, role, is_active)
               VALUES (NULL, %s, %s, %s, %s, %s, 'ADMIN', 1)""",
            (admin_username, admin_email, PASSWORD_HASH, admin_first, admin_last),
        )
        admin_user_id = cur.lastrowid
        users.append(User(admin_user_id, None, "ADMIN", admin_first, admin_last, admin_email))
        counts["users"] += 1
        audit_rows.append(("users", admin_user_id, "INSERT", admin_user_id, None, json_dump({"role": "ADMIN", "email": admin_email})))

        # SCHOOL ADMINS
        for school in schools:
            first = fake.first_name()
            last = fake.last_name()
            email = unique_email(first, last, f"sa{school.id}")
            username = unique_username(first, last, f"sa{school.id}")
            cur.execute(
                """INSERT INTO users
                       (school_id, username, email, password_hash, first_name, last_name, role, is_active)
                   VALUES (%s, %s, %s, %s, %s, %s, 'SCHOOL_ADMIN', 1)""",
                (school.id, username, email, PASSWORD_HASH, first, last),
            )
            user_id = cur.lastrowid
            user = User(user_id, school.id, "SCHOOL_ADMIN", first, last, email)
            users.append(user)
            school_admin_by_school[school.id] = user
            counts["users"] += 1
            audit_rows.append(("users", user_id, "INSERT", admin_user_id, None, json_dump({"role": "SCHOOL_ADMIN", "school_id": school.id})))

        # TEACHERS
        for school in schools:
            num_teachers = random.randint(*TEACHERS_PER_SCHOOL)
            for t_idx in range(1, num_teachers + 1):
                first = fake.first_name()
                last = fake.last_name()
                email = unique_email(first, last, f"t{school.id}.{t_idx}")
                username = unique_username(first, last, f"t{school.id}.{t_idx}")
                cur.execute(
                    """INSERT INTO users
                           (school_id, username, email, password_hash, first_name, last_name, role, is_active)
                       VALUES (%s, %s, %s, %s, %s, %s, 'TEACHER', 1)""",
                    (school.id, username, email, PASSWORD_HASH, first, last),
                )
                user_id = cur.lastrowid
                teacher_user = User(user_id, school.id, "TEACHER", first, last, email)
                users.append(teacher_user)
                counts["users"] += 1

                staff_id = f"GES-{school.region_code}-{school.school_code}-{t_idx:02d}"
                qualification = weighted_choice(
                    ["Diploma in Basic Education", "Bachelor of Education", "Master of Education"],
                    [0.45, 0.45, 0.10],
                )
                phone = fake.phone_number()[:20]
                date_employed = date(date.today().year - random.randint(1, 15), random.randint(1, 12), random.randint(1, 28))
                cur.execute(
                    """INSERT INTO teachers
                           (user_id, school_id, staff_id, date_of_birth, gender, phone,
                            qualification, date_employed, is_active)
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 1)""",
                    (
                        user_id,
                        school.id,
                        staff_id,
                        dob_for_grade(random.choice(AVAILABLE_GRADE_CODES[school.school_type])).isoformat(),
                        random.choice(["MALE", "FEMALE"]),
                        phone,
                        qualification,
                        date_employed,
                    ),
                )
                teacher_id = cur.lastrowid
                teacher = Teacher(teacher_id, user_id, school.id, f"{first} {last}")
                teachers.append(teacher)
                teachers_by_school[school.id].append(teacher)
                counts["teachers"] += 1
                audit_rows.append(("teachers", teacher_id, "INSERT", user_id, None, json_dump({"school_id": school.id, "staff_id": staff_id})))

        # 7) STUDENTS --------------------------------------------------------
        print("Seeding students...")
        students: List[Student] = []
        usid_sequences: Dict[Tuple[str, str, int], int] = defaultdict(int)
        school_students: Dict[int, List[Student]] = defaultdict(list)

        for school in schools:
            allowed_codes = AVAILABLE_GRADE_CODES[school.school_type]
            num_students = random.randint(*STUDENTS_PER_SCHOOL)
            for _ in range(num_students):
                grade_code = weighted_choice(allowed_codes, [
                    0.06 if g.startswith("KG") else 0.14 if g in ["P1", "P2", "P3"] else 0.13 if g in ["P4", "P5", "P6"] else 0.09
                    for g in allowed_codes
                ])
                grade_id = grade_map[grade_code]
                first = fake.first_name()
                last = fake.last_name()
                school_admin = school_admin_by_school[school.id]

                enroll_year = random.choice([current_start_year - 1, current_start_year, current_start_year + 1])
                key = (school.region_code, school.school_code, enroll_year)
                usid_sequences[key] += 1
                sequence = usid_sequences[key]
                usid = generate_usid(school.region_code, school.school_code, enroll_year, sequence)

                enrollment_date = date(enroll_year, random.randint(1, 12), random.randint(1, 28))
                if enrollment_date > today:
                    enrollment_date = today - timedelta(days=random.randint(1, 90))
                gender = weighted_choice(["MALE", "FEMALE", "OTHER"], [0.49, 0.49, 0.02])
                guardian_name = fake.name()
                guardian_phone = fake.phone_number()[:20]
                guardian_relation = weighted_choice(["Parent", "Guardian", "Aunt", "Uncle", "Sibling"], [0.68, 0.18, 0.06, 0.04, 0.04])
                address = f"{fake.street_name()}, {school.district}"
                middle_name = fake.first_name() if random.random() < 0.52 else None
                nationality = "Ghanaian"

                cur.execute(
                    """INSERT INTO students
                           (usid, school_id, grade_level_id, first_name, middle_name, last_name,
                            date_of_birth, gender, nationality, guardian_name, guardian_phone,
                            guardian_relation, address, enrollment_date, enrollment_year,
                            status, photo_url, created_by)
                       VALUES
                           (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'ACTIVE', NULL, %s)""",
                    (
                        usid,
                        school.id,
                        grade_id,
                        first,
                        middle_name,
                        last,
                        dob_for_grade(grade_code),
                        gender,
                        nationality,
                        guardian_name,
                        guardian_phone,
                        guardian_relation,
                        address,
                        enrollment_date,
                        enroll_year,
                        school_admin.id,
                    ),
                )
                student_id = cur.lastrowid
                student = Student(
                    id=student_id,
                    usid=usid,
                    school_id=school.id,
                    school_region_id=school.region_id,
                    school_region_code=school.region_code,
                    school_code=school.school_code,
                    grade_level_id=grade_id,
                    grade_code=grade_code,
                    first_name=first,
                    last_name=last,
                    enrollment_year=enroll_year,
                    school_admin_id=school_admin.id,
                )
                students.append(student)
                school_students[school.id].append(student)
                counts["students"] += 1
                audit_rows.append(("students", student_id, "INSERT", school_admin.id, None, json_dump({"usid": usid, "school_id": school.id, "grade_code": grade_code})))

        # 8) USER ACCOUNTS FOR STUDENTS --------------------------------------
        print("Creating student user accounts...")
        for st in students:
            first = st.first_name
            last = st.last_name
            email = f"{clean_slug(st.usid.lower())}@students.srams.edu.gh"
            base_username = f"{clean_slug(first)}.{clean_slug(last)}.{st.id}"
            username = base_username
            n = 1
            while username in used_usernames:
                username = f"{base_username}.{n}"
                n += 1
            used_usernames.add(username)
            used_emails.add(email)
            cur.execute(
                """INSERT INTO users
                       (school_id, student_id, username, email, password_hash,
                        first_name, last_name, role, is_active)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, 'STUDENT', 1)""",
                (st.school_id, st.id, username, email, PASSWORD_HASH, first, last),
            )
            user_id = cur.lastrowid
            counts["users"] += 1
            audit_rows.append(("users", user_id, "INSERT", st.school_admin_id, None, json_dump({"role": "STUDENT", "student_id": st.id, "school_id": st.school_id})))

        # 9) TEACHER CLASS ASSIGNMENTS ---------------------------------------
        print("Assigning teachers to classes...")
        tca_rows = 0
        assignment_lookup = defaultdict(list)  # (school_id, grade_level_id, term_id) -> teacher_ids
        for school in schools:
            school_teachers = teachers_by_school[school.id]
            if not school_teachers:
                continue
            allowed_grade_codes = AVAILABLE_GRADE_CODES[school.school_type]
            for ys in year_starts:
                for term_number in (1, 2, 3):
                    term_id = term_id_by_key[(ys, term_number)]
                    for idx, grade_code in enumerate(allowed_grade_codes):
                        teacher = school_teachers[(idx + term_number) % len(school_teachers)]
                        grade_id = grade_map[grade_code]
                        cur.execute(
                            """INSERT INTO teacher_class_assignments
                                   (teacher_id, school_id, grade_level_id, term_id, is_active)
                               VALUES (%s, %s, %s, %s, 1)""",
                            (teacher.id, school.id, grade_id, term_id),
                        )
                        assignment_lookup[(school.id, grade_id, term_id)].append(teacher.id)
                        tca_rows += 1
        counts["teacher_class_assignments"] = tca_rows

        # 10) ATTENDANCE RECORDS ----------------------------------------------
        print("Seeding attendance records...")
        att_rows = 0
        for school in schools:
            allowed_grade_codes = AVAILABLE_GRADE_CODES[school.school_type]
            for ys in year_starts:
                for term_number, t_start, t_end in term_bounds(ys):
                    term_id = term_id_by_key[(ys, term_number)]
                    for grade_code in allowed_grade_codes:
                        grade_id = grade_map[grade_code]
                        class_students = [s for s in school_students[school.id] if s.grade_code == grade_code]
                        if not class_students:
                            continue
                        marked_by_candidates = assignment_lookup.get((school.id, grade_id, term_id), [])
                        if marked_by_candidates:
                            marked_by = random.choice(marked_by_candidates)
                        else:
                            marked_by = school_admin_by_school[school.id].id

                        dates = school_days(t_start, t_end, random.randint(*ATTENDANCE_DAYS_PER_TERM_PER_GRADE))
                        for a_date in dates:
                            for period in ("MORNING", "AFTERNOON"):
                                if period == "AFTERNOON" and random.random() < 0.35:
                                    continue
                                for st in class_students:
                                    status = weighted_choice(ATTENDANCE_STATUSES, ATTENDANCE_WEIGHTS)
                                    absence_reason = None
                                    if status in ("ABSENT", "EXCUSED"):
                                        absence_reason = weighted_choice(
                                            ["Sick", "Family issue", "Travel", "Appointment", "Other"],
                                            [0.45, 0.15, 0.15, 0.15, 0.10],
                                        )
                                    cur.execute(
                                        """INSERT INTO attendance_records
                                               (student_id, school_id, grade_level_id, term_id,
                                                attendance_date, period, status, absence_reason, marked_by)
                                           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                                        (
                                            st.id,
                                            school.id,
                                            grade_id,
                                            term_id,
                                            a_date,
                                            period,
                                            status,
                                            absence_reason,
                                            marked_by,
                                        ),
                                    )
                                    att_rows += 1
        counts["attendance_records"] = att_rows

        # 11) ACADEMIC PERFORMANCE -------------------------------------------
        print("Seeding academic performance...")
        perf_rows = []
        for school in schools:
            for ys in year_starts:
                for term_number in (1, 2, 3):
                    term_id = term_id_by_key[(ys, term_number)]
                    for st in [s for s in school_students[school.id]]:
                        subject_codes = SUBJECT_SETS[st.grade_code]
                        assess_teacher_ids = assignment_lookup.get((school.id, st.grade_level_id, term_id), [])
                        recorded_by = random.choice(assess_teacher_ids) if assess_teacher_ids else school_admin_by_school[school.id].id
                        for subject_code in subject_codes:
                            class_score = round(random.uniform(12, 30), 2)
                            exam_score = round(random.uniform(35, 70), 2)
                            total = round(min(class_score + exam_score, 100), 2)
                            grade = calc_grade(total)
                            perf_rows.append(
                                {
                                    "student_id": st.id,
                                    "school_id": school.id,
                                    "term_id": term_id,
                                    "grade_level_id": st.grade_level_id,
                                    "subject_id": subject_map[subject_code],
                                    "class_score": class_score,
                                    "exam_score": exam_score,
                                    "total_score": total,
                                    "grade": grade,
                                    "position": None,
                                    "remarks": weighted_choice(
                                        ["Excellent work", "Good progress", "Satisfactory", "Needs improvement", "Very promising"],
                                        [0.16, 0.26, 0.28, 0.16, 0.14],
                                    ),
                                    "recorded_by": recorded_by,
                                }
                            )

        # Compute positions per school/term/grade/subject
        groups = defaultdict(list)
        for idx, row in enumerate(perf_rows):
            key = (row["school_id"], row["term_id"], row["grade_level_id"], row["subject_id"])
            groups[key].append(idx)
        for key, indices in groups.items():
            indices.sort(key=lambda i: perf_rows[i]["total_score"], reverse=True)
            for pos, row_idx in enumerate(indices, start=1):
                perf_rows[row_idx]["position"] = pos

        for row in perf_rows:
            cur.execute(
                """INSERT INTO academic_performance
                       (student_id, school_id, term_id, grade_level_id, subject_id,
                        class_score, exam_score, total_score, grade, position, remarks, recorded_by)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                (
                    row["student_id"],
                    row["school_id"],
                    row["term_id"],
                    row["grade_level_id"],
                    row["subject_id"],
                    row["class_score"],
                    row["exam_score"],
                    row["total_score"],
                    row["grade"],
                    row["position"],
                    row["remarks"],
                    row["recorded_by"],
                ),
            )
        counts["academic_performance"] = len(perf_rows)

        # 12) TRANSFER REQUESTS / DOCS ---------------------------------------
        print("Seeding transfer requests and documents...")
        transfer_rows = []
        completed_transfers = []
        transfer_students = random.sample(students, min(TRANSFER_REQUESTS_TOTAL, len(students)))
        for idx, st in enumerate(transfer_students, start=1):
            from_school = next(s for s in schools if s.id == st.school_id)
            possible_destinations = [s for s in schools if s.id != from_school.id]
            to_school = random.choice(possible_destinations)
            requester = school_admin_by_school[from_school.id].id
            status = weighted_choice(
                ["PENDING", "SENDING_APPROVED", "RECEIVING_CONFIRMED", "COMPLETED", "REJECTED", "CANCELLED"],
                [0.20, 0.15, 0.12, 0.28, 0.15, 0.10],
            )
            req_date = rand_date(date(today.year - 1, 1, 10), today)
            reason = random.choice(TRANSFER_REASONS)
            sending_approved_at = receiving_confirmed_at = completed_at = None
            sending_approved_by = receiving_confirmed_by = None
            rejection_reason = None
            notes = None

            if status in ("SENDING_APPROVED", "RECEIVING_CONFIRMED", "COMPLETED"):
                sending_approved_at = datetime.combine(req_date + timedelta(days=1), datetime.min.time())
                sending_approved_by = requester
            if status in ("RECEIVING_CONFIRMED", "COMPLETED"):
                receiving_confirmed_at = datetime.combine(req_date + timedelta(days=3), datetime.min.time())
                receiving_confirmed_by = school_admin_by_school[to_school.id].id
            if status == "COMPLETED":
                completed_at = datetime.combine(req_date + timedelta(days=5), datetime.min.time())
                notes = "Transfer completed successfully."
                completed_transfers.append((st.id, to_school.id))
            elif status == "REJECTED":
                rejection_reason = random.choice([
                    "No space available at destination school.",
                    "Incomplete transfer documents.",
                    "Destination school rejected the request.",
                ])
            elif status == "CANCELLED":
                notes = "Request cancelled by the requester."

            cur.execute(
                """INSERT INTO transfer_requests
                       (student_id, from_school_id, to_school_id, requested_by, reason, status,
                        request_date, sending_approved_at, sending_approved_by,
                        receiving_confirmed_at, receiving_confirmed_by, completed_at,
                        rejection_reason, notes)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                (
                    st.id,
                    from_school.id,
                    to_school.id,
                    requester,
                    reason,
                    status,
                    req_date,
                    sending_approved_at,
                    sending_approved_by,
                    receiving_confirmed_at,
                    receiving_confirmed_by,
                    completed_at,
                    rejection_reason,
                    notes,
                ),
            )
            tr_id = cur.lastrowid
            transfer_rows.append({
                "id": tr_id,
                "student_id": st.id,
                "from_school_id": from_school.id,
                "to_school_id": to_school.id,
                "status": status,
                "request_date": req_date,
                "requester": requester,
            })
            counts["transfer_requests"] += 1
            audit_rows.append(("transfer_requests", tr_id, "INSERT", requester, None, json_dump({"student_id": st.id, "status": status, "from": from_school.id, "to": to_school.id})))

            # Attach documents to some requests
            for doc_idx in range(random.randint(*TRANSFER_DOCS_PER_REQUEST)):
                doc_type = random.choice(TRANSFER_DOC_TYPES)
                file_name = f"{clean_slug(doc_type)}_{tr_id}_{doc_idx + 1}.pdf"
                file_path = f"/storage/transfers/{tr_id}/{file_name}"
                uploader = random.choice([requester, school_admin_by_school[to_school.id].id])
                cur.execute(
                    """INSERT INTO transfer_documents
                           (transfer_request_id, document_type, file_name, file_path, uploaded_by)
                       VALUES (%s, %s, %s, %s, %s)""",
                    (tr_id, doc_type, file_name, file_path, uploader),
                )
                counts["transfer_documents"] += 1
                audit_rows.append(("transfer_documents", cur.lastrowid, "INSERT", uploader, None, json_dump({"transfer_request_id": tr_id, "document_type": doc_type})))

        # Apply completed transfers to the students table so current school matches
        for student_id, to_school_id in completed_transfers:
            cur.execute("SELECT school_id FROM students WHERE id = %s", (student_id,))
            old_school_id = cur.fetchone()[0]
            cur.execute(
                "UPDATE students SET school_id = %s, status = 'ACTIVE' WHERE id = %s",
                (to_school_id, student_id),
            )
            audit_rows.append((
                "students",
                student_id,
                "UPDATE",
                admin_user_id,
                json_dump({"school_id": old_school_id}),
                json_dump({"school_id": to_school_id, "status": "ACTIVE"}),
            ))

        # 13) AUDIT LOG ------------------------------------------------------
        print("Seeding audit log...")
        # Add some generic audit entries for users and performance batches
        for st in students[: min(len(students), 40)]:
            audit_rows.append(("students", st.id, "UPDATE", st.school_admin_id, json_dump({"status": "NEW"}), json_dump({"status": "ACTIVE"})))

        audit_insert_rows = []
        for table_name, record_id, action, changed_by, old_values, new_values in audit_rows:
            audit_insert_rows.append((table_name, record_id, action, changed_by, old_values, new_values))

        cur.executemany(
            """INSERT INTO audit_log
                   (table_name, record_id, action, changed_by, old_values, new_values)
               VALUES (%s, %s, %s, %s, %s, %s)""",
            audit_insert_rows,
        )
        counts["audit_log"] = len(audit_insert_rows)

        conn.commit()
        print("\n[OK] Seed completed successfully.\n")

    except Exception as exc:
        conn.rollback()
        print(f"\n[ERROR] Seed failed and was rolled back: {exc}")
        raise

    finally:
        cur.close()
        conn.close()

    # Summary
    print("=" * 60)
    print(f"{'Table':<28} {'Rows':>10}")
    print("-" * 60)
    total = 0
    for key in [
        "regions",
        "grade_levels",
        "subjects",
        "academic_years",
        "terms",
        "schools",
        "users",
        "teachers",
        "students",
        "teacher_class_assignments",
        "attendance_records",
        "academic_performance",
        "transfer_requests",
        "transfer_documents",
        "audit_log",
    ]:
        total += counts.get(key, 0)
        print(f"{key:<28} {counts.get(key, 0):>10,}")
    print("-" * 60)
    print(f"{'TOTAL':<28} {total:>10,}")
    print("=" * 60)


if __name__ == "__main__":
    main()
