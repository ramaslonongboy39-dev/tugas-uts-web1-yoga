
document.addEventListener("DOMContentLoaded", function () {

    // FORMAT RUPIAH
    function rupiah(value) {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }).format(value);
    }

    // DATA BUKU
    let bookData = JSON.parse(localStorage.getItem("bookData"));

    if (!bookData) {
        bookData = books;
        localStorage.setItem("bookData", JSON.stringify(bookData));
    }

    function saveBooks() {
        localStorage.setItem("bookData", JSON.stringify(bookData));
    }

    // DATA PESANAN
    function getOrders() {
        return JSON.parse(localStorage.getItem("orders")) || [];
    }

    function saveOrders(data) {
        localStorage.setItem("orders", JSON.stringify(data));
    }

    // LOGIN
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;

            const user = users.find(function (item) {
                return item.email === email &&
                       item.password === password;
            });

            if (user) {
                sessionStorage.setItem("userId", user.id);
                sessionStorage.setItem("userName", user.name);
                sessionStorage.setItem("userEmail", user.email);
                sessionStorage.setItem("userRole", user.role);
                sessionStorage.setItem("userNim", user.nim);

                window.location.href = "dashboard.html";
            } else {
                alert("Email atau password salah!");
            }
        });
    }

    // TAMPILKAN INFO ADMIN
    const showAdmin = document.getElementById("showAdmin");
    const adminInfo = document.getElementById("adminInfo");

    if (showAdmin && adminInfo) {
        showAdmin.addEventListener("click", function () {
            adminInfo.classList.toggle("hidden");
        });
    }

    // LOGOUT
    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            sessionStorage.clear();
            window.location.href = "index.html";
        });
    }

    // DASHBOARD
    const greeting = document.getElementById("greeting");
    const userRole = document.getElementById("userRole");

    if (greeting) {
        const name = sessionStorage.getItem("userName") || "Pengunjung";
        greeting.textContent = "Selamat Datang, " + name + "!";
    }

    if (userRole) {
        userRole.textContent =
            sessionStorage.getItem("userRole") || "Customer";
    }

    // KARTU BUKU
    function createBookCard(book) {
        return `
            <article class="book-card">
                <div class="book-cover-wrap">
                    <span class="book-tag">${book.category}</span>

                    <img src="${book.image}"
                         alt="${book.name}"
                         onerror="this.onerror=null;this.src='img/kepemimpinan.jpg';">
                </div>

                <div class="book-info">
                    <span class="book-category">${book.category}</span>

                    <h3>${book.name}</h3>

                    <p class="muted">Kode: ${book.code}</p>

                    <p class="book-price">${rupiah(book.price)}</p>

                    <p class="book-stock">
                        Stok: ${book.stock}
                    </p>

                    <a href="checkout.html?book=${book.code}"
                       class="btn btn-primary btn-full">
                        Pesan Buku
                    </a>
                </div>
            </article>
        `;
    }

    // BUKU PILIHAN
    const featuredBooks = document.getElementById("featuredBooks");

    if (featuredBooks) {
        featuredBooks.innerHTML = bookData
            .slice(0, 3)
            .map(createBookCard)
            .join("");
    }

    // KATALOG
    const bookList = document.getElementById("bookList");
    const searchBook = document.getElementById("searchBook");
    const bookCount = document.getElementById("bookCount");

    function renderBooks(keyword = "") {
        if (!bookList) return;

        const filtered = bookData.filter(function (book) {
            return book.name.toLowerCase().includes(keyword.toLowerCase()) ||
                   book.category.toLowerCase().includes(keyword.toLowerCase()) ||
                   book.code.toLowerCase().includes(keyword.toLowerCase());
        });

        bookList.innerHTML = filtered.length
            ? filtered.map(createBookCard).join("")
            : "<p>Buku tidak ditemukan.</p>";

        if (bookCount) {
            bookCount.textContent = filtered.length + " buku ditemukan.";
        }
    }

    if (bookList) {
        renderBooks();

        if (searchBook) {
            searchBook.addEventListener("input", function () {
                renderBooks(searchBook.value);
            });
        }
    }

    // FORM TAMBAH BUKU
    const showBookForm = document.getElementById("showBookForm");
    const bookFormPanel = document.getElementById("bookFormPanel");
    const cancelBookForm = document.getElementById("cancelBookForm");
    const bookForm = document.getElementById("bookForm");

    if (showBookForm && bookFormPanel) {
        showBookForm.addEventListener("click", function () {
            bookFormPanel.classList.toggle("hidden");
        });
    }

    if (cancelBookForm && bookFormPanel) {
        cancelBookForm.addEventListener("click", function () {
            bookFormPanel.classList.add("hidden");
        });
    }

    if (bookForm) {
        bookForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const code = document.getElementById("bookCode").value.trim();
            const name = document.getElementById("bookName").value.trim();
            const category = document.getElementById("bookCategory").value.trim();
            const price = Number(document.getElementById("bookPrice").value);
            const stock = Number(document.getElementById("bookStock").value);
            const image = document.getElementById("bookImage").value.trim();

            if (bookData.some(book => book.code === code)) {
                alert("Kode buku sudah digunakan!");
                return;
            }

            bookData.push({
                code,
                name,
                category,
                price,
                stock,
                image
            });

            saveBooks();
            renderStockTable();
            renderBooks();

            bookForm.reset();
            bookFormPanel.classList.add("hidden");

            alert("Buku berhasil ditambahkan!");
        });
    }

    // TABEL STOK
    const stockTable = document.getElementById("stockTable");

    function renderStockTable() {
        if (!stockTable) return;

        stockTable.innerHTML = bookData.map(function (book, index) {
            return `
                <tr>
                    <td>
                        <img class="table-cover"
                             src="${book.image}"
                             alt="${book.name}"
                             onerror="this.onerror=null;this.src='img/kepemimpinan.jpg';">
                    </td>

                    <td>${book.code}</td>
                    <td>${book.name}</td>
                    <td>${book.category}</td>
                    <td>${rupiah(book.price)}</td>
                    <td>${book.stock}</td>

                    <td>
                        <button class="btn btn-danger btn-small"
                                onclick="deleteBook(${index})">
                            Hapus
                        </button>
                    </td>
                </tr>
            `;
        }).join("");
    }

    renderStockTable();

    window.deleteBook = function (index) {
        if (confirm("Hapus buku ini?")) {
            bookData.splice(index, 1);
            saveBooks();
            renderStockTable();
            renderBooks();
        }
    };

    // CHECKOUT
    const checkoutForm = document.getElementById("checkoutForm");
    const checkoutBook = document.getElementById("checkoutBook");
    const checkoutQty = document.getElementById("checkoutQty");
    const shippingMethod = document.getElementById("shippingMethod");
    const checkoutTotal = document.getElementById("checkoutTotal");

    function fillBookOptions() {
        if (!checkoutBook) return;

        checkoutBook.innerHTML = `
            <option value="">Pilih buku</option>
            ${bookData.map(book => `
                <option value="${book.code}">
                    ${book.name} - ${rupiah(book.price)}
                </option>
            `).join("")}
        `;

        const params = new URLSearchParams(window.location.search);
        const code = params.get("book");

        if (code) checkoutBook.value = code;
    }

    function calculateTotal() {
        if (!checkoutBook || !checkoutQty || !checkoutTotal) return;

        const book = bookData.find(item => item.code === checkoutBook.value);
        const quantity = Number(checkoutQty.value) || 1;

        const shipping = shippingMethod &&
            shippingMethod.value === "Express" ? 25000 : 15000;

        const total = book ? book.price * quantity + shipping : 0;

        checkoutTotal.textContent = rupiah(total);
    }

    fillBookOptions();
    calculateTotal();

    if (checkoutBook) {
        checkoutBook.addEventListener("change", calculateTotal);
    }

    if (checkoutQty) {
        checkoutQty.addEventListener("input", calculateTotal);
    }

    if (shippingMethod) {
        shippingMethod.addEventListener("change", calculateTotal);
    }

    // SIMPAN PESANAN
    if (checkoutForm) {
        checkoutForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const name = document.getElementById("customerName").value.trim();
            const email = document.getElementById("customerEmail").value.trim();
            const phone = document.getElementById("customerPhone").value.trim();
            const address = document.getElementById("customerAddress").value.trim();
            const code = checkoutBook.value;
            const quantity = Number(checkoutQty.value);
            const payment = document.getElementById("paymentMethod").value;
            const shipping = shippingMethod.value;

            const book = bookData.find(item => item.code === code);

            if (!book) {
                alert("Pilih buku terlebih dahulu!");
                return;
            }

            if (quantity < 1 || quantity > book.stock) {
                alert("Jumlah melebihi stok buku!");
                return;
            }

            const shippingCost = shipping === "Express" ? 25000 : 15000;
            const total = book.price * quantity + shippingCost;

            const orders = getOrders();

            const doNumber = "DO" + Date.now().toString().slice(-8);

            orders.push({
                doNumber,
                userId: sessionStorage.getItem("userId"),
                nim: sessionStorage.getItem("userNim"),
                name,
                email,
                phone,
                address,
                bookCode: book.code,
                bookName: book.name,
                quantity,
                payment,
                shipping,
                total,
                status: "Pesanan Diterima",
                date: new Date().toLocaleDateString("id-ID")
            });

            saveOrders(orders);

            book.stock -= quantity;
            saveBooks();

            renderStockTable();
            renderBooks();
            renderOrderTable();

            alert("Pesanan berhasil dibuat!\nNomor DO: " + doNumber);

            checkoutForm.reset();
            fillBookOptions();
            calculateTotal();
        });
    }

    // RIWAYAT PESANAN
    const orderTable = document.getElementById("orderTable");

    function renderOrderTable() {
        if (!orderTable) return;

        const orders = getOrders();

        if (orders.length === 0) {
            orderTable.innerHTML = `
                <tr>
                    <td colspan="6">Belum ada pesanan.</td>
                </tr>
            `;
            return;
        }

        orderTable.innerHTML = orders.map(function (order) {
            return `
                <tr>
                    <td>${order.doNumber}</td>
                    <td>${order.name}</td>
                    <td>${order.bookName}</td>
                    <td>${order.quantity}</td>
                    <td>${rupiah(order.total)}</td>
                    <td><span class="status">${order.status}</span></td>
                </tr>
            `;
        }).join("");
    }

    renderOrderTable();

    // TRACKING
    const trackingForm = document.getElementById("trackingForm");
    const trackingResult = document.getElementById("trackingResult");

    if (trackingForm && trackingResult) {
        trackingForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const number = document.getElementById("doNumber").value.trim();

            const orders = getOrders();

            const order = orders.find(function (item) {
                return item.doNumber === number ||
                       item.nim === number;
            });

            if (!order) {
                trackingResult.innerHTML = `
                    <div class="tracking-summary">
                        <h3>Pesanan Tidak Ditemukan</h3>
                        <p>Nomor DO atau NIM tidak ditemukan.</p>
                    </div>
                `;
                return;
            }

            trackingResult.innerHTML = `
                <div class="tracking-summary">
                    <h3>Informasi Pengiriman</h3>

                    <p><strong>Nomor DO:</strong> ${order.doNumber}</p>
                    <p><strong>NIM:</strong> ${order.nim || "-"}</p>
                    <p><strong>Nama:</strong> ${order.name}</p>
                    <p><strong>Buku:</strong> ${order.bookName}</p>
                    <p><strong>Jumlah:</strong> ${order.quantity}</p>
                    <p><strong>Total:</strong> ${rupiah(order.total)}</p>
                    <p><strong>Status:</strong> ${order.status}</p>

                    <div class="progress">
                        <div class="progress-bar" style="width:35%"></div>
                    </div>

                    <ul class="timeline">
                        <li>
                            <strong>Pesanan Diterima</strong>
                            <p>Pesanan berhasil dibuat.</p>
                        </li>
                        <li>
                            <strong>Menunggu Proses</strong>
                            <p>Pesanan akan diproses oleh BookHaven.</p>
                        </li>
                    </ul>
                </div>
            `;
        });
    }

});
