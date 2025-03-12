import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
  columnCount: number;
  rowCount?: number;
}

export function TableSkeleton({ columnCount, rowCount = 5 }: TableSkeletonProps) {
  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          <tr>
            {Array.from({ length: columnCount }).map((_, i) => (
              <th key={i} className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:not([:first-child])]:pl-0">
                <Skeleton className="h-4 w-[150px]" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rowCount }).map((_, i) => (
            <tr key={i}>
              {Array.from({ length: columnCount }).map((_, j) => (
                <td key={j} className="p-4 align-middle [&:not([:first-child])]:pl-0">
                  <Skeleton className="h-4 w-[150px]" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
