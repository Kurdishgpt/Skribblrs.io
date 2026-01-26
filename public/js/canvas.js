/* global Sketchpad, socket, animateCSS */
const canvas = document.getElementById('sketchpad');
const smBrush = document.getElementById('sm-brush');
const mdBrush = document.getElementById('md-brush');
const lgBrush = document.getElementById('lg-brush');
const xlBrush = document.getElementById('xl-brush');
const clearCanvas = document.getElementById('clearCanvas');
const brushItems = [smBrush, mdBrush, lgBrush, xlBrush];
const pad = new Sketchpad(canvas, {
    line: {
        size: 5,
    },
    aspectRatio: 5 / 8,
});
const current = {
    lineColor: '#000',
    lineSize: 5,
};
pad.setReadOnly(true);

smBrush.classList.add('active');

function setLineSize() {
    if (pad.readOnly) return;
    current.lineSize = Number(this.dataset.linesize);
    pad.setLineSize(Number(this.dataset.linesize));
    
    brushItems.forEach(brush => brush.classList.remove('active'));
    this.classList.add('active');
}

function onMouseDown(e) {
    if (!pad.sketching) return;
    const rect = canvas.getBoundingClientRect();
    const { width: w, height: h } = pad.getCanvasSize();
    current.x = (e.clientX - rect.left) / w;
    current.y = (e.clientY - rect.top) / h;
}

function onMouseUp(e) {
    if (pad.readOnly) return;
    const rect = canvas.getBoundingClientRect();
    const { width: w, height: h } = pad.getCanvasSize();
    socket.emit('drawing', {
        start: {
            x: current.x,
            y: current.y,
        },
        end: {
            x: (e.clientX - rect.left) / w,
            y: (e.clientY - rect.top) / h,
        },
        lineColor: current.lineColor,
        lineSize: current.lineSize,
    });
}

function onMouseMove(e) {
    if (!pad.sketching) return;
    const { width: w, height: h } = pad.getCanvasSize();
    const rect = canvas.getBoundingClientRect();
    socket.emit('drawing', {
        start: {
            x: current.x,
            y: current.y,
        },
        end: {
            x: (e.clientX - rect.left) / w,
            y: (e.clientY - rect.top) / h,
        },
        lineColor: current.lineColor,
        lineSize: current.lineSize,
    });
    current.x = (e.clientX - rect.left) / w;
    current.y = (e.clientY - rect.top) / h;
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

const colorPickerBtn = document.getElementById('colorPickerBtn');
const colorPalette = document.getElementById('colorPalette');
const paletteColors = Array.from(document.getElementsByClassName('palette-color'));

colorPickerBtn.addEventListener('click', () => {
    if (pad.readOnly) return;
    colorPalette.classList.toggle('d-none');
});

paletteColors.forEach((color) => {
    color.addEventListener('click', function () {
        if (pad.readOnly) return;
        current.lineColor = this.dataset.color;
        pad.setLineColor(current.lineColor);
        document.querySelector('.selected-color').style.backgroundColor = current.lineColor;
        colorPalette.classList.add('d-none');
    }, false);
});

document.addEventListener('click', (e) => {
    if (!colorPickerBtn.contains(e.target) && !colorPalette.contains(e.target)) {
        colorPalette.classList.add('d-none');
    }
});

smBrush.addEventListener('click', setLineSize);
mdBrush.addEventListener('click', setLineSize);
lgBrush.addEventListener('click', setLineSize);
xlBrush.addEventListener('click', setLineSize);
clearCanvas.addEventListener('click', () => {
    if (pad.readOnly) return;
    socket.emit('clearCanvas');
    pad.clear();
});

window.addEventListener('resize', () => pad.resize(canvas.offsetWidth));
canvas.addEventListener('mousedown', onMouseDown);
canvas.addEventListener('mouseup', throttle(onMouseUp, 10));
canvas.addEventListener('mousemove', throttle(onMouseMove, 10));

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
