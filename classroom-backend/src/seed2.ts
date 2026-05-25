import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, sql as drizzleSql } from "drizzle-orm";
import { departments, subjects, classes } from "./db/schema/app.js";
import { user } from "./db/schema/auth.js";
import { randomUUID } from "crypto";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not defined");
const sqlClient = neon(process.env.DATABASE_URL);
const db = drizzle(sqlClient);

// ----------------------------------------------------------------
// 50 Indian Faculty Members
// ----------------------------------------------------------------
const FACULTY_LIST = [
  { name: "Dr. Rajesh Kumar Sharma",    email: "rajesh.sharma@iit.ac.in" },
  { name: "Prof. Ananya Krishnamurthy", email: "ananya.krish@iit.ac.in" },
  { name: "Dr. Vikram Nair",            email: "vikram.nair@iit.ac.in" },
  { name: "Prof. Sunita Agarwal",       email: "sunita.agarwal@iit.ac.in" },
  { name: "Dr. Arjun Mehta",            email: "arjun.mehta@iit.ac.in" },
  { name: "Dr. Priya Venkataraman",     email: "priya.venkat@iit.ac.in" },
  { name: "Prof. Suresh Babu Iyer",     email: "suresh.iyer@iit.ac.in" },
  { name: "Dr. Kavitha Ramachandran",   email: "kavitha.rama@iit.ac.in" },
  { name: "Prof. Mohan Lal Gupta",      email: "mohan.gupta@iit.ac.in" },
  { name: "Dr. Deepa Srinivasan",       email: "deepa.srini@iit.ac.in" },
  { name: "Prof. Sanjay Kulkarni",      email: "sanjay.kulkarni@iit.ac.in" },
  { name: "Dr. Ramesh Chandra Pandey",  email: "ramesh.pandey@iit.ac.in" },
  { name: "Prof. Meena Joshi",          email: "meena.joshi@iit.ac.in" },
  { name: "Dr. Anil Kumar Verma",       email: "anil.verma@iit.ac.in" },
  { name: "Prof. Geeta Rao",            email: "geeta.rao@iit.ac.in" },
  { name: "Dr. Nandita Bose",           email: "nandita.bose@iit.ac.in" },
  { name: "Prof. Harish Chandra Dixit", email: "harish.dixit@iit.ac.in" },
  { name: "Dr. Swati Mishra",           email: "swati.mishra@iit.ac.in" },
  { name: "Prof. Praveen Tripathi",     email: "praveen.tripathi@iit.ac.in" },
  { name: "Dr. Asha Gokhale",           email: "asha.gokhale@iit.ac.in" },
  { name: "Prof. Santosh Desai",        email: "santosh.desai@iit.ac.in" },
  { name: "Dr. Lalitha Subramanian",    email: "lalitha.subra@iit.ac.in" },
  { name: "Prof. Shyam Sundar Trivedi", email: "shyam.trivedi@iit.ac.in" },
  { name: "Dr. Pooja Chatterjee",       email: "pooja.chatt@iit.ac.in" },
  { name: "Prof. Madhavan Pillai",      email: "madhavan.pillai@iit.ac.in" },
  { name: "Dr. Balaji Narasimhan",      email: "balaji.nara@iit.ac.in" },
  { name: "Prof. Rekha Saxena",         email: "rekha.saxena@iit.ac.in" },
  { name: "Dr. Dinesh Kumar Yadav",     email: "dinesh.yadav@iit.ac.in" },
  { name: "Prof. Usha Rajan",           email: "usha.rajan@iit.ac.in" },
  { name: "Dr. Kiran Malhotra",         email: "kiran.malhotra@iit.ac.in" },
  { name: "Prof. Sunil Bhatt",          email: "sunil.bhatt@iit.ac.in" },
  { name: "Dr. Nalini Murthy",          email: "nalini.murthy@iit.ac.in" },
  { name: "Prof. Girish Chandra",       email: "girish.chandra@iit.ac.in" },
  { name: "Dr. Vandana Tiwari",         email: "vandana.tiwari@iit.ac.in" },
  { name: "Prof. Ravi Shankar Dubey",   email: "ravi.dubey@iit.ac.in" },
  { name: "Dr. Anjali Chaudhary",       email: "anjali.chaudh@iit.ac.in" },
  { name: "Prof. Naresh Prasad",        email: "naresh.prasad@iit.ac.in" },
  { name: "Dr. Smita Patil",            email: "smita.patil@iit.ac.in" },
  { name: "Prof. Bhavesh Shah",         email: "bhavesh.shah@iit.ac.in" },
  { name: "Dr. Lakshmi Narayan",        email: "lakshmi.narayan@iit.ac.in" },
  { name: "Prof. Mukesh Jain",          email: "mukesh.jain@iit.ac.in" },
  { name: "Dr. Sarala Devi",            email: "sarala.devi@iit.ac.in" },
  { name: "Prof. Hemant Bhatnagar",     email: "hemant.bhat@iit.ac.in" },
  { name: "Dr. Veena Krishnaswamy",     email: "veena.krish@iit.ac.in" },
  { name: "Prof. Ajay Choudhuri",       email: "ajay.choudh@iit.ac.in" },
  { name: "Dr. Chitra Sundarajan",      email: "chitra.sundar@iit.ac.in" },
  { name: "Prof. Mahesh Kamath",        email: "mahesh.kamath@iit.ac.in" },
  { name: "Dr. Padma Iyer",             email: "padma.iyer@iit.ac.in" },
  { name: "Prof. Ranjit Singh Bedi",    email: "ranjit.bedi@iit.ac.in" },
  { name: "Dr. Anu Sharma",             email: "anu.sharma@iit.ac.in" },
];

