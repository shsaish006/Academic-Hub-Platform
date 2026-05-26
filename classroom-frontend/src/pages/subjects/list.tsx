"use client";

import { useTable } from "@refinedev/react-table";
import { useNavigation } from "@refinedev/core";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
import { Search, BookOpen, GraduationCap, Clock, Award, Building, Sparkles, Filter, ChevronRight, Plus } from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { useMemo, useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { DEPARTMENT_OPTIONS } from "@/constants";
import { CreateButton } from "@/components/refine-ui/buttons/create.tsx";
import { Subject } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card.tsx";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { useNavigate } from "react-router";

const DEPT_COLORS: Record<string, string> = {
  "Computer Science & Engineering": "#6366f1",
  "Electronics & Communication Engineering": "#0ea5e9",
  "Mechanical Engineering": "#f59e0b",
  "Biotechnology": "#22c55e",
  "Chemical Engineering": "#ec4899",
  "Mathematics & Computing": "#8b5cf6",
  "Civil Engineering": "#14b8a6",
  "Electrical Engineering": "#f97316",
};

const DEPT_ACCENTS: Record<string, string> = {
  "Computer Science & Engineering": "from-indigo-600/10 to-indigo-500/5",
  "Electronics & Communication Engineering": "from-sky-600/10 to-sky-500/5",
  "Mechanical Engineering": "from-amber-600/10 to-amber-500/5",
  "Biotechnology": "from-emerald-600/10 to-emerald-500/5",
  "Chemical Engineering": "from-pink-600/10 to-pink-500/5",
  "Mathematics & Computing": "from-purple-600/10 to-purple-500/5",
  "Civil Engineering": "from-teal-600/10 to-teal-500/5",
  "Electrical Engineering": "from-orange-600/10 to-orange-500/5",
};

const SubjectsList = () => {
    const { create } = useNavigation();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('all');

    // Setup Refine Table hook
    const subjectColumns = useMemo<ColumnDef<Subject>[]>(() => [
        { id: 'id', accessorKey: 'id' }
    ], []);

    const {
        refineCore: { tableQuery, setFilters },
    } = useTable<Subject>({
        columns: subjectColumns,
        refineCoreProps: {
            resource: 'subjects',
            pagination: { pageSize: 12, mode: 'server' },
            sorters: {
                initial: [
                    { field: 'id', order: 'desc' },
                ]
            },
        }
    });

    // Handle reactive filters and queries properly (Fixes the "no DATA" bug)
    useEffect(() => {
        const filters = [];
        if (selectedDepartment !== 'all') {
            filters.push({
                field: 'department',
                operator: 'eq' as const,
                value: selectedDepartment
            });
        }
        if (searchQuery.trim() !== '') {
            filters.push({
                field: 'name',
                operator: 'contains' as const,
                value: searchQuery
            });
        }
        setFilters(filters);
    }, [selectedDepartment, searchQuery]);

    const subjectsList = tableQuery.data?.data || [];
    const isLoading = tableQuery.isLoading;

    return (
        <div className="flex flex-col gap-6 w-full pb-16">
            
            {/* Header & Breadcrumb */}
            <div className="flex flex-col gap-1">
                <Breadcrumb />
                <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-2">
                    <BookOpen className="size-8 text-indigo-500" />
                    Subject Catalog Matrix
                </h1>
                <p className="text-muted-foreground text-xs md:text-sm">
                    Access and manage all 240 institutional curriculum subjects across 8 departments.
                </p>
            </div>

            {/* Filter & Action Panel */}
            <div className="bg-card/40 border border-border/40 backdrop-blur-md p-4 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-4 shadow-md">
                
                <div className="flex items-center gap-2">
                    <Filter className="size-4 text-indigo-500 shrink-0" />
                    <span className="text-xs font-black uppercase text-muted-foreground tracking-wider">Search & Filter</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
                    
                    {/* Search Field */}
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input
                            type="text"
                            placeholder="Search by subject code, name..."
                            className="pl-9 h-10 text-xs bg-background/50 border-border/60 rounded-xl focus-visible:ring-indigo-500 w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Department Dropdown Filter */}
                    <div className="w-full sm:w-60">
                        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                            <SelectTrigger className="h-10 text-xs bg-background/50 border-border/60 rounded-xl">
                                <SelectValue placeholder="All Departments" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                                <SelectItem value="all">All Departments</SelectItem>
                                {DEPARTMENT_OPTIONS.map(dept => (
                                    <SelectItem key={dept.value} value={dept.value}>
                                        {dept.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Create Subject Button */}
                    <Button
                        onClick={() => create("subjects")}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs h-10 px-5 rounded-xl flex items-center gap-1.5 shadow-md w-full sm:w-auto shrink-0 transition-all hover:scale-105"
                    >
                        <Plus className="size-4" />
                        Add Subject
                    </Button>

                </div>
            </div>

            {/* Catalog Grid View */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-28 gap-3">
                    <Loader2 className="size-10 text-indigo-500 animate-spin" />
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Synchronizing subject catalog...
                    </p>
                </div>
            ) : subjectsList.length === 0 ? (
                <Card className="border-dashed border-border bg-card/25 p-16 text-center rounded-3xl">
                    <BookOpen className="size-12 text-muted-foreground/35 mx-auto mb-3" />
                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">No Subjects Seeded</h3>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1 leading-relaxed">
                        No subject mappings matched the selected parameters. Try selecting a different department filter.
                    </p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjectsList.map((subj) => {
                        const deptName = subj.department?.name || "General Science";
                        const deptColor = DEPT_COLORS[deptName] || "#6366f1";
                        const gradient = DEPT_ACCENTS[deptName] || "from-indigo-600/10 to-indigo-500/5";

                        return (
                            <Card
                                key={subj.id}
                                className="relative overflow-hidden group border border-border/50 bg-card/60 backdrop-blur-sm shadow hover:shadow-xl transition-all duration-300 rounded-3xl hover:-translate-y-1"
                                style={{ borderTop: `4px solid ${deptColor}` }}
                            >
                                <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full bg-gradient-to-br ${gradient} opacity-20 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none`} />
                                
                                <CardHeader className="pb-2 pt-5 px-5 flex flex-col gap-2">
                                    <div className="flex items-center justify-between gap-3">
                                        <Badge
                                            className="font-mono text-[10px] font-black border shadow-inner px-2 py-0.5 rounded-md"
                                            style={{ borderColor: `${deptColor}30`, background: `${deptColor}10`, color: deptColor }}
                                        >
                                            {subj.code}
                                        </Badge>
                                        <Badge className="bg-indigo-500/10 border-none text-[8px] text-indigo-400 font-black uppercase tracking-wider rounded-full px-2 py-0">
                                            Theory & Lab
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-sm font-extrabold leading-tight text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors line-clamp-1">
                                        {subj.name}
                                    </CardTitle>
                                </CardHeader>

                                <CardContent className="px-5 pb-4 text-xs flex flex-col gap-3">
                                    <p className="text-muted-foreground line-clamp-2 leading-relaxed min-h-8">
                                        {subj.description || "Core curricular pathway subject covering theoretical analysis, practical laboratory exercises and project formulations."}
                                    </p>
                                    <Separator className="border-border/30" />
                                    <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold">
                                        <span className="flex items-center gap-1">
                                            <Building className="size-3.5" style={{ color: deptColor }} />
                                            {subj.department?.code || "GEN"}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Award className="size-3.5 text-indigo-400" />
                                            4.0 Credits Scale
                                        </span>
                                    </div>
                                </CardContent>

                                <CardFooter className="bg-muted/15 border-t border-border/20 py-2.5 px-5 flex items-center justify-between">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                        <Sparkles className="size-3 text-amber-500 animate-pulse" />
                                        Term Mapped
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-[10px] font-black text-indigo-500 hover:text-indigo-600 p-0 flex items-center gap-0.5"
                                        onClick={() => navigate(`/subjects`)}
                                    >
                                        Syllabus Blueprint
                                        <ChevronRight className="size-3" />
                                    </Button>
                                </CardFooter>

                            </Card>
                        );
                    })}
                </div>
            )}

        </div>
    );
};

export default SubjectsList;
