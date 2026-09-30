import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

import { loginRequest } from "../../services/authService";
import { AuthContext } from "../../context/AuthContext";

import "./Login.css";

function Login() {

    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const [form, setForm] = useState({
        email: "",
        password: ""
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

        if (!form.email || !form.password) {
            toast.error("Заповніть email та пароль");
            return;
        }

        setLoading(true);

        try {

            const { data } = await loginRequest(form);

            if (data.success) {

                login(data.token, data.user);

                toast.success("Вхід виконано успішно");

                navigate("/");

            } else {

                toast.error(data.message || "Помилка входу");

            }

        } catch (error) {

            const message =
                error.response?.data?.message || "Невірний email або пароль";

            toast.error(message);

        } finally {

            setLoading(false);

        }

    };

    return (
        <div className="login-page">

            <div className="login-card">

                <div className="login-left">

                    <h4>Вхід (Login)</h4>

                    <div className="logo">
                        EduJournal
                    </div>

                    <p>
                        Сучасна платформа для навчальних закладів
                    </p>

                </div>

                <div className="login-right">

                    <h2>Вхід у систему</h2>

                    <p>
                        Ласкаво просимо! Будь ласка,
                        увійдіть у свій акаунт.
                    </p>

                    <form onSubmit={handleSubmit}>

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

                        <div className="login-options">

                            <label>

                                <input type="checkbox" />

                                Запам'ятати мене

                            </label>

                            <Link to="/register">
                                Немає акаунта?
                            </Link>

                        </div>

                        <button type="submit" disabled={loading}>
                            {loading ? "Вхід..." : "Увійти"}
                        </button>

                    </form>

                </div>

            </div>

        </div>
    );
}

export default Login;
