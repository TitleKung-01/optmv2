import Link from "next/link";

export default function AuthHeader() {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex items-center w-full px-6 lg:px-10 py-5">
      <Link href="/" className="flex items-center gap-2.5 no-underline">
        <div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center">
          <span
            className="material-symbols-outlined text-on-primary text-[20px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            bolt
          </span>
        </div>
        <span className="text-lg font-bold text-on-surface tracking-tight">
          Smart Scheduler
        </span>
      </Link>
    </header>
  );
}
