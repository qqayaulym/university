export const getToken = () => localStorage.getItem("token");

const decodeBase64Url = (str) => {
  if (!str) return null;
  let b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4;
  if (pad === 2) b64 += "==";
  else if (pad === 3) b64 += "=";
  else if (pad !== 0) return null;

  try {
    return atob(b64);
  } catch {
    return null;
  }
};

export const parseJwt = (token) => {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const payload = decodeBase64Url(parts[1]);
  if (!payload) return null;

  try {
    return JSON.parse(payload);
  } catch {
    return null;
  }
};

export const getCurrentUserFromToken = () => parseJwt(getToken());

export const isTokenExpired = () => {
  const user = getCurrentUserFromToken();
  if (!user || !user.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return user.exp <= now;
};

export const clearAuth = () => {
  localStorage.removeItem("token");
};

export const hasRole = (roles) => {
  const user = getCurrentUserFromToken();
  if (!user || !user.role) return false;
  const userRole = String(user.role).toLowerCase();
  return roles.some((r) => String(r).toLowerCase() === userRole);
};