const AUTH_NOTICE_KEY = 'skill-link-auth-notice';

export type AuthNotice = {
  type: 'suspended';
  message: string;
};

export function setAuthNotice(notice: AuthNotice) {
  sessionStorage.setItem(AUTH_NOTICE_KEY, JSON.stringify(notice));
}

export function getAuthNotice(): AuthNotice | null {
  const raw = sessionStorage.getItem(AUTH_NOTICE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthNotice;
  } catch {
    return null;
  }
}

export function consumeAuthNotice(): AuthNotice | null {
  const notice = getAuthNotice();
  if (notice) {
    sessionStorage.removeItem(AUTH_NOTICE_KEY);
  }
  return notice;
}

export function clearAuthNotice() {
  sessionStorage.removeItem(AUTH_NOTICE_KEY);
}
