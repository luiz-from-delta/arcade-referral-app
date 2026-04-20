import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getSession } from "@/lib/session";
import { getMetrics } from "@/lib/referral";
import CopyLinkButton from "./CopyLinkButton";
import SignOutButton from "./SignOutButton";

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) redirect("/");

  const { invitesSent, conversions, rate } = await getMetrics(user.id);

  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const referralUrl = `${protocol}://${host}/?ref=${user.referralCode}`;

  return (
    <div className="flex min-h-screen items-start justify-center bg-zinc-50 px-4 py-16">
      <div className="w-full max-w-lg space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Your referral dashboard
            </h1>
            <p className="mt-1 text-sm text-zinc-500">{user.email}</p>
          </div>
          <SignOutButton />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Stat label="Invites sent" value={invitesSent} />
          <Stat label="Conversions" value={conversions} />
          <Stat label="Conversion rate" value={`${(rate * 100).toFixed(0)}%`} />
        </div>

        <div className="rounded-xl border border-zinc-100 bg-white p-6 shadow-sm space-y-3">
          <p className="text-sm font-medium text-zinc-700">Your referral link</p>
          <p className="break-all rounded-lg bg-zinc-50 px-4 py-2.5 font-mono text-sm text-zinc-600 border border-zinc-100">
            {referralUrl}
          </p>
          <CopyLinkButton referralUrl={referralUrl} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-zinc-100 bg-white p-5 shadow-sm text-center">
      <p className="text-2xl font-semibold text-zinc-900">{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{label}</p>
    </div>
  );
}
