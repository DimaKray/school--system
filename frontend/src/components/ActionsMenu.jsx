import { useEffect, useRef, useState } from "react";
import { FaEllipsisH, FaEdit, FaTrash } from "react-icons/fa";

import "./ActionsMenu.css";

function ActionsMenu({ onEdit, onDelete }) {

    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {

        const handleClickOutside = (e) => {

            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }

        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };

    }, []);

    return (
        <div className="am-wrap" ref={ref}>

            <button
                type="button"
                className="am-trigger"
                onClick={() => setOpen((v) => !v)}
            >
                <FaEllipsisH />
            </button>

            {open && (
                <div className="am-menu">

                    <button
                        type="button"
                        className="am-item"
                        onClick={() => {
                            setOpen(false);
                            onEdit();
                        }}
                    >
                        <FaEdit /> Редагувати
                    </button>

                    <button
                        type="button"
                        className="am-item danger"
                        onClick={() => {
                            setOpen(false);
                            onDelete();
                        }}
                    >
                        <FaTrash /> Видалити
                    </button>

                </div>
            )}

        </div>
    );

}

export default ActionsMenu;