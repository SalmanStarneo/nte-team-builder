// Official element and role icons in public/icons/ (see NOTICE.md).
const BASE = import.meta.env.BASE_URL;

export const elementIconUrl = (elementId) => `${BASE}icons/elements/${elementId}.webp`;
export const roleIconUrl = (role) => `${BASE}icons/roles/${role.toLowerCase()}.webp`;
