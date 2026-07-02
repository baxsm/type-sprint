import Link from "next/link";
import Button from "@/components/ui/button";
import ThemeToggle from "@/components/ui/theme-toggle";

const LandingHeader = () => {
  return (
    <header className="sticky top-0 z-20 border-b-[3px] border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-mono text-lg font-bold tracking-tight"
        >
          <span className="text-[var(--color-primary)]">type</span>
          <span className="-ml-2">sprint</span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/app">
            <Button>Open app</Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default LandingHeader;
