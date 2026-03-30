import { pool } from "../db.js";

export const showAllCourses = async (req, res) => {
    try {
        const result = await pool.query("SELECT id, name, bio FROM courses")
        res.json(result.rows)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Сервер қатесі" })
    }
}
export const createNewCourse = async (req, res) => {
  const { name, bio } = req.body;
  const userId = req.user.id; 

  if (!name || name.trim() === "") {
    return res.status(400).json({ error: "Іс-шара атауы бос болмауы керек" });
  }

  if (!bio || bio.trim() === "") {
    return res.status(400).json({ error: "Іс-шара сипаттамасы бос болмауы керек" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO courses (name, bio, user_id) VALUES ($1, $2, $3) RETURNING *",
      [name.trim(), bio.trim(), userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Сервер қатесі" });
  }
};

export const deleteCourse = async (req, res) => {
  const { id } = req.params;          
  const userId = req.user.id;        

  try {
    const result = await pool.query("SELECT user_id FROM courses WHERE id=$1", [id]);
    const course = result.rows[0];

    if (!course) return res.status(404).json({ message: "Іс-шара табылмады" });

    if (course.user_id !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Бөтен іс-шараны өшіруге болмайды" });
    }

    await pool.query("DELETE FROM courses WHERE id=$1", [id]);
    res.json({ message: "Іс-шара сәтті өшірілді" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

export const showCourse = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "SELECT id, name, bio FROM courses WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Курс табылмады" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Сервер қатесі" });
  }
};

export const updateCourse = async (req, res) => {
  const { id } = req.params;
  const { name, bio } = req.body;
  const userId = req.user.id;

  try {
    const result = await pool.query("SELECT id, user_id, name, bio FROM courses WHERE id=$1", [id]);
    const course = result.rows[0];

    if (!course) return res.status(404).json({ message: "Іс-шара табылмады" });

    if (course.user_id !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Бөтен іс-шараны өзгерте алмайсыз" });
    }

    const updated = await pool.query(
      "UPDATE courses SET name=$1, bio=$2 WHERE id=$3 RETURNING *",
      [name || course.name, bio || course.bio, id]
    );

    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Сервер қатесі" });
  }
};