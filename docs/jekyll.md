# Jekyll Setup

Copy the files from `src/` into your Jekyll site, compile `github-code-viewer.scss` as CSS, then load the CSS and JavaScript in your default layout.

```liquid
<link rel="stylesheet" href="{{ "/assets/github-code-viewer.css" | relative_url }}">
<script defer src="{{ "/assets/github-code-viewer.js" | relative_url }}"></script>
```

Add the element from the main README directly to a Markdown page as HTML, or make a small Liquid include that emits the same attributes.