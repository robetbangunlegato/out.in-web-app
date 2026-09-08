let transactions = [];
let searchTransaction = [];
const searchForm = document.getElementById("searchTransactionForm");
const searchInput = document.getElementById("searchTransactionFormTitleInput");
const RENDER_EVENT = "transaction:updated";

document.addEventListener(RENDER_EVENT, function () {
  const incomeList = document.getElementById("incomeList");
  incomeList.innerHTML = "";

  const expenseList = document.getElementById("expenseList");
  expenseList.innerHTML = "";

  let income = 0;
  let expense = 0;
  let balance = 0;

  let data = [];
  if (searchInput.value == "") {
    data = transactions;
  } else if (searchInput.value !== "") {
    data = searchTransaction;
  }

  data.forEach((item) => {
    const transactionElement = makeTransactionElement(item);
    if (item.type === "income") {
      income += item.amount;
      incomeList.append(transactionElement);
    } else if (item.type === "expense") {
      expense += item.amount;
      expenseList.append(transactionElement);
    }
  });

  // perhitungan dilakukan hanya ketika ada perubahan data. pencarian data tidak merubah nilai.
  if (searchInput.value == "") {
    //income
    const incomeElement = document.querySelector(
      "p.tracker-summary__stat-amount--income",
    );
    incomeElement.innerText = `Rp ${income}`;

    //expense
    const expenseElement = document.querySelector(
      "p.tracker-summary__stat-amount--expense",
    );
    expenseElement.innerText = `Rp ${expense}`;

    // balance
    balance = income - expense;
    const balanceElement = document.querySelector(
      "p.tracker-summary__balance-amount",
    );
    balanceElement.innerText = `Rp ${balance}`;
  }
});

// SEARCH LOGIC
searchForm.addEventListener("input", function (e) {
  e.preventDefault();
  const searchData = transactions.filter((item) =>
    item.title
      .trim()
      .toLowerCase()
      .includes(searchInput.value.trim().toLowerCase()),
  );
  searchTransaction = searchData;
  document.dispatchEvent(new Event(RENDER_EVENT));
  if (searchInput == "") {
    loadDataFromStorage();
  }
});

