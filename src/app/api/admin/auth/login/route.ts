import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (adminEmail && adminPassword) {
      if (email !== adminEmail || password !== adminPassword) {
        return NextResponse.json({ message: "Credenciais inválidas" }, { status: 401 });
      }
    }

    return NextResponse.json({
      user: {
        id: email ?? "admin",
        email: email ?? "admin",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Login failed" },
      { status: 500 },
    );
  }
}
