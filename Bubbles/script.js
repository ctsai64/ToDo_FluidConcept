// Create clock element
const clock = document.createElement('div');
clock.id = 'clock';
clock.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%);';
document.querySelector('.container').appendChild(clock);

// Update clock
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    clock.textContent = `${hours}:${minutes}:${seconds}`;
}

// Initial call and set interval
updateClock();
setInterval(updateClock, 1000);

// Todo list functionality
let todos = JSON.parse(localStorage.getItem('todos')) || [];

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}
class Bubble {
    constructor(text, container) {
        this.element = document.createElement('div');
        this.element.className = 'bubble';
        this.element.textContent = text;
        
        // Random position
        const x = Math.random() * (window.innerWidth - 150);
        const y = Math.random() * (window.innerHeight - 150);
        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;
        
        container.appendChild(this.element);
    }
}
// Create bubble container
const bubblesContainer = document.getElementById('bubblesContainer');
// Function to create new bubble
function createBubble(text) {
    new Bubble(text, bubblesContainer);
}

function createTodoElement(todo) {
    const li = document.createElement('li');
    li.className = 'todo-item' + (todo.completed ? ' completed' : '');
    li.innerHTML = `
        <input type="checkbox" ${todo.completed ? 'checked' : ''}>
        <span contenteditable="true">${todo.text}</span>
        <button class="delete-todo">×</button>
    `;
    // Create a bubble for the todo item
    createBubble(todo.text);

    const checkbox = li.querySelector('input');
    checkbox.addEventListener('change', () => {
        todo.completed = checkbox.checked;
        li.classList.toggle('completed');
        // Find and remove the bubble element with matching text
        const bubbles = document.querySelectorAll('.bubble');
        bubbles.forEach(bubble => {
            if (bubble.textContent === todo.text) {
                bubble.classList.add('popping');
                bubble.addEventListener('animationend', () => {
                    bubble.remove();
                });
            }
        });
        saveTodos();
    });

    const span = li.querySelector('span');
    span.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            span.blur();
            todo.text = span.textContent;
            saveTodos();
        }
    });

    const deleteBtn = li.querySelector('.delete-todo');
    deleteBtn.addEventListener('click', () => {
        // Find and remove the bubble element with matching text
        const bubbles = document.querySelectorAll('.bubble');
        bubbles.forEach(bubble => {
            if (bubble.textContent === todo.text) {
                bubble.classList.add('popping');
                bubble.addEventListener('animationend', () => {
                    bubble.remove();
                });
            }
        });
        todos = todos.filter(t => t !== todo);
        li.remove();
        saveTodos();
    });

    return li;
}

function addTodo(text) {
    const todo = {
        text,
        completed: false,
        id: Date.now()
    };
    todos.push(todo);
    const todoList = document.getElementById('todoList');
    todoList.appendChild(createTodoElement(todo));
    saveTodos();
}

// Initialize todo list
document.getElementById('addTodo').addEventListener('click', () => {
    const input = document.getElementById('todoInput');
    const text = input.value.trim();
    if (text) {
        addTodo(text);
        input.value = '';
    }
});

document.getElementById('todoInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const text = e.target.value.trim();
        if (text) {
            addTodo(text);
            e.target.value = '';
        }
    }
});

// Load existing todos
todos.forEach(todo => {
    document.getElementById('todoList').appendChild(createTodoElement(todo));
});