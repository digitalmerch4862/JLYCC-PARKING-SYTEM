
import { useState, useEffect } from 'react';

export const useClientOnly = () => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  return isMounted;
};

export const safeDateFormat = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return '-';
  }
};

export const safeDateDay = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch (e) {
    return '-';
  }
};
