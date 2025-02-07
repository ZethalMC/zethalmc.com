let colorPairCount = 0;

function createColorPair() {
    const pairId = colorPairCount++;
    const colorPairHtml = `
        <div class="flex items-center">
            <input type="color" id="color${pairId}" class="w-1/2" value="#6B46C1" onchange="updatePreview()">
            <input type="text" id="colorLabel${pairId}" class="w-1/2" value="#6B46C1" onchange="updatePreview()">
            <button onclick="removeColorPair(${pairId})" class="bg-red-600 text-white px-2">Remove</button>
        </div>
    `;
    document.getElementById('colorPairs').insertAdjacentHTML('beforeend', colorPairHtml);
}

function addColorPair() {
    createColorPair();
    updatePreview();
}

function removeColorPair(id) {
    document.getElementById(`colorPair${id}`).remove();
    updatePreview();
}

function getAllColors() {
    const colors = [];
    for (let i = 0; i < colorPairCount; i++) {
        const colorElement = document.getElementById(`color${i}`);
        if (colorElement) colors.push(colorElement.value);
    }
    return colors.length > 0 ? colors : ['#6B46C1', '#9F7AEA'];
}

function copyOutput() {
    const output = document.getElementById('output');
    navigator.clipboard.writeText(output.textContent).then(() => alert('Copied!'));
}

function updatePreview() {
    const text = document.getElementById('inputText').value;
    const colors = getAllColors();
    const preview = document.getElementById('preview');
    preview.style.setProperty('--gradient', `linear-gradient(to right, ${colors.join(', ')})`);
    preview.innerHTML = `<span class="gradient-text">${text}</span>`;
    document.getElementById('output').textContent = text; // Simplified output
}

document.addEventListener('DOMContentLoaded', () => {
    addColorPair();
    addColorPair();
    document.getElementById('inputText').addEventListener('input', updatePreview);
});