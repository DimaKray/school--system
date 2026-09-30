require("dotenv").config();

const bcrypt = require("bcrypt");
const pool = require("../config/db");

const PASSWORD = "password123";

async function seed() {

    try {

        console.log("🌱 Наповнення бази тестовими даними...");

        console.log("🧹 Очищення попередніх тестових даних...");

        await pool.query(`
            TRUNCATE TABLE
                homework_submissions,
                homework,
                attendance,
                grades,
                schedule,
                subjects,
                students,
                classes,
                teachers,
                users
            RESTART IDENTITY CASCADE
        `);

        const hash = await bcrypt.hash(PASSWORD, 10);

        // ===== ADMIN =====
        const adminUser = await pool.query(
            `INSERT INTO users (first_name, last_name, email, password, role)
             VALUES ('Адмін', 'Адмінов', 'admin@school.com', $1, 'admin')
             ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
             RETURNING id`,
            [hash]
        );
        console.log("✅ Адмін: admin@school.com / " + PASSWORD);

        // ===== CLASSES =====
        const classNames = [
            ["9-А", "2025/2026"],
            ["10-Б", "2025/2026"],
            ["11-В", "2025/2026"]
        ];

        const classIds = [];

        for (const [name, year] of classNames) {

            const result = await pool.query(
                `INSERT INTO classes (name, school_year) VALUES ($1, $2) RETURNING id`,
                [name, year]
            );

            classIds.push(result.rows[0].id);

        }

        console.log(`✅ Класи: ${classIds.length}`);

        // ===== TEACHERS =====
        const teacherData = [
            ["Олена", "Коваленко", "koval@school.com", "Математика"],
            ["Ігор", "Петренко", "petrenko@school.com", "Фізика"],
            ["Марія", "Шевченко", "shevchenko@school.com", "Українська мова"],
            ["Андрій", "Бондаренко", "bondarenko@school.com", "Історія"],
            ["Наталія", "Мельник", "melnyk@school.com", "Англійська мова"]
        ];

        const teacherIds = [];

        for (const [first, last, email, specialization] of teacherData) {

            const userResult = await pool.query(
                `INSERT INTO users (first_name, last_name, email, password, role)
                 VALUES ($1, $2, $3, $4, 'teacher')
                 ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
                 RETURNING id`,
                [first, last, email, hash]
            );

            const userId = userResult.rows[0].id;

            const teacherResult = await pool.query(
                `INSERT INTO teachers (user_id, specialization, phone)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (user_id) DO UPDATE SET specialization = EXCLUDED.specialization
                 RETURNING id`,
                [userId, specialization, "+380 67 000 00 0" + teacherIds.length]
            );

            teacherIds.push(teacherResult.rows[0].id);

        }

        console.log(`✅ Вчителі: ${teacherIds.length}`);

        // ===== SUBJECTS =====
        const subjectNames = [
            ["Алгебра", teacherIds[0]],
            ["Геометрія", teacherIds[0]],
            ["Фізика", teacherIds[1]],
            ["Українська мова", teacherIds[2]],
            ["Українська література", teacherIds[2]],
            ["Історія України", teacherIds[3]],
            ["Англійська мова", teacherIds[4]]
        ];

        const subjectIds = [];

        for (const [name, teacherId] of subjectNames) {

            const result = await pool.query(
                `INSERT INTO subjects (name, teacher_id) VALUES ($1, $2) RETURNING id`,
                [name, teacherId]
            );

            subjectIds.push(result.rows[0].id);

        }

        console.log(`✅ Предмети: ${subjectIds.length}`);

        // ===== STUDENTS =====
        const firstNames = [
            "Дмитро", "Софія", "Максим", "Анна", "Артем", "Юлія",
            "Владислав", "Катерина", "Богдан", "Вікторія", "Роман", "Дарина",
            "Тарас", "Олена", "Микита", "Валерія", "Данило", "Аліна"
        ];

        const lastNames = [
            "Іваненко", "Гриценко", "Ткаченко", "Кравченко", "Олійник",
            "Шевчук", "Поліщук", "Бойко", "Пономаренко", "Романенко",
            "Кузьменко", "Захарченко", "Мороз", "Савченко", "Лисенко",
            "Руденко", "Марченко", "Кириленко"
        ];

        const studentIds = [];

        for (let i = 0; i < firstNames.length; i++) {

            const classId = classIds[i % classIds.length];
            const email = `student${i + 1}@school.com`;

            const userResult = await pool.query(
                `INSERT INTO users (first_name, last_name, email, password, role)
                 VALUES ($1, $2, $3, $4, 'student')
                 ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
                 RETURNING id`,
                [firstNames[i], lastNames[i], email, hash]
            );

            const userId = userResult.rows[0].id;

            const birthDate = `2009-0${(i % 9) + 1}-15`;

            const studentResult = await pool.query(
                `INSERT INTO students (user_id, class_id, birth_date, phone, address)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (user_id) DO UPDATE SET class_id = EXCLUDED.class_id
                 RETURNING id`,
                [userId, classId, birthDate, "+380 63 111 11 " + (10 + i), "м. Київ"]
            );

            studentIds.push({ id: studentResult.rows[0].id, classId });

        }

        console.log(`✅ Учні: ${studentIds.length}`);

        // ===== SCHEDULE =====
        let scheduleCount = 0;

        for (const classId of classIds) {

            for (let weekday = 1; weekday <= 5; weekday++) {

                for (let lesson = 1; lesson <= 4; lesson++) {

                    const subjectIndex = (weekday + lesson) % subjectIds.length;
                    const subjectId = subjectIds[subjectIndex];

                    const subjectRow = subjectNames[subjectIndex];
                    const teacherId = subjectRow[1];

                    await pool.query(
                        `INSERT INTO schedule (class_id, subject_id, teacher_id, weekday, lesson_number, room)
                         VALUES ($1, $2, $3, $4, $5, $6)`,
                        [classId, subjectId, teacherId, weekday, lesson, String(100 + lesson)]
                    );

                    scheduleCount++;

                }

            }

        }

        console.log(`✅ Уроки в розкладі: ${scheduleCount}`);

        // ===== GRADES (за останній місяць) =====
        let gradeCount = 0;

        for (const student of studentIds) {

            const gradesPerStudent = 5 + Math.floor(Math.random() * 5);

            for (let g = 0; g < gradesPerStudent; g++) {

                const subjectIndex = Math.floor(Math.random() * subjectIds.length);
                const subjectId = subjectIds[subjectIndex];
                const teacherId = subjectNames[subjectIndex][1];

                const grade = 4 + Math.floor(Math.random() * 9); // 4..12
                const daysAgo = Math.floor(Math.random() * 30);

                await pool.query(
                    `INSERT INTO grades (student_id, subject_id, teacher_id, grade, comment, created_at)
                     VALUES ($1, $2, $3, $4, $5, NOW() - ($6 || ' days')::INTERVAL)`,
                    [student.id, subjectId, teacherId, grade, "", daysAgo]
                );

                gradeCount++;

            }

        }

        console.log(`✅ Оцінки: ${gradeCount}`);

        // ===== ATTENDANCE (за останні 14 днів) =====
        let attendanceCount = 0;

        for (const student of studentIds) {

            for (let d = 0; d < 14; d++) {

                const rand = Math.random();
                const status = rand < 0.85 ? "present" : rand < 0.95 ? "late" : "absent";

                await pool.query(
                    `INSERT INTO attendance (student_id, lesson_date, status)
                     VALUES ($1, CURRENT_DATE - ($2 || ' days')::INTERVAL, $3)`,
                    [student.id, d, status]
                );

                attendanceCount++;

            }

        }

        console.log(`✅ Записи відвідуваності: ${attendanceCount}`);

        // ===== HOMEWORK =====
        const homeworkTitles = [
            "Розв'язати вправи 1-15",
            "Підготувати реферат",
            "Вивчити параграф напам'ять",
            "Лабораторна робота №3",
            "Контрольна робота (підготовка)",
            "Читати розділ 4"
        ];

        let homeworkCount = 0;

        for (const classId of classIds) {

            for (let h = 0; h < 4; h++) {

                const subjectIndex = Math.floor(Math.random() * subjectIds.length);
                const subjectId = subjectIds[subjectIndex];
                const teacherId = subjectNames[subjectIndex][1];

                const title = homeworkTitles[h % homeworkTitles.length];
                const daysAhead = 1 + Math.floor(Math.random() * 10);

                await pool.query(
                    `INSERT INTO homework (teacher_id, class_id, subject_id, title, description, deadline)
                     VALUES ($1, $2, $3, $4, $5, NOW() + ($6 || ' days')::INTERVAL)`,
                    [teacherId, classId, subjectId, title, "", daysAhead]
                );

                homeworkCount++;

            }

        }

        console.log(`✅ Домашні завдання: ${homeworkCount}`);

        console.log("\n🎉 Seed завершено успішно!");
        console.log("   Логін адміна: admin@school.com / " + PASSWORD);
        console.log("   Логін учня: student1@school.com / " + PASSWORD);
        console.log("   Логін вчителя: koval@school.com / " + PASSWORD);

        process.exit(0);

    } catch (error) {

        console.error("❌ Помилка при наповненні бази:", error);
        process.exit(1);

    }

}

seed();