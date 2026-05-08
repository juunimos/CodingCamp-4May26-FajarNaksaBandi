# Design Document: Todo List Life Dashboard

## Overview

The Todo List Life Dashboard is a single-page, client-side web application that serves as a personal productivity hub. It is built with plain HTML, CSS, and Vanilla JavaScript — no frameworks, no build step, no backend. All data is persisted in the browser's `localStorage`.

The application presents four widgets in a 2×2 grid on desktop viewports and stacks them vertically on mobile. The four widgets are:

- **Greeting_Widget** — real-time clock, date, and time-of-day greeting
- **Focus_Timer** — 25-minute Pomodoro-style countdown timer
- **Todo_List** — persistent task manager with add, edit, complete, and delete
- **Quick_Links** — user-defined shortcut buttons to external URLs

The entire application lives in three files:

```
index.html
css/style.css
js/app.js
```

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                    index.html                        │
│  ┌──────────────────────────────────────────────┐   │
│  │              Dashboard Grid (2×2)             │   │
│  │  ┌──────────────┐  ┌──────────────────────┐  │   │
│  │  │ Greeting     │  │ Focus Timer          │  │   │
│  │  │ Widget       │  │                      │  │   │
│  │  └──────────────┘  └──────────────────────┘  │   │
│  │  ┌──────────────┐  ┌──────────────────────┐  │   │
│  │  │ Todo List    │  │ Quick Links          │  │   │
│  │  │              │  │                      │  │   │
│  │  └──────────────┘  └──────────────────────┘  │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
         │                          │
         ▼                          ▼
   css/style.css              js/app.js
   (all styles)          (all logic, no modules)
         │                          │
         │                          ▼
         │                  localStorage API
         │                  ┌──────────────────┐
         │                  │ dashboard_tasks  │
         │                  │ dashboard_links  │
         │                  └──────────────────┘
