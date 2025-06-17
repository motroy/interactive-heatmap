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

function plotHeatmap({rowLabels, colLabels, data}) {
    const layout = {
        title: 'Heatmap',
        xaxis: { title: '', tickvals: colLabels, automargin: true },
        yaxis: { title: '', tickvals: rowLabels, automargin: true },
        margin: { t: 40, l: 100, r: 30, b: 80 }
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

function handleFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            clearError();
            const text = e.target.result;
            const delimiter = inferDelimiter(file.name, text);
            const parsed = parseDelimited(text, delimiter);
            plotHeatmap(parsed);
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
