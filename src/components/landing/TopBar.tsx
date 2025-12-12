"use client";

import { Building2, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface TopBarLinkProps {
    href: string;
    icon: React.ElementType;
    label: string;
    isActive?: boolean;
}

const TopBarLink = ({ href, icon: Icon, label, isActive }: TopBarLinkProps) => (
    <Link
        href={href}
        className={cn(
            "flex items-center gap-2 px-4 py-2 text-xs font-medium transition-colors duration-200",
            isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
        )}
    >
        <Icon className="h-3.5 w-3.5" />
        {label}
    </Link>
);

export function TopBar() {
    const pathname = usePathname();

    return (
        <div className="w-full bg-neutral-950 border-b border-white/5">
            <div className="mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center">
                    <TopBarLink
                        href="/"
                        icon={User}
                        label="Para você"
                        isActive={pathname === "/"}
                    />
                    <div className="h-4 w-px bg-white/10" />
                    <TopBarLink
                        href="/empresa"
                        icon={Building2}
                        label="Para sua empresa"
                        isActive={pathname === "/empresa"}
                    />
                </div>

                <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
                    {/* Optional: Add secondary links or info here if needed */}
                </div>
            </div>
        </div>
    );
}
