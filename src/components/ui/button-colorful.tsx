import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import * as React from "react";

export interface ButtonColorfulProps extends ButtonProps {
    label?: string;
    icon?: React.ReactNode;
}

export function ButtonColorful({
    className,
    label = "Carregar",
    icon,
    disabled,
    ...props
}: ButtonColorfulProps) {
    return (
        <Button
            className={cn(
                "relative h-10 px-6 overflow-hidden rounded-lg font-semibold",
                "bg-ink text-white border-0",
                "transition-all duration-200",
                "group disabled:opacity-50 disabled:cursor-not-allowed",
                className
            )}
            disabled={disabled}
            {...props}
        >
            {/* Gradient background effect */}
            {!disabled && (
                <div
                    className={cn(
                        "absolute inset-0",
                        "bg-gradient-to-r from-[#d5c5ff] via-[#fdceb0] to-[#d0c0e8]", // Memvo gradients
                        "opacity-30 group-hover:opacity-80",
                        "blur-md transition-opacity duration-500"
                    )}
                />
            )}

            {/* Content */}
            <div className="relative flex items-center justify-center gap-2">
                <span className="text-white z-10 drop-shadow-sm">{label}</span>
                {icon ? icon : <ArrowUpRight className="w-3.5 h-3.5 text-white/90 z-10" />}
            </div>
        </Button>
    );
}

export { ButtonColorful };
