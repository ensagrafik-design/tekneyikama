"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Users,
  Ship,
  ClipboardList,
  BarChart3,
  Settings,
  Home,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: Home },
  { name: "Müşteriler", href: "/admin/clients", icon: Users },
  { name: "Tekneler", href: "/admin/vessels", icon: Ship },
  { name: "İşler", href: "/admin/jobs", icon: ClipboardList },
  { name: "Raporlar", href: "/admin/reports", icon: BarChart3 },
  { name: "Ayarlar", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      <div className="flex flex-1 flex-col">
        <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900">
          <div className="flex items-center">
            <Ship className="h-8 w-8 text-blue-400" />
            <span className="ml-2 text-xl font-bold text-white">ReefClean</span>
          </div>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isActive
                    ? "bg-gray-800 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white",
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors"
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? "text-white" : "text-gray-400 group-hover:text-white",
                    "mr-3 h-5 w-5 flex-shrink-0"
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="flex-shrink-0 p-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signOut()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Çıkış
          </Button>
        </div>
      </div>
    </div>
  );
}