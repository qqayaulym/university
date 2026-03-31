import { pool } from "../db.js";

const ALLOWED_STATUS = ["pending", "accepted", "rejected"];

export const applyToCourse = async (req, res) => {
  const courseId = Number(req.params.courseId);
  const userId = req.user.id;

  if (!Number.isFinite(courseId)) {
    return res.status(400).json({ message: "courseId дұрыс емес" });
  }

  try {
    const courseRes = await pool.query("SELECT id, user_id FROM courses WHERE id=$1", [courseId]);
    const course = courseRes.rows[0];
    if (!course) return res.status(404).json({ message: "Курс табылмады" });

    if (Number(course.user_id) === Number(userId)) {
      return res.status(400).json({ message: "Өзіңіздің курсыңызға өтінім жіберуге болмайды" });
    }

    const memberRes = await pool.query(
      "SELECT 1 FROM course_members WHERE course_id=$1 AND user_id=$2",
      [courseId, userId]
    );
    if (memberRes.rows.length > 0) {
      return res.status(400).json({ message: "Сіз бұл курстың қатысушысы болып тұрсыз" });
    }

    const existingRes = await pool.query(
      "SELECT id, status FROM course_applications WHERE course_id=$1 AND user_id=$2",
      [courseId, userId]
    );

    if (existingRes.rows.length > 0) {
      const existing = existingRes.rows[0];
      if (existing.status === "accepted") {
        return res.status(400).json({ message: "Сіз бұл курсқа әлдеқашан қабылданғансыз" });
      }
      if (existing.status === "pending") {
        return res.status(400).json({ message: "Өтінім бұрын жіберілген" });
      }

      const updated = await pool.query(
        "UPDATE course_applications SET status='pending', updated_at=NOW() WHERE id=$1 RETURNING *",
        [existing.id]
      );
      return res.status(201).json(updated.rows[0]);
    }

    const created = await pool.query(
      "INSERT INTO course_applications (course_id, user_id, status) VALUES ($1, $2, 'pending') RETURNING *",
      [courseId, userId]
    );

    await pool.query(
      "INSERT INTO notifications (user_id, type, message) VALUES ($1, $2, $3)",
      [
        course.user_id,
        "course_application_new",
        `Курсқа жаңа өтінім түсті (#${courseId})`,
      ]
    );

    res.status(201).json(created.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Сервер қатесі" });
  }
};

export const getMyApplications = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      `SELECT a.id, a.course_id, a.status, a.created_at, a.updated_at, c.name AS course_name, c.bio AS course_bio,
              EXISTS (
                SELECT 1
                FROM course_members m
                WHERE m.course_id = a.course_id AND m.user_id = a.user_id
              ) AS is_member
       FROM course_applications a
       JOIN courses c ON c.id = a.course_id
       WHERE a.user_id = $1
       ORDER BY a.created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Сервер қатесі" });
  }
};

export const getCourseApplicationsForCreator = async (req, res) => {
  const courseId = Number(req.params.courseId);

  if (!Number.isFinite(courseId)) {
    return res.status(400).json({ message: "courseId дұрыс емес" });
  }

  try {
    const courseRes = await pool.query("SELECT id, user_id FROM courses WHERE id=$1", [courseId]);
    const course = courseRes.rows[0];
    if (!course) return res.status(404).json({ message: "Курс табылмады" });

    if (Number(course.user_id) !== Number(req.user.id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Қол жеткізуге тыйым салынған" });
    }

    const apps = await pool.query(
      `SELECT a.id, a.course_id, a.user_id, a.status, a.created_at, u.username, u.email
       FROM course_applications a
       JOIN users u ON u.id = a.user_id
       WHERE a.course_id = $1
       ORDER BY a.created_at DESC`,
      [courseId]
    );

    res.json(apps.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Сервер қатесі" });
  }
};

export const updateApplicationStatus = async (req, res) => {
  const applicationId = Number(req.params.applicationId);
  const { status } = req.body;

  if (!Number.isFinite(applicationId)) {
    return res.status(400).json({ message: "applicationId дұрыс емес" });
  }
  if (!ALLOWED_STATUS.includes(status) || status === "pending") {
    return res.status(400).json({ message: "Статус дұрыс емес" });
  }

  try {
    const appRes = await pool.query(
      `SELECT a.id, a.course_id, a.user_id, a.status, c.user_id AS creator_id
       FROM course_applications a
       JOIN courses c ON c.id = a.course_id
       WHERE a.id = $1`,
      [applicationId]
    );
    const app = appRes.rows[0];
    if (!app) return res.status(404).json({ message: "Өтінім табылмады" });

    if (Number(app.creator_id) !== Number(req.user.id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Қол жеткізуге тыйым салынған" });
    }

    const updated = await pool.query(
      "UPDATE course_applications SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *",
      [status, applicationId]
    );

    if (status === "accepted") {
      await pool.query(
        "INSERT INTO course_members (course_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [app.course_id, app.user_id]
      );

      await pool.query(
        "INSERT INTO notifications (user_id, type, message) VALUES ($1, $2, $3)",
        [app.user_id, "course_application_accepted", `Курсқа өтініміңіз қабылданды (#${app.course_id})`]
      );
    }

    if (status === "rejected") {
      await pool.query(
        "DELETE FROM course_members WHERE course_id=$1 AND user_id=$2",
        [app.course_id, app.user_id]
      );

      await pool.query(
        "INSERT INTO notifications (user_id, type, message) VALUES ($1, $2, $3)",
        [app.user_id, "course_application_rejected", `Курсқа өтініміңіз қабылданбады (#${app.course_id})`]
      );
    }

    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Сервер қатесі" });
  }
};
