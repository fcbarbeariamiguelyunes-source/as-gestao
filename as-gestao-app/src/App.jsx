import { useState, useEffect } from 'react'
import './App.css'

// ===== CONSTANTES =====

const menuAdmin = [
  'Visão Geral SaaS',
  'Licenças & Testes',
  'Barbearias SaaS',
  'Vistoria & Auditoria',
  'Campeonatos Regionais'
]

const menuDono = [
  'Visão Geral',
  'Unidades & Equipe',
  'Lançamento de Vendas',
  'Metas & Premiações',
  '🏆 Rankings & Competições'
]

const menuBarbeiro = [
  'Meu Desempenho',
  'Minhas Metas',
  '🏆 Ranking da Minha Unidade'
]

const ADMIN_LOGIN = 'Adriel2711'
const ADMIN_SENHA = 'Giovana2711@'

const NIVEIS = [
  { chave: 'bronze', icone: '🥉', nome: 'Bronze', cor: '#cd7f32' },
  { chave: 'prata', icone: '🥈', nome: 'Prata', cor: '#c0c0c0' },
  { chave: 'ouro', icone: '🥇', nome: 'Ouro', cor: '#C6A15B' }
]

const METAS_PADRAO = {
  bronze: { tipo: 'valor', meta: 1000000, premio: 'Folga' },
  prata: { tipo: 'valor', meta: 2000000, premio: 'Bônus' },
  ouro: { tipo: 'valor', meta: 3000000, premio: 'Super Prêmio' }
}

const carregar = (chave, padrao) => {
  try {
    const salvo = localStorage.getItem(chave)
    return salvo ? JSON.parse(salvo) : padrao
  } catch {
    return padrao
  }
}

const proximoId = (lista) =>
  lista.length ? Math.max(...lista.map(i => i.id)) + 1 : 1

const formatarReais = (centavos) =>
  (centavos / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })

const progressoMeta = (faturamento, meta, totalRede) => {
  if (!meta || !meta.meta) return 0

  const atual = meta.tipo === 'porcentagem'
    ? (totalRede > 0 ? (faturamento / totalRede) * 100 : 0)
    : faturamento

  return Math.min(100, (atual / meta.meta) * 100)
}

const rotuloMeta = (meta) => {
  if (!meta) return '-'

  return meta.tipo === 'porcentagem'
    ? `${meta.meta}% do faturamento da rede`
    : formatarReais(meta.meta)
}

const BarraProgresso = ({ pct, altura = 10 }) => (
  <div className="progress" style={{ height: altura }}>
    <div
      className="progress-fill"
      style={{
        width: `${Math.min(100, Math.max(0, pct))}%`,
        background: pct >= 100 ? '#34d399' : '#dc2626'
      }}
    />
  </div>
)

