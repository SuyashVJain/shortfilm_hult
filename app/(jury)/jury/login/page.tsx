import { redirect } from "next/navigation";
import { getJury } from "@/lib/jury-auth";
import { JuryLoginForm } from "./JuryLoginForm";

export default async function JuryLoginPage() {
  if (await getJury()) redirect("/jury");
  return (
    <div className="mx-auto max-w-md py-12">
      <p className="text-[0.7rem] uppercase tracking-[0.24em] text-cream-muted">Jury panel</p>
      <h1 className="mt-3 font-display text-5xl uppercase leading-none text-cream">Sign in</h1>
      <p className="mt-4 text-cream/70">Use the jury ID and password given to you by the organisers.</p>
      <JuryLoginForm />
    </div>
  );
}
