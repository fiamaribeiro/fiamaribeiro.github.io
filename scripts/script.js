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
