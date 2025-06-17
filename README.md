# Interactive Heatmap Web App

This is a lightweight, client-side web app that allows users to upload CSV or TSV files and visualize the data as an interactive heatmap. The app is built with HTML, JavaScript, and [Plotly.js](https://plotly.com/javascript/) for interactive charting.

## Features

- Upload `.csv` or `.tsv` files with tabular data.
- Automatically parses the file and displays the data as an interactive heatmap.
- Supports drag-and-drop or file input selection.
- Works 100% client-side—no backend or data sent to a server.
- Deployable with GitHub Pages.

## How to Use

1. Open the app in your browser (see [GitHub Pages deployment](#deploy-to-github-pages)).
2. Click the upload area or drag and drop a `.csv` or `.tsv` file.
3. The heatmap is generated automatically from the uploaded data.

## File Format

Your input file should be a simple CSV or TSV file with headers. The first row is used as column labels, and the first column as row labels. Example:

```csv
,Col1,Col2,Col3
Row1,1,2,3
Row2,4,5,6
Row3,7,8,9
```

## Deploy to GitHub Pages

1. Fork or clone this repository.
2. Push to a branch named `gh-pages` or enable GitHub Pages in repository settings.
3. Visit `https://motroy.github.io/interactive-heatmap/` to use the app.

## Customization

You can style and extend the web app by editing `index.html` and `style.css`.
