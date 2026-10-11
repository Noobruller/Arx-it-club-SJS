import React from 'react';











/**
 * Intelligently merges variant defaults with custom class names,
 * stripping conflicting background, text color, border color, hover,
 * and shadow utilities so custom classes always cleanly take effect
 * without CSS cascading or specificity conflicts.
 */
function mergeButtonClasses(variantClassStr, customClassName) {
  if (!customClassName || !customClassName.trim()) return variantClassStr;

  const customTokens = customClassName.trim().split(/\s+/);

  const hasCustomBg = customTokens.some(
    (c) => /^bg-/.test(c) && !/^bg-opacity-/.test(c)
  );
  const hasCustomText = customTokens.some(
    (c) => /^text-/.test(c) && !/^(text-(xs|sm|base|lg|xl|2xl|3xl|left|center|right|justify))$/.test(c)
  );
  const hasCustomBorderColor = customTokens.some(
    (c) => /^border-/.test(c) && !/^(border-(0|2|4|8|t|b|l|r|x|y|none|solid|dashed|dotted))$/.test(c)
  );
  const hasCustomHoverBg = customTokens.some((c) => /^hover:bg-/.test(c));
  const hasCustomHoverBorder = customTokens.some((c) => /^hover:border-/.test(c));
  const hasCustomHoverText = customTokens.some((c) => /^hover:text-/.test(c));
  const hasCustomShadow = customTokens.some((c) => /^shadow(-[a-z0-9]+)?$/.test(c));
  const hasCustomRing = customTokens.some((c) => /^focus:ring-/.test(c));

  const variantTokens = variantClassStr.trim().split(/\s+/);
  const filteredVariantTokens = variantTokens.filter((token) => {
    if (hasCustomBg && /^bg-/.test(token)) return false;
    if (hasCustomText && /^text-/.test(token) && !/^(text-(xs|sm|base|lg|xl|2xl))$/.test(token)) return false;
    if (hasCustomBorderColor && /^border-/.test(token) && token !== 'border') return false;
    if (hasCustomHoverBg && /^hover:bg-/.test(token)) return false;
    if (hasCustomHoverBorder && /^hover:border-/.test(token)) return false;
    if (hasCustomHoverText && /^hover:text-/.test(token)) return false;
    if (hasCustomShadow && /^shadow(-[a-z0-9]+)?$/.test(token)) return false;
    if (hasCustomRing && /^focus:ring-/.test(token)) return false;
    return true;
  });

  return `${filteredVariantTokens.join(' ')} ${customClassName}`.trim();
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  type = 'button',
  ...props
}) => {
  const baseClasses =
  'inline-flex items-center justify-center font-sans tracking-tight select-none transition-colors duration-150 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FC6454]/40 dark:focus:ring-[#6BB89E]/40 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer whitespace-nowrap shrink-0';

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5 font-medium',
    md: 'text-xs sm:text-sm px-3.5 py-2 gap-2 font-medium',
    lg: 'text-sm px-4.5 py-2.5 gap-2.5 font-semibold'
  };

  const variantClasses = {
    primary:
    'bg-[#FC6454] text-white hover:bg-[#E04D3E] border border-[#FC6454] dark:bg-[#2F8068] dark:text-[#F1F7F4] dark:hover:bg-[#3A9277] dark:border-[#2F8068] dark:font-semibold shadow-xs',
    secondary:
    'bg-[#EFE6DE] text-[#282828] hover:bg-[#E7DDD4] border border-[#282828]/15 dark:bg-[#15362B] dark:text-[#F1F7F4] dark:hover:bg-[#1C4436] dark:border-[#25473C]',
    outline:
    'bg-transparent text-[#282828] hover:bg-[#FC6454]/10 border border-[#282828]/25 dark:text-[#F1F7F4] dark:hover:bg-[#2F8068]/20 dark:hover:text-white dark:border-[#25473C]',
    'outline-dark':
    'bg-transparent text-[#282828] hover:bg-[#EFE6DE] border border-[#282828]/30 dark:text-[#F1F7F4] dark:hover:bg-[#15362B] dark:border-[#25473C]',
    ghost:
    'bg-transparent text-[#282828] hover:text-[#FC6454] hover:bg-[#FC6454]/10 dark:text-[#F1F7F4] dark:hover:text-[#6BB89E] dark:hover:bg-[#2F8068]/15 border border-transparent',
    danger:
    'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60 dark:hover:bg-rose-950/60'
  };

  const combinedVariantClasses = mergeButtonClasses(variantClasses[variant], className);

  return (
    <button
      type={type}
      className={`${baseClasses} ${sizeClasses[size]} ${combinedVariantClasses}`}
      disabled={disabled || loading}
      {...props}>
      
      {loading &&
      <svg
        className="animate-spin -ml-1 mr-2 h-4 w-4 text-current shrink-0"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24">
        
          <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4" />
        
          <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8H4z" />
        
        </svg>
      }
      {children}
    </button>);

};