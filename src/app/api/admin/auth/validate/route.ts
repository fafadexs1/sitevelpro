import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/middleware";

export async function POST(request: Request) {
    try {
        // Get authenticated user from JWT cookie
        const user = await getAuthenticatedUser(request);

        if (!user) {
            return NextResponse.json({ valid: false, message: "Not authenticated" });
        }

        return NextResponse.json({
            valid: true,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
            },
        });
    } catch (error: any) {
        console.error("Validate session error:", error);
        return NextResponse.json({ valid: false, message: "Server error" });
    }
}
