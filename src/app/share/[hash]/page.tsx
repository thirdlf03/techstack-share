import { Metadata } from "next";
import Link from "next/link";
import { decodePayload } from "@/lib/encoder";
import { SharePageClient } from "./client";

type Props = {
  params: Promise<{ hash: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { hash } = await params;

  let title = "TechStack Share";
  let description = "Check out my tech stack!";
  try {
    const { profile } = decodePayload(hash);
    if (profile?.name) {
      title = `${profile.name}'s TechStack`;
      description = `Check out ${profile.name}'s tech stack!`;
    }
  } catch {
    // Use defaults
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [`/api/og?data=${hash}`],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/api/og?data=${hash}`],
    },
  };
}

export default async function SharePage({ params }: Props) {
  const { hash } = await params;

  let payload;
  try {
    payload = decodePayload(hash);
  } catch {
    return (
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-2xl font-bold mb-4">無効な共有リンク</h1>
        <p className="text-muted-foreground">共有コードが正しくありません。</p>
      </main>
    );
  }

  const { stack, profile } = payload;
  const avatarUrl = profile?.githubId
    ? `https://avatars.githubusercontent.com/${profile.githubId}?size=80`
    : null;

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold">
          {profile?.name ? `${profile.name}'s TechStack` : "TechStack Share"}
        </h1>
        <Link href="/" className="text-sm text-primary hover:underline" prefetch={false}>
          自分のスタックを作る →
        </Link>
      </div>
      <p className="text-muted-foreground mb-6">共有された技術スタック</p>

      <SharePageClient hash={hash} stack={stack} name={profile?.name} avatarUrl={avatarUrl} githubId={profile?.githubId} />
    </main>
  );
}
