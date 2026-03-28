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

export const createNewCourse = async(req, res) => {
    const { name, bio } = req.body

    if (!name || name.trim() === "") {
        return res.status(400).json({ error: "Іс-шара атауы бос болмауы керек!"})
    }

    if (!bio || bio.trim() === "") {
        return res.status(400).json({ error: "Іс-шара сипаттамасы бос болмауы керек!"})
    }
    try {
        const result = await pool.query(
            "INSERT INTO courses (name, bio) VALUES ($1, $2) RETURNING *",
            [name.trim(), bio.trim()]
        )
        res.status(201).json(result.rows[0])
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Сервер қатесі" })
    }
}

export const deleteCourse = async (req, res) => {
    const { id } = req.params;
  try {
    await pool.query("DELETE FROM courses WHERE id = $1", [id]);
    res.json({ message: "Іс-шара өшірілді" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
}

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