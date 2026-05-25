import express from "express";
import { eq, desc, and } from "drizzle-orm";
import { db } from "../db/index.js";
import {
    announcements,
    comments,
    assignments,
    submissions,
    materials
} from "../db/schema/app.js";
import { user } from "../db/schema/auth.js";

const router = express.Router();

// ==========================================
// ANNOUNCEMENTS & DISCUSSIONS
// ==========================================

// Get all announcements for a class with author info and comments
router.get("/classes/:classId/announcements", async (req, res) => {
    try {
        const classId = Number(req.params.classId);
        if (!classId) return res.status(400).json({ error: "Invalid Class ID" });

        const announcementsList = await db
            .select({
                id: announcements.id,
                content: announcements.content,
                createdAt: announcements.createdAt,
                author: {
                    id: user.id,
                    name: user.name,
                    image: user.image,
                    role: user.role
                }
            })
            .from(announcements)
            .innerJoin(user, eq(announcements.userId, user.id))
            .where(eq(announcements.classId, classId))
            .orderBy(desc(announcements.createdAt));

        // Fetch comments for each announcement
        const result = [];
        for (const item of announcementsList) {
            const announcementComments = await db
                .select({
                    id: comments.id,
                    content: comments.content,
                    createdAt: comments.createdAt,
                    author: {
                        id: user.id,
                        name: user.name,
                        image: user.image,
                        role: user.role
                    }
                })
                .from(comments)
                .innerJoin(user, eq(comments.userId, user.id))
                .where(eq(comments.announcementId, item.id))
                .orderBy(desc(comments.createdAt));

            result.push({
                ...item,
                comments: announcementComments
            });
        }

        res.status(200).json({ data: result });
    } catch (e) {
        console.error(`GET announcements error: ${e}`);
        res.status(500).json({ error: "Failed to load announcements" });
    }
});

// Post a new announcement to a class
router.post("/classes/:classId/announcements", async (req, res) => {
    try {
        const classId = Number(req.params.classId);
        const { userId, content } = req.body;

        if (!classId || !userId || !content) {
            return res.status(400).json({ error: "Required fields missing" });
        }

        const [newAnnouncement] = await db
            .insert(announcements)
            .values({
                classId,
                userId,
                content
            })
            .returning();

        res.status(201).json({ data: newAnnouncement });
    } catch (e) {
        console.error(`POST announcement error: ${e}`);
        res.status(500).json({ error: "Failed to publish announcement" });
    }
});

// Post a comment to an announcement
router.post("/announcements/:announcementId/comments", async (req, res) => {
    try {
        const announcementId = Number(req.params.announcementId);
        const { userId, content } = req.body;

        if (!announcementId || !userId || !content) {
            return res.status(400).json({ error: "Required fields missing" });
        }

        const [newComment] = await db
            .insert(comments)
            .values({
                announcementId,
                userId,
                content
            })
            .returning();

        res.status(201).json({ data: newComment });
    } catch (e) {
        console.error(`POST comment error: ${e}`);
        res.status(500).json({ error: "Failed to publish comment" });
    }
});

// ==========================================
// ASSIGNMENTS & SUBMISSIONS
// ==========================================

// Get all assignments for a class
router.get("/classes/:classId/assignments", async (req, res) => {
    try {
        const classId = Number(req.params.classId);
        if (!classId) return res.status(400).json({ error: "Invalid Class ID" });

        const assignmentsList = await db
            .select()
            .from(assignments)
            .where(eq(assignments.classId, classId))
            .orderBy(desc(assignments.createdAt));

        res.status(200).json({ data: assignmentsList });
    } catch (e) {
        console.error(`GET assignments error: ${e}`);
        res.status(500).json({ error: "Failed to load assignments" });
    }
});

// Create a new assignment
router.post("/classes/:classId/assignments", async (req, res) => {
    try {
        const classId = Number(req.params.classId);
        const { title, description, dueDate, maxPoints } = req.body;

        if (!classId || !title || !description || !dueDate) {
            return res.status(400).json({ error: "Required fields missing" });
        }

        const [newAssignment] = await db
            .insert(assignments)
            .values({
                classId,
                title,
                description,
                dueDate: new Date(dueDate),
                maxPoints: Number(maxPoints) || 100
            })
            .returning();

        res.status(201).json({ data: newAssignment });
    } catch (e) {
        console.error(`POST assignment error: ${e}`);
        res.status(500).json({ error: "Failed to publish assignment" });
    }
});

