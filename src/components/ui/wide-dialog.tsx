import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * WideDialog — same API as shadcn Dialog but DialogContent uses viewport-based sizing.
 * Usage: import from "@/components/ui/wide-dialog" instead of "@/components/ui/dialog".
 */

function WideDialog({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
    return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function WideDialogTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
    return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function WideDialogPortal({ ...props }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
    return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function WideDialogClose({ ...props }: React.ComponentProps<typeof DialogPrimitive.Close>) {
    return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function WideDialogOverlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
    return (
        <DialogPrimitive.Overlay
            data-slot="dialog-overlay"
            className={cn(
                "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/60 backdrop-blur-sm",
                className
            )}
            {...props}
        />
    )
}

function WideDialogContent({
    className,
    children,
    showCloseButton = true,
    size = "xl",
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
    showCloseButton?: boolean
    /** xl = 80vw, 2xl = 90vw, full = 96vw */
    size?: "xl" | "2xl" | "full"
}) {
    const widthClass = {
        xl: "w-[min(80vw,1200px)]",
        "2xl": "w-[min(90vw,1400px)]",
        full: "w-[96vw]",
    }[size]

    return (
        <WideDialogPortal>
            <WideDialogOverlay />
            <DialogPrimitive.Content
                data-slot="dialog-content"
                className={cn(
                    "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out",
                    "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                    "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
                    "fixed top-[50%] left-[50%] z-50 translate-x-[-50%] translate-y-[-50%]",
                    "flex flex-col gap-0 rounded-2xl border shadow-2xl outline-none duration-200",
                    "max-h-[90vh]",
                    widthClass,
                    className
                )}
                {...props}
            >
                {children}
                {showCloseButton && (
                    <DialogPrimitive.Close
                        data-slot="dialog-close"
                        className="absolute top-4 right-4 rounded-full p-1.5 opacity-60 hover:opacity-100 hover:bg-muted transition-all ring-offset-background focus:ring-ring focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                    >
                        <XIcon />
                        <span className="sr-only">Close</span>
                    </DialogPrimitive.Close>
                )}
            </DialogPrimitive.Content>
        </WideDialogPortal>
    )
}

function WideDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="dialog-header"
            className={cn("flex flex-col gap-1 px-6 pt-6 pb-4 border-b border-border", className)}
            {...props}
        />
    )
}

function WideDialogBody({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="dialog-body"
            className={cn("flex-1 overflow-y-auto px-6 py-4", className)}
            {...props}
        />
    )
}

function WideDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="dialog-footer"
            className={cn("flex items-center justify-end gap-2 px-6 py-4 border-t border-border", className)}
            {...props}
        />
    )
}

function WideDialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
    return (
        <DialogPrimitive.Title
            data-slot="dialog-title"
            className={cn("text-xl font-black tracking-tight", className)}
            {...props}
        />
    )
}

function WideDialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
    return (
        <DialogPrimitive.Description
            data-slot="dialog-description"
            className={cn("text-muted-foreground text-sm", className)}
            {...props}
        />
    )
}

export {
    WideDialog,
    WideDialogClose,
    WideDialogContent,
    WideDialogDescription,
    WideDialogFooter,
    WideDialogBody,
    WideDialogHeader,
    WideDialogOverlay,
    WideDialogPortal,
    WideDialogTitle,
    WideDialogTrigger,
}
