"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Turnstile } from "@/components/turnstile";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

type RequestTechModalProps = {
  open: boolean;
  onClose: () => void;
};

type Status = "idle" | "submitting" | "success" | "error";

export function RequestTechModal({ open, onClose }: RequestTechModalProps) {
  const [techName, setTechName] = useState("");
  const [docUrl, setDocUrl] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleClose = useCallback(() => {
    setTechName("");
    setDocUrl("");
    setTurnstileToken(null);
    setStatus("idle");
    setErrorMessage("");
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(async () => {
    if (!techName.trim() || !turnstileToken) return;

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/request-tech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          techName: techName.trim(),
          docUrl: docUrl.trim() || undefined,
          turnstileToken,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "送信に失敗しました");
      }

      setStatus("success");
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "送信に失敗しました");
      setStatus("error");
    }
  }, [techName, docUrl, turnstileToken]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-background border rounded-2xl shadow-xl p-6 w-full max-w-md mx-4 space-y-4">
        {status === "success" ? (
          <>
            <h2 className="text-lg font-bold">送信完了</h2>
            <p className="text-sm text-muted-foreground">
              リクエストを送信しました。ありがとうございます！
            </p>
            <div className="flex justify-end pt-2">
              <Button onClick={handleClose}>閉じる</Button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-lg font-bold">技術の追加をリクエスト</h2>
            <p className="text-sm text-muted-foreground">
              追加してほしい技術の情報を入力してください。
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium" htmlFor="tech-name">
                  技術名 <span className="text-destructive">*</span>
                </label>
                <Input
                  id="tech-name"
                  placeholder="例: Dioxus"
                  value={techName}
                  maxLength={100}
                  onChange={(e) => setTechName(e.target.value)}
                  disabled={status === "submitting"}
                />
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="doc-url">
                  ドキュメント / 公式サイトURL
                </label>
                <Input
                  id="doc-url"
                  type="url"
                  placeholder="例: https://dioxuslabs.com"
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  disabled={status === "submitting"}
                />
              </div>
            </div>

            {TURNSTILE_SITE_KEY && (
              <Turnstile
                siteKey={TURNSTILE_SITE_KEY}
                onVerify={setTurnstileToken}
                onExpire={() => setTurnstileToken(null)}
              />
            )}

            {status === "error" && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={handleClose} disabled={status === "submitting"}>
                キャンセル
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!techName.trim() || !turnstileToken || status === "submitting"}
              >
                {status === "submitting" ? "送信中..." : "送信"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
