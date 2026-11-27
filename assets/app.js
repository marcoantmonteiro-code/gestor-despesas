const API = 'api';
const eur = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' });
const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

const state = {
  ano: new Date().getFullYear(),
  mes: new Date().getMonth() + 1,
  categorias: [],
  movimentos: [],
  resumo: null,
  chartCategorias: null,
  chartEvolucao: null,
};

const $ = (id) => document.getElementById(id);

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function api(url, options = {}) {
  const resposta = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    throw new Error(dados.erro || 'Ocorreu um erro.');
  }
  return dados;
}

function toast(mensagem, erro = false) {
  const el = $('toast');
  el.textContent = mensagem;
  el.className = `fixed bottom-5 right-5 z-[60] px-4 py-3 rounded-lg shadow-lg text-sm text-white ${erro ? 'bg-rose-600' : 'bg-zinc-900'}`;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.add('hidden'), 3000);
}

function preencherSeletores() {
  const seletorMes = $('seletor-mes');
  const seletorAno = $('seletor-ano');
  seletorMes.innerHTML = meses.map((nome, i) => `<option value="${i + 1}">${nome}</option>`).join('');
  const anoAtual = new Date().getFullYear();
  seletorAno.innerHTML = Array.from({ length: 8 }, (_, i) => anoAtual - 4 + i)
    .map((ano) => `<option value="${ano}">${ano}</option>`).join('');
  seletorMes.value = state.mes;
  seletorAno.value = state.ano;
}

function preencherCategoriasSelect() {
  const select = $('movimento-categoria');
  select.innerHTML = '<option value="">Sem categoria</option>' +
    state.categorias.filter((c) => Number(c.ativo) === 1)
      .map((c) => `<option value="${c.id}">${escapeHtml(c.nome)}</option>`).join('');
}

function renderKpis() {
  const r = state.resumo;
  if (!r) return;
  $('kpi-entradas').textContent = eur.format(r.entradas);
  $('kpi-saidas').textContent = eur.format(r.saidas);
  $('kpi-saldo').textContent = eur.format(r.saldo);
  $('kpi-saldo').className = `text-2xl font-semibold mt-2 ${r.saldo >= 0 ? 'text-emerald-600' : 'text-rose-600'}`;
  $('kpi-media').textContent = eur.format(r.media_diaria);
  $('kpi-desvio').textContent = eur.format(r.desvio_padrao);
}

function renderGraficos() {
  const r = state.resumo;
  if (!r) return;

  state.chartCategorias?.destroy();
  state.chartCategorias = new Chart($('chart-categorias'), {
    type: 'doughnut',
    data: {
      labels: r.por_categoria.length ? r.por_categoria.map((c) => c.nome) : ['Sem dados'],
      datasets: [{
        data: r.por_categoria.length ? r.por_categoria.map((c) => Number(c.total)) : [1],
        backgroundColor: r.por_categoria.length ? r.por_categoria.map((c) => c.cor) : ['#e4e4e7'],
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 10, usePointStyle: true } },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.label}: ${eur.format(ctx.raw)}`,
          },
        },
      },
    },
  });

  state.chartEvolucao?.destroy();
  state.chartEvolucao = new Chart($('chart-evolucao'), {
    type: 'bar',
    data: {
      labels: meses.map((m) => m.slice(0, 3)),
      datasets: [
        {
          label: 'Entradas',
          data: r.evolucao.map((m) => m.entradas),
          backgroundColor: '#10b981',
          borderRadius: 4,
        },
        {
          label: 'Saídas',
          data: r.evolucao.map((m) => m.saidas),
          backgroundColor: '#f43f5e',
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 10, usePointStyle: true } },
        tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${eur.format(ctx.raw)}` } },
      },
      scales: {
        y: { beginAtZero: true, grid: { color: '#f4f4f5' }, ticks: { callback: (v) => eur.format(v) } },
        x: { grid: { display: false } },
      },
    },
  });
}

