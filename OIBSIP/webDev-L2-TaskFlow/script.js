"use strict";

/*
    TaskFlow
    Smart To-Do Web App
    Built with Vanilla JavaScript
*/


// =========================
// DOM ELEMENTS
// =========================

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");

const emptyState = document.getElementById("emptyState");
const emptyTitle = document.getElementById("emptyTitle");
const emptyMessage = document.getElementById("emptyMessage");

const taskHeading = document.getElementById("taskHeading");
const pageTitle = document.getElementById("pageTitle");

const allCount = document.getElementById("allCount");
const pendingCount = document.getElementById("pendingCount");
const completedCount = document.getElementById("completedCount");

const progressPercent = document.getElementById("progressPercent");
const progressBar = document.getElementById("progressBar");
const completedSummary = document.getElementById("completedSummary");

const clearCompleted = document.getElementById("clearCompleted");
const currentDate = document.getElementById("currentDate");

const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");
const editInput = document.getElementById("editInput");
const closeModal = document.getElementById("closeModal");
const cancelEdit = document.getElementById("cancelEdit");

const navItems = document.querySelectorAll(".nav-item");


// =========================
// STATE
// =========================

const STORAGE_KEY = "taskflow_tasks";

let tasks = loadTasks();
let currentFilter = "all";
let editingTaskId = null;


// =========================
// INITIALIZATION
// =========================

document.addEventListener("DOMContentLoaded", () => {
    displayCurrentDate();
    renderTasks();
    taskInput.focus();
});


// =========================
// STORAGE
// =========================

function loadTasks() {

    try {

        const savedTasks = localStorage.getItem(STORAGE_KEY);

        if (!savedTasks) {
            return [];
        }

        const parsedTasks = JSON.parse(savedTasks);

        if (!Array.isArray(parsedTasks)) {
            return [];
        }

        return parsedTasks;

    } catch (error) {

        console.error("Unable to load tasks:", error);

        return [];
    }
}


function saveTasks() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(tasks)
        );

    } catch (error) {

        console.error("Unable to save tasks:", error);
    }
}


// =========================
// ADD TASK
// =========================

