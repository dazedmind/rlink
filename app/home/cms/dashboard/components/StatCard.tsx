import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type StatCardProps = {
  label: string;
  value: number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  loading: boolean;
  onClick: () => void;
};

export function StatCard({ label, value, icon: Icon, iconBg, iconColor, loading, onClick }: StatCardProps) {
  return (
    <button type="button" onClick={onClick} className="text-left">
      <Card className="relative h-[130px] cursor-pointer overflow-hidden border border-border transition-colors hover:border-primary/30 hover:bg-accent">
        <CardContent className="flex h-full flex-col justify-end pt-5">
          <div>
            {loading ? (
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            ) : (
              <span className="text-4xl font-bold">{value}</span>
            )}
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        </CardContent>
        <span className="absolute -bottom-3 right-0 opacity-[0.06]">
          <Icon className="size-20 stroke-1" />
        </span>
      </Card>
    </button>
  );
}
