"use client";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { MoreHorizontal, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils"; // Assuming you have a shadcn/ui utility for classes

interface MenuItem {
  label: string;
  icon?: LucideIcon; // Lucide icon component
  onClick: () => void;
  color?: string; // e.g., "text-red-500"
  disabled?: boolean;
  separator?: boolean;
}

interface ContextMenuProps {
  menu: MenuItem[];
  triggerIcon?: LucideIcon;
}

export default function ContextMenu({
  menu,
  triggerIcon: TriggerIcon = MoreHorizontal,
}: ContextMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-accent"
        >
          <TriggerIcon size={16} />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[160px]">
        {menu.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label}>
              {item.separator && <DropdownMenuSeparator />}
              <DropdownMenuItem
                disabled={item.disabled}
                className={cn(
                  "gap-2 cursor-pointer focus:bg-accent",
                  item.color, // Applies custom colors like text-red-500
                )}
                onClick={(e) => {
                  e.stopPropagation(); // Prevents row clicks if used in a table
                  item.onClick();
                }}
              >
                {Icon && <Icon size={14} className={cn(item.color, "shrink-0")} />}
                <span className="flex-1">{item.label}</span>
              </DropdownMenuItem>
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