```

### Execution Flow

1. Browser loads `index.html`, which links `css/style.css` and `js/app.js`
2. `app.js` runs `init()` on `DOMContentLoaded`
3. `init()` calls each widget's initializer in sequence
4. Each widget reads from `localStorage`, renders its initial state, and attaches event listeners
5. The Greeting_Widget starts a `setInterval` for clock updates
6. User interactions trigger event handlers that update state, re-render, and write back to `localStorage`

---

## Components and Interfaces

### Component Overview

All components are implemented as plain JavaScript function groups within `app.js`. There are no classes or ES modules — the file uses an IIFE (Immediately Invoked Function Expression) pattern to avoid polluting the global scope, with a single `init()` function exposed.

```
app.js
├── Constants
├── Storage Utilities
│   ├── loadTasks()
│   ├── saveTasks(tasks)
│   ├── loadLinks()
│   └── saveLinks(links)
├── Greeting Widget
│   ├── initGreeting()
│   ├── updateGreeting()
│   ├── formatTime(date)
│   ├── formatDate(date)
│   └── getGreeting(hour)
├── Focus Timer
│   ├── initTimer()
│   ├── startTimer()
│   ├── stopTimer()
│   ├── resetTimer()
│   ├── tickTimer()
│   └── formatTimerDisplay(seconds)
├── Todo List
│   ├── initTodoList()
│   ├── renderTasks(tasks)
│   ├── renderTaskItem(task)
│   ├── addTask(title)
│   ├── deleteTask(id)
│   ├── toggleTask(id)
│   ├── beginEditTask(id)
│   ├── confirmEditTask(id, newTitle)
│   └── cancelEditTask(id)
├── Quick Links
│   ├── initQuickLinks()
│   ├── renderLinks(links)
│   ├── renderLinkItem(link)
│   ├── addLink(label, url)
│   ├── deleteLink(id)
│   └── normalizeUrl(url)
└── init()
```

### Greeting Widget Interface

| Function | Parameters | Returns | Description |
|---|---|---|---|
| `initGreeting()` | — | void | Renders initial greeting and starts 60s interval |
| `updateGreeting()` | — | void | Updates time, date, and greeting text in DOM |
| `formatTime(date)` | `Date` | `string` | Returns `"HH:MM"` string |
| `formatDate(date)` | `Date` | `string` | Returns `"Weekday, D Month YYYY"` string |
| `getGreeting(hour)` | `number` (0–23) | `string` | Returns greeting string for given hour |

### Focus Timer Interface

| Function | Parameters | Returns | Description |
|---|---|---|---|
| `initTimer()` | — | void | Sets initial state (1500s), renders 25:00, attaches button listeners |
| `startTimer()` | — | void | Starts 1s interval, disables Start button |
| `stopTimer()` | — | void | Clears interval, enables Start button |
| `resetTimer()` | — | void | Stops timer, resets to 1500s, renders 25:00 |
| `tickTimer()` | — | void | Decrements remaining seconds, updates display, handles 00:00 |
| `formatTimerDisplay(seconds)` | `number` | `string` | Returns `"MM:SS"` string |

### Todo List Interface

| Function | Parameters | Returns | Description |
|---|---|---|---|
| `initTodoList()` | — | void | Loads tasks from storage, renders list, attaches form listener |
| `renderTasks(tasks)` | `Task[]` | void | Clears and re-renders the full task list |
| `renderTaskItem(task)` | `Task` | `HTMLElement` | Creates and returns a task list item element |
| `addTask(title)` | `string` | void | Validates, creates Task, saves, re-renders |
| `deleteTask(id)` | `string` | void | Removes task by id, saves, re-renders |
| `toggleTask(id)` | `string` | void | Flips `completed` flag, saves, re-renders |
| `beginEditTask(id)` | `string` | void | Switches task item to edit mode |
| `confirmEditTask(id, newTitle)` | `string, string` | void | Validates and applies new title, saves, re-renders |
| `cancelEditTask(id)` | `string` | void | Exits edit mode without saving |

### Quick Links Interface

| Function | Parameters | Returns | Description |
|---|---|---|---|
| `initQuickLinks()` | — | void | Loads links from storage, renders panel, attaches form listener |
| `renderLinks(links)` | `Link[]` | void | Clears and re-renders the full links panel |
| `renderLinkItem(link)` | `Link` | `HTMLElement` | Creates and returns a link button element with delete control |
| `addLink(label, url)` | `string, string` | void | Validates, normalizes URL, creates Link, saves, re-renders |
| `deleteLink(id)` | `string` | void | Removes link by id, saves, re-renders |
| `normalizeUrl(url)` | `string` | `string` | Prepends `"https://"` if no protocol present |

---

## Data Models

### Task Object

```javascript
{
  id: string,          // Unique identifier — Date.now().toString() + Math.random()
  title: string,       // Task description, non-empty, trimmed
  completed: boolean,  // false = incomplete, true = complete
  createdAt: number    // Unix timestamp (ms) from Date.now()
}
```

### Link Object

```javascript
{
  id: string,          // Unique identifier — Date.now().toString() + Math.random()
  label: string,       // Display label for the button, non-empty, trimmed
  url: string,         // Full URL, always starts with "http://" or "https://"
  createdAt: number    // Unix timestamp (ms) from Date.now()
}
```

### Local Storage Schema

| Key | Value Type | Description |
|---|---|---|
| `dashboard_tasks` | `JSON string` of `Task[]` | Ordered array of all task objects |
| `dashboard_links` | `JSON string` of `Link[]` | Ordered array of all link objects |

**Read pattern:**
```javascript
function loadTasks() {
  try {
    const raw = localStorage.getItem('dashboard_tasks');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}
```

**Write pattern:**
```javascript
function saveTasks(tasks) {
  localStorage.setItem('dashboard_tasks', JSON.stringify(tasks));
}
```

---

## UI Layout

### Desktop Layout (≥ 768px)

```
┌─────────────────────────────────────────────────────────────┐
│                        Dashboard                            │
│  ┌──────────────────────┐  ┌──────────────────────────────┐ │
│  │   Greeting Widget    │  │       Focus Timer            │ │
│  │                      │  │                              │ │
│  │  Good Morning        │  │        25:00                 │ │
│  │  10:42               │  │   [Start] [Stop] [Reset]     │ │
│  │  Monday, 5 May 2025  │  │                              │ │
│  └──────────────────────┘  └──────────────────────────────┘ │
│  ┌──────────────────────┐  ┌──────────────────────────────┐ │
│  │     Todo List        │  │       Quick Links            │ │
│  │                      │  │                              │ │
│  │  [_________] [Add]   │  │  [Label___] [URL___] [Add]   │ │
│  │  ☐ Task one    ✎ 🗑  │  │  [GitHub ×] [Gmail ×]        │ │
│  │  ☑ Task two    ✎ 🗑  │  │                              │ │
│  └──────────────────────┘  └──────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

CSS Grid implementation:
```css
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 1.5rem;
  padding: 1.5rem;
}
```

### Mobile Layout (< 768px)

All four widgets stack vertically in a single column:
```css
@media (max-width: 767px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## Visual Design Tokens

### Color Palette

```css
:root {
  /* Backgrounds */
  --color-bg-page:       #0f172a;   /* Dark navy — page background */
  --color-bg-widget:     #1e293b;   /* Slightly lighter — widget cards */
  --color-bg-input:      #334155;   /* Input fields */
  --color-bg-hover:      #475569;   /* Hover states */

  /* Accent */
  --color-accent:        #6366f1;   /* Indigo — primary action color */
  --color-accent-hover:  #4f46e5;   /* Darker indigo on hover */
  --color-success:       #22c55e;   /* Green — completed tasks */
  --color-danger:        #ef4444;   /* Red — delete actions */

  /* Text */
  --color-text-primary:  #f1f5f9;   /* Near-white — headings, primary text */
  --color-text-secondary:#94a3b8;   /* Muted — secondary labels, dates */
  --color-text-disabled: #475569;   /* Disabled controls */

  /* Borders */
  --color-border:        #334155;   /* Subtle widget borders */
}
```

### Typography

```css
:root {
  --font-family:         'Segoe UI', system-ui, -apple-system, sans-serif;

  /* Scale */
  --font-size-xs:        0.75rem;   /* 12px — labels, hints */
  --font-size-sm:        0.875rem;  /* 14px — body text minimum */
  --font-size-base:      1rem;      /* 16px — default body */
  --font-size-lg:        1.25rem;   /* 20px — widget headings */
  --font-size-xl:        1.5rem;    /* 24px — timer display */
  --font-size-2xl:       2rem;      /* 32px — greeting time */
  --font-size-3xl:       2.5rem;    /* 40px — greeting text */

  --font-weight-normal:  400;
  --font-weight-medium:  500;
  --font-weight-bold:    700;

  --line-height-base:    1.5;
}
```

### Spacing

```css
:root {
  --space-1:  0.25rem;   /* 4px */
  --space-2:  0.5rem;    /* 8px */
  --space-3:  0.75rem;   /* 12px */
  --space-4:  1rem;      /* 16px */
  --space-6:  1.5rem;    /* 24px */
  --space-8:  2rem;      /* 32px */
}
```

### Widget Card Style

```css
.widget {
  background: var(--color-bg-widget);
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  padding: var(--space-6);
  overflow-y: auto;
  max-height: 45vh;  /* Prevents overflow on 1280×720 */
}
```

---

## JavaScript Module Organization (app.js)

The single `app.js` file is organized into clearly separated sections using comment banners. No ES modules are used to maintain `file://` protocol compatibility.

```javascript
// ============================================================
// CONSTANTS
// ============================================================
const STORAGE_KEY_TASKS = 'dashboard_tasks';
const STORAGE_KEY_LINKS = 'dashboard_links';
const TIMER_DURATION    = 25 * 60; // 1500 seconds

// ============================================================
// STORAGE UTILITIES
// ============================================================
function loadTasks() { ... }
function saveTasks(tasks) { ... }
function loadLinks() { ... }
function saveLinks(links) { ... }

// ============================================================
// GREETING WIDGET
// ============================================================
function initGreeting() { ... }
function updateGreeting() { ... }
function formatTime(date) { ... }
function formatDate(date) { ... }
function getGreeting(hour) { ... }

// ============================================================
// FOCUS TIMER
// ============================================================
// State: timerInterval (null | number), timerRemaining (number)
function initTimer() { ... }
function startTimer() { ... }
function stopTimer() { ... }
function resetTimer() { ... }
function tickTimer() { ... }
function formatTimerDisplay(seconds) { ... }

// ============================================================
// TODO LIST
// ============================================================
// State: tasks (Task[]) — loaded from localStorage
function initTodoList() { ... }
function renderTasks(tasks) { ... }
function renderTaskItem(task) { ... }
function addTask(title) { ... }
function deleteTask(id) { ... }
function toggleTask(id) { ... }
function beginEditTask(id) { ... }
function confirmEditTask(id, newTitle) { ... }
function cancelEditTask(id) { ... }

// ============================================================
// QUICK LINKS
// ============================================================
// State: links (Link[]) — loaded from localStorage
function initQuickLinks() { ... }
function renderLinks(links) { ... }
function renderLinkItem(link) { ... }
function addLink(label, url) { ... }
function deleteLink(id) { ... }
function normalizeUrl(url) { ... }

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
  initGreeting();
  initTimer();
  initTodoList();
  initQuickLinks();
});
```

### Timer State Management

The Focus Timer uses two module-level variables:

```javascript
let timerInterval  = null;   // setInterval handle, null when stopped
let timerRemaining = TIMER_DURATION; // seconds remaining
```

### Task and Link State Management

Tasks and links are held in module-level arrays that are always kept in sync with `localStorage`:

```javascript
let tasks = [];  // Task[]
let links = [];  // Link[]
```

Every mutation (add, delete, toggle, edit) follows this pattern:
1. Mutate the in-memory array
2. Call `saveTasks(tasks)` or `saveLinks(links)`
3. Call `renderTasks(tasks)` or `renderLinks(links)` to update the DOM

---

## Event Handling Approach

### Event Delegation for Dynamic Lists

Task items and link items are created and destroyed dynamically. Rather than attaching listeners to each item, a single delegated listener is attached to the container:

```javascript
// In initTodoList():
document.getElementById('task-list').addEventListener('click', function (e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const id = btn.closest('[data-task-id]').dataset.taskId;
  const action = btn.dataset.action;

  if (action === 'toggle')  toggleTask(id);
  if (action === 'delete')  deleteTask(id);
  if (action === 'edit')    beginEditTask(id);
  if (action === 'confirm') confirmEditTask(id, /* input value */);
  if (action === 'cancel')  cancelEditTask(id);
});
```

The same pattern applies to the Quick Links container.

### Form Submission

Add forms use `submit` event listeners (supports both Enter key and button click):

```javascript
document.getElementById('task-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const input = document.getElementById('task-input');
  addTask(input.value);
  input.value = '';
  input.focus();
});
```

### Timer Buttons

Timer controls use direct `click` listeners attached once in `initTimer()`:

```javascript
document.getElementById('btn-start').addEventListener('click', startTimer);
document.getElementById('btn-stop').addEventListener('click', stopTimer);
document.getElementById('btn-reset').addEventListener('click', resetTimer);
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Greeting correctness for all hours

*For any* integer hour in [0, 23], `getGreeting(hour)` SHALL return exactly one of "Good Morning", "Good Afternoon", "Good Evening", or "Good Night", and the returned value SHALL match the hour range defined in the requirements (Morning: 5–11, Afternoon: 12–17, Evening: 18–20, Night: 21–23 and 0–4).

**Validates: Requirements 1.3, 1.4, 1.5, 1.6**

---

### Property 2: Time format is always HH:MM

*For any* `Date` object, `formatTime(date)` SHALL return a string that matches the regular expression `/^\d{2}:\d{2}$/`, where the hour component is in [00, 23] and the minute component is in [00, 59].

**Validates: Requirements 1.1**

---

### Property 3: Timer display is always MM:SS

*For any* integer number of seconds in [0, 1500], `formatTimerDisplay(seconds)` SHALL return a string that matches the regular expression `/^\d{2}:\d{2}$/`, where the minute component is in [00, 25] and the second component is in [00, 59].

**Validates: Requirements 2.8**

---

### Property 4: Adding a valid task persists it

*For any* non-empty, non-whitespace-only string used as a task title, calling `addTask(title)` SHALL result in the task appearing in the rendered list with `completed = false`, AND `localStorage.getItem('dashboard_tasks')` SHALL contain a JSON array that includes an object with the same trimmed title.

**Validates: Requirements 3.2, 3.5**

---

### Property 5: Whitespace-only input is always rejected

*For any* string composed entirely of whitespace characters (spaces, tabs, newlines), calling `addTask(title)` SHALL leave the task list unchanged, and no new entry SHALL appear in `localStorage`.

**Validates: Requirements 3.3, 4.3**

---

### Property 6: Task rendering always includes all controls

*For any* `Task` object, `renderTaskItem(task)` SHALL produce an HTML element that contains the task title, a completion toggle control (`data-action="toggle"`), an edit control (`data-action="edit"`), and a delete control (`data-action="delete"`).

**Validates: Requirements 3.4**

---

### Property 7: Completion toggle is a round trip

*For any* task in the list, toggling its completion state twice SHALL return the task to its original `completed` value, and `localStorage` SHALL reflect the final state after each toggle.

**Validates: Requirements 5.1, 5.2, 5.3**

---

### Property 8: Deleting a task removes it from storage

*For any* non-empty task list, calling `deleteTask(id)` for any task id in the list SHALL result in that task no longer appearing in the rendered list AND no longer being present in the JSON array stored under `dashboard_tasks` in `localStorage`.

**Validates: Requirements 5.4**

---

### Property 9: URL normalization always produces a valid protocol prefix

*For any* string that does not begin with `"http://"` or `"https://"`, `normalizeUrl(url)` SHALL return a string that begins with `"https://"` followed by the original input.

**Validates: Requirements 6.4**

---

### Property 10: Adding a valid link persists it

*For any* non-empty label and URL (after normalization), calling `addLink(label, url)` SHALL result in a link button appearing in the rendered panel, AND `localStorage.getItem('dashboard_links')` SHALL contain a JSON array that includes an object with the same label and normalized URL.

**Validates: Requirements 6.2, 6.6**

---

### Property 11: Malformed localStorage data never throws

*For any* string value (including invalid JSON, empty string, `null`, or arbitrary text) stored under `dashboard_tasks` or `dashboard_links`, calling `loadTasks()` or `loadLinks()` respectively SHALL return an empty array `[]` and SHALL NOT throw an unhandled exception.

**Validates: Requirements 8.3, 8.4**

---

## Error Handling

### localStorage Errors

All `localStorage` reads are wrapped in `try/catch`. If `JSON.parse` fails or `localStorage` is unavailable (e.g., private browsing with storage disabled), the application falls back to an empty array and continues functioning in-memory for the session.

```javascript
function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TASKS);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to load tasks from localStorage:', e);
    return [];
  }
}
```

The `Array.isArray` guard handles the case where valid JSON is stored but is not an array (e.g., someone manually set the key to a JSON object or number).

### Input Validation Errors

Validation errors are shown as inline messages adjacent to the relevant input field. They are cleared on the next successful submission or when the input changes.

```javascript
function showValidationError(inputEl, message) {
  let errorEl = inputEl.nextElementSibling;
  if (!errorEl || !errorEl.classList.contains('validation-error')) {
    errorEl = document.createElement('span');
    errorEl.className = 'validation-error';
    inputEl.parentNode.insertBefore(errorEl, inputEl.nextSibling);
  }
  errorEl.textContent = message;
}

