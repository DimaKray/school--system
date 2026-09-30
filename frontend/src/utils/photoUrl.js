const SERVER_ORIGIN = "http://localhost:5000";

export function getPhotoUrl(photoUrl) {

    if (!photoUrl) {
        return null;
    }

    if (photoUrl.startsWith("http")) {
        return photoUrl;
    }

    return `${SERVER_ORIGIN}${photoUrl}`;

}