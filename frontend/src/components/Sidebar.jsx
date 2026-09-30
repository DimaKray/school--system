import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { canManageStructure } from "../utils/permissions";

import "./Sidebar.css";
import {
  FaHome,
  FaCalendarCheck,
  FaCalendarAlt,
  FaTasks,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaSchool,
  FaBook,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaGraduationCap,
} from "react-icons/fa";

import plant from "../assets/slidebar_person.png";
import { AuthContext } from "../context/AuthContext";

const menu = [
  { title: "Головна", icon: <FaHome />, path: "/", roles: ["admin", "teacher", "student", "parent"] },
  { title: "Журнал", icon: <FaCalendarCheck />, path: "/journal", roles: ["admin", "teacher", "student", "parent"] },
  { title: "Розклад", icon: <FaCalendarAlt />, path: "/schedule", roles: ["admin", "teacher", "student", "parent"] },
  { title: "Домашні завдання", icon: <FaTasks />, path: "/homework", roles: ["admin", "teacher", "student", "parent"] },
  { title: "Учні", icon: <FaUserGraduate />, path: "/students", roles: ["admin", "teacher"] },
  { title: "Вчителі", icon: <FaChalkboardTeacher />, path: "/teachers", roles: ["admin"] },
  { title: "Класи", icon: <FaSchool />, path: "/classes", roles: ["admin"] },
  { title: "Предмети", icon: <FaBook />, path: "/subjects", roles: ["admin", "teacher"] },
  { title: "Аналітика", icon: <FaChartBar />, path: "/analytics", roles: ["admin", "teacher"] },
  { title: "Налаштування", icon: <FaCog />, path: "/settings", roles: ["admin", "teacher", "student", "parent"] },
];

export default function Sidebar() {

  const { user, logout } = useContext(AuthContext);
  const visibleMenu = menu.filter((item) => item.roles.includes(user?.role));
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.first_name
    ? user.first_name.charAt(0).toUpperCase()
    : "?";

  const roleLabels = {
    admin: "Адміністратор",
    teacher: "Вчитель",
    student: "Учень",
    parent: "Батьки",
  };

  return (
    <aside className="sidebar">

      <img
        src={plant}
        alt=""
        className="sidebar__illustration"
      />

      <div className="sidebar__top">
        <div className="sidebar__logo-icon">
          <FaGraduationCap />
        </div>
        <span className="sidebar__logo-text">
          EduJournal
        </span>
      </div>

      <nav className="sidebar__menu">
        {visibleMenu.map((item) => (
          <NavLink
            key={item.title}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              `sidebar__item ${isActive ? "active" : ""}`
            }
          >
            <span className="sidebar__icon">
              {item.icon}
            </span>

            <span className="sidebar__text">
              {item.title}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__bottom">

        <div className="sidebar__profile">

          <div className="sidebar__avatar">
            {initials}
          </div>

          <div className="sidebar__profile-info">

            <div className="sidebar__name">
              {user
                ? `${user.first_name} ${user.last_name}`
                : "Гість"}
            </div>

            <div className="sidebar__role">
              {user ? roleLabels[user.role] || user.role : ""}
            </div>

          </div>

          <button
            type="button"
            className="sidebar__logout"
            onClick={handleLogout}
            title="Вийти"
          >
            <FaSignOutAlt />
          </button>

        </div>

      </div>

    </aside>
  );
}