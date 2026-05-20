"use client";

import { useMemo, useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { categories, priorities, statuses, type ScheduleInsert } from "@/types/schedule";

type RawRow = Record<string, unknown>;
type ValidRow = ScheduleInsert & { sourceRow: number };
type FailedRow = RawRow & { rowNumber: number; reason: string };

const dbFields = ["title", "start_date", "end_date", "all_day", "category", "priority", "status", "location", "memo", "is_recurring", "reminder_at", "tags", "color"] as const;

export default function CsvUploader() {
  const [rows, setRows] = useState<RawRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [validRows, setValidRows] = useState<ValidRow[]>([]);
  const [failedRows, setFailedRows] = useState<FailedRow[]>([]);
  const [checkDup, setCheckDup] = useState(true);
  const [progress, setProgress] = useState(0);

  const preview = useMemo(() => rows.slice(0, 10), [rows]);

  async function readFile(file: File) {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "xlsx") {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      hydrateRows(XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: "" }));
      return;
    }
    Papa.parse<RawRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => hydrateRows(result.data),
      error: (error) => toast.error(error.message),
    });
  }

  function hydrateRows(nextRows: RawRow[]) {
    const nextHeaders = Object.keys(nextRows[0] ?? {});
    const autoMap = Object.fromEntries(dbFields.map((field) => [field, nextHeaders.find((h) => normalize(h) === normalize(field)) ?? ""]));
    setRows(nextRows);
    setHeaders(nextHeaders);
    setMapping(autoMap);
    setValidRows([]);
    setFailedRows([]);
    setProgress(0);
    toast.success(`${nextRows.length}행을 읽었습니다.`);
  }

  async function validateRows() {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요합니다.");

      const seen = new Set<string>();
      const existing = new Set<string>();
      if (checkDup && rows.length > 0) {
        const times = rows.map((row) => parseDate(text(row, mapping.start_date))?.getTime()).filter((n): n is number => typeof n === "number");
        if (times.length > 0) {
          const minDate = new Date(Math.min(...times)).toISOString();
          const maxDate = new Date(Math.max(...times)).toISOString();
          const { data } = await supabase.from("schedules").select("title,start_date").gte("start_date", minDate).lte("start_date", maxDate);
          for (const item of data ?? []) existing.add(scheduleKey(item.title, new Date(item.start_date)));
        }
      }

      const ok: ValidRow[] = [];
      const fail: FailedRow[] = [];

      rows.forEach((row, index) => {
        const rowNumber = index + 2;
        const title = text(row, mapping.title);
        const start = parseDate(text(row, mapping.start_date));
        const endText = text(row, mapping.end_date);
        const end = endText ? parseDate(endText) : null;

        if (!title || title.length > 200) return fail.push({ ...row, rowNumber, reason: "title은 필수이고 200자 이하여야 합니다." });
        if (!start) return fail.push({ ...row, rowNumber, reason: "start_date 형식이 올바르지 않습니다." });
        if (end && end <= start) return fail.push({ ...row, rowNumber, reason: "end_date는 start_date 이후여야 합니다." });

        const key = scheduleKey(title, start);
        if (checkDup && (seen.has(key) || existing.has(key))) return fail.push({ ...row, rowNumber, reason: "중복 일정입니다(title+start_date)." });
        seen.add(key);

        ok.push({
          sourceRow: rowNumber,
          user_id: user.id,
          title,
          start_date: start.toISOString(),
          end_date: end?.toISOString() ?? null,
          all_day: bool(row, mapping.all_day),
          category: enumValue(text(row, mapping.category), categories, "etc"),
          priority: enumValue(text(row, mapping.priority), priorities, "medium"),
          status: enumValue(text(row, mapping.status), statuses, "pending"),
          location: text(row, mapping.location) || null,
          memo: text(row, mapping.memo) || null,
          is_recurring: bool(row, mapping.is_recurring),
          reminder_at: parseDate(text(row, mapping.reminder_at))?.toISOString() ?? null,
          tags: splitTags(text(row, mapping.tags)),
          color: text(row, mapping.color) || null,
        });
      });

      setValidRows(ok);
      setFailedRows(fail);
      toast.success(`검증 완료: 성공 ${ok.length}건, 실패 ${fail.length}건`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "검증에 실패했습니다.");
    }
  }

  async function upload() {
    try {
      const supabase = createClient();
      let done = 0;
      for (let i = 0; i < validRows.length; i += 100) {
        const batch = validRows.slice(i, i + 100).map((item) => {
          const { sourceRow: sourceRowToDrop, ...row } = item;
          void sourceRowToDrop;
          return row;
        });
        const { error } = await supabase.from("schedules").insert(batch);
        if (error) throw error;
        done += batch.length;
        setProgress(Math.round((done / validRows.length) * 100));
      }
      toast.success(`${done}건 업로드 완료`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "업로드에 실패했습니다.");
    }
  }

  return (
    <div className="grid gap-4">
      <div className="panel grid place-items-center border-dashed py-8" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) void readFile(file); }}>
        <input className="input max-w-md" type="file" accept=".csv,.xlsx" onChange={(e) => { const file = e.target.files?.[0]; if (file) void readFile(file); }} />
        <p className="mt-2 text-sm text-slate-500">CSV 또는 XLSX 파일을 업로드하세요.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={checkDup} onChange={(e) => setCheckDup(e.target.checked)} />중복 검사</label>
      </div>
      {preview.length > 0 && <div className="panel overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{headers.map((h) => <th className="border-b p-2" key={h}>{h}</th>)}</tr></thead><tbody>{preview.map((row, i) => <tr key={i}>{headers.map((h) => <td className="border-b p-2" key={h}>{String(row[h] ?? "")}</td>)}</tr>)}</tbody></table></div>}
      {headers.length > 0 && <div className="panel grid gap-3 md:grid-cols-2">{dbFields.map((field) => <label className="grid gap-1 text-sm" key={field}><span className="font-semibold">{field}</span><select className="input" value={mapping[field] ?? ""} onChange={(e) => setMapping({ ...mapping, [field]: e.target.value })}><option value="">매핑 안 함</option>{headers.map((h) => <option key={h} value={h}>{h}</option>)}</select></label>)}</div>}
      <div className="flex flex-wrap gap-2"><button className="btn" disabled={rows.length === 0} onClick={validateRows}>유효성 검사</button><button className="btn" disabled={validRows.length === 0} onClick={upload}>업로드 실행</button></div>
      <div className="panel"><p className="text-sm">성공: {validRows.length}건 / 실패: {failedRows.length}건 / 진행률: {progress}%</p>{failedRows.slice(0, 20).map((row) => <p className="mt-1 text-sm text-red-600" key={row.rowNumber}>{row.rowNumber}행: {row.reason}</p>)}</div>
    </div>
  );
}

function normalize(value: string) { return value.toLowerCase().replace(/[\s_-]/g, ""); }
function scheduleKey(title: string, date: Date) { return `${title.trim()}__${date.getTime()}`; }
function text(row: RawRow, key?: string) { return key ? String(row[key] ?? "").trim() : ""; }
function parseDate(value: string): Date | null {
  if (!value) return null;
  let normalized = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) normalized = `${normalized}T00:00:00`;
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/.test(normalized)) normalized = normalized.replace(" ", "T");
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? null : d;
}
function bool(row: RawRow, key?: string) { return ["true", "1", "yes", "y"].includes(text(row, key).toLowerCase()); }
function enumValue<T extends string>(value: string, allowed: readonly T[], fallback: T): T { return allowed.includes(value as T) ? (value as T) : fallback; }
function splitTags(value: string) { return value ? value.split(/[;,]/).map((v) => v.trim()).filter(Boolean) : null; }
