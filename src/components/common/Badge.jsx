import React from 'react';








export const Badge = ({
  children,
  variant = 'blue',
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-1.5 py-0.5 tracking-tight font-medium',
    md: 'text-xs px-2 py-0.5 tracking-tight font-medium'
  };

  const variantClasses = {
    blue: 'bg-[#FC6454]/10 dark:bg-[#2F8068]/25 text-[#FC6454] dark:text-[#6BB89E] border border-[#FC6454]/25 dark:border-[#25473C]',
    emerald: 'bg-emerald-50 dark:bg-[#102B22] text-emerald-700 dark:text-[#58B889] border border-emerald-200 dark:border-[#25473C]',
    amber: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-[#D6A84F] border border-amber-200 dark:border-amber-800/60',
    purple: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60',
    slate: 'bg-[#EFE6DE] dark:bg-[#15362B] text-[#282828] dark:text-[#F1F7F4] border border-[#282828]/15 dark:border-[#25473C]',
    rose: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-[#D96B6B] border border-rose-200 dark:border-[#25473C]',
    cyan: 'bg-[#FC6454]/10 dark:bg-[#2F8068]/25 text-[#FC6454] dark:text-[#6BB89E] border border-[#FC6454]/30 dark:border-[#25473C]'
  };

  return (
    <span
      className={`inline-flex items-center rounded-sm select-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
      
      {children}
    </span>);

};