function clearValidationError(inputEl) {
  const errorEl = inputEl.nextElementSibling;
  if (errorEl && errorEl.classList.contains('validation-error')) {
    errorEl.textContent = '';
  }
}
```

### Timer Completion

When the timer reaches 00:00, `tickTimer()` calls `stopTimer()` to clear the interval and then triggers a browser `alert()` as the notification mechanism. This is the simplest approach that works across all modern browsers without additional UI complexity.

```javascript
function tickTimer() {
  timerRemaining -= 1;
  updateTimerDisplay();
  if (timerRemaining <= 0) {
    stopTimer();
    alert('Focus session complete! Take a break.');
  }
}
```

---

## Testing Strategy

### Approach

Given the technical constraints (Vanilla JS, no frameworks, `file://` protocol compatibility), testing is done with lightweight, dependency-free unit tests written directly in JavaScript. No test runner installation is required.

### Unit Tests

Unit tests cover pure functions that have no DOM or `localStorage` dependencies:

- `getGreeting(hour)` — all 24 hour values
- `formatTime(date)` — boundary dates (midnight, noon, 23:59)
- `formatDate(date)` — various dates including month/year boundaries
- `formatTimerDisplay(seconds)` — 0, 1, 59, 60, 1499, 1500
- `normalizeUrl(url)` — URLs with and without protocol prefixes

