# GitHub Code Viewer

Render a public GitHub file at a fixed commit with GitHub-style line numbers, permalinkable lines, highlighted line ranges, and optional line wrapping.

## Install

Copy both files from `src/` into your project:

- `github-code-viewer.js`
- `github-code-viewer.css`

Load the stylesheet in the page `<head>` and the script after the code-view elements.

```html
<link rel="stylesheet" href="/assets/github-code-viewer.css">
<script defer src="/assets/github-code-viewer.js"></script>
```

## Usage

Add an empty element with the repository, a full commit SHA, and the source path.

```html
<section
  id="source-example"
  class="github-code-view"
  data-repo="owner/repository"
  data-commit="0123456789abcdef0123456789abcdef01234567"
  data-path="src/example.js"
  data-start-line="1"
  data-end-line="80"
  data-wrap="true"
></section>
```

The script loads the corresponding `raw.githubusercontent.com` URL and creates a link to the `github.com` file view. Use a full commit SHA instead of a branch name to keep the cited source immutable.

`data-start-line` defaults to `1`; omit `data-end-line` to show the full file. Set `data-wrap="true"` to wrap long lines. Omit it, or use `false`, to scroll horizontally.

## Markdown and Growi

When your Markdown renderer strips custom HTML elements, use a code fence instead. The library replaces this block with a code viewer.

````md
```github-code-viewer
id: source-example
repo: owner/repository
commit: 0123456789abcdef0123456789abcdef01234567
path: src/example.js
start-line: 1
end-line: 80
wrap: true
```
````

The supported keys are `id`, `repo`, `commit`, `path`, `start-line`, `end-line`, `wrap`, `label`, `source-url`, and `blob-url`.

## Line Links

Click a line number to create a hash such as `#source-example-L23`. Shift-click a second line number to create and highlight a range such as `#source-example-L23-L29`.

## Other Public Sources

For a public text URL outside GitHub, use `data-source-url`. Optionally use `data-blob-url` for the header link and `data-label` for its text.

```html
<section
  id="external-source"
  class="github-code-view"
  data-source-url="https://example.com/source.txt"
  data-blob-url="https://example.com/source"
  data-label="source.txt"
></section>
```

The remote server must allow browser requests through CORS. GitHub raw URLs for public repositories do so.

## Notes

This is a browser-side enhancement. It does not fetch private repositories and it has no GitHub authentication flow. The loaded source is inserted with `textContent`, so source code is displayed as text and never executed as HTML.