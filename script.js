// --- (Same parsing and file handling as before, but state is extended) ---

const defaultHeatmapState = {
    rowLabels: [],
    colLabels: [],
    data: [],
    annotations: [],
    showXLabels: true,
    showYLabels: true,
    colorscale: 'Viridis',
    reverseScale: false,
    opacity: 1,
    showColorbar: true,
    title: 'Heatmap',
    fontSize: 12
};
let currentHeatmap = {...defaultHeatmapState};

function parseDelimited(text, delimiter) {
    if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) throw new Error("File must have at least 2 rows (header and one data row)");
    const colLabels = lines[0].split(delimiter).slice(1);
    const rowLabels = [];
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(delimiter);
        if (row.length < 2) continue;
        rowLabels.push(row[0]);
        data.push(row.slice(1).map(val => {
            const v = parseFloat(val.replace(/,/g, ''));
            return isNaN(v) ? null : v;
        }));
    }
    return { rowLabels, colLabels, data };
}
function inferDelimiter(filename, text) {
    if (filename.match(/\.tsv$/i)) return '\t';
    if (filename.match(/\.csv$/i)) return ',';
    const header = text.split(/\r?\n/, 1)[0];
    const tabCount = (header.match(/\t/g) || []).length;
    const commaCount = (header.match(/,/g) || []).length;
    return tabCount > commaCount ? '\t' : ',';
}
function showError(msg) {
    document.getElementById('error-message').textContent = msg;
}
function clearError() {
    document.getElementById('error-message').textContent = '';
}

function getColorscale(name, reverse) {
    let c = name;
    if (reverse) return c + '_r';
    return c;
}

function plotHeatmap(state) {
    const {
        rowLabels, colLabels, data, annotations,
        showXLabels, showYLabels,
        colorscale, reverseScale,
        opacity, showColorbar,
        title, fontSize
    } = state;

    const layout = {
        title: title,
        xaxis: {
            title: '',
            tickvals: colLabels,
            ticktext: showXLabels ? colLabels : [],
            showticklabels: showXLabels,
            automargin: true,
            tickfont: {size: fontSize}
        },
        yaxis: {
            title: '',
            tickvals: rowLabels,
            ticktext: showYLabels ? rowLabels : [],
            showticklabels: showYLabels,
            automargin: true,
            tickfont: {size: fontSize}
        },
        margin: { t: 40, l: 100, r: 30, b: 80 },
        annotations: annotations || []
    };
    Plotly.newPlot('heatmap', [{
        z: data,
        x: colLabels,
        y: rowLabels,
        type: 'heatmap',
        colorscale: colorscale,
        reversescale: reverseScale,
        colorbar: { title: 'Value', visible: showColorbar },
        opacity: opacity
    }], layout, {responsive: true});
}

// File handling
document.getElementById('upload-area').addEventListener('click', () => {
    document.getElementById('file-input').click();
});
const uploadArea = document.getElementById('upload-area');
uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('dragover'); });
uploadArea.addEventListener('dragleave', (e) => { e.preventDefault(); uploadArea.classList.remove('dragover'); });
uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    handleFile(file);
});
document.getElementById('file-input').addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    handleFile(file);
});
function handleFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            clearError();
            const text = e.target.result;
            const delimiter = inferDelimiter(file.name, text);
            const parsed = parseDelimited(text, delimiter);
            Object.assign(currentHeatmap, defaultHeatmapState, {
                rowLabels: parsed.rowLabels,
                colLabels: parsed.colLabels,
                data: parsed.data,
                annotations: [],
                title: document.getElementById('title-input').value
            });
            // Reset dashboard controls to default
            document.getElementById('color-scale').value = 'Viridis';
            document.getElementById('reverse-colorscale').checked = false;
            document.getElementById('opacity').value = 1;
            document.getElementById('opacity-value').textContent = '1';
            document.getElementById('show-colorbar').checked = true;
            document.getElementById('toggle-xlabels').checked = true;
            document.getElementById('toggle-ylabels').checked = true;
            document.getElementById('font-size').value = 12;
            plotHeatmap(currentHeatmap);
        } catch (err) {
            showError("Error: " + err.message);
            document.getElementById('heatmap').innerHTML = '';
        }
    };
    reader.onerror = function() { showError("Failed to read file."); };
    reader.readAsText(file);
}

