// Helper: Parse CSV or TSV to {rowLabels, colLabels, data}
function parseDelimited(text, delimiter) {
    // Remove BOM if present
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
    // Guess by counting which is more frequent in the header row
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

let currentHeatmap = {
    rowLabels: [],
    colLabels: [],
    data: [],
    annotations: [],
    showXLabels: true,
    showYLabels: true
};

function plotHeatmap({rowLabels, colLabels, data, annotations, showXLabels, showYLabels}) {
    // Default to true if undefined
    showXLabels = showXLabels !== undefined ? showXLabels : true;
    showYLabels = showYLabels !== undefined ? showYLabels : true;
    // Layout
    const layout = {
        title: 'Heatmap',
        xaxis: {
            title: '',
            tickvals: colLabels,
            ticktext: showXLabels ? colLabels : [],
            showticklabels: showXLabels,
            automargin: true
        },
        yaxis: {
            title: '',
            tickvals: rowLabels,
            ticktext: showYLabels ? rowLabels : [],
            showticklabels: showYLabels,
            automargin: true
        },
        margin: { t: 40, l: 100, r: 30, b: 80 },
        annotations: annotations || []
    };
    Plotly.newPlot('heatmap', [{
        z: data,
        x: colLabels,
        y: rowLabels,
        type: 'heatmap',
        colorscale: 'Viridis',
        colorbar: { title: 'Value' }
    }], layout, {responsive: true});
}

// For annotation modal
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

// Handle file
function handleFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            clearError();
            const text = e.target.result;
            const delimiter = inferDelimiter(file.name, text);
            const parsed = parseDelimited(text, delimiter);
            // Reset state
            currentHeatmap.rowLabels = parsed.rowLabels;
            currentHeatmap.colLabels = parsed.colLabels;
            currentHeatmap.data = parsed.data;
            currentHeatmap.annotations = [];
            currentHeatmap.showXLabels = true;
            currentHeatmap.showYLabels = true;
            plotHeatmap({
                rowLabels: parsed.rowLabels,
                colLabels: parsed.colLabels,
                data: parsed.data,
                annotations: [],
                showXLabels: true,
                showYLabels: true
            });
            document.getElementById('toggle-xlabels').checked = true;
            document.getElementById('toggle-ylabels').checked = true;
        } catch (err) {
            showError("Error: " + err.message);
            document.getElementById('heatmap').innerHTML = '';
        }
    };
    reader.onerror = function() {
        showError("Failed to read file.");
    };
    reader.readAsText(file);
}

document.getElementById('upload-area').addEventListener('click', () => {
    document.getElementById('file-input').click();
});

// Drag and drop
const uploadArea = document.getElementById('upload-area');
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});
uploadArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
});
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

// Add annotation button
document.getElementById('add-annotation-btn').addEventListener('click', () => {
    // Open annotation modal with default values
    openAnnotationModal('', '', '', '');
});

// Handle annotation form submit
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
    plotHeatmap({
        rowLabels: currentHeatmap.rowLabels,
        colLabels: currentHeatmap.colLabels,
        data: currentHeatmap.data,
        annotations: currentHeatmap.annotations,
        showXLabels: currentHeatmap.showXLabels,
        showYLabels: currentHeatmap.showYLabels
    });
    closeAnnotationModal();
});

// Close annotation modal
document.getElementById('annotation-cancel-btn').addEventListener('click', (e) => {
    e.preventDefault();
    closeAnnotationModal();
});

// Toggle axis labels
document.getElementById('toggle-xlabels').addEventListener('change', function() {
    currentHeatmap.showXLabels = this.checked;
    plotHeatmap({
        rowLabels: currentHeatmap.rowLabels,
        colLabels: currentHeatmap.colLabels,
        data: currentHeatmap.data,
        annotations: currentHeatmap.annotations,
        showXLabels: currentHeatmap.showXLabels,
        showYLabels: currentHeatmap.showYLabels
    });
});
document.getElementById('toggle-ylabels').addEventListener('change', function() {
    currentHeatmap.showYLabels = this.checked;
    plotHeatmap({
        rowLabels: currentHeatmap.rowLabels,
        colLabels: currentHeatmap.colLabels,
        data: currentHeatmap.data,
        annotations: currentHeatmap.annotations,
        showXLabels: currentHeatmap.showXLabels,
        showYLabels: currentHeatmap.showYLabels
    });
});

// Add annotation by clicking on heatmap cell
document.getElementById('heatmap').on('plotly_click', function(data) {
    if (!data || !data.points || !data.points.length) return;
    const pt = data.points[0];
    const rowIdx = pt.pointNumber[1];
    const colIdx = pt.pointNumber[0];
    openAnnotationModal(rowIdx, colIdx, currentHeatmap.colLabels[colIdx], currentHeatmap.rowLabels[rowIdx]);
});
