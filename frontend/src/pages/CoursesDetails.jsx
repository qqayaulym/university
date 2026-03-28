import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const CoursesDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/courses/${id}`
        );

        console.log("COURSE:", res.data); 

        setCourse(res.data);
      } catch (err) {
        console.error(err);
        setError("Курс жүктелмеді");
      }
    };

    fetchCourse();
  }, [id]);

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!course) return <p>Жүктелуде...</p>;

  return (
    <div className="soloCoursesDiv">
      <button onClick={() => navigate(-1)}>← Назад</button>

      <h2>{course.name}</h2>
      <p>{course.bio}</p>
    </div>
  );
};

export default CoursesDetails;