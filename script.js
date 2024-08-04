function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskText = taskInput.value.trim();
    if (taskText === '') return;

    const taskContainer = document.createElement('div');
    taskContainer.className = 'task-container'; // New container for task and popup
    taskContainer.innerHTML = `
        <div class="task-bubble">
            <div class="bubble-progress" style="height: 0;"></div>
            <div class="task-content">${taskText}</div>
        </div>
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

    // Function to update progress
    const updateProgress = () => {
        const checklistItems = checklistItemsContainer.querySelectorAll('input[type="checkbox"]');
        const totalItems = checklistItems.length;
        if (totalItems === 0) return;

        const checkedItems = Array.from(checklistItems).filter(cb => cb.checked).length;
        const progressPercentage = Math.round((checkedItems / totalItems) * 100);

        checklistProgress.textContent = `${progressPercentage}%`;
        taskContainer.querySelector('.bubble-progress').style.height = `${progressPercentage}%`;
    };

    // Function to handle adding new checklist items
    window.addChecklistItem = (button) => {
        const checklistItem = document.createElement('div');
        checklistItem.innerHTML = `
            <input type="checkbox" onchange="updateProgress()">
            <label>New checklist item</label>
        `;
        checklistItemsContainer.appendChild(checklistItem);
        updateProgress(); // Initial update after adding a new item
    };

    // Attach the updateProgress function to the window object so it can be used globally
    window.updateProgress = updateProgress;

    // Append the new task to the container
    document.getElementById('tasksContainer').appendChild(taskContainer);
    taskInput.value = '';
}
