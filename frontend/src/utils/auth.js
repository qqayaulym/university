export const getToken = () => localStorage.getItem("token");

export const parseJwt = (token) => {
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (_err) {
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
  return roles.includes(user.role);
};
