import { useState, useEffect } from 'react'
import { useNuvem } from './useNuvem'
import './App.css'

const menuAdmin = ['Visão Geral SaaS', 'Licenças & Testes', 'Barbearias SaaS', 'Vistoria & Auditoria', 'Campeonatos Regionais']
const menuDono = ['Visão Geral', 'Unidades & Equipe', 'Lançamento de Vendas', 'Metas & Premiações', '🏆 Rankings & Competições']
const menuBarbeiro = ['Meu Desempenho', 'Minhas Metas', '🏆 Ranking da Minha Unidade']

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [perfilAtivo, setPerfilAtivo] = useState('dono')

  const [usuario, setUsuario] = useState({ login: '', senha: '' })
  const [erroLogin, setErroLogin] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [abaAtiva, setAbaAtiva] = useState(1)

  const [unidadeFiltroRanking, setUnidadeFiltroRanking] = useState('TODAS')

  // ===== DADOS NA NUVEM (Firebase) =====
  const [barbeariasSaaS, setBarbeariasSaaS, ok1] = useNuvem('barbearias_saas', [
    { id: 1, nome: 'Barbearia Mestre', usuarioDono: 'dono', senhaDono: '123456', plano: 'Teste Grátis', diasRestantes: 7, statusPagamento: 'Pendente', statusSaaS: 'Em Teste' },
    { id: 2, nome: 'Imperial Barber', usuarioDono: 'imperial', senhaDono: '123456', plano: 'Anual Pro', diasRestantes: 330, statusPagamento: 'Pago', statusSaaS: 'Ativo' }
  ])

  const [campeonatosRegionais, setCampeonatosRegionais, ok2] = useNuvem('campeonatos_regionais', [
    { id: 1, titulo: 'Batalha de Barbeiros - Regional SP', status: 'Em Andamento', premio: 'Troféu Ouro + Viagem', ativo: true }
  ])

  const [unidades, setUnidades, ok3] = useNuvem('unidades', [
    { id: 1, nome: 'Unidade Centro', status: 'Ativa', gerente: 'Carlos' },
    { id: 2, nome: 'Unidade Shopping', status: 'Ativa', gerente: 'Mariana' }
  ])

  const [barbeiros, setBarbeiros, ok4] = useNuvem('barbeiros', [
    { id: 1, nome: 'Carlos Silva', telefone: '11988881111', senha: '123', unidade: 'Unidade Centro', faturamento: 1850000 },
    { id: 2, nome: 'Marcos Souza', telefone: '11977772222', senha: '123', unidade: 'Unidade Centro', faturamento: 1420000 },
    { id: 3, nome: 'Mariana Santos', telefone: '11966663333', senha: '123', unidade: 'Unidade Shopping', faturamento: 2100000 }
  ])

  const [metasColetivas, setMetasColetivas, ok5] = useNuvem('metas_coletivas', {
    bronze: { objetivo: 4000000, premio: 'Churrasco da Equipe' },
    prata: { objetivo: 7000000, premio: 'Churrasco + R$ 300 em Bônus para cada' },
    ouro: { objetivo: 10000000, premio: 'Churrasco + R$ 600 em Bônus + Troféu Ouro' }
  })

  const [metasIndividuaisPorBarbeiro, setMetasIndividuaisPorBarbeiro, ok6] = useNuvem('metas_tres_individuais', {
    1: {
      bronze: { tipo: 'valor', meta: 1000000, premio: 'Folga Extra' },
      prata: { tipo: 'valor', meta: 2000000, premio: 'Bônus 10%' },
      ouro: { tipo: 'valor', meta: 3000000, premio: 'Viagem e Troféu' }
    },
    2: {
      bronze: { tipo: 'porcentagem', meta: 10, premio: 'Vale Produto' },
      prata: { tipo: 'porcentagem', meta: 20, premio: 'Bônus Extra' },
      ouro: { tipo: 'porcentagem', meta: 35, premio: 'Premiação Máxima' }
    },
    3: {
      bronze: { tipo: 'valor', meta: 1200000, premio: 'Folga' },
      prata: { tipo: 'valor', meta: 2200000, premio: 'Bônus' },
      ouro: { tipo: 'valor', meta: 3500000, premio: 'Super Prêmio' }
    }
  })

  // ===== ESTADOS LOCAIS (não precisam ir para a nuvem) =====
  const [novaBarbeariaSaaS, setNovaBarbeariaSaaS] = useState({ nome: '', usuarioDono: '', senhaDono: '', plano: 'Teste Grátis (7 Dias)' })
  const [novoCampRegional, setNovoCampRegional] = useState({ titulo: '', premio: '' })
  const [barbeariaLogada, setBarbeariaLogada] = useState(null)

  const [novaUnidade, setNovaUnidade] = useState('')
  const [editandoUnidadeId, setEditandoUnidadeId] = useState(null)
  const [nomeUnidadeEdit, setNomeUnidadeEdit] = useState('')

  const [novoBarbeiro, setNovoBarbeiro] = useState({ nome: '', telefone: '', senha: '', unidade: 'Unidade Centro' })
  const [editandoBarbeiroId, setEditandoBarbeiroId] = useState(null)
  const [barbeiroEdit, setBarbeiroEdit] = useState({ nome: '', unidade: '' })

  const [lancamentoValor, setLancamentoValor] = useState({ unidade: '', barbeiroId: '', valor: '', tipo: 'Corte/Serviço' })

  const [barbeiroSelecionadoConfig, setBarbeiroSelecionadoConfig] = useState('1')
  const [formTresMetasBarbeiro, setFormTresMetasBarbeiro] = useState({
    bronzeTipo: 'valor', bronzeMeta: '1000', bronzePremio: 'Folga Extra',
    prataTipo: 'valor', prataMeta: '2000', prataPremio: 'Bônus 10%',
    ouroTipo: 'valor', ouroMeta: '3000', ouroPremio: 'Viagem'
  })

  const [barbeiroLogado, setBarbeiroLogado] = useState(null)

  // Carrega o formulário de metas do barbeiro selecionado (e de novo quando os dados chegam da nuvem)
  useEffect(() => {
    if (barbeiroSelecionadoConfig && metasIndividuaisPorBarbeiro[barbeiroSelecionadoConfig]) {
      const m = metasIndividuaisPorBarbeiro[barbeiroSelecionadoConfig]
      setFormTresMetasBarbeiro({
        bronzeTipo: m.bronze?.tipo || 'valor',
        bronzeMeta: m.bronze?.tipo === 'valor' ? (m.bronze?.meta / 100).toString() : (m.bronze?.meta || 10).toString(),
        bronzePremio: m.bronze?.premio || '',
        prataTipo: m.prata?.tipo || 'valor',
        prataMeta: m.prata?.tipo === 'valor' ? (m.prata?.meta / 100).toString() : (m.prata?.meta || 20).toString(),
        prataPremio: m.prata?.premio || '',
        ouroTipo: m.ouro?.tipo || 'valor',
        ouroMeta: m.ouro?.tipo === 'valor' ? (m.ouro?.meta / 100).toString() : (m.ouro?.meta || 30).toString(),
        ouroPremio: m.ouro?.premio || ''
      })
    }
  }, [barbeiroSelecionadoConfig, ok6])

  // Login
  const handleLogin = (e) => {
    e.preventDefault()
    setErroLogin('')

    if (perfilAtivo === 'admin') {
      if (usuario.login === 'Adriel2711' && usuario.senha === 'Giovana2711@') {
        setIsLoggedIn(true)
      } else {
        setErroLogin('Credenciais de Super Admin incorretas.')
      }
    } else if (perfilAtivo === 'dono') {
      const barbeariaEncontrada = barbeariasSaaS.find(
        b => b.usuarioDono === usuario.login && b.senhaDono === usuario.senha
      )
      if (barbeariaEncontrada || (usuario.login === 'dono' && usuario.senha === '123456')) {
        setBarbeariaLogada(barbeariaEncontrada || { nome: 'Barbearia Principal' })
        setIsLoggedIn(true)
      } else {
        setErroLogin('Credenciais do Dono incorretas.')
      }
    } else {
      const achado = barbeiros.find(
        b => (b.telefone === usuario.login || b.nome.toLowerCase() === usuario.login.toLowerCase()) && b.senha === usuario.senha
      )
      if (achado) {
        setBarbeiroLogado(achado)
        setIsLoggedIn(true)
      } else {
        setErroLogin('Barbeiro não encontrado. Verifique os dados.')
      }
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setBarbeariaLogada(null)
    setBarbeiroLogado(null)
    setUsuario({ login: '', senha: '' })
    setAbaAtiva(0)
  }

  // Unidades
  const adicionarUnidade = (e) => {
    e.preventDefault()
    if (!novaUnidade.trim()) return
    const novoId = Math.max(0, ...unidades.map(u => u.id)) + 1
    setUnidades([...unidades, { id: novoId, nome: novaUnidade, status: 'Ativa', gerente: 'A definir' }])
    setNovaUnidade('')
  }

  const apagarUnidade = (id, nomeUnidade) => {
    if (window.confirm(`Deseja apagar a unidade "${nomeUnidade}"?`)) {
      setUnidades(unidades.filter(u => u.id !== id))
    }
  }

  const salvarEdicaoUnidade = (id) => {
    if (!nomeUnidadeEdit.trim()) return
    const unidadeAntiga = unidades.find(u => u.id === id)

    setUnidades(unidades.map(u => u.id === id ? { ...u, nome: nomeUnidadeEdit } : u))
    setBarbeiros(barbeiros.map(b =>
      b.unidade === unidadeAntiga.nome ? { ...b, unidade: nomeUnidadeEdit } : b
    ))

    setEditandoUnidadeId(null)
    alert('Unidade atualizada com sucesso!')
  }

  // Barbeiros
  const cadastrarBarbeiro = (e) => {
    e.preventDefault()
    if (!novoBarbeiro.nome.trim() || !novoBarbeiro.telefone.trim()) return
    const novoId = barbeiros.length > 0 ? Math.max(...barbeiros.map(b => b.id)) + 1 : 1
    setBarbeiros([...barbeiros, { id: novoId, ...novoBarbeiro, faturamento: 0 }])

    setMetasIndividuaisPorBarbeiro({
      ...metasIndividuaisPorBarbeiro,
      [novoId]: {
        bronze: { tipo: 'valor', meta: 1000000, premio: 'Folga' },
        prata: { tipo: 'valor', meta: 2000000, premio: 'Bônus' },
        ouro: { tipo: 'valor', meta: 3000000, premio: 'Super Prêmio' }
      }
    })

    setNovoBarbeiro({ nome: '', telefone: '', senha: '', unidade: unidades[0]?.nome || 'Unidade Centro' })
    alert('Barbeiro cadastrado com sucesso!')
  }

  const apagarBarbeiro = (id, nomeBarbeiro) => {
    if (window.confirm(`Deseja remover o barbeiro ${nomeBarbeiro}?`)) {
      setBarbeiros(barbeiros.filter(b => b.id !== id))
    }
  }

  const iniciarEdicaoBarbeiro = (b) => {
    setEditandoBarbeiroId(b.id)
    setBarbeiroEdit({ nome: b.nome, unidade: b.unidade })
  }

  const salvarEdicaoBarbeiro = (id) => {
    if (!barbeiroEdit.nome.trim()) return
    setBarbeiros(barbeiros.map(b =>
      b.id === id ? { ...b, nome: barbeiroEdit.nome, unidade: barbeiroEdit.unidade } : b
    ))
    setEditandoBarbeiroId(null)
    alert('Barbeiro atualizado com sucesso!')
  }

  const registrarFaturamentoBarbeiro = (e) => {
    e.preventDefault()
    if (!lancamentoValor.barbeiroId || !lancamentoValor.valor) return

    const valorCentavos = Math.round(parseFloat(lancamentoValor.valor) * 100)
    setBarbeiros(barbeiros.map(b => {
      if (b.id === Number(lancamentoValor.barbeiroId)) {
        return { ...b, faturamento: b.faturamento + valorCentavos }
      }
      return b
    }))

    setLancamentoValor({ unidade: lancamentoValor.unidade, barbeiroId: '', valor: '', tipo: 'Corte/Serviço' })
    alert('Lançamento realizado com sucesso!')
  }

  const salvarMetasColetivasForm = (e) => {
    e.preventDefault()
    alert('As 3 Metas Coletivas foram atualizadas com sucesso!')
  }

  const salvarTresMetasBarbeiroForm = (e) => {
    e.preventDefault()
    if (!barbeiroSelecionadoConfig) return

    const bMeta = formTresMetasBarbeiro.bronzeTipo === 'valor' ? Math.round(parseFloat(formTresMetasBarbeiro.bronzeMeta) * 100) : parseFloat(formTresMetasBarbeiro.bronzeMeta)
    const pMeta = formTresMetasBarbeiro.prataTipo === 'valor' ? Math.round(parseFloat(formTresMetasBarbeiro.prataMeta) * 100) : parseFloat(formTresMetasBarbeiro.prataMeta)
    const oMeta = formTresMetasBarbeiro.ouroTipo === 'valor' ? Math.round(parseFloat(formTresMetasBarbeiro.ouroMeta) * 100) : parseFloat(formTresMetasBarbeiro.ouroMeta)

    setMetasIndividuaisPorBarbeiro({
      ...metasIndividuaisPorBarbeiro,
      [barbeiroSelecionadoConfig]: {
        bronze: { tipo: formTresMetasBarbeiro.bronzeTipo, meta: bMeta, premio: formTresMetasBarbeiro.bronzePremio },
        prata: { tipo: formTresMetasBarbeiro.prataTipo, meta: pMeta, premio: formTresMetasBarbeiro.prataPremio },
        ouro: { tipo: formTresMetasBarbeiro.ouroTipo, meta: oMeta, premio: formTresMetasBarbeiro.ouroPremio }
      }
    })

    alert('As 3 metas individuais deste barbeiro foram salvas com sucesso!')
  }

  const criarCampeonatoRegional = (e) => {
    e.preventDefault()
    if (!novoCampRegional.titulo.trim()) return
    const novoId = Math.max(0, ...campeonatosRegionais.map(c => c.id)) + 1
    setCampeonatosRegionais([...campeonatosRegionais, {
      id: novoId,
      titulo: novoCampRegional.titulo,
      status: 'Em Andamento',
      premio: novoCampRegional.premio || 'Troféu',
      ativo: true
    }])
    setNovoCampRegional({ titulo: '', premio: '' })
  }

  const apagarCampeonato = (id) => {
    setCampeonatosRegionais(campeonatosRegionais.filter(c => c.id !== id))
  }

  const cadastrarBarbeariaSaaS = (e) => {
    e.preventDefault()
    if (!novaBarbeariaSaaS.nome.trim() || !novaBarbeariaSaaS.usuarioDono.trim()) return
    const novoId = Math.max(0, ...barbeariasSaaS.map(b => b.id)) + 1
    setBarbeariasSaaS([...barbeariasSaaS, {
      id: novoId,
      ...novaBarbeariaSaaS,
      diasRestantes: 7,
      statusPagamento: 'Pendente',
      statusSaaS: 'Em Teste'
    }])
    setNovaBarbeariaSaaS({ nome: '', usuarioDono: '', senhaDono: '', plano: 'Teste Grátis (7 Dias)' })
  }

  const apagarBarbearia = (id) => {
    setBarbeariasSaaS(barbeariasSaaS.filter(b => b.id !== id))
  }

  const alterarLicencaRapida = (id, dias, novoPlano, statusPag) => {
    setBarbeariasSaaS(barbeariasSaaS.map(b => b.id === id ? { ...b, diasRestantes: dias, plano: novoPlano, statusPagamento: statusPag, statusSaaS: 'Ativo' } : b))
  }

  // TELA DE CARREGAMENTO (espera os dados chegarem da nuvem)
  if (!(ok1 && ok2 && ok3 && ok4 && ok5 && ok6)) {
    return (
      <div className="login-wrapper">
        <div className="login-card">
          <div className="login-header">
            <h2>AS GESTÃO</h2>
            <p>Carregando dados...</p>
          </div>
        </div>
      </div>
    )
  }

  // TELA DE LOGIN
  if (!isLoggedIn) {
    return (
      <div className="login-wrapper">
        <div className="login-card cyberpunk-glow">
          <div className="login-header">
            <h2>AS GESTÃO</h2>
            <p>Plataforma SaaS & Campeonatos</p>
          </div>

          <div className="perfil-selector">
            <button type="button" className={`perfil-btn ${perfilAtivo === 'admin' ? 'active' : ''}`} onClick={() => { setPerfilAtivo('admin'); setErroLogin(''); setUsuario({ login: '', senha: '' }); }}>Super Admin</button>
            <button type="button" className={`perfil-btn ${perfilAtivo === 'dono' ? 'active' : ''}`} onClick={() => { setPerfilAtivo('dono'); setErroLogin(''); setUsuario({ login: '', senha: '' }); }}>Dono Barbearia</button>
            <button type="button" className={`perfil-btn ${perfilAtivo === 'barbeiro' ? 'active' : ''}`} onClick={() => { setPerfilAtivo('barbeiro'); setErroLogin(''); setUsuario({ login: '', senha: '' }); }}>Barbeiro</button>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label>{perfilAtivo === 'admin' ? 'Identificador Super Admin (Adriel2711)' : perfilAtivo === 'dono' ? 'Utilizador do Dono' : 'Telefone do Barbeiro'}</label>
              <input type="text" placeholder={perfilAtivo === 'admin' ? 'Adriel2711' : ''} value={usuario.login} onChange={(e) => setUsuario({ ...usuario, login: e.target.value })} required />
            </div>

            <div className="form-group">
              <label>Palavra-passe de Acesso</label>
              <div className="password-input-container">
                <input type={mostrarSenha ? "text" : "password"} value={usuario.senha} onChange={(e) => setUsuario({ ...usuario, senha: e.target.value })} required />
                <button type="button" className="toggle-password-btn" onClick={() => setMostrarSenha(!mostrarSenha)}>{mostrarSenha ? "👁️" : "🔒"}</button>
              </div>
            </div>

            {erroLogin && <span className="login-error">{erroLogin}</span>}
            <button type="submit" className="login-btn">Acessar Sistema</button>
          </form>
        </div>
      </div>
    )
  }

  // PAINEL SUPER ADMIN
  const renderConteudoAdmin = () => {
    switch (abaAtiva) {
      case 0:
        return (
          <section className="kpi-grid">
            <div className="card kpi-card"><h3>Contas Registradas</h3><p className="kpi-value">{barbeariasSaaS.length}</p></div>
            <div className="card kpi-card"><h3>Contas Pagas</h3><p className="kpi-value">{barbeariasSaaS.filter(b => b.statusPagamento === 'Pago').length}</p></div>
            <div className="card kpi-card"><h3>Campeonatos Ativos</h3><p className="kpi-value">{campeonatosRegionais.length}</p></div>
          </section>
        )
      case 1:
        return (
          <div className="grid-duplo" style={{ gridTemplateColumns: '1.6fr 1fr' }}>
            <section className="card big-card">
              <h2>Gestão de Licenças & Acessos</h2>
              <table className="custom-table">
                <thead><tr><th>Barbearia</th><th>Pagamento</th><th>Validade</th><th>Ações</th></tr></thead>
                <tbody>
                  {barbeariasSaaS.map(b => (
                    <tr key={b.id}>
                      <td><strong>{b.nome}</strong><br /><small style={{ color: '#9ca3af' }}>User: {b.usuarioDono}</small></td>
                      <td><span className={`badge ${b.statusPagamento === 'Pago' ? 'badge-success' : 'badge-danger'}`}>{b.statusPagamento}</span></td>
                      <td>{b.diasRestantes >= 9000 ? <span className="badge-vitalicio">✨ Vitalício</span> : <span>{b.diasRestantes} dias</span>}</td>
                      <td>
                        <div className="action-buttons-grid">
                          <button onClick={() => alterarLicencaRapida(b.id, 30, 'Mensal', 'Pago')} className="btn-sm btn-green">+30d</button>
                          <button onClick={() => alterarLicencaRapida(b.id, 365, 'Anual Pro', 'Pago')} className="btn-sm btn-gold">+1 Ano</button>
                          <button onClick={() => apagarBarbearia(b.id)} className="btn-sm btn-red">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
            <section className="card big-card">
              <h2>Cadastrar Nova Barbearia</h2>
              <form onSubmit={cadastrarBarbeariaSaaS} className="login-form">
                <div className="form-group"><label>Nome</label><input type="text" value={novaBarbeariaSaaS.nome} onChange={(e) => setNovaBarbeariaSaaS({ ...novaBarbeariaSaaS, nome: e.target.value })} required /></div>
                <div className="form-group"><label>Utilizador</label><input type="text" value={novaBarbeariaSaaS.usuarioDono} onChange={(e) => setNovaBarbeariaSaaS({ ...novaBarbeariaSaaS, usuarioDono: e.target.value })} required /></div>
                <div className="form-group"><label>Senha</label><input type="password" value={novaBarbeariaSaaS.senhaDono} onChange={(e) => setNovaBarbeariaSaaS({ ...novaBarbeariaSaaS, senhaDono: e.target.value })} required /></div>
                <button type="submit" className="login-btn">Cadastrar SaaS</button>
              </form>
            </section>
          </div>
        )
      case 2:
        return (
          <section className="card big-card">
            <h2>Gerenciamento Global de Tenants</h2>
            <table className="custom-table" style={{ marginTop: '16px' }}>
              <thead><tr><th>ID</th><th>Barbearia</th><th>Utilizador</th><th>Status</th></tr></thead>
              <tbody>
                {barbeariasSaaS.map(b => (
                  <tr key={b.id}><td>#{b.id}</td><td><strong>{b.nome}</strong></td><td><code>{b.usuarioDono}</code></td><td><span className="badge-success">{b.statusSaaS}</span></td></tr>
                ))}
              </tbody>
            </table>
          </section>
        )
      case 3:
        return (
          <section className="card big-card">
            <h2>🔎 Vistoria & Auditoria SaaS</h2>
            <div className="audit-log-box" style={{ marginTop: '20px', background: '#080808', padding: '16px', borderRadius: '8px', border: '1px solid #222', fontFamily: 'JetBrains Mono' }}>
              <p style={{ color: '#22c55e' }}>[VISTORIA] - Isolamento de bancos de dados validado.</p>
            </div>
          </section>
        )
      case 4:
        return (
          <div className="grid-duplo">
            <section className="card big-card">
              <h2>🏆 Campeonatos Regionais</h2>
              <table className="custom-table" style={{ marginTop: '16px' }}>
                <thead><tr><th>Competição</th><th>Status</th><th>Ativo Regional</th><th>Ações</th></tr></thead>
                <tbody>
                  {campeonatosRegionais.map(c => (
                    <tr key={c.id}>
                      <td><strong>{c.titulo}</strong></td>
                      <td><span className="badge-success">{c.status}</span></td>
                      <td>{c.ativo ? <span style={{ color: '#34d399' }}>Sim</span> : <span style={{ color: '#f87171' }}>Não</span>}</td>
                      <td><button onClick={() => apagarCampeonato(c.id)} className="btn-sm btn-red">Apagar</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
            <section className="card big-card">
              <h2>Criar Campeonato Regional</h2>
              <form onSubmit={criarCampeonatoRegional} className="login-form">
                <div className="form-group"><label>Título</label><input type="text" value={novoCampRegional.titulo} onChange={(e) => setNovoCampRegional({ ...novoCampRegional, titulo: e.target.value })} required /></div>
                <div className="form-group"><label>Prêmio</label><input type="text" value={novoCampRegional.premio} onChange={(e) => setNovoCampRegional({ ...novoCampRegional, premio: e.target.value })} /></div>
                <button type="submit" className="login-btn">Lançar Competição</button>
              </form>
            </section>
          </div>
        )
      default:
        return null
    }
  }

  // PAINEL DO DONO DA BARBEARIA
  const renderConteudoDono = () => {
    const faturamentoTotalRede = barbeiros.reduce((acc, b) => acc + b.faturamento, 0)
    const barbeirosFiltradosDono = unidadeFiltroRanking === 'TODAS' ? barbeiros : barbeiros.filter(b => b.unidade === unidadeFiltroRanking)

    const campeonatoAtivoAdmin = campeonatosRegionais.some(c => c.ativo)
    const mostrarRankingRegional = barbeariasSaaS.length > 1 && campeonatoAtivoAdmin

    const temVariasUnidades = unidades.length > 1
    const barbeirosLancamento = temVariasUnidades
      ? (lancamentoValor.unidade ? barbeiros.filter(b => b.unidade === lancamentoValor.unidade) : [])
      : barbeiros
    const barbeirosTabelaFaturamento = temVariasUnidades && lancamentoValor.unidade
      ? barbeiros.filter(b => b.unidade === lancamentoValor.unidade)
      : barbeiros

    switch (abaAtiva) {
      case 0:
        return (
          <section className="kpi-grid">
            <div className="card kpi-card"><h3>Faturamento Total da Rede</h3><p className="kpi-value">R$ {(faturamentoTotalRede / 100).toFixed(2)}</p></div>
            <div className="card kpi-card"><h3>Unidades Operacionais</h3><p className="kpi-value">{unidades.length}</p></div>
            <div className="card kpi-card"><h3>Total de Barbeiros</h3><p className="kpi-value">{barbeiros.length}</p></div>
          </section>
        )
      case 1:
        return (
          <div className="grid-duplo">
            <section className="card big-card">
              <h2>Gerenciar & Editar Unidades</h2>
              <form onSubmit={adicionarUnidade} className="login-form" style={{ marginBottom: '20px' }}>
                <div className="form-group">
                  <label>Nova Unidade</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="text" placeholder="Ex: Unidade Norte" value={novaUnidade} onChange={(e) => setNovaUnidade(e.target.value)} required />
                    <button type="submit" className="login-btn" style={{ margin: 0, padding: '0 16px' }}>Adicionar</button>
                  </div>
                </div>
              </form>

              <table className="custom-table">
                <thead><tr><th>Nome da Unidade</th><th>Ações</th></tr></thead>
                <tbody>
                  {unidades.map(u => (
                    <tr key={u.id}>
                      <td>
                        {editandoUnidadeId === u.id ? (
                          <input type="text" value={nomeUnidadeEdit} onChange={(e) => setNomeUnidadeEdit(e.target.value)} className="input-inline" />
                        ) : <strong>{u.nome}</strong>}
                      </td>
                      <td>
                        {editandoUnidadeId === u.id ? (
                          <div className="action-buttons-grid">
                            <button onClick={() => salvarEdicaoUnidade(u.id)} className="btn-sm btn-green">Salvar</button>
                            <button onClick={() => setEditandoUnidadeId(null)} className="btn-sm btn-red">Cancelar</button>
                          </div>
                        ) : (
                          <div className="action-buttons-grid">
                            <button onClick={() => { setEditandoUnidadeId(u.id); setNomeUnidadeEdit(u.nome); }} className="btn-sm btn-gold">Editar</button>
                            <button onClick={() => apagarUnidade(u.id, u.nome)} className="btn-sm btn-red">Apagar</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section className="card big-card">
              <h2>Adicionar, Editar ou Excluir Barbeiros</h2>
              <form onSubmit={cadastrarBarbeiro} className="login-form" style={{ marginBottom: '20px' }}>
                <div className="form-group"><label>Nome</label><input type="text" value={novoBarbeiro.nome} onChange={(e) => setNovoBarbeiro({ ...novoBarbeiro, nome: e.target.value })} required /></div>
                <div className="form-group"><label>Telefone (Login)</label><input type="text" value={novoBarbeiro.telefone} onChange={(e) => setNovoBarbeiro({ ...novoBarbeiro, telefone: e.target.value })} required /></div>
                <div className="form-group"><label>Senha</label><input type="password" value={novoBarbeiro.senha} onChange={(e) => setNovoBarbeiro({ ...novoBarbeiro, senha: e.target.value })} required /></div>
                <div className="form-group">
                  <label>Unidade</label>
                  <select value={novoBarbeiro.unidade} onChange={(e) => setNovoBarbeiro({ ...novoBarbeiro, unidade: e.target.value })} className="select-input">
                    {unidades.map(u => <option key={u.id} value={u.nome}>{u.nome}</option>)}
                  </select>
                </div>
                <button type="submit" className="login-btn">Cadastrar Barbeiro</button>
              </form>

              <h3>Equipe Cadastrada</h3>
              <div className="team-grid" style={{ marginTop: '10px' }}>
                {barbeiros.map(b => (
                  <div key={b.id} className="team-card">
                    <div className="avatar">{b.nome.substring(0, 2).toUpperCase()}</div>

                    {editandoBarbeiroId === b.id ? (
                      <>
                        <input
                          type="text"
                          value={barbeiroEdit.nome}
                          onChange={(e) => setBarbeiroEdit({ ...barbeiroEdit, nome: e.target.value })}
                          className="input-inline"
                        />
                        <select
                          value={barbeiroEdit.unidade}
                          onChange={(e) => setBarbeiroEdit({ ...barbeiroEdit, unidade: e.target.value })}
                          className="select-input"
                        >
                          {unidades.map(u => <option key={u.id} value={u.nome}>{u.nome}</option>)}
                        </select>
                        <div className="action-buttons-grid" style={{ marginTop: '4px' }}>
                          <button onClick={() => salvarEdicaoBarbeiro(b.id)} className="btn-sm btn-green">Salvar</button>
                          <button onClick={() => setEditandoBarbeiroId(null)} className="btn-sm btn-red">Cancelar</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <h4>{b.nome}</h4>
                        <span className="badge-success" style={{ fontSize: '0.7rem' }}>{b.unidade}</span>
                        <div className="action-buttons-grid" style={{ marginTop: '4px' }}>
                          <button onClick={() => iniciarEdicaoBarbeiro(b)} className="btn-sm btn-gold">Editar</button>
                          <button onClick={() => apagarBarbeiro(b.id, b.nome)} className="btn-sm btn-red">Excluir</button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        )
      case 2:
        return (
          <div className="grid-duplo">
            <section className="card big-card">
              <h2>💵 Lançamento de Valores (Caixa)</h2>
              <p className="subtitle">Alimenta o faturamento do barbeiro e recalcula o progresso das metas.</p>

              <form onSubmit={registrarFaturamentoBarbeiro} className="login-form">
                {temVariasUnidades && (
                  <div className="form-group">
                    <label>Selecionar Unidade</label>
                    <select value={lancamentoValor.unidade} onChange={(e) => setLancamentoValor({ ...lancamentoValor, unidade: e.target.value, barbeiroId: '' })} className="select-input" required>
                      <option value="">-- Escolher unidade --</option>
                      {unidades.map(u => <option key={u.id} value={u.nome}>{u.nome}</option>)}
                    </select>
                  </div>
                )}
                <div className="form-group">
                  <label>Selecionar Barbeiro Cadastrado</label>
                  <select value={lancamentoValor.barbeiroId} onChange={(e) => setLancamentoValor({ ...lancamentoValor, barbeiroId: e.target.value })} className="select-input" required disabled={temVariasUnidades && !lancamentoValor.unidade}>
                    <option value="">{temVariasUnidades && !lancamentoValor.unidade ? '-- Escolha a unidade primeiro --' : '-- Escolher --'}</option>
                    {barbeirosLancamento.map(b => <option key={b.id} value={b.id}>{b.nome}{temVariasUnidades ? '' : ` (${b.unidade})`}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Valor (R$)</label>
                  <input type="number" step="0.01" placeholder="Ex: 80.00" value={lancamentoValor.valor} onChange={(e) => setLancamentoValor({ ...lancamentoValor, valor: e.target.value })} required />
                </div>
                <button type="submit" className="login-btn">Lançar Valor</button>
              </form>
            </section>

            <section className="card big-card">
              <h2>📊 Faturamento por Barbeiro{temVariasUnidades && lancamentoValor.unidade ? ` — ${lancamentoValor.unidade}` : ''}</h2>
              <table className="custom-table" style={{ marginTop: '10px' }}>
                <thead><tr><th>Barbeiro</th><th>Unidade</th><th>Acumulado</th></tr></thead>
                <tbody>
                  {barbeirosTabelaFaturamento.map(b => (
                    <tr key={b.id}>
                      <td><strong>{b.nome}</strong></td>
                      <td>{b.unidade}</td>
                      <td className="gold-txt">R$ {(b.faturamento / 100).toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={2}><strong>Total{temVariasUnidades && lancamentoValor.unidade ? ' da unidade' : ' da rede'}</strong></td>
                    <td className="gold-txt"><strong>R$ {(barbeirosTabelaFaturamento.reduce((acc, b) => acc + b.faturamento, 0) / 100).toFixed(2)}</strong></td>
                  </tr>
                </tbody>
              </table>
            </section>
          </div>
        )
      case 3:
        return (
          <div className="grid-duplo">
            <section className="card big-card">
              <h2>⚙️ Configurar as 3 Metas Coletivas</h2>
              <p className="subtitle">Valores (R$) e prêmios para toda a equipe unida.</p>

              <form onSubmit={salvarMetasColetivasForm} className="login-form">
                <div style={{ background: '#111', padding: '10px', borderRadius: '6px', marginBottom: '10px', borderLeft: '4px solid #cd7f32' }}>
                  <label style={{ color: '#cd7f32', fontWeight: 'bold' }}>🥉 Meta Coletiva Bronze (R$):</label>
                  <input type="number" value={metasColetivas.bronze.objetivo / 100} onChange={(e) => setMetasColetivas({ ...metasColetivas, bronze: { ...metasColetivas.bronze, objetivo: Number(e.target.value) * 100 } })} required />
                  <label>Prêmio:</label>
                  <input type="text" value={metasColetivas.bronze.premio} onChange={(e) => setMetasColetivas({ ...metasColetivas, bronze: { ...metasColetivas.bronze, premio: e.target.value } })} required />
                </div>

                <div style={{ background: '#111', padding: '10px', borderRadius: '6px', marginBottom: '10px', borderLeft: '4px solid #c0c0c0' }}>
                  <label style={{ color: '#c0c0c0', fontWeight: 'bold' }}>🥈 Meta Coletiva Prata (R$):</label>
                  <input type="number" value={metasColetivas.prata.objetivo / 100} onChange={(e) => setMetasColetivas({ ...metasColetivas, prata: { ...metasColetivas.prata, objetivo: Number(e.target.value) * 100 } })} required />
                  <label>Prêmio:</label>
                  <input type="text" value={metasColetivas.prata.premio} onChange={(e) => setMetasColetivas({ ...metasColetivas, prata: { ...metasColetivas.prata, premio: e.target.value } })} required />
                </div>

                <div style={{ background: '#111', padding: '10px', borderRadius: '6px', marginBottom: '10px', borderLeft: '4px solid #C6A15B' }}>
                  <label style={{ color: '#C6A15B', fontWeight: 'bold' }}>🥇 Meta Coletiva Ouro (R$):</label>
                  <input type="number" value={metasColetivas.ouro.objetivo / 100} onChange={(e) => setMetasColetivas({ ...metasColetivas, ouro: { ...metasColetivas.ouro, objetivo: Number(e.target.value) * 100 } })} required />
                  <label>Prêmio:</label>
                  <input type="text" value={metasColetivas.ouro.premio} onChange={(e) => setMetasColetivas({ ...metasColetivas, ouro: { ...metasColetivas.ouro, premio: e.target.value } })} required />
                </div>

                <button type="submit" className="login-btn">Salvar Metas Coletivas</button>
              </form>
            </section>

            <section className="card big-card">
              <h2>👤 Definir 3 Metas Individuais por Barbeiro</h2>
              <p className="subtitle">Escolha o barbeiro e configure as metas Bronze, Prata e Ouro dele.</p>

              <form onSubmit={salvarTresMetasBarbeiroForm} className="login-form">
                <div className="form-group">
                  <label><strong>Selecione o Barbeiro:</strong></label>
                  <select value={barbeiroSelecionadoConfig} onChange={(e) => setBarbeiroSelecionadoConfig(e.target.value)} className="select-input" required>
                    {barbeiros.map(b => <option key={b.id} value={b.id}>{b.nome} ({b.unidade})</option>)}
                  </select>
                </div>

                <div style={{ background: '#111', padding: '10px', borderRadius: '6px', marginBottom: '10px', borderLeft: '4px solid #cd7f32' }}>
                  <label style={{ color: '#cd7f32', fontWeight: 'bold' }}>🥉 Meta Individual Bronze:</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '8px', marginBottom: '6px' }}>
                    <select value={formTresMetasBarbeiro.bronzeTipo} onChange={(e) => setFormTresMetasBarbeiro({ ...formTresMetasBarbeiro, bronzeTipo: e.target.value })} className="select-input">
                      <option value="valor">Valor (R$)</option>
                      <option value="porcentagem">Porcentagem (%)</option>
                    </select>
                    <input type="number" step="0.01" placeholder="Meta" value={formTresMetasBarbeiro.bronzeMeta} onChange={(e) => setFormTresMetasBarbeiro({ ...formTresMetasBarbeiro, bronzeMeta: e.target.value })} required />
                  </div>
                  <input type="text" placeholder="Prêmio Bronze" value={formTresMetasBarbeiro.bronzePremio} onChange={(e) => setFormTresMetasBarbeiro({ ...formTresMetasBarbeiro, bronzePremio: e.target.value })} required />
                </div>

                <div style={{ background: '#111', padding: '10px', borderRadius: '6px', marginBottom: '10px', borderLeft: '4px solid #c0c0c0' }}>
                  <label style={{ color: '#c0c0c0', fontWeight: 'bold' }}>🥈 Meta Individual Prata:</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '8px', marginBottom: '6px' }}>
                    <select value={formTresMetasBarbeiro.prataTipo} onChange={(e) => setFormTresMetasBarbeiro({ ...formTresMetasBarbeiro, prataTipo: e.target.value })} className="select-input">
                      <option value="valor">Valor (R$)</option>
                      <option value="porcentagem">Porcentagem (%)</option>
                    </select>
                    <input type="number" step="0.01" placeholder="Meta" value={formTresMetasBarbeiro.prataMeta} onChange={(e) => setFormTresMetasBarbeiro({ ...formTresMetasBarbeiro, prataMeta: e.target.value })} required />
                  </div>
                  <input type="text" placeholder="Prêmio Prata" value={formTresMetasBarbeiro.prataPremio} onChange={(e) => setFormTresMetasBarbeiro({ ...formTresMetasBarbeiro, prataPremio: e.target.value })} required />
                </div>

                <div style={{ background: '#111', padding: '10px', borderRadius: '6px', marginBottom: '10px', borderLeft: '4px solid #C6A15B' }}>
                  <label style={{ color: '#C6A15B', fontWeight: 'bold' }}>🥇 Meta Individual Ouro:</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '8px', marginBottom: '6px' }}>
                    <select value={formTresMetasBarbeiro.ouroTipo} onChange={(e) => setFormTresMetasBarbeiro({ ...formTresMetasBarbeiro, ouroTipo: e.target.value })} className="select-input">
                      <option value="valor">Valor (R$)</option>
                      <option value="porcentagem">Porcentagem (%)</option>
                    </select>
                    <input type="number" step="0.01" placeholder="Meta" value={formTresMetasBarbeiro.ouroMeta} onChange={(e) => setFormTresMetasBarbeiro({ ...formTresMetasBarbeiro, ouroMeta: e.target.value })} required />
                  </div>
                  <input type="text" placeholder="Prêmio Ouro" value={formTresMetasBarbeiro.ouroPremio} onChange={(e) => setFormTresMetasBarbeiro({ ...formTresMetasBarbeiro, ouroPremio: e.target.value })} required />
                </div>

                <button type="submit" className="login-btn">Salvar as 3 Metas deste Barbeiro</button>
              </form>
            </section>
          </div>
        )
      case 4:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <section className="card big-card" style={{ border: '2px solid #C6A15B' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2>🏆 RANKING INTERNO DE DESEMPENHO</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', color: '#C6A15B', fontWeight: 'bold' }}>Filtro:</label>
                  <select value={unidadeFiltroRanking} onChange={(e) => setUnidadeFiltroRanking(e.target.value)} className="select-input" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                    <option value="TODAS">🌐 Geral (Rede Unificada)</option>
                    {unidades.map(u => <option key={u.id} value={u.nome}>📍 {u.nome}</option>)}
                  </select>
                </div>
              </div>

              <ul className="ranking-list" style={{ marginTop: '16px' }}>
                {[...barbeirosFiltradosDono].sort((a, b) => b.faturamento - a.faturamento).map((b, index) => {
                  const mBarb = metasIndividuaisPorBarbeiro[b.id] || {}
                  const metaOuroVal = mBarb.ouro?.meta || 3000000
                  const metaBase = mBarb.ouro?.tipo === 'valor' ? metaOuroVal : 3000000
                  const progBarbeiro = Math.min(100, (b.faturamento / (metaBase > 0 ? metaBase : 1)) * 100)
                  return (
                    <li key={b.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '12px', background: index === 0 ? 'rgba(198, 161, 91, 0.1)' : '#0d0d0d', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span><strong>#{index + 1}</strong> {b.nome} <small style={{ color: '#9ca3af' }}>({b.unidade})</small></span>
                        <span className="gold-txt">R$ {(b.faturamento / 100).toFixed(2)} ({progBarbeiro.toFixed(1)}% meta ouro)</span>
                      </div>
                      <div style={{ background: '#222', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${progBarbeiro}%`, background: progBarbeiro >= 100 ? '#34d399' : '#dc2626', height: '100%' }}></div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>

            {mostrarRankingRegional && (
              <section className="card big-card" style={{ border: '2px dashed #7c3aed', background: 'rgba(124, 58, 237, 0.05)' }}>
                <h2>⭐ RANKING REGIONAL ENTRE BARBEARIAS (SaaS)</h2>
                <ul className="ranking-list" style={{ marginTop: '12px' }}>
                  {barbeariasSaaS.map((barb, idx) => (
                    <li key={barb.id}>
                      <span><strong>#{idx + 1}</strong> 💈 {barb.nome}</span>
                      <span className="gold-txt">Status: {barb.statusSaaS}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )
      default:
        return null
    }
  }

  // PAINEL DO BARBEIRO
  const renderConteudoBarbeiro = () => {
    const barbeiroAtual = barbeiros.find(b => b.id === barbeiroLogado?.id) || barbeiroLogado
    const barbeirosDaMinhaUnidade = barbeiros.filter(b => b.unidade === barbeiroAtual?.unidade)
    const mBarbLogado = metasIndividuaisPorBarbeiro[barbeiroAtual?.id] || {
      bronze: { meta: 1000000, premio: 'Folga' },
      prata: { meta: 2000000, premio: 'Bônus' },
      ouro: { meta: 3000000, premio: 'Viagem' }
    }
    const faturamentoAtualBarbeiro = barbeiroAtual?.faturamento || 0

    const progB = Math.min(100, (faturamentoAtualBarbeiro / (mBarbLogado.bronze?.tipo === 'valor' ? mBarbLogado.bronze.meta : 3000000)) * 100)
    const progP = Math.min(100, (faturamentoAtualBarbeiro / (mBarbLogado.prata?.tipo === 'valor' ? mBarbLogado.prata.meta : 3000000)) * 100)
    const progO = Math.min(100, (faturamentoAtualBarbeiro / (mBarbLogado.ouro?.tipo === 'valor' ? mBarbLogado.ouro.meta : 3000000)) * 100)

    switch (abaAtiva) {
      case 0:
        return (
          <section className="card big-card">
            <h2>Meu Desempenho</h2>
            <p className="subtitle">Profissional: <strong>{barbeiroAtual?.nome}</strong> ({barbeiroAtual?.unidade})</p>
            <div className="kpi-grid"><div className="card kpi-card"><h3>Meu Faturamento Acumulado</h3><p className="kpi-value">R$ {(faturamentoAtualBarbeiro / 100).toFixed(2)}</p></div></div>
          </section>
        )
      case 1:
        return (
          <section className="card big-card">
            <h2>Minhas 3 Metas Individuais & Progresso</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
              <div style={{ background: '#0a0a0a', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #cd7f32' }}>
                <p style={{ color: '#cd7f32', fontWeight: 'bold' }}>🥉 Meta Bronze: R$ {(mBarbLogado.bronze?.meta / 100).toFixed(2)}</p>
                <div style={{ background: '#222', height: '10px', borderRadius: '5px', margin: '6px 0', overflow: 'hidden' }}>
                  <div style={{ width: `${progB}%`, background: progB >= 100 ? '#34d399' : '#dc2626', height: '100%' }}></div>
                </div>
                <p style={{ fontSize: '0.8rem' }}>Prêmio: <strong>{mBarbLogado.bronze?.premio}</strong></p>
              </div>

              <div style={{ background: '#0a0a0a', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #c0c0c0' }}>
                <p style={{ color: '#c0c0c0', fontWeight: 'bold' }}>🥈 Meta Prata: R$ {(mBarbLogado.prata?.meta / 100).toFixed(2)}</p>
                <div style={{ background: '#222', height: '10px', borderRadius: '5px', margin: '6px 0', overflow: 'hidden' }}>
                  <div style={{ width: `${progP}%`, background: progP >= 100 ? '#34d399' : '#dc2626', height: '100%' }}></div>
                </div>
                <p style={{ fontSize: '0.8rem' }}>Prêmio: <strong>{mBarbLogado.prata?.premio}</strong></p>
              </div>

              <div style={{ background: '#0a0a0a', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #C6A15B' }}>
                <p style={{ color: '#C6A15B', fontWeight: 'bold' }}>🥇 Meta Ouro: R$ {(mBarbLogado.ouro?.meta / 100).toFixed(2)}</p>
                <div style={{ background: '#222', height: '10px', borderRadius: '5px', margin: '6px 0', overflow: 'hidden' }}>
                  <div style={{ width: `${progO}%`, background: progO >= 100 ? '#34d399' : '#dc2626', height: '100%' }}></div>
                </div>
                <p style={{ fontSize: '0.8rem' }}>Prêmio: <strong>{mBarbLogado.ouro?.premio}</strong></p>
              </div>
            </div>
          </section>
        )
      case 2:
        return (
          <section className="card big-card" style={{ border: '2px solid #C6A15B' }}>
            <h2>🏆 RANKING OFICIAL — {barbeiroAtual?.unidade.toUpperCase()}</h2>
            <ul className="ranking-list" style={{ marginTop: '16px' }}>
              {[...barbeirosDaMinhaUnidade].sort((a, b) => b.faturamento - a.faturamento).map((b, index) => {
                const mX = metasIndividuaisPorBarbeiro[b.id] || {}
                const mOuro = mX.ouro?.meta || 3000000
                const prg = Math.min(100, (b.faturamento / mOuro) * 100)
                return (
                  <li key={b.id} className={b.id === barbeiroAtual?.id ? 'destaque-barbeiro' : ''} style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '10px', background: '#0d0d0d', borderRadius: '6px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span><strong>#{index + 1}</strong> {b.nome}</span>
                      <span>{b.id === barbeiroAtual?.id ? `R$ ${(b.faturamento / 100).toFixed(2)} (${prg.toFixed(1)}% meta ouro)` : '*** Oculto'}</span>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      default:
        return null
    }
  }

  const menuAtual = perfilAtivo === 'admin' ? menuAdmin : perfilAtivo === 'dono' ? menuDono : menuBarbeiro
  const nomeBarbeiroHeader = barbeiros.find(b => b.id === barbeiroLogado?.id)?.nome || barbeiroLogado?.nome || ''

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand"><h2>AS GESTÃO</h2><span>PRO SaaS</span></div>
        <nav className="sidebar-menu">
          {menuAtual.map((item, index) => (
            <button key={item} className={`menu-btn ${abaAtiva === index ? 'active' : ''}`} onClick={() => setAbaAtiva(index)}>{item}</button>
          ))}
        </nav>
        <button onClick={handleLogout} className="logout-btn">Encerrar Sessão</button>
      </aside>

      <main className="main-content">
        <header className="header">
          <h1>{menuAtual[abaAtiva]}</h1>
          <div className="user-profile">
            <span className="avatar">{perfilAtivo === 'admin' ? 'SA' : perfilAtivo === 'dono' ? 'DO' : nomeBarbeiroHeader.substring(0, 2).toUpperCase()}</span>
            <span className="username">{perfilAtivo === 'admin' && 'Adriel2711 (Super Admin)'}{perfilAtivo === 'dono' && (barbeariaLogada ? barbeariaLogada.nome : 'Dono')}{perfilAtivo === 'barbeiro' && nomeBarbeiroHeader}</span>
          </div>
        </header>

        {perfilAtivo === 'admin' && renderConteudoAdmin()}
        {perfilAtivo === 'dono' && renderConteudoDono()}
        {perfilAtivo === 'barbeiro' && renderConteudoBarbeiro()}
      </main>
    </div>
  )
}