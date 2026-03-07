import React from 'react'

// Recebe a prop "dadosIa" que será enviada pelo componente pai
function Caminho({ dadosIa }) {
  return (
    <div className="flex flex-col h-full">
      
      <h2 className="text-lg font-bold mb-4 text-gray-300 border-b border-gray-600 pb-2">
        Passo a Passo & Tempo
      </h2>
      
      {/* Container com scroll para a lista de eventos */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        
        {/* Se a algoritmo ainda não respondeu, mostra mensagem de espera */}
        {!dadosIa ? (
          <div className="bg-gray-800 p-3 rounded text-sm text-gray-400 italic text-center border border-gray-700">
            Aguardando backend executar o A*...
          </div>
        ) : (
          /* Se os dados chegaram, renderiza o log dinâmico */
          <>
            {/* Resumo do Caminho */}
            <div className="bg-gray-700 p-2 rounded text-sm border-l-4 border-blue-500">
              <span className="text-blue-400 font-bold">[Partida]</span> 
              {' '}O A* planejou uma rota de <span className="text-white font-bold">{dadosIa.caminho.length}</span> passos.
            </div>

            {/* Mapeia o array de batalhas que veio do Backend */}
            {dadosIa.batalhas.map((batalha, index) => (
              <div key={index} className="bg-gray-700 p-2 rounded text-sm border-l-4 border-yellow-500 flex flex-col gap-1">
                <div>
                  <span className="text-yellow-400 font-bold">[{batalha.local}]</span>
                </div>
                <div className="text-gray-300">
                  <span className="text-gray-400">Equipe:</span> {batalha.cavaleiros_escolhidos.join(', ')}
                </div>
                <div className="text-gray-300">
                  <span className="text-gray-400">Duração:</span> {batalha.tempo_batalha} min
                </div>
                <div className={`${batalha.venceu ? 'text-green-400' : 'text-red-400'} font-semibold`}>
                  {batalha.venceu ? 'Vitória!' : 'Derrota...'}
                </div>
              </div>
            ))}

            {/* Chegada e Custo Total */}
            <div className="bg-gray-700 p-2 rounded text-sm border-l-4 border-green-500">
              <span className="text-green-400 font-bold">[Fim da Jornada]</span> 
              {' '}Custo total: <span className="text-white font-bold">{dadosIa.tempo_total} minutos</span>.
            </div>
          </>
        )}

      </div>
    </div>
  )
}

export default Caminho