import * as React from "react";

import { cn } from "@/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-xl border bg-card text-card-foreground shadow-card", className)} {...props} />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";

// Custom stat card component
interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'coral' | 'teal' | 'pink' | 'purple' | 'green';
  icon?: React.ReactNode;
  title: string;
  value: string | number;
  change?: string;
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, variant = 'teal', icon, title, value, change, ...props }, ref) => {
    // Background colors removed, focusing on clean white card
    const iconClasses = {
      coral: 'bg-orange-100 text-orange-600',
      teal: 'bg-teal-100 text-teal-600',
      pink: 'bg-pink-100 text-pink-600',
      purple: 'bg-purple-100 text-purple-600',
      green: 'bg-green-100 text-green-600',
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl p-6 border border-primary/20 bg-primary/5 text-card-foreground shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1",
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-2">{value}</h3>
          </div>
          {icon && (
            <div className={cn("p-3 rounded-xl", iconClasses[variant])}>
              {icon}
            </div>
          )}
        </div>

        {change && (
          <div className="mt-4 flex items-center text-xs">
            <span className="text-muted-foreground">{change}</span>
          </div>
        )}
      </div>
    );
  }
);
StatCard.displayName = "StatCard";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, StatCard };
