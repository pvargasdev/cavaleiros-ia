import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PADRAO_CAVALEIROS, PADRAO_CASAS } from '../../constantes'

function Home() {
  const navigate = useNavigate()
  const [modo, setModo] = useState('menu')

  const [arquivoMapa, setArquivoMapa] = useState(null)
  
  const [cavaleiros, setCavaleiros] = useState(JSON.parse(JSON.stringify(PADRAO_CAVALEIROS)))
  
  const [dificuldades, setDificuldades] = useState(
    Object.values(PADRAO_CASAS).map(c => c.dificuldade)
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
    const nomesOriginais = Object.values(PADRAO_CASAS).map(c => c.nome)
    
    dificuldades.forEach((dif, i) => {
        casasFormatadas[i+1] = { 
            nome: nomesOriginais[i] || `Casa ${i+1}`, 
            dificuldade: Number(dif) 
        }
    })

    const config = {
        cavaleiros: cavaleiros,
        casas: casasFormatadas
    }

    navigate('/game', {
      state: {
        mapaPersonalizado: !!arquivoMapa,
        arquivoMapa: arquivoMapa,
        configPersonalizada: config
      }
    })
  }

  return (
    <main className="w-full min-h-screen flex items-center justify-center bg-gray-900 px-4 font-mono text-white">
      
      {modo === 'menu' && (
        <div className="flex flex-col items-center gap-6 p-8 border border-white max-w-md w-full">
            <h1 className="text-4xl font-bold mb-4 text-center">CDZ: SIMULAÇÃO</h1>
            
            <button 
                onClick={startDefault} 
                className="w-full py-4 bg-blue-700 hover:bg-blue-600 border border-blue-400 font-bold text-lg transition"
            >
                INICIAR PADRÃO
            </button>
            
            <div className="w-full border-t border-gray-700 my-2"></div>

            <button 
                onClick={() => setModo('custom')} 
                className="w-full py-4 bg-gray-800 hover:bg-gray-700 border border-gray-500 text-gray-300 transition"
            >
                CUSTOMIZAR SIMULAÇÃO...
            </button>
        </div>
      )}

      {modo === 'custom' && (
        <div className="flex flex-col gap-6 p-6 border border-white max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-gray-900">
            <div className="flex justify-between items-center border-b border-gray-600 pb-4 sticky top-0 bg-gray-900 z-10">
                <h2 className="text-2xl font-bold">CONFIGURAÇÃO AVANÇADA</h2>
                <button onClick={() => setModo('menu')} className="text-red-400 hover:text-red-300">[ VOLTAR ]</button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-6">
                    <div className="bg-gray-800 p-4 border border-gray-600">
                        <h3 className="text-blue-400 font-bold mb-2">1. MAPA (Opcional)</h3>
                        <input 
                            type="file" 
                            accept=".csv" 
                            onChange={handleMapaFile} 
                            className="text-sm text-gray-400 w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                        />
                        <p className="text-xs text-gray-500 mt-2">Se vazio, usa o mapa padrão.</p>
                    </div>

                    <div className="bg-gray-800 p-4 border border-gray-600">
                        <h3 className="text-blue-400 font-bold mb-2">2. PODER CÓSMICO</h3>
                        <div className="flex flex-col gap-2">
                            {cavaleiros.map((c, i) => (
                                <div key={c.nome} className="flex justify-between items-center bg-gray-900/50 p-1 px-2 rounded">
                                    <label>{c.nome}</label>
                                    <input 
                                        type="number" 
                                        step="0.1" 
                                        value={c.poderCosmico}
                                        onChange={(e) => updateCavaleiro(i, e.target.value)}
                                        className="bg-black border border-gray-500 text-white w-20 px-2 py-1 text-right focus:border-blue-500 outline-none"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800 p-4 border border-gray-600">
                    <h3 className="text-blue-400 font-bold mb-2">3. DIFICULDADE DAS CASAS</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {dificuldades.map((dif, i) => (
                            <div key={i} className="flex flex-col bg-gray-900/50 p-2 rounded">
                                <label className="text-xs text-gray-400 mb-1">Casa {i+1}</label>
                                <input 
                                    type="number" 
                                    value={dif}
                                    onChange={(e) => updateCasa(i, e.target.value)}
                                    className="bg-black border border-gray-500 text-white px-2 py-1 w-full focus:border-blue-500 outline-none"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <button 
                onClick={startCustom} 
                className="w-full py-4 bg-green-700 hover:bg-green-600 border border-green-500 font-bold text-xl mt-4 transition"
            >
                PROCESSAR SIMULAÇÃO {">>"}
            </button>
        </div>
      )}

    </main>
  )
}

export default Home