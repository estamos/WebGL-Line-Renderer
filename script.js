
const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');

// Resize the canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Clear the canvas
gl.clearColor(1.0, 1.0, 1.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

// Store points for the line
let points = [0, 0, 0.5, 0.5]; // initial two points in normalized device coordinates

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

// Handle adding random points
document.getElementById('addPointButton').addEventListener('click', () => {
    const newPoint = [Math.random() * 2 - 1, Math.random() * 2 - 1]; // Random point in normalized device coords
    points.push(...newPoint);
    draw();
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
