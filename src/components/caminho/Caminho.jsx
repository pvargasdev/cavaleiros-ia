import React, { useEffect, useRef } from 'react'

function Caminho({ dadosIa, passoAtual }) {
  const fimRef = useRef(null)

  // Auto-scroll para o final da lista quando atualiza
  useEffect(() => {
    if (fimRef.current) {
      fimRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [dadosIa])

  // Se não tem dados, mostra loading
  if (!dadosIa) {
    return (
      <div className="flex flex-col h-full justify-center items-center text-gray-500 text-sm italic">
        <p>Aguardando dados...</p>
      </div>
    )
  }

  const batalhas = Array.isArray(dadosIa.batalhas) ? dadosIa.batalhas : [];

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-bold mb-4 text-gray-300 border-b border-gray-600 pb-2">
        Log da Jornada
      </h2>
      
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        
        {/* Início */}
        <div className="bg-gray-700 p-2 rounded text-sm border-l-4 border-blue-500">
          <span className="text-blue-400 font-bold">[Partida]</span> 
          {' '}Rota calculada: <span className="text-white font-bold">{dadosIa.caminho?.length || 0}</span> passos.
        </div>

        {/* Lista de Batalhas */}
        {batalhas.map((batalha, index) => (
          <div key={index} className="bg-gray-700 p-2 rounded text-sm border-l-4 border-yellow-500 flex flex-col gap-1">
            <div>
              <span className="text-yellow-400 font-bold">[{batalha.local || "Local desconhecido"}]</span>
            </div>
            <div className="text-gray-300 text-xs">
              <span className="text-gray-400">Equipe:</span> {(batalha.cavaleiros_escolhidos || []).join(', ')}
            </div>
            <div className="text-gray-300 text-xs">
              <span className="text-gray-400">Duração:</span> {batalha.tempo_batalha} min
            </div>
            <div className={`${batalha.venceu ? 'text-green-400' : 'text-red-400'} font-semibold text-xs`}>
              {batalha.venceu ? 'VITÓRIA' : 'DERROTA'}
            </div>
          </div>
        ))}

        {/* Fim */}
        <div ref={fimRef} className={`p-2 rounded text-sm border-l-4 ${dadosIa.sucesso ? 'bg-green-900/30 border-green-500' : 'bg-red-900/30 border-red-500'}`}>
          <span className={dadosIa.sucesso ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
            {dadosIa.sucesso ? '[MISSÃO CUMPRIDA]' : '[FALHA]'}
          </span> 
          {' '}Custo total: <span className="text-white font-bold">{dadosIa.tempo_total} minutos</span>.
        </div>

      </div>
    </div>
  )
}

export default Caminho