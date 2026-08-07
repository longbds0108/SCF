import { Button } from "@/components/ui/button";

interface DataTablePaginationProps {
  pageIndex: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  isLoading?: boolean;
}

/** Cursor-style pager: no total-page-count assumption, just "was there a previous/next page". */
export function DataTablePagination({
  pageIndex,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  isLoading,
}: DataTablePaginationProps) {
  return (
    <div className="flex items-center justify-between pt-3">
      <span className="text-xs text-muted-foreground">Page {pageIndex + 1}</span>
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onPrev}
          disabled={!hasPrev || isLoading}
        >
          Previous
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onNext}
          disabled={!hasNext || isLoading}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
