import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardSkeleton() {
    return (
      <div className="flex flex-col gap-8">
        {/* Stat cards */}
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
  
        {/* Two side-by-side tables */}
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
  
        {/* Full-width inquiry table */}
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
  