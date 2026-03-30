import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export type DashboardSkeletonVariant = "crm" | "cms";

type DashboardSkeletonProps = {
  /** CMS: 4 stat cards + two-column recent/quick links layout. CRM: default 3 cards + tables. */
  variant?: DashboardSkeletonVariant;
};

function RecentListBlockSkeleton() {
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <Skeleton className="h-4 w-24 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
      <div className="divide-y">
        {[1, 2, 3].map((r) => (
          <div key={r} className="flex flex-col gap-2 px-4 py-3">
            <Skeleton className="h-4 w-3/4 max-w-[240px] rounded-md" />
            <Skeleton className="h-3 w-1/2 max-w-[160px] rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

function CrmDashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="flex flex-col justify-end h-[150px]">
            <CardContent className="flex flex-col gap-3 items-start">
              <Skeleton className="h-10 w-16 rounded-md" />
              <Skeleton className="h-4 w-40 rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-8">
        {[1, 2].map((i) => (
          <div key={i} className="flex flex-col gap-4">
            <div className="flex justify-between items-end">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-5 w-32 rounded-md" />
                <Skeleton className="h-3 w-52 rounded-md" />
              </div>
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
            <div className="border rounded-xl overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <Skeleton className="h-5 w-24 rounded-md" />
                <Skeleton className="h-8 w-28 rounded-md" />
              </div>
              <div className="divide-y">
                {[1, 2, 3].map((r) => (
                  <div key={r} className="flex items-center gap-4 px-6 py-4">
                    <Skeleton className="h-4 w-16 rounded-md" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-4 w-28 rounded-md" />
                    <Skeleton className="h-4 w-24 rounded-md ml-auto" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-36 rounded-md" />
            <Skeleton className="h-3 w-56 rounded-md" />
          </div>
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>
        <div className="border rounded-xl overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <Skeleton className="h-5 w-24 rounded-md" />
            <Skeleton className="h-8 w-32 rounded-md" />
          </div>
          <div className="divide-y">
            {[1, 2, 3, 4, 5].map((r) => (
              <div key={r} className="flex items-center gap-6 px-6 py-4">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-4 w-20 rounded-md" />
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-4 w-48 rounded-md" />
                <Skeleton className="h-5 w-14 rounded-full ml-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CmsDashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8 animate-fade-in-up">
      <div className="mt-8 grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="relative h-[130px] overflow-hidden border border-border">
            <CardContent className="flex h-full flex-col justify-end pt-5">
              <Skeleton className="h-9 w-14 rounded-md" />
              <Skeleton className="mt-2 h-4 w-24 rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-full max-w-md rounded-full" />
          <Skeleton className="h-3 w-28 rounded-md" />
          <RecentListBlockSkeleton />
          <RecentListBlockSkeleton />
          <RecentListBlockSkeleton />
        </div>

        <div className="flex flex-col gap-4">
          <Skeleton className="h-3 w-24 rounded-md" />
          <Card className="border border-border">
            <CardContent className="flex flex-col gap-3 p-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-9 w-full rounded-md" />
              ))}
            </CardContent>
          </Card>
          <Skeleton className="h-3 w-28 rounded-md mt-2" />
          <Card className="border border-border">
            <CardContent className="space-y-3 p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-10 w-10 shrink-0 rounded-md" />
                  <div className="flex flex-1 flex-col gap-2">
                    <Skeleton className="h-3 w-3/4 rounded-md" />
                    <Skeleton className="h-3 w-1/2 rounded-md" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function DashboardSkeleton({ variant = "crm" }: DashboardSkeletonProps) {
  return variant === "cms" ? <CmsDashboardSkeleton /> : <CrmDashboardSkeleton />;
}
