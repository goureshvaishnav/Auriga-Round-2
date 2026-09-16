const STORAGE_KEY = 'giftPool';

export const loadPool = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Unable to load stored pool:', error);
    return null;
  }
};

export const savePool = (pool) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pool));
    return true;
  } catch (error) {
    console.warn('Unable to save pool:', error);
    return false;
  }
};

export const clearPool = () => {
  localStorage.removeItem(STORAGE_KEY);
};
