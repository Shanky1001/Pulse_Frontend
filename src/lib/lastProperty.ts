const KEY = 'formbuilder.lastProperty.v1';

export function getLastPropertyId(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setLastPropertyId(id: string): void {
  try {
    localStorage.setItem(KEY, id);
  } catch {
    // ignore quota
  }
}
