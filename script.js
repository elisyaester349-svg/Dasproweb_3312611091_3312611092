// Data Utuh Transaksi untuk Simulasi Laporan & Filter
let transactions = [
    { id: 1, date: '2024-10-08', displayDate: '08/10/2024', type: 'Pengeluaran', category: 'Makan & Minum', amount: 300000, desc: 'Makan harian' },
    { id: 2, date: '2024-10-07', displayDate: '07/10/2024', type: 'Pengeluaran', category: 'Transportasi', amount: 200000, desc: 'Ongkos bus & bensin' },
    { id: 3, date: '2024-10-06', displayDate: '06/10/2024', type: 'Pemasukan', category: 'Beasiswa', amount: 1000000, desc: 'Beasiswa Bulan Ini' },
    { id: 4, date: '2024-10-04', displayDate: '04/10/2024', type: 'Pengeluaran', category: 'Pendidikan', amount: 150000, desc: 'Beli buku kuliah' },
    { id: 5, date: '2024-10-02', displayDate: '02/10/2024', type: 'Pemasukan', category: 'Lainnya', amount: 500000, desc: 'Kiriman Orang Tua' },
    { id: 6, date: '2024-10-01', displayDate: '01/10/2024', type: 'Pengeluaran', category: 'Hiburan', amount: 100000, desc: 'Nonton bioskop' }
];

// Variabel Penyimpan Instance Chart Laporan
let laporanChartInstance = null;
let dashboardChartInstance = null;

// Inisialisasi Aplikasi Saat Halaman Di-load
document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();
    renderTransactions();
});

// Fungsi Navigasi antar Tab Dashboard
function switchTab(tabId) {
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(el => el.classList.add('hidden'));

    const selectedTab = document.getElementById(`view-${tabId}`);
    if (selectedTab) {
        selectedTab.classList.remove('hidden');
    }

    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('text-blue-600', 'bg-blue-50');
        item.classList.add('text-slate-600', 'hover:bg-slate-100');
    });

    const activeNav = document.getElementById(`nav-${tabId}`);
    if (activeNav) {
        activeNav.classList.remove('text-slate-600', 'hover:bg-slate-100');
        activeNav.classList.add('text-blue-600', 'bg-blue-50');
    }

    // Jika masuk ke tab laporan, langsung jalankan filter otomatis
    if (tabId === 'laporan') {
        applyReportFilter();
    }
}

// Navigasi Autentikasi
function switchAuthPage(page) {
    const regPage = document.getElementById('page-register');
    const logPage = document.getElementById('page-login');

    if (page === 'register') {
        regPage.classList.remove('hidden');
        logPage.classList.add('hidden');
    } else {
        regPage.classList.add('hidden');
        logPage.classList.remove('hidden');
    }
}

function handleLogin(event) {
    event.preventDefault();
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    setTimeout(() => {
        lucide.createIcons();
        initDashboardChart();
        applyReportFilter();
    }, 100);
}

function handleRegister(event) {
    event.preventDefault();
    alert('Registrasi berhasil! Silakan login.');
    switchAuthPage('login');
}

function logout() {
    document.getElementById('main-app').classList.add('hidden');
    document.getElementById('auth-container').classList.remove('hidden');
    switchAuthPage('login');
}

function toggleModal(modalId, show) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.toggle('hidden', !show);
    }
}

function handleFormSubmit(event) {
    event.preventDefault();
    alert('Data berhasil disimpan!');
    document.querySelectorAll('.fixed.inset-0').forEach(m => m.classList.add('hidden'));
    event.target.reset();
}

