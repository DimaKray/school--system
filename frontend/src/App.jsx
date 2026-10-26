import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import Students from "./pages/Students/Students";
import Teachers from "./pages/Teachers/Teachers";
import Classes from "./pages/Classes/Classes";
import Subjects from "./pages/Subjects/Subjects";
import Schedule from "./pages/Schedule/Schedule";
import Journal from "./pages/Journal/Journal";
import Analytics from "./pages/Analytics/Analytics";
import Homework from "./pages/Homework/Homework";
import Settings from "./pages/Settings/Settings";
import Reports from "./pages/Reports/Reports";
import Parents from "./pages/Parents/Parents";

import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <BrowserRouter>

            <ToastContainer position="top-right" autoClose={3000} />

            <Routes>

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route
                    element={
                        <ProtectedRoute>
                            <MainLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/students" element={<Students />} />
                    <Route path="/teachers" element={<Teachers />} />
                    <Route path="/classes" element={<Classes />} />
                    <Route path="/subjects" element={<Subjects />} />
                    <Route path="/schedule" element={<Schedule />} />
                    <Route path="/journal" element={<Journal />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/homework" element={<Homework />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/parents" element={<Parents />} />
                    <Route path="/settings" element={<Settings />} />
                </Route>

            </Routes>

        </BrowserRouter>
    );
}

export default App;
