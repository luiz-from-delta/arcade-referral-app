import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email || typeof email !== "string") {
    return Response.json({ error: "Email is required" }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  if (!user) {
    return Response.json({ error: "No account found with this email" }, { status: 404 });
  }

  const cookieStore = await cookies();
  cookieStore.set("userId", user.id, {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return Response.json({ id: user.id, email: user.email, referralCode: user.referralCode });
}
