// ============================================
// Expense Tracker
// ============================================


// ============================================
// Google Sheets
// ============================================

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxd2YvgWw5Jb0tSEgU5pjAldgXrsZDmmapY5RF3OZs_Ugmuyb_Yw0Uc_BPOwGTB6txa/exec";


// ============================================
// Elements
// ============================================

const expenseForm =
  document.getElementById("expenseForm");

const amountInput =
  document.getElementById("amount");

const categoryInput =
  document.getElementById("category");

const noteInput =
  document.getElementById("note");

const dateInput =
  document.getElementById("date");

const expenseList =
  document.getElementById("expenseList");

const todayTotal =
  document.getElementById("todayTotal");

const monthTotal =
  document.getElementById("monthTotal");

const clearAllBtn =
  document.getElementById("clearAllBtn");

const installBtn =
  document.getElementById("installBtn");

const addExpenseSection =
  document.getElementById("addExpenseSection");

const expensesSection =
  document.getElementById("expensesSection");

const exportExcelBtn =
  document.getElementById("exportExcelBtn");

const categorySummary =
  document.getElementById("categorySummary");

const categoryDetailsSection =
  document.getElementById("categoryDetailsSection");

const categoryDetailsTitle =
  document.getElementById("categoryDetailsTitle");

const categoryDetailsTotal =
  document.getElementById("categoryDetailsTotal");

const categoryDetailsList =
  document.getElementById("categoryDetailsList");

const backToCategoriesBtn =
  document.getElementById("backToCategoriesBtn");

const closeCategoryDetailsBtn =
  document.getElementById("closeCategoryDetailsBtn");

const syncStatus =
  document.getElementById("syncStatus");


// ============================================
// Load Expenses
// ============================================

let expenses =
  JSON.parse(
    localStorage.getItem("expenses") || "[]"
  );


// ============================================
// Category Icons
// ============================================

const categoryIcons = {
  Food: "🍔",
  Travel: "🚕",
  Shopping: "🛍️",
  Bills: "📄",
  Entertainment: "🎬",
  Health: "💊",
  Other: "📦"
};


// ============================================
// Today's Date
// ============================================

function getTodayDate() {

  const today = new Date();

  const year =
    today.getFullYear();

  const month =
    String(today.getMonth() + 1)
      .padStart(2, "0");

  const day =
    String(today.getDate())
      .padStart(2, "0");

  return `${year}-${month}-${day}`;
}


dateInput.value = getTodayDate();


// ============================================
// Save
// ============================================

function saveExpenses() {

  localStorage.setItem(
    "expenses",
    JSON.stringify(expenses)
  );
}


// ============================================
// Currency
// ============================================

function formatCurrency(amount) {

  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2
    }
  ).format(amount);

}


// ============================================
// Add Expense
// ============================================

expenseForm.addEventListener(
  "submit",
  async function (event) {

    event.preventDefault();

    const amount =
      Number(amountInput.value);

    const category =
      categoryInput.value;

    const note =
      noteInput.value.trim();

    const date =
      dateInput.value;


    if (!amount || amount <= 0) {

      alert(
        "Please enter a valid amount."
      );

      amountInput.focus();

      return;
    }


    if (!category) {

      alert(
        "Please select a category."
      );

      categoryInput.focus();

      return;
    }


    if (!date) {

      alert(
        "Please select a date."
      );

      return;
    }


    const expense = {

      id: Date.now(),

      amount: amount,

      category: category,

      note: note,

      date: date,

      synced: false

    };


    // Save locally first
    expenses.push(expense);

    saveExpenses();

    renderExpenses();

    renderCategorySummary();

    updateTotals();


    // Send to Google Sheet
    await syncExpenseToGoogleSheet(
      expense
    );


    // Reset form
    expenseForm.reset();

    dateInput.value =
      getTodayDate();

    amountInput.focus();

  }
);


// ============================================
// Google Sheet Sync
// ============================================

