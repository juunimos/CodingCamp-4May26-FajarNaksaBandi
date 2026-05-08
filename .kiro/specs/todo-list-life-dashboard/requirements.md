# Requirements Document

## Introduction

The Todo List Life Dashboard is a client-side web application that serves as a personal productivity hub. It combines a real-time greeting with the current date and time, a Pomodoro-style focus timer, a persistent to-do list, and a quick-access links panel — all in a single, clean interface. The application requires no backend server; all data is stored in the browser's Local Storage. It can be used as a standalone web page or packaged as a browser extension.

## Glossary

- **Dashboard**: The single-page web application described in this document.
- **Greeting_Widget**: The UI component that displays the current time, date, and a time-of-day greeting.
- **Focus_Timer**: The UI component that implements a 25-minute countdown timer.
- **Todo_List**: The UI component that manages the user's task items.
- **Task**: A single to-do item with a title, completion state, and unique identifier.
- **Quick_Links**: The UI component that displays user-defined shortcut buttons to external URLs.
- **Link**: A user-defined entry consisting of a label and a URL stored in Quick_Links.
- **Local_Storage**: The browser's `localStorage` API used for all client-side data persistence.
- **Modern_Browser**: Chrome, Firefox, Edge, or Safari in their current stable releases.

---

## Requirements

### Requirement 1: Real-Time Greeting

**User Story:** As a user, I want to see the current time, date, and a contextual greeting when I open the Dashboard, so that I am immediately oriented to the time of day.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL display the current time in HH:MM format, updated every minute.
2. THE Greeting_Widget SHALL display the current date in a human-readable format (e.g., "Monday, 5 May 2025").
3. WHEN the local hour is between 05:00 and 11:59, THE Greeting_Widget SHALL display the greeting "Good Morning".
4. WHEN the local hour is between 12:00 and 17:59, THE Greeting_Widget SHALL display the greeting "Good Afternoon".
5. WHEN the local hour is between 18:00 and 20:59, THE Greeting_Widget SHALL display the greeting "Good Evening".
6. WHEN the local hour is between 21:00 and 04:59, THE Greeting_Widget SHALL display the greeting "Good Night".
7. THE Greeting_Widget SHALL update the displayed time without requiring a page reload.

---

### Requirement 2: Focus Timer

**User Story:** As a user, I want a 25-minute countdown timer with start, stop, and reset controls, so that I can manage focused work sessions.

#### Acceptance Criteria

1. THE Focus_Timer SHALL initialise with a countdown value of 25 minutes and 00 seconds (25:00).
2. WHEN the user activates the Start control, THE Focus_Timer SHALL begin counting down one second at a time.
3. WHILE the Focus_Timer is counting down, THE Focus_Timer SHALL update the displayed time every second.
4. WHEN the user activates the Stop control, THE Focus_Timer SHALL pause the countdown at the current value.
5. WHEN the user activates the Reset control, THE Focus_Timer SHALL stop any active countdown and restore the display to 25:00.
6. WHEN the countdown reaches 00:00, THE Focus_Timer SHALL stop automatically and notify the user with a browser alert or visible indicator.
7. WHILE the Focus_Timer is counting down, THE Focus_Timer SHALL disable the Start control to prevent duplicate timers.
8. THE Focus_Timer SHALL display the remaining time in MM:SS format at all times.

---

### Requirement 3: To-Do List — Add and Display Tasks

**User Story:** As a user, I want to add tasks to a list and see them displayed, so that I can track what I need to do.

#### Acceptance Criteria

1. THE Todo_List SHALL provide an input field and an Add button for entering new tasks.
2. WHEN the user submits a non-empty task title, THE Todo_List SHALL append the new Task to the list with a completion state of incomplete.
3. IF the user submits an empty or whitespace-only task title, THEN THE Todo_List SHALL reject the submission and display an inline validation message.
4. THE Todo_List SHALL display each Task with its title, a completion toggle control, an edit control, and a delete control.
5. THE Todo_List SHALL persist all Tasks to Local_Storage after every add operation.
6. WHEN the Dashboard loads, THE Todo_List SHALL restore all previously saved Tasks from Local_Storage and display them in their saved order.

---

### Requirement 4: To-Do List — Edit Tasks

**User Story:** As a user, I want to edit an existing task's title, so that I can correct or update it without deleting and re-adding it.

#### Acceptance Criteria

1. WHEN the user activates the edit control for a Task, THE Todo_List SHALL replace the Task's title display with an editable input field pre-filled with the current title.
2. WHEN the user confirms the edit with a non-empty title, THE Todo_List SHALL update the Task's title and restore the read-only display.
3. IF the user confirms the edit with an empty or whitespace-only title, THEN THE Todo_List SHALL reject the change and retain the original title.
4. WHEN the user cancels the edit, THE Todo_List SHALL discard any changes and restore the original title display.
5. THE Todo_List SHALL persist the updated Task title to Local_Storage after a successful edit.

