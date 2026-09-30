export function getGradeColor(grade) {

    if (grade === null || grade === undefined) {
        return { bg: "#F2F2F5", text: "#B5B5BD" };
    }

    if (grade >= 10) {
        return { bg: "#DFF5E6", text: "#1E8449" };
    }

    if (grade >= 8) {
        return { bg: "#FCF3D0", text: "#9A7B0A" };
    }

    return { bg: "#FBD9E6", text: "#B02A5B" };

}

export function getAttendanceColor(percent) {

    return percent >= 80 ? "#2fb380" : "#e34848";

}