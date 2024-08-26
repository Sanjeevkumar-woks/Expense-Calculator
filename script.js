// Get DOM elements
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeSelect = document.getElementById("type");
const entriesList = document.getElementById("entries-list");
const totalIncomeDisplay = document.getElementById("total-income");
const totalExpensesDisplay = document.getElementById("total-expenses");
const netBalanceDisplay = document.getElementById("net-balance");
const filterRadios = document.querySelectorAll('input[name="filter"]');
const dateRangeSelect = document.getElementById("date-range");

// Load entries from local storage or initialize empty array
let entries = JSON.parse(localStorage.getItem("entries")) || [];

// Function to save entries to local storage
function saveEntries() {
  localStorage.setItem("entries", JSON.stringify(entries));
}

// Function to calculate totals
function calculateTotals() {
  let totalIncome = 0;
  let totalExpenses = 0;

  entries.forEach((entry) => {
    if (entry.type === "income") {
      totalIncome += entry.amount;
    } else if (entry.type === "expense") {
      totalExpenses += entry.amount;
    }
  });

  const netBalance = totalIncome - totalExpenses;

  totalIncomeDisplay.textContent = totalIncome.toFixed(2);
  totalExpensesDisplay.textContent = totalExpenses.toFixed(2);
  netBalanceDisplay.textContent = netBalance.toFixed(2);
}

// Function to add entry to the list
function addEntry(description, amount, type) {
  const entry = {
    id: Date.now(),
    description,
    amount: parseFloat(amount),
    type,
    date: new Date().toISOString(), // Add date field
  };
  entries.push(entry);
  saveEntries();
  renderEntries();
}

// Function to filter entries based on date range
function filterByDate(entries, range) {
  const now = new Date();
  const filteredEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.date);
    if (range === "weekly") {
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      return entryDate >= startOfWeek;
    } else if (range === "monthly") {
      return (
        entryDate.getMonth() === now.getMonth() &&
        entryDate.getFullYear() === now.getFullYear()
      );
    } else if (range === "yearly") {
      return entryDate.getFullYear() === now.getFullYear();
    } else {
      return true; // All entries if "all" range is selected
    }
  });
  return filteredEntries;
}

// Function to render entries based on selected filter and date range
function renderEntries() {
  const filter = document.querySelector('input[name="filter"]:checked').value;
  const dateRange = dateRangeSelect.value;

  // Clear the existing list
  entriesList.innerHTML = "";

  // Filter entries based on the selected filter
  const filteredEntries = entries.filter((entry) => {
    if (filter === "all") {
      return true; // Show all entries if the "all" filter is selected
    } else if (filter === "income") {
      return entry.type === "income";
    } else if (filter === "expense") {
      return entry.type === "expense";
    }
  });

  // Further filter by date range
  const dateFilteredEntries = filterByDate(filteredEntries, dateRange);

  // Render filtered entries
  dateFilteredEntries.forEach((entry) => {
    const li = document.createElement("li");
    li.classList.add(entry.type);
    li.innerHTML = `
            ${entry.description} <span>${entry.amount.toFixed(2)} ₹</span>
            <div>
                <button onclick="editEntry(${entry.id})">Edit</button>
                <button class="delete" onclick="deleteEntry(${
                  entry.id
                })">Delete</button>
            </div>
        `;
    entriesList.appendChild(li);
  });

  // Recalculate totals after rendering
  calculateTotals();
}

// Function to edit entry
function editEntry(id) {
  const entry = entries.find((entry) => entry.id === id);
  descriptionInput.value = entry.description;
  amountInput.value = entry.amount;
  typeSelect.value = entry.type;

  deleteEntry(id); // Remove the entry to update with new values
}

// Function to delete entry
function deleteEntry(id) {
  entries = entries.filter((entry) => entry.id !== id);
  saveEntries();
  renderEntries();
}

// Event listener for adding a new entry
document.getElementById("add-entry").addEventListener("click", () => {
  const description = descriptionInput.value.trim();
  const amount = amountInput.value.trim();
  const type = typeSelect.value;

  if (description && amount) {
    addEntry(description, amount, type);
    descriptionInput.value = "";
    amountInput.value = "";
  }
});

// Event listener for filter change
filterRadios.forEach((radio) => {
  radio.addEventListener("change", renderEntries);
});

// Event listener for date range change
dateRangeSelect.addEventListener("change", renderEntries);

// Initial render of entries and totals
renderEntries();
