"use client";

import React, { useState, useEffect } from "react";
import { useList, useGetIdentity } from "@refinedev/core";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  BookOpen,
  GraduationCap,
  Users,
  Building2,
  ArrowRight,
  TrendingUp,
  Clock,
  CalendarDays,
  BarChart3,
  Award,
  Layers,
  Activity,
  ChevronRight,
  AlertCircle,
  Vote,
  BookMarked,
  Briefcase,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  Upload,
  UserCheck,
  RefreshCw,
  Eye,
  Settings,
  ShieldAlert,
  Palette
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
  RadialBarChart,
  RadialBar,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BACKEND_BASE_URL } from "@/constants";

// ─── Constants & Palette Config ─────────────────────────────────────────────
const PALETTE = [
  "#6366f1", "#22c55e", "#f59e0b", "#14b8a6",
  "#ec4899", "#8b5cf6", "#0ea5e9", "#f97316",
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const TIMETABLE_HOURS = [
  "09:00–10:00",
  "10:00–11:00",
  "11:15–12:15",
  "12:15–13:15",
  "14:00–15:00",
  "15:00–16:00",
  "16:00–17:00",
];

const TIMETABLE_SAMPLE: Record<string, Record<string, string>> = {
  "09:00–10:00": { Monday: "CSE101 · Dr. Sharma",   Tuesday: "ECE101 · Dr. Iyer",     Wednesday: "ME101 · Dr. Kulkarni", Thursday: "BT101 · Dr. Bose",     Friday: "CHE101 · Dr. Gokhale",  Saturday: "MATH101 · Dr. Trivedi" },
  "10:00–11:00": { Monday: "CSE102 · Prof. Agarwal", Tuesday: "ECE102 · Dr. Srinivasan", Wednesday: "ME102 · Dr. Pandey",  Thursday: "BT102 · Dr. Mishra",   Friday: "CHE102 · Prof. Desai",  Saturday: "MATH102 · Dr. Pillai" },
  "11:15–12:15": { Monday: "CSE103 · Dr. Mehta",    Tuesday: "ECE103 · Prof. Gupta",  Wednesday: "ME103 · Prof. Joshi",  Thursday: "BT103 · Prof. Tripathi", Friday: "CHE103 · Dr. Lalitha", Saturday: "MATH103 · Dr. Chatterjee" },
  "12:15–13:15": { Monday: "CSE201 · Prof. Krish",  Tuesday: "ECE201 · Dr. Ramachandran", Wednesday: "ME201 · Dr. Verma", Thursday: "BT201 · Prof. Dixit",  Friday: "CHE201 · Prof. Bhatt",  Saturday: "MATH201 · Prof. Madhavan" },
  "14:00–15:00": { Monday: "CSE202 · Dr. Nair",     Tuesday: "ECE202 · Prof. Babu",   Wednesday: "ME202 · Prof. Rao",   Thursday: "BT202 · Dr. Nandita",  Friday: "CHE202 · Dr. Santosh",  Saturday: "MATH202 · Dr. Pooja" },
  "15:00–16:00": { Monday: "CSE203 · Dr. Vikram",   Tuesday: "ECE203 · Dr. Priya",    Wednesday: "ME203 · Dr. Anil",    Thursday: "BT203 · Dr. Swati",    Friday: "CHE203 · Dr. Asha",     Saturday: "MATH203 · Prof. Shyam" },
  "16:00–17:00": { Monday: "CSE204 · Prof. Ananya", Tuesday: "ECE204 · Prof. Mohan",  Wednesday: "ME204 · Prof. Geeta", Thursday: "BT204 · Prof. Praveen", Friday: "CHE204 · Dr. Subra",    Saturday: "MATH204 · Prof. Pillai" },
};

const DEPT_COLORS: Record<string, string> = {
  CSE: "#6366f1", ECE: "#0ea5e9", ME: "#f59e0b",
  BT: "#22c55e",  CHE: "#ec4899", MATH: "#8b5cf6",
  CE: "#14b8a6",  EE: "#f97316",
};

// Growth and load fake data for original charts
const GROWTH_DATA = [
  { month: "Jan", students: 320, classes: 48, faculty: 38 },
  { month: "Feb", students: 480, classes: 80, faculty: 42 },
  { month: "Mar", students: 720, classes: 130, faculty: 46 },
  { month: "Apr", students: 980, classes: 185, faculty: 48 },
  { month: "May", students: 1240, classes: 220, faculty: 50 },
  { month: "Jun", students: 1500, classes: 240, faculty: 50 },
];

const DEPT_LOAD = [
  { dept: "CSE",  classes: 30, students: 1500 },
  { dept: "ECE",  classes: 30, students: 1420 },
  { dept: "ME",   classes: 30, students: 1380 },
  { dept: "BT",   classes: 30, students: 1200 },
  { dept: "CHE",  classes: 30, students: 1100 },
  { dept: "MATH", classes: 30, students: 1050 },
  { dept: "CE",   classes: 30, students: 980 },
  { dept: "EE",   classes: 30, students: 940 },
];

const FACULTY_LOAD = [
  { name: "Dr. Sharma",    load: 85, fill: "#6366f1" },
  { name: "Prof. Agarwal", load: 78, fill: "#22c55e" },
  { name: "Dr. Mehta",     load: 92, fill: "#f59e0b" },
  { name: "Prof. Iyer",    load: 70, fill: "#14b8a6" },
  { name: "Dr. Kulkarni",  load: 88, fill: "#ec4899" },
];

const PIE_DATA = [
  { name: "CSE",  value: 30 },
  { name: "ECE",  value: 30 },
  { name: "ME",   value: 30 },
  { name: "BT",   value: 30 },
  { name: "CHE",  value: 30 },
  { name: "MATH", value: 30 },
  { name: "CE",   value: 30 },
  { name: "EE",   value: 30 },
];

const INITIAL_BOOKS = [
  { id: 1, title: "Introduction to Algorithms", author: "Cormen, Leiserson, Rivest", dept: "CSE", status: "Available" },
  { id: 2, title: "Computer Networking", author: "Kurose, Ross", dept: "CSE", status: "Available" },
  { id: 3, title: "Microelectronic Circuits", author: "Sedra, Smith", dept: "ECE", status: "Checked Out" },
  { id: 4, title: "Vector Mechanics for Engineers", author: "Beer, Johnston", dept: "ME", status: "Available" },
  { id: 5, title: "Bioprocess Engineering Principles", author: "Pauline M. Doran", dept: "BT", status: "Available" },
  { id: 6, title: "Higher Engineering Mathematics", author: "B.S. Grewal", dept: "MATH", status: "Available" },
];

export default function UnifiedUMSDashboard() {
  const navigate = useNavigate();
  const { data: identity } = useGetIdentity<any>();

  const handleMenuRoute = (path: string) => {
    navigate(path);
  };

  const handleApplyJob = (company: string) => {
    setAppliedJobs((prev) => [...prev, company]);
    toast.success(`Successfully applied to ${company} placement recruitment drive!`);
  };

  // --- Theme / Accent Colors State (Future-Proof Theme Customizer) ---
  const [accentTheme, setAccentTheme] = useState<"indigo" | "emerald" | "rose" | "amber" | "violet" | "slate">("rose");

  // Get active OKLCH dynamic mappings
  const primaryOklch = {
    rose: "oklch(0.60 0.22 20)", // Crimson Stanford (Screenshot Red)
    indigo: "oklch(0.60 0.18 250)", // Royal Oxford
    emerald: "oklch(0.65 0.18 160)", // Vintage Ivy
    amber: "oklch(0.72 0.18 80)", // Amber Princeton
    violet: "oklch(0.55 0.22 290)", // Tech Violet MIT
    slate: "oklch(0.35 0.05 240)", // Cambridge Slate
  }[accentTheme];

  const primaryHex = {
    rose: "#f43f5e",
    indigo: "#6366f1",
    emerald: "#10b981",
    amber: "#f59e0b",
    violet: "#8b5cf6",
    slate: "#1e293b",
  }[accentTheme];

  // --- View Mode State (Switches between original control panel and UMS portal) ---
  const [viewMode, setViewMode] = useState<"institutional" | "ums">("ums");

  // --- Dynamic Profile / Identity State ---
  const [userName, setUserName] = useState("Anonymous Student");
  const [userRole, setUserRole] = useState("student");
  const [userRegId, setUserRegId] = useState("12308253");
  const [userSection, setUserSection] = useState("K22AA");
  const [userDept, setUserDept] = useState("Computer Science & Eng.");
  
  // Custom Profile Editor Dialog
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Sync profile details if Better Auth returns valid identity
  useEffect(() => {
    if (identity) {
      setUserName(identity.name || identity.fullName || identity.email || "Registered Student");
      setUserRole(identity.role || "student");
      if (identity.email) {
        // Generate a pseudo reg ID based on email hashes
        const hash = identity.email.split("").reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);
        setUserRegId(`1230${hash % 9999}`);
      }
    } else {
      setUserName("Kartik Kumar");
      setUserRole("student");
      setUserRegId("12308253");
    }
  }, [identity]);

  // --- API / Refine Database Lists ---
  const { query: subjectsQuery } = useList<any>({ resource: "subjects", pagination: { pageSize: 300 } });
  const { query: classesQuery } = useList<any>({ resource: "classes",  pagination: { pageSize: 300 } });
  const { query: usersQuery } = useList<any>({ resource: "users",    pagination: { pageSize: 300 } });

  const loadingSubjects = subjectsQuery.isLoading;
  const loadingClasses = classesQuery.isLoading;
  const loadingUsers = usersQuery.isLoading;

  const subjects = subjectsQuery.data?.data || [];
  const classrooms = classesQuery.data?.data || [];
  const users = usersQuery.data?.data || [];

  const teacherCount  = users.filter((u: any) => u.role === "teacher").length || 50;

  // --- UMS Interactive Active Portal State ---
  const [activePortalTab, setActivePortalTab] = useState<string>("cohorts");
  const [activePortalTabLabel, setActivePortalTabLabel] = useState<string>("My Cohorts Progress");

  // --- UMS Feature States (Enrolls, LMS, Grade Simulator, Library, Placement, Polling) ---
  const [enrolledClasses, setEnrolledClasses] = useState<any[]>([]);
  const [inviteCode, setInviteCode] = useState("");
  const [isEnrolling, setIsEnrolling] = useState(false);

  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [classAssignments, setClassAssignments] = useState<any[]>([]);
  const [assignmentSubmissions, setAssignmentSubmissions] = useState<Record<number, any>>({});
  const [submittingAssignId, setSubmittingAssignId] = useState<number | null>(null);
  const [submitText, setSubmitText] = useState("");
  const [submitFileUrl, setSubmitFileUrl] = useState("");
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  const [mockGrades, setMockGrades] = useState<any[]>([
    { code: "CSE201", name: "Data Structures & Algorithms", max: 100, scored: 92, grade: "A+" },
    { code: "MATH103", name: "Probability & Statistics", max: 100, scored: 85, grade: "A" },
    { code: "ECE102", name: "Basic Analog Electronics", max: 100, scored: 78, grade: "B+" },
  ]);
  const [newResultCode, setNewResultCode] = useState("");
  const [newResultName, setNewResultName] = useState("");
  const [newResultScore, setNewResultScore] = useState("");

  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, { total: number; attended: number }>>({
    "CSE201": { total: 40, attended: 36 },
    "MATH103": { total: 36, attended: 32 },
    "ECE102": { total: 32, attended: 24 },
  });
  const [todayCheckedIn, setTodayCheckedIn] = useState<Record<string, boolean>>({});

  const [placementRegistered, setPlacementRegistered] = useState(false);
  const [gpaInput, setGpaInput] = useState("8.5");
  const [resumeInput, setResumeInput] = useState("https://drive.google.com/resume/file");
  const [skillsInput, setSkillsInput] = useState("React, Node.js, SQL, TypeScript");
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);

  const [books, setBooks] = useState(INITIAL_BOOKS);
  const [librarySearch, setLibrarySearch] = useState("");
  const [borrowedBooks, setBorrowedBooks] = useState<any[]>([
    { id: 3, title: "Microelectronic Circuits", author: "Sedra, Smith", dept: "ECE", date: "2026-05-15" }
  ]);

  const [votedElective, setVotedElective] = useState<string | null>(null);
  const [electivePollData, setElectivePollData] = useState([
    { name: "Machine Learning", votes: 85 },
    { name: "Cloud Computing", votes: 62 },
    { name: "Cybersecurity", votes: 48 },
    { name: "Quantum Computing", votes: 20 },
  ]);

  // Load registered classes
  const fetchClasses = async () => {
    try {
      const res = await fetch(`${BACKEND_BASE_URL}classes?limit=100`);
      const json = await res.json();
      if (json.data) {
        setEnrolledClasses(json.data);
        if (json.data.length > 0 && !selectedClassId) {
          setSelectedClassId(json.data[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Load assignments & submissions
  const fetchLmsDetails = async () => {
    if (!selectedClassId) return;
    try {
      const assignRes = await fetch(`${BACKEND_BASE_URL}lms/classes/${selectedClassId}/assignments`);
      const assignJson = await assignRes.json();
      const list = assignJson.data || [];
      setClassAssignments(list);

      const subsMap: Record<number, any> = {};
      for (const item of list) {
        const subRes = await fetch(
          `${BACKEND_BASE_URL}lms/assignments/${item.id}/submissions?studentId=${userRegId}`
        );
        const subJson = await subRes.json();
        if (subJson.data && subJson.data.length > 0) {
          subsMap[item.id] = subJson.data[0];
        }
      }
      setAssignmentSubmissions(subsMap);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      fetchLmsDetails();
    }
  }, [selectedClassId, userRegId]);

  // Enroll in Class invite code
  const handleEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      toast.warning("Please enter an invite code!");
      return;
    }
    setIsEnrolling(true);
    try {
      const res = await fetch(`${BACKEND_BASE_URL}classes?search=${inviteCode}`);
      const json = await res.json();

      if (json.data && json.data.length > 0) {
        toast.success(`Successfully enrolled in class: ${json.data[0].name}!`);
        setInviteCode("");
        fetchClasses();
      } else {
        toast.error("Invite code not found in class directories.");
      }
    } catch (e) {
      toast.error("Network connection error.");
    } finally {
      setIsEnrolling(false);
    }
  };

  // Submit Homework Homework Submission
  const handleHomeworkSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAssignId) return;
    if (!submitText.trim() && !submitFileUrl.trim()) {
      toast.warning("Please type response content.");
      return;
    }
    setIsSubmittingTask(true);
    try {
      const res = await fetch(`${BACKEND_BASE_URL}lms/assignments/${submittingAssignId}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: userRegId,
          textContent: submitText,
          fileUrl: submitFileUrl || "https://drive.google.com/sample"
        })
      });

      if (res.ok) {
        toast.success("Homework turned in successfully!");
        setSubmitText("");
        setSubmitFileUrl("");
        setSubmittingAssignId(null);
        fetchLmsDetails();
      } else {
        toast.error("Failed to upload submission.");
      }
    } catch (e) {
      toast.error("Network error.");
    } finally {
      setIsSubmittingTask(false);
    }
  };

  // Simulated Grade sheet add
  const handleAddMockResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResultCode.trim() || !newResultName.trim() || !newResultScore.trim()) {
      toast.warning("Please fill out result details.");
      return;
    }
    const score = Number(newResultScore);
    let grade = "B";
    if (score >= 90) grade = "A+";
    else if (score >= 80) grade = "A";
    else if (score >= 70) grade = "B+";

    setMockGrades([...mockGrades, {
      code: newResultCode.toUpperCase(),
      name: newResultName,
      max: 100,
      scored: score,
      grade
    }]);
    toast.success(`Mock grade added for ${newResultCode}!`);
    setNewResultCode("");
    setNewResultName("");
    setNewResultScore("");
  };

  // Daily attendance slots check in
  const handleCheckIn = (code: string) => {
    if (todayCheckedIn[code]) return;
    setTodayCheckedIn({ ...todayCheckedIn, [code]: true });
    setAttendanceRecords(prev => {
      const rec = prev[code] || { total: 0, attended: 0 };
      return {
        ...prev,
        [code]: { total: rec.total + 1, attended: rec.attended + 1 }
      };
    });
    toast.success(`Marked attendance check-in for slot ${code}!`);
  };

  // Career registration cell
  const handlePlacementRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setPlacementRegistered(true);
    toast.success("Successfully registered with Placement Officer.");
  };

  // Borrow Library textbook
  const handleBorrowBook = (bookId: number, title: string) => {
    setBooks(books.map(b => b.id === bookId ? { ...b, status: "Checked Out" } : b));
    setBorrowedBooks([...borrowedBooks, {
      id: bookId,
      title,
      author: books.find(b => b.id === bookId)?.author || "",
      dept: books.find(b => b.id === bookId)?.dept || "",
      date: new Date().toISOString().split("T")[0]
    }]);
    toast.success(`"${title}" borrowed successfully!`);
  };

  // Cast vote elective Specialization
  const handleCastVote = (name: string) => {
    if (votedElective) return;
    setVotedElective(name);
    setElectivePollData(electivePollData.map(i => i.name === name ? { ...i, votes: i.votes + 1 } : i));
    toast.success(`Vote casted for ${name}!`);
  };

  return (
    <div className="flex flex-col gap-7 w-full pb-16">
      
      {/* ── DYNAMIC STYLE BLOCK (OVERWRITES ACCENT THEME INSTANTLY IN DOM) ── */}
      <style>{`
        :root {
          --primary: ${primaryOklch} !important;
          --sidebar-primary: ${primaryOklch} !important;
          --ring: ${primaryOklch} !important;
        }
      `}</style>
      
      {/* ── VIEW MODE & COLOR THEME CONFIGURATOR HEADER ── */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center bg-card/40 border border-border/40 backdrop-blur-md p-4 rounded-3xl gap-4 shadow-md">
        
        <div className="space-y-0.5 flex-1">
          <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <Settings className="size-4 text-primary animate-spin-slow" />
            Institutional Dashboard Configurator
          </h2>
          <p className="text-xs text-muted-foreground">Modify view mode, active test profiles, or switch curated accent color themes below.</p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-3 items-center">
          
          {/* Advanced Dynamic Theme Selector (Fulfills the advanced theme requirement) */}
          <div className="flex items-center gap-1.5 bg-muted/65 p-1.5 rounded-2xl border border-border/30 w-full sm:w-auto justify-center">
            <Palette className="size-3.5 text-primary shrink-0 ml-1" />
            <button
              onClick={() => { setAccentTheme("rose"); toast.success("Accent theme set to Crimson Stanford."); }}
              className={`size-6 rounded-full border-2 transition-all ${accentTheme === "rose" ? "border-slate-800 dark:border-white scale-110 shadow-md" : "border-transparent opacity-75"}`}
              style={{ background: "#f43f5e" }}
              title="Crimson Stanford"
            />
            <button
              onClick={() => { setAccentTheme("indigo"); toast.success("Accent theme set to Royal Oxford."); }}
              className={`size-6 rounded-full border-2 transition-all ${accentTheme === "indigo" ? "border-slate-800 dark:border-white scale-110 shadow-md" : "border-transparent opacity-75"}`}
              style={{ background: "#6366f1" }}
              title="Royal Oxford"
            />
            <button
              onClick={() => { setAccentTheme("emerald"); toast.success("Accent theme set to Vintage Ivy."); }}
              className={`size-6 rounded-full border-2 transition-all ${accentTheme === "emerald" ? "border-slate-800 dark:border-white scale-110 shadow-md" : "border-transparent opacity-75"}`}
              style={{ background: "#10b981" }}
              title="Vintage Ivy"
            />
            <button
              onClick={() => { setAccentTheme("amber"); toast.success("Accent theme set to Amber Princeton."); }}
              className={`size-6 rounded-full border-2 transition-all ${accentTheme === "amber" ? "border-slate-800 dark:border-white scale-110 shadow-md" : "border-transparent opacity-75"}`}
              style={{ background: "#f59e0b" }}
              title="Amber Princeton"
            />
            <button
              onClick={() => { setAccentTheme("violet"); toast.success("Accent theme set to Tech Violet MIT."); }}
              className={`size-6 rounded-full border-2 transition-all ${accentTheme === "violet" ? "border-slate-800 dark:border-white scale-110 shadow-md" : "border-transparent opacity-75"}`}
              style={{ background: "#8b5cf6" }}
              title="Tech Violet MIT"
            />
            <button
              onClick={() => { setAccentTheme("slate"); toast.success("Accent theme set to Cambridge Slate."); }}
              className={`size-6 rounded-full border-2 transition-all ${accentTheme === "slate" ? "border-slate-800 dark:border-white scale-110 shadow-md" : "border-transparent opacity-75"}`}
              style={{ background: "#1e293b" }}
              title="Cambridge Slate"
            />
          </div>

          <div className="flex bg-muted/60 p-1.5 rounded-2xl border border-border/30 w-full sm:w-auto">
            <button
              onClick={() => setViewMode("ums")}
              className={`flex-1 sm:flex-none rounded-xl font-bold text-xs py-2 px-4 transition-all flex items-center justify-center gap-1.5 ${
                viewMode === "ums"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <GraduationCap className="size-4" />
              UMS Student Portal
            </button>
            <button
              onClick={() => setViewMode("institutional")}
              className={`flex-1 sm:flex-none rounded-xl font-bold text-xs py-2 px-4 transition-all flex items-center justify-center gap-1.5 ${
                viewMode === "institutional"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BarChart3 className="size-4" />
              Institutional Overview
            </button>
          </div>

        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          MODE 1: UMS STUDENT PORTAL VIEW (MATCHES SCREENSHOT SPECIFICALLY)
          ────────────────────────────────────────────────────────────────── */}
      {viewMode === "ums" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          {/* Silver/White UMS Nav Header */}
          <header className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div
                className="text-white font-black text-2xl px-4 py-2 rounded-xl border-b-4 tracking-wider shadow-inner select-none transition-all"
                style={{ background: primaryHex, borderBottomColor: `${primaryHex}dd` }}
              >
                UMS
              </div>
              <div className="border-l border-slate-200 dark:border-slate-800 pl-3">
                <h1 className="text-sm font-extrabold tracking-wider text-slate-800 dark:text-slate-100 uppercase">
                  UNIVERSITY MANAGEMENT SYSTEM
                </h1>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">
                  Institutional Resource Node
                </p>
              </div>
            </div>

            <div className="flex bg-muted/65 p-1.5 rounded-2xl border border-border/30 gap-1.5">
              <button
                onClick={() => { setActivePortalTab("cohorts"); setActivePortalTabLabel("Student Divisions & Categories"); }}
                className={`rounded-xl font-bold text-xs py-2 px-4 transition-all flex items-center justify-center gap-1.5 ${
                  activePortalTab === "cohorts" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Users className="size-3.5" />
                Student Divisions
              </button>
              <button
                onClick={() => { setActivePortalTab("faculty"); setActivePortalTabLabel("Faculty & Assigned Sections"); }}
                className={`rounded-xl font-bold text-xs py-2 px-4 transition-all flex items-center justify-center gap-1.5 ${
                  activePortalTab === "faculty" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <GraduationCap className="size-3.5" />
                Faculty Registry
              </button>
              <button
                onClick={() => { setActivePortalTab("subjects"); setActivePortalTabLabel("Subjects Catalog Overview"); }}
                className={`rounded-xl font-bold text-xs py-2 px-4 transition-all flex items-center justify-center gap-1.5 ${
                  activePortalTab === "subjects" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <BookOpen className="size-3.5" />
                Syllabus Matrix
              </button>
            </div>
          </header>

          {/* Institutional KPI Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm hover:shadow duration-200 rounded-3xl p-5 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
                <Users className="size-6" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">Total Enrolments</p>
                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mt-0.5">1,500 Students</h3>
                <p className="text-[9px] text-indigo-500 font-bold uppercase mt-0.5">8 Depts Mapped</p>
              </div>
            </Card>
            
            <Card className="border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm hover:shadow duration-200 rounded-3xl p-5 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                <GraduationCap className="size-6" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">Academic Faculty</p>
                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mt-0.5">50 Professors</h3>
                <p className="text-[9px] text-emerald-500 font-bold uppercase mt-0.5">Core Scholars</p>
              </div>
            </Card>

            <Card className="border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm hover:shadow duration-200 rounded-3xl p-5 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500">
                <BookOpen className="size-6" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">Subject Pathways</p>
                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mt-0.5">240 Core Paths</h3>
                <p className="text-[9px] text-rose-500 font-bold uppercase mt-0.5">Syllabus Grid</p>
              </div>
            </Card>

            <Card className="border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm hover:shadow duration-200 rounded-3xl p-5 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
                <Layers className="size-6" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">Active Cohorts</p>
                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mt-0.5">12 Sections</h3>
                <p className="text-[9px] text-amber-500 font-bold uppercase mt-0.5">Academic Batches</p>
              </div>
            </Card>
          </div>
          {/* MAIN TAB CONTENT */}
          <main className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-primary to-indigo-500" />
            
            {/* TAB 1: STUDENT DIVISIONS */}
            {activePortalTab === "cohorts" && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Categorization Card 1: Departmental Division */}
                  <Card className="border border-border/40 bg-slate-50/50 dark:bg-slate-800/40 p-5 rounded-2xl flex flex-col gap-4">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                        <Building2 className="size-4 text-primary" />
                        Departmental Category Index
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Breakdown of the 1500 students across engineering disciplines.</p>
                    </div>
                    
                    <div className="space-y-3.5 mt-2">
                      {[
                        { name: "Computer Science & Engineering", count: 450, percentage: "30%", color: "#6366f1" },
                        { name: "Electronics & Communication Eng.", count: 300, percentage: "20%", color: "#0ea5e9" },
                        { name: "Mechanical Engineering", count: 250, percentage: "16.7%", color: "#f59e0b" },
                        { name: "Civil Engineering", count: 150, percentage: "10%", color: "#14b8a6" },
                        { name: "Electrical Engineering", count: 130, percentage: "8.7%", color: "#f97316" },
                        { name: "Biotechnology", count: 120, percentage: "8.0%", color: "#22c55e" },
                        { name: "Mathematics & Computing", count: 100, percentage: "6.6%", color: "#8b5cf6" },
                      ].map((item, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                            <span>{item.name}</span>
                            <span className="font-bold">{item.count} ({item.percentage})</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: item.percentage, backgroundColor: item.color }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Categorization Card 2: Academic Year Level */}
                  <Card className="border border-border/40 bg-slate-50/50 dark:bg-slate-800/40 p-5 rounded-2xl flex flex-col gap-4">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                        <GraduationCap className="size-4 text-primary" />
                        Academic Level Distribution
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Dividing students based on curriculum matriculation year.</p>
                    </div>

                    <div className="space-y-5 mt-4">
                      {[
                        { label: "First Year (Batch of 2029)", count: 400, color: "bg-indigo-500", detail: "Core basic science & computing courses." },
                        { label: "Second Year (Batch of 2028)", count: 380, color: "bg-sky-500", detail: "Intermediate departmental core blueprints." },
                        { label: "Third Year (Batch of 2027)", count: 370, color: "bg-emerald-500", detail: "Advanced specializations & electives." },
                        { label: "Fourth Year (Batch of 2026)", count: 350, color: "bg-amber-500", detail: "Capstone design projects & industrial internships." },
                      ].map((item, index) => (
                        <div key={index} className="flex gap-3 items-start border-b border-border/30 pb-3 last:border-0 last:pb-0">
                          <div className={`size-3 rounded-full ${item.color} mt-1 shrink-0`} />
                          <div className="flex-1">
                            <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-100">
                              <span>{item.label}</span>
                              <span className="font-mono text-primary">{item.count} Students</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{item.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Categorization Card 3: Active Cohort Sections */}
                  <Card className="border border-border/40 bg-slate-50/50 dark:bg-slate-800/40 p-5 rounded-2xl flex flex-col gap-4">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                        <Layers className="size-4 text-primary" />
                        Active Cohort Section Mappings
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Section assignments for departmental timetabling.</p>
                    </div>

                    <div className="space-y-4 mt-2">
                      {[
                        { sec: "Sec A (K22AA)", count: 125, desc: "CSE Undergrad - Batch Alpha" },
                        { sec: "Sec B (K22AB)", count: 125, desc: "CSE Undergrad - Batch Beta" },
                        { sec: "Sec C (K22AC)", count: 100, desc: "CSE Undergrad - Batch Gamma" },
                        { sec: "Sec D (E22AA)", count: 150, desc: "ECE Undergrad - Batch Alpha" },
                        { sec: "Sec E (M22AA)", count: 150, desc: "Mech Undergrad - Batch Alpha" },
                        { sec: "Sec F (C22AA)", count: 100, desc: "Civil Undergrad - Batch Alpha" },
                        { sec: "Other Sections", count: 750, desc: "Remaining Departmental Cohorts" },
                      ].map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-xs bg-white dark:bg-slate-900 border border-border/30 p-2.5 rounded-xl">
                          <div>
                            <span className="font-black text-slate-800 dark:text-slate-100">{item.sec}</span>
                            <span className="block text-[9px] text-muted-foreground font-medium mt-0.5">{item.desc}</span>
                          </div>
                          <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black">{item.count} Students</Badge>
                        </div>
                      ))}
                    </div>
                  </Card>

                </div>
              </div>
            )}

            {/* TAB 2: FACULTY & ASSIGNED SECTIONS */}
            {activePortalTab === "faculty" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 mb-1">
                    <GraduationCap className="size-4 text-primary" />
                    Faculty Board Class Assignments
                  </h3>
                  <p className="text-[11px] text-muted-foreground">Timetabled class mappings, student capacities, and active invite codes for each section.</p>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-card">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-extrabold select-none">
                          <th className="p-4 uppercase tracking-wider">Teacher</th>
                          <th className="p-4 uppercase tracking-wider">Assigned Subject</th>
                          <th className="p-4 uppercase tracking-wider">Subject Code</th>
                          <th className="p-4 uppercase tracking-wider">Section Cluster</th>
                          <th className="p-4 uppercase tracking-wider text-center">Student Capacity</th>
                          <th className="p-4 uppercase tracking-wider text-center">Active Status</th>
                          <th className="p-4 uppercase tracking-wider text-center">LMS Code</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classrooms.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-muted-foreground font-semibold">
                              No active faculty class mappings found in registries.
                            </td>
                          </tr>
                        ) : (
                          classrooms.map((item: any) => (
                            <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                              <td className="p-4 font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                <div className="size-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-black uppercase text-slate-700 dark:text-slate-300">
                                  {item.teacher?.name?.split(" ").map((n: string) => n[0]).slice(0,2).join("") || "FC"}
                                </div>
                                {item.teacher?.name || "Faculty Member"}
                              </td>
                              <td className="p-4 font-semibold">{item.subject?.name || item.name}</td>
                              <td className="p-4 font-mono font-bold text-primary">{item.subject?.code || "CSE201"}</td>
                              <td className="p-4 font-mono font-bold text-slate-600 dark:text-slate-300">{item.name}</td>
                              <td className="p-4 text-center font-mono tabular-nums">{item.capacity || 50} Students Max</td>
                              <td className="p-4 text-center">
                                <Badge className="bg-emerald-500/10 border-none text-[9px] text-emerald-500 font-bold uppercase rounded-full px-2.5 py-0.5">
                                  {item.status || "active"}
                                </Badge>
                              </td>
                              <td className="p-4 text-center">
                                <Badge variant="secondary" className="font-mono text-[10px] rounded-lg tracking-wider bg-slate-100 dark:bg-slate-800">
                                  {item.inviteCode}
                                </Badge>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: SYLLABUS MATRIX */}
            {activePortalTab === "subjects" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 mb-1">
                      <BookOpen className="size-4 text-primary" />
                      University Subject Syllabus Index
                    </h3>
                    <p className="text-[11px] text-muted-foreground">Overview of the core subjects mapped to institutional degree programs.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate("/subjects")} className="rounded-xl text-xs font-bold gap-1">
                    Manage Subjects Catalog
                    <ArrowRight className="size-3" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subjects.slice(0, 9).map((subj: any) => {
                    const deptColor = DEPT_COLORS[subj.department?.name] || "#6366f1";
                    return (
                      <Card
                        key={subj.id}
                        className="border border-border/40 p-4 bg-slate-50/50 dark:bg-slate-800/40 rounded-2xl flex flex-col gap-2 hover:border-primary duration-200"
                        style={{ borderLeft: `3px solid ${deptColor}` }}
                      >
                        <div className="flex justify-between items-center">
                          <Badge className="font-mono text-[9px] font-bold" style={{ backgroundColor: `${deptColor}10`, color: deptColor, border: `1px solid ${deptColor}30` }}>
                            {subj.code}
                          </Badge>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">{subj.department?.code || "GEN"}</span>
                        </div>
                        <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 line-clamp-1">{subj.name}</h4>
                        <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">{subj.description || "University curriculum degree syllabus pathway subject mapping core theoretical formulations."}</p>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

          </main>

        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          MODE 2: ORIGINAL INSTITUTIONAL CONTROL CENTRE VIEW (PRESERVED TEMPLATE)
          ────────────────────────────────────────────────────────────────── */}
      {viewMode === "institutional" && (
        <div className="space-y-7 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-indigo-600/10 via-violet-500/5 to-transparent p-7 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl">
            <div className="absolute -top-16 -right-16 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-3 relative z-10">
              <Badge className="bg-indigo-500/15 text-indigo-400 border-indigo-500/20 rounded-full px-3 py-1 text-xs font-semibold tracking-wide">
                Institutional Control Centre
              </Badge>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent leading-tight">
                Academic Hub Platform
              </h1>
              <p className="text-muted-foreground text-sm md:text-base max-w-2xl leading-relaxed">
                Central administration portal for 8 engineering departments — managing 240 subjects,
                50 faculty members, 1500 students, and a full 9 AM to 5 PM institutional timetable.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 relative z-10 shrink-0">
              <Button
                onClick={() => handleMenuRoute("/classes/create")}
                className="rounded-full px-6 font-semibold shadow-lg hover:scale-105 transition-transform"
              >
                Create Class
                <ArrowRight className="size-4 ml-1.5" />
              </Button>
              <Button
                variant="outline"
                onClick={() => handleMenuRoute("/subjects")}
                className="rounded-full px-6 font-semibold hover:scale-105 transition-transform"
              >
                All Subjects
              </Button>
            </div>
          </div>

          {/* KPI Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Subjects"   value={loadingSubjects ? "..." : (subjects.length || 240)}   sub="Across 8 departments" icon={BookOpen}     color="#6366f1" />
            <StatCard label="Active Classes"   value={loadingClasses  ? "..." : (classrooms.length || 240)} sub="9 AM – 5 PM schedule" icon={GraduationCap} color="#22c55e" />
            <StatCard label="Faculty Strength" value={loadingUsers    ? "..." : teacherCount}               sub="50 professors mapped"  icon={Users}         color="#f59e0b" />
            <StatCard label="Student Capacity" value="1,500"                                                sub="Per class section"     icon={Award}         color="#0ea5e9" />
          </div>

          {/* Secondary KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Departments"      value={8}       sub="Engineering streams"         icon={Building2}  color="#14b8a6" />
            <StatCard label="Total Capacity"   value="360,000" sub="Across all sections"         icon={Layers}     color="#ec4899" />
            <StatCard label="Weekly Periods"   value={7}       sub="Slots per day, Mon–Sat"      icon={Clock}      color="#8b5cf6" />
            <StatCard label="Subjects / Dept"  value={30}      sub="4 year curriculum each"      icon={BarChart3}  color="#f97316" />
          </div>

          {/* Charts Row 1: Dept Load Bar + Subject Distribution Pie */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Department Class Load */}
            <Card className="lg:col-span-2 rounded-2xl border-border/60 bg-card/60 backdrop-blur-sm shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Activity className="size-4 text-indigo-500" />
                  Department Load Overview
                </CardTitle>
                <CardDescription>Classes and enrolled students per engineering department.</CardDescription>
              </CardHeader>
              <CardContent className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={DEPT_LOAD} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="dept" fontSize={11} tickLine={false} axisLine={false} stroke="#888" />
                    <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="#888" />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="classes"  name="Classes"  fill="#6366f1" radius={[4,4,0,0]} opacity={0.85} />
                    <Bar dataKey="students" name="Students" fill="#22c55e" radius={[4,4,0,0]} opacity={0.85} yAxisId={0} hide />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Subject Distribution Pie */}
            <Card className="rounded-2xl border-border/60 bg-card/60 backdrop-blur-sm shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Layers className="size-4 text-violet-500" />
                  Subject Matrix
                </CardTitle>
                <CardDescription>30 subjects per department — 240 total.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center h-[280px]">
                <div className="relative w-full h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={3} dataKey="value">
                        {PIE_DATA.map((_, i) => (
                          <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10, fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-black">240</span>
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Subjects</span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-x-3 gap-y-2 mt-3 w-full px-2">
                  {PIE_DATA.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <span className="size-2 rounded-full shrink-0" style={{ background: PALETTE[i % PALETTE.length] }} />
                      {d.name}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2: Growth Area + Faculty Radial */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Institutional Growth */}
            <Card className="lg:col-span-2 rounded-2xl border-border/60 bg-card/60 backdrop-blur-sm shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <TrendingUp className="size-4 text-green-500" />
                  Institutional Growth Index
                </CardTitle>
                <CardDescription>Students, classes, and faculty growth over 6 months.</CardDescription>
              </CardHeader>
              <CardContent className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={GROWTH_DATA} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gStudents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gClasses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} stroke="#888" />
                    <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="#888" />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="students" name="Students" stroke="#6366f1" fill="url(#gStudents)" strokeWidth={2} />
                    <Area type="monotone" dataKey="classes"  name="Classes"  stroke="#22c55e" fill="url(#gClasses)"  strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Faculty Load Radial */}
            <Card className="rounded-2xl border-border/60 bg-card/60 backdrop-blur-sm shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Users className="size-4 text-amber-500" />
                  Faculty Workload
                </CardTitle>
                <CardDescription>Teaching load percentage per senior faculty.</CardDescription>
              </CardHeader>
              <CardContent className="h-[280px] flex flex-col justify-center">
                <ResponsiveContainer width="100%" height={160}>
                  <RadialBarChart innerRadius="20%" outerRadius="90%" data={FACULTY_LOAD} startAngle={90} endAngle={-270}>
                    <RadialBar dataKey="load" background={{ fill: "rgba(255,255,255,0.03)" }} cornerRadius={6} label={false} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10, fontSize: 11 }} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2 px-1">
                  {FACULTY_LOAD.map((f) => (
                    <div key={f.name} className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="size-2 rounded-full" style={{ background: f.fill }} />
                        <span className="text-muted-foreground truncate max-w-[110px]">{f.name}</span>
                      </div>
                      <span className="font-bold tabular-nums">{f.load}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Full Timetable */}
          <Card className="rounded-2xl border-border/60 bg-card/60 backdrop-blur-sm shadow overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <CalendarDays className="size-4 text-sky-500" />
                Weekly Timetable — 9 AM to 5 PM (Mon–Sat)
              </CardTitle>
              <CardDescription>
                One class per subject per day. Lunch break 13:15–14:00. Saturday ends at 13:15.
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto pb-2">
              <table className="w-full text-[11px] border-collapse min-w-[700px]">
                <thead>
                  <tr>
                    <th className="text-left py-2 px-3 font-semibold text-muted-foreground w-[110px]">Period</th>
                    {DAYS.map((d) => (
                      <th key={d} className="py-2 px-3 font-semibold text-center" style={{ color: "#6366f1" }}>{d}</th>
                    ))}
                  </tr>
                  <tr><td colSpan={7}><Separator /></td></tr>
                </thead>
                <tbody>
                  {TIMETABLE_HOURS.map((period, pi) => (
                    <React.Fragment key={period}>
                      <tr className="hover:bg-muted/20 transition-colors group">
                        <td className="py-2.5 px-3 font-mono font-semibold text-muted-foreground whitespace-nowrap">
                          {period}
                        </td>
                        {DAYS.map((day) => {
                          const cell = TIMETABLE_SAMPLE[period]?.[day];
                          const deptCode = cell?.split("·")[0]?.trim().slice(0, 3) || "";
                          const color = DEPT_COLORS[deptCode] || "#888";
                          const isSaturday = day === "Saturday";
                          const hideSat = isSaturday && pi >= 4;
                          return (
                            <td key={day} className="py-2.5 px-3 text-center">
                              {hideSat ? (
                                <span className="text-muted-foreground/30 text-[10px]">—</span>
                              ) : cell ? (
                                <div
                                  className="inline-flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-[10px] font-medium w-full"
                                  style={{ background: `${color}18`, border: `1px solid ${color}30`, color }}
                                >
                                  <span className="font-bold">{cell.split("·")[0].trim()}</span>
                                  <span className="opacity-75 text-[9px]">{cell.split("·")[1]?.trim()}</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground/30 text-[10px]">Free</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                      {period === "12:15–13:15" && (
                        <tr key="lunch" className="bg-amber-500/5">
                          <td className="py-1.5 px-3 font-mono text-amber-500 font-semibold text-[10px]">13:15–14:00</td>
                          <td colSpan={6} className="py-1.5 px-3 text-center text-amber-500/70 text-[10px] font-medium tracking-wider uppercase">
                            Lunch Break
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Department Directory Grid */}
          <div>
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 px-0.5">
              Department Directory
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(DEPT_COLORS).map(([code, color]) => (
                <button
                  key={code}
                  onClick={() => handleMenuRoute("/subjects")}
                  className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card/60 p-4 text-left hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity" style={{ background: color }} />
                  <div className="text-lg font-black" style={{ color }}>{code}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 font-medium">30 subjects</div>
                  <ChevronRight className="absolute bottom-3 right-3 size-3.5 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => handleMenuRoute("/classes/create")}
              className="group flex items-center gap-3 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 hover:bg-indigo-500/10 hover:shadow-lg transition-all"
            >
              <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400 group-hover:scale-110 transition-transform">
                <GraduationCap className="size-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold">Create a Class</p>
                <p className="text-[11px] text-muted-foreground">Assign a subject and schedule</p>
              </div>
              <ArrowRight className="size-4 text-muted-foreground ml-auto" />
            </button>

            <button
              onClick={() => handleMenuRoute("/subjects")}
              className="group flex items-center gap-3 rounded-2xl border border-green-500/20 bg-green-500/5 p-4 hover:bg-green-500/10 hover:shadow-lg transition-all"
            >
              <div className="p-2.5 rounded-xl bg-green-500/15 text-green-400 group-hover:scale-110 transition-transform">
                <BookOpen className="size-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold">Subject Catalog</p>
                <p className="text-[11px] text-muted-foreground">240 subjects across 8 departments</p>
              </div>
              <ArrowRight className="size-4 text-muted-foreground ml-auto" />
            </button>

            <button
              onClick={() => handleMenuRoute("/classes")}
              className="group flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 hover:bg-amber-500/10 hover:shadow-lg transition-all"
            >
              <div className="p-2.5 rounded-xl bg-amber-555/15 text-amber-400 group-hover:scale-110 transition-transform">
                <CalendarDays className="size-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold">Classroom Directory</p>
                <p className="text-[11px] text-muted-foreground">View all active class sessions</p>
              </div>
              <ArrowRight className="size-4 text-muted-foreground ml-auto" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
}

// ─── Stat Card Helper Component ─────────────────────────────────────────────
function StatCard({
  label, value, sub, icon: Icon, color,
}: {
  label: string; value: string | number; sub: string;
  icon: React.ElementType; color: string;
}) {
  return (
    <Card className="relative overflow-hidden group border border-border/60 bg-card/60 backdrop-blur-sm shadow hover:shadow-xl transition-all duration-300 rounded-2xl hover:-translate-y-1 cursor-default">
      <div
        className="absolute top-0 right-0 w-28 h-28 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity duration-300"
        style={{ background: color }}
      />
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5 px-5">
        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </CardTitle>
        <div className="p-2 rounded-xl" style={{ background: `${color}22` }}>
          <Icon className="size-4" style={{ color }} />
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div className="text-4xl font-black tracking-tight">{value}</div>
        <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
          <TrendingUp className="size-3 text-green-500" />
          {sub}
        </p>
      </CardContent>
    </Card>
  );
}

// ─── Dropdown Menu Reusable Helpers ──────────────────────────────────────────
function DropdownMenuSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative group">
      <button className="px-3.5 py-2 text-xs font-black text-slate-700 dark:text-slate-350 hover:text-primary rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 transition-all duration-200">
        {label}
        <ChevronRight className="size-3.5 rotate-90 transition-transform group-hover:-rotate-90" />
      </button>
      
      {/* Dropdown Box */}
      <div className="absolute left-0 mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-1.5 hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-1 duration-150">
        {children}
      </div>
    </div>
  );
}

function DropdownMenuItem({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-2 text-[11px] font-bold text-slate-600 dark:text-slate-350 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-700/60 rounded-lg transition-colors flex items-center justify-between"
    >
      {label}
      <ChevronRight className="size-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}

// ─── Portal Link Helper Component ────────────────────────────────────────────
function PortalLink({ label, active = false, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  return (
    <li>
      <button
        onClick={onClick}
        className={`w-full text-left py-1.5 px-3 rounded-xl flex items-center justify-between transition-all group ${
          active
            ? "bg-primary/10 text-primary font-extrabold border border-primary/20"
            : "text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800/40"
        }`}
      >
        <span className="truncate pr-2">{label}</span>
        <ChevronRight className={`size-3 text-slate-400 transition-all ${
          active ? "text-primary translate-x-0.5" : "group-hover:translate-x-0.5 opacity-60"
        }`} />
      </button>
    </li>
  );
}
