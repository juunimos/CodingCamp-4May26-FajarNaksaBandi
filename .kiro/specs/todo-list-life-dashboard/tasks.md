# Implementation Plan: Todo List Life Dashboard

## Overview

Build a single-page productivity dashboard using plain HTML, CSS, and Vanilla JavaScript. The application presents four widgets (Greeting, Focus Timer, Todo List, Quick Links) in a 2×2 grid, with all data persisted to `localStorage`. The output is exactly three files: `index.html`, `css/style.css`, and `js/app.js`, all placed inside `CodingCamp-4May26-FajarNaksaBandi/`.

## Tasks

- [x] 1. Create project scaffold — `index.html`
  - Create `CodingCamp-4May26-FajarNaksaBandi/index.html` with the full HTML5 document structure
  - Add `<link rel="stylesheet" href="css/style.css">` in `<head>`
  - Add `<script src="js/app.js" defer></script>` in `<head>`
  - Add a `<main>` element with class `dashboard-grid` containing all four widget sections:
    - `#greeting-widget` — elements for greeting text (`#greeting-text`), time (`#greeting-time`), and date (`#greeting-date`)
    - `#timer-widget` — timer display (`#timer-display`), and three buttons with ids `btn-start`, `btn-stop`, `btn-reset`
    - `#todo-widget` — form (`#task-form`) with input (`#task-input`) and submit button, task list container (`#task-list`)
    - `#links-widget` — form (`#link-form`) with inputs (`#link-label`, `#link-url`) and submit button, links container (`#links-list`)
  - _Requirements: 9.1, 9.2, 9.3, 10.1, 10.2_

- [x] 2. Create stylesheet — `css/style.css`
  - Create `CodingCamp-4May26-FajarNaksaBandi/css/style.css`
  - Declare all CSS custom properties in `:root` — color palette (`--color-bg-page`, `--color-bg-widget`, `--color-bg-input`, `--color-bg-hover`, `--color-accent`, `--color-accent-hover`, `--color-success`, `--color-danger`, `--color-text-primary`, `--color-text-secondary`, `--color-text-disabled`, `--color-border`), typography scale (`--font-family`, `--font-size-xs` through `--font-size-3xl`, `--font-weight-normal/medium/bold`, `--line-height-base`), and spacing scale (`--space-1` through `--space-8`)
  - Add CSS reset: `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }`
  - Style `body` with `--color-bg-page` background, `--font-family`, `--color-text-primary`, and `--line-height-base`
  - Style `.dashboard-grid` as a 2-column CSS Grid with `gap: var(--space-6)` and `padding: var(--space-6)`
  - Style `.widget` cards with `--color-bg-widget` background, `1px solid --color-border` border, `0.75rem` border-radius, `var(--space-6)` padding, `overflow-y: auto`, and `max-height: 45vh`
  - Style widget headings, the greeting time display (`font-size: var(--font-size-2xl)`), greeting text (`font-size: var(--font-size-3xl)`), and timer display (`font-size: var(--font-size-xl)`)
  - Style buttons (primary/accent style for Add and Start, neutral for Stop/Reset, danger for delete controls)
  - Style text inputs with `--color-bg-input` background, `--color-border` border, and `--color-text-primary` text
  - Add `.task-completed` style with `text-decoration: line-through` and `color: var(--color-text-secondary)`
  - Add `.validation-error` style with `color: var(--color-danger)` and `font-size: var(--font-size-xs)`
  - Add `.empty-state` style with `color: var(--color-text-secondary)` and centered/italic presentation
  - Add responsive breakpoint: `@media (max-width: 767px)` sets `.dashboard-grid` to `grid-template-columns: 1fr`
  - _Requirements: 9.2, 10.1, 10.2, 10.3, 10.4, 10.5, 5.1_