taskForm.addEventListener("submit", (event) => {

    event.preventDefault();

    const text = taskInput.value.trim();

    if (!text) {
        taskInput.focus();
        return;
    }

    const newTask = {
        id: createTaskId(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.unshift(newTask);

    saveTasks();

    taskInput.value = "";

    currentFilter = "all";
    updateActiveNavigation();

    renderTasks();

    taskInput.focus();
});


// =========================
// CREATE UNIQUE ID
// =========================

function createTaskId() {

    return `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 9)}`;
}


// =========================
// RENDER TASKS
// =========================

function renderTasks() {

    const filteredTasks = getFilteredTasks();

    taskList.innerHTML = "";

    if (filteredTasks.length === 0) {

        taskList.style.display = "none";
        emptyState.style.display = "block";

        updateEmptyState();

    } else {

        taskList.style.display = "flex";
        emptyState.style.display = "none";

        filteredTasks.forEach((task) => {

            const taskElement = createTaskElement(task);

            taskList.appendChild(taskElement);
        });
    }

    updateCounts();
    updateProgress();
    updateHeadings();
}


// =========================
// FILTER TASKS
// =========================

function getFilteredTasks() {

    switch (currentFilter) {

        case "pending":
            return tasks.filter((task) => !task.completed);

        case "completed":
            return tasks.filter((task) => task.completed);

        default:
            return tasks;
    }
}


// =========================
// CREATE TASK ELEMENT
// =========================

function createTaskElement(task) {

    const article = document.createElement("article");

    article.className = "task-item";

    if (task.completed) {
        article.classList.add("completed");
    }

    article.dataset.id = task.id;


    // Checkbox
    const checkButton = document.createElement("button");

    checkButton.className = "task-check";
    checkButton.type = "button";
    checkButton.setAttribute(
        "aria-label",
        task.completed
            ? "Mark task as pending"
            : "Mark task as completed"
    );

    checkButton.textContent = task.completed ? "✓" : "";

    checkButton.addEventListener("click", () => {
        toggleTask(task.id);
    });


    // Main content
    const main = document.createElement("div");

    main.className = "task-main";


    const text = document.createElement("div");

    text.className = "task-text";
    text.textContent = task.text;


    const meta = document.createElement("div");

    meta.className = "task-meta";
    meta.textContent = formatDate(task.createdAt);


    main.appendChild(text);
    main.appendChild(meta);


    // Actions
    const actions = document.createElement("div");

    actions.className = "task-actions";


    const editButton = document.createElement("button");

    editButton.type = "button";
    editButton.className = "task-action";
    editButton.setAttribute("aria-label", "Edit task");
    editButton.innerHTML = "✎";

    editButton.addEventListener("click", () => {
        openEditModal(task.id);
    });


    const deleteButton = document.createElement("button");

    deleteButton.type = "button";
    deleteButton.className = "task-action delete";
    deleteButton.setAttribute("aria-label", "Delete task");
    deleteButton.innerHTML = "×";

    deleteButton.addEventListener("click", () => {
        deleteTask(task.id);
    });


    actions.appendChild(editButton);
    actions.appendChild(deleteButton);


    article.appendChild(checkButton);
    article.appendChild(main);
    article.appendChild(actions);

    return article;
}


// =========================
// TOGGLE TASK
// =========================

function toggleTask(id) {

    tasks = tasks.map((task) => {

        if (task.id === id) {

            return {
                ...task,
                completed: !task.completed
            };
        }

        return task;
    });

    saveTasks();

    renderTasks();
}


// =========================
// DELETE TASK
// =========================

function deleteTask(id) {

    const taskExists = tasks.some(
        (task) => task.id === id
    );

    if (!taskExists) {
        return;
    }

    tasks = tasks.filter(
        (task) => task.id !== id
    );

    saveTasks();

    renderTasks();
}


// =========================
// EDIT TASK
// =========================

function openEditModal(id) {

    const task = tasks.find(
        (item) => item.id === id
    );

    if (!task) {
        return;
    }

    editingTaskId = id;

    editInput.value = task.text;

    editModal.hidden = false;

    setTimeout(() => {
        editInput.focus();
        editInput.select();
    }, 0);
}


function closeEditModal() {

    editingTaskId = null;

    editModal.hidden = true;

    editInput.value = "";
}


editForm.addEventListener("submit", (event) => {

    event.preventDefault();

    if (!editingTaskId) {
        return;
    }

    const updatedText = editInput.value.trim();

    if (!updatedText) {
        editInput.focus();
        return;
    }

    tasks = tasks.map((task) => {

        if (task.id === editingTaskId) {

            return {
                ...task,
                text: updatedText
            };
        }

        return task;
    });

    saveTasks();

    closeEditModal();

    renderTasks();
});


closeModal.addEventListener(
    "click",
    closeEditModal
);


cancelEdit.addEventListener(
    "click",
    closeEditModal
);


// Close modal when clicking outside
editModal.addEventListener("click", (event) => {

    if (event.target === editModal) {
        closeEditModal();
    }
});


// Close modal with Escape
document.addEventListener("keydown", (event) => {

    if (
        event.key === "Escape" &&
        !editModal.hidden
    ) {
        closeEditModal();
    }
});


// =========================
// CLEAR COMPLETED
// =========================

clearCompleted.addEventListener("click", () => {

    const completedTasks = tasks.filter(
        (task) => task.completed
    );

    if (completedTasks.length === 0) {
        return;
    }

    tasks = tasks.filter(
        (task) => !task.completed
    );

    saveTasks();

    renderTasks();
});


// =========================
// NAVIGATION FILTER
// =========================

navItems.forEach((item) => {

    item.addEventListener("click", () => {

        currentFilter = item.dataset.filter;

        updateActiveNavigation();

        renderTasks();
    });
});


function updateActiveNavigation() {

    navItems.forEach((item) => {

        item.classList.toggle(
            "active",
            item.dataset.filter === currentFilter
        );
    });
}


// =========================
// COUNTERS
// =========================

function updateCounts() {

    const total = tasks.length;

    const pending = tasks.filter(
        (task) => !task.completed
    ).length;

    const completed = tasks.filter(
        (task) => task.completed
    ).length;

    allCount.textContent = total;
    pendingCount.textContent = pending;
    completedCount.textContent = completed;

    completedSummary.textContent = completed;
}


// =========================
// PROGRESS
// =========================

function updateProgress() {

    const total = tasks.length;

    const completed = tasks.filter(
        (task) => task.completed
    ).length;

    const percentage =
        total === 0
            ? 0
            : Math.round((completed / total) * 100);

    progressPercent.textContent = percentage;

    progressBar.style.width = `${percentage}%`;
}


// =========================
// HEADINGS
// =========================

function updateHeadings() {

    const headings = {
        all: {
            page: "All Tasks",
            section: "Tasks"
        },

        pending: {
            page: "Pending Tasks",
            section: "Pending"
        },

        completed: {
            page: "Completed Tasks",
            section: "Completed"
        }
    };

    const heading = headings[currentFilter];

    pageTitle.textContent = heading.page;
    taskHeading.textContent = heading.section;
}


// =========================
// EMPTY STATES
// =========================

function updateEmptyState() {

    if (currentFilter === "pending") {

        emptyTitle.textContent = "No pending tasks";

        emptyMessage.textContent =
            "Everything on your list is complete. Nice work.";

        return;
    }

    if (currentFilter === "completed") {

        emptyTitle.textContent = "Nothing completed yet";

        emptyMessage.textContent =
            "Finish a task and it will appear here.";

        return;
    }

    emptyTitle.textContent = "You're all caught up";

    emptyMessage.textContent =
        "Add a new task above to get started.";
}


// =========================
// DATE
// =========================

function displayCurrentDate() {

    const today = new Date();

    currentDate.textContent =
        today.toLocaleDateString(
            "en-IN",
            {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );
}


// =========================
// TASK DATE FORMAT
// =========================

function formatDate(dateString) {

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "Added recently";
    }

    return `Added ${date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    )}`;
}
