import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { z } from "zod";
import { hashPassword } from "@/lib/auth/password";
import { allowRateLimit } from "@/lib/utils/rate-limit";

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const rl = allowRateLimit(`register:${ip}`, 10, 60_000);
    if (!rl.allowed) return NextResponse.json({ error: "auth.errors.rate_limited" }, { status: 429 });
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "auth.errors.invalid_params" }, { status: 400 });
    }
    const { email, password, name } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "auth.errors.email_in_use" }, { status: 400 });
    }
    const passwordHash = await hashPassword(password);
    await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: "FREE",
      },
    });
    return NextResponse.json({ ok: true, message: "auth.messages.register_success" }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "auth.errors.server_error" }, { status: 500 });
  }
}