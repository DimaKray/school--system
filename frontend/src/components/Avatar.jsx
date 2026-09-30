import { getPhotoUrl } from "../utils/photoUrl";
import "./Avatar.css";

function Avatar({ photoUrl, firstName, lastName, size = 34 }) {

    const url = getPhotoUrl(photoUrl);

    const initials =
        (firstName?.charAt(0) || "") + (lastName?.charAt(0) || "");

    if (url) {

        return (
            <img
                src={url}
                alt={`${firstName} ${lastName}`}
                className="avatar-img"
                style={{ width: size, height: size }}
            />
        );

    }

    return (
        <div
            className="avatar-fallback"
            style={{
                width: size,
                height: size,
                fontSize: size * 0.38
            }}
        >
            {initials || "?"}
        </div>
    );

}

export default Avatar;