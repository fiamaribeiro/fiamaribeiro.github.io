// scripts/generate-projects.js
// Teste inicial: gera um projects.json simples

const fs = require("fs");

const projects = [
  {
    name: "Teste automático",
    type: "demo",
    desc: "Este é apenas um teste para verificar se a Action está funcionando.",
    tech: ["Node.js", "GitHub Actions"],
    thumb: "https://avatars.githubusercontent.com/u/9919?s=200&v=4",
    github: "https://github.com/fiamaribeiro/fiamaribeiro.github.io"
  }
];

// Escreve o arquivo projects.json
fs.writeFileSync("projects.json", JSON.stringify(projects, null, 2), "utf8");

console.log("✅ Arquivo projects.json atualizado com sucesso!");
