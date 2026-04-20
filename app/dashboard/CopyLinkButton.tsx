"use client";

import { useState } from "react";

export default function CopyLinkButton({ referralUrl }: { referralUrl: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    await fetch("/api/users/me/invite", { method: "POST" });
  }

  return (
    <button
      onClick={handleCopy}
      disabled={copied}
      className="w-full cursor-pointer rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {copied ? "Copied!" : "Copy referral link"}
    </button>
  );
}
