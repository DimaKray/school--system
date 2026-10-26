const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const path = require("path");

dotenv.config();

const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const classRoutes = require("./routes/classRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const gradeRoutes = require("./routes/gradeRoutes");
const homeworkRoutes = require("./routes/homeworkRoutes");
const homeworkSubmissionRoutes = require("./routes/homeworkSubmissionRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const reportRoutes = require("./routes/reportRoutes");
const parentRoutes = require("./routes/parentRoutes");

if (!process.env.JWT_SECRET) {
    console.error("❌ JWT_SECRET не задано у файлі .env");
    process.exit(1);
}

const app = express();
const pool = require("./config/db");

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/homework", homeworkRoutes);
app.use("/api/homework-submissions", homeworkSubmissionRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/parents", parentRoutes);

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "School System API працює 🚀"
    });
});

// Невідомий маршрут API
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Маршрут не знайдено" });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {

    app.listen(PORT, () => {
        console.log(`Server started on port ${PORT}`);
    });

    pool.connect()
        .then((client) => {
            client.release();
            console.log("✅ PostgreSQL connected");
        })
        .catch((error) => {
            console.error("❌ PostgreSQL connection error");
            console.error(error.message);
        });

}

module.exports = app;
