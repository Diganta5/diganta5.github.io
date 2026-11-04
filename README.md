# Quantum Academic Portfolio

A standalone, responsive academic portfolio built with HTML, CSS, JavaScript and
Three.js. No Python, build step, backend, or package installation is required.

## Preview locally

Because the site uses JavaScript ES modules, open it through a local static
server rather than double-clicking `index.html`.

### Option 1: VS Code
Install the **Live Server** extension, right-click `index.html`, then choose
"Open with Live Server".

### Option 2: Node.js
If Node.js is already installed:
```bash
npx serve .
```
Then open the local URL printed in the terminal.

### Option 3: Python is NOT required
Any static file server works. You do not need Python or a Python web framework.

## Publish free with GitHub Pages

1. Create a GitHub repository named `YOURUSERNAME.github.io`.
2. Upload `index.html`, `styles.css`, `app.js`, and this README to the root.
3. Open repository **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch `main` and folder `/ (root)`, then Save.
6. Wait for deployment, then visit `https://YOURUSERNAME.github.io`.

Every push to `main` updates the site. GitHub Pages is free for public
repositories. A custom domain is optional and generally costs money.

## Personalize before publishing

Search and replace:
- `YOUR NAME`
- `Your Name`
- `Your Institution`
- `YOUR.EMAIL@INSTITUTION.EDU`

Then:
- Add your real profile photo if desired.
- Replace the sample research/project summaries with accurate descriptions.
- Add genuine publications only; link DOI, arXiv, publisher pages or PDFs.
- Add your CV PDF and update the CV link.
- Replace GitHub, ORCID and Google Scholar profile links with your own.
- Remove any section that you do not want public.

## Interactive 3D visualization

`app.js` imports Three.js and OrbitControls from jsDelivr's CDN. Therefore,
the interactive 3D scenes need an internet connection when visitors load the
page. The rest of the website is static HTML/CSS.

The visualization uses a finite, regular honeycomb patch with three equal-length
nearest-neighbour bond families (x, y and z). Its moving highlights are
decorative: coupling sliders change the corresponding bond emphasis, but the
page does not solve the Kitaev Hamiltonian, calculate its spectrum, simulate
spin dynamics, or impose periodic boundary conditions.

## File structure

```text
quantum-academic-portfolio/
├── index.html
├── styles.css
├── app.js
└── README.md
```

## Accessibility and compatibility

The page is responsive and uses semantic sections, labelled controls and a
mobile navigation toggle. Three.js requires a modern browser with WebGL.
