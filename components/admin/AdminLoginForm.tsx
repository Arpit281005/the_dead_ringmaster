"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "@/lib/admin-actions";

export default function AdminLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await adminLogin(password);
    setPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 max-w-sm">
      <label className="text-sm flex flex-col gap-1">
        Organiser password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-ink/30 bg-parchment px-3 py-2 rounded-sm"
          autoFocus
        />
      </label>
      {error && <p className="text-oxblood text-sm">{error}</p>}
      <button
        type="submit"
        disabled={pending || !password}
        className="btn-oxblood font-chrome uppercase text-sm py-3 rounded-sm"
      >
        {pending ? "…" : "Enter"}
      </button>
    </form>
  );
}
