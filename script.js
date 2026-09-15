// ============================================
// Expense Tracker
// ============================================

// Elements

const expenseForm = document.getElementById("expenseForm");

const amountInput = document.getElementById("amount");

const categoryInput = document.getElementById("category");

const noteInput = document.getElementById("note");

const dateInput = document.getElementById("date");

const expenseList = document.getElementById("expenseList");

const todayTotal = document.getElementById("todayTotal");

const monthTotal = document.getElementById("monthTotal");

const clearAllBtn = document.getElementById("clearAllBtn");

const installBtn = document.getElementById("installBtn");

const addExpenseSection = document.getElementById("addExpenseSection");

const expensesSection = document.getElementById("expensesSection");

// ============================================
// Load Expenses
// ============================================

let expenses = JSON.parse(localStorage.getItem("expenses") || "[]");

// ============================================
// Today's Date
// ============================================

function getTodayDate() {
  const today = new Date();

  const year = today.getFullYear();

  const month = String(today.getMonth() + 1).padStart(2, "0");

  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

dateInput.value = getTodayDate();

// ============================================
// Save
// ============================================

function saveExpenses() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
}

// ============================================
// Currency
// ============================================

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

// ============================================
// Add Expense
// ============================================

expenseForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const amount = Number(amountInput.value);

  const category = categoryInput.value;

  const note = noteInput.value.trim();

  const date = dateInput.value;

  if (!amount || amount <= 0) {
    alert("Please enter a valid amount.");

    amountInput.focus();

    return;
  }

  if (!category) {
    alert("Please select a category.");

    categoryInput.focus();

    return;
  }

  if (!date) {
    alert("Please select a date.");

    return;
  }

  const expense = {
    id: Date.now(),

    amount: amount,

    category: category,

    note: note,

    date: date,
  };

  expenses.push(expense);

  saveExpenses();

  renderExpenses();

  updateTotals();

  // Reset

  expenseForm.reset();

  dateInput.value = getTodayDate();

  amountInput.focus();
});

// ============================================
// Render Expenses
// ============================================

function renderExpenses() {
  expenseList.innerHTML = "";

  if (expenses.length === 0) {
    expenseList.innerHTML = `
            <div class="empty-message">
                No expenses added yet.
            </div>
        `;

    return;
  }

  const sortedExpenses = [...expenses].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });

  sortedExpenses.forEach((expense) => {
    const item = document.createElement("div");

    item.className = "expense-item";

    // Left

    const left = document.createElement("div");

    left.className = "expense-left";

    const category = document.createElement("div");

    category.className = "expense-category";

    category.textContent = expense.category;

    const note = document.createElement("div");

    note.className = "expense-note";

    note.textContent = expense.note || "No note";

    const date = document.createElement("div");

    date.className = "expense-date";

    date.textContent = formatDate(expense.date);

    left.appendChild(category);

    left.appendChild(note);

    left.appendChild(date);

    // Right

    const right = document.createElement("div");

    right.className = "expense-right";

    const amount = document.createElement("span");

    amount.className = "expense-amount";

    amount.textContent = formatCurrency(expense.amount);

    const deleteButton = document.createElement("button");

    deleteButton.className = "delete-btn";

    deleteButton.textContent = "×";

    deleteButton.title = "Delete expense";

    deleteButton.addEventListener("click", function () {
      deleteExpense(expense.id);
    });

    right.appendChild(amount);

    right.appendChild(deleteButton);

    item.appendChild(left);

    item.appendChild(right);

    expenseList.appendChild(item);
  });
}

// ============================================
// Format Date
// ============================================

function formatDate(dateString) {
  const date = new Date(dateString + "T00:00:00");

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ============================================
// Delete
// ============================================

function deleteExpense(id) {
  expenses = expenses.filter((expense) => expense.id !== id);

  saveExpenses();

  renderExpenses();

  updateTotals();
}

// ============================================
// Totals
// ============================================

function updateTotals() {
  const today = getTodayDate();

  const now = new Date();

  const currentYear = now.getFullYear();

  const currentMonth = String(now.getMonth() + 1).padStart(2, "0");

  let todayAmount = 0;

  let monthlyAmount = 0;

  expenses.forEach((expense) => {
    // Today

    if (expense.date === today) {
      todayAmount += Number(expense.amount);
    }

    // Month

    const [year, month] = expense.date.split("-");

    if (Number(year) === currentYear && month === currentMonth) {
      monthlyAmount += Number(expense.amount);
    }
  });

  todayTotal.textContent = formatCurrency(todayAmount);

  monthTotal.textContent = formatCurrency(monthlyAmount);
}

// ============================================
// Clear All
// ============================================

clearAllBtn.addEventListener("click", function () {
  if (expenses.length === 0) {
    return;
  }

  const confirmed = confirm("Delete all expenses?");

  if (!confirmed) {
    return;
  }

  expenses = [];

  saveExpenses();

  renderExpenses();

  updateTotals();
});

// ============================================
// PWA Install
// ============================================

let deferredPrompt = null;

window.addEventListener("beforeinstallprompt", function (event) {
  event.preventDefault();

  deferredPrompt = event;

  installBtn.hidden = false;
});

installBtn.addEventListener("click", async function () {
  if (!deferredPrompt) {
    return;
  }

  deferredPrompt.prompt();

  const result = await deferredPrompt.userChoice;

  console.log("Install result:", result.outcome);

  deferredPrompt = null;

  installBtn.hidden = true;
});

// ============================================
// Handle PWA Shortcut
// ============================================

function handleShortcut() {
  const params = new URLSearchParams(window.location.search);

  const action = params.get("action");

  if (action === "add") {
    // Scroll to Add Expense

    addExpenseSection.scrollIntoView({
      behavior: "smooth",
    });

    // Focus amount after scroll

    setTimeout(function () {
      amountInput.focus();
    }, 500);
  }

  if (action === "view") {
    expensesSection.scrollIntoView({
      behavior: "smooth",
    });
  }
}

// ============================================
// Service Worker
// ============================================

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("service-worker.js")
      .then(function () {
        console.log("Service Worker registered.");
      })
      .catch(function (error) {
        console.error("Service Worker error:", error);
      });
  });
}

// ============================================
// Initial Load
// ============================================

renderExpenses();

updateTotals();

handleShortcut();
