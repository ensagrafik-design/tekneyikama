"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ClipboardList, Ship, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

const navigation = [
  { name: "İşlerim", href: "/crew", icon: ClipboardList },
  { name: "Profil", href: "/crew/profile", icon: User },
];

export function CrewNavigation() {
  const pathname = usePathname();

  return (
    <div className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Ship className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">ReefClean</span>
            </div>
            <nav className="hidden md:ml-6 md:flex md:items-center md:space-x-8">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      isActive
                        ? "border-blue-500 text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                      "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    )}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Çıkış</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}