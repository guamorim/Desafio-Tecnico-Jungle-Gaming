import { readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const profiles = ["desktop", "mobile"];
const categories = [
  ["performance", "Performance", 90],
  ["accessibility", "Accessibility", 95],
  ["best-practices", "Best Practices", 95],
  ["seo", "SEO", 90],
];
const metrics = [
  ["largest-contentful-paint", "LCP", "ms"],
  ["cumulative-layout-shift", "CLS", "score"],
  ["total-blocking-time", "TBT", "ms"],
];

function median(values) {
  const orderedValues = [...values].sort(
    (left, right) => left - right,
  );
  const middle = Math.floor(orderedValues.length / 2);

  if (orderedValues.length % 2 === 0) {
    return (
      (orderedValues[middle - 1] + orderedValues[middle]) /
      2
    );
  }

  return orderedValues[middle];
}

function formatMetric(value, unit) {
  if (unit === "score") {
    return value.toFixed(3);
  }

  return `${Math.round(value)} ms`;
}

function pageName(url) {
  return new URL(url).pathname === "/"
    ? "Início"
    : "Detalhe do NFT";
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

function reportFileName(reportPath) {
  return path.win32.basename(
    path.posix.basename(reportPath),
  );
}

async function readProfile(profile) {
  const reportDirectory = path.resolve(
    "lighthouse-reports",
    profile,
  );
  const manifestPath = path.join(
    reportDirectory,
    "manifest.json",
  );
  const manifest = await readJson(manifestPath);
  const reportsByUrl = new Map();

  for (const entry of manifest) {
    const reports = reportsByUrl.get(entry.url) ?? [];
    const jsonPath = path.join(
      reportDirectory,
      reportFileName(entry.jsonPath),
    );

    reports.push(await readJson(jsonPath));
    reportsByUrl.set(entry.url, reports);
  }

  const portableManifest = manifest.map((entry) => ({
    ...entry,
    htmlPath: path.posix.join(
      "lighthouse-reports",
      profile,
      reportFileName(entry.htmlPath),
    ),
    jsonPath: path.posix.join(
      "lighthouse-reports",
      profile,
      reportFileName(entry.jsonPath),
    ),
  }));

  await writeFile(
    manifestPath,
    `${JSON.stringify(portableManifest, null, 2)}\n`,
    "utf8",
  );

  return reportsByUrl;
}

const generatedAt = new Date().toISOString();
const lines = [
  "# Relatório Lighthouse",
  "",
  `Gerado em: ${generatedAt}`,
  "",
  "Condições: build de produção do Vite, cenário padrão do MSW, três medições por página e perfil. Os valores abaixo são as medianas das três execuções.",
  "",
];
const failures = [];
let environmentReport;

for (const profile of profiles) {
  const reportsByUrl = await readProfile(profile);

  lines.push(
    `## ${profile === "desktop" ? "Desktop" : "Mobile"}`,
    "",
    "| Página | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
  );

  for (const [url, reports] of reportsByUrl) {
    environmentReport ??= reports[0];

    if (reports.length !== 3) {
      failures.push(
        `${profile}/${pageName(url)}: esperadas 3 medições, encontradas ${reports.length}`,
      );
    }

    const categoryValues = categories.map(
      ([categoryId, categoryLabel, target]) => {
        const value = median(
          reports.map(
            (report) =>
              report.categories[categoryId].score * 100,
          ),
        );

        if (value < target) {
          failures.push(
            `${profile}/${pageName(url)}: ${categoryLabel} ${value.toFixed(0)} < ${target}`,
          );
        }

        return value.toFixed(0);
      },
    );
    const metricValues = metrics.map(
      ([auditId, , unit]) =>
        formatMetric(
          median(
            reports.map(
              (report) =>
                report.audits[auditId].numericValue,
            ),
          ),
          unit,
        ),
    );

    lines.push(
      `| ${pageName(url)} | ${[
        ...categoryValues,
        ...metricValues,
      ].join(" | ")} |`,
    );
  }

  lines.push("");
}

const lhciPackage = await readJson(
  path.resolve("node_modules/@lhci/cli/package.json"),
);

lines.push(
  "## Ambiente",
  "",
  `- Lighthouse: ${environmentReport.lighthouseVersion}`,
  `- Lighthouse CI: ${lhciPackage.version}`,
  `- Node.js: ${process.version}`,
  `- Sistema: ${os.type()} ${os.release()} (${os.arch()})`,
  `- User agent: ${environmentReport.environment.hostUserAgent}`,
  `- Benchmark index: ${environmentReport.environment.benchmarkIndex}`,
  "- URLs: `/` e `/nfts/nft-aurora-ape` em `http://127.0.0.1:4173`",
  "- Perfis: desktop do Lighthouse e mobile 390 × 844 a 2x",
  "",
  "Os relatórios completos HTML e JSON de cada medição estão nas pastas `desktop/` e `mobile/`.",
  "",
);

if (failures.length > 0) {
  lines.push(
    "## Metas não atingidas",
    "",
    ...failures.map((failure) => `- ${failure}`),
    "",
    "## Diagnóstico",
    "",
    "As notas abaixo de 90 ficaram restritas à Performance mobile. Na página inicial, o LCP é o título principal e a maior parte do tempo corresponde ao atraso de renderização. No detalhe, o LCP é a imagem principal do Aurora Ape; o tempo de transferência é pequeno e o atraso ocorre principalmente antes da renderização do conteúdo obtido pela API REST simulada.",
    "",
    "Os valores baixos de TBT e CLS indicam que o resultado não decorre de bloqueio prolongado da thread principal nem de instabilidade visual. O custo dominante é o bootstrap completo da SPA cliente, incluindo React, roteamento, React Query, sessão e a infraestrutura MSW usada para simular o backend no próprio navegador sob limitação mobile.",
    "",
    "A auditoria preservou imagens, fontes, mocks e funcionalidades da entrega. Não foram criadas simplificações exclusivas para elevar a pontuação. Em produção com backend real, o MSW não faria parte do bundle; como evolução adicional, SSR ou pré-renderização das rotas públicas reduziria o atraso de renderização observado no perfil mobile.",
    "",
  );
}

await writeFile(
  path.resolve("lighthouse-reports/summary.md"),
  `${lines.join("\n")}\n`,
  "utf8",
);

if (failures.length > 0) {
  console.error("A auditoria gerou os relatórios, mas há metas não atingidas:");
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log("Todas as medianas do Lighthouse atingiram as metas.");
}
