// ===== Utilidades existentes (ano e tema) =====
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

const themeToggle = document.getElementById('themeToggle');
const saved = localStorage.getItem('theme');
if (saved === 'light') document.body.classList.add('light');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light');
    localStorage.setItem('theme', document.body.classList.contains('light') ? 'light' : 'dark');
  });
}

// ===== Projetos automáticos do GitHub (client-side) =====
const GH_USER = "fiamaribeiro";

// Exclua repos pelo nome se quiser ocultar algum
const EXCLUDE = new Set([
  // "repo-que-nao-quero",
]);

// Quantidade máxima (ajuste se quiser)
const LIMIT = 24;

// Paginação simples (até 200 repos)
// Se você tiver MUITOS repos, podemos expandir para mais páginas.
async function fetchAllRepos(user) {
  const pages = [1, 2];
  const results = [];
  for (const p of pages) {
    const url = `https://api.github.com/users/${user}/repos?per_page=100&page=${p}&sort=updated`;
    const res = await fetch(url, { headers: { "Accept": "application/vnd.github+json" } });
    if (!res.ok) break; // para de tentar se der erro
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) break;
    results.push(...data);
    if (data.length < 100) break; // última página
  }
  return results;
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

function renderRepoCard(r) {
  const desc = r.description ? escapeHtml(r.description) : "Projeto sem descrição.";
  const lang = r.language ? `<span>${escapeHtml(r.language)}</span>` : "";
  const stars = `⭐ ${r.stargazers_count ?? 0}`;
  const updated = new Date(r.pushed_at).toLocaleDateString("pt-BR");
  const live = r.homepage && r.homepage.trim()
    ? `<a class="btn small outline" target="_blank" rel="noopener" href="${r.homepage}">Live</a>`
    : "";

  return `
    <article class="card proj">
      <h3>${escapeHtml(r.name)}</h3>
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
}

async function loadReposClient() {
  const grid = document.getElementById("repo-grid");
  if (!grid) return;

  try {
    let repos = await fetchAllRepos(GH_USER);

    repos = repos
      .filter(r => !r.fork && !r.archived && !r.private && !EXCLUDE.has(r.name))
      .sort((a, b) => (b.stargazers_count - a.stargazers_count) || (new Date(b.pushed_at) - new Date(a.pushed_at)))
      .slice(0, LIMIT);

    grid.innerHTML = repos.map(renderRepoCard).join("");
  } catch (e) {
    console.error(e);
    grid.innerHTML = `<article class="card">Não foi possível carregar os projetos agora. Tente novamente mais tarde.</article>`;
  }
}

document.addEventListener("DOMContentLoaded", loadReposClient);
