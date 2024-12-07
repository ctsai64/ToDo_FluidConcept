function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    clock.textContent = `${hours}:${minutes}:${seconds}`;
}

updateClock();
setInterval(updateClock, 1000);

let todos = JSON.parse(localStorage.getItem('todos')) || [];

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
    const bubbles = Array.from(document.querySelectorAll('.bubble')).map(bubble => ({
        text: bubble.textContent,
        index: parseFloat(bubble.style.getPropertyValue('--bubble-index'))
    }));
    localStorage.setItem('bubbles', JSON.stringify(bubbles));
}

class Bubble {
    constructor(text, container, index) {
        this.element = document.createElement('div');
        this.element.className = 'bubble';
        this.element.textContent = text;
        this.element.style.setProperty('--bubble-index', index);
        container.appendChild(this.element);
        
        const bubbleWidth = parseFloat(getComputedStyle(this.element).width);
        const bubbleHeight = parseFloat(getComputedStyle(this.element).height) + 20;
        const todoCont = getComputedStyle(document.getElementById('todoContainer'));

        var x = Math.random() * container.offsetWidth - bubbleWidth;
        var y = Math.random() * container.offsetHeight - bubbleHeight;

        while(x > parseFloat(todoCont.left) - bubbleWidth
        && x < parseFloat(todoCont.left) + parseFloat(todoCont.width) + 2 * parseFloat(todoCont.paddingRight) + 2 * bubbleWidth 
        && y > parseFloat(todoCont.top) - bubbleHeight 
        && y < parseFloat(todoCont.top) + parseFloat(todoCont.height) + 2 * parseFloat(todoCont.paddingBottom) + 3 * bubbleHeight){            
            x = Math.random() * container.offsetWidth;
            y = Math.random() * container.offsetHeight;
        }

        
        /*
        const todoContBox = document.createElement('div');
        todoContBox.id = 'todoContBox'
        todoContBox.style.position = 'absolute';
        todoContBox.style.left = `${parseFloat(todoCont.left) - bubbleWidth}px`;
        todoContBox.style.top = `${parseFloat(todoCont.top) - bubbleHeight}px`;
        todoContBox.style.width = `${parseFloat(todoCont.width) + 2 * parseFloat(todoCont.paddingRight) + 2 * bubbleWidth}px`;
        todoContBox.style.height = `${parseFloat(todoCont.height) + 2 * parseFloat(todoCont.paddingBottom) + 3 * bubbleHeight}px`;
        todoContBox.style.border = '1px solid white';
        const existingTodoContBox = document.getElementById('todoContBox');
        if (existingTodoContBox) {
            existingTodoContBox.remove();
        }
        container.appendChild(todoContBox);
        */

        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;
    }
}

/*
function loadBubbles() {
    const bubbles = JSON.parse(localStorage.getItem('bubbles')) || [];
    const existingBubbles = document.querySelectorAll('.bubble');
    existingBubbles.forEach(bubble => bubble.remove());
    bubbles.forEach((bubble) => {
        createBubble(bubble.text);
    });
}
*/

const bubblesContainer = document.getElementById('bubblesContainer');

function createBubble(text) {
    const bubbleIndex = document.querySelectorAll('.bubble').length;
    new Bubble(text, bubblesContainer, bubbleIndex);
    saveTodos();
}

function createTodoElement(todo) {
    const li = document.createElement('li');
    li.className = 'todo-item' + (todo.completed ? ' completed' : '');
    li.innerHTML = `
        <input type="checkbox" ${todo.completed ? 'checked' : ''}>
        <span contenteditable="true">${todo.text}</span>
        <button class="delete-todo">×</button>
    `;
    createBubble(todo.text);

    const checkbox = li.querySelector('input');
    checkbox.addEventListener('change', () => {
        todo.completed = checkbox.checked;
        li.classList.toggle('completed');
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

    const todoCont = document.getElementById('todoContainer');
    const bubbles = document.querySelectorAll('.bubble');
    bubbles.forEach(bubble => {
        const bubbleRect = bubble.getBoundingClientRect();
        const todoContRect = todoCont.getBoundingClientRect();
        /*working here*/
        if (bubbleRect.left < todoContRect.right && bubbleRect.right > todoContRect.left && bubbleRect.top < todoContRect.bottom && bubbleRect.bottom > todoContRect.top) {
            var newX = Math.random() * (document.body.offsetWidth - bubble.offsetWidth);
            var newY = Math.random() * (document.body.offsetHeight - bubble.offsetHeight);
            while(newX > parseFloat(todoCont.left) - bubbleWidth
                && newX < parseFloat(todoCont.left) + parseFloat(todoCont.width) + 2 * parseFloat(todoCont.paddingRight) + 2 * bubbleWidth 
                && newY > parseFloat(todoCont.top) - bubbleHeight 
                && newY < parseFloat(todoCont.top) + parseFloat(todoCont.height) + 2 * parseFloat(todoCont.paddingBottom) + 3 * bubbleHeight){            
                    newX = Math.random() * container.offsetWidth;
                    newY = Math.random() * container.offsetHeight;
                }
            bubble.style.transition = 'left 0.5s ease, top 0.5s ease';
            bubble.style.left = `${newX}px`;
            bubble.style.top = `${newY}px`;
        }
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

todos.forEach(todo => {document.getElementById('todoList').appendChild(createTodoElement(todo));});