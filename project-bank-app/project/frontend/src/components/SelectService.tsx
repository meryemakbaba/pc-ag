import React from 'react';
import { Landmark, AtSign, LogOut } from 'lucide-react';
import Button from './shared/Button';

interface SelectServiceProps {
  onSelect: (type: 'atm' | 'online') => void;
  onLogout: () => void;
  username: string;
}

const SelectService: React.FC<SelectServiceProps> = ({ onSelect, onLogout, username }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl px-4">
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
          {/* Header */}
          <div className="p-6 text-center border-b border-gray-700">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Hoşgeldiniz, {username}</h1>
            <p className="text-gray-400 mt-1">Lütfen bankacılık hizmetinizi seçiniz</p>
          </div>

          {/* Service selection */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ATM Button */}
              <div 
                className="group cursor-pointer bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 hover:border-indigo-400/30"
                onClick={() => onSelect('atm')}
              >
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-600 to-indigo-800 group-hover:from-indigo-500 group-hover:to-indigo-700 transition-all duration-300 shadow-lg">
                    <Landmark className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white group-hover:text-indigo-300 transition-colors duration-200">ATM</h3>
                  <p className="text-gray-400 text-center">Hızlı nakit çekim ve yatırım</p>
                  <button className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200">
                    ATM'ye Git
                  </button>
                </div>
              </div>

              {/* Online Banking Button */}
              <div 
                className="group cursor-pointer bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:border-purple-400/30"
                onClick={() => onSelect('online')}
              >
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-purple-800 group-hover:from-purple-500 group-hover:to-purple-700 transition-all duration-300 shadow-lg">
                    <AtSign className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white group-hover:text-purple-300 transition-colors duration-200">Çevrimiçi Bankacılık</h3>
                  <p className="text-gray-400 text-center">Hesap yönetimi ve işlem geçmişi</p>
                  <button className="px-6 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg shadow-md hover:bg-purple-700 transition-colors duration-200">
                    Çevrimiçi Bankacılık'a Git
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer with logout */}
          <div className="p-4 flex justify-center border-t border-gray-700">
            <Button 
              text="Çıkış Yap" 
              onClick={onLogout} 
              variant="secondary" 
              icon={<LogOut size={18} />} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectService;