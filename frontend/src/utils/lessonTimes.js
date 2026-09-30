export function getLessonTime(lessonNumber) {

    const startMinutesTotal = 8 * 60 + (lessonNumber - 1) * 90;
    const endMinutesTotal = startMinutesTotal + 80;

    const format = (totalMinutes) => {

        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        const hh = String(hours).padStart(2, "0");
        const mm = String(minutes).padStart(2, "0");

        return `${hh}:${mm}`;

    };

    return `${format(startMinutesTotal)} – ${format(endMinutesTotal)}`;

}