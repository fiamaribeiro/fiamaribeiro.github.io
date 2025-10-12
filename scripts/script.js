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
document.getElementById("year") && (document.getElementById("year").textContent = new Date().getFullYear());

// ===== Power BI dinâmico (carrega de powerbi.json)
(async function loadBI(){
  try{
    const res = await fetch("powerbi.json", { cache: "no-store" });
    if(!res.ok) return;
    const data = await res.json(); // [{title, src, desc, featured, tags}]
    const featured = data.find(d => d.featured);
    const others = data.filter(d => !d.featured);
    const featuredEl = document.getElementById("bi-featured");
    const gridEl = document.getElementById("bi-grid");

    if (featured && featuredEl){
      featuredEl.innerHTML = `
        <article class="card bi-card">
          <h3>${featured.title}</h3>
          <p class="muted">${featured.desc || ""}</p>
          <div class="bi-embed">
            <iframe title="${featured.title}" src="${featured.src}" allowfullscreen="true"></iframe>
          </div>
        </article>`;
    }

    if (gridEl){
      gridEl.innerHTML = others.map(o => `
        <article class="card bi-card">
          <h3>${o.title}</h3>
          <p class="muted">${o.desc || ""}</p>
          <div class="bi-embed">
            <iframe title="${o.title}" src="${o.src}" allowfullscreen="true"></iframe>
          </div>
        </article>
      `).join("");
    }
  }catch(e){ console.warn("Power BI load error:", e); }
})();

// ===== Formulário: envio real via Formspree
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
