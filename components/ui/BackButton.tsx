import Link from "next/link";
import React from "react";
import { ArrowLeft, ChevronLeft } from "lucide-react";
import { Button } from "./button";

function BackButton({
  href,
  mainPageName,
  onClick,
}: {
  href: string;
  mainPageName: string;
  onClick: () => void;
}) {
  return (
    <span className="flex items-center gap-2">
      <Button
        onClick={onClick}
        size="icon"
        variant="ghost"
        className="flex items-center gap-2 border border-primary/20 bg-accent hover:bg-primary hover:text-white rounded-full text-primary font-medium w-fit transition-all duration-300 ease-in-out p-1"
      >
        <ChevronLeft className="size-6" />
      </Button>
    </span>
  );
}

export default BackButton;
