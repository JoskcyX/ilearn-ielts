import * as React from "react";
import { cn } from "@/lib/utils";

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div className="w-full overflow-x-auto">
      <table
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      className={cn("border-b border-border text-left", className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody className={cn("divide-y divide-border", className)} {...props} />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      className={cn("transition-colors hover:bg-black/[0.02]", className)}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      className={cn(
        "h-10 px-3 text-left align-middle text-xs font-semibold text-muted",
        className
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      className={cn("p-3 align-middle text-foreground", className)}
      {...props}
    />
  );
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