// -------------------------------------------------------------
// FITUR UTAMA: FILTER LAPORAN KEUANGAN
// -------------------------------------------------------------
function applyReportFilter() {
    const startDate = document.getElementById('filter-start-date')?.value;
    const endDate = document.getElementById('filter-end-date')?.value;
    const jenisFilter = document.getElementById('filter-jenis')?.value || 'Semua';
    const kategoriFilter = document.getElementById('filter-kategori')?.value || 'Semua';

    // 1. Proses Penyaringan Data
    const dataDisaring = transactions.filter(item => {
        // Filter Berdasarkan Jenis (Semua / Pemasukan / Pengeluaran)
        const cocokJenis = (jenisFilter === 'Semua' || item.type === jenisFilter);
        
        // Filter Berdasarkan Kategori
        const cocokKategori = (kategoriFilter === 'Semua' || item.category === kategoriFilter);

        // Filter Berdasarkan Tanggal (opsional jika tanggal diisi)
        let cocokTanggal = true;
        if (startDate && endDate) {
            cocokTanggal = (item.date >= startDate && item.date <= endDate);
        }

        return cocokJenis && cocokKategori && cocokTanggal;
    });

    // 2. Hitung Ulang Ringkasan Nominal
    let totalPemasukan = 0;
    let totalPengeluaran = 0;

    dataDisaring.forEach(item => {
        if (item.type === 'Pemasukan') {
            totalPemasukan += item.amount;
        } else if (item.type === 'Pengeluaran') {
            totalPengeluaran += item.amount;
        }
    });

    const saldoBersih = totalPemasukan - totalPengeluaran;

    // 3. Update Angka Ringkasan Kartu Stats
    const elemPemasukan = document.getElementById('report-total-pemasukan');
    const elemPengeluaran = document.getElementById('report-total-pengeluaran');
    const elemSaldo = document.getElementById('report-saldo-bersih');

    if (elemPemasukan) elemPemasukan.innerText = `Rp ${totalPemasukan.toLocaleString('id-ID')}`;
    if (elemPengeluaran) elemPengeluaran.innerText = `Rp ${totalPengeluaran.toLocaleString('id-ID')}`;
    if (elemSaldo) elemSaldo.innerText = `Rp ${saldoBersih.toLocaleString('id-ID')}`;

    // 4. Update Teks Rekap Data Tersaring
    const rekapContainer = document.getElementById('rekap-container');
    if (rekapContainer) {
        rekapContainer.innerHTML = '';
        if (dataDisaring.length === 0) {
            rekapContainer.innerHTML = `<p class="text-slate-400 italic text-center py-4">Tidak ada data transaksi yang cocok dengan filter.</p>`;
        } else {
            dataDisaring.forEach(item => {
                const isPemasukan = item.type === 'Pemasukan';
                rekapContainer.innerHTML += `
                    <div class="flex justify-between py-2 border-b border-slate-100 text-xs">
                        <div>
                            <span class="font-semibold text-slate-800 block">${item.category}</span>
                            <span class="text-slate-400 text-[11px]">${item.displayDate} - ${item.desc}</span>
                        </div>
                        <span class="font-bold ${isPemasukan ? 'text-emerald-600' : 'text-rose-600'}">
                            ${isPemasukan ? '+' : '-'} Rp ${item.amount.toLocaleString('id-ID')}
                        </span>
                    </div>
                `;
            });
        }
    }

    // 5. Update Grafik Pie/Doughnut
    renderReportChart(dataDisaring);
}

// Render Ulang Chart Grafik Laporan (Doughnut Chart)
function renderReportChart(dataArr) {
    const ctxPie = document.getElementById('chartLaporanPie');
    if (!ctxPie) return;

    // Kelompokkan data per Kategori untuk Grafik
    const rekap = {};
    dataArr.forEach(item => {
        rekap[item.category] = (rekap[item.category] || 0) + item.amount;
    });

    const labels = Object.keys(rekap);
    const values = Object.values(rekap);

    // Hapus Chart lama sebelum menggambar Chart baru agar tidak menumpuk
    if (laporanChartInstance) {
        laporanChartInstance.destroy();
    }

    // Jika data kosong, tampilkan placeholder
    if (labels.length === 0) {
        labels.push('Tidak ada data');
        values.push(1);
    }

    laporanChartInstance = new Chart(ctxPie, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: ['#3b82f6', '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

// Inisialisasi Grafik Dashboard
function initDashboardChart() {
    const ctxDash = document.getElementById('chartDashboard7Hari');
    if (!ctxDash) return;

    if (dashboardChartInstance) {
        dashboardChartInstance.destroy();
    }

    dashboardChartInstance = new Chart(ctxDash, {
        type: 'bar',
        data: {
            labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
            datasets: [{
                data: [45000, 30000, 60000, 25000, 40000, 85000, 50000],
                backgroundColor: '#3b82f6',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { display: false } },
                x: { grid: { display: false } }
            }
        }
    });
}

// Render Tabel Transaksi Tambah Data
function renderTransactions() {
    const tbody = document.getElementById('transaction-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    transactions.forEach((tx, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="py-3 px-3">${index + 1}</td>
            <td class="py-3 px-3 text-xs">${tx.displayDate}</td>
            <td class="py-3 px-3"><span class="px-2 py-0.5 text-[10px] font-semibold ${tx.type === 'Pemasukan' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'} rounded-full">${tx.type}</span></td>
            <td class="py-3 px-3 font-semibold text-slate-800">${tx.category}</td>
            <td class="py-3 px-3 text-right font-semibold ${tx.type === 'Pemasukan' ? 'text-emerald-600' : 'text-rose-600'}">Rp ${tx.amount.toLocaleString('id-ID')}</td>
            <td class="py-3 px-3 text-xs text-slate-500">${tx.desc}</td>
        `;
        tbody.appendChild(row);
    });
}