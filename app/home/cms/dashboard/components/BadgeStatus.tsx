type BadgeStatusProps = {
  status: string;
};

export function BadgeStatus({ status }: BadgeStatusProps) {
  const map: Record<string, string> = {
    published: "bg-green-50 text-green-700",
    active: "bg-green-50 text-green-700",
    open: "bg-violet-50 text-violet-700",
    draft: "bg-slate-100 text-slate-600",
    scheduled: "bg-slate-100 text-slate-600",
    closed: "bg-red-50 text-red-700",
  };
  const cls = map[status.toLowerCase()] ?? "bg-slate-100 text-slate-600";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${cls}`}>
      {status}
    </span>
  );
}
