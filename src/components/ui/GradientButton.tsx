import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ReactNode, MouseEventHandler } from "react";

interface GradientButtonProps {
  children: ReactNode;
  variant?: "primary" | "glass" | "outline";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export const GradientButton = ({
  children,
  variant = "primary",
  size = "md",
  icon,
  className,
  onClick,
  type = "button",
  disabled,
}: GradientButtonProps) => {
  const sizeClasses = {
    sm: "py-2 px-4 text-sm",
    md: "py-3 px-6 text-base",
    lg: "py-4 px-8 text-lg",
  };

  const variantClasses = {
    primary: "gradient-button text-primary-foreground font-semibold",
    glass: "glass-button text-foreground font-medium",
    outline: "bg-transparent border-2 border-primary text-primary hover:bg-primary/10 font-semibold",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-full flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {icon}
      {children}
    </motion.button>
  );
};
