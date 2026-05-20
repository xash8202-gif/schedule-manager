"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { categoryLabels, priorityLabels, statusLabels, type Schedule } from "@/types/schedule";
import ScheduleForm from "@/components/ScheduleForm";

export default function ListPage() {
  const [items, setItems] = useState<Schedule[]>([]);
  const [editing, setEditing] = useState<Schedule | null>(null);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase.from("schedules").select("*").order("start_date", { ascending: true });
    setItems((data as Schedule[]) ?? []);
  }

  async function remove(id: string) {
    const supabase = createClient();
    await supabase.from("schedules").delete().eq("id", id);
    await load();
  }

  useEffect(() => { void load(); }, []);

  return (
    <section className="grid gap-4">
      <h1 className="text-2xl font-bold">일정 리스트</h1>
      <div className="panel overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead><tr><th className="p-2">제목</th><th className="p-2">시작</th><th className="p-2">카테고리</th><th className="p-2">우선순위</th><th className="p-2">상태</th><th className="p-2" /></tr></thead>
          <tbody>{items.map((item) => <tr key={item.id}><td className="border-t p-2">{item.title}</td><td className="border-t p-2">{new Date(item.start_date).toLocaleString("ko-KR")}</td><td className="border-t p-2">{categoryLabels[item.category]}</td><td className="border-t p-2">{priorityLabels[item.priority]}</td><td className="border-t p-2">{statusLabels[item.status]}</td><td className="border-t p-2"><div className="flex gap-2"><button className="btn-secondary" onClick={() => setEditing(item)}>수정</button><button className="btn-secondary" onClick={() => void remove(item.id)}>삭제</button></div></td></tr>)}</tbody>
        </table>
      </div>
      {editing && <div className="panel"><h2 className="mb-3 font-bold">일정 수정</h2><ScheduleForm initial={editing} onSaved={() => { setEditing(null); void load(); }} /></div>}
    </section>
  );
}
