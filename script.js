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

    update(level) {
        this.y = this.y + ((this.level - level) / 100) * 10;
        this.level = level;
    }
}

class ParticleAnimation {
    constructor(canvas, text, color, level = 50) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.particles = [];
        this.currentLevel = level;
        this.targetLevel = level;
        this.transitionStartLevel = level;
        this.transitionStartTime = null;
        this.transitionDuration = 1000;
        this.fill = false;
        this.color = color;
        this.c = 0;
        this.aniId = null;
        this.text = text;
        this.resize();
        this.init();
    }

    init() {
        this.particles = [];
        for (let i = 0; i < 40; i++) {
            const obj = new Particle(0, 0, 0, this.canvas.width, this.canvas.height, this.currentLevel);
            this.particles.push(obj);
        }
        this.draw();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = this.color;
        this.ctx.strokeStyle = this.color;

        if (this.transitionStartTime !== null) {
            const elapsed = Date.now() - this.transitionStartTime;
            const progress = Math.min(elapsed / this.transitionDuration, 1);
            this.currentLevel = this.transitionStartLevel + (this.targetLevel - this.transitionStartLevel) * progress;
            if (progress === 1) {
                this.transitionStartTime = null;
            }
            this.particles.forEach(particle => particle.update(this.currentLevel));
        }

        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width, this.canvas.height - (this.canvas.height - 100) * this.currentLevel / 100 - 50);
        this.ctx.lineTo(this.canvas.width, this.canvas.height);
        this.ctx.lineTo(0, this.canvas.height);
        this.ctx.lineTo(0, this.canvas.height - (this.canvas.height - 100) * this.currentLevel / 100 - 50);
        const temp = (50 * Math.sin(this.c * 1 / 50));
        this.ctx.bezierCurveTo(
            (this.canvas.width / 3), this.canvas.height - (this.canvas.height - 100) * this.currentLevel / 100 - 50 - temp,
            (2 * this.canvas.width / 3), this.canvas.height - (this.canvas.height - 100) * this.currentLevel / 100 - 50 + temp,
            this.canvas.width, this.canvas.height - (this.canvas.height - 100) * this.currentLevel / 100 - 50
        );
        this.ctx.fill();

        for (const particle of this.particles) {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.d, 0, 2 * Math.PI);
            if (this.fill) {
                this.ctx.fill();
            } else {
                this.ctx.stroke();
            }
        }

        this.ctx.font = '20px Arial';
        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(this.text, this.canvas.width / 2, this.canvas.height / 2);

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
        this.canvas.width = (window.innerWidth * 0.9) / document.querySelectorAll('.particle-canvas').length;
        this.canvas.height = window.innerHeight;
        this.init();
    }

    setLevel(level) {
        this.transitionStartLevel = this.currentLevel;
        this.targetLevel = level;
        this.transitionStartTime = Date.now();
    }
}

const group1 = ['#5C9EAD', '#A4A24A', '#E8D57E'];
const group2 = ['#EF7B45', '#B19CD9', '#F6AE2D'];
let canvasColors = [];

function getRandomColor() {
    let availableColors;
    const allColors = [...group1, ...group2];
    availableColors = allColors.filter(color => !canvasColors.includes(color));
    if (canvasColors.length > 4) {
        canvasColors = canvasColors.slice(-4);
    }
    const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)];
    canvasColors.push(randomColor);
    return randomColor;
}

function showTaskInput() {
    const taskInput = document.getElementById('taskInput');
    taskInput.style.display = 'inline-block';
    taskInput.classList.add('active');
    taskInput.focus();
    isTaskInputFocused = true;
}

function hideTaskInput() {
    const taskInput = document.getElementById('taskInput');
    taskInput.classList.remove('active');
    taskInput.addEventListener('transitionend', function handleTransitionEnd() {
        taskInput.style.display = 'none';
        taskInput.removeEventListener('transitionend', handleTransitionEnd);
    });
    taskInput.value = '';
    isTaskInputFocused = false;
}