---

### Requirement 5: To-Do List — Complete and Delete Tasks

**User Story:** As a user, I want to mark tasks as done and delete tasks I no longer need, so that I can keep my list current.

#### Acceptance Criteria

1. WHEN the user activates the completion toggle for an incomplete Task, THE Todo_List SHALL mark the Task as complete and apply a visual distinction (e.g., strikethrough text).
2. WHEN the user activates the completion toggle for a complete Task, THE Todo_List SHALL mark the Task as incomplete and remove the visual distinction.
3. THE Todo_List SHALL persist the updated completion state to Local_Storage after every toggle operation.
4. WHEN the user activates the delete control for a Task, THE Todo_List SHALL remove the Task from the list and from Local_Storage.
5. WHEN all Tasks have been deleted, THE Todo_List SHALL display an empty-state message (e.g., "No tasks yet. Add one above!").

---

### Requirement 6: Quick Links — Add and Display Links

**User Story:** As a user, I want to add shortcut buttons for my favourite websites, so that I can open them quickly from the Dashboard.

#### Acceptance Criteria

1. THE Quick_Links SHALL provide input fields for a link label and a URL, and an Add button.
2. WHEN the user submits a non-empty label and a valid URL, THE Quick_Links SHALL add the Link and display it as a clickable button.
3. IF the user submits an empty label or an empty URL, THEN THE Quick_Links SHALL reject the submission and display an inline validation message.
4. IF the user submits a URL that does not begin with "http://" or "https://", THEN THE Quick_Links SHALL prepend "https://" to the URL before saving.
5. WHEN the user activates a Link button, THE Quick_Links SHALL open the associated URL in a new browser tab.
6. THE Quick_Links SHALL persist all Links to Local_Storage after every add operation.
7. WHEN the Dashboard loads, THE Quick_Links SHALL restore all previously saved Links from Local_Storage and render them as buttons.

---

### Requirement 7: Quick Links — Delete Links

**User Story:** As a user, I want to remove quick links I no longer need, so that the panel stays relevant.

#### Acceptance Criteria

1. THE Quick_Links SHALL display a delete control alongside each Link button.
2. WHEN the user activates the delete control for a Link, THE Quick_Links SHALL remove the Link from the panel and from Local_Storage.
3. WHEN all Links have been deleted, THE Quick_Links SHALL display an empty-state message (e.g., "No links saved yet.").

---

### Requirement 8: Data Persistence Integrity

**User Story:** As a user, I want my tasks and links to survive page refreshes and browser restarts, so that I never lose my data unexpectedly.

#### Acceptance Criteria

1. THE Dashboard SHALL store Tasks under a dedicated Local_Storage key (e.g., `dashboard_tasks`).
2. THE Dashboard SHALL store Links under a dedicated Local_Storage key (e.g., `dashboard_links`).
3. IF Local_Storage data for Tasks is missing or malformed, THEN THE Dashboard SHALL initialise the Task list as empty without throwing an unhandled error.
4. IF Local_Storage data for Links is missing or malformed, THEN THE Dashboard SHALL initialise the Link list as empty without throwing an unhandled error.

---

### Requirement 9: Technical Constraints

**User Story:** As a developer, I want the Dashboard built with plain HTML, CSS, and Vanilla JavaScript, so that it has no external dependencies and can run in any modern browser without a build step.

#### Acceptance Criteria

1. THE Dashboard SHALL be implemented using only HTML, CSS, and Vanilla JavaScript with no third-party frameworks or libraries.
2. THE Dashboard SHALL use exactly one CSS file located at `css/style.css`.
3. THE Dashboard SHALL use exactly one JavaScript file located at `js/app.js`.
4. THE Dashboard SHALL function correctly in Modern_Browser without requiring a backend server.
5. THE Dashboard SHALL be usable as a standalone web page opened directly from the file system (i.e., via `file://` protocol) or as a browser extension.

---

### Requirement 10: Visual Design and Usability

**User Story:** As a user, I want a clean, readable, and visually organised interface, so that I can use the Dashboard comfortably without distraction.

#### Acceptance Criteria

1. THE Dashboard SHALL present all four widgets (Greeting_Widget, Focus_Timer, Todo_List, Quick_Links) on a single page without requiring vertical scrolling on a 1280×720 viewport or larger.
2. THE Dashboard SHALL apply a clear visual hierarchy so that each widget is visually distinct from the others.
3. THE Dashboard SHALL use a readable font size of at least 14px for body text.
4. THE Dashboard SHALL provide sufficient colour contrast between text and background to meet WCAG 2.1 AA contrast ratio requirements (minimum 4.5:1 for normal text).
5. WHEN the viewport width is below 768px, THE Dashboard SHALL reflow the layout so that widgets stack vertically and remain fully usable.
