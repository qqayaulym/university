import React from "react"
import { useI18n } from "../contexts/I18nContext";

const Footer = () => {
    const { t } = useI18n();

    return (
        <footer className="footer">
            <p className="footerText">© {new Date().getFullYear()} AITU Events. {t("footer_rights")}</p>
            <p className="footerText">{t("footer_contact")}: <a href="mailto:info@aitu.edu.kz">info@aitu.edu.kz</a> | {t("footer_phone")}: +7 (7172) 70-70-70</p>
            <p className="footerText">
                {t("footer_site")}: <a href="https://www.aitu.edu.kz" target="_blank" rel="noopener noreferrer">aitu.edu.kz</a>
            </p>
        </footer>
    )
}

export default Footer
