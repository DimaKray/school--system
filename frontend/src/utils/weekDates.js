import dayjs from "dayjs";

const dayNames = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

const monthNames = [
    "січня", "лютого", "березня", "квітня", "травня", "червня",
    "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"
];

function formatUkrainianDate(date) {
    return `${date.date()} ${monthNames[date.month()]}`;
}

function formatUkrainianDateWithYear(date) {
    return `${date.date()} ${monthNames[date.month()]}, ${date.year()}`;
}

export function getCurrentWeekDays() {

    const today = dayjs();
    const dayOfWeek = today.day() === 0 ? 7 : today.day();
    const monday = today.subtract(dayOfWeek - 1, "day");

    return [1, 2, 3, 4, 5].map((offset) => {

        const date = monday.add(offset - 1, "day");

        return {
            weekday: offset,
            label: dayNames[offset - 1],
            dateLabel: formatUkrainianDate(date),
            fullDate: date
        };

    });

}

export function getWeekRangeLabel(days) {

    if (days.length === 0) {
        return "";
    }

    const start = days[0].fullDate;
    const end = days[days.length - 1].fullDate;

    return `${start.date()} - ${formatUkrainianDateWithYear(end)}`;

}