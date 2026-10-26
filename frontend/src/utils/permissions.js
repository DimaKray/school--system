// Ці правила відповідають roleMiddleware на бекенді:
// якщо тут дозволено показати кнопку, бекенд теж дозволить дію.
// Приховування кнопок — лише зручність; захист даних забезпечує сервер.

export const canManageStructure = (user) =>
    user?.role === "admin";
// Учні, Вчителі, Класи, Предмети, Розклад, Батьки — керує лише адмін

export const canManageAcademics = (user) =>
    user?.role === "admin" || user?.role === "teacher";
// Оцінки, Домашні завдання, Відвідуваність, Звіти — адмін і вчитель

export const isAdminOrTeacher = (user) =>
    user?.role === "admin" || user?.role === "teacher";

export const isStudent = (user) => user?.role === "student";
