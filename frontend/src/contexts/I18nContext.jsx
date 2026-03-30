import React, { createContext, useContext, useMemo, useState } from "react";

const I18nContext = createContext(null);

const LANG_KEY = "lang";

const DICT = {
  kk: {
    nav_home: "Басты бет",
    nav_profile: "Менің парақшам",
    nav_courses: "Іс-шаралар",
    nav_notifications: "Хабарландырулар",
    nav_settings: "Баптаулар",
    nav_creator_manage: "Курс басқару",
    nav_admin_panel: "Әкімші панелі",

    settings_title: "Баптаулар",
    settings_language: "Тіл",
    settings_theme: "Тақырып",
    settings_theme_light: "Жарық",
    settings_theme_dark: "Қараңғы",

    notifications_title: "Хабарландырулар",
    notifications_empty: "Хабарландыру жоқ",
    notifications_mark_read: "Оқылды",
    notifications_state: "Күйі",
    notifications_state_new: "жаңа",
    notifications_state_read: "оқылды",

    auth_login_title: "Кіру",
    auth_login_button: "Кіру",
    auth_password_placeholder: "Құпиясөз",
    auth_signup_title: "Тіркелу",
  },
  ru: {
    nav_home: "Главная",
    nav_profile: "Мой профиль",
    nav_courses: "Курсы",
    nav_notifications: "Уведомления",
    nav_settings: "Настройки",
    nav_creator_manage: "Управление курсами",
    nav_admin_panel: "Админ-панель",

    settings_title: "Настройки",
    settings_language: "Язык",
    settings_theme: "Тема",
    settings_theme_light: "Светлая",
    settings_theme_dark: "Тёмная",

    notifications_title: "Уведомления",
    notifications_empty: "Нет уведомлений",
    notifications_mark_read: "Прочитано",
    notifications_state: "Статус",
    notifications_state_new: "новое",
    notifications_state_read: "прочитано",

    auth_login_title: "Вход",
    auth_login_button: "Войти",
    auth_password_placeholder: "Пароль",
    auth_signup_title: "Регистрация",
  },
  en: {
    nav_home: "Home",
    nav_profile: "My Profile",
    nav_courses: "Courses",
    nav_notifications: "Notifications",
    nav_settings: "Settings",
    nav_creator_manage: "Course Management",
    nav_admin_panel: "Admin Panel",

    settings_title: "Settings",
    settings_language: "Language",
    settings_theme: "Theme",
    settings_theme_light: "Light",
    settings_theme_dark: "Dark",

    notifications_title: "Notifications",
    notifications_empty: "No notifications",
    notifications_mark_read: "Mark as read",
    notifications_state: "Status",
    notifications_state_new: "new",
    notifications_state_read: "read",

    auth_login_title: "Sign In",
    auth_login_button: "Sign In",
    auth_password_placeholder: "Password",
    auth_signup_title: "Sign Up",
  },
};

const getInitialLang = () => {
  const saved = localStorage.getItem(LANG_KEY);
  if (saved && DICT[saved]) return saved;
  return "kk";
};

export const I18nProvider = ({ children }) => {
  const [lang, setLangState] = useState(getInitialLang);

  const setLang = (next) => {
    if (!DICT[next]) return;
    localStorage.setItem(LANG_KEY, next);
    setLangState(next);
  };

  const t = (key) => {
    const table = DICT[lang] || DICT.kk;
    return table[key] || DICT.kk[key] || key;
  };

  const value = useMemo(() => ({ lang, setLang, t }), [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
};
