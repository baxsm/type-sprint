import Link from "next/link";
import Button from "@/components/ui/button";
import { Subtitle, Title } from "@/components/ui/typography";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <Title as="h1" className="font-mono text-4xl">
        404
      </Title>
      <Subtitle>This page does not exist.</Subtitle>
      <Link href="/">
        <Button>Back home</Button>
      </Link>
    </div>
  );
}