function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskText = taskInput.value.trim();
    if (taskText === '') return;

    const taskContainer = document.createElement('div');
    taskContainer.className = 'task-container';
    taskContainer.innerHTML = `
        <button class="btn-circle delete-task-btn" onclick="deleteTask(this)">x</button>
        <canvas class="particle-canvas"></canvas>
        <div class="checklist-popup">
            <div class="checklist-input-container">
                <input type="text" class="checklist-item-text" placeholder="Enter checklist item text">
                <button class="add-checklist-item" onclick="addChecklistItem(this)">+</button>
            </div>
            <div class="checklist">
                <div class="checklist-items"></div>
                <div class="checklist-progress">0%</div>
            </div>
        </div>
    `;
    const tasksContainer = document.getElementById('tasksContainer');
    tasksContainer.appendChild(taskContainer);

    const canvas = taskContainer.querySelector('.particle-canvas');
    const color = getRandomColor();
    if (!canvas._particleAnimation) {
        canvas._particleAnimation = new ParticleAnimation(canvas, taskText, color);
    } else {
        canvas._particleAnimation.setLevel(50);
    }

    hideTaskInput();
    updateCanvasSizes();
}

function updateChecklistProgress(popup) {
    const checklistItems = popup.querySelectorAll('.checklist-item');
    const checkedItems = popup.querySelectorAll('.checklist-item input:checked').length;
    const progress = checklistItems.length === 0 ? 50 : Math.round((checkedItems / checklistItems.length) * 100);
    popup.querySelector('.checklist-progress').textContent = `${progress}%`;
    
    const taskContainer = popup.closest('.task-container');
    const canvas = taskContainer.querySelector('.particle-canvas');
    if (canvas._particleAnimation) {
        canvas._particleAnimation.setLevel(progress);
    }
}

function addChecklistItem(button) {
    const popup = button.parentElement.parentElement;
    const input = popup.querySelector('.checklist-item-text');
    const checklistItems = popup.querySelector('.checklist-items');
    const itemText = input.value.trim();
    if (itemText === '') return;

    const itemContainer = document.createElement('div');
    itemContainer.className = 'checklist-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';

    const label = document.createElement('label');
    label.textContent = itemText;

    const deleteButton = document.createElement('button');
    deleteButton.className = 'checklist-item-delete';
    deleteButton.textContent = 'x';
    deleteButton.onclick = () => {
        itemContainer.remove();
        updateChecklistProgress(popup);
    };
    
    itemContainer.appendChild(checkbox);
    itemContainer.appendChild(label);
    label.appendChild(deleteButton);
    checklistItems.appendChild(itemContainer);
    input.value = '';
    updateChecklistProgress(popup);
    checkbox.addEventListener('change', () => {
        updateChecklistProgress(popup);
    });
}

function updateCanvasSizes() {
    document.querySelectorAll('.particle-canvas').forEach(canvas => {
        if (canvas._particleAnimation) {
            canvas._particleAnimation.resize();
        }
    });
}

function deleteTask(button) {
    const taskContainer = button.closest('.task-container');
    taskContainer.remove();
    updateCanvasSizes();
}

let isTaskInputFocused = false;

function handleClickOutside(event) {
    const taskInput = document.getElementById('taskInput');
    if (!taskInput.contains(event.target) && isTaskInputFocused) {
        hideTaskInput();
    }
}

document.addEventListener('mousedown', handleClickOutside);
document.getElementById('taskInput').addEventListener('blur', () => {
    if (isTaskInputFocused) {
        hideTaskInput();
    }
});
document.getElementById('taskInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        addTask();
    }
});
document.getElementById('addTaskBtn').addEventListener('click', showTaskInput);
document.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        const focusedInput = document.querySelector('.checklist-item-text:focus');
        if (focusedInput) {
            const button = focusedInput.nextElementSibling;
            addChecklistItem(button);
            event.preventDefault();
        }
    }
});
window.addEventListener('resize', updateCanvasSizes);
window.addEventListener('load', updateCanvasSizes);
