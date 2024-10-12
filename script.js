
const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');

// Resize the canvas to always fit the center
canvas.width = 600;
canvas.height = 600;

// Clear the canvas
gl.clearColor(1.0, 1.0, 1.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

// Store points for the line
let points = [0, 0]; // Start at the center (normalized device coordinates)
let selectedMethod = null;
let newPoint = null;

// Function to create a WebGL buffer
function createBuffer(gl, data) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    return buffer;
}

// Create shaders
const vertexShaderSource = `
attribute vec2 a_position;
uniform float u_lineWidth;
void main() {
    gl_Position = vec4(a_position, 0, 1);
    gl_PointSize = u_lineWidth;
}`;

const fragmentShaderSource = `
precision mediump float;
void main() {
    gl_FragColor = vec4(0, 0, 0, 1);
}`;

// Compile shader program
function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        return null;
    }
    return program;
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
const program = createProgram(gl, vertexShader, fragmentShader);

// Set up line width uniform
const lineWidthInput = document.getElementById('lineWidth');
gl.useProgram(program);

// Get message element for success or error display
const messageElement = document.getElementById('message');

// Function to display message
function showMessage(success, text) {
    messageElement.textContent = text;
    messageElement.className = `message ${success ? 'success' : 'error'}`;
    messageElement.style.visibility = 'visible';
}

// Handle the method selection buttons
document.getElementById('randomPointButton').addEventListener('click', () => {
    selectedMethod = 'random';
    document.getElementById('coordinateInputs').classList.add('hidden');
    document.getElementById('generateButton').classList.remove('hidden');
    showMessage(false, "Random point mode selected.");
});

document.getElementById('coordinateInputButton').addEventListener('click', () => {
    selectedMethod = 'coordinates';
    document.getElementById('coordinateInputs').classList.remove('hidden');
    document.getElementById('generateButton').classList.remove('hidden');
    showMessage(false, "Enter x and y coordinates.");
});

document.getElementById('clickCanvasButton').addEventListener('click', () => {
    selectedMethod = 'click';
    document.getElementById('coordinateInputs').classList.add('hidden');
    document.getElementById('generateButton').classList.add('hidden');
    showMessage(false, "Click on canvas to add points.");
});

// Generate new segment based on the selected method
document.getElementById('generateButton').addEventListener('click', () => {
    if (selectedMethod === 'random') {
        newPoint = [Math.random() * 2 - 1, Math.random() * 2 - 1];
        showMessage(true, "Random point added successfully.");
    } else if (selectedMethod === 'coordinates') {
        const x = parseFloat(document.getElementById('xCoord').value);
        const y = parseFloat(document.getElementById('yCoord').value);
        if (!isNaN(x) && !isNaN(y) && x >= -1 && x <= 1 && y >= -1 && y <= 1) {
            newPoint = [x, y];
            showMessage(true, "Coordinates added successfully.");
        } else {
            showMessage(false, "Invalid coordinates. Please enter values between -1 and 1.");
            return;
        }
    }
    if (newPoint) {
        points.push(...newPoint);
        draw();
    }
});

// Clicking on the canvas to add a point
canvas.addEventListener('click', (event) => {
    if (selectedMethod === 'click') {
        const rect = canvas.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / canvas.width) * 2 - 1;
        const y = ((rect.top - event.clientY) / canvas.height) * 2 + 1;
        points.push(x, y);
        draw();
        showMessage(true, "Point added successfully.");
    }
});

function draw() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    const buffer = createBuffer(gl, points);
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const lineWidth = parseFloat(lineWidthInput.value);
    const uLineWidthLocation = gl.getUniformLocation(program, 'u_lineWidth');
    gl.uniform1f(uLineWidthLocation, lineWidth);

    gl.drawArrays(gl.LINE_STRIP, 0, points.length / 2);
}

draw();
