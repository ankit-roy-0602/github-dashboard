"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Github,
  Home,
  User,
  Folder,
  GitBranch,
  Bell,
  Activity,
  Shield,
} from "lucide-react";

const Navigation: React.FC = () => {
  const pathname = usePathname();

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Repositories", href: "/repositories", icon: Folder },
    { name: "Issues", href: "/issues", icon: GitBranch },
    { name: "Security", href: "/security", icon: Shield },
    { name: "Webhooks", href: "/webhooks", icon: Bell },
    { name: "Analytics", href: "/analytics", icon: Activity },
  ];

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <Github className="h-8 w-8 text-github-900" />
              <span className="text-xl font-bold text-github-900">
                GitHub Dashboard
              </span>
            </div>

            <div className="hidden md:flex space-x-4">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-github-900 text-white"
                        : "text-github-600 hover:text-github-900 hover:bg-github-100"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
