require("dotenv").config();

const pool = require("../config/db");

async function createTables() {
    try {

        console.log("🚀 Creating database...");

        // USERS
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'teacher', 'student', 'parent')),
                photo_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("✅ users");

        // TEACHERS
        await pool.query(`
            CREATE TABLE IF NOT EXISTS teachers (
                id SERIAL PRIMARY KEY,
                user_id INTEGER UNIQUE NOT NULL,
                phone VARCHAR(30),
                specialization VARCHAR(255),

                CONSTRAINT fk_teacher_user
                    FOREIGN KEY (user_id)
                    REFERENCES users(id)
                    ON DELETE CASCADE
            );
        `);

        console.log("✅ teachers");

        // CLASSES
        await pool.query(`
            CREATE TABLE IF NOT EXISTS classes (
                id SERIAL PRIMARY KEY,
                name VARCHAR(20) NOT NULL,
                school_year VARCHAR(20) NOT NULL,
                teacher_id INTEGER,

                CONSTRAINT fk_class_teacher
                    FOREIGN KEY (teacher_id)
                    REFERENCES teachers(id)
                    ON DELETE SET NULL
            );
        `);

        console.log("✅ classes");

        // STUDENTS
        await pool.query(`
            CREATE TABLE IF NOT EXISTS students (
                id SERIAL PRIMARY KEY,

                user_id INTEGER UNIQUE NOT NULL,

                class_id INTEGER,

                birth_date DATE,

                phone VARCHAR(30),

                address TEXT,

                CONSTRAINT fk_student_user
                    FOREIGN KEY (user_id)
                    REFERENCES users(id)
                    ON DELETE CASCADE,

                CONSTRAINT fk_student_class
                    FOREIGN KEY (class_id)
                    REFERENCES classes(id)
                    ON DELETE SET NULL
            );
        `);

        console.log("✅ students");

        // SUBJECTS
        await pool.query(`
            CREATE TABLE IF NOT EXISTS subjects (
                id SERIAL PRIMARY KEY,

                name VARCHAR(100) NOT NULL,

                teacher_id INTEGER,

                CONSTRAINT fk_subject_teacher
                    FOREIGN KEY (teacher_id)
                    REFERENCES teachers(id)
                    ON DELETE SET NULL
            );
        `);

        console.log("✅ subjects");

        // SCHEDULE
        await pool.query(`
            CREATE TABLE IF NOT EXISTS schedule (
                id SERIAL PRIMARY KEY,

                class_id INTEGER NOT NULL,

                subject_id INTEGER NOT NULL,

                teacher_id INTEGER NOT NULL,

                weekday INTEGER NOT NULL CHECK (weekday BETWEEN 1 AND 7),

                lesson_number INTEGER NOT NULL CHECK (lesson_number BETWEEN 1 AND 12),

                room VARCHAR(20),

                CONSTRAINT fk_schedule_class
                    FOREIGN KEY (class_id)
                    REFERENCES classes(id)
                    ON DELETE CASCADE,

                CONSTRAINT fk_schedule_subject
                    FOREIGN KEY (subject_id)
                    REFERENCES subjects(id)
                    ON DELETE CASCADE,

                CONSTRAINT fk_schedule_teacher
                    FOREIGN KEY (teacher_id)
                    REFERENCES teachers(id)
                    ON DELETE CASCADE
            );
        `);

        console.log("✅ schedule");

        // GRADES
        await pool.query(`
            CREATE TABLE IF NOT EXISTS grades (
                id SERIAL PRIMARY KEY,

                student_id INTEGER NOT NULL,

                subject_id INTEGER NOT NULL,

                teacher_id INTEGER NOT NULL,

                grade INTEGER NOT NULL CHECK (grade BETWEEN 1 AND 12),

                comment TEXT,

                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                CONSTRAINT fk_grade_student
                    FOREIGN KEY (student_id)
                    REFERENCES students(id)
                    ON DELETE CASCADE,

                CONSTRAINT fk_grade_subject
                    FOREIGN KEY (subject_id)
                    REFERENCES subjects(id)
                    ON DELETE CASCADE,

                CONSTRAINT fk_grade_teacher
                    FOREIGN KEY (teacher_id)
                    REFERENCES teachers(id)
                    ON DELETE CASCADE
            );
        `);

        console.log("✅ grades");

        // ATTENDANCE
        await pool.query(`
            CREATE TABLE IF NOT EXISTS attendance (
                id SERIAL PRIMARY KEY,

                student_id INTEGER NOT NULL,

                lesson_date DATE NOT NULL,

                status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late')),

                CONSTRAINT fk_attendance_student
                    FOREIGN KEY (student_id)
                    REFERENCES students(id)
                    ON DELETE CASCADE
            );
        `);

        console.log("✅ attendance");

        // HOMEWORK
        await pool.query(`
            CREATE TABLE IF NOT EXISTS homework (
                id SERIAL PRIMARY KEY,

                teacher_id INTEGER NOT NULL,

                class_id INTEGER NOT NULL,

                subject_id INTEGER NOT NULL,

                title VARCHAR(255) NOT NULL,

                description TEXT,

                deadline TIMESTAMP,

                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                CONSTRAINT fk_homework_teacher
                    FOREIGN KEY (teacher_id)
                    REFERENCES teachers(id)
                    ON DELETE CASCADE,

                CONSTRAINT fk_homework_class
                    FOREIGN KEY (class_id)
                    REFERENCES classes(id)
                    ON DELETE CASCADE,

                CONSTRAINT fk_homework_subject
                    FOREIGN KEY (subject_id)
                    REFERENCES subjects(id)
                    ON DELETE CASCADE
            );
        `);

        console.log("✅ homework");

        // HOMEWORK SUBMISSIONS
        await pool.query(`
            CREATE TABLE IF NOT EXISTS homework_submissions (
                id SERIAL PRIMARY KEY,

                homework_id INTEGER NOT NULL,

                student_id INTEGER NOT NULL,

                file_url TEXT,

                submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                grade INTEGER CHECK (grade BETWEEN 1 AND 12),

                CONSTRAINT fk_submission_homework
                    FOREIGN KEY (homework_id)
                    REFERENCES homework(id)
                    ON DELETE CASCADE,

                CONSTRAINT fk_submission_student
                    FOREIGN KEY (student_id)
                    REFERENCES students(id)
                    ON DELETE CASCADE
            );
        `);

        console.log("✅ homework_submissions");

            await pool.query(`
        CREATE TABLE IF NOT EXISTS teachers (
            id SERIAL PRIMARY KEY,

            user_id INTEGER UNIQUE
                REFERENCES users(id)
                ON DELETE CASCADE,

            subject VARCHAR(100) NOT NULL,

            phone VARCHAR(30),

            address TEXT
        );
    `);

        console.log("🎉 Database created successfully");

    } catch (error) {

        console.error(error);

    } finally {

        await pool.end();

    }
}

createTables();