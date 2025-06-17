# Interactive Heatmap Web App

A fully client-side, interactive heatmap visualizer.  
- **Upload** your CSV/TSV matrix.
- **Customize** visualization with the feature-rich dashboard.
- **Annotate** cells with metadata.
- **Export** high-quality images and annotations.
- **No data leaves your browser!**

<br/>

## 🚀 Features

- **Drag-and-drop CSV/TSV upload**
- **Dashboard**: 
  - Color scale, opacity, colorbar options, grid, axis labels, font size, theme (light/dark), & more
- **Annotations**: 
  - Add/edit cell annotations
  - Export/import annotation JSON
  - One-click clear
- **Transpose** matrix with a button
- **Show/hide cell values** with decimal precision control
- **Download** heatmap as PNG or SVG
- **Responsive design** for desktops and tablets

<br/>

## 🖥️ Getting Started

### 1. Clone or Download

```sh
git clone https://github.com/motroy/interactive-heatmap.git
cd interactive-heatmap
```
Or [download as ZIP](https://github.com/motroy/interactive-heatmap/archive/refs/heads/main.zip) and unzip.

---

### 2. Run

- **Open `index.html` in your browser.**
  - Or deploy on [GitHub Pages](https://motroy.github.io/motroy/interactive-heatmap) for web access.

---

### 3. Using the App

**a. Upload Data**

- Click the upload area or drag your CSV/TSV file in.
- File format example:
    ```
    ,Col1,Col2,Col3
    Row1,1,2,3
    Row2,4,5,6
    Row3,7,8,9
    ```

**b. Customize the Heatmap**

- Use the **dashboard** to change:
    - Color scale & reverse
    - Opacity
    - Colorbar position/title/visibility
    - Font size, grid lines, theme
    - Show/hide axis labels
    - Transpose data
    - Cell values display & decimals
    - Reset all settings

**c. Annotate**

- Click `Add Annotation` or any cell to annotate.
- Add as many annotations as you like.
- **Export/Import** annotations as JSON.
- **Clear** all annotations.

**d. Download**

- Export the current heatmap as **PNG** or **SVG**.

---

## 📊 Example CSV

```
,Apple,Banana,Cherry
A,1,2,3
B,4,5,6
C,7,8,9
```

---

## 🛡️ Privacy

- All processing is in your browser. **No data is uploaded or stored externally.**

---

## 🛠️ Tech

- [Plotly.js](https://plotly.com/javascript/) for visualization
- Vanilla JS, HTML, CSS
- No dependencies, no build step

---

## 📄 License

MIT

---

## ✨ Credits & Contributions

- Created by [motroy](https://github.com/motroy)
- Contributions welcome! Open an issue or PR.
