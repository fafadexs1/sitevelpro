import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { createSessionToken, setSessionCookie } from "@/lib/auth/middleware";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const user = result[0];

    if (!user) {
      return NextResponse.json(
        { message: "Credenciais inválidas" },
        { status: 401 }
      );
    }

    const passwordValid = await bcrypt.compare(password, user.password_hash);

    if (!passwordValid) {
      return NextResponse.json(
        { message: "Credenciais inválidas" },
        { status: 401 }
      );
    }

    if (!user.is_active) {
      return NextResponse.json(
        { message: "Conta desativada" },
        { status: 403 }
      );
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { message: "Acesso negado. Apenas administradores podem acessar." },
        { status: 403 }
      );
    }

    // Update last_login_at
    await db
      .update(users)
      .set({ last_login_at: new Date().toISOString() })
      .where(eq(users.id, user.id));

    // Create JWT session token
    const authUser = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    };
    const token = await createSessionToken(authUser);

    // Create response with user data
    const response = NextResponse.json({
      user: authUser,
    });

    // Set secure HTTP-only cookie
    setSessionCookie(response, token);

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
