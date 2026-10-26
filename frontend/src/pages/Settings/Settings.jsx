import { useContext, useEffect, useState } from "react";
import dayjs from "dayjs";

import { AuthContext } from "../../context/AuthContext";
import { profileRequest } from "../../services/authService";
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

    // Особистий кабінет: актуальні дані з сервера (клас учня, предмети вчителя, діти батьків)
    const [details, setDetails] = useState(null);

    useEffect(() => {
        profileRequest()
            .then((res) => setDetails(res.data.details))
            .catch(() => setDetails(null));
    }, []);

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

                    {user?.role === "student" && details && (
                        <>
                            <div className="settings-row">
                                <span className="settings-label">Клас</span>
                                <span>{details.class_name || "—"}</span>
                            </div>
                            <div className="settings-row">
                                <span className="settings-label">Дата народження</span>
                                <span>{details.birth_date ? dayjs(details.birth_date).format("DD.MM.YYYY") : "—"}</span>
                            </div>
                        </>
                    )}

                    {user?.role === "teacher" && details && (
                        <div className="settings-row">
                            <span className="settings-label">Предмети</span>
                            <span>{details.subjects?.length ? details.subjects.join(", ") : "—"}</span>
                        </div>
                    )}

                    {user?.role === "parent" && details && (
                        <div className="settings-row">
                            <span className="settings-label">Діти</span>
                            <span>
                                {details.children?.length
                                    ? details.children
                                        .map((c) => `${c.first_name} ${c.last_name}${c.class_name ? ` (${c.class_name})` : ""}`)
                                        .join(", ")
                                    : "Ще не прив'язано — зверніться до адміністратора"}
                            </span>
                        </div>
                    )}

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
