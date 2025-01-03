import React from "react";
import { usePathname } from "next/navigation";
import { Bookmark, Calendar, Link, Settings } from "lucide-react";

const menuItems = [
  { icon: Bookmark, label: "ブックマーク", href: "/mypage" },
  { icon: Calendar, label: "スケジュール", href: "/schedule" },
  { icon: Settings, label: "設定", href: "/settings" },
];

export function FooterMenu() {
  const pathname = usePathname();

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t">
      <nav className="flex justify-around">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center py-2 px-4 ${
              pathname === item.href ? "text-indigo-600" : "text-gray-600"
            }`}
          >
            <div className="relative">
              <item.icon className="w-6 h-6" />
            </div>
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </nav>
    </footer>
  );
}
