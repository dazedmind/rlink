import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type TableSkeletonProps = {
  /** Number of table columns */
  columnCount?: number;
  /** Number of skeleton rows */
  rowCount?: number;
  /** Show Filter + Export buttons in header */
  showHeaderActions?: boolean;
  /** Show pagination footer */
  showFooter?: boolean;
};

export default function TableSkeleton({
  columnCount = 8,
  rowCount = 10,
  showHeaderActions = true,
  showFooter = true,
}: TableSkeletonProps) {
  return (
    <div className="overflow-x-auto scrollbar-hide border rounded-xl animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="p-4 border-b bg-white flex justify-between items-center">
        <Skeleton className="h-6 w-48 rounded-md" />
        {showHeaderActions && (
          <span className="flex items-center gap-2">
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-32 rounded-md" />
          </span>
        )}
      </div>

      {/* Table */}
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow className="hover:bg-transparent">
            {Array.from({ length: columnCount }).map((_, i) => (
              <TableHead
                key={i}
                className="px-6 py-4 font-semibold uppercase text-[11px] tracking-wider text-gray-600"
              >
                <Skeleton className="h-4 w-16 rounded-md" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {Array.from({ length: rowCount }).map((_, rowIndex) => (
            <TableRow key={rowIndex} className="hover:bg-transparent">
              {Array.from({ length: columnCount }).map((_, colIndex) => (
                <TableCell key={colIndex} className="px-6 py-4">
                  {colIndex === 0 ? (
                    <div className="flex flex-col gap-1">
                      <Skeleton className="h-4 w-24 rounded-md" />
                      <Skeleton className="h-3 w-32 rounded-md" />
                    </div>
                  ) : colIndex === 1 ? (
                    <Skeleton className="h-5 w-20 rounded-full" />
                  ) : colIndex === columnCount - 1 ? (
                    <Skeleton className="h-8 w-8 rounded-md ml-auto" />
                  ) : (
                    <Skeleton
                      className={`h-4 rounded-md ${colIndex % 3 === 0 ? "w-28" : colIndex % 3 === 1 ? "w-20" : "w-24"}`}
                    />
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Footer */}
      {showFooter && (
        <div className="flex justify-between items-center bg-white px-6 py-4 border-t">
          <Skeleton className="h-4 w-32 rounded-md" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      )}
    </div>
  );
}