// ----------------------------------------------------------------
// 9 AM to 5 PM Period Definitions (Mon–Sat)
// 7 periods on weekdays, 4 on Saturday
// ----------------------------------------------------------------
type DayKey = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";

const PERIODS: Record<DayKey, [string, string][]> = {
  Monday:    [["09:00","10:00"],["10:00","11:00"],["11:15","12:15"],["12:15","13:15"],["14:00","15:00"],["15:00","16:00"],["16:00","17:00"]],
  Tuesday:   [["09:00","10:00"],["10:00","11:00"],["11:15","12:15"],["12:15","13:15"],["14:00","15:00"],["15:00","16:00"],["16:00","17:00"]],
  Wednesday: [["09:00","10:00"],["10:00","11:00"],["11:15","12:15"],["12:15","13:15"],["14:00","15:00"],["15:00","16:00"],["16:00","17:00"]],
  Thursday:  [["09:00","10:00"],["10:00","11:00"],["11:15","12:15"],["12:15","13:15"],["14:00","15:00"],["15:00","16:00"],["16:00","17:00"]],
  Friday:    [["09:00","10:00"],["10:00","11:00"],["11:15","12:15"],["12:15","13:15"],["14:00","15:00"],["15:00","16:00"],["16:00","17:00"]],
  Saturday:  [["09:00","10:00"],["10:00","11:00"],["11:15","12:15"],["12:15","13:15"]],
};

// Each class runs 3 days/week. Two meeting patterns alternate.
// Pattern A: Mon, Wed, Fri   — slots 0,2,4,6 (period index 0-6)
// Pattern B: Tue, Thu, Sat   — slots 1,3,5
function buildSchedule(subjectIndex: number) {
  const patternDays: DayKey[][] = [
    ["Monday", "Wednesday", "Friday"],
    ["Tuesday", "Thursday", "Saturday"],
  ];
  const pattern = patternDays[subjectIndex % 2];
  const periodIdx = Math.floor(subjectIndex / 2) % 7;
  return pattern.map((day) => {
    const slots = PERIODS[day];
    const slot = slots[Math.min(periodIdx, slots.length - 1)];
    return { day, startTime: slot[0], endTime: slot[1] };
  });
}

function makeCode(): string {
  return Math.random().toString(36).slice(2, 9).toUpperCase();
}

