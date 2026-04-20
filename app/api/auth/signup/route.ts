import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { generateReferralCode } from "@/lib/referral";

export async function POST(request: Request) {
  const { email, ref } = await request.json();

  if (!email || typeof email !== "string") {
    return Response.json({ error: "Email is required" }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existing = await db.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return Response.json({ error: "Email already registered" }, { status: 409 });
  }

  const referrer = typeof ref === "string" && ref
    ? await db.user.findUnique({ where: { referralCode: ref } })
    : null;

  const user = await db.user.create({
    data: {
      email: normalizedEmail,
      referralCode: generateReferralCode(),
      referredBy: referrer?.referralCode ?? null,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set("userId", user.id, {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return Response.json({ id: user.id, email: user.email, referralCode: user.referralCode });
}
