async function loadReposFromJSON() {
  const grid = document.getElementById("repo-grid");
  if (!grid) return;
  try {
    const res = await fetch("/projects.json", { cache: "no-cache" });
    if (!res.ok) throw new Error("Falha ao carregar projects.json");
    const repos = await res.json();
    grid.innerHTML = repos.map(r => {
      const desc = r.description ? r.description.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])) : "Projeto sem descrição.";
      const lang = r.language ? `<span>${r.language}</span>` : "";
      const stars = `⭐ ${r.stargazers_count ?? 0}`;
      const updated = new Date(r.pushed_at).toLocaleDateString("pt-BR");
      const live = r.homepage && r.homepage.trim()
        ? `<a class="btn small outline" target="_blank" rel="noopener" href="${r.homepage}">Live</a>`
        : "";
      return `
        <article class="card proj">
          <h3>${r.name}</h3>
          <p>${desc}</p>
          <div class="tags">
            ${lang}
            <span>Atualizado: ${updated}</span>
            <span>${stars}</span>
          </div>
          <div class="actions">
            <a class="btn small" target="_blank" rel="noopener" href="${r.html_url}">Repositório</a>
            ${live}
          </div>
        </article>
      `;
    }).join("");
  } catch (e) {
    console.error(e);
    grid.innerHTML = `<article class="card">Não foi possível carregar os projetos agora.</article>`;
  }
}

// Se for usar JSON:
document.addEventListener("DOMContentLoaded", loadReposFromJSON);
