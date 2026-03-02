import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function InventorySkeleton() {
    return (
        <>
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="flex flex-col aspect-video justify-center h-auto">
              <CardContent className="flex flex-col gap-3 items-center justify-center">
                <Skeleton className="h-15 w-50 rounded-md" />
              </CardContent>
            </Card>
          ))}
        </>
    );
  }
  