// Get submissions for an assignment
router.get("/assignments/:assignmentId/submissions", async (req, res) => {
    try {
        const assignmentId = Number(req.params.assignmentId);
        const { studentId } = req.query;

        if (!assignmentId) return res.status(400).json({ error: "Invalid Assignment ID" });

        let conditions = eq(submissions.assignmentId, assignmentId);
        if (studentId) {
            conditions = and(conditions, eq(submissions.studentId, String(studentId))) as any;
        }

        const submissionsList = await db
            .select({
                id: submissions.id,
                fileUrl: submissions.fileUrl,
                textContent: submissions.textContent,
                grade: submissions.grade,
                feedback: submissions.feedback,
                status: submissions.status,
                submittedAt: submissions.submittedAt,
                student: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image
                }
            })
            .from(submissions)
            .innerJoin(user, eq(submissions.studentId, user.id))
            .where(conditions)
            .orderBy(desc(submissions.submittedAt));

        res.status(200).json({ data: submissionsList });
    } catch (e) {
        console.error(`GET submissions error: ${e}`);
        res.status(500).json({ error: "Failed to load submissions" });
    }
});

// Submit work for an assignment
router.post("/assignments/:assignmentId/submissions", async (req, res) => {
    try {
        const assignmentId = Number(req.params.assignmentId);
        const { studentId, fileUrl, textContent } = req.body;

        if (!assignmentId || !studentId) {
            return res.status(400).json({ error: "Required fields missing" });
        }

        // Check if student already submitted - if yes, overwrite/update, otherwise insert
        const existing = await db
            .select()
            .from(submissions)
            .where(and(eq(submissions.assignmentId, assignmentId), eq(submissions.studentId, studentId)));

        let result;
        if (existing.length > 0) {
            [result] = await db
                .update(submissions)
                .set({
                    fileUrl,
                    textContent,
                    status: "submitted",
                    submittedAt: new Date()
                })
                .where(eq(submissions.id, existing[0].id))
                .returning();
        } else {
            [result] = await db
                .insert(submissions)
                .values({
                    assignmentId,
                    studentId,
                    fileUrl,
                    textContent,
                    status: "submitted"
                })
                .returning();
        }

        res.status(201).json({ data: result });
    } catch (e) {
        console.error(`POST submission error: ${e}`);
        res.status(500).json({ error: "Failed to upload submission" });
    }
});

// Grade a student submission (Teacher only)
router.put("/submissions/:submissionId/grade", async (req, res) => {
    try {
        const submissionId = Number(req.params.submissionId);
        const { grade, feedback } = req.body;

        if (!submissionId) return res.status(400).json({ error: "Invalid Submission ID" });

        const [graded] = await db
            .update(submissions)
            .set({
                grade: Number(grade),
                feedback,
                status: "graded"
            })
            .where(eq(submissions.id, submissionId))
            .returning();

        res.status(200).json({ data: graded });
    } catch (e) {
        console.error(`PUT grade error: ${e}`);
        res.status(500).json({ error: "Failed to save grade" });
    }
});

// ==========================================
// MATERIALS / RESOURCE SHARING
// ==========================================

// Get study materials for a class
router.get("/classes/:classId/materials", async (req, res) => {
    try {
        const classId = Number(req.params.classId);
        if (!classId) return res.status(400).json({ error: "Invalid Class ID" });

        const materialsList = await db
            .select()
            .from(materials)
            .where(eq(materials.classId, classId))
            .orderBy(desc(materials.id));

        res.status(200).json({ data: materialsList });
    } catch (e) {
        console.error(`GET materials error: ${e}`);
        res.status(500).json({ error: "Failed to load materials" });
    }
});

// Upload new study material
router.post("/classes/:classId/materials", async (req, res) => {
    try {
        const classId = Number(req.params.classId);
        const { title, fileUrl, fileType } = req.body;

        if (!classId || !title || !fileUrl) {
            return res.status(400).json({ error: "Required fields missing" });
        }

        const [newMaterial] = await db
            .insert(materials)
            .values({
                classId,
                title,
                fileUrl,
                fileType: fileType || "pdf"
            })
            .returning();

        res.status(201).json({ data: newMaterial });
    } catch (e) {
        console.error(`POST material error: ${e}`);
        res.status(500).json({ error: "Failed to publish material" });
    }
});

export default router;
