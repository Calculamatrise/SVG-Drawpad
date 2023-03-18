import Tool from "./Tool.js";

export default class extends Tool {
    _size = 4;
    color = null;
    segmentLength = 5;
    element = document.createElementNS("http://www.w3.org/2000/svg", 'ellipse');
    get current() {
        const lines = [];
        for (let i = 0; i <= 360; i += this.segmentLength) {
            const temp = document.createElementNS("http://www.w3.org/2000/svg", 'line');
            temp.style.setProperty('stroke', this.color);
            temp.style.setProperty('stroke-width', this.size);
            temp.setAttribute('x1', this.x + this.width * Math.cos(i * Math.PI / 180));
            temp.setAttribute('y1', this.y + this.height * Math.sin(i * Math.PI / 180));
            temp.setAttribute('x2', this.x + this.width * Math.cos((i + this.segmentLength) * Math.PI / 180));
            temp.setAttribute('y2', this.y + this.height * Math.sin((i + this.segmentLength) * Math.PI / 180));
            temp.erase = function(event) {
                let vector = {
                    x: this.getAttribute('x2') - window.canvas.viewBox.x - this.getAttribute('x1') - window.canvas.viewBox.x,
                    y: this.getAttribute('y2') - window.canvas.viewBox.y - this.getAttribute('y1') - window.canvas.viewBox.y
                }

                let len = Math.sqrt(vector.x ** 2 + vector.y ** 2);
                let b = (this.getAttribute('x1') - window.canvas.viewBox.x - event.offsetX) * (vector.x / len) + (this.getAttribute('y1') - window.canvas.viewBox.y - event.offsetY) * (vector.y / len);
                if (b >= len) {
                    vector.x = this.getAttribute('x2') - window.canvas.viewBox.x - event.offsetX;
                    vector.y = this.getAttribute('y2') - window.canvas.viewBox.y - event.offsetY;
                } else {
                    let { x, y } = window.structuredClone(vector);
                    vector.x = this.getAttribute('x1') - window.canvas.viewBox.x - event.offsetX;
                    vector.y = this.getAttribute('y1') - window.canvas.viewBox.y - event.offsetY;
                    if (b > 0) {
                        vector.x += x / len * b;
                        vector.y += y / len * b;
                    }
                }

                return Math.sqrt(vector.x ** 2 + vector.y ** 2) - this.style.getPropertyValue('stroke-width') / 2 <= window.canvas.tool.size && !this.remove();
            }

            lines.push(temp);
        }

        return lines;
    }

    get width() {        
        return Math.sqrt((this.mouse.position.x - this.mouse.pointA.x) ** 2);
    }

    get height() {        
        return Math.sqrt((this.mouse.position.y - this.mouse.pointA.y) ** 2);
    }

    init() {
        this.element.style.setProperty('stroke', this.color = this.canvas.primary);
        this.element.style.setProperty('fill', this.canvas.fill ? this.canvas.primary : "#FFFFFF00");
        this.element.style.setProperty('stroke-width', this.size);
    }

    press() {
        this.element.style.setProperty('stroke', this.color = this.canvas.primary);
        this.element.style.setProperty('fill', this.canvas.fill ? this.canvas.primary : "#FFFFFF00");
        this.element.style.setProperty('stroke-width', this.size);
        this.element.setAttribute('cx', this.mouse.pointA.x);
        this.element.setAttribute('cy', this.mouse.pointA.y);
        this.element.setAttribute('rx', 1);
        this.element.setAttribute('ry', 1);

        this.canvas.layer.base.appendChild(this.element);
    }

    stroke() {
        // const points = []
        // for (let i = 0; i <= 360; i += this.segmentLength/*1000 / (this.width / 2 + this.height / 2) / 2 / 10*/) {
        //     points.push([
        //         this.x + this.width * Math.cos(i * Math.PI / 180),
        //         this.y + this.height * Math.sin(i * Math.PI / 180)
        //     ]);
        // }

        this.element.style.setProperty('stroke-width', this.size);
        this.element.setAttribute('rx', Math.sqrt((this.mouse.position.x - this.mouse.pointA.x) ** 2) || 1);
        this.element.setAttribute('ry', Math.sqrt((this.mouse.position.y - this.mouse.pointA.y) ** 2) || 1);
    }
    
    clip() {
        this.element.remove();
        if (this.mouse.pointA.x === this.mouse.pointB.x && this.mouse.pointA.y === this.mouse.pointB.y) {
            return;
        }

        const ellipse = this.element.cloneNode();
        ellipse.erase = function(event) {
            let vector = {
                x: this.getAttribute('cx') - window.canvas.viewBox.x - event.offsetX,
                y: this.getAttribute('cy') - window.canvas.viewBox.y - event.offsetY
            }

            return Math.sqrt(vector.x ** 2 / (~~this.getAttribute('rx') + this.style.getPropertyValue('stroke-width') / 2 + window.canvas.tool.size) ** 2 + vector.y ** 2 / (~~this.getAttribute('ry') + this.style.getPropertyValue('stroke-width') / 2 + window.canvas.tool.size) ** 2) <= 1 && (Math.sqrt(vector.x ** 2 / (+this.getAttribute('rx') - this.style.getPropertyValue('stroke-width') / 2 - window.canvas.tool.size) ** 2 + vector.y ** 2 / (+this.getAttribute('ry') - this.style.getPropertyValue('stroke-width') / 2 - window.canvas.tool.size) ** 2) >= 1 || this.getAttribute('rx') < window.canvas.tool.size || this.getAttribute('ry') < window.canvas.tool.size) && !this.remove();
        }

        this.canvas.layer.push(ellipse);
        this.canvas.events.push({
            action: 'add',
            value: ellipse
        });
    }
}