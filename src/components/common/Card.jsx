import React from 'react';







export const Card = ({
  children,
  hoverEffect = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-[var(--surface)] dark:bg-[#102B22] rounded-lg border border-[var(--color-border)] dark:border-[#25473C] text-[var(--color-text-primary)] dark:text-[#F1F7F4] shadow-xs ${
      hoverEffect ?
      'transition-colors duration-150 hover:border-[#FC6454]/50 dark:hover:border-[#6BB89E]/60' :
      ''} ${
      className}`}
      {...props}>
      
      {children}
    </div>);

};