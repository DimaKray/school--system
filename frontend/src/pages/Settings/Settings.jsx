import { useContext } from "react";

import { AuthContext } from "../../context/AuthContext";
import "../../styles/DataPage.css";
import "./Settings.css";

const roleLabels = {
    admin: "Адміністратор",
    teacher: "Вчитель",
    student: "Учень",
    parent: "Батьки"
};

function Settings() {

    const { user, logout } = useContext(AuthContext);

    return (
        <div className="dp-page">

            <div className="dp-header">
                <div>
                    <h1>Налаштування</h1>
                    <div className="dp-header-sub">
                        Дані вашого акаунта
                    </div>
                </div>
            </div>

            <div className="dp-card settings-card">

                <div className="settings-avatar">
                    {user?.first_name ? user.first_name.charAt(0).toUpperCase() : "?"}
                </div>

                <div className="settings-info">

                    <div className="settings-row">
                        <span className="settings-label">Ім'я</span>
                        <span>{user?.first_name || "—"}</span>
                    </div>

                    <div className="settings-row">
                        <span className="settings-label">Прізвище</span>
                        <span>{user?.last_name || "—"}</span>
                    </div>

                    <div className="settings-row">
                        <span className="settings-label">Email</span>
                        <span>{user?.email || "—"}</span>
                    </div>

                    <div className="settings-row">
                        <span className="settings-label">Роль</span>
                        <span className="dp-badge">
                            {user?.role ? roleLabels[user.role] || user.role : "—"}
                        </span>
                    </div>

                </div>

            </div>

            <button
                className="dp-btn dp-btn-danger"
                style={{ marginTop: 20 }}
                onClick={logout}
            >
                Вийти з акаунта
            </button>

        </div>
    );
}

export default Settings;
