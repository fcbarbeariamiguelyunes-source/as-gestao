import { useState, useEffect, Fragment } from 'react'
import { useNuvem } from './useNuvem'
import './App.css'

const menuAdmin = ['Visão Geral SaaS', 'Licenças & Testes', 'Barbearias SaaS', 'Vistoria & Auditoria', 'Campeonatos Regionais', '🌎 Ranking Regional & Liberações']
const menuDono = ['Visão Geral', 'Unidades & Equipe', 'Lançamento de Vendas', '📜 Histórico de Lançamentos', 'Metas & Premiações', '🏆 Rankings & Competições', '⚙️ Configurações', 'Serviços Extras & Produtos', 'Competições de Extras']
const menuBarbeiro = ['Meu Desempenho', 'Minhas Metas', '🏆 Ranking da Minha Unidade', 'Ranking Regional', 'Meus Extras & Produtos', '⚙️ Configurações']

const hojeISO = () => {
const d = new Date()
const m = String(d.getMonth() + 1).padStart(2, '0')
const dia = String(d.getDate()).padStart(2, '0')
return `${d.getFullYear()}-${m}-${dia}`
}
const formatarData = (iso) => (iso ? iso.split('-').reverse().join('/') : '')

const DIA_MS = 24 * 60 * 60 * 1000
const PLANOS = ['Teste Grátis', 'Mensal', 'Anual Pro', 'Vitalício']
const dinheiroBR = (centavos) => `R$ ${((centavos || 0) / 100).toFixed(2)}`
const doisDigitos = (n) => String(n).padStart(2, '0')
const paraInputDataHora = (ms) => {
const d = new Date(ms)
return `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}T${doisDigitos(d.getHours())}:${doisDigitos(d.getMinutes())}`
}
const formatarDataHora = (ms) => new Date(ms).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
const rotuloTipo = (t) => (t === 'produto' ? '🛍️ Produto' : '✂️ Serviço extra')

// Situação da licença de uma barbearia (ativa, expirada, em teste, vitalícia...)
const licencaInfo = (b) => {
const vitalicio = b.plano === 'Vitalício' || (b.expiraEm === undefined && b.diasRestantes >= 9000)
const expiraEm = vitalicio || !b.expiraEm ? null : b.expiraEm
const ativo = b.ativo !== false
const expirada = expiraEm !== null && Date.now() > expiraEm
const diasRest = expiraEm === null ? null : Math.max(0, Math.ceil((expiraEm - Date.now()) / DIA_MS))
const teste = String(b.plano || '').startsWith('Teste')
let rotulo = '✅ Ativa'
let classe = 'badge-success'
if (!ativo) { rotulo = '⛔ Inativa'; classe = 'badge-danger' }
else if (expirada) { rotulo = '⌛ Expirada'; classe = 'badge-danger' }
else if (teste) { rotulo = '🧪 Em teste' }
return { vitalicio, expiraEm, ativo, expirada, diasRest, rotulo, classe, teste }
}

// Vendas extras: agregações
const rankingExtras = (vendas, barbeiros, metrica) =>
barbeiros
.map(b => {
const minhas = vendas.filter(v => v.barbeiroId === b.id)
return { barbeiro: b, qtd: minhas.reduce((a, v) => a + v.qtd, 0), total: minhas.reduce((a, v) => a + v.total, 0) }
})
.sort((x, y) => (metrica === 'quantidade' ? y.qtd - x.qtd || y.total - x.total : y.total - x.total || y.qtd - x.qtd))

const maisVendidos = (vendas, tipo) => {
const mapa = {}
vendas.filter(v => v.tipo === tipo).forEach(v => {
if (!mapa[v.nome]) mapa[v.nome] = { nome: v.nome, qtd: 0, total: 0 }
mapa[v.nome].qtd += v.qtd
mapa[v.nome].total += v.total
})
return Object.values(mapa).sort((a, b) => b.qtd - a.qtd || b.total - a.total)
}

const statusCompeticao = (c) => {
const hoje = hojeISO()
if (hoje < c.inicio) return 'Em breve'
if (hoje > c.fim) return 'Encerrada'
return 'Em andamento'
}
const vendasDaCompeticao = (c, vendas) =>
vendas.filter(v => v.data >= c.inicio && v.data <= c.fim && (c.tipo === 'todos' || v.tipo === c.tipo))

