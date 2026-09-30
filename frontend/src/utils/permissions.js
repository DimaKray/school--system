// Ці правила точно відповідають roleMiddleware на бекенді —
// якщо тут дозволено показати кнопку, бекенд теж дозволить дію.

export const canManageStructure = (user) =>
    user?.role === "admin";
// Учні, Вчителі, Класи, Предмети, Розклад — керує лише адмін

export const canManageAcademics = (user) =>
    user?.role === "admin" || user?.role === "teacher";
// Оцінки, Домашні завдання, Відвідуваність — адмін і вчитель

export const isAdminOrTeacher = (user) =>
    user?.role === "admin" || user?.role === "teacher";