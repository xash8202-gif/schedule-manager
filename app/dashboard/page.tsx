import { createClient } from "@/lib/supabase/server";
import ScheduleForm from "@/components/ScheduleForm";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("schedules").select("*").order("start_date", { ascending: true }).limit(10);

  return (
    <section className="grid gap-4">
      <h1 className="text-2xl font-bold">대시보드</h1>
      <div className="panel">
        <h2 className="mb-3 font-bold">일정 추가</h2>
        <ScheduleForm />
      </div>
      <div className="panel">
        <h2 className="mb-3 font-bold">다가오는 일정</h2>
        <ul className="grid gap-2 text-sm">
          {(data ?? []).map((item) => <li key={item.id}>{new Date(item.start_date).toLocaleString("ko-KR")} - {item.title}</li>)}
        </ul>
      </div>
    </section>
  );
}
