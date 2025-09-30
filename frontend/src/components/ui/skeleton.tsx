<<<<<<< HEAD
import { cn } from "@/lib/utils";
=======
import { cn } from "../../lib/utils";
>>>>>>> frontend-TRUE

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}

export { Skeleton };
