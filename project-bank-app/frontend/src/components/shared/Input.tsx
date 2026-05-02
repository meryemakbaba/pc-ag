import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react'; 
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
  maxLength, 
  minLength,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className="mb-4">
      <label 
        htmlFor={id} 
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      
      <div className="relative"> {/* İkonu sağa sabitlemek için relative kapsayıcı */}
        <input
          id={id}
          type={inputType} // Değişken tipi burada kullanıyoruz
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          maxLength={maxLength} 
          minLength={minLength}
          className={`w-full bg-gray-300 bg-opacity-50 text-gray-800 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent placeholder:text-gray-400 transition-all duration-200 
            ${type === 'password' ? 'pr-12' : ''}`} // Şifre kutusunda sağdan ikon için yer aç
        />

        {/* Sadece tipi 'password' olan alanlarda bu butonu göster */}
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-800 transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;