        function saveTasks() {
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }

        function loadTasks() {
            const saved = localStorage.getItem('tasks');
            return saved ? JSON.parse(saved) : []; 
        }

        let tasks = loadTasks();
        let currentView = 'tasks';
        let editingTaskId = null;
        let filters = { search: '', status: 'all', priority: 'all' };

        function init() {
            showTaskList();
        }
        function setActiveNav(activeId) {
            document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
            document.getElementById(activeId).classList.add('active');
        }

        function showTaskList() {
            currentView = 'tasks';
            editingTaskId = null;
            setActiveNav('viewTaskBtn');
            renderTaskList();
        }

        function showAddTask() {
            currentView = 'add';
            editingTaskId = null;
            setActiveNav('addTaskBtn');
            renderTaskForm();
        }

        function showEditTask(taskId) {
            currentView = 'edit';
            editingTaskId = taskId;
            setActiveNav('viewTaskBtn');
            renderTaskForm(taskId);
        }

        function showTaskDetail(taskId) {
            currentView = 'detail';
            editingTaskId = null;
            setActiveNav('viewTaskBtn');
            renderTaskDetail(taskId);
        }

        function renderTaskList() {
            const filteredTasks = getFilteredTasks();
            const html = `
                <div class="container">
                    <div class="search-filter">
                        <input type="text" id="searchInput" class="search-input" 
                               placeholder="Search tasks..." value="${filters.search}"
                               onkeyup="updateFilters()">
                        <select id="statusFilter" class="filter-select" onchange="updateFilters()">
                            <option value="all" ${filters.status === 'all' ? 'selected' : ''}>All Status</option>
                            <option value="pending" ${filters.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="in-progress" ${filters.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                            <option value="completed" ${filters.status === 'completed' ? 'selected' : ''}>Completed</option>
                        </select>
                        <select id="priorityFilter" class="filter-select" onchange="updateFilters()">
                            <option value="all" ${filters.priority === 'all' ? 'selected' : ''}>All Priority</option>
                            <option value="high" ${filters.priority === 'high' ? 'selected' : ''}>High</option>
                            <option value="medium" ${filters.priority === 'medium' ? 'selected' : ''}>Medium</option>
                            <option value="low" ${filters.priority === 'low' ? 'selected' : ''}>Low</option>
                        </select>
                    </div>

                    ${filteredTasks.length === 0 ? 
                        `<div class="empty-state">
                            <h3>No tasks found</h3>
                            <p>Try adjusting your search or filters, or create a new task.</p>
                            <button class="btn btn-primary new-task" onclick="showAddTask()">Add New Task</button>
                        </div>` :
                        `<div class="tasks-grid">
                            ${filteredTasks.map(task => renderTaskCard(task)).join('')}
                        </div>`
                    }
                </div>
            `;
            document.getElementById('main-content').innerHTML = html;
        }

        function renderTaskCard(task) {
            const dueDate = new Date(task.dueDate);
            const isOverdue = dueDate < new Date() && task.status !== 'completed';
            
            return `
                <div class="task-card ${isOverdue ? 'overdue' : ''}" onclick="showTaskDetail(${task.id})">
                    <div class="task-priority priority-${task.priority}">
                        ${task.priority.toUpperCase()}
                    </div>
                    
                    <h3 class="task-title">${escapeHtml(task.title)}</h3>
                    <p class="task-description">${escapeHtml(task.description)}</p>
                    
                    <div class="task-meta">
                        <span class="task-status">Status: ${task.status}</span>
                        <span class="task-due">Due: ${dueDate.toLocaleDateString()}</span>
                    </div>
                    
                    <div class="task-actions" onclick="event.stopPropagation()">
                        <button class="btn btn-secondary" onclick="showEditTask(${task.id})">
                            Edit
                        </button>
                        <button class="btn btn-danger" onclick="deleteTask(${task.id})">
                            Delete
                        </button>
                    </div>
                </div>
            `;
        }

        function renderTaskForm(taskId = null) {
            const task = taskId ? tasks.find(t => t.id === taskId) : null;
            const isEdit = !!task;
            const title = isEdit ? 'Edit Task' : 'Add New Task';
            const buttonText = isEdit ? 'Update Task' : 'Create Task';
            
            const html = `
                <div class="container">
                    <h2>${title}</h2>
                    <form onsubmit="handleTaskSubmit(event, ${isEdit})">
                        <div class="form-group">
                            <label class="form-label" for="title">Title *</label>
                            <input type="text" id="title" name="title" class="form-input" 
                                   value="${task ? escapeHtml(task.title) : ''}" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="description">Description</label>
                            <textarea id="description" name="description" class="form-textarea"
                                      placeholder="Enter task description...">${task ? escapeHtml(task.description) : ''}</textarea>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="dueDate">Due Date *</label>
                            <input type="date" id="dueDate" name="dueDate" class="form-input" 
                                   value="${task ? task.dueDate : ''}" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="priority">Priority</label>
                            <select id="priority" name="priority" class="form-select">
                                <option value="low" ${task && task.priority === 'low' ? 'selected' : ''}>Low</option>
                                <option value="medium" ${task && task.priority === 'medium' ? 'selected' : (!task ? 'selected' : '')}>Medium</option>
                                <option value="high" ${task && task.priority === 'high' ? 'selected' : ''}>High</option>
                            </select>
                        </div>
                        
                        ${isEdit ? `
                            <div class="form-group">
                                <label class="form-label" for="status">Status</label>
                                <select id="status" name="status" class="form-select">
                                    <option value="pending" ${task && task.status === 'pending' ? 'selected' : ''}>Pending</option>
                                    <option value="in-progress" ${task && task.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                                    <option value="completed" ${task && task.status === 'completed' ? 'selected' : ''}>Completed</option>
                                </select>
                            </div>
                        ` : ''}
                        
                        <div class="form-group">
                            <button type="submit" class="btn btn-primary">${buttonText}</button>
                            <button type="button" class="btn btn-secondary" onclick="showTaskList()">Cancel</button>
                        </div>
                    </form>
                </div>
            `;
            document.getElementById('main-content').innerHTML = html;
        }

        function renderTaskDetail(taskId) {
            const task = tasks.find(t => t.id === taskId);
            if (!task) {
                showNotification('Task not found', 'error');
                showTaskList();
                return;
            }

            const dueDate = new Date(task.dueDate);
            const createdDate = new Date(task.createdAt);
            
            const html = `
                <div class="container">
                    <div class="task-detail">
                        <div class="task-header">
                            <div class="task-priority priority-${task.priority}">
                                ${task.priority.toUpperCase()} PRIORITY
                            </div>
                            <h1 class="task-title">${escapeHtml(task.title)}</h1>
                        </div>
                        
                        <div class="task-content">
                            <div class="task-description">
                                <h3>Description</h3>
                                <p>${escapeHtml(task.description) || 'No description provided'}</p>
                            </div>
                            
                            <div class="task-info">
                                <div class="info-item">
                                    <strong>Status:</strong> <span class="status-${task.status}">${task.status}</span>
                                </div>
                                <div class="info-item">
                                    <strong>Due Date:</strong> ${dueDate.toLocaleDateString()}
                                </div>
                                <div class="info-item">
                                    <strong>Created:</strong> ${createdDate.toLocaleDateString()}
                                </div>
                            </div>
                            
                            <div class="task-actions">
                                <button class="btn btn-primary" onclick="showEditTask(${task.id})">
                                    Edit Task
                                </button>
                                <button class="btn btn-danger" onclick="deleteTask(${task.id})">
                                    Delete Task
                                </button>
                                <button class="btn btn-secondary" onclick="showTaskList()">
                                    Back to Tasks
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.getElementById('main-content').innerHTML = html;
        }

        function handleTaskSubmit(event, isEdit) {
            event.preventDefault();
            
            const formData = new FormData(event.target);
            const taskData = {
                title: formData.get('title'),
                description: formData.get('description'),
                dueDate: formData.get('dueDate'),
                priority: formData.get('priority'),
                status: formData.get('status') || 'pending'
            };

            if (isEdit && editingTaskId) {
                updateTask(editingTaskId, taskData);
            } else {
                createTask(taskData);
            }
        }

        function createTask(taskData) {
            const newTask = {
                id: Date.now(),
                ...taskData,
                createdAt: new Date().toISOString()
            };
            
            tasks.push(newTask);
            saveTasks(); 
            showNotification('Task created successfully!', 'success');
            showTaskList();
        }

        function updateTask(taskId, updates) {
            const taskIndex = tasks.findIndex(t => t.id === taskId);
            if (taskIndex !== -1) {
                tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
                saveTasks();
                showNotification('Task updated successfully!', 'success');
                showTaskList();
            }
        }

        function deleteTask(taskId) {
            if (confirm('Are you sure you want to delete this task?')) {
                tasks = tasks.filter(t => t.id !== taskId);
                saveTasks();
                showNotification('Task deleted successfully!', 'success');
                if (currentView === 'detail' || currentView === 'edit') {
                    showTaskList();
                } else {
                    renderTaskList();
                }
            }
        }

        function updateFilters() {
            filters.search = document.getElementById('searchInput').value;
            filters.status = document.getElementById('statusFilter').value;
            filters.priority = document.getElementById('priorityFilter').value;
            renderTaskList();
        }

        function getFilteredTasks() {
            let filtered = [...tasks];

            if (filters.search) {
                filtered = filtered.filter(task => 
                    task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                    task.description.toLowerCase().includes(filters.search.toLowerCase())
                );
            }

            if (filters.status !== 'all') {
                filtered = filtered.filter(task => task.status === filters.status);
            }

            if (filters.priority !== 'all') {
                filtered = filtered.filter(task => task.priority === filters.priority);
            }

            return filtered;
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function showNotification(message, type = 'info') {
            const modal = document.getElementById('modal');
            const modalBody = document.getElementById('modal-body');
            
            modalBody.innerHTML = `
                <div style="text-align: center; padding: 1rem;">
                    <h3 style="color: ${type === 'error' ? '#ff6b6b' : type === 'success' ? '#28a745' : '#667eea'}">
                        ${type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Info'}
                    </h3>
                    <p style="margin-top: 1rem;">${message}</p>
                    <button class="btn btn-primary" onclick="closeModal()" style="margin-top: 1rem;">OK</button>
                </div>
            `;
            
            modal.classList.remove('hidden');
        }

        function closeModal() {
            document.getElementById('modal').classList.add('hidden');
        }

        function showLoading() {
            document.getElementById('loading').classList.remove('hidden');
        }

        function hideLoading() {
            document.getElementById('loading').classList.add('hidden');
        }
        document.addEventListener('DOMContentLoaded', init);