function renderMovimentos() {
  const tbody = $('tabela-movimentos');
  const vazio = $('tabela-vazia');
  const filtro = $('filtro-texto').value.trim().toLowerCase();
  const tipo = $('filtro-tipo').value;

  const lista = state.movimentos.filter((m) => {
    const okTexto = !filtro || m.descricao.toLowerCase().includes(filtro);
    const okTipo = !tipo || m.tipo === tipo;
    return okTexto && okTipo;
  });

  vazio.classList.toggle('hidden', lista.length > 0);
  tbody.innerHTML = lista.map((m) => {
    const entrada = m.tipo === 'entrada';
    const data = new Date(m.data + 'T00:00:00').toLocaleDateString('pt-PT');
    return `
      <tr class="hover:bg-zinc-50">
        <td class="px-5 py-3 whitespace-nowrap text-zinc-600">${data}</td>
        <td class="px-5 py-3 font-medium">${escapeHtml(m.descricao)}</td>
        <td class="px-5 py-3">
          <span class="inline-flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full" style="background:${escapeHtml(m.categoria_cor || '#71717a')}"></span>
            ${escapeHtml(m.categoria_nome || 'Sem categoria')}
          </span>
        </td>
        <td class="px-5 py-3">
          <span class="text-xs font-medium px-2 py-1 rounded-full ${entrada ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}">
            ${entrada ? 'Entrada' : 'Saída'}
          </span>
        </td>
        <td class="px-5 py-3 text-right font-semibold ${entrada ? 'text-emerald-600' : 'text-rose-600'}">
          ${entrada ? '+' : '-'}${eur.format(m.valor)}
        </td>
        <td class="px-5 py-3 text-right whitespace-nowrap">
          <button data-editar-movimento="${m.id}" class="text-indigo-600 hover:text-indigo-800 text-sm font-medium mr-3">Editar</button>
          <button data-apagar-movimento="${m.id}" class="text-rose-600 hover:text-rose-800 text-sm font-medium">Apagar</button>
        </td>
      </tr>`;
  }).join('');
}

function renderCategorias() {
  const lista = $('lista-categorias');
  lista.innerHTML = state.categorias.map((c) => `
    <div class="bg-white rounded-xl border border-zinc-200 p-4 shadow-sm">
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-3">
          <span class="w-4 h-4 rounded-full" style="background:${escapeHtml(c.cor)}"></span>
          <div>
            <p class="font-medium">${escapeHtml(c.nome)}</p>
            <p class="text-xs text-zinc-500">${c.total_movimentos} movimento(s)</p>
          </div>
        </div>
        <span class="text-xs px-2 py-1 rounded-full ${Number(c.ativo) ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}">
          ${Number(c.ativo) ? 'Ativa' : 'Inativa'}
        </span>
      </div>
      <div class="flex gap-3 mt-4 text-sm">
        <button data-editar-categoria="${c.id}" class="text-indigo-600 hover:text-indigo-800 font-medium">Editar</button>
        <button data-apagar-categoria="${c.id}" class="text-rose-600 hover:text-rose-800 font-medium">Apagar</button>
      </div>
    </div>`).join('');
}

async function carregarTudo() {
  try {
    const query = `?ano=${state.ano}&mes=${state.mes}`;
    const [categorias, movimentos, resumo] = await Promise.all([
      api(`${API}/categorias.php`),
      api(`${API}/movimentos.php${query}`),
      api(`${API}/resumo.php${query}`),
    ]);
    state.categorias = categorias;
    state.movimentos = movimentos;
    state.resumo = resumo;
    preencherCategoriasSelect();
    renderKpis();
    renderGraficos();
    renderMovimentos();
    renderCategorias();
  } catch (erro) {
    toast(erro.message, true);
  }
}

function abrirModal(id) {
  $(id).classList.remove('hidden');
}

function fecharModal(id) {
  $(id).classList.add('hidden');
}

function abrirMovimento(movimento = null) {
  $('form-movimento').reset();
  $('movimento-id').value = movimento?.id || '';
  $('titulo-modal-movimento').textContent = movimento ? 'Editar movimento' : 'Novo movimento';
  $('movimento-descricao').value = movimento?.descricao || '';
  $('movimento-valor').value = movimento?.valor || '';
  $('movimento-data').value = movimento?.data || new Date().toISOString().slice(0, 10);
  $('movimento-tipo').value = movimento?.tipo || 'saida';
  $('movimento-categoria').value = movimento?.categoria_id || '';
  abrirModal('modal-movimento');
}