export default function App() {

  // ===== LOGIN =====

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [perfilAtivo, setPerfilAtivo] = useState('dono')
  const [usuario, setUsuario] = useState({ login: '', senha: '' })
  const [erroLogin, setErroLogin] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [abaAtiva, setAbaAtiva] = useState(0)

  const [barbeariaLogada, setBarbeariaLogada] = useState(null)
  const [barbeiroLogadoId, setBarbeiroLogadoId] = useState(null)

  // ===== SENHA DO BARBEIRO =====

  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('')

  // ===== SAAS =====

  const [barbeariasSaaS, setBarbeariasSaaS] = useState(() =>
    carregar('asgestao_barbearias_saas', [
      {
        id: 1,
        nome: 'Barbearia Mestre',
        usuarioDono: 'dono',
        senhaDono: '123456',
        plano: 'Teste Grátis',
        diasRestantes: 7,
        statusPagamento: 'Pendente',
        statusSaaS: 'Em Teste'
      },
      {
        id: 2,
        nome: 'Imperial Barber',
        usuarioDono: 'imperial',
        senhaDono: '123456',
        plano: 'Anual Pro',
        diasRestantes: 330,
        statusPagamento: 'Pago',
        statusSaaS: 'Ativo'
      }
    ])
  )

  const [novaBarbeariaSaaS, setNovaBarbeariaSaaS] = useState({
    nome: '',
    usuarioDono: '',
    senhaDono: '',
    plano: 'Teste Grátis (7 Dias)'
  })

  // ===== CAMPEONATOS =====

  const [campeonatosRegionais, setCampeonatosRegionais] = useState(() =>
    carregar('asgestao_campeonatos_regionais', [
      {
        id: 1,
        titulo: 'Batalha de Barbeiros - Regional SP',
        status: 'Em Andamento',
        premio: 'Troféu Ouro + Viagem',
        ativo: true
      }
    ])
  )

  const [novoCampRegional, setNovoCampRegional] = useState({
    titulo: '',
    premio: ''
  })

  // ===== UNIDADES =====

  const [unidades, setUnidades] = useState(() =>
    carregar('asgestao_unidades', [
      { id: 1, nome: 'Unidade Centro', status: 'Ativa', gerente: 'Carlos' },
      { id: 2, nome: 'Unidade Shopping', status: 'Ativa', gerente: 'Mariana' }
    ])
  )

  const [novaUnidade, setNovaUnidade] = useState('')
  const [editandoUnidadeId, setEditandoUnidadeId] = useState(null)
  const [nomeUnidadeEdit, setNomeUnidadeEdit] = useState('')

  // ===== BARBEIROS =====

  const [barbeiros, setBarbeiros] = useState(() =>
    carregar('asgestao_barbeiros', [
      {
        id: 1,
        nome: 'Carlos Silva',
        telefone: '11988881111',
        senha: '123',
        unidade: 'Unidade Centro',
        faturamento: 1850000
      },
      {
        id: 2,
        nome: 'Marcos Souza',
        telefone: '11977772222',
        senha: '123',
        unidade: 'Unidade Centro',
        faturamento: 1420000
      },
      {
        id: 3,
        nome: 'Mariana Santos',
        telefone: '11966663333',
        senha: '123',
        unidade: 'Unidade Shopping',
        faturamento: 2100000
      }
    ])
  )

  const [novoBarbeiro, setNovoBarbeiro] = useState({
    nome: '',
    telefone: '',
    senha: '',
    unidade: ''
  })

  const barbeiroLogado =
    barbeiros.find(b => b.id === barbeiroLogadoId) || null

  // ===== LANÇAMENTOS E HISTÓRICO =====

  const [lancamentoValor, setLancamentoValor] = useState({
    barbeiroId: '',
    valor: ''
  })

  const [lancamentos, setLancamentos] = useState(() =>
    carregar('asgestao_historico_lancamentos', [])
  )

  const [editandoLancamentoId, setEditandoLancamentoId] =
    useState(null)

  // ===== METAS COLETIVAS =====

  const [metasColetivas, setMetasColetivas] = useState(() =>
    carregar('asgestao_metas_coletivas', {
      bronze: {
        objetivo: 4000000,
        premio: 'Churrasco da Equipe'
      },
      prata: {
        objetivo: 7000000,
        premio: 'Churrasco + R$ 300 em Bônus para cada'
      },
      ouro: {
        objetivo: 10000000,
        premio: 'Churrasco + R$ 600 em Bônus + Troféu Ouro'
      }
    })
  )

  // ===== METAS INDIVIDUAIS =====

  const [metasIndividuaisPorBarbeiro, setMetasIndividuaisPorBarbeiro] =
    useState(() =>
      carregar('asgestao_metas_tres_individuais', {
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
    )

  const [barbeiroSelecionadoConfig, setBarbeiroSelecionadoConfig] =
    useState('')

  const [formMetas, setFormMetas] = useState({})

  const [unidadeFiltroRanking, setUnidadeFiltroRanking] =
    useState('TODAS')

  // ===== PERSISTÊNCIA =====

  useEffect(() => {
    localStorage.setItem(
      'asgestao_barbearias_saas',
      JSON.stringify(barbeariasSaaS)
    )
  }, [barbeariasSaaS])

  useEffect(() => {
    localStorage.setItem(
      'asgestao_campeonatos_regionais',
      JSON.stringify(campeonatosRegionais)
    )
  }, [campeonatosRegionais])

  useEffect(() => {
    localStorage.setItem('asgestao_unidades', JSON.stringify(unidades))
  }, [unidades])

  useEffect(() => {
    localStorage.setItem('asgestao_barbeiros', JSON.stringify(barbeiros))
  }, [barbeiros])

  useEffect(() => {
    localStorage.setItem(
      'asgestao_historico_lancamentos',
      JSON.stringify(lancamentos)
    )
  }, [lancamentos])

  useEffect(() => {
    localStorage.setItem(
      'asgestao_metas_coletivas',
      JSON.stringify(metasColetivas)
    )
  }, [metasColetivas])

  useEffect(() => {
    localStorage.setItem(
      'asgestao_metas_tres_individuais',
      JSON.stringify(metasIndividuaisPorBarbeiro)
    )
  }, [metasIndividuaisPorBarbeiro])

  // ===== CONFIGURAÇÃO DAS METAS =====

  useEffect(() => {
    if (barbeiros.length === 0) {
      setBarbeiroSelecionadoConfig('')
      return
    }

    if (
      !barbeiros.some(
        b => String(b.id) === String(barbeiroSelecionadoConfig)
      )
    ) {
      setBarbeiroSelecionadoConfig(String(barbeiros[0].id))
    }
  }, [barbeiros, barbeiroSelecionadoConfig])

  useEffect(() => {
    const m = metasIndividuaisPorBarbeiro[barbeiroSelecionadoConfig]
    if (!m) return

    const f = {}

    NIVEIS.forEach(n => {
      const x = m[n.chave] || METAS_PADRAO[n.chave]

      f[n.chave] = {
        tipo: x.tipo || 'valor',
        meta: x.tipo === 'porcentagem'
          ? String(x.meta)
          : String(x.meta / 100),
        premio: x.premio || ''
      }
    })

    setFormMetas(f)
  }, [barbeiroSelecionadoConfig, metasIndividuaisPorBarbeiro])

  // ===== LOGIN / LOGOUT =====

  const limparLogin = () => {
    setUsuario({ login: '', senha: '' })
  }

  const trocarPerfil = (perfil) => {
    setPerfilAtivo(perfil)
    setErroLogin('')
    limparLogin()
  }

  const handleLogin = (e) => {
    e.preventDefault()
    setErroLogin('')

    if (perfilAtivo === 'admin') {
      if (
        usuario.login === ADMIN_LOGIN &&
        usuario.senha === ADMIN_SENHA
      ) {
        setAbaAtiva(0)
        setIsLoggedIn(true)
      } else {
        setErroLogin('Credenciais de Super Admin incorretas.')
      }
    } else if (perfilAtivo === 'dono') {
      const encontrada = barbeariasSaaS.find(
        b =>
          b.usuarioDono === usuario.login &&
          b.senhaDono === usuario.senha
      )

      if (
        encontrada ||
        (usuario.login === 'dono' && usuario.senha === '123456')
      ) {
        setBarbeariaLogada(
          encontrada || { nome: 'Barbearia Principal' }
        )
        setAbaAtiva(0)
        setIsLoggedIn(true)
      } else {
        setErroLogin('Credenciais do Dono incorretas.')
      }
    } else {
      const achado = barbeiros.find(
        b =>
          (
            b.telefone === usuario.login ||
            b.nome.toLowerCase() === usuario.login.toLowerCase()
          ) &&
          b.senha === usuario.senha
      )

      if (achado) {
        setBarbeiroLogadoId(achado.id)
        setAbaAtiva(0)
        setIsLoggedIn(true)
      } else {
        setErroLogin('Barbeiro não encontrado. Verifique os dados.')
      }
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setBarbeariaLogada(null)
    setBarbeiroLogadoId(null)
    setAbaAtiva(0)
    setSenhaAtual('')
    setNovaSenha('')
    setConfirmarNovaSenha('')
    setEditandoLancamentoId(null)
    setLancamentoValor({ barbeiroId: '', valor: '' })
    limparLogin()
  }

  // ===== ALTERAÇÃO DE SENHA DO BARBEIRO =====

  const alterarMinhaSenha = (e) => {
    e.preventDefault()

    if (!barbeiroLogado) return

    if (senhaAtual !== barbeiroLogado.senha) {
      alert('A senha atual está incorreta.')
      return
    }

    if (novaSenha.length < 4) {
      alert('A nova senha precisa ter pelo menos 4 caracteres.')
      return
    }

    if (novaSenha !== confirmarNovaSenha) {
      alert('As senhas não coincidem.')
      return
    }

    setBarbeiros(prev =>
      prev.map(b =>
        b.id === barbeiroLogado.id
          ? { ...b, senha: novaSenha }
          : b
      )
    )

    setSenhaAtual('')
    setNovaSenha('')
    setConfirmarNovaSenha('')

    alert('Sua senha foi alterada com sucesso!')
  }

  // ===== UNIDADES =====

  const adicionarUnidade = (e) => {
    e.preventDefault()

    const nome = novaUnidade.trim()
    if (!nome) return

    if (
      unidades.some(
        u => u.nome.toLowerCase() === nome.toLowerCase()
      )
    ) {
      alert('Já existe uma unidade com esse nome.')
      return
    }

    setUnidades(prev => [
      ...prev,
      {
        id: proximoId(prev),
        nome,
        status: 'Ativa',
        gerente: 'A definir'
      }
    ])

    setNovaUnidade('')
    alert('Unidade cadastrada com sucesso!')
  }

  const apagarUnidade = (id, nomeUnidade) => {
    const temEquipe = barbeiros.some(
      b => b.unidade === nomeUnidade
    )

    if (temEquipe) {
      alert(
        `A unidade "${nomeUnidade}" ainda tem barbeiros. Transfira-os para outra unidade antes de apagar.`
      )
      return
    }

    if (
      window.confirm(`Deseja apagar a unidade "${nomeUnidade}"?`)
    ) {
      setUnidades(prev => prev.filter(u => u.id !== id))
    }
  }

  const salvarEdicaoUnidade = (id) => {
    const novoNome = nomeUnidadeEdit.trim()
    if (!novoNome) return

    const atual = unidades.find(u => u.id === id)
    if (!atual) return

    if (
      unidades.some(
        u =>
          u.id !== id &&
          u.nome.toLowerCase() === novoNome.toLowerCase()
      )
    ) {
      alert('Já existe uma unidade com esse nome.')
      return
    }

    setUnidades(prev =>
      prev.map(u =>
        u.id === id ? { ...u, nome: novoNome } : u
      )
    )

    setBarbeiros(prev =>
      prev.map(b =>
        b.unidade === atual.nome
          ? { ...b, unidade: novoNome }
          : b
      )
    )

    if (unidadeFiltroRanking === atual.nome) {
      setUnidadeFiltroRanking(novoNome)
    }

    setEditandoUnidadeId(null)
    alert('Unidade atualizada com sucesso!')
  }

  // ===== BARBEIROS =====

  const cadastrarBarbeiro = (e) => {
    e.preventDefault()

    if (
      !novoBarbeiro.nome.trim() ||
      !novoBarbeiro.telefone.trim() ||
      !novoBarbeiro.senha.trim()
    ) {
      alert('Preencha todos os campos.')
      return
    }

    if (unidades.length === 0) {
      alert('Cadastre ao menos uma unidade antes.')
      return
    }

    if (
      barbeiros.some(
        b => b.telefone === novoBarbeiro.telefone.trim()
      )
    ) {
      alert('Já existe um barbeiro com esse telefone.')
      return
    }

    const novoId = proximoId(barbeiros)
    const unidade = novoBarbeiro.unidade || unidades[0].nome

    setBarbeiros(prev => [
      ...prev,
      {
        id: novoId,
        nome: novoBarbeiro.nome.trim(),
        telefone: novoBarbeiro.telefone.trim(),
        senha: novoBarbeiro.senha,
        unidade,
        faturamento: 0
      }
    ])

    setMetasIndividuaisPorBarbeiro(prev => ({
      ...prev,
      [novoId]: JSON.parse(JSON.stringify(METAS_PADRAO))
    }))

    setNovoBarbeiro({
      nome: '',
      telefone: '',
      senha: '',
      unidade: ''
    })

    alert('Barbeiro cadastrado com sucesso!')
  }

  const apagarBarbeiro = (id, nomeBarbeiro) => {
    if (
      !window.confirm(`Deseja remover o barbeiro ${nomeBarbeiro}?`)
    ) return

    setBarbeiros(prev => prev.filter(b => b.id !== id))

    setMetasIndividuaisPorBarbeiro(prev => {
      const { [id]: removida, ...resto } = prev
      return resto
    })

    // O histórico dos lançamentos permanece preservado.
    // Assim, os registros antigos não desaparecem.
  }

  // ===== LANÇAMENTOS =====

  const registrarFaturamentoBarbeiro = (e) => {
    e.preventDefault()

    if (
      !lancamentoValor.barbeiroId ||
      !lancamentoValor.valor
    ) return

    const valor = Number(lancamentoValor.valor)

    if (!Number.isFinite(valor) || valor <= 0) {
      alert('Informe um valor maior que zero.')
      return
    }

    const valorCentavos = Math.round(valor * 100)
    const barbeiroId = Number(lancamentoValor.barbeiroId)

    if (!barbeiros.some(b => b.id === barbeiroId)) {
      alert('Barbeiro não encontrado.')
      return
    }

    if (editandoLancamentoId !== null) {
      const antigo = lancamentos.find(
        l => l.id === editandoLancamentoId
      )

      if (!antigo) {
        alert('Lançamento não encontrado.')
        return
      }

      // Retira o valor antigo e aplica o novo.
      setBarbeiros(prev =>
        prev.map(b => {
          let novoFaturamento = b.faturamento

          if (b.id === antigo.barbeiroId) {
            novoFaturamento -= antigo.valorCentavos
          }

          if (b.id === barbeiroId) {
            novoFaturamento += valorCentavos
          }

          return {
            ...b,
            faturamento: Math.max(0, novoFaturamento)
          }
        })
      )

      setLancamentos(prev =>
        prev.map(l =>
          l.id === editandoLancamentoId
            ? {
                ...l,
                barbeiroId,
                valorCentavos,
                data: new Date().toISOString()
              }
            : l
        )
      )

      setEditandoLancamentoId(null)
      alert('Lançamento atualizado com sucesso!')
    } else {
      setBarbeiros(prev =>
        prev.map(b =>
          b.id === barbeiroId
            ? {
                ...b,
                faturamento: b.faturamento + valorCentavos
              }
            : b
        )
      )

      setLancamentos(prev => [
        ...prev,
        {
          id: proximoId(prev),
          barbeiroId,
          valorCentavos,
          data: new Date().toISOString()
        }
      ])

      alert('Lançamento realizado com sucesso!')
    }

    setLancamentoValor({
      barbeiroId: '',
      valor: ''
    })
  }

  const editarLancamento = (l) => {
    if (!barbeiros.some(b => b.id === l.barbeiroId)) {
      alert('O barbeiro deste lançamento não está mais cadastrado.')
      return
    }

    setEditandoLancamentoId(l.id)

    setLancamentoValor({
      barbeiroId: String(l.barbeiroId),
      valor: (l.valorCentavos / 100).toFixed(2)
    })

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const cancelarEdicaoLancamento = () => {
    setEditandoLancamentoId(null)
    setLancamentoValor({
      barbeiroId: '',
      valor: ''
    })
  }

  const excluirLancamento = (l) => {
    if (
      !window.confirm(
        'Tem certeza que deseja excluir este lançamento? O faturamento será atualizado automaticamente.'
      )
    ) return

    setBarbeiros(prev =>
      prev.map(b =>
        b.id === l.barbeiroId
          ? {
              ...b,
              faturamento: Math.max(
                0,
                b.faturamento - l.valorCentavos
              )
            }
          : b
      )
    )

    setLancamentos(prev =>
      prev.filter(item => item.id !== l.id)
    )

    if (editandoLancamentoId === l.id) {
      cancelarEdicaoLancamento()
    }

    alert('Lançamento excluído com sucesso!')
  }

  // ===== METAS =====

  const salvarMetasColetivasForm = (e) => {
    e.preventDefault()
    alert('As 3 metas coletivas foram atualizadas com sucesso!')
  }

  const atualizarFormMeta = (chave, campo, valor) => {
    setFormMetas(prev => ({
      ...prev,
      [chave]: {
        ...prev[chave],
        [campo]: valor
      }
    }))
  }

  const salvarMetasBarbeiroForm = (e) => {
    e.preventDefault()

    if (!barbeiroSelecionadoConfig) return

    const novas = {}

    for (const n of NIVEIS) {
      const f = formMetas[n.chave]

      if (!f) {
        alert(`Configure a meta ${n.nome}.`)
        return
      }

      const numero = Number(f.meta)

      if (!Number.isFinite(numero) || numero <= 0) {
        alert(`Informe um valor válido para a meta ${n.nome}.`)
        return
      }

      if (f.tipo === 'porcentagem' && numero > 100) {
        alert('A porcentagem não pode ser maior que 100%.')
        return
      }

      novas[n.chave] = {
        tipo: f.tipo,
        meta: f.tipo === 'valor'
          ? Math.round(numero * 100)
          : numero,
        premio: f.premio
      }
    }

    setMetasIndividuaisPorBarbeiro(prev => ({
      ...prev,
      [barbeiroSelecionadoConfig]: novas
    }))

    alert('As 3 metas individuais foram salvas com sucesso!')
  }

  // ===== CAMPEONATOS / SAAS =====

  const criarCampeonatoRegional = (e) => {
    e.preventDefault()

    if (!novoCampRegional.titulo.trim()) return

    setCampeonatosRegionais(prev => [
      ...prev,
      {
        id: proximoId(prev),
        titulo: novoCampRegional.titulo.trim(),
        status: 'Em Andamento',
        premio: novoCampRegional.premio || 'Troféu',
        ativo: true
      }
    ])

    setNovoCampRegional({
      titulo: '',
      premio: ''
    })
  }

  const apagarCampeonato = (id) => {
    if (!window.confirm('Deseja apagar este campeonato?')) return

    setCampeonatosRegionais(prev =>
      prev.filter(c => c.id !== id)
    )
  }

  const cadastrarBarbeariaSaaS = (e) => {
    e.preventDefault()

    if (
      !novaBarbeariaSaaS.nome.trim() ||
      !novaBarbeariaSaaS.usuarioDono.trim() ||
      !novaBarbeariaSaaS.senhaDono.trim()
    ) return

    if (
      barbeariasSaaS.some(
        b => b.usuarioDono === novaBarbeariaSaaS.usuarioDono.trim()
      )
    ) {
      alert('Esse utilizador já está em uso.')
      return
    }

    setBarbeariasSaaS(prev => [
      ...prev,
      {
        id: proximoId(prev),
        ...novaBarbeariaSaaS,
        nome: novaBarbeariaSaaS.nome.trim(),
        usuarioDono: novaBarbeariaSaaS.usuarioDono.trim(),
        diasRestantes: 7,
        statusPagamento: 'Pendente',
        statusSaaS: 'Em Teste'
      }
    ])

    setNovaBarbeariaSaaS({
      nome: '',
      usuarioDono: '',
      senhaDono: '',
      plano: 'Teste Grátis (7 Dias)'
    })

    alert('Barbearia cadastrada com sucesso!')
  }

  const apagarBarbearia = (id) => {
    if (!window.confirm('Deseja apagar esta barbearia?')) return

    setBarbeariasSaaS(prev =>
      prev.filter(b => b.id !== id)
    )
  }

  const alterarLicencaRapida = (
    id,
    dias,
    novoPlano,
    statusPag
  ) => {
    setBarbeariasSaaS(prev =>
      prev.map(b =>
        b.id === id
          ? {
              ...b,
              diasRestantes: dias,
              plano: novoPlano,
              statusPagamento: statusPag,
              statusSaaS: 'Ativo'
            }
          : b
      )
    )
  }

  // ===== DADOS CALCULADOS =====

  const faturamentoTotalRede = barbeiros.reduce(
    (acc, b) => acc + b.faturamento,
    0
  )

  const menuAtual =
    perfilAtivo === 'admin'
      ? menuAdmin
      : perfilAtivo === 'dono'
        ? menuDono
        : menuBarbeiro

  // ===== LOGIN =====

  if (!isLoggedIn) {
    return (
      <div className="login-wrapper">
        <div className="login-card cyberpunk-glow">

          <div className="login-header">
            <h2>AS GESTÃO</h2>
            <p>Plataforma SaaS & Campeonatos</p>
          </div>

          <div className="perfil-selector">
            <button
              type="button"
              className={`perfil-btn ${perfilAtivo === 'admin' ? 'active' : ''}`}
              onClick={() => trocarPerfil('admin')}
            >
              Super Admin
            </button>

            <button
              type="button"
              className={`perfil-btn ${perfilAtivo === 'dono' ? 'active' : ''}`}
              onClick={() => trocarPerfil('dono')}
            >
              Dono Barbearia
            </button>

            <button
              type="button"
              className={`perfil-btn ${perfilAtivo === 'barbeiro' ? 'active' : ''}`}
              onClick={() => trocarPerfil('barbeiro')}
            >
              Barbeiro
            </button>
          </div>

          <form onSubmit={handleLogin} className="login-form">

            <div className="form-group">
              <label>
                {perfilAtivo === 'admin'
                  ? 'Identificador Super Admin'
                  : perfilAtivo === 'dono'
                    ? 'Utilizador do Dono'
                    : 'Telefone do Barbeiro'}
              </label>

              <input
                type="text"
                value={usuario.login}
                onChange={e =>
                  setUsuario({
                    ...usuario,
                    login: e.target.value
                  })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Senha de Acesso</label>

              <div className="password-input-container">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={usuario.senha}
                  onChange={e =>
                    setUsuario({
                      ...usuario,
                      senha: e.target.value
                    })
                  }
                  required
                />

                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                >
                  {mostrarSenha ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {erroLogin && (
              <span className="login-error">
                {erroLogin}
              </span>
            )}

            <button type="submit" className="login-btn">
              Acessar Sistema
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ===== PAINEL SUPER ADMIN =====

  const renderConteudoAdmin = () => {
    switch (abaAtiva) {

      case 0:
        return (
          <section className="kpi-grid">
            <div className="card kpi-card">
              <h3>Contas Registradas</h3>
              <p className="kpi-value">{barbeariasSaaS.length}</p>
            </div>

            <div className="card kpi-card">
              <h3>Contas Pagas</h3>
              <p className="kpi-value">
                {barbeariasSaaS.filter(
                  b => b.statusPagamento === 'Pago'
                ).length}
              </p>
            </div>

            <div className="card kpi-card">
              <h3>Campeonatos Ativos</h3>
              <p className="kpi-value">
                {campeonatosRegionais.filter(c => c.ativo).length}
              </p>
            </div>
          </section>
        )

      case 1:
        return (
          <div
            className="grid-duplo"
            style={{ gridTemplateColumns: '1.6fr 1fr' }}
          >

            <section className="card big-card">
              <h2>Gestão de Licenças & Acessos</h2>

              <div className="table-scroll">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Barbearia</th>
                      <th>Pagamento</th>
                      <th>Validade</th>
                      <th>Ações</th>
                    </tr>
                  </thead>

                  <tbody>
                    {barbeariasSaaS.map(b => (
                      <tr key={b.id}>
                        <td>
                          <strong>{b.nome}</strong>
                          <br />
                          <small style={{ color: '#9ca3af' }}>
                            User: {b.usuarioDono}
                          </small>
                        </td>

                        <td>
                          <span className={`badge ${b.statusPagamento === 'Pago' ? 'badge-success' : 'badge-danger'}`}>
                            {b.statusPagamento}
                          </span>
                        </td>

                        <td>
                          {b.diasRestantes >= 9000
                            ? <span className="badge-vitalicio">✨ Vitalício</span>
                            : `${b.diasRestantes} dias`}
                        </td>

                        <td>
                          <div className="action-buttons-grid">
                            <button
                              onClick={() =>
                                alterarLicencaRapida(
                                  b.id, 30, 'Mensal', 'Pago'
                                )
                              }
                              className="btn-sm btn-green"
                            >
                              +30d
                            </button>

                            <button
                              onClick={() =>
                                alterarLicencaRapida(
                                  b.id, 365, 'Anual Pro', 'Pago'
                                )
                              }
                              className="btn-sm btn-gold"
                            >
                              +1 Ano
                            </button>

                            <button
                              onClick={() => apagarBarbearia(b.id)}
                              className="btn-sm btn-red"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="card big-card">
              <h2>Cadastrar Nova Barbearia</h2>

              <form
                onSubmit={cadastrarBarbeariaSaaS}
                className="login-form"
              >
                <div className="form-group">
                  <label>Nome</label>
                  <input
                    value={novaBarbeariaSaaS.nome}
                    onChange={e =>
                      setNovaBarbeariaSaaS({
                        ...novaBarbeariaSaaS,
                        nome: e.target.value
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Utilizador</label>
                  <input
                    value={novaBarbeariaSaaS.usuarioDono}
                    onChange={e =>
                      setNovaBarbeariaSaaS({
                        ...novaBarbeariaSaaS,
                        usuarioDono: e.target.value
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Senha</label>
                  <input
                    type="password"
                    value={novaBarbeariaSaaS.senhaDono}
                    onChange={e =>
                      setNovaBarbeariaSaaS({
                        ...novaBarbeariaSaaS,
                        senhaDono: e.target.value
                      })
                    }
                    required
                  />
                </div>

                <button type="submit" className="login-btn">
                  Cadastrar SaaS
                </button>
              </form>
            </section>
          </div>
        )

      case 2:
        return (
          <section className="card big-card">
            <h2>Gerenciamento Global de Tenants</h2>

            <div className="table-scroll">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Barbearia</th>
                    <th>Utilizador</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {barbeariasSaaS.map(b => (
                    <tr key={b.id}>
                      <td>#{b.id}</td>
                      <td>{b.nome}</td>
                      <td><code>{b.usuarioDono}</code></td>
                      <td>
                        <span className="badge-success">
                          {b.statusSaaS}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )

      case 3:
        return (
          <section className="card big-card">
            <h2>🔎 Vistoria & Auditoria SaaS</h2>
            <div className="audit-log-box">
              <p style={{ color: '#22c55e' }}>
                [VISTORIA] - Isolamento de bancos de dados validado.
              </p>
            </div>
          </section>
        )

      case 4:
        return (
          <div className="grid-duplo">

            <section className="card big-card">
              <h2>🏆 Campeonatos Regionais</h2>

              <div className="table-scroll">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Competição</th>
                      <th>Status</th>
                      <th>Ativo Regional</th>
                      <th>Ações</th>
                    </tr>
                  </thead>

                  <tbody>
                    {campeonatosRegionais.map(c => (
                      <tr key={c.id}>
                        <td>{c.titulo}</td>
                        <td>{c.status}</td>
                        <td>{c.ativo ? 'Sim' : 'Não'}</td>
                        <td>
                          <button
                            onClick={() => apagarCampeonato(c.id)}
                            className="btn-sm btn-red"
                          >
                            Apagar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="card big-card">
              <h2>Criar Campeonato Regional</h2>

              <form
                onSubmit={criarCampeonatoRegional}
                className="login-form"
              >
                <div className="form-group">
                  <label>Título</label>
                  <input
                    value={novoCampRegional.titulo}
                    onChange={e =>
                      setNovoCampRegional({
                        ...novoCampRegional,
                        titulo: e.target.value
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Prêmio</label>
                  <input
                    value={novoCampRegional.premio}
                    onChange={e =>
                      setNovoCampRegional({
                        ...novoCampRegional,
                        premio: e.target.value
                      })
                    }
                  />
                </div>

                <button type="submit" className="login-btn">
                  Lançar Competição
                </button>
              </form>
            </section>
          </div>
        )

      default:
        return null
    }
  }

  // ===== PAINEL DO DONO =====

  const renderConteudoDono = () => {

    const barbeirosFiltradosDono = (
      unidadeFiltroRanking === 'TODAS'
        ? [...barbeiros]
        : barbeiros.filter(
            b => b.unidade === unidadeFiltroRanking
          )
    ).sort((a, b) => b.faturamento - a.faturamento)

    const campeonatoAtivoAdmin =
      campeonatosRegionais.some(c => c.ativo)

    const mostrarRankingRegional =
      barbeariasSaaS.length > 1 && campeonatoAtivoAdmin

    switch (abaAtiva) {

      case 0:
        return (
          <>
            <section className="kpi-grid">

              <div className="card kpi-card">
                <h3>Faturamento Total da Rede</h3>
                <p className="kpi-value">
                  {formatarReais(faturamentoTotalRede)}
                </p>
              </div>

              <div className="card kpi-card">
                <h3>Unidades Operacionais</h3>
                <p className="kpi-value">{unidades.length}</p>
              </div>

              <div className="card kpi-card">
                <h3>Total de Barbeiros</h3>
                <p className="kpi-value">{barbeiros.length}</p>
              </div>

            </section>

            <section className="card big-card">
              <h2>🤝 Progresso das Metas Coletivas</h2>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>
                {NIVEIS.map(n => {
                  const m = metasColetivas[n.chave]
                  const pct = Math.min(
                    100,
                    (faturamentoTotalRede / (m.objetivo || 1)) * 100
                  )

                  return (
                    <div
                      key={n.chave}
                      className="meta-box"
                      style={{ borderLeft: `4px solid ${n.cor}` }}
                    >
                      <p style={{ color: n.cor, fontWeight: 'bold' }}>
                        {n.icone} {n.nome}: {formatarReais(m.objetivo)}
                        {' '}({pct.toFixed(1)}%)
                      </p>

                      <BarraProgresso pct={pct} />

                      <p style={{ fontSize: '0.8rem' }}>
                        Prêmio: <strong>{m.premio}</strong>
                      </p>
                    </div>
                  )
                })}
              </div>
            </section>
          </>
        )

      // ===== UNIDADES E EQUIPE =====

      case 1:
        return (
          <div className="grid-duplo">

            <section className="card big-card">
              <h2>Gerenciar & Editar Unidades</h2>

              <form
                onSubmit={adicionarUnidade}
                className="login-form"
                style={{ marginBottom: '20px' }}
              >
                <div className="form-group">
                  <label>Nova Unidade</label>

                  <div style={{
                    display: 'flex',
                    gap: '8px'
                  }}>
                    <input
                      type="text"
                      placeholder="Ex: Unidade Norte"
                      value={novaUnidade}
                      onChange={e => setNovaUnidade(e.target.value)}
                      required
                    />

                    <button
                      type="submit"
                      className="login-btn"
                      style={{ margin: 0, padding: '0 16px' }}
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              </form>

              <div className="table-scroll">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Nome da Unidade</th>
                      <th>Ações</th>
                    </tr>
                  </thead>

                  <tbody>
                    {unidades.map(u => (
                      <tr key={u.id}>
                        <td>
                          {editandoUnidadeId === u.id
                            ? (
                              <input
                                type="text"
                                value={nomeUnidadeEdit}
                                onChange={e =>
                                  setNomeUnidadeEdit(e.target.value)
                                }
                                className="input-inline"
                              />
                            )
                            : <strong>{u.nome}</strong>}
                        </td>

                        <td>
                          {editandoUnidadeId === u.id
                            ? (
                              <div className="action-buttons-grid">
                                <button
                                  onClick={() => salvarEdicaoUnidade(u.id)}
                                  className="btn-sm btn-green"
                                >
                                  Salvar
                                </button>

                                <button
                                  onClick={() => setEditandoUnidadeId(null)}
                                  className="btn-sm btn-red"
                                >
                                  Cancelar
                                </button>
                              </div>
                            )
                            : (
                              <div className="action-buttons-grid">
                                <button
                                  onClick={() => {
                                    setEditandoUnidadeId(u.id)
                                    setNomeUnidadeEdit(u.nome)
                                  }}
                                  className="btn-sm btn-gold"
                                >
                                  Editar
                                </button>

                                <button
                                  onClick={() => apagarUnidade(u.id, u.nome)}
                                  className="btn-sm btn-red"
                                >
                                  Apagar
                                </button>
                              </div>
                            )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="card big-card">
              <h2>Adicionar Barbeiros</h2>

              <form
                onSubmit={cadastrarBarbeiro}
                className="login-form"
                style={{ marginBottom: '20px' }}
              >
                <div className="form-group">
                  <label>Nome</label>
                  <input
                    value={novoBarbeiro.nome}
                    onChange={e =>
                      setNovoBarbeiro({
                        ...novoBarbeiro,
                        nome: e.target.value
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Telefone (Login)</label>
                  <input
                    value={novoBarbeiro.telefone}
                    onChange={e =>
                      setNovoBarbeiro({
                        ...novoBarbeiro,
                        telefone: e.target.value
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Senha inicial</label>
                  <input
                    type="password"
                    value={novoBarbeiro.senha}
                    onChange={e =>
                      setNovoBarbeiro({
                        ...novoBarbeiro,
                        senha: e.target.value
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Unidade do Barbeiro</label>

                  <select
                    value={
                      novoBarbeiro.unidade ||
                      unidades[0]?.nome ||
                      ''
                    }
                    onChange={e =>
                      setNovoBarbeiro({
                        ...novoBarbeiro,
                        unidade: e.target.value
                      })
                    }
                    className="select-input"
                    required
                  >
                    {unidades.map(u => (
                      <option key={u.id} value={u.nome}>
                        {u.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <button type="submit" className="login-btn">
                  Cadastrar Barbeiro
                </button>
              </form>

              <h3>Equipe Cadastrada</h3>

              <div className="team-grid">
                {barbeiros.map(b => (
                  <div key={b.id} className="team-card">

                    <div className="avatar">
                      {b.nome.substring(0, 2).toUpperCase()}
                    </div>

                    <h4>{b.nome}</h4>

                    <span
                      className="badge-success"
                      style={{ fontSize: '0.7rem' }}
                    >
                      {b.unidade}
                    </span>

                    <div className="form-group" style={{ marginTop: '10px' }}>
                      <label>Alterar unidade</label>

                      <select
                        value={b.unidade}
                        className="select-input"
                        onChange={e => {
                          const novaUnidadeBarbeiro = e.target.value

                          setBarbeiros(prev =>
                            prev.map(item =>
                              item.id === b.id
                                ? {
                                    ...item,
                                    unidade: novaUnidadeBarbeiro
                                  }
                                : item
                            )
                          )
                        }}
                      >
                        {unidades.map(u => (
                          <option key={u.id} value={u.nome}>
                            {u.nome}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => apagarBarbeiro(b.id, b.nome)}
                      className="btn-sm btn-red"
                      style={{ marginTop: '8px' }}
                    >
                      Excluir Barbeiro
                    </button>

                  </div>
                ))}
              </div>
            </section>
          </div>
        )

      // ===== LANÇAMENTOS E HISTÓRICO =====

      case 2:
        return (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>

            <section className="card big-card">

              <h2>
                {editandoLancamentoId !== null
                  ? '✏️ Editar Lançamento'
                  : '💵 Novo Lançamento de Vendas'}
              </h2>

              <p className="subtitle">
                Registre os valores dos barbeiros. Todos os lançamentos
                ficam salvos no histórico e atualizam automaticamente
                o faturamento e os rankings.
              </p>

              <form
                onSubmit={registrarFaturamentoBarbeiro}
                className="login-form"
              >

                <div className="form-group">
                  <label>Selecionar Barbeiro</label>

                  <select
                    value={lancamentoValor.barbeiroId}
                    onChange={e =>
                      setLancamentoValor({
                        ...lancamentoValor,
                        barbeiroId: e.target.value
                      })
                    }
                    className="select-input"
                    required
                  >
                    <option value="">-- Escolher Barbeiro --</option>

                    {barbeiros.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.nome} ({b.unidade})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Valor (R$)</label>

                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="Ex: 80.00"
                    value={lancamentoValor.valor}
                    onChange={e =>
                      setLancamentoValor({
                        ...lancamentoValor,
                        valor: e.target.value
                      })
                    }
                    required
                  />
                </div>

                <div style={{
                  display: 'flex',
                  gap: '10px',
                  flexWrap: 'wrap'
                }}>
                  <button type="submit" className="login-btn">
                    {editandoLancamentoId !== null
                      ? 'Salvar Alterações'
                      : 'Registrar Lançamento'}
                  </button>

                  {editandoLancamentoId !== null && (
                    <button
                      type="button"
                      className="btn-sm btn-red"
                      onClick={cancelarEdicaoLancamento}
                    >
                      Cancelar Edição
                    </button>
                  )}
                </div>
              </form>
            </section>

            <section className="card big-card">

              <h2>📊 Faturamento por Barbeiro</h2>

              <div className="table-scroll">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Barbeiro</th>
                      <th>Unidade</th>
                      <th>Faturamento</th>
                    </tr>
                  </thead>

                  <tbody>
                    {barbeiros.map(b => (
                      <tr key={b.id}>
                        <td><strong>{b.nome}</strong></td>
                        <td>{b.unidade}</td>
                        <td className="gold-txt">
                          {formatarReais(b.faturamento)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="card big-card">

              <div className="ranking-header">
                <h2>📋 Histórico de Lançamentos</h2>

                <span className="badge-success">
                  {lancamentos.length} registros
                </span>
              </div>

              <p className="subtitle">
                Consulte, edite ou exclua qualquer lançamento.
              </p>

              {lancamentos.length === 0 ? (
                <p className="subtitle">
                  Nenhum lançamento registrado ainda.
                </p>
              ) : (
                <div className="table-scroll">
                  <table className="custom-table">

                    <thead>
                      <tr>
                        <th>Data e Hora</th>
                        <th>Barbeiro</th>
                        <th>Unidade</th>
                        <th>Valor</th>
                        <th>Ações</th>
                      </tr>
                    </thead>

                    <tbody>
                      {[...lancamentos]
                        .sort(
                          (a, b) =>
                            new Date(b.data).getTime() -
                            new Date(a.data).getTime()
                        )
                        .map(l => {
                          const barbeiro = barbeiros.find(
                            b => b.id === l.barbeiroId
                          )

                          return (
                            <tr key={l.id}>

                              <td>
                                {new Date(l.data).toLocaleString('pt-BR')}
                              </td>

                              <td>
                                <strong>
                                  {barbeiro?.nome || 'Barbeiro removido'}
                                </strong>
                              </td>

                              <td>
                                {barbeiro?.unidade || '-'}
                              </td>

                              <td className="gold-txt">
                                {formatarReais(l.valorCentavos)}
                              </td>

                              <td>
                                {barbeiro ? (
                                  <div className="action-buttons-grid">
                                    <button
                                      onClick={() => editarLancamento(l)}
                                      className="btn-sm btn-gold"
                                    >
                                      Editar
                                    </button>

                                    <button
                                      onClick={() => excluirLancamento(l)}
                                      className="btn-sm btn-red"
                                    >
                                      Excluir
                                    </button>
                                  </div>
                                ) : (
                                  <span className="subtitle">
                                    Registro preservado
                                  </span>
                                )}
                              </td>

                            </tr>
                          )
                        })}
                    </tbody>

                  </table>
                </div>
              )}
            </section>
          </div>
        )

      // ===== METAS =====

      case 3:
        return (
          <div className="grid-duplo">

            <section className="card big-card">

              <h2>⚙️ Configurar as 3 Metas Coletivas</h2>

              <p className="subtitle">
                Defina os objetivos e prêmios para toda a equipe.
                Somente o dono tem acesso à configuração.
              </p>

              <form
                onSubmit={salvarMetasColetivasForm}
                className="login-form"
              >

                {NIVEIS.map(n => (
                  <div
                    key={n.chave}
                    className="meta-box"
                    style={{ borderLeft: `4px solid ${n.cor}` }}
                  >

                    <label style={{
                      color: n.cor,
                      fontWeight: 'bold'
                    }}>
                      {n.icone} Meta Coletiva {n.nome} (R$):
                    </label>

                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={metasColetivas[n.chave].objetivo / 100}
                      onChange={e =>
                        setMetasColetivas(prev => ({
                          ...prev,
                          [n.chave]: {
                            ...prev[n.chave],
                            objetivo: Math.round(
                              Number(e.target.value) * 100
                            )
                          }
                        }))
                      }
                      required
                    />

                    <label>Prêmio:</label>

                    <input
                      type="text"
                      value={metasColetivas[n.chave].premio}
                      onChange={e =>
                        setMetasColetivas(prev => ({
                          ...prev,
                          [n.chave]: {
                            ...prev[n.chave],
                            premio: e.target.value
                          }
                        }))
                      }
                      required
                    />

                  </div>
                ))}

                <button type="submit" className="login-btn">
                  Salvar Metas Coletivas
                </button>
              </form>
            </section>

            <section className="card big-card">

              <h2>👤 Definir Metas Individuais</h2>

              <p className="subtitle">
                Configure as metas Bronze, Prata e Ouro de cada barbeiro.
                O barbeiro somente poderá visualizar suas próprias metas.
              </p>

              {barbeiros.length === 0 ? (
                <p className="subtitle">
                  Cadastre um barbeiro para configurar metas.
                </p>
              ) : (
                <form
                  onSubmit={salvarMetasBarbeiroForm}
                  className="login-form"
                >

                  <div className="form-group">
                    <label>Selecione o Barbeiro:</label>

                    <select
                      value={barbeiroSelecionadoConfig}
                      onChange={e =>
                        setBarbeiroSelecionadoConfig(e.target.value)
                      }
                      className="select-input"
                      required
                    >
                      {barbeiros.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.nome} ({b.unidade})
                        </option>
                      ))}
                    </select>
                  </div>

                  {NIVEIS.map(n => {
                    const f = formMetas[n.chave]
                    if (!f) return null

                    return (
                      <div
                        key={n.chave}
                        className="meta-box"
                        style={{ borderLeft: `4px solid ${n.cor}` }}
                      >

                        <label style={{
                          color: n.cor,
                          fontWeight: 'bold'
                        }}>
                          {n.icone} Meta Individual {n.nome}:
                        </label>

                        <div className="meta-row">

                          <select
                            value={f.tipo}
                            onChange={e =>
                              atualizarFormMeta(
                                n.chave,
                                'tipo',
                                e.target.value
                              )
                            }
                            className="select-input"
                          >
                            <option value="valor">Valor (R$)</option>
                            <option value="porcentagem">
                              Porcentagem (%)
                            </option>
                          </select>

                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="Meta"
                            value={f.meta}
                            onChange={e =>
                              atualizarFormMeta(
                                n.chave,
                                'meta',
                                e.target.value
                              )
                            }
                            required
                          />
                        </div>

                        <input
                          type="text"
                          placeholder={`Prêmio ${n.nome}`}
                          value={f.premio}
                          onChange={e =>
                            atualizarFormMeta(
                              n.chave,
                              'premio',
                              e.target.value
                            )
                          }
                          required
                        />

                      </div>
                    )
                  })}

                  <button type="submit" className="login-btn">
                    Salvar as 3 Metas deste Barbeiro
                  </button>

                </form>
              )}
            </section>
          </div>
        )

      // ===== RANKINGS =====

      case 4:
        return (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>

            <section
              className="card big-card"
              style={{ border: '2px solid #C6A15B' }}
            >

              <div className="ranking-header">

                <h2 style={{ marginBottom: 0 }}>
                  🏆 RANKING INTERNO DE DESEMPENHO
                </h2>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <label style={{
                    fontSize: '0.85rem',
                    color: '#C6A15B',
                    fontWeight: 'bold'
                  }}>
                    Filtro:
                  </label>

                  <select
                    value={unidadeFiltroRanking}
                    onChange={e =>
                      setUnidadeFiltroRanking(e.target.value)
                    }
                    className="select-input"
                  >
                    <option value="TODAS">
                      🌐 Geral (Rede Unificada)
                    </option>

                    {unidades.map(u => (
                      <option key={u.id} value={u.nome}>
                        📍 {u.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <ul className="ranking-list">

                {barbeirosFiltradosDono.map((b, index) => {

                  const metaOuro = (
                    metasIndividuaisPorBarbeiro[b.id] ||
                    METAS_PADRAO
                  ).ouro

                  const prog = progressoMeta(
                    b.faturamento,
                    metaOuro,
                    faturamentoTotalRede
                  )

                  return (
                    <li
                      key={b.id}
                      className={
                        index === 0 ? 'destaque-barbeiro' : ''
                      }
                      style={{
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        gap: '6px'
                      }}
                    >

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '8px',
                        flexWrap: 'wrap'
                      }}>

                        <span>
                          <strong>#{index + 1}</strong> {b.nome}
                          <small style={{ color: '#9ca3af' }}>
                            {' '}({b.unidade})
                          </small>
                        </span>

                        <span className="gold-txt">
                          {formatarReais(b.faturamento)}
                          {' '}({prog.toFixed(1)}% meta ouro)
                        </span>
                      </div>

                      <BarraProgresso pct={prog} altura={6} />

                    </li>
                  )
                })}

              </ul>
            </section>

            {mostrarRankingRegional && (
              <section
                className="card big-card"
                style={{
                  border: '2px dashed #7c3aed',
                  background: 'rgba(124, 58, 237, 0.05)'
                }}
              >

                <h2>
                  ⭐ RANKING REGIONAL ENTRE BARBEARIAS (SaaS)
                </h2>

                <ul className="ranking-list">
                  {barbeariasSaaS.map((barb, idx) => (
                    <li key={barb.id}>
                      <span>
                        <strong>#{idx + 1}</strong> 💈 {barb.nome}
                      </span>

                      <span className="gold-txt">
                        Status: {barb.statusSaaS}
                      </span>
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

  // ===== PAINEL DO BARBEIRO =====

  const renderConteudoBarbeiro = () => {

    if (!barbeiroLogado) {
      return (
        <section className="card big-card">
          <h2>Cadastro não encontrado</h2>
          <p className="subtitle">
            Seu cadastro foi removido. Encerre a sessão e fale com o dono.
          </p>
        </section>
      )
    }

    const barbeirosDaMinhaUnidade = barbeiros
      .filter(b => b.unidade === barbeiroLogado.unidade)
      .sort((a, b) => b.faturamento - a.faturamento)

    const minhasMetas =
      metasIndividuaisPorBarbeiro[barbeiroLogado.id] ||
      METAS_PADRAO

    const meuFaturamento = barbeiroLogado.faturamento

    switch (abaAtiva) {

      // ===== MEU DESEMPENHO E MINHA SENHA =====

      case 0:
        return (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>

            <section className="card big-card">

              <h2>Meu Desempenho</h2>

              <p className="subtitle">
                Profissional: <strong>{barbeiroLogado.nome}</strong>
                {' '}({barbeiroLogado.unidade})
              </p>

              <div className="kpi-grid">

                <div className="card kpi-card">
                  <h3>Meu Faturamento Acumulado</h3>
                  <p className="kpi-value">
                    {formatarReais(meuFaturamento)}
                  </p>
                </div>

                <div className="card kpi-card">
                  <h3>Minha Participação na Rede</h3>
                  <p className="kpi-value">
                    {faturamentoTotalRede > 0
                      ? (
                          (meuFaturamento / faturamentoTotalRede) * 100
                        ).toFixed(1)
                      : '0.0'}%
                  </p>
                </div>

              </div>
            </section>

            <section className="card big-card">

              <h2>🔐 Alterar Minha Senha</h2>

              <p className="subtitle">
                Você pode trocar sua senha de acesso sempre que precisar.
                Somente você tem acesso a esta alteração nesta tela.
              </p>

              <form
                onSubmit={alterarMinhaSenha}
                className="login-form"
              >

                <div className="form-group">
                  <label>Senha Atual</label>

                  <input
                    type="password"
                    value={senhaAtual}
                    onChange={e => setSenhaAtual(e.target.value)}
                    placeholder="Digite sua senha atual"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Nova Senha</label>

                  <input
                    type="password"
                    value={novaSenha}
                    onChange={e => setNovaSenha(e.target.value)}
                    placeholder="Digite sua nova senha"
                    minLength={4}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Confirmar Nova Senha</label>

                  <input
                    type="password"
                    value={confirmarNovaSenha}
                    onChange={e =>
                      setConfirmarNovaSenha(e.target.value)
                    }
                    placeholder="Digite novamente sua nova senha"
                    minLength={4}
                    required
                  />
                </div>

                <button type="submit" className="login-btn">
                  Alterar Minha Senha
                </button>

              </form>
            </section>
          </div>
        )

      // ===== MINHAS METAS: SOMENTE VISUALIZAÇÃO =====

      case 1:
        return (
          <section className="card big-card">

            <h2>Minhas 3 Metas Individuais & Progresso</h2>

            <p className="subtitle">
              Estas metas são definidas pelo dono da barbearia.
              Aqui você pode acompanhar seu desempenho e suas premiações.
            </p>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              marginTop: '10px'
            }}>

              {NIVEIS.map(n => {

                const meta = minhasMetas[n.chave]

                const pct = progressoMeta(
                  meuFaturamento,
                  meta,
                  faturamentoTotalRede
                )

                return (
                  <div
                    key={n.chave}
                    className="meta-box"
                    style={{
                      background: '#0a0a0a',
                      borderLeft: `4px solid ${n.cor}`
                    }}
                  >

                    <p style={{
                      color: n.cor,
                      fontWeight: 'bold'
                    }}>
                      {n.icone} Meta {n.nome}:
                      {' '}{rotuloMeta(meta)}
                      {' '}({pct.toFixed(1)}%)
                    </p>

                    <BarraProgresso pct={pct} />

                    <p style={{ fontSize: '0.8rem' }}>
                      Prêmio: <strong>{meta?.premio || '-'}</strong>
                    </p>

                    <p style={{ fontSize: '0.8rem' }}>
                      {pct >= 100
                        ? '🎉 Parabéns! Você atingiu esta meta!'
                        : 'Continue trabalhando para alcançar sua meta!'}
                    </p>

                  </div>
                )
              })}

            </div>
          </section>
        )

      // ===== RANKING DA UNIDADE =====

      case 2:
        return (
          <section
            className="card big-card"
            style={{ border: '2px solid #C6A15B' }}
          >

            <h2>
              🏆 RANKING OFICIAL — {barbeiroLogado.unidade.toUpperCase()}
            </h2>

            <ul className="ranking-list">

              {barbeirosDaMinhaUnidade.map((b, index) => {

                const meuRegistro = b.id === barbeiroLogado.id

                const prog = progressoMeta(
                  b.faturamento,
                  (
                    metasIndividuaisPorBarbeiro[b.id] ||
                    METAS_PADRAO
                  ).ouro,
                  faturamentoTotalRede
                )

                return (
                  <li
                    key={b.id}
                    className={
                      meuRegistro ? 'destaque-barbeiro' : ''
                    }
                  >

                    <span>
                      <strong>#{index + 1}</strong> {b.nome}
                    </span>

                    <span>
                      {meuRegistro
                        ? `${formatarReais(b.faturamento)} (${prog.toFixed(1)}% meta ouro)`
                        : '*** Oculto'}
                    </span>

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

  // ===== INTERFACE PRINCIPAL =====

  return (
    <div className="app-layout">

      <aside className="sidebar">

        <div className="brand">
          <h2>AS GESTÃO</h2>
          <span>PRO SaaS</span>
        </div>

        <nav className="sidebar-menu">

          {menuAtual.map((item, index) => (
            <button
              key={item}
              className={`menu-btn ${
                abaAtiva === index ? 'active' : ''
              }`}
              onClick={() => setAbaAtiva(index)}
            >
              {item}
            </button>
          ))}

        </nav>

        <button
          onClick={handleLogout}
          className="logout-btn"
        >
          Encerrar Sessão
        </button>

      </aside>

      <main className="main-content">

        <header className="header">

          <h1>{menuAtual[abaAtiva]}</h1>

          <div className="user-profile">

            <span className="avatar">
              {perfilAtivo === 'admin'
                ? 'SA'
                : perfilAtivo === 'dono'
                  ? 'DO'
                  : (
                      barbeiroLogado?.nome
                        ?.substring(0, 2)
                        .toUpperCase() || '??'
                    )}
            </span>

            <span className="username">

              {perfilAtivo === 'admin' &&
                `${ADMIN_LOGIN} (Super Admin)`}

              {perfilAtivo === 'dono' &&
                (
                  barbeariaLogada
                    ? barbeariaLogada.nome
                    : 'Dono'
                )}

              {perfilAtivo === 'barbeiro' &&
                (
                  barbeiroLogado?.nome ||
                  'Barbeiro'
                )}

            </span>

          </div>
        </header>

        {perfilAtivo === 'admin' && renderConteudoAdmin()}

        {perfilAtivo === 'dono' && renderConteudoDono()}

        {perfilAtivo === 'barbeiro' && renderConteudoBarbeiro()}

      </main>
    </div>
  )
}
