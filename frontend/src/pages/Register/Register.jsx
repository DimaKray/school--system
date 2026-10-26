import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

import { registerRequest } from "../../services/authService";

import "../Login/Login.css";

function Register() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        role: "student"
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        const { first_name, last_name, email, password, role } = form;

        if (!first_name || !last_name || !email || !password || !role) {
            toast.error("Заповніть усі поля");
            return;
        }

        if (password.length < 6) {
            toast.error("Пароль має містити щонайменше 6 символів");
            return;
        }

        setLoading(true);

        try {

            const { data } = await registerRequest(form);

            if (data.success) {

                toast.success("Акаунт створено, тепер увійдіть");

                navigate("/login");

            } else {

                toast.error(data.message || "Помилка реєстрації");

            }

        } catch (error) {

            const message =
                error.response?.data?.message || "Не вдалося зареєструватись";

            toast.error(message);

        } finally {

            setLoading(false);

        }

    };

    return (
        <div className="login-page">

            <div className="login-card">

                <div className="login-left">

                    <h4>Реєстрація (Register)</h4>

                    <div className="logo">
                        EduJournal
                    </div>

                    <p>
                        Створіть акаунт, щоб почати
                        роботу з електронним журналом
                    </p>

                </div>

                <div className="login-right">

                    <h2>Створення акаунта</h2>

                    <p>
                        Заповніть форму нижче, щоб
                        зареєструватись у системі.
                    </p>

                    <form onSubmit={handleSubmit}>

                        <label>Ім'я</label>

                        <input
                            type="text"
                            name="first_name"
                            placeholder="Дмитро"
                            value={form.first_name}
                            onChange={handleChange}
                        />

                        <label>Прізвище</label>

                        <input
                            type="text"
                            name="last_name"
                            placeholder="Крайнов"
                            value={form.last_name}
                            onChange={handleChange}
                        />

                        <label>Email</label>

                        <input
                            type="email"
                            name="email"
                            placeholder="teacher@gmail.com"
                            value={form.email}
                            onChange={handleChange}
                        />

                        <label>Пароль</label>

                        <input
                            type="password"
                            name="password"
                            placeholder="********"
                            value={form.password}
                            onChange={handleChange}
                        />

                        <label>Роль</label>

                        <select
                            name="role"
                            value={form.role}
                            onChange={handleChange}
                        >
                            <option value="teacher">Вчитель</option>
                            <option value="student">Учень</option>
                            <option value="parent">Батьки</option>
                        </select>

                        <div className="login-options">

                            <Link to="/login">
                                Вже є акаунт? Увійти
                            </Link>

                        </div>

                        <button type="submit" disabled={loading}>
                            {loading ? "Реєстрація..." : "Зареєструватись"}
                        </button>

                    </form>

                </div>

            </div>

        </div>
    );
}

export default Register;
