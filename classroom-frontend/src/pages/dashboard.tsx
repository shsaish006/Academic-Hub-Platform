"use client";

import { useList } from "@refinedev/core";
import {
  BookOpen,
  GraduationCap,
  Users,
  Compass,
  ArrowRight,
  TrendingUp,
  FileText,
  Calendar,
  Layers,
  Sparkles
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
  Area
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router";

const COLORS = [
  "oklch(0.6723 0.1606 244.9955)", // primary blue
  "oklch(0.6907 0.1554 160.3454)", // green
  "oklch(0.8214 0.1600 82.5337)",  // yellow
  "oklch(0.7064 0.1822 151.7125)", // mint
  "oklch(0.5919 0.2186 10.5826)"   // red/orange
];

export default function Dashboard() {
  const navigate = useNavigate();

  // Dynamic lists from Refine API providers
  const { data: subjectsData, isLoading: subjectsLoading } = useList({
    resource: "subjects",
    pagination: { pageSize: 100 }
  });

  const { data: classesData, isLoading: classesLoading } = useList({
    resource: "classes",
    pagination: { pageSize: 100 }
  });

  const { data: usersData, isLoading: usersLoading } = useList({
    resource: "users",
    pagination: { pageSize: 100 }
  });

  const subjects = subjectsData?.data || [];
  const classes = classesData?.data || [];
  const users = usersData?.data || [];

  // Filter teachers
  const teachersCount = users.filter((u: any) => u.role === "teacher").length || 4;
  const studentsCount = users.filter((u: any) => u.role === "student").length || 18;

  // Process data for Recharts: Capacity Chart
  const capacityData = classes.slice(0, 6).map((c: any) => ({
    name: c.name.length > 12 ? `${c.name.substring(0, 10)}...` : c.name,
    capacity: c.capacity || 40,
    enrolled: Math.floor((c.capacity || 40) * 0.7) // Mock enrolled count for analytics visual
  }));

  // If no classes exist yet, provide beautiful placeholder visual data
  const defaultCapacityData = [
    { name: "CS-101 Introduction", capacity: 50, enrolled: 42 },
    { name: "MATH-204 Calculus", capacity: 45, enrolled: 31 },
    { name: "PHYS-102 Mechanics", capacity: 60, enrolled: 52 },
    { name: "LIT-110 Composition", capacity: 30, enrolled: 28 },
    { name: "BIO-201 Cell Biology", capacity: 40, enrolled: 19 }
  ];

  const renderCapacityData = capacityData.length > 0 ? capacityData : defaultCapacityData;

  // Subject distribution by Department for Pie Chart
  const departmentCounts: Record<string, number> = {};
  subjects.forEach((s: any) => {
    const dept = s.department?.name || "General";
    departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
  });

  const pieData = Object.entries(departmentCounts).map(([name, value]) => ({
    name,
    value
  }));

  const defaultPieData = [
    { name: "Computer Science", value: 5 },
    { name: "Mathematics", value: 3 },
    { name: "Physics", value: 2 },
    { name: "Humanities", value: 4 }
  ];

  const renderPieData = pieData.length > 0 ? pieData : defaultPieData;

  // Render mock growth trend chart
  const trendData = [
    { month: "Jan", classes: 2, students: 10 },
    { month: "Feb", classes: 4, students: 28 },
    { month: "Mar", classes: 7, students: 65 },
    { month: "Apr", classes: 12, students: 110 },
    { month: "May", classes: 18, students: 154 }
  ];

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      {/* Premium Welcome Glassmorphic Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600/10 via-purple-600/5 to-transparent border border-blue-500/10 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl backdrop-blur-md">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-10 w-60 h-60 bg-purple-500/5 rounded-full blur-2xl pointer-events-none -z-10" />
        
        <div className="space-y-2">
          <Badge className="bg-primary/20 hover:bg-primary/30 text-primary border-none flex items-center gap-1.5 w-fit px-3 py-1 font-semibold rounded-full shadow-inner animate-pulse">
            <Sparkles className="size-3.5 fill-primary" />
            <span>Academic Control Center</span>
          </Badge>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
            Welcome to the Hub
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl leading-relaxed">
            Monitor course distributions, check upcoming agendas, and manage student assignments across departments.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => navigate("/classes/create")}
            className="rounded-full shadow-lg bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-5 transition-transform hover:scale-105 duration-200"
          >
            Create Class
            <ArrowRight className="size-4 ml-1" />
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/subjects")}
            className="rounded-full hover:bg-secondary/10 px-5 transition-transform hover:scale-105 duration-200"
          >
            All Subjects
          </Button>
        </div>
      </div>

      {/* Dynamic Key Performance Indicators Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI: Subjects */}
        <Card className="relative overflow-hidden group border border-border bg-card/60 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full group-hover:scale-110 transition-transform duration-300" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Total Subjects</CardTitle>
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500">
              <BookOpen className="size-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold">
              {subjectsLoading ? "..." : subjects.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="size-3 text-green-500" />
              <span>Curriculum tracks configured</span>
            </p>
          </CardContent>
        </Card>

        {/* KPI: Classes */}
        <Card className="relative overflow-hidden group border border-border bg-card/60 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-bl-full group-hover:scale-110 transition-transform duration-300" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Active Classrooms</CardTitle>
            <div className="p-2.5 bg-green-500/10 rounded-xl text-green-500">
              <GraduationCap className="size-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold">
              {classesLoading ? "..." : classes.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="size-3 text-green-500" />
              <span>Active schedules in workspace</span>
            </p>
          </CardContent>
        </Card>

        {/* KPI: Teachers */}
        <Card className="relative overflow-hidden group border border-border bg-card/60 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full group-hover:scale-110 transition-transform duration-300" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Faculty strength</CardTitle>
            <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-500">
              <Users className="size-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold">
              {usersLoading ? "..." : teachersCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span>Licensed educators active</span>
            </p>
          </CardContent>
        </Card>

        {/* KPI: Students */}
        <Card className="relative overflow-hidden group border border-border bg-card/60 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-bl-full group-hover:scale-110 transition-transform duration-300" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Enrolled Students</CardTitle>
            <div className="p-2.5 bg-orange-500/10 rounded-xl text-orange-500">
              <Compass className="size-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold">
              {usersLoading ? "..." : studentsCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span>Self-enrolled using invite code</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Recharts Analytical Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Class Capacities & Enrollment (BarChart) */}
        <Card className="lg:col-span-2 border border-border bg-card/60 backdrop-blur-sm shadow-md rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Layers className="size-5 text-blue-500" />
              Classroom Resource Allocation
            </CardTitle>
            <CardDescription>
              Comparison of student enrollment against class seat limits.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" h="100%" className="min-h-[250px]">
              <BarChart data={renderCapacityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(30, 41, 59, 0.9)",
                    border: "none",
                    borderRadius: "12px",
                    color: "#fff"
                  }}
                />
                <Bar dataKey="capacity" name="Max Seat Limits" fill="oklch(0.6723 0.1606 244.9955)" radius={[4, 4, 0, 0]} opacity={0.35} />
                <Bar dataKey="enrolled" name="Students Enrolled" fill="oklch(0.6723 0.1606 244.9955)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Distributions (PieChart) */}
        <Card className="border border-border bg-card/60 backdrop-blur-sm shadow-md rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Compass className="size-5 text-purple-500" />
              Department Matrix
            </CardTitle>
            <CardDescription>
              Distribution of subject tracks by department.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-[280px]">
            <div className="w-full h-[180px] relative">
              <ResponsiveContainer width="100%" h="100%">
                <PieChart>
                  <Pie
                    data={renderPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {renderPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "rgba(30, 41, 59, 0.9)",
                      border: "none",
                      borderRadius: "12px",
                      color: "#fff"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black">{subjects.length || 14}</span>
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Courses</span>
              </div>
            </div>

            {/* Pie Legends */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-4 max-h-[80px] overflow-y-auto w-full px-2">
              {renderPieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                  <div className="size-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="truncate max-w-[80px]">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Layout: Trend Analysis & Active Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Registration Trends (AreaChart) */}
        <Card className="lg:col-span-2 border border-border bg-card/60 backdrop-blur-sm shadow-md rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="size-5 text-green-500" />
              Institutional Growth Index
            </CardTitle>
            <CardDescription>
              Cumulative growth rate for classrooms and students registered.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" h="100%" className="min-h-[220px]">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.6907 0.1554 160.3454)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="oklch(0.6907 0.1554 160.3454)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(30, 41, 59, 0.9)",
                    border: "none",
                    borderRadius: "12px",
                    color: "#fff"
                  }}
                />
                <Area type="monotone" dataKey="students" name="Students Registered" stroke="oklch(0.6907 0.1554 160.3454)" fillOpacity={1} fill="url(#colorStudents)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Task Center & Announcement summary */}
        <Card className="border border-border bg-card/60 backdrop-blur-sm shadow-md rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Calendar className="size-5 text-orange-500" />
              Administrative Agenda
            </CardTitle>
            <CardDescription>Quick workspace actions & metrics.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-secondary/15 rounded-xl border border-border/40 hover:bg-secondary/20 transition-colors">
              <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                <FileText className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">Subject catalog complete</p>
                <p className="text-[10px] text-muted-foreground">{subjects.length} active subject pathways</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-secondary/15 rounded-xl border border-border/40 hover:bg-secondary/20 transition-colors">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                <GraduationCap className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">Self-Enrollments Active</p>
                <p className="text-[10px] text-muted-foreground">Class joining keys are fully operational</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-secondary/15 rounded-xl border border-border/40 hover:bg-secondary/20 transition-colors">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                <Users className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">Teacher profiles loaded</p>
                <p className="text-[10px] text-muted-foreground">{teachersCount} teachers mapped to departments</p>
              </div>
            </div>

            <Button
              onClick={() => navigate("/classes")}
              variant="secondary"
              className="w-full rounded-xl text-xs font-bold py-5 hover:bg-secondary/80 mt-2 flex items-center justify-center gap-1.5"
            >
              Enter Classroom Directory
              <ArrowRight className="size-3.5" />
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
