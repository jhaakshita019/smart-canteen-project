import { useState, useEffect } from "react";
import {
  getStudentAttendanceList,
  type StudentAttendanceRecord,
} from "@/lib/attendance-service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Utensils,
  Briefcase,
  UserCheck,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  GraduationCap,
  Sparkles,
} from "lucide-react";

export function CanteenStudentAttendanceSection() {
  const [students, setStudents] = useState<StudentAttendanceRecord[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "canteen" | "tiffin" | "absent">("all");

  function reload() {
    setStudents(getStudentAttendanceList());
  }

  useEffect(() => {
    reload();
    const handleUpdate = () => reload();
    window.addEventListener("smart_canteen_attendance_updated", handleUpdate);
    return () => window.removeEventListener("smart_canteen_attendance_updated", handleUpdate);
  }, []);

  const totalStudents = students.length;
  const presentStudents = students.filter((s) => s.attendance === "present");
  const absentStudents = students.filter((s) => s.attendance === "absent");
  const eatingCanteen = students.filter((s) => s.attendance === "present" && s.foodChoice === "canteen");
  const eatingTiffin = students.filter((s) => s.attendance === "present" && s.foodChoice === "tiffin");

  const filteredStudents = students.filter((s) => {
    const q = search.toLowerCase();
    const matchesSearch =
      s.name.toLowerCase().includes(q) ||
      s.rollNo.toLowerCase().includes(q) ||
      s.branch.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (filter === "canteen") return s.attendance === "present" && s.foodChoice === "canteen";
    if (filter === "tiffin") return s.attendance === "present" && s.foodChoice === "tiffin";
    if (filter === "absent") return s.attendance === "absent";
    return true;
  });

  return (
    <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary text-primary-foreground">
              <Users className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-bold font-display">
              Student Attendance & Meal Demand Monitor (50 Students)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time campus attendance and lunch choices (Canteen Food vs Brought Tiffin) to calculate exact cooking quantities.
          </p>
        </div>

        <div className="bg-primary/10 text-primary border border-primary/20 px-3.5 py-1.5 rounded-xl text-xs font-bold w-fit">
          👨‍🍳 Cook Demand: {eatingCanteen.length} Canteen Plates
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border bg-muted/40 p-3.5 text-center">
          <div className="text-2xl font-black text-foreground font-display">
            {presentStudents.length} / {totalStudents}
          </div>
          <div className="text-[11px] font-semibold text-muted-foreground uppercase mt-0.5">
            Students Present Today
          </div>
        </div>

        <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-3.5 text-center">
          <div className="text-2xl font-black text-green-700 dark:text-green-300 font-display">
            {eatingCanteen.length} Plates
          </div>
          <div className="text-[11px] font-semibold text-green-800 dark:text-green-400 uppercase mt-0.5">
            Eating Canteen Food
          </div>
        </div>

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3.5 text-center">
          <div className="text-2xl font-black text-amber-700 dark:text-amber-300 font-display">
            {eatingTiffin.length} Students
          </div>
          <div className="text-[11px] font-semibold text-amber-800 dark:text-amber-400 uppercase mt-0.5">
            Brought Own Tiffin
          </div>
        </div>

        <div className="rounded-xl border bg-muted/40 p-3.5 text-center">
          <div className="text-2xl font-black text-destructive font-display">
            {absentStudents.length} Students
          </div>
          <div className="text-[11px] font-semibold text-muted-foreground uppercase mt-0.5">
            Marked Absent
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-2">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search student, roll no, branch..."
            className="pl-9 h-9 text-xs sm:text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          <Button
            size="sm"
            variant={filter === "all" ? "default" : "outline"}
            className="text-xs h-8"
            onClick={() => setFilter("all")}
          >
            All (50)
          </Button>
          <Button
            size="sm"
            variant={filter === "canteen" ? "default" : "outline"}
            className="text-xs h-8"
            onClick={() => setFilter("canteen")}
          >
            🍽️ Canteen ({eatingCanteen.length})
          </Button>
          <Button
            size="sm"
            variant={filter === "tiffin" ? "default" : "outline"}
            className="text-xs h-8"
            onClick={() => setFilter("tiffin")}
          >
            🍱 Tiffin ({eatingTiffin.length})
          </Button>
          <Button
            size="sm"
            variant={filter === "absent" ? "default" : "outline"}
            className="text-xs h-8"
            onClick={() => setFilter("absent")}
          >
            🔴 Absent ({absentStudents.length})
          </Button>
        </div>
      </div>

      {/* 50 Students Table */}
      <div className="rounded-xl border overflow-hidden">
        <div className="overflow-x-auto max-h-[460px]">
          <table className="w-full text-xs sm:text-sm text-left">
            <thead className="bg-muted text-muted-foreground uppercase text-[10px] tracking-wider sticky top-0 z-10 shadow-xs">
              <tr>
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Roll No</th>
                <th className="py-2.5 px-3">Branch & Year</th>
                <th className="py-2.5 px-3">Attendance</th>
                <th className="py-2.5 px-3">Today's Meal Choice</th>
                <th className="py-2.5 px-3 text-right">Logged At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-muted-foreground text-xs">
                    No student records matching your filter.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, idx) => {
                  const isPresent = s.attendance === "present";

                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-muted/40 transition-colors ${
                        s.isCurrentUser ? "bg-primary/5 font-medium" : ""
                      }`}
                    >
                      <td className="py-2.5 px-3 text-muted-foreground">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-foreground">
                        {s.name}
                        {s.isCurrentUser && (
                          <span className="ml-1.5 text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-bold">
                            Logged-in
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground font-mono text-xs">{s.rollNo}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">
                        {s.branch} · Y{s.year}
                      </td>
                      <td className="py-2.5 px-3">
                        {isPresent ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-100 dark:bg-green-950/60 dark:text-green-300 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="h-3 w-3" /> Present
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-100 dark:bg-red-950/60 dark:text-red-300 px-2 py-0.5 rounded-full">
                            <XCircle className="h-3 w-3" /> Absent
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        {!isPresent ? (
                          <span className="text-muted-foreground text-xs italic">— Not Eating (Absent)</span>
                        ) : s.foodChoice === "canteen" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            <Utensils className="h-3 w-3" /> Eating Canteen Food
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 px-2 py-0.5 rounded-full">
                            <Briefcase className="h-3 w-3" /> Brought Tiffin
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right text-muted-foreground text-xs">{s.markedAt}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