export default function App() {
const [isLoggedIn, setIsLoggedIn] = useState(false)
const [perfilAtivo, setPerfilAtivo] = useState('dono')

const [usuario, setUsuario] = useState({ login: '', senha: '' })
const [erroLogin, setErroLogin] = useState('')
const [mostrarSenha, setMostrarSenha] = useState(false)
const [abaAtiva, setAbaAtiva] = useState(1) // Inicia na aba de Unidades para testar a edição

const [unidadeFiltroRanking, setUnidadeFiltroRanking] = useState('TODAS')

// 1. Barbearias SaaS (Persistido)
const [barbeariasSaaS, setBarbeariasSaaS, ok1] = useNuvem('barbearias_saas', [
{ id: 1, nome: 'Barbearia Mestre', usuarioDono: 'dono', senhaDono: '123456', plano: 'Teste Grátis', diasRestantes: 7, statusPagamento: 'Pendente', statusSaaS: 'Em Teste' },
{ id: 2, nome: 'Imperial Barber', usuarioDono: 'imperial', senhaDono: '123456', plano: 'Anual Pro', diasRestantes: 330, statusPagamento: 'Pago', statusSaaS: 'Ativo' }
])
const [novaBarbeariaSaaS, setNovaBarbeariaSaaS] = useState({ nome: '', usuarioDono: '', senhaDono: '', plano: 'Teste Grátis', dias: '7', pro: 'nao' })

// 2. Campeonatos Regionais
const [campeonatosRegionais, setCampeonatosRegionais, ok2] = useNuvem('campeonatos_regionais', [
{ id: 1, titulo: 'Batalha de Barbeiros - Regional SP', status: 'Em Andamento', premio: 'Troféu Ouro + Viagem', ativo: true }
])
const [novoCampRegional, setNovoCampRegional] = useState({ titulo: '', premio: '' })

const [barbeariaLogada, setBarbeariaLogada] = useState(null)

// 3. Unidades (Persistido) com suporte a edição
const [unidades, setUnidades, ok3] = useNuvem('unidades', [])
const [novaUnidade, setNovaUnidade] = useState('')
const [editandoUnidadeId, setEditandoUnidadeId] = useState(null)
const [nomeUnidadeEdit, setNomeUnidadeEdit] = useState('')

// 4. Barbeiros (Persistido)
const [barbeiros, setBarbeiros, ok4] = useNuvem('barbeiros', [])
const [novoBarbeiro, setNovoBarbeiro] = useState({ nome: '', telefone: '', senha: '', unidade: '' })

// Edição de barbeiro (nome e unidade)
const [editandoBarbeiroId, setEditandoBarbeiroId] = useState(null)
const [barbeiroEdit, setBarbeiroEdit] = useState({ nome: '', unidade: '' })

// Lançamento de Vendas
const [lancamentoValor, setLancamentoValor] = useState({ unidade: '', barbeiroId: '', valor: '', tipo: 'Corte/Serviço', data: hojeISO() })

// 5. Metas Coletivas da Rede
const [metasColetivas, setMetasColetivas, ok5] = useNuvem('metas_coletivas', {
bronze: { objetivo: 4000000, premio: 'Churrasco da Equipe' },
prata: { objetivo: 7000000, premio: 'Churrasco + R$ 300 em Bônus para cada' },
ouro: { objetivo: 10000000, premio: 'Churrasco + R$ 600 em Bônus + Troféu Ouro' }
})

// 6. Três Metas Individuais por Barbeiro
const [metasIndividuaisPorBarbeiro, setMetasIndividuaisPorBarbeiro, ok6] = useNuvem('metas_tres_individuais', {})

const [barbeiroSelecionadoConfig, setBarbeiroSelecionadoConfig] = useState('')
const [formTresMetasBarbeiro, setFormTresMetasBarbeiro] = useState({
bronzeTipo: 'valor', bronzeMeta: '1000', bronzePremio: 'Folga Extra',
prataTipo: 'valor', prataMeta: '2000', prataPremio: 'Bônus 10%',
ouroTipo: 'valor', ouroMeta: '3000', ouroPremio: 'Viagem'
})

const [barbeiroLogado, setBarbeiroLogado] = useState(null)

// Histórico de lançamentos (na nuvem)
const [lancamentos, setLancamentos, ok7] = useNuvem('lancamentos', [])
const [filtroHist, setFiltroHist] = useState({ unidade: 'TODAS', data: '' })
const [editandoLancId, setEditandoLancId] = useState(null)
const [lancEdit, setLancEdit] = useState({ barbeiroId: '', valor: '', data: '' })

// Trocar senha (Configurações)
const [formSenha, setFormSenha] = useState({ atual: '', nova: '', confirmar: '' })
const [msgSenha, setMsgSenha] = useState({ tipo: '', texto: '' })

// Versão Pro: catálogo, vendas e competições de serviços extras / produtos (na nuvem)
const [catalogoExtras, setCatalogoExtras, ok8] = useNuvem('catalogo_extras', [])
const [vendasExtras, setVendasExtras, ok9] = useNuvem('vendas_extras', [])
const [competicoesPro, setCompeticoesPro, ok10] = useNuvem('competicoes_pro', [])
const [novoItem, setNovoItem] = useState({ tipo: 'servico', nome: '', preco: '' })
const [vendaExtra, setVendaExtra] = useState({ barbeiroId: '', itemId: '', qtd: '1', data: hojeISO() })
const [novaCompeticao, setNovaCompeticao] = useState({ titulo: '', tipo: 'todos', metrica: 'valor', inicio: hojeISO(), fim: hojeISO(), premio: '' })

// Super Admin: edição de licença
const [editandoLicId, setEditandoLicId] = useState(null)
const [licEdit, setLicEdit] = useState({ plano: 'Teste Grátis', dias: '7', ate: '', ativo: 'sim', pro: 'nao' })

// Migração única: barbearias antigas ganham validade (data/hora), status ativo e flag Pro
useEffect(() => {
if (!ok1) return
if (barbeariasSaaS.some(b => b.expiraEm === undefined)) {
setBarbeariasSaaS(barbeariasSaaS.map(b => {
if (b.expiraEm !== undefined) return b
const vit = b.plano === 'Vitalício' || b.diasRestantes >= 9000
return {
...b,
plano: vit ? 'Vitalício' : b.plano,
expiraEm: vit ? 0 : Date.now() + (b.diasRestantes || 0) * DIA_MS,
ativo: b.ativo !== false,
pro: !!b.pro
}
}))
}
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [ok1])

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
} else {
setFormTresMetasBarbeiro({
bronzeTipo: 'valor', bronzeMeta: '1000', bronzePremio: 'Folga',
prataTipo: 'valor', prataMeta: '2000', prataPremio: 'Bônus',
ouroTipo: 'valor', ouroMeta: '3000', ouroPremio: 'Super Prêmio'
})
}
}, [barbeiroSelecionadoConfig, ok6])

// Garante que o barbeiro selecionado nas metas sempre existe
useEffect(() => {
if (barbeiros.length > 0 && !barbeiros.some(b => String(b.id) === barbeiroSelecionadoConfig)) {
setBarbeiroSelecionadoConfig(String(barbeiros[0].id))
}
}, [barbeiros, barbeiroSelecionadoConfig])

