import {
    FaCalculator, FaFlask, FaGlobeAmericas, FaBook,
    FaLanguage, FaLandmark, FaPencilRuler, FaMusic,
    FaPalette, FaRunning, FaLaptopCode
} from "react-icons/fa";

export const SUBJECT_ICONS = [
    FaCalculator, FaFlask, FaGlobeAmericas, FaBook,
    FaLanguage, FaLandmark, FaPencilRuler, FaMusic,
    FaPalette, FaRunning, FaLaptopCode
];

export const SUBJECT_COLORS = [
    { bg: "#EFECFE", text: "#7367F0" },
    { bg: "#FCEAF1", text: "#E0568C" },
    { bg: "#E4F7EE", text: "#2FB380" },
    { bg: "#E7F2FC", text: "#3B8FE0" },
    { bg: "#FCF3D0", text: "#9A7B0A" },
    { bg: "#FDE4D0", text: "#C1591A" }
];

export function getSubjectStyle(id) {

    const index = Number(id) % SUBJECT_COLORS.length;
    const Icon = SUBJECT_ICONS[Number(id) % SUBJECT_ICONS.length];

    return { ...SUBJECT_COLORS[index], Icon };

}