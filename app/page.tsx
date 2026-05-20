"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
      });
      if (error) throw error;
      toast.success("매직링크를 이메일로 보냈습니다.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto grid max-w-3xl gap-6 py-12">
      <div>
        <h1 className="text-3xl font-bold">개인 일정 매니저</h1>
        <p className="mt-2 text-slate-600">이메일 매직링크로 로그인하고 CSV로 일정을 한 번에 올리세요.</p>
      </div>
      <form onSubmit={signIn} className="panel grid gap-3">
        <label className="text-sm font-semibold" htmlFor="email">이메일</label>
        <input id="email" className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        <button className="btn" disabled={loading}>{loading ? "전송 중..." : "매직링크 받기"}</button>
      </form>
    </section>
  );
}
