// ===== Tema Claro/Escuro com persistência
(function initTheme(){
  const saved = localStorage.getItem("theme");
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  const initial = saved || (prefersLight ? "light" : "dark");
  document.documentElement.setAttribute("data-theme", initial);
  const btn = document.getElementById("themeToggle");
  if (btn) {
    btn.textContent = initial === "light" ? "🌞" : "🌙";
    btn.addEventListener("click", () => {
      const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
      btn.textContent = next === "light" ? "🌞" : "🌙";
    });
  }
})();

// ===== Ano no rodapé
const y = document.getElementById("year");
if (y) y.textContent = new Date().getFullYear();

// ===== Projetos curados (carrega projects.json com tolerância de chaves)
(async function loadCuratedProjects(){
  const container = document.getElementById("repo-grid"); // seção "Projetos"
  if (!container) return;

  function norm(p){
    const title   = p.title   ?? p.titulo   ?? "Projeto sem título";
    const summary = p.summary ?? p.descricao ?? "Sem descrição.";
    const tags    = Array.isArray(p.tags) ? p.tags : [];
    const caseUrl = p.case    ?? p.linkCase ?? "#";
    const repoUrl = p.repo    ?? p.linkRepo ?? "";
    const thumb   = p.thumb   ?? p.imagem   ?? "assets/thumbs/placeholder.jpg";
    return { title, summary, tags, caseUrl, repoUrl, thumb };
  }

  try{
    const res = await fetch("projects.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`Falha ao carregar projects.json: ${res.status}`);
    const items = await res.json();

    const html = (Array.isArray(items) ? items : []).map(raw => {
      const p = norm(raw);
      return `
        <article class="card proj">
          <img src="${p.thumb}" alt="${p.title}" class="thumb"
               onerror="this.src='assets/thumbs/placeholder.jpg'">
          <h3>${p.title}</h3>
          <p>${p.summary}</p>
          <div class="meta">${(p.tags||[]).map(t=>`<span>${t}</span>`).join('')}</div>
          <div class="actions">
            ${p.caseUrl ? `<a class="btn small" href="${p.caseUrl}">Ver case completo</a>` : ``}
            ${p.repoUrl ? `<a class="btn small outline" target="_blank" rel="noopener" href="${p.repoUrl}">Repositório</a>` : ``}
          </div>
        </article>
      `;
    }).join("");

    container.innerHTML = html || `<p class="muted">Ainda não há projetos curados para exibir.</p>`;
  }catch(e){
    console.warn("Falha ao carregar projects.json", e);
    container.innerHTML = `<p class="muted">Não foi possível carregar os projetos agora.</p>`;
  }
})();

// ===== Repositórios do GitHub (automático)
(async function loadGithubRepos(){
  const grid = document.getElementById("gh-grid");
  const msg = document.getElementById("gh-msg");
  if(!grid) return;

  const username = "fiamaribeiro"; // <- seu usuário GitHub
  const searchInput = document.getElementById("repo-search");
  const forksToggle = document.getElementById("repo-forks");
  const sortSelect = document.getElementById("repo-sort");

  let repos = [];
  let view = [];

  function setLoading(on=true){
    grid.innerHTML = on ? "<p class='muted'>Carregando repositórios…</p>" : "";
  }

  async function fetchRepos(sort="updated"){
    setLoading(true);
    msg.textContent = "";
    try{
      const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=${sort}&direction=desc`, {
        headers: { "Accept": "application/vnd.github+json" }
      });
      if(!res.ok) throw new Error("Falha ao consultar a API do GitHub");
      const data = await res.json();
      repos = data.sort((a,b) => (b.stargazers_count||0) - (a.stargazers_count||0));
      setLoading(false);
      applyFilters();
    }catch(e){
      console.warn(e);
      setLoading(false);
      grid.innerHTML = "";
      msg.textContent = "Não foi possível carregar os repositórios agora.";
    }
  }

  function applyFilters(){
    const q = (searchInput?.value || "").toLowerCase().trim();
    const showForks = forksToggle?.checked || false;

    view = repos
      .filter(r => showForks ? true : !r.fork)
      .filter(r => !r.archived)
      .filter(r => {
        if(!q) return true;
        const hay = `${r.name} ${r.description||""}`.toLowerCase();
        return hay.includes(q);
      });

    render();
  }

  function badgeList(r){
    const badges = [];
    if (r.language) badges.push(r.language);
    if (r.topics && r.topics.length) badges.push(...r.topics.slice(0,3));
    if (r.license && r.license.spdx_id) badges.push(r.license.spdx_id);
    return badges;
  }

  function render(){
    if(!view.length){
      grid.innerHTML = "<p class='muted'>Nenhum repositório encontrado com os filtros atuais.</p>";
      return;
    }
    grid.innerHTML = view.map(r => {
      const homepage = r.homepage && /^https?:\/\//i.test(r.homepage) ? r.homepage : null;
      const badges = badgeList(r).map(b=>`<span>${b}</span>`).join("");
      const desc = r.description ? r.description : "Sem descrição.";
      const stars = r.stargazers_count || 0;
      const updated = new Date(r.updated_at).toLocaleDateString();

      return `
        <article class="card repo-card">
          <h3>${r.name}</h3>
          <p>${desc}</p>
          <div class="meta">
            ${badges}
            <span>★ ${stars}</span>
            <span>Atualizado: ${updated}</span>
          </div>
          <div class="actions">
            <a class="btn small" target="_blank" rel="noopener" href="${r.html_url}">Repositório</a>
            ${homepage ? `<a class="btn small outline" target="_blank" rel="noopener" href="${homepage}">Demo</a>` : ``}
          </div>
        </article>
      `;
    }).join("");
  }

  searchInput && searchInput.addEventListener("input", applyFilters);
  forksToggle && forksToggle.addEventListener("change", applyFilters);
  sortSelect && sortSelect.addEventListener("change", () => fetchRepos(sortSelect.value));

  await fetchRepos(sortSelect ? sortSelect.value : "updated");
})();

// ===== Formulário: envio real via Formspree (progressive enhancement)
(function initForm(){
  const form = document.getElementById("contact-form");
  if(!form) return;
  const status = document.getElementById("form-status");

  form.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const data = new FormData(form);
    try{
      const res = await fetch(form.action, {
        method: form.method,
        body: data,
        headers: { "Accept": "application/json" }
      });
      if (res.ok){
        status.textContent = "✅ Mensagem enviada! Obrigada pelo contato.";
        form.reset();
      }else{
        status.textContent = "❌ Erro ao enviar. Tente novamente ou envie para fiama.ribeiro@fiama.tech";
      }
    }catch(err){
      status.textContent = "⚠️ Sem conexão. Tente novamente em instantes.";
    }
  });
})();
// === Menu mobile (hambúrguer) ===
(function initMobileMenu(){
  const btn  = document.getElementById('menuToggle');
  const nav  = document.getElementById('siteNav');
  if (!btn || !nav) return;

  const close = () => {
    document.body.classList.remove('nav-open');
    btn.setAttribute('aria-expanded', 'false');
  };
  const open = () => {
    document.body.classList.add('nav-open');
    btn.setAttribute('aria-expanded', 'true');
  };

  btn.addEventListener('click', () => {
    const opened = document.body.classList.contains('nav-open');
    opened ? close() : open();
  });

  // fecha ao clicar em qualquer link do menu
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', close));

  // fecha com ESC
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') close(); });
})();
