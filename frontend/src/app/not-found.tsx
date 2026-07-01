import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <h1 className="font-mono text-4xl font-bold">404</h1>
      <p className="text-[var(--color-dim)]">This page does not exist.</p>
      <Link
        href="/"
        className="rounded-lg bg-[var(--color-accent)] px-5 py-2 font-medium text-white transition-opacity hover:opacity-90"
      >
        Back home
      </Link>
    </div>
  );
}
