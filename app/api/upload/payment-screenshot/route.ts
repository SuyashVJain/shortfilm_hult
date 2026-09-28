import { NextResponse } from "next/server";
import { getSession } from "@/lib/guards";
import { screenshotPrefix } from "@/lib/payment-screenshots";
import { rateLimit } from "@/lib/rate-limit";
import { toRole } from "@/lib/roles";
import { storage } from "@/lib/storage";
import { checkScreenshot } from "@/lib/validation/payment";

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/** POST multipart { file }: uploads a payment screenshot, returns { url }. */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return fail("Please sign in again to upload.", 401);
  if (toRole(session.user.role) !== "PARTICIPANT") return fail("Only team leaders can upload payment proof.", 403);

  const userId = session.user.id;
  if (!rateLimit(`upload:${userId}`, 10, 10 * 60 * 1000)) {
    return fail("Too many uploads. Please wait a few minutes and try again.", 429);
  }

  let file: FormDataEntryValue | null;
  try {
    file = (await req.formData()).get("file");
  } catch {
    return fail("We couldn't read that upload. Please try again.", 400);
  }
  if (!(file instanceof File)) return fail("Please choose an image to upload.", 400);

  const problem = checkScreenshot(file);
  if (problem) return fail(problem, 400);

  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").slice(-60) || "screenshot";
  try {
    const { url } = await storage.upload(file, `${screenshotPrefix(userId)}${Date.now()}-${safeName}`);
    return NextResponse.json({ url });
  } catch {
    console.warn("payment screenshot upload failed");
    return fail("The upload didn't go through. Please try again.", 502);
  }
}
