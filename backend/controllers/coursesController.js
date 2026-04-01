import sql from "../db.js";

export const showAllCourses = async (req, res) => {
    try {
        const result = await sql`SELECT id, name, bio, start_at, deadline, who_created FROM courses ORDER BY id DESC`
        
        // Get author information for each course
        const coursesWithAuthors = await Promise.all(
            result.map(async (course) => {
                const author = await sql`SELECT username FROM users WHERE id = ${course.who_created}`;
                return {
                    ...course,
                    author: author[0]?.username || 'Белгісіз'
                };
            })
        );
        
        res.json(coursesWithAuthors)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Сервер қатесі" })
    }
}

export const getUpcomingCourses = async (req, res) => {
  const limitRaw = req.query.limit;
  const limit = Number.isFinite(Number(limitRaw)) ? Math.max(1, Math.min(20, Number(limitRaw))) : 5;

  try {
    const result = await sql`SELECT id, name, bio, start_at, deadline, who_created
       FROM courses
       WHERE start_at IS NOT NULL AND start_at >= NOW()
       ORDER BY start_at ASC
       LIMIT ${limit}`;
    
    // Get author information
    const coursesWithAuthors = await Promise.all(
        result.map(async (course) => {
            const author = await sql`SELECT username FROM users WHERE id = ${course.who_created}`;
            return {
                ...course,
                author: author[0]?.username || 'Белгісіз'
            };
        })
    );
    
    res.json(coursesWithAuthors);
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
    const result = await sql`SELECT id, name, bio, start_at, deadline, who_created
       FROM courses
       WHERE start_at IS NOT NULL
         AND start_at >= ${start.toISOString()}
         AND start_at < ${end.toISOString()}
       ORDER BY start_at ASC`;
    
    // Get author information
    const coursesWithAuthors = await Promise.all(
        result.map(async (course) => {
            const author = await sql`SELECT username FROM users WHERE id = ${course.who_created}`;
            return {
                ...course,
                author: author[0]?.username || 'Белгісіз'
            };
        })
    );
    
    res.json(coursesWithAuthors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Сервер қатесі" });
  }
};

export const getMyCreatedCourses = async (req, res) => {
  try {
    const result = await sql`SELECT id, name, bio, start_at, deadline, who_created FROM courses WHERE who_created=${req.user.id} ORDER BY id DESC`;
    
    // Get author information
    const coursesWithAuthors = await Promise.all(
        result.map(async (course) => {
            const author = await sql`SELECT username FROM users WHERE id = ${course.who_created}`;
            return {
                ...course,
                author: author[0]?.username || 'Белгісіз'
            };
        })
    );
    
    res.json(coursesWithAuthors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Сервер қатесі" });
  }
};

export const getMyMemberCourses = async (req, res) => {
  try {
    const result = await sql`SELECT c.id, c.name, c.bio, c.start_at, c.deadline, c.who_created
       FROM course_members m
       JOIN courses c ON c.id = m.course_id
       WHERE m.user_id=${req.user.id}
       ORDER BY m.created_at DESC`;
    
    // Get author information
    const coursesWithAuthors = await Promise.all(
        result.map(async (course) => {
            const author = await sql`SELECT username FROM users WHERE id = ${course.who_created}`;
            return {
                ...course,
                author: author[0]?.username || 'Белгісіз'
            };
        })
    );
    
    res.json(coursesWithAuthors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Сервер қатесі" });
  }
};

export const createNewCourse = async (req, res) => {
  const { name, bio, deadline } = req.body;

  if (!name?.trim() || !bio?.trim()) {
    return res.status(400).json({ message: "Атауын мен сипаттамасын енгізіңіз" });
  }

  if (!["admin", "creator"].includes(String(req.user.role).toLowerCase())) {
    return res.status(403).json({ message: "Курс құру үшін құқықтарыңыз жоқ" });
  }

  try {
    const result = await sql`INSERT INTO courses (name, bio, who_created, deadline) VALUES (${name.trim()}, ${bio.trim()}, ${req.user.id}, ${deadline ? new Date(deadline).toISOString() : null}) RETURNING id, name, bio, start_at, deadline, who_created`;
    
    // Get author information
    const author = await sql`SELECT username FROM users WHERE id = ${req.user.id}`;
    const courseWithAuthor = {
        ...result[0],
        author: author[0]?.username || 'Белгісіз'
    };
    
    res.status(201).json({ message: "Курс құрылды", course: courseWithAuthor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Сервер қатесі" });
  }
};

export const deleteCourse = async (req, res) => {
  const { id } = req.params;          
  const userId = req.user.id;        

  try {
    const result = await sql`SELECT who_created FROM courses WHERE id=${id}`;
    const course = result[0];

    if (!course) return res.status(404).json({ message: "Іс-шара табылмады" });

    if (course.who_created !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Бөтен іс-шараны өшіруге болмайды" });
    }

    await sql`DELETE FROM courses WHERE id=${id}`;
    res.json({ message: "Іс-шара сәтті өшірілді" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Сервер қатесі" });
  }
};

export const showCourse = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await sql`SELECT id, name, bio, start_at, deadline, who_created FROM courses WHERE id = ${id}`;

    if (result.length === 0) {
      return res.status(404).json({ error: "Курс табылмады" });
    }
    
    // Get author information
    const author = await sql`SELECT username FROM users WHERE id = ${result[0].who_created}`;
    const courseWithAuthor = {
        ...result[0],
        author: author[0]?.username || 'Белгісіз'
    };

    res.json(courseWithAuthor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Сервер қатесі" });
  }
};

export const updateCourse = async (req, res) => {
  const { id } = req.params;
  const { name, bio, startAt, deadline } = req.body;
  const userId = req.user.id;

  try {
    const result = await sql`SELECT id, who_created, name, bio, start_at, deadline FROM courses WHERE id=${id}`;
    const course = result[0];

    if (!course) return res.status(404).json({ message: "Іс-шара табылмады" });

    if (course.who_created !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Бөтен іс-шараны өзгерте алмайсыз" });
    }

    const updated = await sql`UPDATE courses SET name=${name || course.name}, bio=${bio || course.bio}, start_at=${startAt ? new Date(startAt).toISOString() : course.start_at}, deadline=${deadline ? new Date(deadline).toISOString() : course.deadline} WHERE id=${id} RETURNING id, name, bio, start_at, deadline, who_created`;
    
    // Get author information
    const author = await sql`SELECT username FROM users WHERE id = ${updated[0].who_created}`;
    const courseWithAuthor = {
        ...updated[0],
        author: author[0]?.username || 'Белгісіз'
    };

    res.json(courseWithAuthor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Сервер қатесі" });
  }
};

// New endpoints for course filtering and status
export const getCoursesByDateRange = async (req, res) => {
  const { startDate, endDate } = req.query;
  
  if (!startDate || !endDate) {
    return res.status(400).json({ message: "startDate және endDate параметрлері қажет" });
  }

  try {
    const result = await sql`SELECT id, name, bio, start_at, deadline, who_created
       FROM courses
       WHERE start_at >= ${new Date(startDate).toISOString()}
         AND start_at <= ${new Date(endDate).toISOString()}
       ORDER BY start_at ASC`;
    
    // Get author information
    const coursesWithAuthors = await Promise.all(
        result.map(async (course) => {
            const author = await sql`SELECT username FROM users WHERE id = ${course.who_created}`;
            return {
                ...course,
                author: author[0]?.username || 'Белгісіз'
            };
        })
    );
    
    res.json(coursesWithAuthors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Сервер қатесі" });
  }
};

export const getNewCourses = async (req, res) => {
  const days = parseInt(req.query.days) || 7;
  
  try {
    const result = await sql`SELECT id, name, bio, start_at, deadline, who_created
       FROM courses
       WHERE created_at >= NOW() - INTERVAL '${days} days'
       ORDER BY created_at DESC`;
    
    // Get author information
    const coursesWithAuthors = await Promise.all(
        result.map(async (course) => {
            const author = await sql`SELECT username FROM users WHERE id = ${course.who_created}`;
            return {
                ...course,
                author: author[0]?.username || 'Белгісіз'
            };
        })
    );
    
    res.json(coursesWithAuthors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Сервер қатесі" });
  }
};

export const getCoursesWithStatus = async (req, res) => {
  const userId = req.user.id;
  
  try {
    // Get all courses with author info
    const allCourses = await sql`SELECT id, name, bio, start_at, deadline, who_created FROM courses ORDER BY id DESC`;
    
    // Get user's created courses
    const createdCourses = await sql`SELECT id FROM courses WHERE who_created = ${userId}`;
    
    // Get user's member courses
    const memberCourses = await sql`SELECT course_id FROM course_members WHERE user_id = ${userId}`;
    
    const createdIds = new Set(createdCourses.map(c => c.id));
    const memberIds = new Set(memberCourses.map(m => m.course_id));
    
    // Mark courses with status
    const coursesWithStatus = await Promise.all(
        allCourses.map(async (course) => {
            const author = await sql`SELECT username FROM users WHERE id = ${course.who_created}`;
            
            let status = 'available';
            if (createdIds.has(course.id)) {
                status = 'my_created';
            } else if (memberIds.has(course.id)) {
                status = 'my_member';
            }
            
            return {
                ...course,
                author: author[0]?.username || 'Белгісіз',
                status
            };
        })
    );
    
    res.json(coursesWithStatus);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Сервер қатесі" });
  }
};