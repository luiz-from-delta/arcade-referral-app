import { nanoid } from "nanoid";
import { db } from "./db";

export function generateReferralCode(): string {
  return nanoid(8);
}

export async function getMetrics(userId: string) {
  const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
  const conversions = await db.user.count({
    where: { referredBy: user.referralCode },
  });
  const rate = user.invitesSent === 0 ? 0 : conversions / user.invitesSent;
  return { invitesSent: user.invitesSent, conversions, rate };
}
