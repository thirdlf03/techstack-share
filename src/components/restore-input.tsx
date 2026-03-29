"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { decode, type TechStack } from "@/lib/encoder";

type RestoreInputProps = {
  onRestore: (stack: TechStack) => void;
};

export function RestoreInput({ onRestore }: RestoreInputProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleRestore = () => {
    try {
      const hash = code.includes("/share/")
        ? code.split("/share/").pop()!
        : code;
      const stack = decode(hash.trim());
      onRestore(stack);
      setCode("");
      setError("");
    } catch {
      setError("無効な共有コードです");
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">共有コード / URLから復元</h3>
      <div className="flex gap-2">
        <Input
          placeholder="共有コードまたはURLを貼り付け..."
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError("");
          }}
        />
        <Button onClick={handleRestore} variant="secondary" disabled={!code}>
          復元
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
