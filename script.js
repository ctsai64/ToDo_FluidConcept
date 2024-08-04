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
        // Update y position based on the new level
        this.y = this.y + ((this.level - level) / 100) * 10;
        this.level = level;
    }
}

class ParticleAnimation {
    constructor(canvas, text, color, level = 50) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.particles = [];
        this.currentLevel = level; // Current visible level
        this.targetLevel = level; // Target level for transition
        this.transitionStartLevel = level; // Starting level for transition
        this.transitionStartTime = null; // Start time of the transition
        this.transitionDuration = 1000; // Duration of the transition in milliseconds
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

        // Update level based on transition
        if (this.transitionStartTime !== null) {
            const elapsed = Date.now() - this.transitionStartTime;
            const progress = Math.min(elapsed / this.transitionDuration, 1); // Calculate progress of transition

            this.currentLevel = this.transitionStartLevel + (this.targetLevel - this.transitionStartLevel) * progress;
            if (progress === 1) {
                this.transitionStartTime = null; // End the transition
            }
            // Update particles based on new level
            this.particles.forEach(particle => particle.update(this.currentLevel));
        }

        // Draw the liquid
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

        // Draw the task text in the center of the canvas
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
        this.canvas.width = window.innerWidth / document.querySelectorAll('.particle-canvas').length;
        this.canvas.height = window.innerHeight;
        this.init();
    }

    setLevel(level) {
        this.transitionStartLevel = this.currentLevel;
        this.targetLevel = level;
        this.transitionStartTime = Date.now();
    }
}



const colors = ['#5C9EAD', '#C5EDAC', '#EF7B45', '#F6AE2D'];
let lastColor = null;

function getRandomColor(excludeColor) {
    const availableColors = colors.filter(color => color !== excludeColor);
    return availableColors[Math.floor(Math.random() * availableColors.length)];
}

function showTaskInput() {
    const taskInput = document.getElementById('taskInput');
    taskInput.style.display = 'inline-block';
    taskInput.classList.add('active');
    taskInput.focus();
}

function hideTaskInput() {
    const taskInput = document.getElementById('taskInput');
    taskInput.classList.remove('active');
    taskInput.addEventListener('transitionend', function handleTransitionEnd() {
        taskInput.style.display = 'none'; // Hide input box after animation ends
        taskInput.removeEventListener('transitionend', handleTransitionEnd);
    });
    taskInput.value = ''; // Clear input value after hiding
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
    const color = getRandomColor(lastColor);
    lastColor = color;
    if (!canvas._particleAnimation) {
        canvas._particleAnimation = new ParticleAnimation(canvas, taskText, color);
    } else {
        // Set the initial level to 50% for new tasks
        canvas._particleAnimation.setLevel(50);
    }

    hideTaskInput(); // Hide input box after adding task
    updateCanvasSizes();
}

function updateChecklistProgress(popup) {
    const checklistItems = popup.querySelectorAll('.checklist-item');
    const checkedItems = popup.querySelectorAll('.checklist-item input:checked').length;
    const progress = checklistItems.length === 0 ? 50 : Math.round((checkedItems / checklistItems.length) * 100);
    popup.querySelector('.checklist-progress').textContent = `${progress}%`;
    
    // Update canvas level
    const taskContainer = popup.closest('.task-container');
    const canvas = taskContainer.querySelector('.particle-canvas');
    if (canvas._particleAnimation) {
        canvas._particleAnimation.setLevel(progress);
    }
}

function addChecklistItem(button) {
    // Find the checklist popup and input field
    const popup = button.parentElement.parentElement; // Navigate to the popup container
    const input = popup.querySelector('.checklist-item-text');
    const checklistItems = popup.querySelector('.checklist-items');
    
    // Get the item text and trim any whitespace
    const itemText = input.value.trim();
    if (itemText === '') return; // Do nothing if the input is empty

    // Create a new checklist item
    const itemContainer = document.createElement('div');
    itemContainer.className = 'checklist-item';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    
    const label = document.createElement('label');
    label.textContent = itemText;
    
    itemContainer.appendChild(checkbox);
    itemContainer.appendChild(label);
    
    // Add the new item to the checklist
    checklistItems.appendChild(itemContainer);
    
    // Clear the input field
    input.value = '';

    // Update the progress for this task
    updateChecklistProgress(popup);

    // Add event listener to checkbox to update progress when checked/unchecked
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

// Handle Enter key press for adding checklist items
document.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        const focusedInput = document.querySelector('.checklist-item-text:focus');
        if (focusedInput) {
            const button = focusedInput.nextElementSibling;
            addChecklistItem(button);
            event.preventDefault(); // Prevent form submission if inside a form
        }
    }
});

document.getElementById('addTaskBtn').addEventListener('click', showTaskInput);
document.getElementById('taskInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        addTask();
    }
});

window.addEventListener('resize', updateCanvasSizes);
window.addEventListener('load', updateCanvasSizes);
