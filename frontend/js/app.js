const API_URL = "http://localhost:3000/api/expenses";

function showAlert(message) {
    const alertContainer = document.getElementById("alertContainer");

    alertContainer.innerHTML = `
        <div class="alert alert-danger alert-dismissible fade show d-flex align-items-center mx-auto mt-3" role="alert">
            <svg xmlns="http://www.w3.org/2000/svg"
                 class="bi flex-shrink-0 me-2"
                 width="20"
                 height="20"
                 viewBox="0 0 16 16"
                 role="img"
                 aria-label="Warning:">
                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
            </svg>

            <div>
                ${message}
            </div>

            <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
}
function showSuccessAlert(message) {
    const alertContainer = document.getElementById("alertContainer");

    alertContainer.innerHTML = `
        <div class="alert alert-success alert-dismissible fade show mx-auto mt-3" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
}


function showSpinner() {
    document.getElementById("spinner").classList.remove("d-none");
}

function hideSpinner() {
    document.getElementById("spinner").classList.add("d-none");
}

async function getExpenses() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message);
        }

        const data = await response.json();
        return data;

    } catch (error) {
       
         showAlert("Unable to connect to the server. Please try again.");
        return [];
    }
}

let editExpenseId;

function renderTable(list) {

    const tbody = document.getElementById("expensesTableBody");
    tbody.innerHTML = "";

    list.forEach(function(expense) {

        const row = document.createElement("tr");

        // Title
        const titleCell = document.createElement("td");
        titleCell.textContent = expense.title;

        // Amount
        const amountCell = document.createElement("td");
        amountCell.textContent = Number(expense.amount).toFixed(2);
        amountCell.className = "amount-cell";

        // Category
        const categoryCell = document.createElement("td");

        const categoryBadge = document.createElement("span");
        categoryBadge.textContent = expense.category;

        if (expense.category === "Food") {
            categoryBadge.className = "badge bg-success";
        }
        else if (expense.category === "Transport") {
            categoryBadge.className = "badge bg-primary";
        }
        else if (expense.category === "Bills") {
            categoryBadge.className = "badge bg-warning text-dark";
        }
        else if (expense.category === "Entertainment") {
            categoryBadge.className = "badge bg-info text-dark";
        }
        else {
            categoryBadge.className = "badge bg-secondary";
        }

        categoryCell.appendChild(categoryBadge);

        // Date
        const dateCell = document.createElement("td");
        dateCell.textContent = expense.date;

        // Actions
        const actionsCell = document.createElement("td");
        actionsCell.className = "actions-cell";

        // Edit button
        const editButton = document.createElement("button");

        editButton.textContent = "Edit";
        editButton.className = "btn btn-outline-secondary btn-sm me-2";

        editButton.addEventListener("click", function() {

            editExpenseId = expense.id;

            const editTitle = document.getElementById("editTitle");
            const editAmount = document.getElementById("editAmount");
            const editCategory = document.getElementById("editCategory");
            const editDate = document.getElementById("editDate");

            editTitle.value = expense.title;
            editAmount.value = expense.amount;
            editCategory.value = expense.category;
            editDate.value = expense.date;

            const editModal = new bootstrap.Modal(
                document.getElementById("editModal")
            );

            editModal.show();

        });

        // Delete button
        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";
        deleteButton.className = "btn btn-outline-danger btn-sm";

        deleteButton.addEventListener("click", async function() {

            try {

                const response = await fetch(
                    API_URL + "/" + expense.id,
                    {
                        method: "DELETE"
                    }
                );

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.message);
                }

                await refresh();
                 showSuccessAlert("Expense deleted successfully.");

            } catch (error) {

                showAlert(error.message);

            }

        });

       
        actionsCell.appendChild(editButton);
        actionsCell.appendChild(deleteButton);

      
        row.appendChild(titleCell);
        row.appendChild(amountCell);
        row.appendChild(categoryCell);
        row.appendChild(dateCell);
        row.appendChild(actionsCell);

       
        tbody.appendChild(row);
    });
}

//Summary
function renderSummary(list) {
    const totalAmount = document.getElementById("totalAmount");
    const expenseCount = document.getElementById("expenseCount");
    const highestExpense = document.getElementById("highestExpense");
    const highestExpenseTitle = document.getElementById("highestExpenseTitle");

        let total = 0;
        let highest = 0;
        let highestTitle = "";
       list.forEach(function(expense) {

        total = total + Number(expense.amount);
        

        if (Number(expense.amount) > highest) {
            highest = Number(expense.amount);
             highestTitle = expense.title;
        }

    });

    totalAmount.textContent = "Jod " + total.toFixed(2);

    expenseCount.textContent = list.length;

    highestExpense.textContent = "Jod " + highest.toFixed(2);

    highestExpenseTitle.textContent = highestTitle;
}

