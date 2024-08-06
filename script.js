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
        this.y += ((this.level - level) / 100) * 10;
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
        this.setRandomFloatDuration();
    }

    setRandomFloatDuration() {
        const duration = Math.random() * 3 + 2;
        this.canvas.style.animationDuration = `${duration}s`;
    }

    init() {
        this.particles = Array.from({ length: 40 }, () =>
            new Particle(0, 0, 0, this.canvas.width, this.canvas.height, this.currentLevel)
        );
        this.draw();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = this.color;
        this.ctx.strokeStyle = this.color;
    
        if (this.transitionStartTime) {
            const elapsed = Date.now() - this.transitionStartTime;
            const progress = Math.min(elapsed / this.transitionDuration, 1);
            this.currentLevel = this.transitionStartLevel + (this.targetLevel - this.transitionStartLevel) * progress;
            if (progress === 1) this.transitionStartTime = null;
            this.particles.forEach(particle => particle.update(this.currentLevel));
        }
    
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width, this.canvas.height - (this.canvas.height - 100) * this.currentLevel / 100 - 50);
        this.ctx.lineTo(this.canvas.width, this.canvas.height);
        this.ctx.lineTo(0, this.canvas.height);
        this.ctx.lineTo(0, this.canvas.height - (this.canvas.height - 100) * this.currentLevel / 100 - 50);
        const temp = 50 * Math.sin(this.c / 50);
        this.ctx.bezierCurveTo(
            (this.canvas.width / 3), this.canvas.height - (this.canvas.height - 100) * this.currentLevel / 100 - 50 - temp,
            (2 * this.canvas.width / 3), this.canvas.height - (this.canvas.height - 100) * this.currentLevel / 100 - 50 + temp,
            this.canvas.width, this.canvas.height - (this.canvas.height - 100) * this.currentLevel / 100 - 50
        );
        this.ctx.fill();
    
        this.particles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.d, 0, 2 * Math.PI);
            this.fill ? this.ctx.fill() : this.ctx.stroke();
        });
    
        this.ctx.save();
        this.ctx.font = '20px Arial';
        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.rotate(-90 * Math.PI / 180);
        this.ctx.fillText(this.text, 0, 0);
        this.ctx.restore();
    
        this.update();
        this.aniId = window.requestAnimationFrame(() => this.draw());
    }
    

    update() {
        this.c = (this.c + 1) % (100 * Math.PI);
        this.particles.forEach(particle => {
            particle.x += Math.random() * 2 - 1;
            particle.y -= 1;
            particle.d -= 0.04;
            if (particle.d <= 0) particle.respawn();
        });
    }

    resize() {
        this.canvas.width = (window.innerWidth * 0.7) / document.querySelectorAll('.particle-canvas').length;
        this.canvas.height = window.innerHeight * 0.8;
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
    const allColors = [...group1, ...group2];
    const availableColors = allColors.filter(color => !canvasColors.includes(color));
    if (canvasColors.length > 4) canvasColors = canvasColors.slice(-4);
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

function saveTasks() {
    const tasks = Array.from(document.querySelectorAll('.task-container')).map(taskContainer => {
        const taskText = taskContainer.querySelector('.particle-canvas')._particleAnimation.text;
        const checklistItems = Array.from(taskContainer.querySelectorAll('.checklist-item')).map(item => ({
            text: item.querySelector('label').textContent.trim(),
            checked: item.querySelector('input').checked
        }));
        return { taskText, checklistItems };
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskText = taskInput.value.trim();
    if (!taskText) return;

    const taskContainer = document.createElement('div');
    taskContainer.className = 'task-container';
    taskContainer.innerHTML = `
        <button class="btn-circle delete-task-btn">x</button>
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
    document.getElementById('tasksContainer').appendChild(taskContainer);

    const canvas = taskContainer.querySelector('.particle-canvas');
    const color = getRandomColor();
    canvas._particleAnimation = new ParticleAnimation(canvas, taskText, color);
    canvas._particleAnimation.setLevel(50);

    const deleteBtn = taskContainer.querySelector('.delete-task-btn');
    deleteBtn.addEventListener('click', () => deleteTask(deleteBtn));

    canvas.addEventListener('click', (event) => {
        event.stopPropagation();
        const isVisible = deleteBtn.style.display === 'block';
        hideAllPopups();
        if (!isVisible) {
            deleteBtn.style.display = 'block';
            taskContainer.querySelector('.checklist-popup').style.display = 'flex';
            taskContainer.querySelector('.checklist-popup').style.height = 'auto';
            taskContainer.querySelector('.checklist-popup').style.opacity = '1';
            taskContainer.querySelector('.checklist-popup .checklist-item-text').focus();
        }
    });

    hideAllPopups();
    updateCanvasSizes();
    updateTaskVisibility();
    saveTasks();
}

function loadTasks() {
    const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    savedTasks.forEach(task => {
        const taskContainer = document.createElement('div');
        taskContainer.className = 'task-container';
        taskContainer.innerHTML = `
            <button class="btn-circle delete-task-btn">x</button>
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
        const canvas = taskContainer.querySelector('.particle-canvas');
        const color = getRandomColor();
        const particleAnimation = new ParticleAnimation(canvas, task.taskText, color);
        canvas._particleAnimation = particleAnimation;

        const deleteBtn = taskContainer.querySelector('.delete-task-btn');
        deleteBtn.addEventListener('click', () => deleteTask(deleteBtn));

        canvas.addEventListener('click', (event) => {
            event.stopPropagation();
            const isVisible = deleteBtn.style.display === 'block';
            hideAllPopups();
            if (!isVisible) {
                deleteBtn.style.display = 'block';
                taskContainer.querySelector('.checklist-popup').style.display = 'flex';
                taskContainer.querySelector('.checklist-popup').style.height = 'auto';
                taskContainer.querySelector('.checklist-popup').style.opacity = '1';
                taskContainer.querySelector('.checklist-popup .checklist-item-text').focus();
            }
        });

        const checklistPopup = taskContainer.querySelector('.checklist-popup');
        const checklistItemsContainer = taskContainer.querySelector('.checklist-items');
        task.checklistItems.forEach(item => {
            const itemContainer = document.createElement('div');
            itemContainer.className = 'checklist-item';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = item.checked;
            const label = document.createElement('label');
            label.textContent = item.text;
            const deleteButton = document.createElement('button');
            deleteButton.className = 'checklist-item-delete';
            deleteButton.textContent = 'x';
            deleteButton.onclick = () => {
                itemContainer.remove();
                updateChecklistProgress(checklistPopup);
                saveTasks();
            };
            itemContainer.append(checkbox, label, deleteButton);
            checklistItemsContainer.appendChild(itemContainer);

            checkbox.addEventListener('change', () => {
                updateChecklistProgress(checklistPopup);
                saveTasks();
            });
        });

        document.getElementById('tasksContainer').appendChild(taskContainer);
        updateChecklistProgress(checklistPopup);
    });

    updateTaskVisibility();
}

function updateChecklistProgress(popup) {
    const checklistItems = popup.querySelectorAll('.checklist-item');
    const checkedItems = popup.querySelectorAll('.checklist-item input:checked').length;
    const progress = checklistItems.length === 0 ? 50 : Math.round((checkedItems / checklistItems.length) * 100);
    popup.querySelector('.checklist-progress').textContent = `${progress}%`;

    const taskContainer = popup.closest('.task-container');
    const canvas = taskContainer.querySelector('.particle-canvas');
    if (canvas._particleAnimation) canvas._particleAnimation.setLevel(progress);
}

function addChecklistItem(button) {
    const popup = button.parentElement.parentElement;
    const input = popup.querySelector('.checklist-item-text');
    const checklistItems = popup.querySelector('.checklist-items');
    const itemText = input.value.trim();
    if (!itemText) return;

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
        saveTasks();
    };
    itemContainer.append(checkbox, label, deleteButton);
    checklistItems.appendChild(itemContainer);

    input.value = '';
    updateChecklistProgress(popup);

    checkbox.addEventListener('change', () => {
        updateChecklistProgress(popup);
        saveTasks();
    });

    saveTasks();
}

