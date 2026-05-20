"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  categories,
  priorities,
  statuses,
  categoryLabels,
  priorityLabels,
  statusLabels,
  type Schedule,
  type Category,
  type Priority,
  type Status,
} from "@/types/schedule";

type Props = { initial?: Partial<Schedule>; onSaved?: () => void };

export default function ScheduleForm({ initial, onSaved }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [startDate, setStartDate] = useState(toLocalInput(initial?.start_date));
  const [endDate, setEndDate] = useState(toLocalInput(initial?.end_date));
  const [category, setCategory] = useState<Category>(initial?.category ?? "etc");
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? "medium");
  const [status, setStatus] = useState<Status>(initial?.status ?? "pending");
  const [allDay, setAllDay] = useState(initial?.all_day ?? false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;
      if (!user) throw new Error("로그인이 필요합니다.");

      const payload = {
        user_id: user.id,
        title,
        start_date: new Date(startDate).toISOString(),
        end_date: endDate ? new Date(endDate).toISOString() : null,
        category,
        priority,
        status,
        all_day: allDay,
      };

      if (initial?.id) {
        const { error } = await supabase.from("schedules").update(payload).eq("id", initial.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("schedules").insert(payload);
        if (error) throw error;
      }

      toast.success("저장되었습니다.");
      onSaved?.();
      if (!initial?.id) {
        setTitle("");
        setStartDate("");
        setEndDate("");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="grid gap-3" onSubmit={handleSubmit}>
      <input className="input" placeholder="제목" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <input className="input" type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
      <input className="input" type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      <div className="grid gap-3 md:grid-cols-3">
        <select className="input" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
          {categories.map((value) => <option key={value} value={value}>{categoryLabels[value]}</option>)}
        </select>
        <select className="input" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
          {priorities.map((value) => <option key={value} value={value}>{priorityLabels[value]}</option>)}
        </select>
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value as Status)}>
          {statuses.map((value) => <option key={value} value={value}>{statusLabels[value]}</option>)}
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} />종일 일정</label>
      <button className="btn" disabled={loading}>{loading ? "저장 중..." : "저장"}</button>
    </form>
  );
}

function toLocalInput(dateString?: string | null) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
