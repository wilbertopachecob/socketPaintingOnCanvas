'use strict'
//Esto es la version en JavaScript de jQuery document.ready()
document.addEventListener('DOMContentLoaded', function () {
    const socket = io();
    let mouse = {
        click: false,
        move: false,
        pos: { x: 0, y: 0 },
        pos_prev: false
    }

    const canvas = document.querySelector('#drawing'),
        context = canvas.getContext('2d'),
        width = window.innerWidth,
        height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    canvas.addEventListener('mousedown', (e) => {
        mouse.click = true;
    });

    canvas.addEventListener('mouseup', (e) => {
        mouse.click = false;
    });

    canvas.addEventListener('mousemove', (e) => {
        //Si cambia el ancho de la pantalla quiero obtener la posicion 
        //relativa a ese ancho por eso agrego / width
        mouse.pos.x = e.clientX / width;
        mouse.pos.y = e.clientY / height;
        mouse.move = true;
    });

    socket.on('draw_line', (data) => {
        const line = data.line;
        context.beginPath();
        context.lineWith = 2;
        context.moveTo(line[0].x * width, line[0].y * height);
        context.lineTo(line[1].x * width, line[1].y * height);
        context.stroke();
    });

    //Application Core
    function mainLoop() {
        //If this el suario se estamoviendo y pintando
        if (mouse.click && mouse.move && mouse.pos_prev) {
            socket.emit('draw_line', { line: [mouse.pos, mouse.pos_prev] });
            mouse.move = false;
        }
        mouse.pos_prev = { x: mouse.pos.x, y: mouse.pos.y };
        setTimeout(mainLoop, 25);
    }

    mainLoop();

});
