import sql from "../db.js";

const ALLOWED_STATUS = ["pending", "accepted", "rejected"];

export const applyToCourse = async (req, res) => {
  const courseId = Number(req.params.courseId);
  const userId = req.user.id;

  if (!Number.isFinite(courseId)) {
    return res.status(400).json({ message: "courseId дұрыс емес" });
  }

  try {
    const courseRes = await sql`SELECT id, who_created FROM courses WHERE id=${courseId}`;
    const course = courseRes[0];
    if (!course) return res.status(404).json({ message: "Курс табылмады" });

    if (Number(course.who_created) === Number(userId)) {
      return res.status(400).json({ message: "Өзіңіздің курсыңызға өтінім жіберуге болмайды" });
    }

    const memberRes = await sql`SELECT 1 FROM course_members WHERE course_id=${courseId} AND user_id=${userId}`;
    if (memberRes.length > 0) {
      return res.status(400).json({ message: "Сіз бұл курстың қатысушысы болып тұрсыз" });
    }

    const existingRes = await sql`SELECT id, status FROM course_applications WHERE course_id=${courseId} AND user_id=${userId}`;

    if (existingRes.length > 0) {
      const existing = existingRes[0];
      if (existing.status === "accepted") {
        return res.status(400).json({ message: "Сіз бұл курсқа әлдеқашан қабылданғансыз" });
      }
      if (existing.status === "pending") {
        return res.status(400).json({ message: "Өтінім бұрын жіберілген" });
      }

      const updated = await sql`UPDATE course_applications SET status='pending', updated_at=NOW() WHERE id=${existing.id} RETURNING *`;
      return res.status(201).json(updated[0]);
    }

    const created = await sql`INSERT INTO course_applications (course_id, user_id, status) VALUES (${courseId}, ${userId}, 'pending') RETURNING *`;

    await sql`INSERT INTO notifications (user_id, type, message) VALUES (${course.who_created}, ${'course_application_new'}, ${`Курсқа жаңа өтінім түсті (#${courseId})`})`;

    res.status(201).json(created[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Сервер қатесі" });
  }
};

export const getMyApplications = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await sql`SELECT a.id, a.course_id, a.status, a.created_at, a.updated_at, c.name AS course_name, c.bio AS course_bio,
              EXISTS (
                SELECT 1
                FROM course_members m
                WHERE m.course_id = a.course_id AND m.user_id = a.user_id
              ) AS is_member
       FROM course_applications a
       JOIN courses c ON c.id = a.course_id
       WHERE a.user_id = ${userId}
       ORDER BY a.created_at DESC`;
    res.json(result);
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
    const courseRes = await sql`SELECT id, who_created FROM courses WHERE id=${courseId}`;
    const course = courseRes[0];
    if (!course) return res.status(404).json({ message: "Курс табылмады" });

    if (Number(course.who_created) !== Number(req.user.id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Қол жеткізуге тыйым салынған" });
    }

    const apps = await sql`SELECT a.id, a.course_id, a.user_id, a.status, a.created_at, u.username, u.email
       FROM course_applications a
       JOIN users u ON u.id = a.user_id
       WHERE a.course_id = ${courseId}
       ORDER BY a.created_at DESC`;

    res.json(apps);
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
    const appRes = await sql`SELECT a.id, a.course_id, a.user_id, a.status, c.who_created AS creator_id
       FROM course_applications a
       JOIN courses c ON c.id = a.course_id
       WHERE a.id = ${applicationId}`;
    const app = appRes[0];
    if (!app) return res.status(404).json({ message: "Өтінім табылмады" });

    if (Number(app.creator_id) !== Number(req.user.id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Қол жеткізуге тыйым салынған" });
    }

    const updated = await sql`UPDATE course_applications SET status=${status}, updated_at=NOW() WHERE id=${applicationId} RETURNING *`;

    if (status === "accepted") {
      await sql`INSERT INTO course_members (course_id, user_id) VALUES (${app.course_id}, ${app.user_id}) ON CONFLICT DO NOTHING`;

      await sql`INSERT INTO notifications (user_id, type, message) VALUES (${app.user_id}, ${'course_application_accepted'}, ${`Курсқа өтініміңіз қабылданды (#${app.course_id})`})`;
    }

    if (status === "rejected") {
      await sql`DELETE FROM course_members WHERE course_id=${app.course_id} AND user_id=${app.user_id}`;

      await sql`INSERT INTO notifications (user_id, type, message) VALUES (${app.user_id}, ${'course_application_rejected'}, ${`Курсқа өтініміңіз қабылданбады (#${app.course_id})`})`;
    }

    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Сервер қатесі" });
  }
};
