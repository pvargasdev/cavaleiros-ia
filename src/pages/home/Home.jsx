import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PADRAO_CAVALEIROS, PADRAO_CASAS } from '../../constantes'

function Home() {
  const navigate = useNavigate()
  const [modo, setModo] = useState('menu')

  const [arquivoMapa, setArquivoMapa] = useState(null)
  const [cavaleiros, setCavaleiros] = useState(JSON.parse(JSON.stringify(PADRAO_CAVALEIROS || [])))
  const [dificuldades, setDificuldades] = useState(
    Object.values(PADRAO_CASAS || {}).map(c => c.dificuldade)
  )

  const handleMapaFile = (e) => setArquivoMapa(e.target.files[0])
  
  const updateCavaleiro = (index, valor) => {
    const novo = [...cavaleiros]
    novo[index].poderCosmico = valor
    setCavaleiros(novo)
  }

  const updateCasa = (index, valor) => {
    const novo = [...dificuldades]
    novo[index] = valor
    setDificuldades(novo)
  }

  const startDefault = () => {
    navigate('/game', { state: { mapaPersonalizado: false } })
  }

  const startCustom = () => {
    const casasFormatadas = {}
    const nomesOriginais = Object.values(PADRAO_CASAS || {}).map(c => c.nome)
    
    dificuldades.forEach((dif, i) => {
        casasFormatadas[i+1] = { 
            nome: nomesOriginais[i] || `Casa ${i+1}`, 
            dificuldade: Number(dif) 
        }
    })

    navigate('/game', {
      state: {
        mapaPersonalizado: !!arquivoMapa,
        arquivoMapa: arquivoMapa,
        configPersonalizada: {
            cavaleiros: cavaleiros,
            casas: casasFormatadas
        }
      }
    })
  }

  return (
    <main className="w-full min-h-screen flex items-center justify-center bg-gray-900 px-4 font-mono text-white">
      {modo === 'menu' && (
        <div className="flex flex-col items-center gap-6 p-8 border border-white max-w-md w-full">
            <h1 className="text-4xl font-bold mb-4 text-center">Trabalho IA</h1>
            <button onClick={startDefault} className="w-full py-4 bg-blue-700 hover:bg-blue-600 border border-blue-400 font-bold text-lg transition">INICIAR PADRÃO</button>
            <div className="w-full border-t border-gray-700 my-2"></div>
            <button onClick={() => setModo('custom')} className="w-full py-4 bg-gray-800 hover:bg-gray-700 border border-gray-500 text-gray-300 transition">CUSTOMIZAR SIMULAÇÃO...</button>
        </div>
      )}

      {modo === 'custom' && (
        <div className="flex flex-col gap-6 p-6 border border-white max-w-4xl w-full bg-gray-900">
            <div className="flex justify-between items-center border-b border-gray-600 pb-4 bg-gray-900">
                <h2 className="text-2xl font-bold">CONFIGURAÇÃO AVANÇADA</h2>
                <button onClick={() => setModo('menu')} className="text-red-400 hover:text-red-300">[ VOLTAR ]</button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 overflow-hidden">
                <div className="flex flex-col gap-6">
                    <div className="bg-gray-800 p-4 border border-gray-600">
                        <h3 className="text-blue-400 font-bold mb-2">1. MAPA (OPCIONAL)</h3>
                        <input type="file" accept=".csv" onChange={handleMapaFile} className="text-sm text-gray-400 w-full" />
                    </div>
                    <div className="bg-gray-800 p-4 border border-gray-600">
                        <h3 className="text-blue-400 font-bold mb-2">2. PODER CÓSMICO</h3>
                        <div className="flex flex-col gap-2">
                            {cavaleiros.map((c, i) => (
                                <div key={c.nome} className="flex justify-between items-center bg-gray-900/50 p-1 px-2 border border-gray-700">
                                    <label className="text-sm">{c.nome}</label>
                                    <input type="number" step="0.1" value={c.poderCosmico} onChange={(e) => updateCavaleiro(i, e.target.value)} className="bg-black border border-gray-500 text-white w-20 px-2 py-1 text-right text-sm" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800 p-4 border border-gray-600 flex flex-col">
                    <h3 className="text-blue-400 font-bold mb-2">3. DIFICULDADE DAS CASAS</h3>
                    <div className="flex-1 max-h-[320px] overflow-y-auto pr-2 flex flex-col gap-2">
                        {dificuldades.map((dif, i) => {
                            const infoCasa = PADRAO_CASAS[i + 1]
                            return (
                                <div key={i} className="flex justify-between items-center bg-gray-900/50 p-1 px-2 border border-gray-700">
                                    <label className="text-xs text-gray-300">
                                        {infoCasa ? `${i + 1}. ${infoCasa.nome.toUpperCase()}` : `CASA ${i + 1}`}
                                    </label>
                                    <input 
                                        type="number" 
                                        value={dif} 
                                        onChange={(e) => updateCasa(i, e.target.value)} 
                                        className="bg-black border border-gray-500 text-white px-2 py-1 w-24 text-right text-sm" 
                                    />
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            <button onClick={startCustom} className="w-full py-4 bg-green-700 hover:bg-green-600 border border-green-500 font-bold text-xl mt-4">PROCESSAR SIMULAÇÃO {" >> "} </button>
        </div>
      )}
    </main>
  )
}

export default Home