import React from "react";

interface IconButtonProps {
  icon: React.ElementType;
  className?: string;
  onClick?: () => void;
  title?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  className = "",
  onClick,
  title,
}) => (
  <button
    onClick={onClick}
    title={title}
    className={`p-2 rounded-lg hover:bg-background-elevated text-text-secondary hover:text-text-primary transition-colors ${className}`}
  >
    <Icon size={16} />
  </button>
);
