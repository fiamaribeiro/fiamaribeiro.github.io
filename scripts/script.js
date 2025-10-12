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

// ===== Projetos: cards resumidos (fonte: projects.json)
(async function loadProjects(){
  const container = document.getElementById("repo-grid");
  if(!container) return;
  try{
    const res = await fetch("projects.json", { cache: "no-store" });
    const items = await res.json();

    container.innerHTML = items.map(p => `
      <article class="card proj">
        <img src="${p.thumb || 'assets/thumbs/placeholder.jpg'}" alt="${p.title}" class="thumb">
        <h3>${p.title}</h3>
        <p>${p.summary}</p>
        <div class="meta">${(p.tags||[]).map(t=>`<span>${t}</span>`).join('')}</div>
        <div class="actions">
          <a class="btn small" href="${p.case}">Ver case completo</a>
          ${p.repo ? `<a class="btn small outline" target="_blank" rel="noopener" href="${p.repo}">Repositório</a>` : ``}
        </div>
      </article>
    `).join("");
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

  async function fetchRepos(sort="updated"){
    grid.innerHTML = "<p class='muted'>Carregando repositórios…</p>";
    msg.textContent = "";
    try{
      // pega até 100 repos (padrão suficiente p/ portfólio)
      const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=${sort}&direction=desc`);
      if(!res.ok) throw new Error("Falha ao consultar a API do GitHub");
      const data = await res.json();
      // ordena por estrelas como fallback caso equal
      repos = data.sort((a,b) => (b.stargazers_count||0) - (a.stargazers_count||0));
      applyFilters();
    }catch(e){
      console.warn(e);
      grid.innerHTML = "";
      msg.textContent = "Não foi possível carregar os repositórios agora.";
    }
  }

  function applyFilters(){
    const q = (searchInput?.value || "").toLowerCase().trim();
    const showForks = forksToggle?.checked || false;

    view = repos
      .filter(r => showForks ? true : !r.fork)         // oculta forks por padrão
      .filter(r => !r.archived)                        // oculta arquivados
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
      const homepage = r.homepage && r.homepage.startsWith("http") ? r.homepage : null;
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

  // Eventos de UI
  searchInput && searchInput.addEventListener("input", applyFilters);
  forksToggle && forksToggle.addEventListener("change", applyFilters);
  sortSelect && sortSelect.addEventListener("change", () => fetchRepos(sortSelect.value));

  // inicial
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
