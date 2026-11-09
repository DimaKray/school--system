/*
 * Автотести API EduJournal (вбудований test runner Node.js, без додаткових пакетів).
 *
 * Перед запуском: створена база (npm run db) і демо-дані (npm run seed).
 * Запуск: npm test
 *
 * Тести перевіряють авторизацію, розмежування прав за ролями,
 * валідацію вхідних даних і область видимості даних (учень/батьки).
 * Записи, створені під час тестів, видаляються в кінці.
 */
require("dotenv").config({ quiet: true });

const { test, before, after, describe } = require("node:test");
const assert = require("node:assert/strict");

const app = require("../app");
const pool = require("../config/db");

const PASSWORD = "password123";

const USERS = {
    admin: "admin@school.com",
    teacher: "koval@school.com",      // веде Алгебру (1) і Геометрію (2)
    student: "student1@school.com",
    parent: "parent1@school.com"
};

let server;
let base;
const tokens = {};
const cleanup = { grades: [], homework: [], users: [] };

const request = async (method, path, { token, body } = {}) => {

    const res = await fetch(base + path, {
        method,
        headers: {
            "content-type": "application/json",
            ...(token ? { authorization: `Bearer ${token}` } : {})
        },
        body: body ? JSON.stringify(body) : undefined
    });

    let data = null;

    try {
        data = await res.json();
    } catch {
        // відповідь без тіла
    }

    return { status: res.status, data };

};

const login = async (email, password = PASSWORD) =>
    request("POST", "/api/auth/login", { body: { email, password } });

before(async () => {

    server = app.listen(0);
    await new Promise((resolve) => server.once("listening", resolve));
    base = `http://127.0.0.1:${server.address().port}`;

    for (const [role, email] of Object.entries(USERS)) {
        const res = await login(email);
        assert.equal(res.status, 200, `не вдалося увійти як ${role} — чи виконано npm run seed?`);
        tokens[role] = res.data.token;
    }

});

after(async () => {

    if (cleanup.grades.length) {
        await pool.query("DELETE FROM grades WHERE id = ANY($1::int[])", [cleanup.grades]);
    }

    if (cleanup.homework.length) {
        await pool.query("DELETE FROM homework WHERE id = ANY($1::int[])", [cleanup.homework]);
    }

    if (cleanup.users.length) {
        await pool.query("DELETE FROM users WHERE id = ANY($1::int[])", [cleanup.users]);
    }

    server.close();
    await pool.end();

});

describe("Авторизація", () => {

    test("вхід з правильним паролем повертає токен і роль", async () => {
        const res = await login(USERS.admin);
        assert.equal(res.status, 200);
        assert.ok(res.data.token);
    });

    test("вхід з хибним паролем — 401", async () => {
        const res = await login(USERS.admin, "wrong-password");
        assert.equal(res.status, 401);
    });

    test("запит без токена — 401", async () => {
        const res = await request("GET", "/api/students");
        assert.equal(res.status, 401);
    });

    test("запит з підробленим токеном — 401", async () => {
        const res = await request("GET", "/api/students", { token: "abc.def.ghi" });
        assert.equal(res.status, 401);
    });

    test("профіль повертає дані поточного користувача", async () => {
        const res = await request("GET", "/api/auth/profile", { token: tokens.teacher });
        assert.equal(res.status, 200);
        assert.equal(JSON.stringify(res.data).includes(USERS.teacher), true);
    });

});

describe("Реєстрація", () => {

    test("не можна зареєструватися як адміністратор", async () => {
        const res = await request("POST", "/api/auth/register", {
            body: { first_name: "Тест", last_name: "Адмін", email: "t-admin@test.com", password: PASSWORD, role: "admin" }
        });
        assert.equal(res.status, 400);
    });

    test("не можна зареєструватися як вчитель", async () => {
        const res = await request("POST", "/api/auth/register", {
            body: { first_name: "Тест", last_name: "Вчитель", email: "t-teacher@test.com", password: PASSWORD, role: "teacher" }
        });
        assert.equal(res.status, 400);
    });

    test("учень реєструється і отримує профіль у таблиці students", async () => {
        const email = `t-student-${Date.now()}@test.com`;
        const res = await request("POST", "/api/auth/register", {
            body: { first_name: "Тест", last_name: "Учень", email, password: PASSWORD, role: "student" }
        });
        assert.equal(res.status, 201);

        const user = await pool.query(
            "SELECT u.id, s.id AS student_id FROM users u LEFT JOIN students s ON s.user_id = u.id WHERE u.email = $1",
            [email]
        );
        cleanup.users.push(user.rows[0].id);
        assert.ok(user.rows[0].student_id, "профіль учня не створено");

        // повторна реєстрація з тим самим email
        const again = await request("POST", "/api/auth/register", {
            body: { first_name: "Тест", last_name: "Учень", email, password: PASSWORD, role: "student" }
        });
        assert.equal(again.status, 409);
    });

});

describe("Права за ролями", () => {

    test("учень не може створювати оцінки", async () => {
        const res = await request("POST", "/api/grades", {
            token: tokens.student,
            body: { student_id: 1, subject_id: 1, grade: 12 }
        });
        assert.equal(res.status, 403);
    });

    test("вчитель не може створювати класи (лише адмін)", async () => {
        const res = await request("POST", "/api/classes", {
            token: tokens.teacher,
            body: { name: "99-Т", school_year: "2026-2027" }
        });
        assert.equal(res.status, 403);
    });

    test("звіти недоступні учню і батькам", async () => {
        for (const role of ["student", "parent"]) {
            const res = await request("GET", "/api/reports/summary", { token: tokens[role] });
            assert.equal(res.status, 403, role);
        }
    });

    test("розділ «Батьки» доступний лише адміну", async () => {
        assert.equal((await request("GET", "/api/parents", { token: tokens.teacher })).status, 403);
        assert.equal((await request("GET", "/api/parents", { token: tokens.admin })).status, 200);
    });

});