// ----------------------------------------------------------------
// MAIN SEED
// ----------------------------------------------------------------
async function seed() {
  console.log("\nStarting full institutional seed...\n");

  // Step 1: Seed 50 faculty
  console.log("1. Seeding 50 faculty members...");
  const seededTeacherIds: string[] = [];

  for (const f of FACULTY_LIST) {
    const uid = randomUUID();
    const [inserted] = await db
      .insert(user)
      .values({ id: uid, name: f.name, email: f.email, role: "teacher", emailVerified: true })
      .onConflictDoNothing()
      .returning({ id: user.id });

    if (inserted) {
      seededTeacherIds.push(inserted.id);
    }
  }

  // Fetch all teachers from DB (in case some already existed)
  const allTeachers = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.role, "teacher"));

  const teacherIds = allTeachers.map((t) => t.id);
  console.log("   Faculty in DB: " + teacherIds.length);

  // Step 2: Ensure departments exist
  console.log("\n2. Ensuring departments are seeded...");
  const deptRows = [
    { code: "CSE",  name: "Computer Science and Engineering",          description: "Algorithms, software systems, AI, databases, and full-stack development." },
    { code: "ECE",  name: "Electronics and Communication Engineering", description: "Analog and digital circuits, signal processing, VLSI, communication systems." },
    { code: "ME",   name: "Mechanical Engineering",                    description: "Thermodynamics, fluid mechanics, manufacturing, robotics and automation." },
    { code: "BT",   name: "Biotechnology",                            description: "Genetic engineering, bioprocess technology, molecular biology, bioinformatics." },
    { code: "CHE",  name: "Chemical Engineering",                      description: "Chemical processes, reaction engineering, process control, materials science." },
    { code: "MATH", name: "Mathematics and Computing",                 description: "Applied mathematics, statistics, operations research, computational methods." },
    { code: "CE",   name: "Civil Engineering",                         description: "Structural analysis, construction, hydraulics, geotechnics, environmental." },
    { code: "EE",   name: "Electrical Engineering",                    description: "Power systems, machines, drives, renewable energy, smart grid." },
  ];

  for (const d of deptRows) {
    await db.insert(departments).values(d).onConflictDoNothing();
  }

  const allDepts = await db.select({ id: departments.id, code: departments.code }).from(departments);
  console.log("   Departments: " + allDepts.length);

  // Step 3: Fetch all subjects
  const allSubjects = await db.select({ id: subjects.id, departmentId: subjects.departmentId }).from(subjects);
  console.log("\n3. Subjects available: " + allSubjects.length);

  // Step 4: Create classes — one per subject, capacity 1500, with 9-5 timetable
  console.log("\n4. Creating classes with 9AM-5PM timetable (capacity: 1500 students)...");

  if (teacherIds.length === 0) {
    console.log("   ERROR: No teachers found in DB. Skipping class creation.");
    process.exit(1);
  }

  let classesCreated = 0;
  for (let i = 0; i < allSubjects.length; i++) {
    const subj = allSubjects[i];
    const teacherId = teacherIds[i % teacherIds.length];
    const schedule = buildSchedule(i);

    await db.insert(classes).values({
      subjectId: subj.id,
      teacherId,
      inviteCode: makeCode(),
      name: "Section A",
      capacity: 1500,
      status: "active",
      schedules: schedule,
      description: "Regular lecture session — 9 AM to 5 PM schedule.",
    }).onConflictDoNothing();

    classesCreated++;
  }

  console.log("   Classes created: " + classesCreated);

  console.log("\n================================================================");
  console.log("SEED COMPLETE — FULL INSTITUTIONAL DATA LOADED");
  console.log("================================================================");
  console.log("  Faculty      : " + teacherIds.length + " professors (capacity 50)");
  console.log("  Departments  : " + allDepts.length);
  console.log("  Subjects     : " + allSubjects.length);
  console.log("  Classes      : " + classesCreated + "  (1500 students each, 9AM-5PM timetable)");
  console.log("================================================================\n");
  console.log("Next:  npm run dev  then open http://localhost:5173");
  process.exit(0);
}

seed().catch((e) => {
  console.error("Seed error:", e);
  process.exit(1);
});
