import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { QUICK_LINKS } from "../constants";

type QuickLinksCardProps = {
  onNavigate: (url: string) => void;
};

export function QuickLinksCard({ onNavigate }: QuickLinksCardProps) {
  return (
    <Card className="border border-border rounded-xl py-0">
      <CardContent className="p-0">
        {QUICK_LINKS.map((link, i) => (
          <button
            key={link.url}
            type="button"
            onClick={() => onNavigate(link.url)}
            className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-accent cursor-pointer ${
              i < QUICK_LINKS.length - 1 ? "border-b border-border/50" : ""
            } ${i === 0 ? "rounded-t-xl" : ""} ${i === QUICK_LINKS.length - 1 ? "rounded-b-xl" : ""}`}
          >
            <span className={`flex size-8 items-center justify-center rounded-lg ${link.iconBg}`}>
              <link.icon className={`size-4 ${link.iconColor}`} />
            </span>
            <span>{link.label}</span>
            <ChevronRight className="ml-auto size-4 text-muted-foreground" />
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
