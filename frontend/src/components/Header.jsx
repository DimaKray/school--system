import "./Header.css";

function Header() {
    return (
        <header className="header">
            <input type="text" placeholder="Search..." />

            <div className="profile">
                <span>Admin</span>
                <div className="avatar">A</div>
            </div>
        </header>
    );
}

export default Header;