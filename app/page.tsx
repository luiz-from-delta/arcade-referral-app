import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import AuthForm from "./AuthForm";

export default async function Home() {
  const user = await getSession();
  if (user) redirect("/dashboard");

  return <AuthForm />;
}
