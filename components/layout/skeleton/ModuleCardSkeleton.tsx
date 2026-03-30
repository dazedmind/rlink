import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function ModuleCardSkeleton() {
    return (
        <>
          {[1, 2, 3].map((i) => (
            <Card key={i} className="flex flex-col justify-end h-52">
              <CardContent className="flex flex-col gap-3 items-start justify-center">
                <Skeleton className="h-10 w-16 rounded-md bg-muted" />
                <Skeleton className="h-4 w-12 rounded-md bg-muted" />
                <Skeleton className="h-4 w-52 rounded-md bg-muted" />
                <Skeleton className="h-2 w-24 rounded-md bg-muted" />
              </CardContent>
            </Card>
          ))}
        </>
    );
  }
  