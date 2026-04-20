import { cookies } from "next/headers";
import { db } from "./db";

export async function getSession() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) return null;
  return db.user.findUnique({ where: { id: userId } });
}
