---
---

# Document Formatting Tools

## Introduction

Having been using Microsoft Word for years, I finally got tired of using sophisticated document GUI. After tapping into the Latex world, I quickly figured that picking up another set of convoluted convention is not worth it. Finally, I found MarkDown, a tool that I have always been using without realizing its potential. After experimenting a couple articles with Markdown, it quickly becomes my my favorite text formatting tool.

To be precise, the **Markdown** with **MermaidJs** and **Latex** Support is the way to go. Besides aethetic minimalism, these tools covers a whole spectrum of functionality, and can be easily version controlled.
Collaboration with MarkDown documents is made easy with GitHub Pull Requests, which means progress in report writing could be strictly monitored.
As per previewing other people's progress, I could simply checkout their remote branch, and view document preview in vscode.

## Mermaid

Mermaid is a minimalistic diagram building tool. It is really easy to [get started](https://mermaidjs.github.io/), and becomes really handy when designing code modules and diagrams.

### Export to Html

To export a MarkDown document with Mermaid support, simply do the following:
1. Export it as html in vscode
2. Open the html and in `<head></head>`, add `<link rel="stylesheet" href="https://unpkg.com/mermaid@7.0.4/dist/mermaid.min.css">`
3. At the top of `<body></body>`, add

```html
<script src="https://unpkg.com/mermaid@7.0.4/dist/mermaid.min.js"></script>
<script>mermaid.initialize({startOnLoad:true});</script>
```

4. Change each mermaid code block to be surrounded by `<div class="mermaid">...</div>`

Now the html will be in the desirable Markdown format with proper diagrams.

### Export to Word or to Pdf

1. Open the html document after following the export to html option. Now that the javascript is executed, the website should be static.
2. Copy the root element (i.e. `<html>...</html>`), and paste it in another blank html document.
3. Convert the html document to pdf (using [calibre](https://calibre-ebook.com/))
4. To convert the pdf to word, simply open it with Word, or use calibre again.

## Readings
https://mermaidjs.github.io/
https://mermaidjs.github.io/usage.html
