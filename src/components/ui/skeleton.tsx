import { cn } from "@/lib/shadcn/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("animate-pulse rounded-md bg-slate-300/50", className)} {...props} />;
}

export { Skeleton };
