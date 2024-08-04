class Particle {
    constructor(x, y, d, w, h, level) {
        this.x = x;
        this.y = y;
        this.d = d;
        this.w = w;
        this.h = h;
        this.level = level;
        this.respawn();
    }

    respawn() {
        this.x = Math.random() * (this.w * 0.8) + (0.1 * this.w);
        this.y = Math.random() * 30 + this.h - (this.h - 100) * this.level / 100 - 50 + 50;
        this.d = Math.random() * 5 + 5;
    }
}

class ParticleAnimation {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.particles = [];
        this.level = 50; // Initial level set to 50%
        this.fill = false;
        this.color = "blue"; // Default color to blue
        this.c = 0;
        this.aniId = null;
        this.resize(); // Call resize to initialize size
        this.init(); // Initialize particles and start drawing
    }

    init() {
        this.particles = [];
        for (let i = 0; i < 40; i++) {
            const obj = new Particle(0, 0, 0, this.canvas.width, this.canvas.height, this.level);
            this.particles.push(obj);
        }
        this.draw();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = this.color;
        this.ctx.strokeStyle = this.color;

        // Draw the liquid
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width, this.canvas.height - (this.canvas.height - 100) * this.level / 100 - 50);
        this.ctx.lineTo(this.canvas.width, this.canvas.height);
        this.ctx.lineTo(0, this.canvas.height);
        this.ctx.lineTo(0, this.canvas.height - (this.canvas.height - 100) * this.level / 100 - 50);
        const temp = (50 * Math.sin(this.c * 1 / 50));
        this.ctx.bezierCurveTo(
            (this.canvas.width / 3), this.canvas.height - (this.canvas.height - 100) * this.level / 100 - 50 - temp,
            (2 * this.canvas.width / 3), this.canvas.height - (this.canvas.height - 100) * this.level / 100 - 50 + temp,
            this.canvas.width, this.canvas.height - (this.canvas.height - 100) * this.level / 100 - 50
        );
        this.ctx.fill();

        // Draw the bubbles
        for (const particle of this.particles) {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.d, 0, 2 * Math.PI);
            if (this.fill) {
                this.ctx.fill();
            } else {
                this.ctx.stroke();
            }
        }

        // Debug
        this.ctx.fillStyle = "black";
        this.ctx.fillText(`c:${this.c} lv:${this.level}`, 10, 10);

        this.update();
        this.aniId = window.requestAnimationFrame(() => this.draw());
    }

    update() {
        this.c++;
        if (100 * Math.PI <= this.c) {
            this.c = 0;
        }
        for (const particle of this.particles) {
            particle.x += Math.random() * 2 - 1;
            particle.y -= 1;
            particle.d -= 0.04;
            if (particle.d <= 0) {
                particle.respawn();
            }
        }
    }

    resize() {
        this.canvas.width = window.innerWidth / document.querySelectorAll('.particle-canvas').length;
        this.canvas.height = window.innerHeight;
        // Reinitialize particles when resizing
        this.init();
    }
}

function updateCanvasSizes() {
    const container = document.getElementById('tasksContainer');
    const canvases = container.querySelectorAll('.particle-canvas');
    const containerWidth = container.clientWidth;
    const canvasWidth = containerWidth / canvases.length;

    canvases.forEach(canvas => {
        canvas.width = canvasWidth;
        canvas.height = window.innerHeight;
        if (canvas._particleAnimation) {
            canvas._particleAnimation.canvas.width = canvasWidth;
            canvas._particleAnimation.canvas.height = window.innerHeight;
            canvas._particleAnimation.init();
        }
    });
}

function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskText = taskInput.value.trim();
    if (taskText === '') return;

    const taskContainer = document.createElement('div');
    taskContainer.className = 'task-container';
    taskContainer.innerHTML = `
        <canvas class="particle-canvas"></canvas>
        <div class="checklist-popup">
            <input type="text" class="checklist-item-text" placeholder="Enter checklist item text">
            <button class="add-checklist-item" onclick="addChecklistItem(this)">Add Checklist Item</button>
            <div class="checklist">
                <div class="checklist-items"></div>
                <div class="checklist-progress">0%</div>
            </div>
        </div>
    `;

    const tasksContainer = document.getElementById('tasksContainer');
    tasksContainer.appendChild(taskContainer);

    const canvas = taskContainer.querySelector('.particle-canvas');
    if (!canvas._particleAnimation) {
        canvas._particleAnimation = new ParticleAnimation(canvas);
    }

    updateCanvasSizes();
}

function addChecklistItem(button) {
    const checklistPopup = button.parentElement;
    const taskContainer = checklistPopup.parentElement;
    const checklistItems = checklistPopup.querySelector('.checklist-items');
    const checklistItemText = checklistPopup.querySelector('.checklist-item-text').value.trim();

    if (checklistItemText === '') return;

    const checklistItem = document.createElement('div');
    checklistItem.className = 'checklist-item';
    checklistItem.innerHTML = `
        <input type="checkbox">
        <label>${checklistItemText}</label>
    `;

    checklistItems.appendChild(checklistItem);
    updateProgress(checklistPopup);
}

function updateProgress(popup) {
    const items = popup.querySelectorAll('.checklist-item input[type="checkbox"]');
    const checkedItems = popup.querySelectorAll('.checklist-item input[type="checkbox"]:checked');
    const progress = (checkedItems.length / items.length) * 100;
    popup.querySelector('.checklist-progress').textContent = `${Math.round(progress)}%`;
}

window.addEventListener('resize', updateCanvasSizes);

window.addEventListener('load', () => {
    updateCanvasSizes(); // Set initial sizes
});
