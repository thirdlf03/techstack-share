import { Metadata } from "next";
import { decode } from "@/lib/encoder";
import { ShareCard } from "@/components/share-card";
import { SharePageClient } from "./client";

type Props = {
  params: Promise<{ hash: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { hash } = await params;
  return {
    title: "TechStack Share",
    description: "Check out my tech stack!",
    openGraph: {
      title: "TechStack Share",
      description: "Check out my tech stack!",
      images: [`/api/og?data=${hash}`],
    },
    twitter: {
      card: "summary_large_image",
      title: "TechStack Share",
      description: "Check out my tech stack!",
      images: [`/api/og?data=${hash}`],
    },
  };
}

export default async function SharePage({ params }: Props) {
  const { hash } = await params;

  let stack;
  try {
    stack = decode(hash);
  } catch {
    return (
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-2xl font-bold mb-4">無効な共有リンク</h1>
        <p className="text-muted-foreground">共有コードが正しくありません。</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-2">TechStack Share</h1>
      <p className="text-muted-foreground mb-6">共有された技術スタック</p>

      <ShareCard stack={stack} />

      <SharePageClient hash={hash} />
    </main>
  );
}
