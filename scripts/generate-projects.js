// scripts/generate-projects.js
// Gera projects.json a partir dos repositórios da usuária com a topic "portfolio-fiama".
// Preserva cards fixos do projects.json atual (itens sem campo "github").

const fs = require("fs");
const https = require("https");

// ===== CONFIG =====
const USER = "fiamaribeiro";
const TOPIC = "portfolio-fiama"; // adicione essa topic nos repos que quer exibir
const TYPE_MAP = [
  { key: "powerbi", type: "data" },
  { key: "data", type: "data" },
  { key: "web", type: "web" },
  { key: "script", type: "scripts" },
  { key: "scripts", type: "scripts" }
];

const GH_HEADERS = {
  "User-Agent": "portfolio-updater",
  "Accept": "application/vnd.github+json"
};

const ogImage = (repoName) =>
  `https://opengraph.githubassets.com/1/${USER}/${repoName}`;

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: GH_HEADERS }, (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", reject);
  });
}

(async () => {
  try {
    // 1) Busca até 100 repositórios do usuário, ordenados por atualização
    const repos = await fetchJSON(
      `https://api.github.com/users/${USER}/repos?per_page=100&sort=updated`
    );

    // 2) Filtra apenas os que tiverem a topic TOPIC
    const selected = (repos || []).filter((r) =>
      (r.topics || []).includes(TOPIC)
    );

    const cards = [];
    for (const repo of selected) {
      // 3) Linguagens (top 3 por bytes)
      let langs = {};
      try {
        langs = await fetchJSON(repo.languages_url);
      } catch (_) {}

      const tech = Object.entries(langs)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([k]) => k);

      // 4) Tipo a partir dos topics
      const topics = repo.topics || [];
      let type = "other";
      for (const m of TYPE_MAP) {
        if (topics.includes(m.key)) {
          type = m.type;
          break;
        }
      }

      // 5) Demo: usa homepage do repo se existir
      const demo =
        repo.homepage && repo.homepage.trim() !== "" ? repo.homepage : null;

      // 6) Monta card
      cards.push({
        name: repo.name
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()),
        type,
        desc: repo.description || "",
        tech,
        thumb: ogImage(repo.name),
        github: repo.html_url,
        ...(demo ? { demo } : {})
      });
    }

    // 7) Mantém cards FIXOS (sem campo "github") do projects.json atual
    let fixed = [];
    try {
      const current = JSON.parse(fs.readFileSync("projects.json", "utf8"));
      fixed = (current || []).filter((p) => !p.github);
    } catch (_) {
      // se não existir, segue sem fixos
    }

    // 8) Junta e salva
    const result = [...fixed, ...cards];
    fs.writeFileSync("projects.json", JSON.stringify(result, null, 2), "utf8");
    console.log(
      `✅ projects.json atualizado: ${result.length} itens (${fixed.length} fixos + ${cards.length} automáticos)`
    );
  } catch (err) {
    console.error("❌ Erro ao gerar projects.json:", err);
    process.exit(1);
  }
})();
