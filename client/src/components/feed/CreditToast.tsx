import { useEffect, useState } from "react";
import { X, Coins } from "lucide-react";

interface CreditToastProps {
  show: boolean;
  amount: number;
  onClose: () => void;
  autoCloseDelay?: number;
}

export default function CreditToast({ 
  show, 
  amount, 
  onClose, 
  autoCloseDelay = 5000 
}: CreditToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (show) {
      setIsVisible(true);
      timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Allow animation to complete before removing from DOM
      }, autoCloseDelay);
    } else {
      setIsVisible(false);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [show, autoCloseDelay, onClose]);
  
  if (!show) return null;
  
  return (
    <div 
      className={`fixed bottom-4 right-4 bg-primary text-white rounded-lg shadow-lg px-4 py-3 flex items-center transform transition-transform duration-300 z-50 ${
        isVisible ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="bg-primary-400 rounded-full w-10 h-10 flex items-center justify-center mr-3 flex-shrink-0">
        <Coins />
      </div>
      <div>
        <p className="font-medium">Credits Earned!</p>
        <p className="text-sm">You earned {amount} credits for interacting with content</p>
      </div>
      <button 
        className="ml-4 text-primary-200 hover:text-white"
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