- [x] 3. Implement Storage Utilities in `js/app.js`
  - Create `CodingCamp-4May26-FajarNaksaBandi/js/app.js` with an opening IIFE wrapper and a `CONSTANTS` section declaring `STORAGE_KEY_TASKS = 'dashboard_tasks'`, `STORAGE_KEY_LINKS = 'dashboard_links'`, and `TIMER_DURATION = 25 * 60`
  - Implement `loadTasks()` — reads `localStorage.getItem(STORAGE_KEY_TASKS)`, parses JSON inside `try/catch`, returns the parsed array if `Array.isArray` is true, otherwise returns `[]`; on any error logs a warning and returns `[]`
  - Implement `saveTasks(tasks)` — calls `localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks))`
  - Implement `loadLinks()` — same pattern as `loadTasks()` but uses `STORAGE_KEY_LINKS`
  - Implement `saveLinks(links)` — calls `localStorage.setItem(STORAGE_KEY_LINKS, JSON.stringify(links))`
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 4. Implement Greeting Widget in `js/app.js`
  - Implement `formatTime(date)` — returns a zero-padded `"HH:MM"` string from a `Date` object
  - Implement `formatDate(date)` — returns a human-readable string like `"Monday, 5 May 2025"` using `toLocaleDateString` or manual weekday/month arrays
  - Implement `getGreeting(hour)` — returns `"Good Morning"` for hours 5–11, `"Good Afternoon"` for 12–17, `"Good Evening"` for 18–20, and `"Good Night"` for 21–23 and 0–4
  - Implement `updateGreeting()` — creates a `new Date()`, then sets `#greeting-time` text to `formatTime(now)`, `#greeting-date` text to `formatDate(now)`, and `#greeting-text` text to `getGreeting(now.getHours())`
  - Implement `initGreeting()` — calls `updateGreeting()` immediately, then calls `setInterval(updateGreeting, 60000)` to refresh every minute
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [x] 5. Implement Focus Timer in `js/app.js`
  - Declare module-level timer state variables: `let timerInterval = null` and `let timerRemaining = TIMER_DURATION`
  - Implement `formatTimerDisplay(seconds)` — returns a zero-padded `"MM:SS"` string (e.g., `1500` → `"25:00"`, `61` → `"01:01"`)
  - Implement `initTimer()` — sets `timerRemaining = TIMER_DURATION`, renders `"25:00"` into `#timer-display`, and attaches `click` listeners: `btn-start` → `startTimer`, `btn-stop` → `stopTimer`, `btn-reset` → `resetTimer`
  - Implement `startTimer()` — guards against duplicate intervals (if `timerInterval !== null`, return early), sets `timerInterval = setInterval(tickTimer, 1000)`, and disables `btn-start`
  - Implement `stopTimer()` — calls `clearInterval(timerInterval)`, sets `timerInterval = null`, and re-enables `btn-start`
  - Implement `resetTimer()` — calls `stopTimer()`, sets `timerRemaining = TIMER_DURATION`, and updates `#timer-display` to `"25:00"`
  - Implement `tickTimer()` — decrements `timerRemaining` by 1, updates `#timer-display` via `formatTimerDisplay`, and when `timerRemaining <= 0` calls `stopTimer()` then `alert('Focus session complete! Take a break.')`
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