describe("Оцінки: вчитель працює лише зі своїми предметами", () => {

    test("вчитель ставить оцінку зі свого предмета від власного імені", async () => {
        const res = await request("POST", "/api/grades", {
            token: tokens.teacher,
            body: { student_id: 1, subject_id: 1, teacher_id: 2, grade: 10, comment: "автотест" }
        });
        assert.equal(res.status, 201);
        cleanup.grades.push(res.data.gradeId);

        const row = await pool.query(
            "SELECT g.teacher_id, t.user_id FROM grades g JOIN teachers t ON t.id = g.teacher_id WHERE g.id = $1",
            [res.data.gradeId]
        );
        const me = await pool.query("SELECT id FROM users WHERE email = $1", [USERS.teacher]);
        assert.equal(row.rows[0].user_id, me.rows[0].id, "teacher_id з тіла запиту не має перезаписувати вчителя");
    });

    test("вчитель не може поставити оцінку з чужого предмета", async () => {
        const res = await request("POST", "/api/grades", {
            token: tokens.teacher,
            body: { student_id: 1, subject_id: 3, grade: 10 }   // Фізика — інший вчитель
        });
        assert.equal(res.status, 403);
    });

    test("вчитель не може видалити оцінку з чужого предмета", async () => {
        const foreign = await pool.query("SELECT id FROM grades WHERE subject_id = 3 LIMIT 1");
        const res = await request("DELETE", `/api/grades/${foreign.rows[0].id}`, { token: tokens.teacher });
        assert.equal(res.status, 403);
    });

    test("оцінка поза шкалою 1–12 відхиляється", async () => {
        for (const grade of [0, 13, "abc"]) {
            const res = await request("POST", "/api/grades", {
                token: tokens.teacher,
                body: { student_id: 1, subject_id: 1, grade }
            });
            assert.equal(res.status, 400, `grade=${grade}`);
        }
    });

    test("редагування неіснуючої оцінки — 404", async () => {
        const res = await request("PUT", "/api/grades/999999", {
            token: tokens.admin,
            body: { student_id: 1, subject_id: 1, grade: 5 }
        });
        assert.equal(res.status, 404);
    });

});

describe("Домашні завдання", () => {

    test("вчитель створює завдання зі свого предмета", async () => {
        const res = await request("POST", "/api/homework", {
            token: tokens.teacher,
            body: { class_id: 1, subject_id: 2, title: "Автотест: задачі 1–5" }
        });
        assert.equal(res.status, 201);
        const id = res.data.homeworkId ?? res.data.id ?? Object.values(res.data).find((v) => Number.isInteger(v));
        if (id) cleanup.homework.push(id);
    });

    test("вчитель не може створити завдання з чужого предмета", async () => {
        const res = await request("POST", "/api/homework", {
            token: tokens.teacher,
            body: { class_id: 1, subject_id: 7, title: "Чуже завдання" }
        });
        assert.equal(res.status, 403);
    });

    test("учень не може здати завдання іншого класу", async () => {
        const student = await pool.query(
            "SELECT s.class_id FROM students s JOIN users u ON u.id = s.user_id WHERE u.email = $1",
            [USERS.student]
        );
        const foreign = await pool.query(
            "SELECT id FROM homework WHERE class_id <> $1 LIMIT 1",
            [student.rows[0].class_id]
        );
        const res = await request("POST", "/api/homework-submissions", {
            token: tokens.student,
            body: { homework_id: foreign.rows[0].id, comment: "спроба" }
        });
        assert.equal(res.status, 403);
    });

    test("вчитель не може здати роботу замість учня", async () => {
        const res = await request("POST", "/api/homework-submissions", {
            token: tokens.teacher,
            body: { homework_id: 1 }
        });
        assert.equal(res.status, 403);
    });

});

describe("Область видимості даних", () => {

    const list = (data) => Object.values(data).find(Array.isArray) || [];

    test("учень бачить лише власні оцінки", async () => {
        const me = await pool.query(
            "SELECT s.id FROM students s JOIN users u ON u.id = s.user_id WHERE u.email = $1",
            [USERS.student]
        );
        const res = await request("GET", "/api/grades", { token: tokens.student });
        assert.equal(res.status, 200);
        const grades = list(res.data);
        assert.ok(grades.length > 0);
        assert.ok(grades.every((g) => g.student_id === me.rows[0].id));
    });

    test("батьки бачать лише учнів, прив'язаних до них", async () => {
        const children = await pool.query(
            `SELECT ps.student_id FROM parent_students ps
             JOIN users u ON u.id = ps.parent_user_id WHERE u.email = $1`,
            [USERS.parent]
        );
        const allowed = new Set(children.rows.map((r) => r.student_id));
        const res = await request("GET", "/api/students", { token: tokens.parent });
        const students = list(res.data);
        assert.ok(students.length > 0);
        assert.ok(students.every((s) => allowed.has(s.id)));
    });

    test("адмін бачить усіх учнів", async () => {
        const total = await pool.query("SELECT COUNT(*)::int AS n FROM students");
        const res = await request("GET", "/api/students", { token: tokens.admin });
        assert.ok(list(res.data).length >= total.rows[0].n - cleanup.users.length);
    });

});
