const palette = [
    { bg: "#E8E1FB", text: "#6C3FC5" },
    { bg: "#DFF5E6", text: "#1E8449" },
    { bg: "#DCEBFB", text: "#1B5FA8" },
    { bg: "#FCF3D0", text: "#9A7B0A" },
    { bg: "#FDE4D0", text: "#C1591A" },
    { bg: "#FBD9E6", text: "#B02A5B" },
    { bg: "#D9F5F1", text: "#0E7C6B" },
    { bg: "#EAE6D9", text: "#7A6A3A" }
];

export function getClassColor(classId) {

    if (!classId) {
        return palette[0];
    }

    const index = Number(classId) % palette.length;

    return palette[index];

}