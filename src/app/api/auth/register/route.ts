import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword, createToken, setAuthCookie } from "@/lib/auth";

const schema = z.object({
  email: z.string().email("请输入有效邮箱"),
  password: z.string().min(6, "密码至少6位"),
  name: z.string().optional(),
  role: z.enum(["student", "teacher"]).default("student"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      return NextResponse.json(
        { error: "该邮箱已被注册" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        role: data.role,
        checkQuota: 3,
      },
    });

    const token = await createToken({
      userId: user.id,
      email: user.email,
    });
    await setAuthCookie(token);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        checkQuota: user.checkQuota,
      },
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: e.errors[0]?.message || "参数错误" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "注册失败" },
      { status: 500 }
    );
  }
}