// Refresh
async function refresh() {
    showSpinner();

    try {
        const expenses = await getExpenses();
        applyFilter(expenses);

    } finally {
        hideSpinner();
    }
}


// Add expenses
const expenseForm = document.getElementById("expenseForm");
const dateInput = document.getElementById("date");
const today = new Date();
const formattedDate =
    today.getFullYear() +
    "-" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(today.getDate()).padStart(2, "0");

dateInput.value = formattedDate;

expenseForm.addEventListener("submit",async function(event) {

event.preventDefault();
   
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");

const title = titleInput.value.trim();
const amount = amountInput.value;
const category = categoryInput.value;
const date = dateInput.value;
titleInput.classList.remove("is-invalid");
amountInput.classList.remove("is-invalid");
categoryInput.classList.remove("is-invalid");
dateInput.classList.remove("is-invalid");

let isValid = true;

if (title === "") {
    titleInput.classList.add("is-invalid");
    isValid = false;
}

if (amount === "" || Number(amount) <= 0) {
    amountInput.classList.add("is-invalid");
    isValid = false;
}

if (category === "") {
    categoryInput.classList.add("is-invalid");
    isValid = false;
}

if (date === "") {
    dateInput.classList.add("is-invalid");
    isValid = false;
}

if (!isValid) {
    return;
}


const expenseData = {
    title: title,
    amount: Number(amount),
    category: category,
    date: date
};

try {

    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(expenseData)
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
    }
    await refresh();
    expenseForm.reset();
    
    dateInput.value = formattedDate;
    showSuccessAlert("Expense added successfully.");
} catch (error) {

    showAlert(error.message);

}

});

//Edit expense form
const editForm = document.getElementById("editForm");

editForm.addEventListener("submit", async function(event) {

    event.preventDefault();
    const title = document.getElementById("editTitle").value;
    const amount = document.getElementById("editAmount").value;
    const category = document.getElementById("editCategory").value;
    const date = document.getElementById("editDate").value;

    const expenseData = {
    title: title,
    amount: Number(amount),
    category: category,
    date: date
};
  try {
  
    const response = await fetch(API_URL + "/" + editExpenseId, {
        
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(expenseData)
    });
   

    if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message);
    }

    await refresh();


    const editModal = bootstrap.Modal.getInstance(document.getElementById("editModal"));
    editModal.hide();
    showSuccessAlert("Expense updated successfully.");

   } catch (error) {

    showAlert(error.message);

}

});


const categoryFilter = document.getElementById("categoryFilter");
const titleFilter = document.getElementById("titleFilter");
const monthFilter = document.getElementById("monthFilter");

categoryFilter.addEventListener("change", async function() {

    const expenses = await getExpenses();

    applyFilter(expenses);

});
titleFilter.addEventListener("input", async function() {

    const expenses = await getExpenses();

    applyFilter(expenses);

});

monthFilter.addEventListener("change", async function() {

    const expenses = await getExpenses();

    applyFilter(expenses);

});

// Apply filter
function applyFilter(list) {

    const selectedCategory = categoryFilter.value;
    const searchTitle = titleFilter.value.toLowerCase();
    const selectedMonth = monthFilter.value;

    const filteredList = list.filter(function(expense) {

        const matchesTitle = expense.title
            .toLowerCase()
            .includes(searchTitle);

        const matchesMonth = selectedMonth === "" ||
            expense.date.startsWith(selectedMonth);

        const matchesCategory = selectedCategory === "All" ||
            expense.category === selectedCategory;

        return matchesTitle && matchesMonth && matchesCategory;
    });

    renderTable(filteredList);
    renderSummary(list);
}



const darkModeBtn = document.getElementById("darkModeBtn");

const savedMode = localStorage.getItem("darkMode");

if (savedMode === "dark") {
    document.body.classList.add("dark-mode");
    darkModeBtn.innerHTML = '<i class="bi bi-sun"></i>';
}

darkModeBtn.addEventListener("click", function() {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        darkModeBtn.innerHTML = '<i class="bi bi-sun"></i>';
        localStorage.setItem("darkMode", "dark");
    } else {
        darkModeBtn.innerHTML = '<i class="bi bi-moon"></i>';
        localStorage.setItem("darkMode", "light");
    }
});


refresh();