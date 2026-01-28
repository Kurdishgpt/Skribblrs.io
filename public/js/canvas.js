/* global Sketchpad, socket, animateCSS */
const canvas = document.getElementById('sketchpad');
const brushPickerBtn = document.getElementById('brushPickerBtn');
const brushPalette = document.getElementById('brushPalette');
const brushItems = Array.from(document.querySelectorAll('.brush-palette .brush-item'));
const clearCanvas = document.getElementById('clearCanvas');
const undoBtn = document.getElementById('undoBtn');

const pad = new Sketchpad(canvas, {
    line: {
        size: 5,
    },
});
const current = {
    lineColor: '#000',
    lineSize: 5,
};
pad.setReadOnly(true);

function setLineSize() {
    if (pad.readOnly) return;
    const size = Number(this.dataset.linesize);
    current.lineSize = size;
    pad.setLineSize(size);
    
    brushItems.forEach(brush => brush.classList.remove('active'));
    this.classList.add('active');
    
    // Update main indicator dot
    const dot = brushPickerBtn.querySelector('.brush-dot');
    dot.style.width = Math.min(24, size) + 'px';
    dot.style.height = Math.min(24, size) + 'px';
    
    brushPalette.classList.add('d-none');
}

brushPickerBtn.addEventListener('click', (e) => {
    if (pad.readOnly) return;
    brushPalette.classList.toggle('d-none');
    colorPalette.classList.add('d-none');
    e.stopPropagation();
});

brushItems.forEach(item => item.addEventListener('click', setLineSize));

const colorPickerBtn = document.getElementById('colorPickerBtn');
const colorPalette = document.getElementById('colorPalette');
const paletteColors = Array.from(document.querySelectorAll('.palette-color'));

colorPickerBtn.addEventListener('click', (e) => {
    if (pad.readOnly) return;
    colorPalette.classList.toggle('d-none');
    brushPalette.classList.add('d-none');
    e.stopPropagation();
});

paletteColors.forEach((color) => {
    color.addEventListener('click', function () {
        if (pad.readOnly) return;
        current.lineColor = this.dataset.color;
        pad.setLineColor(current.lineColor);
        colorPickerBtn.style.backgroundColor = current.lineColor;
        colorPalette.classList.add('d-none');
    }, false);
});

document.addEventListener('click', () => {
    brushPalette.classList.add('d-none');
    colorPalette.classList.add('d-none');
});

undoBtn.addEventListener('click', () => {
    if (pad.readOnly) return;
    pad.undo();
});

clearCanvas.addEventListener('click', () => {
    if (pad.readOnly) return;
    socket.emit('clearCanvas');
    pad.clear();
});

function onMouseDown(e) {
    if (pad.readOnly || !pad.sketching) return;
    const rect = canvas.getBoundingClientRect();
    const { width: w, height: h } = pad.getCanvasSize();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    current.x = (clientX - rect.left) / w;
    current.y = (clientY - rect.top) / h;
}

function onMouseUp(e) {
    if (pad.readOnly) return;
    const rect = canvas.getBoundingClientRect();
    const { width: w, height: h } = pad.getCanvasSize();
    const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
    socket.emit('drawing', {
        start: {
            x: current.x,
            y: current.y,
        },
        end: {
            x: (clientX - rect.left) / w,
            y: (clientY - rect.top) / h,
        },
        lineColor: current.lineColor,
        lineSize: current.lineSize,
    });
}

function onMouseMove(e) {
    if (pad.readOnly || !pad.sketching) return;
    const { width: w, height: h } = pad.getCanvasSize();
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    // Prevent drawing if coordinates are outside bounds
    const x = (clientX - rect.left) / w;
    const y = (clientY - rect.top) / h;
    
    if (x < 0 || x > 1 || y < 0 || y > 1) return;

    socket.emit('drawing', {
        start: {
            x: current.x,
            y: current.y,
        },
        end: {
            x: x,
            y: y,
        },
        lineColor: current.lineColor,
        lineSize: current.lineSize,
    });
    current.x = x;
    current.y = y;
    
    if (e.touches) e.preventDefault();
}

function throttle(callback, delay) {
    let previousCall = new Date().getTime();
    return (...args) => {
        const time = new Date().getTime();
        if ((time - previousCall) >= delay) {
            previousCall = time;
            callback(...args);
        }
    };
}

window.addEventListener('resize', () => {
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    pad.resize(width);
    // If Sketchpad supports height adjustment, it might need to be set here
    // Some versions of Sketchpad only take one dimension.
});

// Initial resize to ensure bounds are correct
setTimeout(() => {
    pad.resize(canvas.offsetWidth);
}, 500);

canvas.addEventListener('mousedown', onMouseDown);
canvas.addEventListener('mouseup', throttle(onMouseUp, 10));
canvas.addEventListener('mousemove', throttle(onMouseMove, 10));

canvas.addEventListener('touchstart', onMouseDown, { passive: false });
canvas.addEventListener('touchend', throttle(onMouseUp, 10), { passive: false });
canvas.addEventListener('touchmove', throttle(onMouseMove, 10), { passive: false });

socket.on('clearCanvas', () => pad.clear());
socket.on('drawing', ({
    start,
    end,
    lineColor,
    lineSize,
}) => {
    const { width: w, height: h } = pad.getCanvasSize();
    start.x *= w;
    start.y *= h;
    end.x *= w;
    end.y *= h;
    pad.setLineColor(lineColor);
    pad.setLineSize(lineSize);
    pad.drawLine(start, end);
    pad.setLineColor(current.lineColor);
    pad.setLineSize(current.lineSize);
});
socket.on('disableCanvas', async () => {
    pad.setReadOnly(true);
    await animateCSS('#tools', 'fadeOutDown');
    document.querySelector('#tools').classList.add('d-none');
});
