"use client";
import React, { useState, useEffect } from "react";
import { dateFormatter } from "@/app/utils/dateFormatter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { authClient, useSession } from "@/lib/auth-client";
import {
  Settings,
  Bell,
  LogOut,
  Info,
  MessageSquare,
  Check,
  Sun,
} from "lucide-react";
import { DropdownMenuLabel } from "@radix-ui/react-dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

// Mock data for your RLink CRM/CMS
const notifications = [
  {
    id: 1,
    title: "New Reservation",
    description: "John Doe reserved Unit 502 in Project Horizon.",
    time: "2m ago",
    unread: true,
    icon: <Check className="size-4 text-green-500" />,
  },
  {
    id: 2,
    title: "Inquiry Received",
    description: "New inquiry regarding 'The Palms' listings.",
    time: "1h ago",
    unread: true,
    icon: <MessageSquare className="size-4 text-blue-500" />,
  },
  {
    id: 3,
    title: "System Update",
    description: "CMS maintenance scheduled for 2:00 AM.",
    time: "5h ago",
    unread: false,
    icon: <Info className="size-4 text-zinc-500" />,
  },
];

function DashboardHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(dateFormatter(new Date().toISOString()));
  }, []);

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="flex items-center justify-between">
      <span>
        <h1 className="text-3xl text-primary font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </span>

      <span className="flex items-center justify-center gap-4">
        <p className="hidden md:block text-sm text-muted-foreground">
          Date: <span className="font-bold text-blue-600">{today}</span>
        </p>
        {/* NOTIFICATION DROPDOWN */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full focus-visible:ring-0"
            >
              <Bell className="size-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between font-bold text-lg p-2 px-4">
              Notifications
              {unreadCount > 0 && (
                <span className="text-xs font-normal bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {unreadCount} New
                </span>
              )}
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <ScrollArea className="h-[350px]">
              <DropdownMenuGroup>
                {notifications.map((n) => (
                  <DropdownMenuItem
                    key={n.id}
                    className="flex items-start gap-4 p-4 cursor-pointer focus:bg-zinc-50"
                  >
                    <div className="mt-1 shrink-0 size-8 rounded-full bg-zinc-100 flex items-center justify-center">
                      {n.icon}
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`text-sm leading-none ${n.unread ? "font-bold" : "font-medium"}`}
                        >
                          {n.title}
                        </p>
                        <span className="text-[10px] text-zinc-500 whitespace-nowrap">
                          {n.time}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                        {n.description}
                      </p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </ScrollArea>

            <DropdownMenuSeparator />

            <div className="p-2">
              <Button variant="outline" className="w-full text-xs h-9">
                View All Notifications
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* PROFILE DROPDOWN */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full focus:outline-none focus:ring-0 focus:ring-offset-0"
            >
              <Avatar>
                <AvatarImage
                  src={session?.user?.image ?? ""}
                  alt={session?.user?.name ?? ""}
                />
                <AvatarFallback>
                  {session?.user?.firstName?.charAt(0) ?? ""}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <span className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage
                      src={session?.user?.image ?? ""}
                      alt={session?.user?.name ?? ""}
                    />
                    <AvatarFallback>
                      {session?.user?.firstName?.charAt(0) ?? ""}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex flex-col">
                    <h3 className="text-sm font-bold">
                      {(session?.user.firstName + " " + session?.user.lastName) || session?.user?.name || "User"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {session?.user?.email ?? ""}
                    </p>
                  </span>
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link
                  href="/home/settings"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Settings />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Sun />
                Theme
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 cursor-pointer"
              >
                <LogOut />
                Sign Out
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </span>
    </div>
  );
}

export default DashboardHeader;
