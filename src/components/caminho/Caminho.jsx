import React, { useEffect, useRef } from 'react'

function Caminho({ dadosIa, batalhasRealizadas = [], passoAtual }) {
  const fimRef = useRef(null)

  useEffect(() => {
    if (fimRef.current) {
      fimRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [batalhasRealizadas.length, passoAtual])

  if (!dadosIa) {
    return <div className="text-center text-gray-500 mt-10 font-mono">Calculando rota...</div>
  }

  const chegouAoFim = passoAtual >= (dadosIa.caminho?.length || 0) - 1

  return (
    <div className="flex flex-col h-full font-mono">
      <h2 className="text-lg font-bold mb-2 text-gray-300 border-b border-gray-600 pb-2 flex justify-between">
        <span>DIÁRIO DE BORDO</span>
      </h2>
      
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-600">
        
        <div className="bg-blue-900/20 p-2 border-l-2 border-blue-500">
          <span className="text-blue-400 font-bold">[INÍCIO]</span> 
          <p className="text-gray-300 text-xs mt-1">
            Missão iniciada. Rumo ao Grande Mestre.
          </p>
        </div>

        {batalhasRealizadas.map((batalha, index) => (
          <div key={index} className="bg-gray-800 p-2 border-l-2 border-yellow-500 shadow-md">
            <div className="flex justify-between items-center mb-1">
              <span className="text-yellow-400 font-bold uppercase text-xs tracking-wider">
                {batalha.local || `Casa ${index + 1}`}
              </span>
              
              <span className="text-[10px] text-black bg-yellow-500 px-1 font-bold">
                DIF: {batalha.dificuldade}
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

        {chegouAoFim && (
            <div className={`p-3 border-l-4 shadow-lg ${dadosIa.sucesso ? 'bg-green-900/20 border-green-500' : 'bg-red-900/20 border-red-500'}`}>
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{dadosIa.sucesso ? '🏆' : '☠️'}</span>
                    <div>
                        <span className={dadosIa.sucesso ? "text-green-400 font-bold block" : "text-red-400 font-bold block"}>
                            {dadosIa.sucesso ? 'GRANDE MESTRE ALCANÇADO!' : 'TEMPO ESGOTADO!'}
                        </span> 
                    </div>
                </div>
            </div>
        )}

        <div ref={fimRef} />
      </div>
    </div>
  )
}

export default Caminho