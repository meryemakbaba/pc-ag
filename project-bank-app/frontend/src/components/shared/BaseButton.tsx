import React, { ButtonHTMLAttributes } from 'react';

interface BaseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  variant?: 'primary' | 'secondary' | 'orange';
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const BaseButton: React.FC<BaseButtonProps> = ({ 
  text, variant = 'primary', icon, fullWidth, className = '', ...props 
}) => {
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg",
    secondary: "bg-gray-100 text-blue-950 hover:bg-gray-200",
    orange: "bg-orange-600 text-white hover:bg-orange-700 shadow-orange-200 shadow-lg"
  };

  return (
    <button 
      {...props} // Tüm standart HTML özelliklerini (type="submit" dahil) buraya aktarır
      className={`flex items-center justify-center font-bold px-6 py-4 rounded-2xl transition-all active:scale-95 disabled:opacity-50 ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {text}
    </button>
  );
};

export default BaseButton;