function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskText = taskInput.value.trim();
    if (taskText === '') return;

    const taskContainer = document.createElement('div');
    taskContainer.className = 'task-bubble';
    taskContainer.innerHTML = `
        <div class="bubble-progress" style="height: 0;"></div>
        <span>${taskText}</span>
        <div class="checklist">
            <div class="checklist-items"></div>
            <div class="checklist-progress">0%</div>
        </div>
    `;

    const checklistItemsContainer = taskContainer.querySelector('.checklist-items');
    const checklistProgress = taskContainer.querySelector('.checklist-progress');
    
    const addChecklistItem = () => {
        const checklistItem = document.createElement('div');
        checklistItem.innerHTML = `
            <input type="checkbox" onchange="updateProgress(this)">
            <label>New checklist item</label>
        `;
        checklistItemsContainer.appendChild(checklistItem);
    };
    
    const updateProgress = (checkbox) => {
        const checklistItems = checklistItemsContainer.querySelectorAll('input[type="checkbox"]');
        const totalItems = checklistItems.length;
        const checkedItems = Array.from(checklistItems).filter(cb => cb.checked).length;
        const progressPercentage = Math.round((checkedItems / totalItems) * 100);

        checklistProgress.textContent = `${progressPercentage}%`;
        taskContainer.querySelector('.bubble-progress').style.height = `${progressPercentage}%`;
    };

    // Add initial checklist item placeholder
    addChecklistItem();

    // Add event listener to handle adding more checklist items dynamically
    taskContainer.addEventListener('click', addChecklistItem);

    document.getElementById('tasksContainer').appendChild(taskContainer);
    taskInput.value = '';
}
