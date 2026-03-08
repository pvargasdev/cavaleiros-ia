import React, { useMemo } from 'react'
import mapaBaseUrl from '../../assets/Mapa.csv?raw'

function getTileColor(tileId) {
  const id = parseInt(tileId, 10)
  if (id === 0) return 'bg-red-600' // Start
  if (id === 13) return 'bg-blue-600' // Fim
  if (id === 14) return 'bg-gray-700' // Montanha
  if (id === 15) return 'bg-gray-300' // Plano
  if (id === 16) return 'bg-stone-500' // Rochoso
  if (id >= 1 && id <= 12) return 'bg-yellow-400' // Casas
  return 'bg-black'
}

function Mapa({ csvPersonalizado, posicaoAgente, rastro }) {

  const matrizMapa = useMemo(() => {
    const rawData = csvPersonalizado || mapaBaseUrl
    if (!rawData) return []
    return rawData.split('\n')
      .filter(l => l.trim() !== '')
      .map(l => l.split(',').map(i => i.trim()))
  }, [csvPersonalizado])

  const numLinhas = matrizMapa.length
  const numColunas = numLinhas > 0 ? matrizMapa[0].length : 0

  return (
    <div className="w-full h-full flex items-center justify-center p-2">
      <div 
        className="grid border-2 border-black bg-black shadow-2xl relative"
        style={{ 
          gridTemplateColumns: `repeat(${numColunas}, 1fr)`,
          gridTemplateRows: `repeat(${numLinhas}, 1fr)`,
          aspectRatio: '1 / 1',
          height: '100%',
          maxHeight: '100%',
          width: 'auto',
          maxWidth: '100%'
        }}
      >
        {matrizMapa.map((linha, rowIndex) => (
          linha.map((tileId, colIndex) => {
            
            const isAgenteAqui = posicaoAgente && 
                                 posicaoAgente[0] === rowIndex && 
                                 posicaoAgente[1] === colIndex

            const isRastro = rastro && rastro.some(p => p[0] === rowIndex && p[1] === colIndex)

            return (
              <div 
                key={`${rowIndex}-${colIndex}`}
                className={`relative w-full h-full ${getTileColor(tileId)} border-[0.1px] border-black/20`}
              >
                {isRastro && !isAgenteAqui && (
                   <div className="absolute inset-0 bg-green-500/40 pointer-events-none"></div>
                )}

                {isAgenteAqui && (
                  <div className="absolute inset-[10%] bg-green-500 border border-white shadow-sm z-10 transition-all duration-100 rounded-sm"></div>
                )}
              </div>
            )
          })
        ))}
      </div>
    </div>
  )
}

export default Mapa