function updateCanvasSizes() {
    document.querySelectorAll('.particle-canvas').forEach(canvas => {
        if (canvas._particleAnimation) canvas._particleAnimation.resize();
    });
}

function deleteTask(button) {
    button.closest('.task-container').remove();
    saveTasks();
    updateTaskVisibility();
}

function handleClickOutside(event) {
    if (!event.target.closest('.particle-canvas') && !event.target.closest('.checklist-popup') && !event.target.closest('.delete-task-btn')) {
        hideAllPopups();
        document.querySelectorAll('.delete-task-btn').forEach(btn => btn.style.display = 'none');
    }
}

function hideAllPopups() {
    document.querySelectorAll('.checklist-popup').forEach(popup => {
        popup.style.opacity = '0';
        popup.style.height = '0';
        setTimeout(() => {
            if (popup.style.opacity === '0') popup.style.display = 'none';
        }, 400);
    });
}

function updateTaskVisibility() {
    const tasksContainer = document.getElementById('tasksContainer');
    const noTasksText = document.getElementById('noTasksText');
    noTasksText.style.display = tasksContainer.children.length === 0 ? 'inline-block' : 'none';
    saveTasks();
}

document.addEventListener('mousedown', handleClickOutside);
document.getElementById('taskInput').addEventListener('blur', () => {
    if (isTaskInputFocused) hideTaskInput();
});
document.getElementById('taskInput').addEventListener('keypress', event => {
    if (event.key === 'Enter') addTask();
});
document.getElementById('addTaskBtn').addEventListener('click', showTaskInput);
document.addEventListener('keypress', event => {
    if (event.key === 'Enter') {
        const focusedInput = document.querySelector('.checklist-item-text:focus');
        if (focusedInput) {
            addChecklistItem(focusedInput.nextElementSibling);
            event.preventDefault();
        }
    }
});
window.addEventListener('resize', updateCanvasSizes);
window.addEventListener('load', () => {
    loadTasks();
    updateCanvasSizes();
    updateTaskVisibility();
});
