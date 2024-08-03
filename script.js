function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskText = taskInput.value.trim();
    if (taskText === '') return;

    const taskContainer = document.createElement('div');
    taskContainer.className = 'task-bubble';
    taskContainer.innerHTML = `
        <div class="bubble-progress" style="height: 0;"></div>
        <div class="task-content">${taskText}</div>
        <div class="checklist-popup">
            <button class="add-checklist-item" onclick="addChecklistItem(this)">Add Checklist Item</button>
            <div class="checklist">
                <div class="checklist-items"></div>
                <div class="checklist-progress">0%</div>
            </div>
        </div>
    `;

    const checklistItemsContainer = taskContainer.querySelector('.checklist-items');
    const checklistProgress = taskContainer.querySelector('.checklist-progress');

    const updateProgress = (checkbox) => {
        const checklistItems = checklistItemsContainer.querySelectorAll('input[type="checkbox"]');
        const totalItems = checklistItems.length;
        const checkedItems = Array.from(checklistItems).filter(cb => cb.checked).length;
        const progressPercentage = Math.round((checkedItems / totalItems) * 100);

        checklistProgress.textContent = `${progressPercentage}%`;
        taskContainer.querySelector('.bubble-progress').style.height = `${progressPercentage}%`;
    };

    // Function to handle adding new checklist items
    window.addChecklistItem = (button) => {
        const checklistItem = document.createElement('div');
        checklistItem.innerHTML = `
            <input type="checkbox" onchange="updateProgress(this)">
            <label>New checklist item</label>
        `;
        checklistItemsContainer.appendChild(checklistItem);
    };

    // Append the new task to the container
    document.getElementById('tasksContainer').appendChild(taskContainer);
    taskInput.value = '';
}
