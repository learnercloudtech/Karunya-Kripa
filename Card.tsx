import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick, hoverEffect = false }) => {
  const baseClasses = "bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden";
  
  const interactiveClasses = hoverEffect 
    ? "transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1" 
    : "";
  
  const clickableClasses = onClick ? "cursor-pointer" : "";

  return (
    <div
      className={`${baseClasses} ${interactiveClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;