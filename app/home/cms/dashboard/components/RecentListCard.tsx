import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { BadgeStatus } from "./BadgeStatus";

type RecentListCardProps<T> = {
  title: string;
  items: T[];
  emptyMessage: string;
  onViewAll: () => void;
  renderItem: (item: T) => React.ReactNode;
  getStatus?: (item: T) => string;
};

export function RecentListCard<T extends { id: number }>({
  title,
  items,
  emptyMessage,
  onViewAll,
  renderItem,
  getStatus,
}: RecentListCardProps<T>) {
  return (
    <Card className="border border-border rounded-xl">
      <CardContent>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl text-primary font-semibold">{title}</h3>
          <Button variant="ghost" size="sm" onClick={onViewAll} className="text-xs gap-1">
            View all <ChevronRight className="size-3" />
          </Button>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">{emptyMessage}</p>
        ) : (
          <ul className="divide-y divide-border/50">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 gap-2">
                <div className="min-w-0 flex-1">{renderItem(item)}</div>
                {getStatus ? <BadgeStatus status={getStatus(item)} /> : null}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
