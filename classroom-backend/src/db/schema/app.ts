import {
    integer,
    jsonb,
    pgEnum,
    pgTable,
    text,
    timestamp,
    unique,
    varchar,
    index,
    primaryKey
} from "drizzle-orm/pg-core";
import {relations} from "drizzle-orm";
import {user} from "./auth.js";

export const classStatusEnum = pgEnum('class_status', ['active', 'inactive', 'archived']);

const timestamps = {
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull()
}

export const departments = pgTable('departments', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    code: varchar('code', {length: 50}).notNull().unique(),
    name: varchar('name', {length: 255}).notNull(),
    description: varchar('description', {length: 255}),
    ...timestamps
});

export const subjects = pgTable('subjects', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    departmentId: integer('department_id').notNull().references(() => departments.id, { onDelete: 'restrict' }),
    name: varchar('name', {length: 255}).notNull(),
    code: varchar('code', {length: 50}).notNull().unique(),
    description: varchar('description', {length: 255}),
    ...timestamps
});

export const classes = pgTable('classes', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    subjectId: integer('subject_id').notNull().references(() => subjects.id, { onDelete: 'cascade' }),
    teacherId: text('teacher_id').notNull().references(() => user.id, { onDelete: 'restrict' }),
    inviteCode: text('invite_code').notNull().unique(),
    name: varchar('name', {length: 255}).notNull(),
    bannerCldPubId: text('banner_cld_pub_id'),
    bannerUrl: text('banner_url'),
    description: text('description'),
    capacity: integer('capacity').default(50).notNull(),
    status: classStatusEnum('status').default('active').notNull(),
    schedules: jsonb('schedules').$type<any[]>().default([]).notNull(),
    ...timestamps
}, (table) => [
    index('classes_subject_id_idx').on(table.subjectId),
    index('classes_teacher_id_idx').on(table.teacherId),
]);

export const enrollments = pgTable('enrollments', {
    studentId: text('student_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    classId: integer('class_id').notNull().references(() => classes.id, { onDelete: 'cascade' }),
}, (table) => [
    primaryKey({ columns: [table.studentId, table.classId] }),
    unique('enrollments_student_id_class_id_unique').on(table.studentId, table.classId),
    index('enrollments_student_id_idx').on(table.studentId),
    index('enrollments_class_id_idx').on(table.classId),
]);

export const departmentRelations = relations(departments, ({ many }) => ({ subjects: many(subjects) }));

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
    department: one(departments, {
        fields: [subjects.departmentId],
        references: [departments.id],
    }),
    classes: many(classes)
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
    subject: one(subjects, {
        fields: [classes.subjectId],
        references: [subjects.id],
    }),
    teacher: one(user, {
        fields: [classes.teacherId],
        references: [user.id],
    }),
    enrollments: many(enrollments)
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
    student: one(user, {
        fields: [enrollments.studentId],
        references: [user.id],
    }),
    class: one(classes, {
        fields: [enrollments.classId],
        references: [classes.id],
    }),
}));

// --- LMS Extensions ---

export const announcements = pgTable('announcements', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    classId: integer('class_id').notNull().references(() => classes.id, { onDelete: 'cascade' }),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    ...timestamps
});

export const comments = pgTable('comments', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    announcementId: integer('announcement_id').notNull().references(() => announcements.id, { onDelete: 'cascade' }),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    ...timestamps
});

export const assignments = pgTable('assignments', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    classId: integer('class_id').notNull().references(() => classes.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description').notNull(),
    dueDate: timestamp('due_date').notNull(),
    maxPoints: integer('max_points').default(100).notNull(),
    ...timestamps
});

export const submissions = pgTable('submissions', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    assignmentId: integer('assignment_id').notNull().references(() => assignments.id, { onDelete: 'cascade' }),
    studentId: text('student_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    fileUrl: text('file_url'),
    textContent: text('text_content'),
    grade: integer('grade'),
    feedback: text('feedback'),
    status: varchar('status', { length: 50 }).default('submitted').notNull(),
    ...timestamps
});

export const materials = pgTable('materials', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    classId: integer('class_id').notNull().references(() => classes.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    fileUrl: text('file_url').notNull(),
    fileType: varchar('file_type', { length: 50 }).default('pdf').notNull(),
    ...timestamps
});

// --- LMS Relations ---

export const announcementsRelations = relations(announcements, ({ one, many }) => ({
    class: one(classes, {
        fields: [announcements.classId],
        references: [classes.id],
    }),
    author: one(user, {
        fields: [announcements.userId],
        references: [user.id],
    }),
    comments: many(comments)
}));

export const commentsRelations = relations(comments, ({ one }) => ({
    announcement: one(announcements, {
        fields: [comments.announcementId],
        references: [announcements.id],
    }),
    author: one(user, {
        fields: [comments.userId],
        references: [user.id],
    }),
}));

export const assignmentsRelations = relations(assignments, ({ one, many }) => ({
    class: one(classes, {
        fields: [assignments.classId],
        references: [classes.id],
    }),
    submissions: many(submissions)
}));

export const submissionsRelations = relations(submissions, ({ one }) => ({
    assignment: one(assignments, {
        fields: [submissions.assignmentId],
        references: [assignments.id],
    }),
    student: one(user, {
        fields: [submissions.studentId],
        references: [user.id],
    }),
}));

export const materialsRelations = relations(materials, ({ one }) => ({
    class: one(classes, {
        fields: [materials.classId],
        references: [classes.id],
    }),
}));

export type Department = typeof departments.$inferSelect;
export type NewDepartment = typeof departments.$inferInsert;

export type Subject = typeof subjects.$inferSelect;
export type NewSubject = typeof subjects.$inferInsert;

export type Class = typeof classes.$inferSelect;
export type NewClass = typeof classes.$inferInsert;

export type Enrollment = typeof enrollments.$inferSelect;
export type NewEnrollment = typeof enrollments.$inferInsert;

export type Announcement = typeof announcements.$inferSelect;
export type NewAnnouncement = typeof announcements.$inferInsert;

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;

export type Assignment = typeof assignments.$inferSelect;
export type NewAssignment = typeof assignments.$inferInsert;

export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;

export type Material = typeof materials.$inferSelect;
export type NewMaterial = typeof materials.$inferInsert;

