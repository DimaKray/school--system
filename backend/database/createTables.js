require("dotenv").config();

const pool = require("../config/db");

/*
 * Створення структури бази даних EduJournal.
 * Скрипт можна запускати повторно: таблиці створюються з IF NOT EXISTS,
 * а нові поля й обмеження додаються до вже існуючої бази (див. migrate()).
 */

const TABLES = [

    // USERS — облікові записи всіх користувачів
    `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'teacher', 'student', 'parent')),
        photo_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT chk_users_email CHECK (email LIKE '%_@_%._%')
    )`,

    // TEACHERS — профіль вчителя (1:1 з users)
    `CREATE TABLE IF NOT EXISTS teachers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE,
        phone VARCHAR(30),
        specialization VARCHAR(255),
        CONSTRAINT fk_teacher_user FOREIGN KEY (user_id)
            REFERENCES users(id) ON DELETE CASCADE
    )`,

    // CLASSES — шкільні класи
    `CREATE TABLE IF NOT EXISTS classes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(20) NOT NULL,
        school_year VARCHAR(20) NOT NULL,
        teacher_id INTEGER,
        CONSTRAINT fk_class_teacher FOREIGN KEY (teacher_id)
            REFERENCES teachers(id) ON DELETE SET NULL,
        CONSTRAINT uq_class_name_year UNIQUE (name, school_year)
    )`,

    // STUDENTS — профіль учня (1:1 з users), належить до класу
    `CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE,
        class_id INTEGER,
        birth_date DATE,
        phone VARCHAR(30),
        address TEXT,
        CONSTRAINT fk_student_user FOREIGN KEY (user_id)
            REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_student_class FOREIGN KEY (class_id)
            REFERENCES classes(id) ON DELETE SET NULL
    )`,

    // PARENT_STUDENTS — зв'язок «батьки — дитина» (M:N)
    `CREATE TABLE IF NOT EXISTS parent_students (
        parent_user_id INTEGER NOT NULL,
        student_id INTEGER NOT NULL,
        PRIMARY KEY (parent_user_id, student_id),
        CONSTRAINT fk_ps_parent FOREIGN KEY (parent_user_id)
            REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_ps_student FOREIGN KEY (student_id)
            REFERENCES students(id) ON DELETE CASCADE
    )`,

    // SUBJECTS — навчальні предмети, закріплені за вчителем
    `CREATE TABLE IF NOT EXISTS subjects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        teacher_id INTEGER,
        CONSTRAINT fk_subject_teacher FOREIGN KEY (teacher_id)
            REFERENCES teachers(id) ON DELETE SET NULL
    )`,

    // SCHEDULE — розклад уроків
    `CREATE TABLE IF NOT EXISTS schedule (
        id SERIAL PRIMARY KEY,
        class_id INTEGER NOT NULL,
        subject_id INTEGER NOT NULL,
        teacher_id INTEGER NOT NULL,
        weekday INTEGER NOT NULL CHECK (weekday BETWEEN 1 AND 7),
        lesson_number INTEGER NOT NULL CHECK (lesson_number BETWEEN 1 AND 12),
        room VARCHAR(20),
        CONSTRAINT fk_schedule_class FOREIGN KEY (class_id)
            REFERENCES classes(id) ON DELETE CASCADE,
        CONSTRAINT fk_schedule_subject FOREIGN KEY (subject_id)
            REFERENCES subjects(id) ON DELETE CASCADE,
        CONSTRAINT fk_schedule_teacher FOREIGN KEY (teacher_id)
            REFERENCES teachers(id) ON DELETE CASCADE,
        CONSTRAINT uq_schedule_slot UNIQUE (class_id, weekday, lesson_number)
    )`,

    // GRADES — оцінки (12-бальна шкала)
    `CREATE TABLE IF NOT EXISTS grades (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL,
        subject_id INTEGER NOT NULL,
        teacher_id INTEGER NOT NULL,
        grade INTEGER NOT NULL CHECK (grade BETWEEN 1 AND 12),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_grade_student FOREIGN KEY (student_id)
            REFERENCES students(id) ON DELETE CASCADE,
        CONSTRAINT fk_grade_subject FOREIGN KEY (subject_id)
            REFERENCES subjects(id) ON DELETE CASCADE,
        CONSTRAINT fk_grade_teacher FOREIGN KEY (teacher_id)
            REFERENCES teachers(id) ON DELETE CASCADE
    )`,

    // ATTENDANCE — відвідуваність (одна відмітка на учня за день)
    `CREATE TABLE IF NOT EXISTS attendance (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL,
        lesson_date DATE NOT NULL,
        status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late')),
        CONSTRAINT fk_attendance_student FOREIGN KEY (student_id)
            REFERENCES students(id) ON DELETE CASCADE,
        CONSTRAINT uq_attendance_student_date UNIQUE (student_id, lesson_date)
    )`,

    // HOMEWORK — домашні завдання для класу з предмета
    `CREATE TABLE IF NOT EXISTS homework (
        id SERIAL PRIMARY KEY,
        teacher_id INTEGER NOT NULL,
        class_id INTEGER NOT NULL,
        subject_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        deadline TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_homework_teacher FOREIGN KEY (teacher_id)
            REFERENCES teachers(id) ON DELETE CASCADE,
        CONSTRAINT fk_homework_class FOREIGN KEY (class_id)
            REFERENCES classes(id) ON DELETE CASCADE,
        CONSTRAINT fk_homework_subject FOREIGN KEY (subject_id)
            REFERENCES subjects(id) ON DELETE CASCADE
    )`,

    // HOMEWORK_SUBMISSIONS — роботи учнів (одна робота на учня для завдання)
    `CREATE TABLE IF NOT EXISTS homework_submissions (
        id SERIAL PRIMARY KEY,
        homework_id INTEGER NOT NULL,
        student_id INTEGER NOT NULL,
        file_url TEXT,
        comment TEXT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        grade INTEGER CHECK (grade BETWEEN 1 AND 12),
        CONSTRAINT fk_submission_homework FOREIGN KEY (homework_id)
            REFERENCES homework(id) ON DELETE CASCADE,
        CONSTRAINT fk_submission_student FOREIGN KEY (student_id)
            REFERENCES students(id) ON DELETE CASCADE,
        CONSTRAINT uq_submission UNIQUE (homework_id, student_id)
    )`
];

