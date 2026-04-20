import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function POST() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.update({
    where: { id: userId },
    data: { invitesSent: { increment: 1 } },
  });

  return Response.json({ invitesSent: user.invitesSent });
}
