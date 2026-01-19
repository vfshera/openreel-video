import React from "react";

interface IconButtonProps {
  icon: React.ElementType;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  className = "",
  onClick,
  disabled,
  title,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-1.5 rounded-lg hover:bg-background-elevated text-text-secondary hover:text-text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${className}`}
  >
    <Icon size={14} />
  </button>
);
