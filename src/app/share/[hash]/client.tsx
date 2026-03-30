"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

type SharePageClientProps = {
  hash: string;
};

export function SharePageClient({ hash }: SharePageClientProps) {
  return (
    <div className="flex gap-3 mt-6">
      <Link href={`/?restore=${hash}`} prefetch={false}>
        <Button variant="outline">このスタックを編集</Button>
      </Link>
    </div>
  );
}