async function syncExpenseToGoogleSheet(
  expense
) {

  syncStatus.textContent =
    "☁️ Saving to Google Sheet...";


  try {

    await fetch(
      GOOGLE_SCRIPT_URL,
      {
        method: "POST",

        mode: "no-cors",

        headers: {
          "Content-Type":
            "text/plain;charset=utf-8"
        },

        body: JSON.stringify({
          id: expense.id,
          date: expense.date,
          category: expense.category,
          note: expense.note,
          amount: expense.amount
        })
      }
    );


    // Mark as synced
    const localExpense =
      expenses.find(
        item => item.id === expense.id
      );

    if (localExpense) {
      localExpense.synced = true;
      saveExpenses();
    }


    syncStatus.textContent =
      "☁️ Saved to Google Sheet";


    setTimeout(function () {

      syncStatus.textContent = "";

    }, 3000);


  } catch (error) {

    console.error(
      "Google Sheet sync failed:",
      error
    );


    syncStatus.textContent =
      "⚠️ Saved locally. Google Sheet sync failed.";

  }

}


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


  const sortedExpenses =
    [...expenses].sort(
      (a, b) => {

        if (a.date !== b.date) {

          return new Date(b.date)
            - new Date(a.date);

        }

        return b.id - a.id;

      }
    );


  sortedExpenses.forEach(
    function (expense) {

      const item =
        document.createElement("div");

      item.className =
        "expense-item";


      // Left
      const left =
        document.createElement("div");

      left.className =
        "expense-left";


      const category =
        document.createElement("div");

      category.className =
        "expense-category";

      category.textContent =
        `${categoryIcons[expense.category] || "📦"} ${expense.category}`;


      const note =
        document.createElement("div");

      note.className =
        "expense-note";

      note.textContent =
        expense.note || "No note";


      const date =
        document.createElement("div");

      date.className =
        "expense-date";

      date.textContent =
        formatDate(expense.date);


      left.appendChild(category);

      left.appendChild(note);

      left.appendChild(date);


      // Right
      const right =
        document.createElement("div");

      right.className =
        "expense-right";


      const amount =
        document.createElement("span");

      amount.className =
        "expense-amount";

      amount.textContent =
        formatCurrency(
          expense.amount
        );


      const deleteButton =
        document.createElement("button");

      deleteButton.className =
        "delete-btn";

      deleteButton.textContent =
        "×";

      deleteButton.title =
        "Delete expense";


      deleteButton.addEventListener(
        "click",
        function () {

          deleteExpense(
            expense.id
          );

        }
      );


      right.appendChild(amount);

      right.appendChild(deleteButton);


      item.appendChild(left);

      item.appendChild(right);


      expenseList.appendChild(item);

    }
  );

}


// ============================================
// Category Summary
// ============================================

function renderCategorySummary() {

  categorySummary.innerHTML = "";


  if (expenses.length === 0) {

    categorySummary.innerHTML = `
      <div class="empty-message">
        Add an expense to see category summary.
      </div>
    `;

    return;
  }


  const categoryData = {};


  expenses.forEach(
    function (expense) {

      if (!categoryData[expense.category]) {

        categoryData[expense.category] = {
          total: 0,
          count: 0
        };

      }


      categoryData[
        expense.category
      ].total += Number(
        expense.amount
      );


      categoryData[
        expense.category
      ].count++;

    }
  );


  const sortedCategories =
    Object.entries(categoryData)
      .sort(
        (a, b) =>
          b[1].total - a[1].total
      );


  sortedCategories.forEach(
    function ([category, data]) {

      const button =
        document.createElement("button");

      button.className =
        "category-card";


      const left =
        document.createElement("div");

      left.className =
        "category-left";


      const icon =
        document.createElement("span");

      icon.className =
        "category-icon";

      icon.textContent =
        categoryIcons[category] || "📦";


      const nameContainer =
        document.createElement("div");


      const name =
        document.createElement("div");

      name.className =
        "category-name";

      name.textContent =
        category;


      const count =
        document.createElement("div");

      count.className =
        "category-count";

      count.textContent =
        `${data.count} ${
          data.count === 1
            ? "expense"
            : "expenses"
        }`;


      nameContainer.appendChild(name);

      nameContainer.appendChild(count);


      left.appendChild(icon);

      left.appendChild(nameContainer);


      const right =
        document.createElement("div");

      right.className =
        "category-right";


      const total =
        document.createElement("span");

      total.className =
        "category-total";

      total.textContent =
        formatCurrency(
          data.total
        );


      const arrow =
        document.createElement("span");

      arrow.className =
        "category-arrow";

      arrow.textContent =
        "›";


      right.appendChild(total);

      right.appendChild(arrow);


      button.appendChild(left);

      button.appendChild(right);


      button.addEventListener(
        "click",
        function () {

          showCategoryDetails(
            category
          );

        }
      );


      categorySummary.appendChild(
        button
      );

    }
  );

}


// ============================================
// Show Category Details
// ============================================

function showCategoryDetails(
  category
) {

  const categoryExpenses =
    expenses
      .filter(
        expense =>
          expense.category === category
      )
      .sort(
        (a, b) => {

          if (a.date !== b.date) {

            return new Date(b.date)
              - new Date(a.date);

          }

          return b.id - a.id;

        }
      );


  const total =
    categoryExpenses.reduce(
      (sum, expense) =>
        sum + Number(expense.amount),
      0
    );


  categoryDetailsTitle.textContent =
    `${categoryIcons[category] || "📦"} ${category}`;


  categoryDetailsTotal.textContent =
    formatCurrency(total);


  categoryDetailsList.innerHTML = "";


  categoryExpenses.forEach(
    function (expense) {

      const item =
        document.createElement("div");

      item.className =
        "category-detail-item";


      const left =
        document.createElement("div");

      left.className =
        "category-detail-left";


      const note =
        document.createElement("div");

      note.className =
        "category-detail-note";

      note.textContent =
        expense.note || "No note";


      const date =
        document.createElement("div");

      date.className =
        "category-detail-date";

      date.textContent =
        formatDate(
          expense.date
        );


      left.appendChild(note);

      left.appendChild(date);


      const amount =
        document.createElement("div");

      amount.className =
        "category-detail-amount";

      amount.textContent =
        formatCurrency(
          expense.amount
        );


      item.appendChild(left);

      item.appendChild(amount);


      categoryDetailsList.appendChild(
        item
      );

    }
  );


  categoryDetailsSection.hidden =
    false;


  categorySummary
    .parentElement
    .scrollIntoView({
      behavior: "smooth"
    });

}