// Індекси для зовнішніх ключів і частих фільтрів
const INDEXES = [
    "CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_id)",
    "CREATE INDEX IF NOT EXISTS idx_ps_student ON parent_students(student_id)",
    "CREATE INDEX IF NOT EXISTS idx_subjects_teacher ON subjects(teacher_id)",
    "CREATE INDEX IF NOT EXISTS idx_schedule_teacher ON schedule(teacher_id)",
    "CREATE INDEX IF NOT EXISTS idx_grades_student ON grades(student_id)",
    "CREATE INDEX IF NOT EXISTS idx_grades_subject ON grades(subject_id)",
    "CREATE INDEX IF NOT EXISTS idx_grades_created ON grades(created_at)",
    "CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(lesson_date)",
    "CREATE INDEX IF NOT EXISTS idx_homework_class ON homework(class_id)",
    "CREATE INDEX IF NOT EXISTS idx_submissions_student ON homework_submissions(student_id)"
];

// Оновлення бази, створеної попередньою версією скрипта
const MIGRATIONS = [
    ["subjects.description", "ALTER TABLE subjects ADD COLUMN IF NOT EXISTS description TEXT"],
    ["homework_submissions.comment", "ALTER TABLE homework_submissions ADD COLUMN IF NOT EXISTS comment TEXT"],
    ["uq_class_name_year", "ALTER TABLE classes ADD CONSTRAINT uq_class_name_year UNIQUE (name, school_year)"],
    ["uq_schedule_slot", "ALTER TABLE schedule ADD CONSTRAINT uq_schedule_slot UNIQUE (class_id, weekday, lesson_number)"],
    ["uq_attendance_student_date", "ALTER TABLE attendance ADD CONSTRAINT uq_attendance_student_date UNIQUE (student_id, lesson_date)"],
    ["uq_submission", "ALTER TABLE homework_submissions ADD CONSTRAINT uq_submission UNIQUE (homework_id, student_id)"],
    ["chk_users_email", "ALTER TABLE users ADD CONSTRAINT chk_users_email CHECK (email LIKE '%_@_%._%')"]
];

async function constraintExists(name) {
    const result = await pool.query(
        "SELECT 1 FROM pg_constraint WHERE conname = $1",
        [name]
    );
    return result.rows.length > 0;
}

async function migrate() {

    for (const [name, sql] of MIGRATIONS) {

        if (!name.includes(".") && await constraintExists(name)) {
            continue;
        }

        try {
            await pool.query(sql);
        } catch (error) {
            // Наприклад, у старих даних є дублікати — обмеження не додається,
            // але решта скрипта продовжує роботу.
            console.warn(`⚠️  ${name}: ${error.message}`);
        }

    }

}

async function createTables() {

    try {

        console.log("🚀 Creating database...");

        for (const sql of TABLES) {
            await pool.query(sql);
            console.log("✅ " + sql.match(/EXISTS (\w+)/)[1]);
        }

        await migrate();

        for (const sql of INDEXES) {
            await pool.query(sql);
        }

        console.log("✅ indexes");
        console.log("🎉 Database created successfully");

    } catch (error) {

        console.error(error);
        process.exitCode = 1;

    } finally {

        await pool.end();

    }

}

createTables();
