"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn("modal-overlay fixed inset-0 z-[90] bg-[rgba(5,5,5,0.8)]", className)}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    {/* Positioner: solo centra (sin scroll). Radix bloquea el scroll fuera
        del Content, así que el scroll DEBE vivir dentro del Content. */}
    <div className="modal-positioner fixed inset-0 z-[91] flex items-center justify-center p-4 sm:p-6">
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "modal-anim relative flex max-h-[88dvh] w-full max-w-[440px] flex-col",
          "overflow-hidden rounded-[18px] border border-line shadow-casino",
          "bg-[linear-gradient(170deg,var(--gray-2),var(--black-2))] focus:outline-none",
          className,
        )}
        {...props}
      >
        {/* Capa scrollable interna (hija del Content -> Radix sí la permite) */}
        <div className="modal-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
        <DialogPrimitive.Close className="absolute right-[22px] top-[22px] z-10 grid h-[34px] w-[34px] place-items-center rounded-full border border-line-soft bg-[var(--gray-2)] text-ink-2 transition-colors hover:border-line hover:text-ink focus:outline-none">
          <X className="h-4 w-4" strokeWidth={1.6} />
          <span className="sr-only">Cerrar</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </div>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={className} {...props} />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={className} {...props} />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogDescription,
};
