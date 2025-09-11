"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ShaleanModalProps {
  children?: React.ReactNode;
  title?: string;
  description?: string;
  content?: React.ReactNode;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  variant?: "default" | "destructive" | "warning" | "success";
  showCloseButton?: boolean;
  showFooter?: boolean;
  footerActions?: React.ReactNode;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
}

const modalSizes = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-full mx-4",
};

const modalVariants = {
  default: "border-border",
  destructive: "border-destructive",
  warning: "border-yellow-500",
  success: "border-green-500",
};

export function ShaleanModal({
  children,
  title,
  description,
  content,
  trigger,
  open,
  onOpenChange,
  size = "md",
  variant = "default",
  showCloseButton = true,
  showFooter = false,
  footerActions,
  className,
  overlayClassName,
  contentClassName,
  ...props
}: ShaleanModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className={cn(
          modalSizes[size],
          modalVariants[variant],
          contentClassName
        )}
        showCloseButton={showCloseButton}
        {...props}
      >
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        
        <div className={cn("py-4", className)}>
          {content || children}
        </div>
        
        {showFooter && (
          <DialogFooter>
            {footerActions || (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange?.(false)}>
                  Cancel
                </Button>
                <Button onClick={() => onOpenChange?.(false)}>
                  Confirm
                </Button>
              </div>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Specialized modal components for common use cases
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive" | "warning";
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  isLoading = false,
}: ConfirmationModalProps) {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Confirmation action failed:", error);
    }
  };

  const confirmButtonVariant = variant === "destructive" ? "destructive" : "default";

  return (
    <ShaleanModal
      open={isOpen}
      onOpenChange={onClose}
      title={title}
      description={description}
      variant={variant}
      size="sm"
      showFooter={true}
      footerActions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={confirmButtonVariant}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : confirmText}
          </Button>
        </div>
      }
    >
      {/* Confirmation modal content is handled by title and description */}
    </ShaleanModal>
  );
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData?: {
    id: string;
    title: string;
    status: string;
    date: string;
    time: string;
    address: string;
    cleaner?: string;
  };
  onEdit?: () => void;
  onCancel?: () => void;
  onComplete?: () => void;
}

export function BookingModal({
  isOpen,
  onClose,
  bookingData,
  onEdit,
  onCancel,
  onComplete,
}: BookingModalProps) {
  if (!bookingData) return null;

  const statusColors = {
    pending: "text-yellow-600",
    confirmed: "text-blue-600",
    "in-progress": "text-purple-600",
    completed: "text-green-600",
    cancelled: "text-red-600",
  };

  return (
    <ShaleanModal
      open={isOpen}
      onOpenChange={onClose}
      title="Booking Details"
      size="lg"
      showFooter={true}
      footerActions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onEdit && (
            <Button variant="secondary" onClick={onEdit}>
              Edit
            </Button>
          )}
          {onCancel && (
            <Button variant="destructive" onClick={onCancel}>
              Cancel Booking
            </Button>
          )}
          {onComplete && (
            <Button onClick={onComplete}>
              Mark Complete
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{bookingData.title}</h3>
          <span
            className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              statusColors[bookingData.status as keyof typeof statusColors] || "text-gray-600"
            )}
          >
            {bookingData.status.replace("-", " ").toUpperCase()}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Date</label>
            <p className="text-sm">{bookingData.date}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Time</label>
            <p className="text-sm">{bookingData.time}</p>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-muted-foreground">Address</label>
            <p className="text-sm">{bookingData.address}</p>
          </div>
          {bookingData.cleaner && (
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-muted-foreground">Assigned Cleaner</label>
              <p className="text-sm">{bookingData.cleaner}</p>
            </div>
          )}
        </div>
      </div>
    </ShaleanModal>
  );
}

interface ServiceSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (serviceId: string) => void;
  services: Array<{
    id: string;
    title: string;
    description: string;
    price: string;
    duration: string;
    features: string[];
  }>;
  selectedServiceId?: string;
}

export function ServiceSelectionModal({
  isOpen,
  onClose,
  onSelect,
  services,
  selectedServiceId,
}: ServiceSelectionModalProps) {
  return (
    <ShaleanModal
      open={isOpen}
      onOpenChange={onClose}
      title="Select a Service"
      description="Choose the cleaning service that best fits your needs"
      size="xl"
      showFooter={true}
      footerActions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (selectedServiceId) {
                onSelect(selectedServiceId);
                onClose();
              }
            }}
            disabled={!selectedServiceId}
          >
            Select Service
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => (
          <div
            key={service.id}
            className={cn(
              "p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md",
              selectedServiceId === service.id
                ? "border-primary bg-primary/5 ring-2 ring-primary ring-offset-2"
                : "border-border hover:border-primary/50"
            )}
            onClick={() => onSelect(service.id)}
          >
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold">{service.title}</h4>
                <span className="text-lg font-bold text-primary">{service.price}</span>
              </div>
              <p className="text-sm text-muted-foreground">{service.description}</p>
              <p className="text-xs text-muted-foreground">Duration: {service.duration}</p>
              <ul className="space-y-1">
                {service.features.slice(0, 3).map((feature, index) => (
                  <li key={index} className="text-xs flex items-center">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
                {service.features.length > 3 && (
                  <li className="text-xs text-muted-foreground">
                    +{service.features.length - 3} more features
                  </li>
                )}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </ShaleanModal>
  );
}