function abrirCategoria(categoria = null) {
  $('form-categoria').reset();
  $('categoria-id').value = categoria?.id || '';
  $('titulo-modal-categoria').textContent = categoria ? 'Editar categoria' : 'Nova categoria';
  $('categoria-nome').value = categoria?.nome || '';
  $('categoria-cor').value = categoria?.cor || '#71717a';
  abrirModal('modal-categoria');
}

$('seletor-mes').addEventListener('change', (e) => {
  state.mes = Number(e.target.value);
  carregarTudo();
});

$('seletor-ano').addEventListener('change', (e) => {
  state.ano = Number(e.target.value);
  carregarTudo();
});

$('btn-novo-movimento').addEventListener('click', () => abrirMovimento());
$('btn-nova-categoria').addEventListener('click', () => abrirCategoria());

document.querySelectorAll('[data-fechar-modal]').forEach((btn) => {
  btn.addEventListener('click', () => fecharModal(btn.dataset.fecharModal));
});

$('form-movimento').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = $('movimento-id').value;
  const payload = {
    descricao: $('movimento-descricao').value.trim(),
    valor: Number($('movimento-valor').value),
    data: $('movimento-data').value,
    tipo: $('movimento-tipo').value,
    categoria_id: $('movimento-categoria').value || null,
  };

  try {
    await api(`${API}/movimentos.php`, {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(id ? { ...payload, id: Number(id) } : payload),
    });
    fecharModal('modal-movimento');
    toast(id ? 'Movimento atualizado.' : 'Movimento adicionado.');
    await carregarTudo();
  } catch (erro) {
    toast(erro.message, true);
  }
});

$('form-categoria').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = $('categoria-id').value;
  const payload = {
    nome: $('categoria-nome').value.trim(),
    cor: $('categoria-cor').value,
  };

  try {
    await api(`${API}/categorias.php`, {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(id ? { ...payload, id: Number(id) } : payload),
    });
    fecharModal('modal-categoria');
    toast(id ? 'Categoria atualizada.' : 'Categoria criada.');
    await carregarTudo();
  } catch (erro) {
    toast(erro.message, true);
  }
});

$('tabela-movimentos').addEventListener('click', async (e) => {
  const editar = e.target.closest('[data-editar-movimento]');
  const apagar = e.target.closest('[data-apagar-movimento]');

  if (editar) {
    const movimento = state.movimentos.find((m) => Number(m.id) === Number(editar.dataset.editarMovimento));
    if (movimento) abrirMovimento(movimento);
  }

  if (apagar) {
    if (!confirm('Apagar este movimento?')) return;
    try {
      await api(`${API}/movimentos.php?id=${apagar.dataset.apagarMovimento}`, { method: 'DELETE' });
      toast('Movimento apagado.');
      await carregarTudo();
    } catch (erro) {
      toast(erro.message, true);
    }
  }
});

$('lista-categorias').addEventListener('click', async (e) => {
  const editar = e.target.closest('[data-editar-categoria]');
  const apagar = e.target.closest('[data-apagar-categoria]');

  if (editar) {
    const categoria = state.categorias.find((c) => Number(c.id) === Number(editar.dataset.editarCategoria));
    if (categoria) abrirCategoria(categoria);
  }

  if (apagar) {
    if (!confirm('Apagar esta categoria? Os movimentos associados ficam sem categoria.')) return;
    try {
      await api(`${API}/categorias.php?id=${apagar.dataset.apagarCategoria}`, { method: 'DELETE' });
      toast('Categoria apagada.');
      await carregarTudo();
    } catch (erro) {
      toast(erro.message, true);
    }
  }
});

$('filtro-texto').addEventListener('input', renderMovimentos);
$('filtro-tipo').addEventListener('change', renderMovimentos);

preencherSeletores();
carregarTudo();
