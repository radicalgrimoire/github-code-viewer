function parseLineRange(hash, viewId) {
  const match = new RegExp(`^#${viewId}-L(\\d+)(?:-L(\\d+))?$`).exec(hash);
  if (!match) return null;

  const start = Number(match[1]);
  const end = Number(match[2] || match[1]);
  return start <= end ? { start, end } : { start: end, end: start };
}

function updateHighlightedLines() {
  document.querySelectorAll(".github-code-view").forEach((view) => {
    const range = parseLineRange(window.location.hash, view.id);
    view.querySelectorAll(".github-code-view-line").forEach((line) => {
      const lineNumber = Number(line.dataset.line);
      line.classList.toggle("is-highlighted", Boolean(range && lineNumber >= range.start && lineNumber <= range.end));
    });
  });
}

function linkForLineRange(viewId, start, end) {
  return `#${viewId}-L${start}${start === end ? "" : `-L${end}`}`;
}

function githubUrl(view, host) {
  const { repo, commit, path } = view.dataset;
  if (!repo || !commit || !path) return null;

  return host === "raw"
    ? `https://raw.githubusercontent.com/${repo}/${commit}/${path}`
    : `https://github.com/${repo}/blob/${commit}/${path}`;
}

function createCodeViewFromMarkdown(code) {
  const view = document.createElement("section");
  const config = {};

  code.textContent.split("\n").forEach((line) => {
    const match = /^([a-z-]+):\s*(.+)$/.exec(line.trim());
    if (match) config[match[1]] = match[2];
  });

  view.className = "github-code-view";
  view.id = config.id || `github-code-view-${document.querySelectorAll(".github-code-view").length + 1}`;
  Object.entries(config).forEach(([key, value]) => {
    view.dataset[key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = value;
  });
  code.parentElement.replaceWith(view);
  return view;
}

function createCodeViewShell(view) {
  const sourceUrl = view.dataset.sourceUrl || githubUrl(view, "raw");
  const blobUrl = view.dataset.blobUrl || githubUrl(view, "github");
  const label = view.dataset.label || (view.dataset.path && view.dataset.commit
    ? `${view.dataset.path} @ ${view.dataset.commit.slice(0, 7)}`
    : sourceUrl);

  if (!sourceUrl) throw new Error("Set data-source-url or data-repo, data-commit, and data-path.");

  const header = document.createElement("header");
  const link = document.createElement("a");
  const content = document.createElement("pre");

  header.className = "github-code-view-header";
  link.href = blobUrl || sourceUrl;
  link.rel = "noopener noreferrer";
  link.target = "_blank";
  link.textContent = label;
  content.className = "github-code-view-content";
  content.setAttribute("aria-live", "polite");
  content.textContent = "Loading source...";
  header.append(link);
  view.replaceChildren(header, content);
  return { content, sourceUrl };
}

async function loadCodeView(view) {
  if (view.dataset.githubCodeViewerLoaded === "true") return;
  view.dataset.githubCodeViewerLoaded = "true";

  try {
    const { content, sourceUrl } = createCodeViewShell(view);
    const startLine = Math.max(1, Number(view.dataset.startLine || 1));
    const endLine = Number(view.dataset.endLine || 0);
    const response = await fetch(sourceUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const sourceLines = (await response.text()).replace(/\r\n/g, "\n").split("\n");
    if (sourceLines.at(-1) === "") sourceLines.pop();
    const lastLine = endLine > 0 ? Math.min(endLine, sourceLines.length) : sourceLines.length;
    const fragment = document.createDocumentFragment();
    let selectedStart = null;

    for (let lineNumber = startLine; lineNumber <= lastLine; lineNumber += 1) {
      const line = document.createElement("span");
      const lineLink = document.createElement("a");
      const code = document.createElement("span");

      line.className = "github-code-view-line";
      line.dataset.line = lineNumber;
      lineLink.className = "github-code-view-line-number";
      lineLink.href = linkForLineRange(view.id, lineNumber, lineNumber);
      lineLink.textContent = lineNumber;
      lineLink.setAttribute("aria-label", `Link to line ${lineNumber}`);
      code.className = "github-code-view-line-content";
      code.textContent = sourceLines[lineNumber - 1];
      line.append(lineLink, code);
      fragment.append(line);

      lineLink.addEventListener("click", (event) => {
        if (!event.shiftKey || selectedStart === null) {
          selectedStart = lineNumber;
          return;
        }

        event.preventDefault();
        window.location.hash = linkForLineRange(view.id, selectedStart, lineNumber);
        selectedStart = null;
      });
    }

    content.replaceChildren(fragment);
    updateHighlightedLines();
  } catch (error) {
    const content = view.querySelector(".github-code-view-content");
    if (content) content.textContent = `Unable to load source (${error.message}).`;
    else view.textContent = `Unable to load source (${error.message}).`;
  }
}

function initializeCodeViews() {
  document.querySelectorAll("pre > code.language-github-code-viewer").forEach(createCodeViewFromMarkdown);
  document.querySelectorAll(".github-code-view").forEach(loadCodeView);
}

initializeCodeViews();
new MutationObserver(initializeCodeViews).observe(document.body, { childList: true, subtree: true });
window.addEventListener("hashchange", updateHighlightedLines);