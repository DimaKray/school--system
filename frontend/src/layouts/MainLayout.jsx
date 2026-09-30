import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./MainLayout.css";

function MainLayout() {
    return (
        <div className="layout">

            <Sidebar />

            <div className="main">

                <div className="content">
                    <Outlet />
                </div>

            </div>

        </div>
    );
}

export default MainLayout;