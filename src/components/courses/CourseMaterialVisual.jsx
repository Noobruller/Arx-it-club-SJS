import React from 'react';

















export function getModuleMaterialMeta(course) {
  const text = `${course.id || ''} ${course.slug || ''} ${course.title || ''} ${course.category || ''}`.toLowerCase();

  if (text.includes('ai') || text.includes('machine learning') || text.includes('intelligence') || text.includes('deep learning')) {
    return {
      iconName: 'psychology',
      badge: 'AI & MACHINE LEARNING',
      gradient: 'from-[#1A102F] via-[#261545] to-[#3A1B60]',
      glowColor: 'rgba(167, 139, 250, 0.35)',
      accentColor: '#A78BFA',
      // Google Material Icon 'psychology' (neural / AI intelligence brain)
      svgPath: 'M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm2.5 14h-5v-1.12l-.66-.46C7.58 13.53 7 12.08 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 3.08-.58 4.53-1.84 5.42l-.66.46V16zm-3.5 3h2v1h-2zm-1 2h4v1h-4z'
    };
  }

  if (text.includes('python')) {
    return {
      iconName: 'terminal',
      badge: 'PYTHON',
      gradient: 'from-[#0B132B] via-[#0E1B38] to-[#1C2541]',
      glowColor: 'rgba(56, 189, 248, 0.25)',
      accentColor: '#38BDF8',
      // Google Material Icon 'terminal' path
      svgPath: 'M20 4H4c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8h16v10zm-12.5-3.5L11 12 7.5 9.5l1-1.5 4.5 4-4.5 4-1-1.5zM13 16h4v-2h-4v2z'
    };
  }

  if (text.includes('cyber') || text.includes('security')) {
    return {
      iconName: 'security',
      badge: 'CYBERSECURITY',
      gradient: 'from-[#051A14] via-[#07241C] to-[#0E3529]',
      glowColor: 'rgba(16, 185, 129, 0.25)',
      accentColor: '#10B981',
      // Google Material Icon 'security' path
      svgPath: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z'
    };
  }

  if (text.includes('robot')) {
    return {
      iconName: 'smart_toy',
      badge: 'ROBOTICS',
      gradient: 'from-[#190F2E] via-[#241344] to-[#341857]',
      glowColor: 'rgba(168, 85, 247, 0.25)',
      accentColor: '#A855F7',
      // Google Material Icon 'smart_toy' path
      svgPath: 'M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zm-2 10H6V7h12v12zm-9-6c-.83 0-1.5-.67-1.5-1.5S8.17 10 9 10s1.5.67 1.5 1.5S9.83 13 9 13zm6 0c-.83 0-1.5-.67-1.5-1.5S14.17 10 15 10s1.5.67 1.5 1.5S15.83 13 15 13zm-7 3h8v1.5H8V16z'
    };
  }

  // Default: Web Design & Development
  return {
    iconName: 'devices',
    badge: 'WEB DESIGN & DEV',
    gradient: 'from-[#0F172A] via-[#161F38] to-[#1E1B4B]',
    glowColor: 'rgba(252, 100, 84, 0.25)',
    accentColor: '#FC6454',
    // Google Material Icon 'devices' path
    svgPath: 'M4 6h18V4H4c-1.1 0-2 .9-2 2v11H0v3h14v-3H4V6zm19 2h-6c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zm-1 9h-4v-7h4v7z'
  };
}

export const CourseMaterialVisual = ({
  course,
  variant = 'card',
  className = ''
}) => {
  const meta = getModuleMaterialMeta(course);

  if (variant === 'banner') {
    return (
      <div
        className={`w-full h-56 sm:h-72 bg-gradient-to-br ${meta.gradient} relative overflow-hidden flex items-center justify-center select-none border-b border-[#282828]/10 dark:border-[#25473C] ${className}`}>
        
        {/* Subtle geometric background grid */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
            'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }} />
        

        {/* Ambient radial glow */}
        <div
          className="absolute w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-700"
          style={{ background: meta.glowColor }} />
        

        <div className="relative z-10 flex flex-col items-center text-center p-6 space-y-3">
          {/* Track Badge */}
          <div
            className="px-3.5 py-1 rounded-full text-[11px] font-mono font-semibold tracking-wider uppercase border shadow-xs"
            style={{
              backgroundColor: `${meta.accentColor}18`,
              borderColor: `${meta.accentColor}40`,
              color: meta.accentColor
            }}>
            
            {meta.badge}
          </div>

          {/* Large Material Icon with Dual Render (Font Icon + Inline SVG Fallback) */}
          <div
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex items-center justify-center shadow-2xl relative border"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderColor: `${meta.accentColor}50`
            }}>
            
            <span
              className="material-symbols-outlined text-6xl sm:text-7xl leading-none"
              style={{ color: meta.accentColor }}
              aria-hidden="true">
              
              {meta.iconName}
            </span>
          </div>

          <p className="text-xs font-mono text-white/60 tracking-wider">
            OFFICIAL CURRICULUM MODULE
          </p>
        </div>
      </div>);

  }

  if (variant === 'compact') {
    return (
      <div
        className={`w-12 h-12 rounded-lg bg-gradient-to-br ${meta.gradient} flex items-center justify-center shrink-0 border border-white/10 ${className}`}>
        
        <span
          className="material-symbols-outlined text-2xl"
          style={{ color: meta.accentColor }}
          aria-hidden="true">
          
          {meta.iconName}
        </span>
      </div>);

  }

  // Default: 'card' (176px tall for grid cards)
  return (
    <div
      className={`w-full h-44 bg-gradient-to-br ${meta.gradient} relative overflow-hidden flex items-center justify-center select-none border-b border-[#282828]/10 dark:border-[#25473C] group-hover:brightness-105 transition-all duration-300 ${className}`}>
      
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage:
          'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }} />
      

      {/* Ambient radial glow */}
      <div
        className="absolute w-48 h-48 rounded-full blur-2xl pointer-events-none transition-all duration-500"
        style={{ background: meta.glowColor }} />
      

      {/* Centered Material Icon Presentation */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-2">
        {/* Module Pill */}
        <span
          className="text-[10px] font-mono font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full border shadow-xs"
          style={{
            backgroundColor: `${meta.accentColor}18`,
            borderColor: `${meta.accentColor}35`,
            color: meta.accentColor
          }}>
          
          {meta.badge}
        </span>

        {/* Icon Plate */}
        <div
          className="w-18 h-18 rounded-xl flex items-center justify-center shadow-lg border relative transition-transform duration-300 group-hover:scale-105"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderColor: `${meta.accentColor}40`
          }}>
          
          <span
            className="material-symbols-outlined text-4xl sm:text-5xl leading-none"
            style={{ color: meta.accentColor }}
            aria-hidden="true">
            
            {meta.iconName}
          </span>
        </div>
      </div>
    </div>);

};