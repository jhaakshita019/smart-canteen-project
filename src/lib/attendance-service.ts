export interface StudentAttendanceRecord {
  id: string;
  name: string;
  rollNo: string;
  branch: string;
  year: number;
  attendance: "present" | "absent";
  foodChoice: "canteen" | "tiffin" | "not_eating";
  markedAt: string;
  isCurrentUser?: boolean;
}

const STORAGE_KEY = "smart_canteen_student_attendance_v2";

export const INITIAL_STUDENTS_50: StudentAttendanceRecord[] = [
  { id: "s-demo", name: "Aarav Sharma (Demo Student)", rollNo: "23CS001", branch: "Computer Science", year: 3, attendance: "present", foodChoice: "canteen", markedAt: "08:45 AM", isCurrentUser: true },
  { id: "s-2", name: "Priya Verma", rollNo: "23CS002", branch: "Computer Science", year: 3, attendance: "present", foodChoice: "tiffin", markedAt: "08:50 AM" },
  { id: "s-3", name: "Rohan Kulkarni", rollNo: "23EC014", branch: "Electronics", year: 3, attendance: "present", foodChoice: "canteen", markedAt: "08:52 AM" },
  { id: "s-4", name: "Ananya Iyer", rollNo: "24CS005", branch: "Computer Science", year: 2, attendance: "present", foodChoice: "tiffin", markedAt: "08:55 AM" },
  { id: "s-5", name: "Vikram Singh", rollNo: "22ME021", branch: "Mechanical", year: 4, attendance: "present", foodChoice: "canteen", markedAt: "08:58 AM" },
  { id: "s-6", name: "Sneha Patil", rollNo: "23IT008", branch: "IT", year: 3, attendance: "present", foodChoice: "canteen", markedAt: "09:00 AM" },
  { id: "s-7", name: "Aditya Gupta", rollNo: "24EC019", branch: "Electronics", year: 2, attendance: "present", foodChoice: "tiffin", markedAt: "09:02 AM" },
  { id: "s-8", name: "Tanvi Deshmukh", rollNo: "24CS023", branch: "Computer Science", year: 2, attendance: "present", foodChoice: "canteen", markedAt: "09:05 AM" },
  { id: "s-9", name: "Harsh Mehta", rollNo: "23CV011", branch: "Civil", year: 3, attendance: "present", foodChoice: "tiffin", markedAt: "09:06 AM" },
  { id: "s-10", name: "Pooja Nair", rollNo: "22CS040", branch: "Computer Science", year: 4, attendance: "present", foodChoice: "canteen", markedAt: "09:08 AM" },
  { id: "s-11", name: "Devansh Joshi", rollNo: "24EE015", branch: "Electrical", year: 2, attendance: "present", foodChoice: "canteen", markedAt: "09:10 AM" },
  { id: "s-12", name: "Ishita Roy", rollNo: "23IT029", branch: "IT", year: 3, attendance: "present", foodChoice: "tiffin", markedAt: "09:11 AM" },
  { id: "s-13", name: "Siddharth Rao", rollNo: "22ME035", branch: "Mechanical", year: 4, attendance: "absent", foodChoice: "not_eating", markedAt: "—" },
  { id: "s-14", name: "Meera Nambiar", rollNo: "24CS044", branch: "Computer Science", year: 2, attendance: "present", foodChoice: "canteen", markedAt: "09:14 AM" },
  { id: "s-15", name: "Kabir Bhatia", rollNo: "23EC032", branch: "Electronics", year: 3, attendance: "present", foodChoice: "canteen", markedAt: "09:15 AM" },
  { id: "s-16", name: "Riya Sen", rollNo: "24IT012", branch: "IT", year: 2, attendance: "present", foodChoice: "tiffin", markedAt: "09:18 AM" },
  { id: "s-17", name: "Aryan Chawla", rollNo: "23CS051", branch: "Computer Science", year: 3, attendance: "present", foodChoice: "canteen", markedAt: "09:20 AM" },
  { id: "s-18", name: "Divya Menon", rollNo: "22CV018", branch: "Civil", year: 4, attendance: "present", foodChoice: "tiffin", markedAt: "09:22 AM" },
  { id: "s-19", name: "Yash Singhania", rollNo: "24ME007", branch: "Mechanical", year: 2, attendance: "present", foodChoice: "canteen", markedAt: "09:25 AM" },
  { id: "s-20", name: "Neha Kapoor", rollNo: "23EE024", branch: "Electrical", year: 3, attendance: "absent", foodChoice: "not_eating", markedAt: "—" },
  { id: "s-21", name: "Kunal Bansal", rollNo: "24CS060", branch: "Computer Science", year: 2, attendance: "present", foodChoice: "canteen", markedAt: "09:28 AM" },
  { id: "s-22", name: "Shreya Ghoshal", rollNo: "23EC041", branch: "Electronics", year: 3, attendance: "present", foodChoice: "tiffin", markedAt: "09:30 AM" },
  { id: "s-23", name: "Varun Dhavan", rollNo: "22ME049", branch: "Mechanical", year: 4, attendance: "present", foodChoice: "canteen", markedAt: "09:32 AM" },
  { id: "s-24", name: "Kriti Sanon", rollNo: "24IT033", branch: "IT", year: 2, attendance: "present", foodChoice: "canteen", markedAt: "09:34 AM" },
  { id: "s-25", name: "Nikhil Kamath", rollNo: "23CS072", branch: "Computer Science", year: 3, attendance: "present", foodChoice: "tiffin", markedAt: "09:35 AM" },
  { id: "s-26", name: "Anushka Pandey", rollNo: "22CV027", branch: "Civil", year: 4, attendance: "absent", foodChoice: "not_eating", markedAt: "—" },
  { id: "s-27", name: "Gaurav Taneja", rollNo: "24ME019", branch: "Mechanical", year: 2, attendance: "present", foodChoice: "canteen", markedAt: "09:38 AM" },
  { id: "s-28", name: "Sanya Malhotra", rollNo: "23EE038", branch: "Electrical", year: 3, attendance: "present", foodChoice: "tiffin", markedAt: "09:40 AM" },
  { id: "s-29", name: "Aakash Chopra", rollNo: "24CS081", branch: "Computer Science", year: 2, attendance: "present", foodChoice: "canteen", markedAt: "09:42 AM" },
  { id: "s-30", name: "Deepika Padukone", rollNo: "23EC056", branch: "Electronics", year: 3, attendance: "present", foodChoice: "canteen", markedAt: "09:44 AM" },
  { id: "s-31", name: "Manish Sisodia", rollNo: "22ME058", branch: "Mechanical", year: 4, attendance: "present", foodChoice: "tiffin", markedAt: "09:45 AM" },
  { id: "s-32", name: "Tanya Sharma", rollNo: "24IT045", branch: "IT", year: 2, attendance: "present", foodChoice: "canteen", markedAt: "09:48 AM" },
  { id: "s-33", name: "Pranav Mistry", rollNo: "23CS093", branch: "Computer Science", year: 3, attendance: "absent", foodChoice: "not_eating", markedAt: "—" },
  { id: "s-34", name: "Rashi Khanna", rollNo: "22CV036", branch: "Civil", year: 4, attendance: "present", foodChoice: "canteen", markedAt: "09:50 AM" },
  { id: "s-35", name: "Sameer Verma", rollNo: "24ME031", branch: "Mechanical", year: 2, attendance: "present", foodChoice: "tiffin", markedAt: "09:52 AM" },
  { id: "s-36", name: "Bhavna Patel", rollNo: "23EE049", branch: "Electrical", year: 3, attendance: "present", foodChoice: "canteen", markedAt: "09:54 AM" },
  { id: "s-37", name: "Chirag Paswan", rollNo: "24CS102", branch: "Computer Science", year: 2, attendance: "present", foodChoice: "canteen", markedAt: "09:55 AM" },
  { id: "s-38", name: "Juhi Chawla", rollNo: "23EC068", branch: "Electronics", year: 3, attendance: "present", foodChoice: "tiffin", markedAt: "09:58 AM" },
  { id: "s-39", name: "Farhan Akhtar", rollNo: "22ME067", branch: "Mechanical", year: 4, attendance: "absent", foodChoice: "not_eating", markedAt: "—" },
  { id: "s-40", name: "Nidhi Agrawal", rollNo: "24IT058", branch: "IT", year: 2, attendance: "present", foodChoice: "canteen", markedAt: "10:00 AM" },
  { id: "s-41", name: "Omkar Salunkhe", rollNo: "23CS115", branch: "Computer Science", year: 3, attendance: "present", foodChoice: "canteen", markedAt: "10:02 AM" },
  { id: "s-42", name: "Pallavi Sharda", rollNo: "22CV045", branch: "Civil", year: 4, attendance: "present", foodChoice: "tiffin", markedAt: "10:04 AM" },
  { id: "s-43", name: "Raghav Juyal", rollNo: "24ME042", branch: "Mechanical", year: 2, attendance: "present", foodChoice: "canteen", markedAt: "10:05 AM" },
  { id: "s-44", name: "Swati Reddy", rollNo: "23EE059", branch: "Electrical", year: 3, attendance: "present", foodChoice: "canteen", markedAt: "10:08 AM" },
  { id: "s-45", name: "Udit Narayan", rollNo: "24CS128", branch: "Computer Science", year: 2, attendance: "present", foodChoice: "tiffin", markedAt: "10:10 AM" },
  { id: "s-46", name: "Vidya Balan", rollNo: "23EC079", branch: "Electronics", year: 3, attendance: "absent", foodChoice: "not_eating", markedAt: "—" },
  { id: "s-47", name: "Zeeshan Ayyub", rollNo: "22ME078", branch: "Mechanical", year: 4, attendance: "present", foodChoice: "canteen", markedAt: "10:12 AM" },
  { id: "s-48", name: "Kajal Aggarwal", rollNo: "24IT069", branch: "IT", year: 2, attendance: "present", foodChoice: "canteen", markedAt: "10:14 AM" },
  { id: "s-49", name: "Lokesh Rahul", rollNo: "23CS139", branch: "Computer Science", year: 3, attendance: "present", foodChoice: "tiffin", markedAt: "10:15 AM" },
  { id: "s-50", name: "Monika Rawat", rollNo: "22CV054", branch: "Civil", year: 4, attendance: "present", foodChoice: "canteen", markedAt: "10:18 AM" },
];

export function getStudentAttendanceList(): StudentAttendanceRecord[] {
  if (typeof window === "undefined") return INITIAL_STUDENTS_50;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STUDENTS_50));
      return INITIAL_STUDENTS_50;
    }
    const parsed = JSON.parse(raw) as StudentAttendanceRecord[];
    if (parsed.length < INITIAL_STUDENTS_50.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STUDENTS_50));
      return INITIAL_STUDENTS_50;
    }
    return parsed;
  } catch {
    return INITIAL_STUDENTS_50;
  }
}

export function updateStudentAttendance(
  studentId: string,
  attendance: "present" | "absent",
  foodChoice: "canteen" | "tiffin" | "not_eating"
): void {
  if (typeof window === "undefined") return;
  try {
    const list = getStudentAttendanceList();
    const target = list.find((s) => s.id === studentId || s.isCurrentUser);
    if (target) {
      target.attendance = attendance;
      target.foodChoice = attendance === "absent" ? "not_eating" : foodChoice;
      target.markedAt = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      window.dispatchEvent(new Event("smart_canteen_attendance_updated"));
    }
  } catch (e) {
    console.error("Failed to update student attendance:", e);
  }
}
