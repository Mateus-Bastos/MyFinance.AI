export const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(valor)
}

export const formatarData = (data) => {
  // Evita problema de timezone: "2025-12-01" interpretado como UTC
  // vira "30/11/2025" no Brasil (UTC-3)
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

