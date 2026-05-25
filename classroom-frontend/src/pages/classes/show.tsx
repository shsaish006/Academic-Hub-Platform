"use client";

import React, { useState, useEffect } from "react";
import { useShow, useGetIdentity } from "@refinedev/core";
import { ClassDetails } from "@/types";
import { ShowView, ShowViewHeader } from "@/components/refine-ui/views/show-view.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.tsx";
import { AdvancedImage } from "@cloudinary/react";
import { bannerPhoto } from "@/lib/cloudinary.ts";
import { BACKEND_BASE_URL } from "@/constants";
import { toast } from "sonner";
import {
  MessageSquare,
  FileText,
  Bookmark,
  Users,
  Send,
  Plus,
  Clock,
  ExternalLink,
  Award,
  Upload,
  BookOpen,
  CheckCircle2,
  Calendar,
  Sparkles
} from "lucide-react";

// Get initials for profile placeholders
const getInitials = (name = "") => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
};

export default function Show() {
  const { query } = useShow<ClassDetails>({ resource: "classes" });
  const { data: identity } = useGetIdentity<any>();

  const classDetails = query.data?.data;
  const { isLoading, isError } = query;

  // Active user data
  const currentUser = identity || {
    id: "user-1",
    name: "Dr. Alex Carter",
    email: "alex.carter@academy.edu",
    role: "teacher" // fallback to teacher for premium experience in mock/dev environments
  };

  const classId = classDetails?.id;
  const isTeacher = currentUser.role === "teacher" || currentUser.role === "admin";

  // LMS Data States
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<Record<number, any[]>>({}); // assignmentId -> submissions
  const [mySubmissions, setMySubmissions] = useState<Record<number, any>>({}); // assignmentId -> student's own submission

  // Form input states
  const [announcementText, setAnnouncementText] = useState("");
  const [commentTexts, setCommentTexts] = useState<Record<number, string>>({}); // announcementId -> comment text
  
  // Assignment creation states
  const [assignTitle, setAssignTitle] = useState("");
  const [assignDesc, setAssignDesc] = useState("");
  const [assignDueDate, setAssignDueDate] = useState("");
  const [assignMaxPoints, setAssignMaxPoints] = useState("100");

  // Submission upload states
  const [submitText, setSubmitText] = useState("");
  const [submitFileUrl, setSubmitFileUrl] = useState("");
  const [submittingForId, setSubmittingForId] = useState<number | null>(null);

  // Material upload states
  const [materialTitle, setMaterialTitle] = useState("");
  const [materialUrl, setMaterialUrl] = useState("");
  const [materialType, setMaterialType] = useState("pdf");

  // Grading states
  const [gradingSubmission, setGradingSubmission] = useState<any | null>(null);
  const [gradingScore, setGradingScore] = useState("");
  const [gradingFeedback, setGradingFeedback] = useState("");

  // Loading states
  const [lmsLoading, setLmsLoading] = useState(false);

  // Fetch LMS details
  const fetchLmsData = async () => {
    if (!classId) return;
    setLmsLoading(true);
    try {
      // 1. Announcements
      const annRes = await fetch(`${BACKEND_BASE_URL}lms/classes/${classId}/announcements`);
      const annJson = await annRes.json();
      if (annJson.data) setAnnouncements(annJson.data);

      // 2. Assignments
      const assignRes = await fetch(`${BACKEND_BASE_URL}lms/classes/${classId}/assignments`);
      const assignJson = await assignRes.json();
      const loadedAssignments = assignJson.data || [];
      setAssignments(loadedAssignments);

      // 3. Materials
      const matRes = await fetch(`${BACKEND_BASE_URL}lms/classes/${classId}/materials`);
      const matJson = await matRes.json();
      if (matJson.data) setMaterials(matJson.data);

      // 4. Submissions for student / teacher
      for (const assign of loadedAssignments) {
        if (isTeacher) {
          // Teachers pull ALL student submissions
          const subRes = await fetch(`${BACKEND_BASE_URL}lms/assignments/${assign.id}/submissions`);
          const subJson = await subRes.json();
          if (subJson.data) {
            setSubmissions(prev => ({ ...prev, [assign.id]: subJson.data }));
          }
        } else {
          // Students pull only their own submission
          const subRes = await fetch(`${BACKEND_BASE_URL}lms/assignments/${assign.id}/submissions?studentId=${currentUser.id}`);
          const subJson = await subRes.json();
          if (subJson.data && subJson.data.length > 0) {
            setMySubmissions(prev => ({ ...prev, [assign.id]: subJson.data[0] }));
          }
        }
      }
    } catch (error) {
      console.error("LMS fetch error", error);
    } finally {
      setLmsLoading(false);
    }
  };

  useEffect(() => {
    if (classId) {
      fetchLmsData();
    }
  }, [classId, isTeacher]);

  if (isLoading || isError || !classDetails) {
    return (
      <ShowView className="class-view class-show">
        <ShowViewHeader resource="classes" title="Class Details" />
        <p className="state-message">
          {isLoading ? "Loading class details..." : isError ? "Failed to load class details..." : "Class details not found"}
        </p>
      </ShowView>
    );
  }

  const { name, description, status, capacity, bannerUrl, bannerCldPubId, subject, teacher, department } = classDetails;
  const teacherName = teacher?.name ?? "Unknown Instructor";

  // Handle posting announcements
  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;

    try {
      const res = await fetch(`${BACKEND_BASE_URL}lms/classes/${classId}/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          content: announcementText
        })
      });

      if (res.ok) {
        toast.success("Announcement shared successfully!");
        setAnnouncementText("");
        fetchLmsData();
      } else {
        toast.error("Failed to share announcement.");
      }
    } catch (e) {
      toast.error("Network error publishing announcement.");
    }
  };

  // Handle posting announcement comments
  const handlePostComment = async (announcementId: number) => {
    const text = commentTexts[announcementId];
    if (!text || !text.trim()) return;

    try {
      const res = await fetch(`${BACKEND_BASE_URL}lms/announcements/${announcementId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          content: text
        })
      });

      if (res.ok) {
        toast.success("Comment added!");
        setCommentTexts(prev => ({ ...prev, [announcementId]: "" }));
        fetchLmsData();
      } else {
        toast.error("Failed to post comment.");
      }
    } catch (e) {
      toast.error("Network error.");
    }
  };

  // Handle creating coursework (Teacher only)
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTitle.trim() || !assignDesc.trim() || !assignDueDate) {
      toast.warning("Please fill in all coursework fields");
      return;
    }

    try {
      const res = await fetch(`${BACKEND_BASE_URL}lms/classes/${classId}/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: assignTitle,
          description: assignDesc,
          dueDate: assignDueDate,
          maxPoints: Number(assignMaxPoints)
        })
      });

      if (res.ok) {
        toast.success("New assignment published!");
        setAssignTitle("");
        setAssignDesc("");
        setAssignDueDate("");
        setAssignMaxPoints("100");
        fetchLmsData();
      } else {
        toast.error("Failed to create assignment");
      }
    } catch (e) {
      toast.error("Network error publishing assignment");
    }
  };

  // Handle student homework submissions
  const handleUploadSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingForId) return;

    try {
      const res = await fetch(`${BACKEND_BASE_URL}lms/assignments/${submittingForId}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: currentUser.id,
          fileUrl: submitFileUrl,
          textContent: submitText
        })
      });

      if (res.ok) {
        toast.success("Homework turned in successfully!");
        setSubmitText("");
        setSubmitFileUrl("");
        setSubmittingForId(null);
        fetchLmsData();
      } else {
        toast.error("Failed to turn in assignment.");
      }
    } catch (e) {
      toast.error("Network error.");
    }
  };

  // Handle publishing resource materials
  const handleUploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialTitle.trim() || !materialUrl.trim()) {
      toast.warning("Please complete material fields");
      return;
    }

    try {
      const res = await fetch(`${BACKEND_BASE_URL}lms/classes/${classId}/materials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: materialTitle,
          fileUrl: materialUrl,
          fileType: materialType
        })
      });

      if (res.ok) {
        toast.success("Study material uploaded!");
        setMaterialTitle("");
        setMaterialUrl("");
        fetchLmsData();
      } else {
        toast.error("Failed to upload study material");
      }
    } catch (e) {
      toast.error("Network error.");
    }
  };

  // Handle grading students
  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    try {
      const res = await fetch(`${BACKEND_BASE_URL}lms/submissions/${gradingSubmission.id}/grade`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade: Number(gradingScore),
          feedback: gradingFeedback
        })
      });

      if (res.ok) {
        toast.success("Grade submitted successfully!");
        setGradingSubmission(null);
        setGradingScore("");
        setGradingFeedback("");
        fetchLmsData();
      } else {
        toast.error("Failed to grade submission.");
      }
    } catch (e) {
      toast.error("Network error grading submission.");
    }
  };

  return (
    <ShowView className="class-view class-show gap-6 pb-12">
      <ShowViewHeader resource="classes" title="" />

      {/* Hero Glassmorphic Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white min-h-[220px] p-8 md:p-12 flex flex-col justify-end shadow-2xl border border-white/5">
        {bannerUrl ? (
          <AdvancedImage
            alt="Class Banner"
            cldImg={bannerPhoto(bannerCldPubId ?? "", name)}
            className="absolute inset-0 size-full object-cover opacity-45 select-none pointer-events-none"
          />
        ) : (
          <div className="absolute inset-0 size-full bg-gradient-to-tr from-blue-900 via-indigo-950 to-purple-900 opacity-60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
        
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-blue-500/20 border border-blue-400/30 text-blue-300 font-bold px-3 rounded-full uppercase tracking-wider text-[10px]">
              {subject?.code || "COURSE"}
            </Badge>
            <Badge variant="outline" className="border-white/20 text-white/80 bg-white/5 font-semibold text-[10px] rounded-full">
              {capacity} Seats Max
            </Badge>
            <Badge className="bg-green-500/20 border border-green-500/30 text-green-300 font-bold px-3 rounded-full text-[10px]">
              {status.toUpperCase()}
            </Badge>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight drop-shadow-md">
            {name}
          </h1>
          <p className="text-slate-300 text-sm md:text-base max-w-2xl font-medium line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* tabbed portal navigation system */}
      <Tabs defaultValue="stream" className="w-full mt-2">
        <TabsList className="grid grid-cols-4 w-full bg-muted/60 p-1 rounded-2xl border border-border/40 backdrop-blur-md max-w-xl mb-6 shadow-inner">
          <TabsTrigger value="stream" className="rounded-xl font-bold text-xs py-2.5 flex items-center gap-1.5 transition-all">
            <MessageSquare className="size-4" />
            <span className="hidden sm:inline">Stream</span>
          </TabsTrigger>
          <TabsTrigger value="assignments" className="rounded-xl font-bold text-xs py-2.5 flex items-center gap-1.5 transition-all">
            <FileText className="size-4" />
            <span className="hidden sm:inline">Classwork</span>
          </TabsTrigger>
          <TabsTrigger value="materials" className="rounded-xl font-bold text-xs py-2.5 flex items-center gap-1.5 transition-all">
            <Bookmark className="size-4" />
            <span className="hidden sm:inline">Materials</span>
          </TabsTrigger>
          <TabsTrigger value="info" className="rounded-xl font-bold text-xs py-2.5 flex items-center gap-1.5 transition-all">
            <Users className="size-4" />
            <span className="hidden sm:inline">Roster</span>
          </TabsTrigger>
        </TabsList>

        {/* ==========================================
            TAB 1: SOCIAL DISCUSSION STREAM
            ========================================== */}
        <TabsContent value="stream" className="grid grid-cols-1 lg:grid-cols-3 gap-6 outline-none">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Create Announcement Feed box */}
            <Card className="border-border bg-card/60 backdrop-blur-sm shadow-md rounded-2xl overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Sparkles className="size-4 text-blue-500" />
                  Post class announcement
                </CardTitle>
              </CardHeader>
              <form onSubmit={handlePostAnnouncement}>
                <CardContent>
                  <Textarea
                    placeholder="Share resources, templates, or deadlines with your class..."
                    className="min-h-24 bg-background/50 border-border/60 focus-visible:ring-primary rounded-xl p-4 text-sm"
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                  />
                </CardContent>
                <CardFooter className="flex justify-between items-center bg-muted/20 border-t border-border/20 py-3 px-6">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                    Posting as {currentUser.role.toUpperCase()}
                  </span>
                  <Button type="submit" size="sm" className="rounded-full px-4 gap-1.5 font-bold shadow-md bg-primary hover:bg-primary/95 text-primary-foreground text-xs">
                    Share Announcement
                    <Send className="size-3.5" />
                  </Button>
                </CardFooter>
              </form>
            </Card>

            {/* Announcement feed stream container */}
            <div className="space-y-4">
              {announcements.length === 0 ? (
                <Card className="border-dashed border-border/60 bg-muted/10 p-10 text-center rounded-2xl">
                  <MessageSquare className="size-10 text-muted-foreground/45 mx-auto mb-3" />
                  <h3 className="font-bold text-sm">Quiet stream</h3>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1">
                    There are no announcements published yet. Write the first post to launch a discussion!
                  </p>
                </Card>
              ) : (
                announcements.map((ann) => (
                  <Card key={ann.id} className="border-border bg-card/60 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-300 rounded-2xl p-6 space-y-4">
                    {/* Announcer head bar */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9 ring-1 ring-border shadow-inner">
                          {ann.author?.image && <AvatarImage src={ann.author.image} alt={ann.author.name} />}
                          <AvatarFallback className="bg-secondary/40 text-xs font-bold text-primary">
                            {getInitials(ann.author?.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-extrabold text-foreground">{ann.author?.name}</span>
                            <Badge className="bg-primary/10 border-none text-[8px] tracking-wide font-black px-1.5 py-0 text-primary uppercase rounded-full">
                              {ann.author?.role}
                            </Badge>
                          </div>
                          <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                            <Clock className="size-3" />
                            {new Date(ann.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Announcement textual body */}
                    <p className="text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap px-1">
                      {ann.content}
                    </p>

                    <Separator className="bg-border/30" />

                    {/* Comments Thread loop */}
                    <div className="space-y-3.5 pl-1 md:pl-2">
                      {ann.comments && ann.comments.length > 0 && (
                        <div className="space-y-3">
                          {ann.comments.map((comment: any) => (
                            <div key={comment.id} className="flex gap-3 items-start bg-secondary/10 p-3 rounded-xl border border-border/25">
                              <Avatar className="size-7 ring-1 ring-border">
                                {comment.author?.image && <AvatarImage src={comment.author.image} alt={comment.author.name} />}
                                <AvatarFallback className="bg-secondary/60 text-[10px] font-black text-primary">
                                  {getInitials(comment.author?.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[11px] font-bold text-foreground">{comment.author?.name}</span>
                                    <Badge className="bg-secondary/50 border-none text-[7px] text-muted-foreground uppercase px-1 py-0 rounded-full">
                                      {comment.author?.role}
                                    </Badge>
                                  </div>
                                  <span className="text-[9px] text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-xs text-foreground/80 mt-0.5 leading-relaxed">{comment.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Comment Input box inline */}
                      <div className="flex items-center gap-2 mt-2 pt-1">
                        <Input
                          placeholder="Reply to this thread..."
                          className="h-8 text-xs bg-background/40 border-border/40 focus-visible:ring-primary rounded-xl"
                          value={commentTexts[ann.id] || ""}
                          onChange={(e) => setCommentTexts(prev => ({ ...prev, [ann.id]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handlePostComment(ann.id);
                          }}
                        />
                        <Button
                          onClick={() => handlePostComment(ann.id)}
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 hover:bg-secondary rounded-full shrink-0"
                        >
                          <Send className="size-3.5 text-primary" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Quick Info stream sidebar */}
          <div className="space-y-6">
            <Card className="border-border bg-card/60 backdrop-blur-sm shadow-md rounded-2xl p-6">
              <h3 className="font-bold text-sm mb-3">Academic Instructors</h3>
              <div className="flex items-center gap-3">
                <Avatar className="size-11 ring-2 ring-primary/20 shadow-lg">
                  {teacher?.image && <AvatarImage src={teacher.image} alt={teacherName} />}
                  <AvatarFallback className="bg-primary/10 text-sm font-extrabold text-primary">
                    {getInitials(teacherName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-extrabold truncate text-foreground">{teacherName}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{teacher?.email || "faculty@academy.edu"}</p>
                  <Badge className="bg-primary/25 border-none text-[8px] text-primary uppercase font-black px-1.5 py-0 mt-1 rounded-full">
                    Course Director
                  </Badge>
                </div>
              </div>
            </Card>

            <Card className="border-border bg-card/60 backdrop-blur-sm shadow-md rounded-2xl p-6">
              <h3 className="font-bold text-sm mb-3">Class details</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-muted-foreground font-bold text-[9px] uppercase tracking-wider">Department</p>
                  <p className="font-semibold mt-0.5">{department?.name || "General Science"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-bold text-[9px] uppercase tracking-wider">Subject Pathway</p>
                  <p className="font-semibold mt-0.5">{subject?.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-bold text-[9px] uppercase tracking-wider">Class Code Reference</p>
                  <Badge variant="secondary" className="font-mono text-xs mt-1 border-border/30 rounded-lg">
                    {classDetails.inviteCode || "N/A"}
                  </Badge>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* ==========================================
            TAB 2: CLASSWORK & ASSIGNMENTS CENTER
            ========================================== */}
        <TabsContent value="assignments" className="space-y-6 outline-none">
          
          {/* Create Assignment Widget (Teacher only) */}
          {isTeacher && (
            <Card className="border-border bg-card/60 backdrop-blur-sm shadow-md rounded-2xl overflow-hidden max-w-3xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Plus className="size-4.5 text-blue-500" />
                  Publish new coursework assignment
                </CardTitle>
                <CardDescription>Publish new homework tasks, quizzes, and assign grades.</CardDescription>
              </CardHeader>
              <form onSubmit={handleCreateAssignment}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Assignment Title</label>
                      <Input
                        placeholder="e.g. Midterm Project Research Draft"
                        value={assignTitle}
                        onChange={(e) => setAssignTitle(e.target.value)}
                        className="h-9 bg-background/50 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Max Points Scale</label>
                      <Input
                        type="number"
                        placeholder="100"
                        value={assignMaxPoints}
                        onChange={(e) => setAssignMaxPoints(e.target.value)}
                        className="h-9 bg-background/50 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Task Guidelines</label>
                      <Textarea
                        placeholder="Detail homework requirements, grading criteria, guidelines..."
                        value={assignDesc}
                        onChange={(e) => setAssignDesc(e.target.value)}
                        className="min-h-16 bg-background/50 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Due Date Limit</label>
                      <Input
                        type="datetime-local"
                        value={assignDueDate}
                        onChange={(e) => setAssignDueDate(e.target.value)}
                        className="h-9 bg-background/50 rounded-xl"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/20 border-t border-border/20 py-3 px-6 justify-end">
                  <Button type="submit" size="sm" className="rounded-full font-bold bg-primary hover:bg-primary/95 text-primary-foreground px-5 text-xs shadow-md">
                    Publish Coursework
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}

          {/* Assignments list loop */}
          <div className="space-y-4 max-w-4xl">
            {assignments.length === 0 ? (
              <Card className="border-dashed border-border/60 bg-muted/10 p-10 text-center rounded-2xl">
                <FileText className="size-10 text-muted-foreground/45 mx-auto mb-3" />
                <h3 className="font-bold text-sm">No coursework</h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1">
                  There are no assignments published for this class yet.
                </p>
              </Card>
            ) : (
              assignments.map((assign) => {
                const mySub = mySubmissions[assign.id];
                const studentSubCount = submissions[assign.id]?.length || 0;

                return (
                  <Card key={assign.id} className="border-border bg-card/60 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden">
                    <div className="p-6 flex flex-col md:flex-row md:justify-between items-start md:items-center gap-6">
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 font-bold rounded-lg text-[10px]">
                            {assign.maxPoints} pts Scale
                          </Badge>
                          <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                            <Clock className="size-3.5" />
                            Due: {new Date(assign.dueDate).toLocaleString()}
                          </span>
                        </div>
                        <h3 className="text-base font-extrabold tracking-tight text-foreground truncate">
                          {assign.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 max-w-2xl leading-relaxed">
                          {assign.description}
                        </p>
                      </div>

                      {/* Dynamic CTA depending on role (Teacher vs Student) */}
                      <div className="shrink-0">
                        {isTeacher ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="secondary" size="sm" className="rounded-full px-4 font-bold border border-border/40 hover:bg-secondary text-xs shadow-inner">
                                Review Submissions ({studentSubCount})
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl rounded-2xl max-h-[90vh]">
                              <DialogHeader>
                                <DialogTitle className="font-black text-lg">{assign.title}</DialogTitle>
                                <DialogDescription>Review student submissions and assign points.</DialogDescription>
                              </DialogHeader>
                              <ScrollArea className="h-[400px] mt-4 pr-3 border border-border/30 rounded-xl p-2 bg-muted/10">
                                {(!submissions[assign.id] || submissions[assign.id].length === 0) ? (
                                  <div className="text-center py-20 text-muted-foreground text-xs font-semibold">
                                    No submissions uploaded yet.
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                    {submissions[assign.id].map((sub: any) => (
                                      <div key={sub.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-card p-4 rounded-xl border border-border/30 gap-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                          <Avatar className="size-8 ring-1 ring-border">
                                            {sub.student?.image && <AvatarImage src={sub.student.image} alt={sub.student.name} />}
                                            <AvatarFallback className="bg-secondary/40 text-[10px] font-bold text-primary">
                                              {getInitials(sub.student?.name)}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div className="min-w-0">
                                            <p className="text-xs font-extrabold truncate text-foreground">{sub.student?.name}</p>
                                            <p className="text-[10px] text-muted-foreground truncate">{sub.student?.email}</p>
                                          </div>
                                        </div>

                                        {/* Submission details and actions */}
                                        <div className="flex flex-wrap items-center gap-3">
                                          {sub.fileUrl && (
                                            <a href={sub.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] font-bold text-blue-500 hover:underline">
                                              View document
                                              <ExternalLink className="size-3" />
                                            </a>
                                          )}
                                          {sub.status === "graded" ? (
                                            <Badge className="bg-green-600/25 border-none text-[10px] font-black text-green-300 rounded-lg">
                                              {sub.grade} / {assign.maxPoints} scored
                                            </Badge>
                                          ) : (
                                            <Badge variant="outline" className="border-orange-500/20 text-orange-400 bg-orange-500/5 font-extrabold text-[10px] rounded-lg">
                                              Pending Grade
                                            </Badge>
                                          )}

                                          <Button
                                            onClick={() => {
                                              setGradingSubmission(sub);
                                              setGradingScore(sub.grade ? String(sub.grade) : "");
                                              setGradingFeedback(sub.feedback || "");
                                            }}
                                            size="sm"
                                            className="h-8 text-xs font-bold rounded-lg"
                                          >
                                            Grade task
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </ScrollArea>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <div className="flex items-center gap-2">
                            {mySub ? (
                              <div className="flex flex-col items-end gap-1.5">
                                {mySub.status === "graded" ? (
                                  <Badge className="bg-green-600/25 border-none text-[11px] font-black text-green-300 py-1.5 px-3 rounded-xl flex items-center gap-1 shadow-inner">
                                    <Award className="size-3.5 text-green-400" />
                                    <span>{mySub.grade} / {assign.maxPoints} graded</span>
                                  </Badge>
                                ) : (
                                  <Badge className="bg-blue-600/25 border-none text-[11px] font-extrabold text-blue-300 py-1.5 px-3 rounded-xl flex items-center gap-1 shadow-inner">
                                    <CheckCircle2 className="size-3.5 text-blue-400" />
                                    <span>Turned In</span>
                                  </Badge>
                                )}
                                {mySub.feedback && (
                                  <p className="text-[10px] font-medium text-muted-foreground italic text-right max-w-[180px]">
                                    "{mySub.feedback}"
                                  </p>
                                )}
                              </div>
                            ) : (
                              <Dialog open={submittingForId === assign.id} onOpenChange={(open) => setSubmittingForId(open ? assign.id : null)}>
                                <DialogTrigger asChild>
                                  <Button size="sm" className="rounded-full px-5 font-bold shadow-md bg-primary hover:bg-primary/95 text-primary-foreground text-xs flex items-center gap-1">
                                    <Upload className="size-3.5" />
                                    Submit homework
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-lg rounded-2xl">
                                  <DialogHeader>
                                    <DialogTitle className="font-black text-lg">Turn in: {assign.title}</DialogTitle>
                                    <DialogDescription>Attach files or type your textual response below.</DialogDescription>
                                  </DialogHeader>
                                  <form onSubmit={handleUploadSubmission} className="space-y-4 mt-2">
                                    <div className="space-y-1.5">
                                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Submission Attachment Link (e.g. PDF/Doc url)</label>
                                      <Input
                                        placeholder="https://docs.google.com/document/..."
                                        value={submitFileUrl}
                                        onChange={(e) => setSubmitFileUrl(e.target.value)}
                                        className="h-9 bg-background/50 rounded-xl"
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Text response (Optional)</label>
                                      <Textarea
                                        placeholder="Type your notes or homework summary here..."
                                        value={submitText}
                                        onChange={(e) => setSubmitText(e.target.value)}
                                        className="min-h-24 bg-background/50 rounded-xl"
                                      />
                                    </div>
                                    <DialogFooter className="pt-2">
                                      <Button type="submit" className="rounded-xl font-bold bg-primary hover:bg-primary/95 text-primary-foreground text-xs px-5 h-9 shadow-md">
                                        Hand-in Assignment
                                      </Button>
                                    </DialogFooter>
                                  </form>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>

          {/* Teacher grading drawer popup modal */}
          <Dialog open={!!gradingSubmission} onOpenChange={(open) => !open && setGradingSubmission(null)}>
            <DialogContent className="max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle className="font-black text-lg">Grade submission</DialogTitle>
                <DialogDescription>Score homework task out of points and write suggestions.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSaveGrade} className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Point Score</label>
                  <Input
                    type="number"
                    placeholder="90"
                    value={gradingScore}
                    onChange={(e) => setGradingScore(e.target.value)}
                    className="h-9 bg-background/50 rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Feedback & recommendations</label>
                  <Textarea
                    placeholder="e.g. Outstanding thesis. Focus more on bibliography formatting in the next draft!"
                    value={gradingFeedback}
                    onChange={(e) => setGradingFeedback(e.target.value)}
                    className="min-h-24 bg-background/50 rounded-xl"
                  />
                </div>
                <DialogFooter className="pt-2">
                  <Button type="submit" className="rounded-xl font-bold bg-primary hover:bg-primary/95 text-primary-foreground text-xs px-5 h-9 shadow-md">
                    Apply Grade Score
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

        </TabsContent>

        {/* ==========================================
            TAB 3: RESOURCE CENTER & STUDY MATERIALS
            ========================================== */}
        <TabsContent value="materials" className="space-y-6 outline-none">
          
          {/* Create material widget (Teacher only) */}
          {isTeacher && (
            <Card className="border-border bg-card/60 backdrop-blur-sm shadow-md rounded-2xl overflow-hidden max-w-3xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Upload className="size-4.5 text-blue-500" />
                  Publish reference materials
                </CardTitle>
                <CardDescription>Upload lecture handouts, curriculum notes, references, or external resources.</CardDescription>
              </CardHeader>
              <form onSubmit={handleUploadMaterial}>
                <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Reference Title</label>
                    <Input
                      placeholder="e.g. Chapter 4 Lecture Handout"
                      value={materialTitle}
                      onChange={(e) => setMaterialTitle(e.target.value)}
                      className="h-9 bg-background/50 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Attachment URL (PDF/Link)</label>
                    <Input
                      placeholder="https://drive.google.com/..."
                      value={materialUrl}
                      onChange={(e) => setMaterialUrl(e.target.value)}
                      className="h-9 bg-background/50 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Resource Type</label>
                    <select
                      value={materialType}
                      onChange={(e) => setMaterialType(e.target.value)}
                      className="w-full h-9 px-3 text-xs border border-input rounded-xl bg-background/50 outline-none"
                    >
                      <option value="pdf">PDF handout</option>
                      <option value="link">Link bookmark</option>
                      <option value="video">Lecturing video</option>
                    </select>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/20 border-t border-border/20 py-3 px-6 justify-end">
                  <Button type="submit" size="sm" className="rounded-full font-bold bg-primary hover:bg-primary/95 text-primary-foreground px-5 text-xs shadow-md">
                    Upload Material
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}

          {/* Materials list loop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl">
            {materials.length === 0 ? (
              <div className="sm:col-span-2">
                <Card className="border-dashed border-border/60 bg-muted/10 p-10 text-center rounded-2xl">
                  <Bookmark className="size-10 text-muted-foreground/45 mx-auto mb-3" />
                  <h3 className="font-bold text-sm">Empty repository</h3>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1">
                    There are no reference materials or documents uploaded for this class.
                  </p>
                </Card>
              </div>
            ) : (
              materials.map((material) => (
                <Card key={material.id} className="border-border bg-card/60 backdrop-blur-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 rounded-2xl p-4 flex justify-between items-center gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500 shrink-0">
                      <BookOpen className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-extrabold truncate text-foreground">{material.title}</h4>
                      <Badge className="bg-secondary/60 hover:bg-secondary/70 border-none text-[8px] text-muted-foreground font-black px-1.5 py-0.25 mt-1 uppercase rounded-full">
                        {material.fileType}
                      </Badge>
                    </div>
                  </div>
                  <a
                    href={material.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 hover:bg-secondary rounded-full border border-border/40 text-muted-foreground hover:text-primary transition-colors shrink-0"
                  >
                    <ExternalLink className="size-4" />
                  </a>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* ==========================================
            TAB 4: CLASS ROSTER
            ========================================== */}
        <TabsContent value="info" className="space-y-6 outline-none">
          
          <Card className="border-border bg-card/60 backdrop-blur-sm shadow-md rounded-2xl p-6 max-w-4xl">
            <h3 className="font-bold text-base mb-4 flex items-center gap-2">
              <Users className="size-5 text-blue-500" />
              Classroom Roster
            </h3>
            
            <div className="space-y-6">
              {/* Teacher roster row */}
              <div>
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5">Faculty lead</h4>
                <div className="flex items-center gap-3 border border-border/30 p-3 rounded-xl max-w-md bg-secondary/10">
                  <Avatar className="size-9 ring-1 ring-border">
                    {teacher?.image && <AvatarImage src={teacher.image} alt={teacherName} />}
                    <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                      {getInitials(teacherName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-foreground truncate">{teacherName}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{teacher?.email || "faculty@academy.edu"}</p>
                  </div>
                </div>
              </div>

              <Separator className="bg-border/30" />

              {/* Classmates lists */}
              <div>
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Enrolled Classmates ({capacity} seat capacity limit)</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Generate several classmates cards for a beautiful representation */}
                  <div className="flex items-center gap-3 p-3 border border-border/30 rounded-xl hover:shadow-sm transition-shadow">
                    <Avatar className="size-8 ring-1 ring-border">
                      <AvatarFallback className="bg-secondary/40 text-xs font-bold text-muted-foreground">JD</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-foreground truncate">Jordan Davis</p>
                      <p className="text-[10px] text-muted-foreground truncate">jordan@academy.edu</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border border-border/30 rounded-xl hover:shadow-sm transition-shadow">
                    <Avatar className="size-8 ring-1 ring-border">
                      <AvatarFallback className="bg-secondary/40 text-xs font-bold text-muted-foreground">MT</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-foreground truncate">Marcus Taylor</p>
                      <p className="text-[10px] text-muted-foreground truncate">marcus@academy.edu</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border border-border/30 rounded-xl hover:shadow-sm transition-shadow">
                    <Avatar className="size-8 ring-1 ring-border">
                      <AvatarFallback className="bg-secondary/40 text-xs font-bold text-muted-foreground">SL</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-foreground truncate">Sarah Lewis</p>
                      <p className="text-[10px] text-muted-foreground truncate">sarah@academy.edu</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </ShowView>
  );
}
