import { useId } from 'react'

export default function Logo({ size = 40, className = '' }) {
  const id = useId()
  const gradientId = `logoGradient-${id}`
  const lineGradientId = `lineGradient-${id}`
  const glowId = `glow-${id}`

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background com gradiente */}
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="50%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#D946EF" />
        </linearGradient>
        <linearGradient id={lineGradientId} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#C4B5FD" />
          <stop offset="100%" stopColor="#FFFFFF" />
        </linearGradient>
        {/* Glow effect */}
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Fundo arredondado */}
      <rect 
        x="0" 
        y="0" 
        width="40" 
        height="40" 
        rx="10" 
        fill={`url(#${gradientId})`}
      />
      
      {/* Gráfico de barras (finanças) - estilizado */}
      <rect x="8" y="24" width="4" height="8" rx="1" fill="rgba(255,255,255,0.3)" />
      <rect x="14" y="20" width="4" height="12" rx="1" fill="rgba(255,255,255,0.4)" />
      <rect x="20" y="16" width="4" height="16" rx="1" fill="rgba(255,255,255,0.5)" />
      
      {/* Linha ascendente (crescimento/IA) */}
      <path 
        d="M8 26 L15 19 L22 22 L32 10" 
        stroke={`url(#${lineGradientId})`}
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        fill="none"
        filter={`url(#${glowId})`}
      />
      
      {/* Ponto de destaque (representando IA/insight) */}
      <circle cx="32" cy="10" r="3" fill="white" filter={`url(#${glowId})`} />
      <circle cx="32" cy="10" r="1.5" fill="#D946EF" />
      
      {/* Círculos conectados (rede neural - IA) */}
      <circle cx="8" cy="26" r="2" fill="white" opacity="0.9" />
      <circle cx="15" cy="19" r="2" fill="white" opacity="0.9" />
      <circle cx="22" cy="22" r="2" fill="white" opacity="0.9" />
    </svg>
  )
}

// Versão apenas do ícone (sem fundo)
export function LogoIcon({ size = 24, className = '' }) {
  const id = useId()
  const gradientId = `iconGradient-${id}`

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#D946EF" />
        </linearGradient>
      </defs>
      
      {/* Gráfico simplificado */}
      <rect x="2" y="14" width="3" height="8" rx="1" fill={`url(#${gradientId})`} opacity="0.5" />
      <rect x="7" y="10" width="3" height="12" rx="1" fill={`url(#${gradientId})`} opacity="0.7" />
      <rect x="12" y="6" width="3" height="16" rx="1" fill={`url(#${gradientId})`} />
      
      {/* Linha de tendência */}
      <path 
        d="M3 15 L8 10 L14 13 L21 4" 
        stroke={`url(#${gradientId})`}
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Ponto de insight */}
      <circle cx="21" cy="4" r="2" fill="#D946EF" />
    </svg>
  )
}
