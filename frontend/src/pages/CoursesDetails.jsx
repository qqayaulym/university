import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Loader from "../components/ui/Loader";
import StatusMessage from "../components/ui/StatusMessage";

const CoursesDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/courses/${id}`);

        console.log("COURSE:", res.data); 

        setCourse(res.data);
      } catch (err) {
        console.error(err);
        setError("Курс жүктелмеді");
      }
    };

    fetchCourse();
  }, [id]);

  if (error) return <StatusMessage type="error">{error}</StatusMessage>;
  if (!course) return <Loader />;

  return (
    <div className="soloCoursesDiv">
      <button onClick={() => navigate(-1)}>← Назад</button>

      <h2>{course.name}</h2>
      <p>{course.bio}</p>
    </div>
  );
};

export default CoursesDetails;