const KEY = 'pulse.localTestSession.v1';

export type LocalTestUser = {
  name: string;
  email: string;
};

export function isLocalTestSession(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function setLocalTestSession(enabled: boolean): void {
  try {
    if (enabled) localStorage.setItem(KEY, '1');
    else localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

export function getLocalTestUser(): LocalTestUser {
  return { name: 'Pulse Demo', email: 'demo@pulse.local' };
}
