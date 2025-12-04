document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("taskInput") as HTMLInputElement;
  const addBtn = document.getElementById("addBtn") as HTMLButtonElement;
  const inProgress = document.getElementById("inProgress") as HTMLElement;
  const done = document.getElementById("done") as HTMLElement;

  class Task {
    title: string;
    done: boolean;
    createdAt: Date;
    id: string;
    constructor(title: string) {
      this.title = title;
      this.done = false;
      this.createdAt = new Date();
      this.id = crypto.randomUUID();
    }
  }

  interface ITaskManager {
    add: (title: string) => void;
    remove: (id: string) => void;
    toggleStatus: (id: string) => void;
    saveLocalStorage: () => void;
    load: () => void;
    getTasks: () => Task[];
  }
  class TaskManager implements ITaskManager {
    private tasks: Task[] = [];

    constructor() {
      this.load();
    }

    add = (title: string): void => {
      try {
        validationTaskTitle(title);
        const newTask = new Task(title);
        this.tasks.push(newTask);
        this.saveLocalStorage();
        renderTasks();
        console.log(newTask);
      } catch (error) {
        if (error instanceof Error) {
          alert(error.message);
        }
      }
    };

    remove = (id: string): void => {
      this.tasks = this.tasks.filter((task) => task.id !== id);
      this.saveLocalStorage();
      renderTasks();
    };

    toggleStatus = (id: string): void => {
      const task = this.tasks.find((task) => task.id === id);
      if (!task) return;
      task.done = !task.done;
      this.saveLocalStorage();
      renderTasks();
    };

    saveLocalStorage = (): void => {
      localStorage.setItem("tasks", JSON.stringify(this.tasks));
    };

    load = (): void => {
      const tasksJSON = localStorage.getItem("tasks");
      if (!tasksJSON) return;

      try {
        const loaded = JSON.parse(tasksJSON);
        this.tasks = loaded.map((t: any) => {
          const task = new Task(t.title);
          task.id = t.id;
          task.done = t.done;
          task.createdAt = new Date(t.createdAt);
          return task;
        });
      } catch {
        this.tasks = [];
      }
    };

    getTasks = (): Task[] => {
      return this.tasks;
    };
  }
  const taskManager = new TaskManager();
  renderTasks();

  function renderTasks() {
    inProgress.innerHTML = "";
    done.innerHTML = "";
    const allTasks = taskManager.getTasks();

    for (let i = 0; i < allTasks.length; i++) {
      const task = allTasks[i];
      const block = document.createElement("div");
      block.className = "task-item";
      block.dataset.id = task.id;

      block.innerHTML = `<span>${task.title}</span>
<button class="done-btn">...</button>
${task.done ? "" : '<button class="edit-btn">Редактировать</button>'}
${task.done ? "" : '<button class="delete-btn">Удалить</button>'}
`;

      const deleteBtn = block.querySelector(".delete-btn");
      deleteBtn?.addEventListener("click", () => {
        const taskId = block.dataset.id;
        if (taskId) {
          taskManager.remove(taskId);
        }
      });
      const doneBtn = block.querySelector(".done-btn");
      doneBtn?.addEventListener("click", () => {
        const taskId = block.dataset.id;
        if (taskId) {
          taskManager.toggleStatus(taskId);
        }
      });

      const editBtn = block.querySelector(".edit-btn");

      editBtn?.addEventListener("click", () => {
        const span = block.querySelector("span");
        if (!span) return;

        const inputEdit = document.createElement("input");
        inputEdit.type = "text";
        inputEdit.value = span.textContent || "";
        inputEdit.className = "task-edit-input";

        span.replaceWith(inputEdit);
        inputEdit.focus();
        inputEdit.select();

        const saveEdit = () => {
          const newTitle = inputEdit.value.trim();

          taskManager.getTasks().forEach((task) => {
            if (task.id === block.dataset.id) {
              task.title = newTitle;
            }
          });

          taskManager.saveLocalStorage();
          renderTasks();
        };

        inputEdit.addEventListener("blur", saveEdit);
      });
      if (task.done) {
        done.appendChild(block);
      } else {
        inProgress.appendChild(block);
      }
    }
    document.getElementById("inProgressCount")!.textContent = taskManager
      .getTasks()
      .filter((t) => !t.done)
      .length.toString();

    document.getElementById("doneCount")!.textContent = taskManager
      .getTasks()
      .filter((t) => t.done)
      .length.toString();
  }

  addBtn.addEventListener("click", () => {
    const title = input.value.trim();

    taskManager.add(title);
    input.value = "";
    renderTasks();
  });
});
function validationTaskTitle(title: string): void {
  const trimmed = title.trim();
  if (trimmed.length === 0) {
    throw new Error("Название задачи не может быть пустым");
  }
  if (trimmed.length > 12) {
    throw new Error("Название задачи слишком длинное");
  }
}