function makeTransactionElement(transaction) {
  // transaction item icon
  const transactionItemIconContainer = document.createElement("div");
  transactionItemIconContainer.classList.add("tracker-transaction-item__icon");

  // detail transaction container : title, date, type(hidden)
  const transactionDetailItemContainer = document.createElement("div");
  transactionDetailItemContainer.classList.add(
    "tracker-transaction-item__detail",
  );

  // detail transaction container : title
  const transactionTitle = document.createElement("h4");
  transactionTitle.innerText = transaction.title;
  transactionTitle.setAttribute("data-testid", "transactionItemTitle");
  transactionTitle.classList.add("tracker-transaction-item__title");
  transactionDetailItemContainer.append(transactionTitle);

  // detail transaction container : date
  const transactionDate = document.createElement("div");
  transactionDate.innerText = transaction.date;
  transactionDate.setAttribute("data-testid", "transactionItemDate");
  transactionDate.classList.add("tracker-transaction-item_date");
  transactionDetailItemContainer.append(transactionDate);

  // type transaction -> hidden
  const transactionItemType = document.createElement("p");
  transactionItemType.style.display = "none";
  transactionItemType.setAttribute("data-testid", "transactionItemType");
  transactionDetailItemContainer.append(transactionItemType);

  // transaction right item container : amount, actionContainer
  const transactionItemRightContainer = document.createElement("div");
  transactionItemRightContainer.classList.add(
    "tracker-transaction-item__right",
  );

  // transaction right item container : amount
  const transactionItemAmount = document.createElement("div");
  transactionItemAmount.innerText = transaction.amount;
  transactionItemAmount.setAttribute("data-testid", "transactionItemAmount");
  transactionItemAmount.classList.add("tracker-transaction-item__amount");
  transactionItemRightContainer.append(transactionItemAmount);

  // transaction right item container : actionContainer : changeTypeButton, editButton, deleteButton
  const transacionActionContainer = document.createElement("div");
  transacionActionContainer.classList.add("tracker-transaction-item__action");
  transactionItemRightContainer.append(transacionActionContainer);

  // transaction right item container : changeTypeButton
  const changeTypeButton = document.createElement("button");
  changeTypeButton.setAttribute("data-testid", "transactionItemEditTypeButton");
  changeTypeButton.innerText = "Ubah";
  changeTypeButton.classList.add("tracker-transaction-item__btn");
  transacionActionContainer.append(changeTypeButton);

  changeTypeButton.addEventListener("click", function () {
    if (transaction.type === "income") {
      transaction.type = "expense";
    } else if (transaction.type === "expense") {
      transaction.type = "income";
    }
    saveData();
    // document.dispatchEvent(new Event(RENDER_EVENT));
  });

  // transaction right item container : editButton
  const editButton = document.createElement("button");
  editButton.addEventListener("click", function () {
    const submitForm = document.getElementById("transactionForm");
    const submitButton = document.querySelector("button.tracker-form__submit");
    submitButton.innerText = "Update";
    const transactionFormTitleInput = document.getElementById(
      "transactionFormTitleInput",
    );
    transactionFormTitleInput.value = transaction.title;

    const transactionFormItemAmount = document.getElementById(
      "transactionFormAmountInput",
    );
    transactionFormItemAmount.value = transaction.amount;

    const transactionFormDateInput = document.getElementById(
      "transactionFormDateInput",
    );
    transactionFormDateInput.value = transaction.date;

    const transactionFormTypeSelect = document.getElementById(
      "transactionFormTypeSelect",
    );
    transactionFormTypeSelect.value = transaction.type;
    submitForm.dataset.editingId = transaction.id;
  });

  editButton.setAttribute("data-testid", "transactionItemEditButton");
  editButton.innerText = "Edit";
  editButton.classList.add("tracker-transaction-item__btn");
  transacionActionContainer.append(editButton);

  // transaction right item container : deleteButton
  const deleteButton = document.createElement("button");
  deleteButton.addEventListener("click", function () {
    if (transaction.id !== -1) {
      transactions = transactions.filter((item) => item.id !== transaction.id);
    }
    saveData();
    // document.dispatchEvent(new Event(RENDER_EVENT));
  });
  deleteButton.setAttribute("data-testid", "transactionItemDeleteButton");
  deleteButton.innerText = "Del";
  deleteButton.classList.add("tracker-transaction-item__btn");
  transacionActionContainer.append(deleteButton);

  // tracker transaction item container
  const transactionItemContainer = document.createElement("div");
  transactionItemContainer.setAttribute("data-testid", "transactionItem");
  transactionItemContainer.setAttribute("data-transactionid", transaction.id);
  transactionItemContainer.classList.add("tracker-transaction-item");
  transactionItemContainer.append(
    transactionItemIconContainer,
    transactionDetailItemContainer,
    transactionItemRightContainer,
  );

  if (transaction.type === "income") {
    transactionItemIconContainer.innerText = "+";
    transactionItemIconContainer.classList.add(
      "tracker-transaction-item__icon--income",
    );
    transactionItemType.innerText = "Pemasukan";
    transactionItemAmount.classList.add(
      "tracker-transaction-item__amount--income",
    );
  } else if (transaction.type === "expense") {
    transactionItemIconContainer.innerText = "-";
    transactionItemIconContainer.classList.add(
      "tracker-transaction-item__icon--expense",
    );
    transactionItemType.innerText = "Pengeluaran";
    transactionItemAmount.classList.add(
      "tracker-transaction-item__amount--expense",
    );
  }
  return transactionItemContainer;
}

