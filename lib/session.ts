import { cookies } from "next/headers";
import { db } from "./db";

export async function getSession() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) return null;

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  const referrer = user.referredBy
    ? await db.user.findUnique({
        where: { referralCode: user.referredBy },
        select: { email: true },
      })
    : null;

  return { ...user, referrerEmail: referrer?.email ?? null };
}
