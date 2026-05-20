export type Category = "work" | "personal" | "study" | "health" | "meeting" | "etc";
export type Priority = "high" | "medium" | "low";
export type Status = "pending" | "in_progress" | "done" | "hold";

export type Schedule = {
  id: string;
  user_id: string;
  title: string;
  start_date: string;
  end_date: string | null;
  all_day: boolean;
  category: Category;
  priority: Priority;
  status: Status;
  location: string | null;
  memo: string | null;
  is_recurring: boolean;
  reminder_at: string | null;
  tags: string[] | null;
  color: string | null;
  created_at: string;
  updated_at: string;
};

export type ScheduleInsert = Omit<Schedule, "id" | "created_at" | "updated_at">;

export const categories: Category[] = ["work", "personal", "study", "health", "meeting", "etc"];
export const priorities: Priority[] = ["high", "medium", "low"];
export const statuses: Status[] = ["pending", "in_progress", "done", "hold"];

export const categoryLabels: Record<Category, string> = {
  work: "업무",
  personal: "개인",
  study: "공부",
  health: "건강",
  meeting: "회의",
  etc: "기타",
};

export const statusLabels: Record<Status, string> = {
  pending: "대기",
  in_progress: "진행 중",
  done: "완료",
  hold: "보류",
};

export const priorityLabels: Record<Priority, string> = {
  high: "높음",
  medium: "보통",
  low: "낮음",
};
