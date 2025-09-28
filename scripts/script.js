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

// ===== Certificados dinâmicos (carrega certificates.json) =====
async function loadCertificates() {
  const grid = document.getElementById("certs-grid");
  if (!grid) return;

  try {
    const res = await fetch("/certificates.json", { cache: "no-cache" });
    if (!res.ok) throw new Error("Falha ao carregar certificates.json");
    const certs = await res.json();

    // ordena por ano desc (e, opcionalmente, por título)
    certs.sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || (a.title || "").localeCompare(b.title || ""));

    grid.innerHTML = certs.map(renderCertCard).join("");
  } catch (e) {
    console.error(e);
    grid.innerHTML = `<article class="card">Não foi possível carregar seus certificados agora.</article>`;
  }
}

function renderCertCard(c) {
  const title = escapeHtml(c.title || "Certificado");
  const issuer = escapeHtml(c.issuer || "");
  const year = c.year ? ` • ${c.year}` : "";
  const desc = escapeHtml(c.description || "");
  const url = c.url ? escapeHtml(c.url) : "";

  const tags = Array.isArray(c.tags) && c.tags.length
    ? c.tags.map(t => `<span>${escapeHtml(String(t))}</span>`).join("")
    : "";

  const btn = url
    ? `<a class="btn small" target="_blank" rel="noopener" href="${url}">Ver certificado</a>`
    : "";

  return `
    <article class="card cert">
      <div class="cert-head">
        <h3>${title}</h3>
        <span class="issuer">${issuer}${year}</span>
      </div>
      <p>${desc}</p>
      <div class="tags">${tags}</div>
      <div class="actions">${btn}</div>
    </article>
  `;
}

// Reaproveita o escapeHtml já usado nos projetos.
// Se não tiver no arquivo, cole esta função:
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m => (
    {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]
  ));
}

// Inicializa junto com os projetos
document.addEventListener("DOMContentLoaded", loadCertificates);