// Login
const handleLogin = (e) => {
e.preventDefault()
setErroLogin('')

if (perfilAtivo === 'admin') {
if (usuario.login === 'Adriel2711' && usuario.senha === 'Giovana2711@') {
setAbaAtiva(0)
setIsLoggedIn(true)
} else {
setErroLogin('Credenciais de Super Admin incorretas.')
}
} else if (perfilAtivo === 'dono') {
const barbeariaEncontrada = barbeariasSaaS.find(
b => b.usuarioDono === usuario.login && b.senhaDono === usuario.senha
)
if (barbeariaEncontrada) {
const lic = licencaInfo(barbeariaEncontrada)
if (!lic.ativo) {
setErroLogin('Esta barbearia está desativada. Fale com o administrador.')
return
}
if (lic.expirada) {
setErroLogin(`Licença expirada em ${formatarDataHora(lic.expiraEm)}. Fale com o administrador para renovar.`)
return
}
}
if (barbeariaEncontrada || (usuario.login === 'dono' && usuario.senha === '123456' && !barbeariasSaaS.some(b => b.usuarioDono === 'dono'))) {
setBarbeariaLogada(barbeariaEncontrada || { nome: 'Barbearia Principal' })
setAbaAtiva(0)
setIsLoggedIn(true)
} else {
setErroLogin('Credenciais do Dono incorretas.')
}
} else {
const achado = barbeiros.find(
b => (b.telefone === usuario.login || b.nome.toLowerCase() === usuario.login.toLowerCase()) && b.senha === usuario.senha
)
const regBarb = achado ? barbeariasSaaS.find(x => x.id === achado.barbeariaId) : null
if (regBarb) {
const lic = licencaInfo(regBarb)
if (!lic.ativo || lic.expirada) {
setErroLogin('O acesso da sua barbearia está suspenso. Fale com o dono da barbearia.')
return
}
}
if (achado) {
setBarbeiroLogado(achado)
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
setBarbeiroLogado(null)
setUsuario({ login: '', senha: '' })
setAbaAtiva(0)
}

// Gestão de Unidades com Edição
const adicionarUnidade = (e) => {
e.preventDefault()
if (!novaUnidade.trim()) return
const novoId = Math.max(0, ...unidades.map(u => u.id)) + 1
setUnidades([...unidades, { id: novoId, nome: novaUnidade, status: 'Ativa', gerente: 'A definir' }])
setNovaUnidade('')
}

const apagarUnidade = (id, nomeUnidade) => {
const qtd = barbeiros.filter(b => b.unidade === nomeUnidade).length
if (qtd > 0) {
alert(`Não dá para apagar "${nomeUnidade}": ainda tem ${qtd} barbeiro(s) nela. Mova ou exclua os barbeiros antes (ou use Editar para só trocar o nome da unidade).`)
return
}
if (window.confirm(`Deseja apagar a unidade "${nomeUnidade}"?`)) {
setUnidades(unidades.filter(u => u.id !== id))
}
}

const salvarEdicaoUnidade = (id) => {
if (!nomeUnidadeEdit.trim()) return
const unidadeAntiga = unidades.find(u => u.id === id)

setUnidades(unidades.map(u => u.id === id ? { ...u, nome: nomeUnidadeEdit } : u))
// Mantém os barbeiros vinculados à unidade renomeada
setBarbeiros(barbeiros.map(b =>
b.unidade === unidadeAntiga.nome ? { ...b, unidade: nomeUnidadeEdit } : b
))

setEditandoUnidadeId(null)
alert('Unidade atualizada com sucesso!')
}

const cadastrarBarbeiro = (e) => {
e.preventDefault()
if (!novoBarbeiro.nome.trim() || !novoBarbeiro.telefone.trim()) return
if (unidades.length === 0) {
alert('Cadastre uma unidade antes de cadastrar barbeiros.')
return
}
const unidadeEscolhida = unidades.some(u => u.nome === novoBarbeiro.unidade) ? novoBarbeiro.unidade : unidades[0].nome
const novoId = barbeiros.length > 0 ? Math.max(...barbeiros.map(b => b.id)) + 1 : 1
setBarbeiros([...barbeiros, { id: novoId, ...novoBarbeiro, unidade: unidadeEscolhida, faturamento: 0, barbeariaId: barbeariaLogada?.id ?? null, regionalLiberado: false }])

setMetasIndividuaisPorBarbeiro({
...metasIndividuaisPorBarbeiro,
[novoId]: {
bronze: { tipo: 'valor', meta: 1000000, premio: 'Folga' },
prata: { tipo: 'valor', meta: 2000000, premio: 'Bônus' },
ouro: { tipo: 'valor', meta: 3000000, premio: 'Super Prêmio' }
}
})

setNovoBarbeiro({ nome: '', telefone: '', senha: '', unidade: '' })
alert('Barbeiro cadastrado com sucesso!')
}

const apagarBarbeiro = (id, nomeBarbeiro) => {
if (window.confirm(`Deseja remover o barbeiro ${nomeBarbeiro}? Os lançamentos dele também serão removidos do histórico.`)) {
setBarbeiros(barbeiros.filter(b => b.id !== id))
setLancamentos(lancamentos.filter(l => l.barbeiroId !== id))
}
}

// Edição de barbeiro
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
if (isNaN(valorCentavos) || valorCentavos <= 0) {
alert('Informe um valor válido.')
return
}
const barbeiroId = Number(lancamentoValor.barbeiroId)
const data = lancamentoValor.data || hojeISO()

setBarbeiros(barbeiros.map(b => (b.id === barbeiroId ? { ...b, faturamento: b.faturamento + valorCentavos } : b)))

const novoId = Math.max(0, ...lancamentos.map(l => l.id)) + 1
setLancamentos([...lancamentos, { id: novoId, barbeiroId, valor: valorCentavos, tipo: lancamentoValor.tipo, data, criadoEm: Date.now() }])

// Mantém unidade e data para facilitar vários lançamentos seguidos
setLancamentoValor({ unidade: lancamentoValor.unidade, barbeiroId: '', valor: '', tipo: 'Corte/Serviço', data })
alert('Lançamento realizado com sucesso!')
}

// Histórico: editar e apagar lançamentos
const iniciarEdicaoLancamento = (l) => {
setEditandoLancId(l.id)
setLancEdit({ barbeiroId: String(l.barbeiroId), valor: (l.valor / 100).toFixed(2), data: l.data })
}

const salvarEdicaoLancamento = (id) => {
const antigo = lancamentos.find(l => l.id === id)
if (!antigo) return
const novoValor = Math.round(parseFloat(lancEdit.valor) * 100)
if (!lancEdit.barbeiroId || isNaN(novoValor) || novoValor <= 0 || !lancEdit.data) {
alert('Preencha barbeiro, valor e data corretamente.')
return
}
const novoBarbeiroId = Number(lancEdit.barbeiroId)

setBarbeiros(barbeiros.map(b => {
let fat = b.faturamento
if (b.id === antigo.barbeiroId) fat -= antigo.valor
if (b.id === novoBarbeiroId) fat += novoValor
return fat === b.faturamento ? b : { ...b, faturamento: Math.max(0, fat) }
}))
setLancamentos(lancamentos.map(l => (l.id === id ? { ...l, barbeiroId: novoBarbeiroId, valor: novoValor, data: lancEdit.data } : l)))
setEditandoLancId(null)
}

const apagarLancamento = (l) => {
if (!window.confirm(`Apagar o lançamento de R$ ${(l.valor / 100).toFixed(2)} do dia ${formatarData(l.data)}?`)) return
setBarbeiros(barbeiros.map(b => (b.id === l.barbeiroId ? { ...b, faturamento: Math.max(0, b.faturamento - l.valor) } : b)))
setLancamentos(lancamentos.filter(x => x.id !== l.id))
}

// Configurações: trocar a própria senha (dono ou barbeiro)
const trocarSenha = (e) => {
e.preventDefault()
const ehDono = perfilAtivo === 'dono'
const donoAtual = barbeariasSaaS.find(b => b.id === barbeariaLogada?.id)
const barbeiroAtualCfg = barbeiros.find(b => b.id === barbeiroLogado?.id)
const senhaReal = ehDono ? donoAtual?.senhaDono : barbeiroAtualCfg?.senha

if (ehDono ? !donoAtual : !barbeiroAtualCfg) {
setMsgSenha({ tipo: 'erro', texto: 'Não foi possível localizar a sua conta.' })
return
}
if (formSenha.atual !== senhaReal) {
setMsgSenha({ tipo: 'erro', texto: 'A senha atual está incorreta.' })
return
}
if (formSenha.nova.length < 4) {
setMsgSenha({ tipo: 'erro', texto: 'A nova senha precisa ter pelo menos 4 caracteres.' })
return
}
if (formSenha.nova === formSenha.atual) {
setMsgSenha({ tipo: 'erro', texto: 'A nova senha deve ser diferente da atual.' })
return
}
if (formSenha.nova !== formSenha.confirmar) {
setMsgSenha({ tipo: 'erro', texto: 'A confirmação não é igual à nova senha.' })
return
}

if (ehDono) {
setBarbeariasSaaS(barbeariasSaaS.map(b => (b.id === donoAtual.id ? { ...b, senhaDono: formSenha.nova } : b)))
} else {
setBarbeiros(barbeiros.map(b => (b.id === barbeiroAtualCfg.id ? { ...b, senha: formSenha.nova } : b)))
}
setFormSenha({ atual: '', nova: '', confirmar: '' })
setMsgSenha({ tipo: 'ok', texto: 'Senha alterada com sucesso! Use a nova senha no próximo acesso.' })
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
const vit = novaBarbeariaSaaS.plano === 'Vitalício'
const dias = Math.max(1, parseInt(novaBarbeariaSaaS.dias, 10) || 7)
const teste = novaBarbeariaSaaS.plano.startsWith('Teste')
setBarbeariasSaaS([...barbeariasSaaS, {
id: novoId,
nome: novaBarbeariaSaaS.nome.trim(),
usuarioDono: novaBarbeariaSaaS.usuarioDono.trim(),
senhaDono: novaBarbeariaSaaS.senhaDono,
plano: novaBarbeariaSaaS.plano,
expiraEm: vit ? 0 : Date.now() + dias * DIA_MS,
diasRestantes: vit ? 9999 : dias,
statusPagamento: teste ? 'Pendente' : 'Pago',
statusSaaS: teste ? 'Em Teste' : 'Ativo',
ativo: true,
pro: novaBarbeariaSaaS.pro === 'sim'
}])
setNovaBarbeariaSaaS({ nome: '', usuarioDono: '', senhaDono: '', plano: 'Teste Grátis', dias: '7', pro: 'nao' })
}

const apagarBarbearia = (id) => {
const b = barbeariasSaaS.find(x => x.id === id)
if (!window.confirm(`Apagar a barbearia "${b?.nome}"? Essa ação não pode ser desfeita.`)) return
setBarbeariasSaaS(barbeariasSaaS.filter(x => x.id !== id))
}

// Atalho: soma dias à validade atual (ou a partir de agora, se já venceu)
const alterarLicencaRapida = (id, dias, novoPlano, statusPag) => {
setBarbeariasSaaS(barbeariasSaaS.map(b => {
if (b.id !== id) return b
const info = licencaInfo(b)
const base = info.expiraEm && info.expiraEm > Date.now() ? info.expiraEm : Date.now()
const novo = base + dias * DIA_MS
return { ...b, plano: novoPlano, expiraEm: novo, diasRestantes: Math.ceil((novo - Date.now()) / DIA_MS), statusPagamento: statusPag, statusSaaS: 'Ativo', ativo: true }
}))
}

const iniciarEdicaoLicenca = (b) => {
const info = licencaInfo(b)
const planoNorm = String(b.plano || '').startsWith('Teste') ? 'Teste Grátis' : (PLANOS.includes(b.plano) ? b.plano : 'Mensal')
setEditandoLicId(b.id)
setLicEdit({
plano: planoNorm,
dias: info.diasRest !== null ? String(info.diasRest) : '',
ate: paraInputDataHora(info.expiraEm || Date.now() + 7 * DIA_MS),
ativo: info.ativo ? 'sim' : 'nao',
pro: b.pro ? 'sim' : 'nao'
})
}

const definirDuracaoLicenca = (valor) => {
const n = Number(valor)
setLicEdit({ ...licEdit, dias: valor, ate: valor && n > 0 ? paraInputDataHora(Date.now() + n * DIA_MS) : licEdit.ate })
}

const salvarLicenca = (id) => {
const vit = licEdit.plano === 'Vitalício'
let expiraEm = 0
if (!vit) {
const t = new Date(licEdit.ate).getTime()
if (!licEdit.ate || isNaN(t)) {
alert('Informe até quando a licença vale (data e hora).')
return
}
expiraEm = t
}
const teste = licEdit.plano.startsWith('Teste')
setBarbeariasSaaS(barbeariasSaaS.map(b => b.id === id ? {
...b,
plano: licEdit.plano,
expiraEm,
diasRestantes: vit ? 9999 : Math.max(0, Math.ceil((expiraEm - Date.now()) / DIA_MS)),
ativo: licEdit.ativo === 'sim',
pro: licEdit.pro === 'sim',
statusPagamento: teste ? 'Pendente' : 'Pago',
statusSaaS: licEdit.ativo === 'sim' ? (teste ? 'Em Teste' : 'Ativo') : 'Inativo'
} : b))
setEditandoLicId(null)
}

// Ranking regional: o ADM libera (ou bloqueia) cada barbeiro
const alternarRegional = (id) => {
setBarbeiros(barbeiros.map(b => b.id === id ? { ...b, regionalLiberado: !b.regionalLiberado, regionalDesde: !b.regionalLiberado ? Date.now() : null } : b))
}

// Zerar lançamentos (começar a gravar do zero)
const zerarLancamentos = () => {
if (!window.confirm('Isso vai APAGAR todos os lançamentos do histórico e ZERAR o faturamento de todos os barbeiros. Não dá para desfazer. Deseja continuar?')) return
const confirmacao = window.prompt('Para confirmar, digite ZERAR (em maiúsculas):')
if (confirmacao !== 'ZERAR') {
alert('Cancelado. Nada foi alterado.')
return
}
setLancamentos([])
setBarbeiros(barbeiros.map(b => ({ ...b, faturamento: 0 })))
alert('Pronto! Lançamentos e faturamentos zerados. A partir de agora tudo fica gravado.')
}

// ===== Versão Pro =====
const donoRegistro = barbeariasSaaS.find(b => b.id === barbeariaLogada?.id)
const donoPro = !!donoRegistro?.pro
const nomeDaBarbearia = (id) => barbeariasSaaS.find(x => x.id === id)?.nome || ''
const nomeBarbeiroPorId = (id) => barbeiros.find(b => b.id === id)?.nome || '(removido)'
const proDoBarbeiro = (idBarbeiro) => {
const bb = barbeiros.find(x => x.id === idBarbeiro)
// Barbeiros antigos (sem barbearia vinculada) usam a barbearia Pro ativa
const reg = barbeariasSaaS.find(x => x.id === bb?.barbeariaId) || barbeariasSaaS.find(x => x.pro && x.ativo !== false)
return !!reg?.pro
}

const adicionarItemCatalogo = (e) => {
e.preventDefault()
const preco = Math.round(parseFloat(novoItem.preco) * 100)
if (!novoItem.nome.trim() || isNaN(preco) || preco < 0) {
alert('Informe o nome e o preço do item.')
return
}
const novoId = Math.max(0, ...catalogoExtras.map(i => i.id)) + 1
setCatalogoExtras([...catalogoExtras, { id: novoId, tipo: novoItem.tipo, nome: novoItem.nome.trim(), preco }])
setNovoItem({ tipo: novoItem.tipo, nome: '', preco: '' })
}

const apagarItemCatalogo = (item) => {
if (!window.confirm(`Apagar "${item.nome}" do catálogo? As vendas já lançadas continuam no histórico.`)) return
setCatalogoExtras(catalogoExtras.filter(i => i.id !== item.id))
}

const lancarVendaExtra = (e) => {
e.preventDefault()
const item = catalogoExtras.find(i => i.id === Number(vendaExtra.itemId))
const qtd = parseInt(vendaExtra.qtd, 10)
if (!vendaExtra.barbeiroId || !item || isNaN(qtd) || qtd <= 0) {
alert('Escolha o barbeiro, o item e uma quantidade válida.')
return
}
const novoId = Math.max(0, ...vendasExtras.map(v => v.id)) + 1
setVendasExtras([...vendasExtras, {
id: novoId,
barbeiroId: Number(vendaExtra.barbeiroId),
itemId: item.id,
nome: item.nome,
tipo: item.tipo,
qtd,
valorUnit: item.preco,
total: item.preco * qtd,
data: vendaExtra.data || hojeISO()
}])
setVendaExtra({ ...vendaExtra, itemId: '', qtd: '1' })
}

const apagarVendaExtra = (v) => {
if (!window.confirm(`Apagar a venda de ${v.qtd}x ${v.nome} (${dinheiroBR(v.total)}) do dia ${formatarData(v.data)}?`)) return
setVendasExtras(vendasExtras.filter(x => x.id !== v.id))
}

const zerarVendasExtras = () => {
if (!window.confirm('Apagar TODAS as vendas extras lançadas? Não dá para desfazer.')) return
if (window.prompt('Para confirmar, digite ZERAR (em maiúsculas):') !== 'ZERAR') {
alert('Cancelado. Nada foi alterado.')
return
}
setVendasExtras([])
}

const criarCompeticao = (e) => {
e.preventDefault()
if (!novaCompeticao.titulo.trim()) return
if (novaCompeticao.fim < novaCompeticao.inicio) {
alert('A data final não pode ser antes da data inicial.')
return
}
const novoId = Math.max(0, ...competicoesPro.map(c => c.id)) + 1
setCompeticoesPro([...competicoesPro, { id: novoId, ...novaCompeticao, titulo: novaCompeticao.titulo.trim() }])
setNovaCompeticao({ ...novaCompeticao, titulo: '', premio: '' })
}

const apagarCompeticao = (c) => {
if (!window.confirm(`Apagar a competição "${c.titulo}"?`)) return
setCompeticoesPro(competicoesPro.filter(x => x.id !== c.id))
}

// TELA DE CARREGAMENTO (espera os dados chegarem da nuvem)
if (!(ok1 && ok2 && ok3 && ok4 && ok5 && ok6 && ok7 && ok8 && ok9 && ok10)) {
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

// CONFIGURAÇÕES (dono e barbeiro): perfil + trocar senha
const renderConfiguracao = () => {
const ehDono = perfilAtivo === 'dono'
const donoAtual = barbeariasSaaS.find(b => b.id === barbeariaLogada?.id)
const barbeiroAtualCfg = barbeiros.find(b => b.id === barbeiroLogado?.id)
const nomeExibido = ehDono ? (donoAtual?.nome || barbeariaLogada?.nome || 'Barbearia') : barbeiroAtualCfg?.nome
const usuarioExibido = ehDono ? donoAtual?.usuarioDono : barbeiroAtualCfg?.telefone
const podeTrocar = ehDono ? !!donoAtual : !!barbeiroAtualCfg

return (
<section className="card big-card" style={{ maxWidth: '560px' }}>
<h2>⚙️ Configurações</h2>
<p className="subtitle">
{ehDono ? 'Barbearia' : 'Profissional'}: <strong>{nomeExibido}</strong>
{usuarioExibido ? <> &nbsp;|&nbsp; Login: <strong>{usuarioExibido}</strong></> : null}
</p>

{ehDono && donoAtual && (() => {
const info = licencaInfo(donoAtual)
return (
<div style={{ marginTop: '16px', padding: '14px', borderRadius: '10px', background: '#0d0d0d', border: '1px solid #C6A15B' }}>
<h3>📦 Seu plano</h3>
<p style={{ marginTop: '6px' }}>Plano: <strong>{donoAtual.plano}</strong> — <span className={`badge ${info.classe}`}>{info.rotulo}</span></p>
<p>Válido até: <strong>{info.vitalicio ? '✨ Vitalício' : (info.expiraEm ? `${formatarDataHora(info.expiraEm)} (${info.diasRest} dia(s))` : '—')}</strong></p>
<p>Versão Pro: <strong>{donoAtual.pro ? '⭐ Liberada' : '🔒 Bloqueada — fale com o administrador para liberar'}</strong></p>
</div>
)
})()}

<h3 style={{ marginTop: '16px' }}>🔑 Trocar senha</h3>
{!podeTrocar ? (
<p className="subtitle">Esta conta usa o acesso padrão e não pode trocar a senha por aqui. Peça ao Super Admin para cadastrar a barbearia.</p>
) : (
<form onSubmit={trocarSenha} className="login-form" style={{ marginTop: '10px' }}>
<div className="form-group">
<label>Senha atual</label>
<input type="password" value={formSenha.atual} onChange={(e) => setFormSenha({ ...formSenha, atual: e.target.value })} required />
</div>
<div className="form-group">
<label>Nova senha</label>
<input type="password" value={formSenha.nova} onChange={(e) => setFormSenha({ ...formSenha, nova: e.target.value })} required />
</div>
<div className="form-group">
<label>Confirmar nova senha</label>
<input type="password" value={formSenha.confirmar} onChange={(e) => setFormSenha({ ...formSenha, confirmar: e.target.value })} required />
</div>
{msgSenha.texto && (
<span style={{ color: msgSenha.tipo === 'ok' ? '#34d399' : '#f87171', fontSize: '0.9rem' }}>{msgSenha.texto}</span>
)}
<button type="submit" className="login-btn">Salvar nova senha</button>
</form>
)}
</section>
)
}

// ===== TELAS DA VERSÃO PRO =====
const renderBloqueioPro = (titulo, quem) => (
<section className="card big-card" style={{ maxWidth: '640px', textAlign: 'center', border: '2px dashed #C6A15B' }}>
<div style={{ fontSize: '3rem' }}>🔒</div>
<h2>{titulo}</h2>
<p className="subtitle">Este recurso faz parte da <strong>versão Pro</strong> do AS GESTÃO.</p>
<ul style={{ textAlign: 'left', margin: '16px auto', maxWidth: '440px', lineHeight: 1.9, listStyle: 'none', padding: 0 }}>
<li>✂️ Cadastro de serviços extras e produtos</li>
<li>🛒 Lançamento de vendas extras por barbeiro</li>
<li>📈 O que cada barbeiro mais vendeu</li>
<li>🏆 Competições e metas com serviços extras e produtos</li>
</ul>
<p className="subtitle">{quem}</p>
</section>
)

const renderExtrasDono = () => {
if (!donoPro) return renderBloqueioPro('Serviços Extras & Produtos', 'Para liberar, fale com o administrador do AS GESTÃO.')
const vendasOrdenadas = [...vendasExtras].sort((a, b) => (b.data || '').localeCompare(a.data || '') || b.id - a.id)
const totalGeral = vendasExtras.reduce((acc, v) => acc + v.total, 0)
const topServicos = maisVendidos(vendasExtras, 'servico').slice(0, 5)
const topProdutos = maisVendidos(vendasExtras, 'produto').slice(0, 5)
const porBarbeiro = rankingExtras(vendasExtras, barbeiros, 'valor')

return (
<div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
<section className="kpi-grid">
<div className="card kpi-card"><h3>Total vendido em extras</h3><p className="kpi-value">{dinheiroBR(totalGeral)}</p></div>
<div className="card kpi-card"><h3>Itens no catálogo</h3><p className="kpi-value">{catalogoExtras.length}</p></div>
<div className="card kpi-card"><h3>Vendas lançadas</h3><p className="kpi-value">{vendasExtras.length}</p></div>
</section>

<div className="grid-duplo">
<section className="card big-card">
<h2>📋 Catálogo de Serviços Extras e Produtos</h2>
<form onSubmit={adicionarItemCatalogo} className="login-form" style={{ marginBottom: '16px' }}>
<div className="form-group">
<label>Tipo</label>
<select value={novoItem.tipo} onChange={(e) => setNovoItem({ ...novoItem, tipo: e.target.value })} className="select-input">
<option value="servico">✂️ Serviço extra</option>
<option value="produto">🛍️ Produto</option>
</select>
</div>
<div className="form-group"><label>Nome</label><input type="text" placeholder="Ex: Hidratação, Pomada modeladora" value={novoItem.nome} onChange={(e) => setNovoItem({ ...novoItem, nome: e.target.value })} required /></div>
<div className="form-group"><label>Preço (R$)</label><input type="number" step="0.01" min="0" placeholder="Ex: 35.00" value={novoItem.preco} onChange={(e) => setNovoItem({ ...novoItem, preco: e.target.value })} required /></div>
<button type="submit" className="login-btn">Adicionar ao catálogo</button>
</form>

<table className="custom-table">
<thead><tr><th>Tipo</th><th>Item</th><th>Preço</th><th>Ações</th></tr></thead>
<tbody>
{catalogoExtras.length === 0 && <tr><td colSpan={4}>Nenhum item cadastrado ainda.</td></tr>}
{catalogoExtras.map(i => (
<tr key={i.id}>
<td>{rotuloTipo(i.tipo)}</td>
<td><strong>{i.nome}</strong></td>
<td className="gold-txt">{dinheiroBR(i.preco)}</td>
<td><button onClick={() => apagarItemCatalogo(i)} className="btn-sm btn-red">Apagar</button></td>
</tr>
))}
</tbody>
</table>
</section>

<section className="card big-card">
<h2>🛒 Lançar Venda Extra</h2>
<p className="subtitle">Registra o que o barbeiro vendeu (serviço extra ou produto).</p>
<form onSubmit={lancarVendaExtra} className="login-form">
<div className="form-group">
<label>Barbeiro</label>
<select value={vendaExtra.barbeiroId} onChange={(e) => setVendaExtra({ ...vendaExtra, barbeiroId: e.target.value })} className="select-input" required>
<option value="">-- Escolher --</option>
{barbeiros.map(b => <option key={b.id} value={b.id}>{b.nome} ({b.unidade})</option>)}
</select>
</div>
<div className="form-group">
<label>Item</label>
<select value={vendaExtra.itemId} onChange={(e) => setVendaExtra({ ...vendaExtra, itemId: e.target.value })} className="select-input" required>
<option value="">{catalogoExtras.length === 0 ? '-- Cadastre itens no catálogo primeiro --' : '-- Escolher --'}</option>
{catalogoExtras.map(i => <option key={i.id} value={i.id}>{rotuloTipo(i.tipo)} — {i.nome} ({dinheiroBR(i.preco)})</option>)}
</select>
</div>
<div className="form-group"><label>Quantidade</label><input type="number" min="1" step="1" value={vendaExtra.qtd} onChange={(e) => setVendaExtra({ ...vendaExtra, qtd: e.target.value })} required /></div>
<div className="form-group"><label>Data</label><input type="date" value={vendaExtra.data} onChange={(e) => setVendaExtra({ ...vendaExtra, data: e.target.value })} required /></div>
<button type="submit" className="login-btn">Lançar venda extra</button>
</form>
</section>
</div>

<div className="grid-duplo">
<section className="card big-card">
<h2>📈 Mais vendidos</h2>
<h3 style={{ marginTop: '10px' }}>✂️ Serviços extras</h3>
<ul className="ranking-list">
{topServicos.length === 0 && <li>Sem vendas ainda.</li>}
{topServicos.map((i, idx) => <li key={i.nome}><span><strong>#{idx + 1}</strong> {i.nome}</span><span className="gold-txt">{i.qtd} un. • {dinheiroBR(i.total)}</span></li>)}
</ul>
<h3 style={{ marginTop: '14px' }}>🛍️ Produtos</h3>
<ul className="ranking-list">
{topProdutos.length === 0 && <li>Sem vendas ainda.</li>}
{topProdutos.map((i, idx) => <li key={i.nome}><span><strong>#{idx + 1}</strong> {i.nome}</span><span className="gold-txt">{i.qtd} un. • {dinheiroBR(i.total)}</span></li>)}
</ul>
</section>

<section className="card big-card">
<h2>🏅 Quem mais vendeu (extras)</h2>
<ul className="ranking-list" style={{ marginTop: '10px' }}>
{porBarbeiro.length === 0 && <li>Nenhum barbeiro cadastrado.</li>}
{porBarbeiro.map((r, idx) => (
<li key={r.barbeiro.id}>
<span><strong>#{idx + 1}</strong> {r.barbeiro.nome} <span className="badge-success" style={{ fontSize: '0.7rem', marginLeft: '6px' }}>📍 {r.barbeiro.unidade}</span></span>
<span className="gold-txt">{r.qtd} un. • {dinheiroBR(r.total)}</span>
</li>
))}
</ul>
</section>
</div>

<section className="card big-card">
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
<h2>📜 Histórico de vendas extras</h2>
<button type="button" onClick={zerarVendasExtras} className="btn-sm btn-red">🧹 Zerar vendas extras</button>
</div>
<div style={{ overflowX: 'auto' }}>
<table className="custom-table" style={{ marginTop: '10px' }}>
<thead><tr><th>Data</th><th>Barbeiro</th><th>Item</th><th>Qtd</th><th>Total</th><th>Ações</th></tr></thead>
<tbody>
{vendasOrdenadas.length === 0 && <tr><td colSpan={6}>Nenhuma venda extra lançada.</td></tr>}
{vendasOrdenadas.map(v => (
<tr key={v.id}>
<td>{formatarData(v.data)}</td>
<td><strong>{nomeBarbeiroPorId(v.barbeiroId)}</strong></td>
<td>{rotuloTipo(v.tipo)} — {v.nome}</td>
<td>{v.qtd}</td>
<td className="gold-txt">{dinheiroBR(v.total)}</td>
<td><button onClick={() => apagarVendaExtra(v)} className="btn-sm btn-red">Apagar</button></td>
</tr>
))}
</tbody>
</table>
</div>
</section>
</div>
)
}

const renderCompeticoesDono = () => {
if (!donoPro) return renderBloqueioPro('Competições de Extras', 'Para liberar, fale com o administrador do AS GESTÃO.')
return (
<div className="grid-duplo">
<section className="card big-card">
<h2>🏆 Nova competição</h2>
<p className="subtitle">Quem vender mais (em quantidade ou valor) dentro do período ganha o prêmio.</p>
<form onSubmit={criarCompeticao} className="login-form">
<div className="form-group"><label>Título</label><input type="text" placeholder="Ex: Rei da Pomada — Novembro" value={novaCompeticao.titulo} onChange={(e) => setNovaCompeticao({ ...novaCompeticao, titulo: e.target.value })} required /></div>
<div className="form-group">
<label>O que conta na competição</label>
<select value={novaCompeticao.tipo} onChange={(e) => setNovaCompeticao({ ...novaCompeticao, tipo: e.target.value })} className="select-input">
<option value="todos">Serviços extras + Produtos</option>
<option value="servico">Só serviços extras</option>
<option value="produto">Só produtos</option>
</select>
</div>
<div className="form-group">
<label>Vence quem tiver mais</label>
<select value={novaCompeticao.metrica} onChange={(e) => setNovaCompeticao({ ...novaCompeticao, metrica: e.target.value })} className="select-input">
<option value="valor">Valor vendido (R$)</option>
<option value="quantidade">Quantidade de itens</option>
</select>
</div>
<div className="form-group"><label>Início</label><input type="date" value={novaCompeticao.inicio} onChange={(e) => setNovaCompeticao({ ...novaCompeticao, inicio: e.target.value })} required /></div>
<div className="form-group"><label>Fim</label><input type="date" value={novaCompeticao.fim} onChange={(e) => setNovaCompeticao({ ...novaCompeticao, fim: e.target.value })} required /></div>
<div className="form-group"><label>Prêmio</label><input type="text" placeholder="Ex: Vale R$ 200" value={novaCompeticao.premio} onChange={(e) => setNovaCompeticao({ ...novaCompeticao, premio: e.target.value })} /></div>
<button type="submit" className="login-btn">Criar competição</button>
</form>
</section>

<section className="card big-card">
<h2>📊 Competições</h2>
{competicoesPro.length === 0 && <p className="subtitle">Nenhuma competição criada ainda.</p>}
<div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
{[...competicoesPro].sort((a, b) => b.id - a.id).map(c => {
const ranking = rankingExtras(vendasDaCompeticao(c, vendasExtras), barbeiros, c.metrica)
const valorDe = (r) => (c.metrica === 'quantidade' ? r.qtd : r.total)
const max = Math.max(1, ...ranking.map(valorDe))
const status = statusCompeticao(c)
return (
<div key={c.id} style={{ padding: '12px', background: '#0d0d0d', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
<div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
<strong>{c.titulo}</strong>
<span className={`badge ${status === 'Encerrada' ? 'badge-danger' : 'badge-success'}`}>{status}</span>
</div>
<p className="subtitle" style={{ margin: '4px 0' }}>
{formatarData(c.inicio)} a {formatarData(c.fim)} • {c.tipo === 'todos' ? 'Serviços extras + Produtos' : c.tipo === 'servico' ? 'Só serviços extras' : 'Só produtos'} • por {c.metrica === 'quantidade' ? 'quantidade' : 'valor'}
{c.premio ? ` • 🎁 ${c.premio}` : ''}
</p>
<ul className="ranking-list" style={{ marginTop: '8px' }}>
{ranking.map((r, idx) => (
<li key={r.barbeiro.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
<div style={{ display: 'flex', justifyContent: 'space-between' }}>
<span><strong>{idx === 0 && valorDe(r) > 0 ? '🥇' : `#${idx + 1}`}</strong> {r.barbeiro.nome} <small style={{ color: '#9ca3af' }}>({r.barbeiro.unidade})</small></span>
<span className="gold-txt">{c.metrica === 'quantidade' ? `${r.qtd} un.` : dinheiroBR(r.total)}</span>
</div>
<div style={{ background: '#222', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
<div style={{ width: `${(valorDe(r) / max) * 100}%`, background: '#C6A15B', height: '100%' }}></div>
</div>
</li>
))}
</ul>
<button onClick={() => apagarCompeticao(c)} className="btn-sm btn-red" style={{ marginTop: '8px' }}>Apagar competição</button>
</div>
)
})}
</div>
</section>
</div>
)
}

const renderExtrasBarbeiro = (barbeiroAtual) => {
if (!proDoBarbeiro(barbeiroAtual?.id)) return renderBloqueioPro('Meus Extras & Produtos', 'Peça ao dono da barbearia para liberar a versão Pro.')
const minhas = vendasExtras.filter(v => v.barbeiroId === barbeiroAtual.id)
const totalMeu = minhas.reduce((acc, v) => acc + v.total, 0)
const qtdMeu = minhas.reduce((acc, v) => acc + v.qtd, 0)
const meusServicos = maisVendidos(minhas, 'servico').slice(0, 5)
const meusProdutos = maisVendidos(minhas, 'produto').slice(0, 5)
const rankGeral = rankingExtras(vendasExtras, barbeiros, 'valor')
const minhaPos = rankGeral.findIndex(r => r.barbeiro.id === barbeiroAtual.id) + 1
const competicoesAtivas = competicoesPro.filter(c => statusCompeticao(c) === 'Em andamento')

return (
<div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
<section className="kpi-grid">
<div className="card kpi-card"><h3>Meus extras vendidos</h3><p className="kpi-value">{dinheiroBR(totalMeu)}</p></div>
<div className="card kpi-card"><h3>Itens que vendi</h3><p className="kpi-value">{qtdMeu}</p></div>
<div className="card kpi-card"><h3>Minha posição em extras</h3><p className="kpi-value">{minhaPos > 0 ? `#${minhaPos} de ${rankGeral.length}` : '-'}{minhaPos === 1 && totalMeu > 0 ? ' 👑' : ''}</p></div>
</section>

<div className="grid-duplo">
<section className="card big-card">
<h2>✂️ O que eu mais vendi</h2>
<h3 style={{ marginTop: '10px' }}>Serviços extras</h3>
<ul className="ranking-list">
{meusServicos.length === 0 && <li>Você ainda não vendeu serviços extras.</li>}
{meusServicos.map((i, idx) => <li key={i.nome}><span><strong>#{idx + 1}</strong> {i.nome}</span><span className="gold-txt">{i.qtd} un. • {dinheiroBR(i.total)}</span></li>)}
</ul>
<h3 style={{ marginTop: '14px' }}>Produtos</h3>
<ul className="ranking-list">
{meusProdutos.length === 0 && <li>Você ainda não vendeu produtos.</li>}
{meusProdutos.map((i, idx) => <li key={i.nome}><span><strong>#{idx + 1}</strong> {i.nome}</span><span className="gold-txt">{i.qtd} un. • {dinheiroBR(i.total)}</span></li>)}
</ul>
</section>

<section className="card big-card">
<h2>🏅 Quem vendeu mais</h2>
<ul className="ranking-list" style={{ marginTop: '10px' }}>
{rankGeral.map((r, idx) => (
<li key={r.barbeiro.id} className={r.barbeiro.id === barbeiroAtual.id ? 'destaque-barbeiro' : ''}>
<span><strong>{idx === 0 && r.total > 0 ? '🥇' : `#${idx + 1}`}</strong> {r.barbeiro.nome}{r.barbeiro.id === barbeiroAtual.id ? ' (você)' : ''} <span className="badge-success" style={{ fontSize: '0.7rem', marginLeft: '6px' }}>📍 {r.barbeiro.unidade}</span></span>
<span className="gold-txt">{r.qtd} un. • {dinheiroBR(r.total)}</span>
</li>
))}
</ul>
</section>
</div>

{competicoesAtivas.length > 0 && (
<section className="card big-card" style={{ border: '2px solid #C6A15B' }}>
<h2>🏆 Competições em andamento</h2>
{competicoesAtivas.map(c => {
const ranking = rankingExtras(vendasDaCompeticao(c, vendasExtras), barbeiros, c.metrica)
const pos = ranking.findIndex(r => r.barbeiro.id === barbeiroAtual.id) + 1
const meu = ranking.find(r => r.barbeiro.id === barbeiroAtual.id)
return (
<div key={c.id} style={{ padding: '12px', background: '#0d0d0d', borderRadius: '8px', marginTop: '10px' }}>
<strong>{c.titulo}</strong>
<p className="subtitle" style={{ margin: '4px 0' }}>Até {formatarData(c.fim)}{c.premio ? ` • 🎁 ${c.premio}` : ''}</p>
<p>Sua posição: <strong>#{pos} de {ranking.length}</strong> • você tem <strong>{c.metrica === 'quantidade' ? `${meu?.qtd || 0} un.` : dinheiroBR(meu?.total || 0)}</strong></p>
<ul className="ranking-list" style={{ marginTop: '6px' }}>
{ranking.slice(0, 3).map((r, idx) => (
<li key={r.barbeiro.id}><span><strong>#{idx + 1}</strong> {r.barbeiro.nome}</span><span className="gold-txt">{c.metrica === 'quantidade' ? `${r.qtd} un.` : dinheiroBR(r.total)}</span></li>
))}
</ul>
</div>
)
})}
</section>
)}
</div>
)
}

const renderRegionalBarbeiro = (barbeiroAtual) => {
if (!barbeiroAtual?.regionalLiberado) {
return (
<section className="card big-card" style={{ maxWidth: '640px', textAlign: 'center', border: '2px dashed #7c3aed' }}>
<div style={{ fontSize: '3rem' }}>🔒</div>
<h2>Ranking Regional</h2>
<p className="subtitle">Para participar do ranking regional você precisa da <strong>liberação do administrador do AS GESTÃO</strong>, feita mediante pagamento.</p>
<p className="subtitle">Fale com o administrador ou com o dono da sua barbearia para solicitar.</p>
</section>
)
}
const lista = barbeiros.filter(b => b.regionalLiberado).sort((a, b) => b.faturamento - a.faturamento)
const posicao = lista.findIndex(b => b.id === barbeiroAtual.id) + 1
const camps = campeonatosRegionais.filter(c => c.ativo)
return (
<section className="card big-card" style={{ border: '2px dashed #7c3aed', background: 'rgba(124, 58, 237, 0.05)' }}>
<h2>🌎 RANKING REGIONAL</h2>
{camps.map(c => <p key={c.id} className="subtitle">🏆 {c.titulo} — Prêmio: {c.premio}</p>)}
<p style={{ margin: '8px 0' }}>Sua posição: <strong>#{posicao} de {lista.length}</strong></p>
<ul className="ranking-list" style={{ marginTop: '10px' }}>
{lista.map((b, idx) => (
<li key={b.id} className={b.id === barbeiroAtual.id ? 'destaque-barbeiro' : ''}>
<span><strong>{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}</strong> {b.nome}{b.id === barbeiroAtual.id ? ' (você)' : ''} <small style={{ color: '#9ca3af' }}>({[nomeDaBarbearia(b.barbeariaId), b.unidade].filter(Boolean).join(' • ')})</small></span>
<span className="gold-txt">{b.id === barbeiroAtual.id ? dinheiroBR(b.faturamento) : '*** Oculto'}</span>
</li>
))}
</ul>
</section>
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
<div className="card kpi-card"><h3>Contas Pro ⭐</h3><p className="kpi-value">{barbeariasSaaS.filter(b => b.pro).length}</p></div>
</section>
)
case 1:
return (
<div className="grid-duplo" style={{ gridTemplateColumns: '1.8fr 1fr' }}>
<section className="card big-card">
<h2>Gestão de Licenças & Acessos</h2>
<p className="subtitle">Defina a duração do teste, até que horas a licença vale, se está ativa e se a barbearia tem a versão Pro.</p>
<div style={{ overflowX: 'auto' }}>
<table className="custom-table">
<thead><tr><th>Barbearia</th><th>Plano</th><th>Situação</th><th>Válido até</th><th>Pro</th><th>Ações</th></tr></thead>
<tbody>
{barbeariasSaaS.map(b => {
const info = licencaInfo(b)
const emEdicao = editandoLicId === b.id
return (
<Fragment key={
...