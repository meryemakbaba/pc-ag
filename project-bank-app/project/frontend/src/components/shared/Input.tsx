import React from 'react';
import { InputProps } from '../../utils/types';

const Input: React.FC<InputProps> = ({
  id,
  label,
  type,
  value,  
  onChange,
  placeholder,
  required = false,
  error,
  maxLength, // 👈 Eklenen satır
  minLength,
}) => {
  return (
    <div className="mb-4">
      <label 
        htmlFor={id} 
        className="block text-sm font-medium text-gray-200 mb-1"
      >
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength} // 👈 Eklenen satır
        minLength={minLength}
        className="w-full bg-gray-800 bg-opacity-50 text-white border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
      />
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
};

export default Input;
