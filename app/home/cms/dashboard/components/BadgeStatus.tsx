type BadgeStatusProps = {
  status: string;
};

export function BadgeStatus({ status }: BadgeStatusProps) {
  const map: Record<string, string> = {
    published: "bg-success/10 text-success",
    active: "bg-success/10 text-success",
    open: "bg-warning/10 text-warning",
    draft: "bg-foreground/10 text-muted-foreground",
    scheduled: "bg-warning/10 text-warning",
    closed: "bg-destructive/10 text-destructive",
    archived: "bg-primary/10 text-primary",
    hiring: "bg-success/10 text-success",
  };
  const cls = map[status.toLowerCase()] ?? "bg-muted text-muted-foreground";
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${cls}`}>
      {status}
    </span>
  );
}
