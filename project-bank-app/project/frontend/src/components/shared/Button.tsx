import React from 'react';
import { ButtonProps } from '../../utils/types';

const Button: React.FC<ButtonProps> = ({
  text,
  onClick,
  variant = 'primary',
  fullWidth = false,
  className = '',
  icon,
}) => {
  const baseClasses = 'flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/20',
    secondary: 'bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white shadow-lg shadow-slate-700/10',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg shadow-red-500/20',
  };
  
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${className}`}
    >
      {icon && <span>{icon}</span>}
      {text}
    </button>
  );
};

export default Button;