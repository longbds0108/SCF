"use client";

import { AlertCircle } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface QueryStateCardProps {
  title: string;
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  children: ReactNode;
  className?: string;
}

/**
 * Shared shell for any card driven by a React Query result: renders a skeleton
 * while loading, an error message with a retry button on failure, or the
 * given content on success. Every dashboard card is a thin wrapper around this.
 */
export function QueryStateCard({
  title,
  isLoading = false,
  isError = false,
  error,
  onRetry,
  children,
  className,
}: QueryStateCardProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-6 w-32" />
        ) : isError ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error?.message ?? "Something went wrong."}</span>
            </div>
            {onRetry && (
              <Button type="button" variant="outline" size="sm" onClick={onRetry}>
                Retry
              </Button>
            )}
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
