"use client";
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="grid min-h-[60dvh] place-items-center p-6 text-center">
      <div>
        <h1 className="text-3xl">Алдаа гарлаа</h1>
        <p className="mt-2 text-[var(--text-2)]">Хуудсыг ачаалах үед гэнэтийн алдаа гарлаа. Дахин оролдоно уу.</p>
        <button className="btn btn-primary mt-6" onClick={reset}>Дахин оролдох</button>
      </div>
    </div>
  );
}