- [x] 6. Implement Todo List in `js/app.js`
  - Declare module-level state: `let tasks = []`
  - Implement `renderTaskItem(task)` — creates an `<li>` element with `data-task-id` attribute; includes a toggle button (`data-action="toggle"`), a `<span>` for the title (with `task-completed` class when `task.completed` is true), an edit button (`data-action="edit"`), and a delete button (`data-action="delete"`); returns the element
  - Implement `renderTasks(tasks)` — clears `#task-list`, then either appends a rendered item for each task via `renderTaskItem`, or inserts an empty-state `<li>` with class `empty-state` and text `"No tasks yet. Add one above!"` when the array is empty
  - Implement `addTask(title)` — trims the title; if empty, calls `showValidationError` on `#task-input` and returns; otherwise creates a `Task` object (`id`, `title`, `completed: false`, `createdAt`), pushes to `tasks`, calls `saveTasks(tasks)`, calls `renderTasks(tasks)`, and calls `clearValidationError` on the input
  - Implement `deleteTask(id)` — filters `tasks` to remove the matching id, calls `saveTasks(tasks)`, calls `renderTasks(tasks)`
  - Implement `toggleTask(id)` — finds the task by id, flips its `completed` boolean, calls `saveTasks(tasks)`, calls `renderTasks(tasks)`
  - Implement `beginEditTask(id)` — finds the task's `<li>` in the DOM, replaces the title `<span>` with an `<input>` pre-filled with the current title, and swaps the edit button for confirm (`data-action="confirm"`) and cancel (`data-action="cancel"`) buttons
  - Implement `confirmEditTask(id, newTitle)` — trims `newTitle`; if empty, shows a validation error and returns; otherwise updates the task's title in the `tasks` array, calls `saveTasks(tasks)`, calls `renderTasks(tasks)`
  - Implement `cancelEditTask(id)` — calls `renderTasks(tasks)` to restore the read-only view without saving
  - Implement `initTodoList()` — sets `tasks = loadTasks()`, calls `renderTasks(tasks)`, attaches a `submit` listener to `#task-form` that calls `addTask` and clears/refocuses the input, and attaches a delegated `click` listener to `#task-list` that reads `data-action` and `data-task-id` to dispatch to the correct handler
  - Implement `showValidationError(inputEl, message)` and `clearValidationError(inputEl)` helper functions for inline error display
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 7. Implement Quick Links in `js/app.js`
  - Declare module-level state: `let links = []`
  - Implement `normalizeUrl(url)` — trims the input; if it does not start with `"http://"` or `"https://"`, prepends `"https://"` and returns the result; otherwise returns the trimmed input unchanged
  - Implement `renderLinkItem(link)` — creates a wrapper `<div>` with `data-link-id` attribute; includes an `<a>` tag styled as a button that opens `link.url` in a new tab (`target="_blank"`, `rel="noopener noreferrer"`), and a delete button (`data-action="delete"`); returns the element
  - Implement `renderLinks(links)` — clears `#links-list`, then either appends a rendered item for each link via `renderLinkItem`, or inserts an empty-state element with class `empty-state` and text `"No links saved yet."` when the array is empty
  - Implement `addLink(label, url)` — trims both inputs; if label is empty, shows a validation error on `#link-label` and returns; if url is empty, shows a validation error on `#link-url` and returns; otherwise calls `normalizeUrl(url)`, creates a `Link` object (`id`, `label`, `url`, `createdAt`), pushes to `links`, calls `saveLinks(links)`, calls `renderLinks(links)`, and clears validation errors
  - Implement `deleteLink(id)` — filters `links` to remove the matching id, calls `saveLinks(links)`, calls `renderLinks(links)`
  - Implement `initQuickLinks()` — sets `links = loadLinks()`, calls `renderLinks(links)`, attaches a `submit` listener to `#link-form` that calls `addLink` and clears/refocuses the inputs, and attaches a delegated `click` listener to `#links-list` that reads `data-action` and `data-link-id` to dispatch to `deleteLink`
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 7.1, 7.2, 7.3_

- [x] 8. Wire everything together — `init()` and `DOMContentLoaded`
  - At the bottom of `js/app.js`, add a `document.addEventListener('DOMContentLoaded', function () { ... })` listener
  - Inside the listener, call `initGreeting()`, `initTimer()`, `initTodoList()`, and `initQuickLinks()` in that order
  - Close the IIFE wrapper if one was used
  - _Requirements: 9.1, 9.4, 9.5_

## Notes

- All files must be created inside `CodingCamp-4May26-FajarNaksaBandi/` — the final paths are `CodingCamp-4May26-FajarNaksaBandi/index.html`, `CodingCamp-4May26-FajarNaksaBandi/css/style.css`, and `CodingCamp-4May26-FajarNaksaBandi/js/app.js`
- No third-party libraries, frameworks, or build tools — the app must work when opened directly via `file://` protocol
- Tasks build incrementally: each task depends on the previous ones being complete before wiring works end-to-end
