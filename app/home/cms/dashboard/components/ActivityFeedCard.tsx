import { Card, CardContent } from "@/components/ui/card";
import { ACTIVITY_FEED, ACTIVITY_DOT_COLOR } from "../constants";

export function ActivityFeedCard() {
  return (
    <Card className="border border-border rounded-xl">
      <CardContent>
        <ul className="divide-y divide-border/50">
          {ACTIVITY_FEED.map((item) => (
            <li key={item.id} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
              <span className={`mt-1.5 flex size-1.5 shrink-0 rounded-full ${ACTIVITY_DOT_COLOR[item.color]}`} />
              <div>
                <p className="text-sm font-medium leading-snug">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.detail} · {item.time}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
