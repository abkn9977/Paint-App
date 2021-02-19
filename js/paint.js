window.addEventListener("load", function () {
    /**
     * The idea is when a rectangle is drawn store it into an array
     * with it's properties
     * 
     * When mouse downed and moves, rectangle begins to form at each width and height from the starting
     * position of mouse and hence we get a lot of shapes. So each time canvas should be cleared.
     * 
     * When canvas is cleared, shapes formed earlier will be cleared too. This is where we need array,
     * we can redraw them with there properties we stored earlier
     */

    //shape to draw
    const shapeBtn = document.querySelectorAll(".shape");

    let shapeToDraw = "rectangle";

    for (let i = 0; i < shapeBtn.length; i++) {
        shapeBtn[i].addEventListener("click", () => {
            let c = 0;
            while (c < shapeBtn.length) {
                shapeBtn[c++].classList.remove("active");
            }
            shapeBtn[i].classList.add("active");
            shapeToDraw = shapeBtn[i].dataset.shape;
        });
    }

    //painting area
    const canvas = document.getElementById("paintArea");
    canvas.width = 800;
    canvas.height = 450;

    //clear button
    const clearArea = document.getElementById("clearCanvas");

    //store all shapes drawn in canvas
    let shapes = [];

    //The context in which we will draw shapes
    const ctx = canvas.getContext("2d");

    // some decision variables
    let drawing = false;
    let rectDrawn = false;
    let circleDrawn = false;
    let lineDrawn = false;
    let isDragging = false;
    let shapeIndex;

    // drawing origin
    let posX = 0,
        posY = 0,
        shapeWidth = 0,
        shapeHeight = 0;

    let backgroundColor = null;

    //start drawing and also dragging
    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", drawRactangle);
    canvas.addEventListener("mouseup", endDrawing);

    //Module 2 : delete rectangle on double click
    canvas.addEventListener("dblclick", deleteShape);

    //clear painting area
    clearArea.addEventListener("click", clearPaintArea);

    /**
     * Each shape will be filled with random color
     * This function generates hexadecimal colors
     */
    function randomColor() {
        //hex colors
        const colors = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B', 'C', 'D', 'E', 'F'];

        return "#" + colors[Math.floor(Math.random() * 15)] +
            colors[Math.floor(Math.random() * 15)] +
            colors[Math.floor(Math.random() * 15)] +
            colors[Math.floor(Math.random() * 15)] +
            colors[Math.floor(Math.random() * 15)] +
            colors[Math.floor(Math.random() * 15)];
    }

    /**
     * Store some basic values each time on mouse down
     * @param {Event} e 
     */
    function startDrawing(e) {
        drawing = true;

        backgroundColor = randomColor();

        //starting mouse position
        posX = e.clientX - canvas.getBoundingClientRect().left;
        posY = e.clientY - canvas.getBoundingClientRect().top;

        /**
         * Module 2: dragging rectangle
         */
        //check mouse position for each rectangle
        for (i = 0; i < shapes.length; i++) {
            if (isMouseOnShape(posX, posY, shapes[i])) {
                shapeIndex = i;
                isDragging = true;
                break;
            }
        }
    }

    /**
     * Check if mouse position lies in rectangle
     * 
     * @param {Number} mouse at x-axis currently
     * @param {Number} mouse at y-axis currently
     * @param {Object} rectangle
     */
    function isMouseOnShape(x, y, shape) {

        //check if shape is circle
        if (shape.r) {
            //circle formula : (x - h) ^ 2 + (y - k) ^ 2 = r ^ 2
            xh = x - shape.x;
            yk = y - shape.y;

            if ((xh * xh + yk * yk) < (shape.r * shape.r)) {
                //mouse is inside circle
                return true;
            }

        } else {
            /**
             * checking for negative width and height
             */
            if (shape.w < 0 && shape.h < 0) {
                if (x > (shape.x + shape.w) && x < shape.x && y > (shape.y + shape.h) && y < shape.y) {
                    return true;
                }
            } else if (shape.w < 0) {
                if (x > (shape.x + shape.w) && x < shape.x && y < (shape.y + shape.h) && y > shape.y) {
                    return true;
                }
            } else if (shape.h < 0) {
                if (x < (shape.x + shape.w) && x > shape.x && y > (shape.y + shape.h) && y < shape.y) {
                    return true;
                }
            } else {
                if (x < (shape.x + shape.w) && x > shape.x && y < (shape.y + shape.h) && y > shape.y) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Start drawing rectangle on mouse move
     * @param {Event} e 
     */
    function drawRactangle(e) {
        if (!drawing) return;

        posXNow = parseInt(e.clientX - canvas.getBoundingClientRect().left);
        posYNow = parseInt(e.clientY - canvas.getBoundingClientRect().top);

        shapeWidth = posXNow - posX;
        shapeHeight = posYNow - posY;

        //Module 2 : check if isDragging 
        if (isDragging) {

            let shape = shapes[shapeIndex];

            shape.x += shapeWidth;
            shape.y += shapeHeight;

            clearAndRedraw();

            posX = posXNow;
            posY = posYNow;

            return;
        }

        clearAndRedraw();
        ctx.beginPath();
        switch (shapeToDraw) {
            case "rectangle": //draw rectangle
                drawRectangleBorder(posX, posY, shapeWidth, shapeHeight);
                ctx.fillStyle = backgroundColor;
                ctx.rect(posX, posY, shapeWidth, shapeHeight);
                ctx.fill();
                rectDrawn = true;
                break;
            case "circle": //draw circle
                ctx.strokeStyle = "black";
                ctx.lineWidth = 2;
                ctx.fillStyle = backgroundColor;
                ctx.arc(posX, posY, Math.abs(shapeWidth), 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
                circleDrawn = true;
                break;

            case "line": //free hand drawing
                ctx.lineWidth = 3;
                ctx.strokeStyle = backgroundColor;
                ctx.moveTo(posX, posY);
                ctx.lineTo(posXNow, posYNow);
                ctx.stroke();
                lineDrawn = true;
                break;
            default:
                console.log("Simple paint app");
                break;
        }
    }

    /**
     * Rectangle border
     */

    function drawRectangleBorder(x, y, w, h) {
        ctx.fillStyle = "#000000";

        if (w < 0 && h < 0)
            ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
        else if (w < 0)
            ctx.fillRect(x + 2, y - 2, w - 4, h + 4);
        else if (h < 0)
            ctx.fillRect(x - 2, y + 2, w + 4, h - 4);
        else
            ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
    }

    /**
     * End drawing on mouse up
     * @param {Event} e 
     */
    function endDrawing(e) {
        drawing = false;
        isDragging = false;
        /**
         * if rectangle is drawn in push it to array
         */
        if (rectDrawn) {
            rect = {
                x: posX,
                y: posY,
                w: shapeWidth,
                h: shapeHeight,
                color: backgroundColor
            }
            shapes.push(rect);
        }
        /**
         * if circle is drawn in push it to array
         */
        if (circleDrawn) {
            cir = {
                x: posX,
                y: posY,
                r: shapeWidth,
                color: backgroundColor
            }

            shapes.push(cir);
        }
        /**
         * if line is drawn in push it to array
         */
        if (lineDrawn) {
            line = {
                x: posX,
                y: posY,
                lx: posXNow,
                ly: posYNow,
                color: backgroundColor
            }

            shapes.push(line);
        }

        rectDrawn = false;
        circleDrawn = false;
        lineDrawn = false;
    }

    /**
     * Module 2 : Delete rectangle on double click
     */

    function deleteShape(e) {
        clickPosX = e.clientX - canvas.getBoundingClientRect().left;
        clickPosY = e.clientY - canvas.getBoundingClientRect().top;

        for (i = 0; i < shapes.length; i++) {
            if (isMouseOnShape(clickPosX, clickPosY, shapes[i])) {
                shapes.splice(i, 1);
                clearAndRedraw();
                break;
            }
        }
    }

    /**
     * This function clears and redraw all the shapes on each mouse move
     */
    function clearAndRedraw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < shapes.length; i++) {
            shape = shapes[i];

            if (shape.r) {
                ctx.beginPath();
                ctx.strokeStyle = "black";
                ctx.lineWidth = 2;
                ctx.fillStyle = shape.color;
                ctx.arc(shape.x, shape.y, Math.abs(shape.r), 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
            } else if (shape.w) {
                drawRectangleBorder(shape.x, shape.y, shape.w, shape.h);

                ctx.fillStyle = shape.color;
                ctx.beginPath();
                ctx.rect(shape.x, shape.y, shape.w, shape.h);
                ctx.fill()
            } else {
                ctx.beginPath();
                ctx.lineWidth = 3;
                ctx.strokeStyle = shape.color;
                ctx.moveTo(shape.x, shape.y);
                ctx.lineTo(shape.lx, shape.ly);
                ctx.stroke();
            }
        }
    }

    /**
     * Clear canvas when clear button is pressed
     */
    function clearPaintArea() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        shapes = [];
    }
})