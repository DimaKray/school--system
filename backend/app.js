const authRoutes = require("./routes/authRoutes");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const studentRoutes = require("./routes/studentRoutes");
const classRoutes = require("./routes/classRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const gradeRoutes = require("./routes/gradeRoutes");
const homeworkRoutes = require("./routes/homeworkRoutes");
const homeworkSubmissionRoutes = require("./routes/homeworkSubmissionRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const path = require("path");
const uploadRoutes = require("./routes/uploadRoutes");

dotenv.config();

const app = express();
const pool = require("./config/db");

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use(cookieParser());
app.use("/api/students", studentRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/homework", homeworkRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use(
    "/api/homework-submissions",
    homeworkSubmissionRoutes
);

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "School System API працює 🚀"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

pool.connect()
    .then(() => {
        console.log("✅ PostgreSQL connected");
    })
    .catch((error) => {
        console.error("❌ PostgreSQL connection error");
        console.error(error.message);
    });