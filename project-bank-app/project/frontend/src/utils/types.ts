export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  isFake: boolean;
  date: string;
}

export interface ButtonProps {
  text: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  fullWidth?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export interface InputProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  maxLength?: number;
  minLength?: number;
}

export interface LoginFormData {
  cardNumber: string;
  password: string;
  email: string;
  phoneNumber: string;
  name: string;
  tcId: string;
  emailCode?: string;
  phoneCode?: string;
}

export interface VerificationData {
  email: string;
  phoneNumber: string;
  timeRemaining: number;
}