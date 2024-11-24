// Create clock element
const clock = document.createElement('div');
clock.id = 'clock';
clock.className = 'clock';
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

const cont = document.querySelector('.container');
var clockCont = document.querySelector('#clock').getBoundingClientRect();
var todoCont = document.querySelector('#todoContainer').getBoundingClientRect();

// Draw bounding box for todoCont
var todoBoundingBox = document.createElement('div');
todoBoundingBox.style.position = 'absolute';
todoBoundingBox.style.top = `${todoCont.top}px`;
todoBoundingBox.style.left = `${todoCont.left}px`;
todoBoundingBox.style.width = `${todoCont.width}px`;
todoBoundingBox.style.height = `${todoCont.height}px`;
todoBoundingBox.style.border = '2px solid red';
cont.appendChild(todoBoundingBox);

// Draw bounding box for clockCont
var clockBoundingBox = document.createElement('div');
clockBoundingBox.style.position = 'absolute';
clockBoundingBox.style.top = `${clockCont.top}px`;
clockBoundingBox.style.left = `${clockCont.left}px`;
clockBoundingBox.style.width = `${clockCont.width}px`;
clockBoundingBox.style.height = `${clockCont.height}px`;
clockBoundingBox.style.border = '2px solid blue';
cont.appendChild(clockBoundingBox);

class Bubble {
    constructor(text) {
        this.element = document.createElement('div');
        this.element.className = 'bubble';
        this.element.textContent = text;
        this.element.style.width = `${text.length * 15}px`; // Assuming 15px per character
        var bubCont = this.element.getBoundingClientRect();

        var randomX = Math.floor(Math.random() * (cont.innerWidth - 100)) + 50;
        var randomY = Math.floor(Math.random() * (cont.innerHeight - 100)) + 50;
        /*
        if(randomX + bubX > todoCont.left && randomY < (todoCont.left + todoCont.width) && 
            randomY + bubY > todoCont.top && randomY < todoCont.bottom){
            while(randomY + bubY > todoCont.top && randomY < todoCont.bottom){
                randomY = Math.floor(Math.random() * (cont.innerHeight - 100)) + 50;
            }
        }else if(randomX + bubX > clockCont.left && randomY < (clockCont.left+clockCont.width) && randomY < (todoCont.top + clockCont.heigth)){
            while(randomY < todoCont.bottom){
                randomY = Math.floor(Math.random() * (cont.innerHeight - 100)) + 50;
            }
        }
        */

        this.element.style.top = `${randomY}px`;
        this.element.style.left = `${randomX}px`;
        cont.appendChild(this.element);

        const bubbleBox = document.createElement('div');
        bubbleBox.style.position = 'absolute';
        bubbleBox.style.top = `${bubCont.top}px`;
        bubbleBox.style.left = `${bubCont.left}px`;
        bubbleBox.style.width = `${bubCont.width}px`;
        bubbleBox.style.height = `${bubCont.height}px`;
        bubbleBox.style.border = '2px solid green';
        cont.appendChild(bubbleBox);

    }
}

// Function to create new bubble
function createBubble(text) {
    new Bubble(text);
}

function createTodoElement(todo) {
    const li = document.createElement('li');
    li.className = 'todo-item' + (todo.completed ? ' completed' : '');
    li.innerHTML = `
        <input type="checkbox" ${todo.completed ? 'checked' : ''}>
        <span contenteditable="true">${todo.text}</span>
        <button class="delete-todo">×</button>
    `;

    clockCont = document.querySelector('#clock').getBoundingClientRect();
    todoCont = document.querySelector('#todoContainer').getBoundingClientRect();
    // Draw bounding box for todoCont
    todoBoundingBox.style.top = `${todoCont.top}px`;
    todoBoundingBox.style.left = `${todoCont.left}px`;
    todoBoundingBox.style.width = `${todoCont.width}px`;
    todoBoundingBox.style.height = `${todoCont.height}px`;

    // Draw bounding box for clockCont
    clockBoundingBox = document.createElement('div');
    clockBoundingBox.style.top = `${clockCont.top}px`;
    clockBoundingBox.style.left = `${clockCont.left}px`;
    clockBoundingBox.style.width = `${clockCont.width}px`;
    clockBoundingBox.style.height = `${clockCont.height}px`;

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
        clockCont = document.querySelector('#clock').getBoundingClientRect();
        todoCont = document.querySelector('#todoContainer').getBoundingClientRect();
        // Draw bounding box for todoCont
        todoBoundingBox.style.top = `${todoCont.top}px`;
        todoBoundingBox.style.left = `${todoCont.left}px`;
        todoBoundingBox.style.width = `${todoCont.width}px`;
        todoBoundingBox.style.height = `${todoCont.height}px`;

        // Draw bounding box for clockCont
        clockBoundingBox = document.createElement('div');
        clockBoundingBox.style.top = `${clockCont.top}px`;
        clockBoundingBox.style.left = `${clockCont.left}px`;
        clockBoundingBox.style.width = `${clockCont.width}px`;
        clockBoundingBox.style.height = `${clockCont.height}px`;
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