function generateID() {
  return +new Date();
}
const incomeList = document.getElementById("incomeList");
const expenseList = document.getElementById("expenseList");

const submitButton = document.querySelector("button.tracker-form__submit");
const transactionForm = document.getElementById("transactionForm");

transactionForm.addEventListener("submit", function (e) {
  e.preventDefault();
  if (submitButton.textContent.trim() === "Simpan") {
    addTransaction();
  } else if (submitButton.textContent.trim() === "Update") {
    const idTransaction = Number(transactionForm.dataset.editingId);
    editTransaction(idTransaction);
  }
});

function addTransaction() {
  const transactionFormTitleInput = document.getElementById(
    "transactionFormTitleInput",
  );
  const transactionFormItemAmount = document.getElementById(
    "transactionFormAmountInput",
  );
  const transactionFormDateInput = document.getElementById(
    "transactionFormDateInput",
  );
  const transactionFormTypeSelect = document.getElementById(
    "transactionFormTypeSelect",
  );

  if (transactionFormTitleInput.value === "") {
    alert("Silahkan isi keterangan terlebih dahulu!");
    return;
  } else if (transactionFormItemAmount.value < 1) {
    alert("Nominal tidak boleh kurang dari 1");
    return;
  }

  //generate id
  const id = generateID();

  // call createTransactionObject() function
  const transactionObject = createTransactionObject(
    id,
    transactionFormTitleInput.value,
    Number(transactionFormItemAmount.value),
    transactionFormDateInput.value,
    transactionFormTypeSelect.value,
  );

  transactions.push(transactionObject);
  // document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();

  transactionFormTitleInput.value = "";
  transactionFormItemAmount.value = "";
  transactionFormDateInput.value = "";
  transactionFormTypeSelect.value = "income";
}

function editTransaction(id) {
  // find data transaction
  const transaction = transactions.find((transaction) => transaction.id === id);

  const transactionFormTitleInput = document.getElementById(
    "transactionFormTitleInput",
  );

  const transactionFormItemAmount = document.getElementById(
    "transactionFormAmountInput",
  );

  const transactionFormDateInput = document.getElementById(
    "transactionFormDateInput",
  );

  const transactionFormTypeSelect = document.getElementById(
    "transactionFormTypeSelect",
  );

  transaction.title = transactionFormTitleInput.value;
  transaction.amount = Number(transactionFormItemAmount.value);
  transaction.date = transactionFormDateInput.value;
  transaction.type = transactionFormTypeSelect.value;
  submitButton.innerText = "Simpan";

  transactionFormTitleInput.value = "";
  transactionFormItemAmount.value = "";
  transactionFormDateInput.value = "";
  transactionFormTypeSelect.value = "income";

  searchInput.value = "";

  saveData();
  // document.dispatchEvent(new Event(RENDER_EVENT));
}

function createTransactionObject(id, title, amount, date, type) {
  return {
    id,
    title,
    amount,
    date,
    type,
  };
}

// LOCAL STORAGE LOGIC

const SAVED_EVENT = "saved-transaction";
const STORAGE_KEY = "EXPENSE-TRACKER";

