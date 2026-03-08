import React, { useEffect, useRef } from 'react'

function Caminho({ dadosIa, batalhasRealizadas = []}) {
  const fimRef = useRef(null)

  if (!dadosIa) {
    return <div className="text-center text-gray-500 mt-10 font-mono">Calculando rota...</div>
  }

  return (
    <div className="flex flex-col h-full font-mono">
      <h2 className="text-lg font-bold mb-2 text-gray-300 border-b border-gray-600 pb-2 flex justify-between">
        <span>LOG DE BATALHAS</span>
      </h2>
      
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-600">
        {batalhasRealizadas.map((batalha, index) => (
          <div key={index} className="bg-gray-800 p-2 border-l-2 border-yellow-500 shadow-md">
            <div className="flex justify-between items-center mb-1">
              <span className="text-yellow-400 font-bold uppercase text-xs tracking-wider">
                {batalha.local || `Casa ${index + 1}`}
              </span>
              
              <span className="text-[10px] text-black bg-yellow-500 px-1 font-bold">
                DIFICULDADE: {batalha.dificuldade}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-1 text-xs text-gray-400 mt-2">
               <div>Equipe: <span className="text-white">{(batalha.cavaleiros_escolhidos || []).join(', ')}</span></div>
               <div className="text-right">Tempo: {batalha.tempo_batalha}m</div>
            </div>
            
            <div className={`mt-2 text-xs font-bold text-center py-1 border ${batalha.venceu ? 'border-green-800 text-green-400' : 'border-red-800 text-red-400'}`}>
               {batalha.venceu ? 'VITÓRIA' : 'DERROTA'}
            </div>
          </div>
        ))}

        <div ref={fimRef} />
      </div>
    </div>
  )
}

export default Caminho