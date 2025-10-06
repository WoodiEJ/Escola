// script.js - client-side DB using plain text (JSON lines).
// Funcionalidade:
// - Salvar: adiciona registro à memória
// - Novo: limpa o form para novo registro
// - Limpar: apaga todos os registros da memória (precisa exportar se quiser salvar)
// - Exportar: baixa um arquivo db.txt com os registros (formato JSON por linha)
// - Carregar: carregar db.txt local e substituir os registros em memória

const form = document.getElementById('personForm');
const nome = document.getElementById('nome');
const profissao = document.getElementById('profissao');
const endereco = document.getElementById('endereco');
const lista = document.getElementById('lista');
const novoBtn = document.getElementById('novo');
const salvarBtn = document.getElementById('salvar');
const limparBtn = document.getElementById('limpar');
const loadDbBtn = document.getElementById('loadDbBtn');
const exportDbBtn = document.getElementById('exportDbBtn');
const filePicker = document.getElementById('filePicker');

let db = []; // array of objects

function renderList(){
  lista.innerHTML = '';
  if(db.length === 0){ lista.innerHTML = '<li style="color:#9aa8c8">Sem registros</li>'; return; }
  db.forEach((item, idx)=>{
    const li = document.createElement('li');
    const left = document.createElement('div');
    left.innerHTML = '<strong>'+escapeHtml(item.nome)+'</strong><div class="entry-meta">'+escapeHtml(item.profissao)+' • '+escapeHtml(item.endereco)+'</div>';
    const right = document.createElement('div');
    const del = document.createElement('button');
    del.textContent = 'Excluir';
    del.className = 'small-btn delete';
    del.onclick = ()=>{ if(confirm("Excluir este registro?")){ db.splice(idx,1); renderList(); } };
    right.appendChild(del);
    li.appendChild(left);
    li.appendChild(right);
    lista.appendChild(li);
  });
}

function escapeHtml(s){ return (s||'').toString().replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

novoBtn.addEventListener('click', ()=>{
  form.reset();
  nome.focus();
});

salvarBtn.addEventListener('click', ()=>{
  const n = nome.value.trim();
  const p = profissao.value.trim();
  const e = endereco.value.trim();
  if(!n){ alert('Preencha o nome.'); nome.focus(); return; }
  const entry = {nome:n, profissao:p, endereco:e, created: new Date().toISOString()};
  db.push(entry);
  renderList();
  form.reset();
  nome.focus();
});

limparBtn.addEventListener('click', ()=>{
  if(confirm('Apagar todos os registros da memória? Isso não altera arquivos no seu disco até você exportar.')){
    db = [];
    renderList();
  }
});

exportDbBtn.addEventListener('click', ()=>{
  if(db.length === 0){ if(!confirm('Não há registros. Deseja exportar um arquivo vazio mesmo assim?')) return; }
  const lines = db.map(it => JSON.stringify(it)).join('\n');
  const blob = new Blob([lines],'text/plain');
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'db.txt';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

loadDbBtn.addEventListener('click', ()=> filePicker.click());
filePicker.addEventListener('change', async (ev)=>{
  const f = ev.target.files[0];
  if(!f) return;
  const text = await f.text();
  // parse as JSON lines
  const lines = text.split(/\r?\n/).filter(Boolean);
  const parsed = [];
  for(const ln of lines){
    try{
      parsed.push(JSON.parse(ln));
    }catch(err){
      // ignore lines that are not json; try CSV-like (nome;profissao;endereco)
      const parts = ln.split(';').map(s=>s.trim());
      if(parts.length>=1 && parts.some(Boolean)){
        parsed.push({nome:parts[0]||'', profissao:parts[1]||'', endereco:parts[2]||''});
      }
    }
  }
  if(parsed.length===0 && lines.length>0 && !confirm('Não foram reconhecidos registros no arquivo. Substituir pela leitura bruta mesmo assim?')) return;
  db = parsed;
  renderList();
  filePicker.value = '';
});

// initial render
renderList();
