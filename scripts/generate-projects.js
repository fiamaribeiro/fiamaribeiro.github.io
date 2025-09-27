// scripts/generate-projects.js
// Gera projects.json com TODOS os repositórios públicos do usuário (sem precisar de topic)

const fs = require("fs");
const https = require("https");

const USER = "fiamaribeiro";
const OUT_FILE = "projects.json";

// Adapte se quiser excluir nomes específicos
const EXCLUDE = new Set([
  // "repo-que-nao-quero",
]);

function ghRequest(path) {
  const options = {
    hostname: "api.github.com",
    path,
    method: "GET",
    headers: {
      "User-Agent": "portfolio-updater",
      "Accept": "application/vnd.github+json"
    }
  };

  return new Promise((resolve, reject) => {
    https.get(options, (res) => {
      let data = "";
      res.on("data", (d) => (data += d));
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        } else {
          reject(new Error(`GitHub API status ${res.statusCode}: ${data}`));
        }
      });
    }).on("error", reject);
  });
}

async function fetchAllRepos(user) {
  const results = [];
  for (let page = 1; page <= 10; page++) {
    const p = await ghRequest(`/users/${user}/repos?per_page=100&page=${page}&sort=updated`);
    if (!Array.isArray(p) || p.length === 0) break;
    results.push(...p);
    if (p.length < 100) break;
  }
  return results;
}

(async () => {
  try {
    let repos = await fetchAllRepos(USER);

    repos = repos
      .filter(r => !r.fork && !r.archived && !r.private && !EXCLUDE.has(r.name))
      .map(r => ({
        name: r.name,
        description: r.description || "",
        html_url: r.html_url,
        homepage: r.homepage || "",
        language: r.language || "",
        stargazers_count: r.stargazers_count || 0,
        pushed_at: r.pushed_at
      }))
      .sort((a, b) => (b.stargazers_count - a.stargazers_count) || (new Date(b.pushed_at) - new Date(a.pushed_at)));

    fs.writeFileSync(OUT_FILE, JSON.stringify(repos, null, 2), "utf8");
    console.log(`✅ Gerado ${OUT_FILE} com ${repos.length} projetos.`);
  } catch (e) {
    console.error("Erro:", e);
    process.exit(1);
  }
})();