// Dashboard controls
document.getElementById('color-scale').addEventListener('change', function() {
    currentHeatmap.colorscale = this.value;
    plotHeatmap(currentHeatmap);
});
document.getElementById('reverse-colorscale').addEventListener('change', function() {
    currentHeatmap.reverseScale = this.checked;
    plotHeatmap(currentHeatmap);
});
document.getElementById('opacity').addEventListener('input', function() {
    const val = parseFloat(this.value);
    currentHeatmap.opacity = val;
    document.getElementById('opacity-value').textContent = val;
    plotHeatmap(currentHeatmap);
});
document.getElementById('show-colorbar').addEventListener('change', function() {
    currentHeatmap.showColorbar = this.checked;
    plotHeatmap(currentHeatmap);
});
document.getElementById('title-input').addEventListener('input', function() {
    currentHeatmap.title = this.value;
    plotHeatmap(currentHeatmap);
});
document.getElementById('font-size').addEventListener('change', function() {
    currentHeatmap.fontSize = parseInt(this.value, 10) || 12;
    plotHeatmap(currentHeatmap);
});

// Annotation controls
document.getElementById('add-annotation-btn').addEventListener('click', () => {
    openAnnotationModal('', '', '', '');
});
document.getElementById('annotation-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const rowIdx = parseInt(document.getElementById('annot-row').value, 10);
    const colIdx = parseInt(document.getElementById('annot-col').value, 10);
    const text = document.getElementById('annot-text').value.trim();
    if (isNaN(rowIdx) || isNaN(colIdx) || !text) {
        alert('Please fill in all annotation fields.');
        return;
    }
    const xLabel = currentHeatmap.colLabels[colIdx];
    const yLabel = currentHeatmap.rowLabels[rowIdx];
    const annotation = {
        x: xLabel,
        y: yLabel,
        text: text,
        showarrow: true,
        arrowhead: 2,
        ax: 0,
        ay: -30,
        font: { color: '#fff', size: 13 },
        bgcolor: '#31316e',
        opacity: 0.8
    };
    currentHeatmap.annotations.push(annotation);
    plotHeatmap(currentHeatmap);
    closeAnnotationModal();
});
document.getElementById('annotation-cancel-btn').addEventListener('click', (e) => {
    e.preventDefault();
    closeAnnotationModal();
});
function openAnnotationModal(row, col, xLabel, yLabel) {
    document.getElementById('annot-row').value = row;
    document.getElementById('annot-col').value = col;
    document.getElementById('annot-xlabel').textContent = xLabel;
    document.getElementById('annot-ylabel').textContent = yLabel;
    document.getElementById('annot-text').value = '';
    document.getElementById('annotation-modal').style.display = 'block';
}
function closeAnnotationModal() {
    document.getElementById('annotation-modal').style.display = 'none';
}
document.getElementById('toggle-xlabels').addEventListener('change', function() {
    currentHeatmap.showXLabels = this.checked;
    plotHeatmap(currentHeatmap);
});
document.getElementById('toggle-ylabels').addEventListener('change', function() {
    currentHeatmap.showYLabels = this.checked;
    plotHeatmap(currentHeatmap);
});
document.getElementById('heatmap').on('plotly_click', function(data) {
    if (!data || !data.points || !data.points.length) return;
    const pt = data.points[0];
    const rowIdx = pt.pointNumber[1];
    const colIdx = pt.pointNumber[0];
    openAnnotationModal(rowIdx, colIdx, currentHeatmap.colLabels[colIdx], currentHeatmap.rowLabels[rowIdx]);
});
