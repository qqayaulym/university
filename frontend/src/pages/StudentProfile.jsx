import React, { useEffect, useState } from "react"
import { Mail, Shield, BookOpen, FileText, ChevronDown, ChevronUp } from "lucide-react"
import api from "../api/axios";
import Loader from "../components/ui/Loader";
import StatusMessage from "../components/ui/StatusMessage";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useI18n } from "../contexts/I18nContext";

const StudentProfile = () => {
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState("");
    const [memberCourses, setMemberCourses] = useState([]);
    const [applications, setApplications] = useState([]);
    const [openSections, setOpenSections] = useState({ courses: true, applications: true });
    const { t } = useI18n();

    const statusLabel = (s) => {
      if (s === "pending") return "Қаралуда";
      if (s === "accepted") return "Қабылданды";
      if (s === "rejected") return "Қабылданбады";
      return s;
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get("/auth/me");
                setProfile(res.data);
            } catch (err) {
                setError(err.response?.data?.message || "Парақша жүктелмеді");
            }
        };

        const fetchMemberCourses = async () => {
          try {
            const res = await api.get("/courses/my");
            setMemberCourses(Array.isArray(res.data) ? res.data : []);
          } catch (_err) {
            setMemberCourses([]);
          }
        };

        const fetchApplications = async () => {
          try {
            const res = await api.get("/course-applications/my");
            setApplications(Array.isArray(res.data) ? res.data : []);
          } catch (_err) {
            setApplications([]);
          }
        };

        fetchProfile();
        fetchMemberCourses();
        fetchApplications();
    }, []);

    const visibleApplications = applications.filter((a) => !(a.status === "accepted" && a.is_member));

    const toggleSection = (key) => {
      setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    if (error) {
        return <StatusMessage type="error">{error}</StatusMessage>;
    }

    if (!profile) {
        return <Loader />;
    }

    const profileCards = [
      { label: t("profile_email"), value: profile.email, icon: Mail },
      { label: t("profile_role"), value: profile.role, icon: Shield },
      { label: t("profile_my_courses"), value: String(memberCourses.length), icon: BookOpen },
      { label: t("profile_my_applications"), value: String(visibleApplications.length), icon: FileText },
    ];

    return(
        <div className="profileDiv">
            <div className="profileIntro">
              <div className="profileIdentity">
                <h2 className="profileUsername">{profile.username}</h2>
                <p className="profileSectionHint">{t("page_profile")}</p>
              </div>

              <div className="profileMeta">
                {profileCards.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="profileMetaCard">
                      {Icon && <Icon size={20} className="profileMetaIcon" />}
                      <div className="profileMetaContent">
                        <span className="profileMetaLabel">{item.label}</span>
                        <span className="profileMetaValue">{item.value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="profileSectionHeader">
              <div>
                <h3 className="profileSectionTitle">{t("profile_my_courses")}</h3>
                <p className="profileSectionHint">{memberCourses.length > 0 ? `${memberCourses.length}` : t("profile_empty")}</p>
              </div>
              <Button variant="secondary" icon={openSections.courses ? ChevronUp : ChevronDown} onClick={() => toggleSection("courses")}>{openSections.courses ? t("profile_collapse") : t("profile_expand")}</Button>
            </div>
            {openSections.courses && (memberCourses.length === 0 ? (
              <div className="emptyState">
                <p>{t("profile_empty")}</p>
              </div>
            ) : (
              memberCourses.map((c) => (
                <Card key={c.id} className="courseCard">
                  <h4>{c.name}</h4>
                  <p>{c.bio || t("courses_no_description")}</p>
                </Card>
              ))
            ))}

            <div className="profileSectionHeader">
              <div>
                <h3 className="profileSectionTitle">{t("profile_my_applications")}</h3>
                <p className="profileSectionHint">{visibleApplications.length > 0 ? `${visibleApplications.length}` : t("profile_empty")}</p>
              </div>
              <Button variant="secondary" icon={openSections.applications ? ChevronUp : ChevronDown} onClick={() => toggleSection("applications")}>{openSections.applications ? t("profile_collapse") : t("profile_expand")}</Button>
            </div>
            {openSections.applications && (visibleApplications.length === 0 ? (
              <div className="emptyState">
                <p>{t("profile_empty")}</p>
              </div>
            ) : (
              visibleApplications.map((a) => (
                <Card key={a.id} className="courseCard">
                  <h4>{a.course_name}</h4>
                  <p>{t("profile_status")}</p>
                  <span className={`pillStatus ${a.status}`.trim()}>{statusLabel(a.status)}</span>
                </Card>
              ))
            ))}
        </div>
    )
}

export default StudentProfile