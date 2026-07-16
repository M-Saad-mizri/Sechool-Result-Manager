import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle, AlertCircle, XOctagon } from 'lucide-react';

export default function Toast() {
  const { toast } = useApp();
  const [localToast, setLocalToast] = useState(null);
  const [animateOut, setAnimateOut] = useState(false);

  useEffect(() => {
    if (toast) {
      setLocalToast(toast);
      setAnimateOut(false);

      const hideTimeout = setTimeout(() => {
        setAnimateOut(true);
      }, 3200);

      const removeTimeout = setTimeout(() => {
        setLocalToast(null);
      }, 3500);

      return () => {
        clearTimeout(hideTimeout);
        clearTimeout(removeTimeout);
      };
    }
  }, [toast]);

  if (!localToast) return null;

  let Icon = CheckCircle;
  let typeClass = 'success';
  if (localToast.type === 'warning') {
    Icon = AlertCircle;
    typeClass = 'warning';
  } else if (localToast.type === 'danger') {
    Icon = XOctagon;
    typeClass = 'danger';
  }

  const animationStyle = animateOut 
    ? { animation: 'slideInRight 0.3s reverse forwards' } 
    : { animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)' };

  return (
    <div className="toast-container">
      <div className={`toast ${typeClass}`} style={animationStyle}>
        <Icon style={{ width: '20px', height: '20px' }} />
        <div className="toast-text">{localToast.message}</div>
      </div>
    </div>
  );
}