### Property-Based Tests

The correctness properties defined above are suitable for property-based testing using a library such as [fast-check](https://github.com/dubzzz/fast-check) (JavaScript). Each property test should run a minimum of 100 iterations.

Each test is tagged with the property it validates:

```javascript
// Feature: todo-list-life-dashboard, Property 1: Greeting correctness for all hours
fc.assert(fc.property(fc.integer({ min: 0, max: 23 }), (hour) => {
  const result = getGreeting(hour);
  const valid = ['Good Morning', 'Good Afternoon', 'Good Evening', 'Good Night'];
  return valid.includes(result) && matchesHourRange(hour, result);
}), { numRuns: 100 });
```

### Integration / Example Tests

Example-based tests cover DOM interactions and `localStorage` integration:

- Dashboard loads and all four widgets are present in the DOM
- Adding a task via the form appends it to the list
- Deleting a task removes it from the DOM and `localStorage`
- Toggling a task updates the visual state and `localStorage`
- Adding a link creates a clickable button
- Deleting all tasks shows the empty-state message
- Deleting all links shows the empty-state message
- Timer starts, stops, and resets correctly
- Timer disables Start button while running

### Accessibility Checks

- Verify color contrast ratios meet WCAG 2.1 AA (4.5:1 for normal text) using browser DevTools or a contrast checker
- Verify all interactive controls have accessible labels (`aria-label` or visible text)
- Verify keyboard navigation works for all form inputs and buttons
