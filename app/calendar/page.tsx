"use client";

import { useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { createClient } from "@/lib/supabase/client";
import { type Schedule } from "@/types/schedule";

export default function CalendarPage() {
  const [items, setItems] = useState<Schedule[]>([]);

  useEffect(() => {
    const run = async () => {
      const supabase = createClient();
      const { data } = await supabase.from("schedules").select("*").order("start_date", { ascending: true });
      setItems((data as Schedule[]) ?? []);
    };
    void run();
  }, []);

  const events = useMemo(
    () => items.map((item) => ({ id: item.id, title: item.title, start: item.start_date, end: item.end_date ?? undefined, allDay: item.all_day, color: item.color ?? undefined })),
    [items],
  );

  return (
    <section className="grid gap-4">
      <h1 className="text-2xl font-bold">캘린더</h1>
      <div className="panel">
        <FullCalendar plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]} initialView="dayGridMonth" headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,timeGridDay" }} events={events} height="auto" />
      </div>
    </section>
  );
}
