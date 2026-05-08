(function () {
  'use strict';

  // ─── CONSTANTS ────────────────────────────────────────────────────────────────
  var STORAGE_KEY_TASKS = 'dashboard_tasks';
  var STORAGE_KEY_LINKS = 'dashboard_links';
  var TIMER_DURATION = 25 * 60;

  // ─── STORAGE UTILITIES ────────────────────────────────────────────────────────

  /**
   * Loads tasks from localStorage.
   * Returns a parsed array, or [] if data is missing, malformed, or not an array.
   */
  function loadTasks() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY_TASKS);
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.warn('loadTasks: failed to parse stored tasks.', err);
      return [];
    }
  }

  /**
   * Persists the tasks array to localStorage.
   * @param {Array} tasks
   */
  function saveTasks(tasks) {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  }

  /**
   * Loads links from localStorage.
   * Returns a parsed array, or [] if data is missing, malformed, or not an array.
   */
  function loadLinks() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY_LINKS);
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.warn('loadLinks: failed to parse stored links.', err);
      return [];
    }
  }

  /**
   * Persists the links array to localStorage.
   * @param {Array} links
   */
  function saveLinks(links) {
    localStorage.setItem(STORAGE_KEY_LINKS, JSON.stringify(links));
  }

  // ─── GREETING WIDGET ─────────────────────────────────────────────────────────

  /**
   * Returns a zero-padded "HH:MM" string from a Date object.
   * @param {Date} date
   * @returns {string}
   */
  function formatTime(date) {
    var hours = String(date.getHours()).padStart(2, '0');
    var minutes = String(date.getMinutes()).padStart(2, '0');
    return hours + ':' + minutes;
  }

  /**
   * Returns a human-readable date string like "Monday, 5 May 2025".
   * @param {Date} date
   * @returns {string}
   */
  function formatDate(date) {
    var weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
    var weekday = weekdays[date.getDay()];
    var day = date.getDate();
    var month = months[date.getMonth()];
    var year = date.getFullYear();
    return weekday + ', ' + day + ' ' + month + ' ' + year;
  }

  /**
   * Returns the appropriate greeting string for the given hour (0–23).
   * - Good Morning:   05–11
   * - Good Afternoon: 12–17
   * - Good Evening:   18–20
   * - Good Night:     21–23 and 0–4
   * @param {number} hour
   * @returns {string}
   */
  function getGreeting(hour) {
    if (hour >= 5 && hour <= 11) {
      return 'Good Morning';
    } else if (hour >= 12 && hour <= 17) {
      return 'Good Afternoon';
    } else if (hour >= 18 && hour <= 20) {
      return 'Good Evening';
    } else {
      return 'Good Night';
    }
  }

  /**
   * Updates the greeting widget DOM elements with the current time, date, and greeting.
   */
  function updateGreeting() {
    var now = new Date();
    document.getElementById('greeting-time').textContent = formatTime(now);
    document.getElementById('greeting-date').textContent = formatDate(now);
    document.getElementById('greeting-text').textContent = getGreeting(now.getHours());
  }

  /**
   * Initialises the greeting widget: renders immediately, then refreshes every minute.
   */
  function initGreeting() {
    updateGreeting();
    setInterval(updateGreeting, 60000);
  }

  // ─── FOCUS TIMER ─────────────────────────────────────────────────────────────

  /** @type {number|null} Holds the setInterval ID while the timer is running. */
  var timerInterval = null;

  /** @type {number} Remaining seconds on the current timer session. */
  var timerRemaining = TIMER_DURATION;

  /**
   * Converts a total number of seconds into a zero-padded "MM:SS" string.
   * e.g. 1500 → "25:00", 61 → "01:01"
   * @param {number} seconds
   * @returns {string}
   */
  function formatTimerDisplay(seconds) {
    var mins = Math.floor(seconds / 60);
    var secs = seconds % 60;
    return String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
  }

  /**
   * Stops the running interval, clears the interval ID, and re-enables the
   * Start button so the user can start a new session.
   */
  function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    document.getElementById('btn-start').disabled = false;
  }

  /**
   * Called every second while the timer is running.
   * Decrements timerRemaining, updates the display, and fires the completion
   * alert when the countdown reaches zero.
   */
  function tickTimer() {
    timerRemaining -= 1;
    document.getElementById('timer-display').textContent = formatTimerDisplay(timerRemaining);
    if (timerRemaining <= 0) {
      stopTimer();
      alert('Focus session complete! Take a break.');
    }
  }

  /**
   * Starts the countdown. Guards against duplicate intervals — if the timer is
   * already running (timerInterval !== null) this is a no-op.
   */
  function startTimer() {
    if (timerInterval !== null) {
      return;
    }
    timerInterval = setInterval(tickTimer, 1000);
    document.getElementById('btn-start').disabled = true;
  }

  /**
   * Stops the timer and resets the remaining time and display back to 25:00.
   */
  function resetTimer() {
    stopTimer();
    timerRemaining = TIMER_DURATION;
    document.getElementById('timer-display').textContent = formatTimerDisplay(TIMER_DURATION);
  }

  /**
   * Initialises the Focus Timer widget: sets the initial display and wires up
   * the Start, Stop, and Reset buttons.
   */
  function initTimer() {
    timerRemaining = TIMER_DURATION;
    document.getElementById('timer-display').textContent = formatTimerDisplay(TIMER_DURATION);
    document.getElementById('btn-start').addEventListener('click', startTimer);
    document.getElementById('btn-stop').addEventListener('click', stopTimer);
    document.getElementById('btn-reset').addEventListener('click', resetTimer);
  }

  // ─── (subsequent tasks will add more code here) ───────────────────────────────

  // ─── TODO LIST ───────────────────────────────────────────────────────────────

  /** @type {Array} Module-level task state, kept in sync with localStorage. */
  var tasks = [];

  /**
   * Shows an inline validation error message next to the given input element.
   * Inserts a <span class="validation-error"> after the input if one doesn't
   * already exist, then sets its text content.
   * @param {HTMLElement} inputEl
   * @param {string} message
   */
  function showValidationError(inputEl, message) {
    var errorEl = inputEl.nextElementSibling;
    if (!errorEl || !errorEl.classList.contains('validation-error')) {
      errorEl = document.createElement('span');
      errorEl.className = 'validation-error';
      inputEl.parentNode.insertBefore(errorEl, inputEl.nextSibling);
    }
    errorEl.textContent = message;
  }

  /**
   * Clears the inline validation error message next to the given input element.
   * @param {HTMLElement} inputEl
   */
  function clearValidationError(inputEl) {
    var errorEl = inputEl.nextElementSibling;
    if (errorEl && errorEl.classList.contains('validation-error')) {
      errorEl.textContent = '';
    }
  }

  /**
   * Creates and returns an <li> element representing a single task in read-only mode.
   * The element carries a data-task-id attribute and contains:
   *   - a toggle button  (data-action="toggle")
   *   - a <span> for the title (class "task-completed" when task.completed is true)
   *   - an edit button   (data-action="edit")
   *   - a delete button  (data-action="delete")
   * @param {Object} task
   * @returns {HTMLLIElement}
   */
  function renderTaskItem(task) {
    var li = document.createElement('li');
    li.setAttribute('data-task-id', task.id);

    // Toggle button
    var toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.setAttribute('data-action', 'toggle');
    toggleBtn.setAttribute('aria-label', task.completed ? 'Mark as incomplete' : 'Mark as complete');
    toggleBtn.textContent = task.completed ? '✓' : '○';

    // Title span
    var titleSpan = document.createElement('span');
    titleSpan.className = 'task-title' + (task.completed ? ' task-completed' : '');
    titleSpan.textContent = task.title;

    // Edit button
    var editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.setAttribute('data-action', 'edit');
    editBtn.setAttribute('aria-label', 'Edit task');
    editBtn.textContent = '✎';

    // Delete button
    var deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.setAttribute('data-action', 'delete');
    deleteBtn.setAttribute('aria-label', 'Delete task');
    deleteBtn.textContent = '🗑';

    li.appendChild(toggleBtn);
    li.appendChild(titleSpan);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);

    return li;
  }

  /**
   * Clears the #task-list element and re-renders all tasks.
   * If the tasks array is empty, inserts an empty-state <li> instead.
   * @param {Array} taskList
   */
  function renderTasks(taskList) {
    var listEl = document.getElementById('task-list');
    listEl.innerHTML = '';

    if (taskList.length === 0) {
      var emptyLi = document.createElement('li');
      emptyLi.className = 'empty-state';
      emptyLi.textContent = 'No tasks yet. Add one above!';
      listEl.appendChild(emptyLi);
      return;
    }

    taskList.forEach(function (task) {
      listEl.appendChild(renderTaskItem(task));
    });
  }

  /**
   * Validates the title, creates a new Task object, pushes it to the tasks array,
   * persists to localStorage, and re-renders the list.
   * Shows a validation error and returns early if the title is empty/whitespace.
   * @param {string} title
   */
  function addTask(title) {
    var trimmed = title.trim();
    var inputEl = document.getElementById('task-input');

    if (!trimmed) {
      showValidationError(inputEl, 'Task title cannot be empty.');
      return;
    }

    var newTask = {
      id: Date.now().toString(),
      title: trimmed,
      completed: false,
      createdAt: Date.now()
    };

    tasks.push(newTask);
    saveTasks(tasks);
    renderTasks(tasks);
    clearValidationError(inputEl);
  }

  /**
   * Removes the task with the given id from the tasks array,
   * persists to localStorage, and re-renders the list.
   * @param {string} id
   */
  function deleteTask(id) {
    tasks = tasks.filter(function (t) { return t.id !== id; });
    saveTasks(tasks);
    renderTasks(tasks);
  }

  /**
   * Flips the completed boolean of the task with the given id,
   * persists to localStorage, and re-renders the list.
   * @param {string} id
   */
  function toggleTask(id) {
    var task = tasks.find(function (t) { return t.id === id; });
    if (task) {
      task.completed = !task.completed;
      saveTasks(tasks);
      renderTasks(tasks);
    }
  }

  /**
   * Switches the task item identified by id into inline edit mode.
   * Replaces the title <span> with a pre-filled <input>, and swaps the
   * edit button for confirm (data-action="confirm") and cancel (data-action="cancel") buttons.
   * @param {string} id
   */
  function beginEditTask(id) {
    var li = document.querySelector('[data-task-id="' + id + '"]');
    if (!li) { return; }

    var task = tasks.find(function (t) { return t.id === id; });
    if (!task) { return; }

    // Replace title span with an input
    var titleSpan = li.querySelector('.task-title');
    var editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'task-edit-input';
    editInput.value = task.title;
    editInput.setAttribute('aria-label', 'Edit task title');
    li.replaceChild(editInput, titleSpan);

    // Replace edit button with confirm + cancel buttons
    var editBtn = li.querySelector('[data-action="edit"]');

    var confirmBtn = document.createElement('button');
    confirmBtn.type = 'button';
    confirmBtn.setAttribute('data-action', 'confirm');
    confirmBtn.setAttribute('aria-label', 'Confirm edit');
    confirmBtn.textContent = '✔';

    var cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.setAttribute('data-action', 'cancel');
    cancelBtn.setAttribute('aria-label', 'Cancel edit');
    cancelBtn.textContent = '✕';

    li.replaceChild(confirmBtn, editBtn);
    li.appendChild(cancelBtn);

    editInput.focus();
  }

  /**
   * Validates newTitle; if valid, updates the task's title in the tasks array,
   * persists to localStorage, and re-renders the list.
   * Shows a validation error and returns early if newTitle is empty/whitespace.
   * @param {string} id
   * @param {string} newTitle
   */
  function confirmEditTask(id, newTitle) {
    var trimmed = newTitle.trim();
    var li = document.querySelector('[data-task-id="' + id + '"]');
    var editInput = li ? li.querySelector('.task-edit-input') : null;

    if (!trimmed) {
      if (editInput) {
        showValidationError(editInput, 'Task title cannot be empty.');
      }
      return;
    }

    var task = tasks.find(function (t) { return t.id === id; });
    if (task) {
      task.title = trimmed;
      saveTasks(tasks);
      renderTasks(tasks);
    }
  }

  /**
   * Cancels an in-progress edit by re-rendering the list without saving any changes.
   * @param {string} id
   */
  function cancelEditTask(id) { // eslint-disable-line no-unused-vars
    renderTasks(tasks);
  }

  /**
   * Initialises the Todo List widget:
   *   - Loads tasks from localStorage and renders them
   *   - Attaches a submit listener to #task-form
   *   - Attaches a delegated click listener to #task-list for all task actions
   */
  function initTodoList() {
    tasks = loadTasks();
    renderTasks(tasks);

    // Form submit — add a new task
    document.getElementById('task-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var input = document.getElementById('task-input');
      addTask(input.value);
      input.value = '';
      input.focus();
    });

    // Delegated click handler for task list actions
    document.getElementById('task-list').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-action]');
      if (!btn) { return; }

      var li = btn.closest('[data-task-id]');
      if (!li) { return; }

      var id = li.dataset.taskId;
      var action = btn.dataset.action;

      if (action === 'toggle') {
        toggleTask(id);
      } else if (action === 'delete') {
        deleteTask(id);
      } else if (action === 'edit') {
        beginEditTask(id);
      } else if (action === 'confirm') {
        var editInput = li.querySelector('.task-edit-input');
        confirmEditTask(id, editInput ? editInput.value : '');
      } else if (action === 'cancel') {
        cancelEditTask(id);
      }
    });
  }

  // ─── QUICK LINKS ─────────────────────────────────────────────────────────────

  /** @type {Array} Module-level link state, kept in sync with localStorage. */
  var links = [];

  /**
   * Normalizes a URL by prepending "https://" if no protocol is present.
   * @param {string} url
   * @returns {string}
   */
  function normalizeUrl(url) {
    var trimmed = url.trim();
    if (trimmed.indexOf('http://') === 0 || trimmed.indexOf('https://') === 0) {
      return trimmed;
    }
    return 'https://' + trimmed;
  }

  /**
   * Creates and returns a <div> element representing a single link item.
   * Contains an <a> tag that opens the URL in a new tab and a delete button.
   * @param {Object} link
   * @returns {HTMLDivElement}
   */
  function renderLinkItem(link) {
    var wrapper = document.createElement('div');
    wrapper.setAttribute('data-link-id', link.id);

    // Link anchor styled as a button
    var anchor = document.createElement('a');
    anchor.href = link.url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.className = 'link-btn';
    anchor.textContent = link.label;

    // Delete button
    var deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.setAttribute('data-action', 'delete');
    deleteBtn.setAttribute('data-link-id', link.id);
    deleteBtn.setAttribute('aria-label', 'Delete link');
    deleteBtn.textContent = '🗑';

    wrapper.appendChild(anchor);
    wrapper.appendChild(deleteBtn);

    return wrapper;
  }

  /**
   * Clears the #links-list element and re-renders all links.
   * If the links array is empty, inserts an empty-state element instead.
   * @param {Array} linkList
   */
  function renderLinks(linkList) {
    var listEl = document.getElementById('links-list');
    listEl.innerHTML = '';

    if (linkList.length === 0) {
      var emptyEl = document.createElement('p');
      emptyEl.className = 'empty-state';
      emptyEl.textContent = 'No links saved yet.';
      listEl.appendChild(emptyEl);
      return;
    }

    linkList.forEach(function (link) {
      listEl.appendChild(renderLinkItem(link));
    });
  }

  /**
   * Validates inputs, normalizes the URL, creates a new Link object,
   * persists to localStorage, and re-renders the list.
   * Shows validation errors and returns early if label or url is empty.
   * @param {string} label
   * @param {string} url
   */
  function addLink(label, url) {
    var trimmedLabel = label.trim();
    var trimmedUrl = url.trim();
    var labelEl = document.getElementById('link-label');
    var urlEl = document.getElementById('link-url');

    if (!trimmedLabel) {
      showValidationError(labelEl, 'Link label cannot be empty.');
      return;
    }

    if (!trimmedUrl) {
      showValidationError(urlEl, 'Link URL cannot be empty.');
      return;
    }

    var normalizedUrl = normalizeUrl(trimmedUrl);

    var newLink = {
      id: Date.now().toString(),
      label: trimmedLabel,
      url: normalizedUrl,
      createdAt: Date.now()
    };

    links.push(newLink);
    saveLinks(links);
    renderLinks(links);
    clearValidationError(labelEl);
    clearValidationError(urlEl);
  }

  /**
   * Removes the link with the given id from the links array,
   * persists to localStorage, and re-renders the list.
   * @param {string} id
   */
  function deleteLink(id) {
    links = links.filter(function (l) { return l.id !== id; });
    saveLinks(links);
    renderLinks(links);
  }

  /**
   * Initialises the Quick Links widget:
   *   - Loads links from localStorage and renders them
   *   - Attaches a submit listener to #link-form
   *   - Attaches a delegated click listener to #links-list for delete actions
   */
  function initQuickLinks() {
    links = loadLinks();
    renderLinks(links);

    // Form submit — add a new link
    document.getElementById('link-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var labelInput = document.getElementById('link-label');
      var urlInput = document.getElementById('link-url');
      addLink(labelInput.value, urlInput.value);
      labelInput.value = '';
      urlInput.value = '';
      labelInput.focus();
    });

    // Delegated click handler for link list actions
    document.getElementById('links-list').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-action]');
      if (!btn) { return; }

      var action = btn.dataset.action;

      if (action === 'delete') {
        var linkEl = btn.closest('[data-link-id]');
        if (!linkEl) { return; }
        var id = linkEl.dataset.linkId;
        deleteLink(id);
      }
    });
  }

  // ─── INIT ─────────────────────────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', function () {
    initGreeting();
    initTimer();
    initTodoList();
    initQuickLinks();
  });

})();
