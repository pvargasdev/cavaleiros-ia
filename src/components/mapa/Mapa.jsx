import React, { useMemo } from 'react'
import mapaBaseUrl from '../../assets/Mapa.csv?raw'

// Mapeia o ID numérico do CSV para uma cor do Tailwind
function getTileColor(tileId) {
  const id = parseInt(tileId, 10)
  
  if (id === 14) return 'bg-gray-700' // Terreno Montanhoso
  if (id === 15) return 'bg-gray-400' // Terreno Plano
  if (id === 16) return 'bg-gray-900' // Terreno Rochoso
  
  if (id === 0) return 'bg-red-500' // Partida
  if (id === 13) return 'bg-green-500' // Chegada
  
  if (id >= 1 && id <= 12) return 'bg-yellow-500' // Casas do Zodíaco
  
  return 'bg-black' // Fallback
}

function Mapa({ csvPersonalizado }) {

  // Converte a string do CSV em uma matriz bidimensional

  // O useMemo armazena o resultado e só recalcula se o CSV mudar, poupando processamento.
  const matrizMapa = useMemo(() => {
    // Se o usuário fez upload, usa o personalizado, senão, usa o arquivo local.
    const rawData = csvPersonalizado || mapaBaseUrl
    
    if (!rawData) return []

    // Tratamento dos dados
    
    return rawData
      .split('\n')
      .filter(linha => linha.trim() !== '')
      .map(linha => linha.split(',').map(item => item.trim()))
  }, [csvPersonalizado])

  // Identifica o tamanho da matriz para alimentar o CSS Grid
  const numLinhas = matrizMapa.length
  const numColunas = numLinhas > 0 ? matrizMapa[0].length : 0

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      
      {/* Título posicionado de forma absoluta para não empurrar o grid para baixo */}
      <h2 className="text-xl font-bold mb-2 text-gray-300 absolute top-2 left-4">
        Mapa {numColunas}x{numLinhas} (A*)
      </h2>
      
      {/* Container principal do mapa */}
      <div 
        className="border-2 border-gray-900 shadow-2xl"
        style={{ 
          display: 'grid', 
          gridTemplateColumns: `repeat(${numColunas}, minmax(0, 1fr))`,
          width: 'min(100%, 70vh)',
          aspectRatio: '1 / 1'
        }}
      >
        {/* Renderiza cada célula iterando sobre as linhas e colunas da matriz */}
        {matrizMapa.map((linha, rowIndex) => (
          linha.map((tileId, colIndex) => (
            <div 
              key={`${rowIndex}-${colIndex}`}
              className={`w-full h-full ${getTileColor(tileId)} border border-black/20`}
              title={`Pos: [${rowIndex}, ${colIndex}] | ID: ${tileId}`}
            />
          ))
        ))}
      </div>

    </div>
  )
}

export default Mapa