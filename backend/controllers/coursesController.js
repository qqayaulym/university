import { pool } from "../db.js";

export const showAllCourses = async (req, res) => {
    try {
        const result = await pool.query("SELECT id, name, bio, start_at, end_at FROM courses ORDER BY id DESC")
        res.json(result.rows)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Сервер қатесі" })
    }
}

export const getUpcomingCourses = async (req, res) => {
  const limitRaw = req.query.limit;
  const limit = Number.isFinite(Number(limitRaw)) ? Math.max(1, Math.min(20, Number(limitRaw))) : 5;

  try {
    const result = await pool.query(
      `SELECT id, name, bio, start_at, end_at
       FROM courses
       WHERE start_at IS NOT NULL AND start_at >= NOW()
       ORDER BY start_at ASC
       LIMIT $1`,
      [limit]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Сервер қатесі" });
  }
};

export const getWeekCourses = async (req, res) => {
  const fromRaw = String(req.query.from || "").trim();
  const fromDate = fromRaw ? new Date(fromRaw) : new Date();

  if (Number.isNaN(fromDate.getTime())) {
    return res.status(400).json({ message: "from параметрі дұрыс емес (YYYY-MM-DD)" });
  }

  const start = new Date(fromDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  try {
    const result = await pool.query(
      `SELECT id, name, bio, start_at, end_at
       FROM courses
       WHERE start_at IS NOT NULL
         AND start_at >= $1
         AND start_at < $2
       ORDER BY start_at ASC`,
      [start.toISOString(), end.toISOString()]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Сервер қатесі" });
  }
};

export const getMyCreatedCourses = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, bio, start_at, end_at FROM courses WHERE user_id=$1 ORDER BY id DESC",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Сервер қатесі" });
  }
};

export const getMyMemberCourses = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.name, c.bio, c.start_at, c.end_at
       FROM course_members m
       JOIN courses c ON c.id = m.course_id
       WHERE m.user_id=$1
       ORDER BY m.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Сервер қатесі" });
  }
};

export const createNewCourse = async (req, res) => {
  const { name, bio, startAt, endAt } = req.body;
  const userId = req.user.id; 

  if (!name || name.trim() === "") {
    return res.status(400).json({ error: "Курс атауы бос болмауы керек" });
  }

  if (!bio || bio.trim() === "") {
    return res.status(400).json({ error: "Курс сипаттамасы бос болмауы керек" });
  }

  const start = startAt ? new Date(startAt) : null;
  const end = endAt ? new Date(endAt) : null;

  if (!start || Number.isNaN(start.getTime())) {
    return res.status(400).json({ error: "Басталу уақыты дұрыс емес" });
  }
  if (endAt && (!end || Number.isNaN(end.getTime()))) {
    return res.status(400).json({ error: "Аяқталу уақыты дұрыс емес" });
  }
  if (end && end.getTime() < start.getTime()) {
    return res.status(400).json({ error: "Аяқталу уақыты басталу уақытынан ерте болмауы керек" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO courses (name, bio, user_id, start_at, end_at) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name.trim(), bio.trim(), userId, start.toISOString(), end ? end.toISOString() : null]
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
    res.status(500).json({ message: "Сервер қатесі" });
  }
};

export const showCourse = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "SELECT id, name, bio, start_at, end_at FROM courses WHERE id = $1",
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
  const { name, bio, startAt, endAt } = req.body;
  const userId = req.user.id;

  try {
    const result = await pool.query("SELECT id, user_id, name, bio, start_at, end_at FROM courses WHERE id=$1", [id]);
    const course = result.rows[0];

    if (!course) return res.status(404).json({ message: "Іс-шара табылмады" });

    if (course.user_id !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Бөтен іс-шараны өзгерте алмайсыз" });
    }

    const updated = await pool.query(
      "UPDATE courses SET name=$1, bio=$2, start_at=$3, end_at=$4 WHERE id=$5 RETURNING *",
      [
        (name || course.name),
        (bio || course.bio),
        startAt ? new Date(startAt).toISOString() : course.start_at,
        endAt ? new Date(endAt).toISOString() : course.end_at,
        id
      ]
    );

    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Сервер қатесі" });
  }
};