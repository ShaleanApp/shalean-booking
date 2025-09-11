import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";

interface ShaleanCardProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  variant?: "default" | "primary" | "secondary" | "accent" | "outline";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

const cardVariants = {
  default: "bg-card text-card-foreground border-border",
  primary: "bg-primary text-primary-foreground border-primary",
  secondary: "bg-secondary text-secondary-foreground border-secondary",
  accent: "bg-accent text-accent-foreground border-accent",
  outline: "bg-background text-foreground border-border shadow-sm",
};

const cardSizes = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function ShaleanCard({
  title,
  description,
  children,
  footer,
  action,
  className,
  variant = "default",
  size = "md",
  onClick,
  ...props
}: ShaleanCardProps) {
  return (
    <Card
      className={cn(
        cardVariants[variant],
        cardSizes[size],
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
      {...props}
    >
      {(title || description || action) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
          {action && <CardAction>{action}</CardAction>}
        </CardHeader>
      )}
      {children && <CardContent>{children}</CardContent>}
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}

// Specialized card variants for common use cases
export function ServiceCard({
  title,
  description,
  price,
  duration,
  features,
  onSelect,
  isSelected = false,
  className,
  ...props
}: {
  title: string;
  description: string;
  price: string;
  duration: string;
  features: string[];
  onSelect?: () => void;
  isSelected?: boolean;
  className?: string;
} & Omit<ShaleanCardProps, "title" | "description" | "children">) {
  return (
    <ShaleanCard
      title={title}
      description={description}
      variant={isSelected ? "primary" : "outline"}
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-primary ring-offset-2",
        className
      )}
      onClick={onSelect}
      {...props}
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-primary">{price}</span>
          <span className="text-sm text-muted-foreground">{duration}</span>
        </div>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-sm">
              <span className="w-2 h-2 bg-accent rounded-full mr-3 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </ShaleanCard>
  );
}

export function BookingCard({
  title,
  status,
  date,
  time,
  address,
  cleaner,
  onView,
  onEdit,
  className,
  ...props
}: {
  title: string;
  status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled";
  date: string;
  time: string;
  address: string;
  cleaner?: string;
  onView?: () => void;
  onEdit?: () => void;
  className?: string;
} & Omit<ShaleanCardProps, "title" | "children">) {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    confirmed: "bg-blue-100 text-blue-800 border-blue-200",
    "in-progress": "bg-purple-100 text-purple-800 border-purple-200",
    completed: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <ShaleanCard
      title={title}
      variant="outline"
      className={cn("hover:shadow-md transition-shadow", className)}
      {...props}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "px-2 py-1 rounded-full text-xs font-medium border",
              statusColors[status]
            )}
          >
            {status.replace("-", " ").toUpperCase()}
          </span>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <span className="font-medium mr-2">Date:</span>
            <span>{date}</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium mr-2">Time:</span>
            <span>{time}</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium mr-2">Address:</span>
            <span className="text-muted-foreground">{address}</span>
          </div>
          {cleaner && (
            <div className="flex items-center">
              <span className="font-medium mr-2">Cleaner:</span>
              <span className="text-muted-foreground">{cleaner}</span>
            </div>
          )}
        </div>
        <div className="flex gap-2 pt-2">
          {onView && (
            <button
              onClick={onView}
              className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            >
              View Details
            </button>
          )}
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-3 py-1 text-xs bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors"
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </ShaleanCard>
  );
}