// ============================================
// Close Category Details
// ============================================

function closeCategoryDetails() {

  categoryDetailsSection.hidden =
    true;

}


backToCategoriesBtn.addEventListener(
  "click",
  closeCategoryDetails
);


closeCategoryDetailsBtn.addEventListener(
  "click",
  closeCategoryDetails
);


// ============================================
// Format Date
// ============================================

function formatDate(dateString) {

  const date =
    new Date(
      dateString + "T00:00:00"
    );


  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );

}


// ============================================
// Delete
// ============================================

function deleteExpense(id) {

  expenses =
    expenses.filter(
      expense =>
        expense.id !== id
    );


  saveExpenses();

  renderExpenses();

  renderCategorySummary();

  updateTotals();

}


// ============================================
// Totals
// ============================================

function updateTotals() {

  const today =
    getTodayDate();


  const now =
    new Date();


  const currentYear =
    now.getFullYear();


  const currentMonth =
    String(
      now.getMonth() + 1
    ).padStart(2, "0");


  let todayAmount = 0;

  let monthlyAmount = 0;


  expenses.forEach(
    function (expense) {

      if (expense.date === today) {

        todayAmount +=
          Number(
            expense.amount
          );

      }


      const [
        year,
        month
      ] =
        expense.date.split("-");


      if (
        Number(year) === currentYear &&
        month === currentMonth
      ) {

        monthlyAmount +=
          Number(
            expense.amount
          );

      }

    }
  );


  todayTotal.textContent =
    formatCurrency(
      todayAmount
    );


  monthTotal.textContent =
    formatCurrency(
      monthlyAmount
    );

}


// ============================================
// Clear All
// ============================================

clearAllBtn.addEventListener(
  "click",
  function () {

    if (expenses.length === 0) {
      return;
    }


    const confirmed =
      confirm(
        "Delete all expenses?"
      );


    if (!confirmed) {
      return;
    }


    expenses = [];

    saveExpenses();

    renderExpenses();

    renderCategorySummary();

    updateTotals();

  }
);


// ============================================
// PWA Install
// ============================================

let deferredPrompt = null;


window.addEventListener(
  "beforeinstallprompt",
  function (event) {

    event.preventDefault();

    deferredPrompt = event;

    installBtn.hidden = false;

  }
);


installBtn.addEventListener(
  "click",
  async function () {

    if (!deferredPrompt) {
      return;
    }


    deferredPrompt.prompt();


    const result =
      await deferredPrompt.userChoice;


    console.log(
      "Install result:",
      result.outcome
    );


    deferredPrompt = null;

    installBtn.hidden = true;

  }
);


// ============================================
// PWA Shortcut
// ============================================

function handleShortcut() {

  const params =
    new URLSearchParams(
      window.location.search
    );


  const action =
    params.get("action");


  if (action === "add") {

    addExpenseSection.scrollIntoView({
      behavior: "smooth"
    });


    setTimeout(
      function () {

        amountInput.focus();

      },
      500
    );

  }


  if (action === "view") {

    expensesSection.scrollIntoView({
      behavior: "smooth"
    });

  }

}


// ============================================
// Service Worker
// ============================================

if ("serviceWorker" in navigator) {

  window.addEventListener(
    "load",
    function () {

      navigator.serviceWorker
        .register(
          "service-worker.js"
        )
        .then(
          function () {

            console.log(
              "Service Worker registered."
            );

          }
        )
        .catch(
          function (error) {

            console.error(
              "Service Worker error:",
              error
            );

          }
        );

    }
  );

}


// ============================================
// Export Excel
// ============================================

exportExcelBtn.addEventListener(
  "click",
  exportToExcel
);


function exportToExcel() {

  const expenses =
    JSON.parse(
      localStorage.getItem(
        "expenses"
      ) || "[]"
    );


  if (expenses.length === 0) {

    alert(
      "No expenses available to export."
    );

    return;
  }


  const excelData =
    expenses.map(
      function (expense) {

        return {

          Date: expense.date,

          Category:
            expense.category,

          Note:
            expense.note || "",

          Amount:
            Number(
              expense.amount
            )

        };

      }
    );


  const worksheet =
    XLSX.utils.json_to_sheet(
      excelData
    );


  const workbook =
    XLSX.utils.book_new();


  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Expenses"
  );


  XLSX.writeFile(
    workbook,
    "Expense_Tracker.xlsx"
  );

}


// ============================================
// Initial Load
// ============================================

renderExpenses();

renderCategorySummary();

updateTotals();

handleShortcut();