function isStorageExist() {
  if (typeof Storage !== undefined) {
    return true;
  }
  return false;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(transactions);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

document.addEventListener(SAVED_EVENT, function () {
  loadDataFromStorage();
  // alert("Operasi berhasil dlakukan!");
});

function loadDataFromStorage() {
  transactions = [];
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  data.forEach((item) => {
    transactions.push(item);
  });
  document.dispatchEvent(new Event(RENDER_EVENT));
}

if (isStorageExist()) {
  loadDataFromStorage();
}

/**
 * ========================================================
 * Expense Tracker App — main.js
 * ========================================================
 * Tulis seluruh kode JavaScript kamu di sini.
 */

// TODO [Basic] Buat variabel array untuk menyimpan semua data transaksi, contoh: let transactions = []
// TODO [Basic] Buat fungsi untuk menghasilkan ID unik secara otomatis, contoh: gunakan +new Date()
/**
 * ========================================================
 * Kriteria 1: Memanipulasi DOM untuk Form dan Daftar Transaksi
 * ========================================================
 */
// TODO [Basic] Ambil elemen kontainer incomeList dan expenseList dari DOM

/**
 * TODO [Basic]:
 * Buat fungsi untuk menampilkan (render) semua transaksi ke layar:
 *  - Kosongkan kontainer terlebih dahulu sebelum mengisi ulang
 *  - Gunakan perulangan, buat setiap elemen kartu dengan document.createElement()
 *  - Pastikan setiap elemen memiliki atribut data-testid yang sesuai (lihat panduan di rubrik)
 *  - Masukkan kartu ke kontainer yang tepat: income → incomeList, expense → expenseList
 */

// TODO [Basic] Tambahkan event listener 'submit' pada form, panggil e.preventDefault() di dalamnya
// TODO [Basic] Di dalam handler submit, ambil nilai input lalu tambahkan sebagai objek transaksi baru ke array
/**
 * TODO [Skilled]:
 * Tambahkan validasi input sebelum menyimpan data:
 *  - Tampilkan alert() dan hentikan proses jika judul kosong
 *  - Tampilkan alert() dan hentikan proses jika nominal kurang dari 1
 */

/**
 * TODO [Advanced]:
 * Setiap kali data transaksi berubah, perbarui Panel Dasbor:
 *  - Hitung total pemasukan, total pengeluaran, dan saldo (pemasukan - pengeluaran)
 *  - Tampilkan hasilnya ke elemen yang sesuai di HTML
 */

/**
 * ========================================================
 * Kriteria 2: Mengelola Penyimpanan Data (Web Storage API)
 * ========================================================
 */
/**
 * TODO [Basic]:
 * Data transaksi disimpan ke localStorage menggunakan JSON.stringify(), dan dimuat kembali saat halaman dibuka menggunakan JSON.parse().
 *  - Tombol "Hapus" berfungsi: transaksi yang dihapus langsung hilang dari layar dan dari localStorage.
 */

/**
 * TODO [Skilled]:
 * Tombol "Edit" berfungsi: saat ditekan, formulir (#transactionForm) secara otomatis terisi dengan data transaksi yang dipilih.
 *  - Pengguna dapat mengubah data lalu menyimpan perubahan.
 *  - Formulir kembali ke mode "Tambah" setelah pembaruan selesai.
 */

/**
 * TODO [Advanced]:
 * Gunakan Custom Event sebagai penghubung antara perubahan data dan pembaruan tampilan:
 *  - Kirim sinyal dengan document.dispatchEvent(new Event('transaction:updated')) setiap kali data berubah
 *  - Pasang satu listener untuk event tersebut yang memanggil fungsi render dan update dasbor
 */

/**
 * ========================================================
 * Kriteria 3: Fitur Interaktif (Pindah Kategori dan Pencarian)
 * ========================================================
 */
/**
 * TODO [Basic]:
 * Tambahkan tombol "Ubah Tipe" pada setiap kartu transaksi:
 *  - Saat diklik, ubah tipe transaksi: 'income' → 'expense' atau 'expense' → 'income'
 *  - Simpan perubahan ke localStorage dan perbarui tampilan
 */

/**
 * TODO [Skilled]:
 * Tambahkan event listener 'input' pada kolom pencarian:
 *  - Filter array transaksi berdasarkan kecocokan kata kunci dengan judul transaksi
 *  - Tampilkan hanya transaksi yang judulnya mengandung kata kunci tersebut
 */

/**
 * TODO [Advanced]:
 * Pastikan fitur pencarian berjalan dengan baik di semua kondisi:
 *  - Saat kolom pencarian dikosongkan, tampilkan kembali seluruh daftar transaksi
 */
