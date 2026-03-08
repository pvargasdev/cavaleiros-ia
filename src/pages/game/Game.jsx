import React, { useEffect, useState, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Mapa from '../../components/mapa/Mapa'
import Caminho from '../../components/caminho/Caminho'
import Status from '../../components/status/Status'
import mapaPadraoTxt from '../../assets/Mapa.csv?raw' 
import { TERRENOS, PADRAO_CAVALEIROS } from '../../constantes' 

function Game() {
  const location = useLocation()
  const navigate = useNavigate()

  const [csvMapaData, setCsvMapaData] = useState(null)
  const [resultadoIA, setResultadoIA] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [passoAtual, setPassoAtual] = useState(0)
  const [pausado, setPausado] = useState(false)
  const velocidadeAnimacao = 150 

  const { arquivoMapa, mapaPersonalizado, configPersonalizada } = location.state || {}
  const cavaleirosEmJogo = configPersonalizada?.cavaleiros || PADRAO_CAVALEIROS || []

  useEffect(() => {
    if (!location.state) { navigate('/'); return }
    const lerArquivoUpload = (f) => new Promise(r => { const rd = new FileReader(); rd.onload = e => r(e.target.result); rd.readAsText(f); })
    const processarJogo = async () => {
      try {
        setCarregando(true)
        let csv = (mapaPersonalizado && arquivoMapa) ? await lerArquivoUpload(arquivoMapa) : (mapaPadraoTxt || "")
        if (!csv || csv.length < 10) throw new Error("Mapa inválido.")
        setCsvMapaData(csv)
        if (window.electronAPI) {
            const dados = await window.electronAPI.calcularJogo(csv, configPersonalizada)
            setResultadoIA(dados)
        }
      } catch (e) { setErro(e.message) } finally { setCarregando(false) }
    }
    processarJogo()
  }, [location.state, navigate, arquivoMapa, mapaPersonalizado, configPersonalizada])

  useEffect(() => {
    let intervalo = null
    const terminou = resultadoIA?.caminho && passoAtual >= resultadoIA.caminho.length - 1
    if (!carregando && !erro && !pausado && !terminou) {
      intervalo = setInterval(() => setPassoAtual(p => p + 1), velocidadeAnimacao)
    }
    return () => clearInterval(intervalo)
  }, [resultadoIA, passoAtual, pausado, carregando, erro])

  const dadosCalculados = useMemo(() => {
    if (!resultadoIA || !csvMapaData) return { batalhasAteAgora: [], custoTotalReal: 0 }
    const linhas = csvMapaData.trim().split('\n').map(l => l.split(/[;,]/).map(c => c.trim()))
    let custoMovimento = 0
    if (resultadoIA.caminho) {
        for (let i = 0; i <= passoAtual; i++) {
            const [l, c] = resultadoIA.caminho[i]
            if (linhas[l] && linhas[l][c]) {
                const val = parseInt(linhas[l][c])
                if (val === TERRENOS.MONTANHOSO.id) custoMovimento += TERRENOS.MONTANHOSO.custo
                else if (val === TERRENOS.ROCHOSO.id) custoMovimento += TERRENOS.ROCHOSO.custo
                else if (val === TERRENOS.PLANO.id || val === TERRENOS.INICIO.id || val === TERRENOS.FIM.id) custoMovimento += TERRENOS.PLANO.custo
                else if (val >= 1 && val <= 12) custoMovimento += TERRENOS.CUSTO_MOVIMENTO_CASA
                else custoMovimento += 1
            }
        }
    }
    const coordCasas = {} 
    linhas.forEach((row, r) => { row.forEach((col, c) => { const val = parseInt(col); if (val >= 1 && val <= 12) coordCasas[val] = [r, c] }) })
    const batalhasAteAgora = []
    let custoBatalhas = 0
    if (resultadoIA.batalhas) {
       resultadoIA.batalhas.forEach((batalha, index) => {
          const numeroCasa = index + 1
          const coord = coordCasas[numeroCasa]
          if (coord && resultadoIA.caminho) {
            const passoDaBatalha = resultadoIA.caminho.findIndex(p => p[0] === coord[0] && p[1] === coord[1])
            if (passoDaBatalha !== -1 && passoAtual >= passoDaBatalha) {
              batalhasAteAgora.push(batalha)
              custoBatalhas += batalha.tempo_batalha
            }
          }
       })
    }
    return { batalhasAteAgora, custoTotalReal: custoMovimento + custoBatalhas }
  }, [resultadoIA, csvMapaData, passoAtual])

  const handleReiniciar = () => { setPassoAtual(0); setPausado(false) }
  const handlePausar = () => setPausado(!pausado)
  const handleFim = () => { if (resultadoIA?.caminho) setPassoAtual(resultadoIA.caminho.length - 1) }
  const handleVoltarMenu = () => navigate('/')

  const dadosVisualizacao = useMemo(() => {
    if (!resultadoIA?.caminho) return { agente: null, rastro: [] }
    return { agente: resultadoIA.caminho[passoAtual], rastro: resultadoIA.caminho.slice(0, passoAtual + 1) }
  }, [resultadoIA, passoAtual])

  if (carregando) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center font-mono text-xl">PROCESSANDO...</div>

  return (
    <div className="w-full h-screen bg-gray-900 text-white flex flex-col p-4 gap-4 overflow-hidden font-mono">
      <div className="flex items-center justify-between bg-gray-800 p-2 border border-white">
        <button onClick={handleVoltarMenu} className="px-4 py-1 bg-red-900/30 border border-red-500 text-red-200 text-sm"> &lt;&lt; MENU </button>
        <div className="flex gap-4">
            <button onClick={handleReiniciar} className="px-3 py-1 bg-gray-700 border border-gray-500 text-sm">↺ REINICIAR</button>
            <button onClick={handlePausar} className="px-6 py-1 bg-blue-900 border border-blue-500 font-bold min-w-[130px]">{pausado ? "▶ CONTINUAR" : "⏸ PAUSAR"}</button>
            <button onClick={handleFim} className="px-3 py-1 bg-gray-700 border border-gray-500 text-sm">AVANÇAR ⏭</button>
        </div>
        <span className="text-xs text-gray-400 px-4">PASSO: {passoAtual} / {resultadoIA?.caminho?.length || 0}</span>
      </div>
      <div className="flex flex-col lg:flex-row flex-1 gap-4 min-h-0 overflow-hidden">
        <div className="flex-[3] bg-gray-800 border border-gray-600 p-2 flex items-center justify-center overflow-hidden relative">
           <Mapa csvPersonalizado={csvMapaData} posicaoAgente={dadosVisualizacao.agente} rastro={dadosVisualizacao.rastro} />
        </div>
        <div className="flex-[1] bg-gray-800 border border-gray-600 p-2 overflow-y-auto">
          <Caminho dadosIa={resultadoIA} batalhasRealizadas={dadosCalculados.batalhasAteAgora} passoAtual={passoAtual} />
        </div>
      </div>
      <div className="flex h-56 gap-4 shrink-0">
        <div className="flex-[1] bg-gray-800 border border-gray-600 p-2 overflow-y-auto">
            <Status tipo="geral" dadosIa={resultadoIA} passoAtual={passoAtual} custoReal={dadosCalculados.custoTotalReal} />
        </div>
        <div className="flex-[2] bg-gray-800 border border-gray-600 p-2 overflow-y-auto">
          <Status tipo="personagens" dadosIa={resultadoIA} batalhasRealizadas={dadosCalculados.batalhasAteAgora} cavaleiros={cavaleirosEmJogo} />
        </div>
      </div>
    </div>
  )
}

export default Game