import CsvUploader from "@/components/CsvUploader";

export default function ImportPage() {
  return (
    <section className="grid gap-4">
      <div>
        <h1 className="text-2xl font-bold">CSV 업로드</h1>
        <p className="mt-2 text-sm text-slate-600">파일 선택, 미리보기, 컬럼 매핑, 검증, 업로드를 순서대로 진행하세요.</p>
      </div>
      <CsvUploader />
    </section>
  );
}
