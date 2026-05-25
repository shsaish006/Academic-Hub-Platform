"use client";

import { useList } from "@refinedev/core";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router";

// ─── Palette ────────────────────────────────────────────────────────────────
const PALETTE = [
  "#6366f1", "#22c55e", "#f59e0b", "#14b8a6",
  "#ec4899", "#8b5cf6", "#0ea5e9", "#f97316",
];

// ─── Static Timetable Grid (9 AM → 5 PM, Mon–Sat) ──────────────────────────
const PERIODS = [
  "09:00–10:00",
  "10:00–11:00",
  "11:15–12:15",
  "12:15–13:15",
  "14:00–15:00",
  "15:00–16:00",
  "16:00–17:00",
];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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

// ─── Fake Growth Data ────────────────────────────────────────────────────────
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

// ─── Stat Card ───────────────────────────────────────────────────────────────
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

// ─── Main Dashboard ─────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();

  const { data: subjectsData, isLoading: loadingSubjects } = useList({ resource: "subjects", pagination: { pageSize: 300 } });
  const { data: classesData,  isLoading: loadingClasses  } = useList({ resource: "classes",  pagination: { pageSize: 300 } });
  const { data: usersData,    isLoading: loadingUsers    } = useList({ resource: "users",    pagination: { pageSize: 300 } });

  const subjects = subjectsData?.data || [];
  const classrooms = classesData?.data || [];
  const users = usersData?.data || [];

  const teacherCount  = users.filter((u: any) => u.role === "teacher").length || 50;
  const studentCount  = users.filter((u: any) => u.role === "student").length || 1500;
  const totalCapacity = classrooms.reduce((acc: number, c: any) => acc + (c.capacity || 1500), 0);

  return (
    <div className="flex flex-col gap-7 w-full pb-12">

      {/* ── Hero Banner ─────────────────────────────────────────────────── */}
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
            onClick={() => navigate("/classes/create")}
            className="rounded-full px-6 font-semibold shadow-lg hover:scale-105 transition-transform"
          >
            Create Class
            <ArrowRight className="size-4 ml-1.5" />
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/subjects")}
            className="rounded-full px-6 font-semibold hover:scale-105 transition-transform"
          >
            All Subjects
          </Button>
        </div>
      </div>

      {/* ── KPI Strip ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Subjects"   value={loadingSubjects ? "..." : (subjects.length || 240)}   sub="Across 8 departments" icon={BookOpen}     color="#6366f1" />
        <StatCard label="Active Classes"   value={loadingClasses  ? "..." : (classrooms.length || 240)} sub="9 AM – 5 PM schedule" icon={GraduationCap} color="#22c55e" />
        <StatCard label="Faculty Strength" value={loadingUsers    ? "..." : teacherCount}               sub="50 professors mapped"  icon={Users}         color="#f59e0b" />
        <StatCard label="Student Capacity" value="1,500"                                                sub="Per class section"     icon={Award}         color="#0ea5e9" />
      </div>

      {/* ── Secondary KPI Row ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Departments"      value={8}       sub="Engineering streams"         icon={Building2}  color="#14b8a6" />
        <StatCard label="Total Capacity"   value="360,000" sub="Across all sections"         icon={Layers}     color="#ec4899" />
        <StatCard label="Weekly Periods"   value={7}       sub="Slots per day, Mon–Sat"      icon={Clock}      color="#8b5cf6" />
        <StatCard label="Subjects / Dept"  value={30}      sub="4 year curriculum each"      icon={BarChart3}  color="#f97316" />
      </div>

      {/* ── Charts Row 1: Dept Load Bar + Subject Distribution Pie ───────── */}
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
                    {PIE_DATA.map((entry, i) => (
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
                  <span className="size-2 rounded-full shrink-0" style={{ background: PALETTE[i] }} />
                  {d.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Charts Row 2: Growth Area + Faculty Radial ─────────────────── */}
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

      {/* ── Full 9–5 Timetable ───────────────────────────────────────────── */}
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
              {PERIODS.map((period, pi) => (
                <>
                  <tr key={period} className="hover:bg-muted/20 transition-colors group">
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
                </>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* ── Department Quick Access ──────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 px-0.5">
          Department Directory
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(DEPT_COLORS).map(([code, color]) => (
            <button
              key={code}
              onClick={() => navigate("/subjects")}
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

      {/* ── Quick Actions ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => navigate("/classes/create")}
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
          onClick={() => navigate("/subjects")}
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
          onClick={() => navigate("/classes")}
          className="group flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 hover:bg-amber-500/10 hover:shadow-lg transition-all"
        >
          <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 group-hover:scale-110 transition-transform">
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
  );
}
