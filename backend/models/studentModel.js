const pool = require("../config/db");
const bcrypt = require("bcrypt");

const getAllStudents = async () => {
  const result = await pool.query(`
        SELECT
            students.id,
            users.first_name,
            users.last_name,
            users.email,
            users.photo_url,
            students.class_id,
            students.birth_date,
            students.phone,
            students.address,
            classes.name AS class_name
        FROM students
        JOIN users ON students.user_id = users.id
        LEFT JOIN classes ON students.class_id = classes.id
        ORDER BY users.last_name
    `);

  return result.rows;
};

const createStudent = async (
  first_name,
  last_name,
  email,
  password,
  role,
  class_id,
  birth_date,
  phone,
  address,
  photo_url,
) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const hashedPassword = await bcrypt.hash(password, 10);

    const userResult = await client.query(
      `INSERT INTO users
    (first_name, last_name, email, password, role, photo_url)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id`,
      [first_name, last_name, email, hashedPassword, role, photo_url || null],
    );
    const userId = userResult.rows[0].id;

    const studentResult = await client.query(
      `INSERT INTO students (user_id, class_id, birth_date, phone, address)
             VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [userId, class_id, birth_date, phone, address],
    );

    await client.query("COMMIT");
    return studentResult.rows[0].id;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const updateStudent = async (
  id,
  first_name,
  last_name,
  email,
  class_id,
  birth_date,
  phone,
  address,
  photo_url,
) => {
  await pool.query(
    `
    UPDATE users
    SET
        first_name = $1,
        last_name = $2,
        email = $3,
        photo_url = COALESCE($4, photo_url)
    WHERE id = (
        SELECT user_id
        FROM students
        WHERE id = $5
    )
    `,
    [first_name, last_name, email, photo_url || null, id],
  );

  await pool.query(
    `
        UPDATE students
        SET
            class_id = $1,
            birth_date = $2,
            phone = $3,
            address = $4
        WHERE id = $5
        `,
    [class_id, birth_date, phone, address, id],
  );

  return true;
};

const deleteStudent = async (id) => {
  const result = await pool.query(
    "SELECT user_id FROM students WHERE id = $1",
    [id],
  );

  if (result.rows.length === 0) {
    return false;
  }

  const userId = result.rows[0].user_id;

  await pool.query("DELETE FROM students WHERE id = $1", [id]);

  await pool.query("DELETE FROM users WHERE id = $1", [userId]);

  return true;
};

module.exports = {
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
};
