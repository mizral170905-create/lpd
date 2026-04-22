// ============ Global Variables ============
let pengajuanData = [];
let currentStep = 1;
let uploadedFiles = [];

// ============ Initialize ============
document.addEventListener('DOMContentLoaded', function() {
    loadPengajuanFromStorage();
    loadUserName();
    setupNavigation();
    setupFormHandlers();
    setupFilters();
    setupStatusPage();
    setupContactPage();
    updateStatistics();
    setupFAQ();
    
    // Check URL params for formulir.html
    const urlParams = new URLSearchParams(window.location.search);
    const jenisSurat = urlParams.get('jenis');
    if (jenisSurat && document.getElementById('jenisSurat')) {
        document.getElementById('jenisSurat').value = jenisSurat;
    }
});

// ============ LocalStorage Functions ============
function loadPengajuanFromStorage() {
    const stored = localStorage.getItem('pengajuanDesa');
    if (stored) {
        pengajuanData = JSON.parse(stored);
    } else {
        // Sample data for demo
        pengajuanData = [
            {
                id: '1',
                nomorPengajuan: 'PD-20241201-0001',
                tanggal: '2024-12-01',
                jenisSurat: 'KTP',
                status: 'Diproses',
                dataDiri: {
                    nik: '3273000000000001',
                    nama: 'Budi Santoso',
                    tempatLahir: 'Jakarta',
                    tanggalLahir: '1990-05-15',
                    jenisKelamin: 'Laki-laki',
                    rtRw: '001/002',
                    alamat: 'Jl. Desa No. 1',
                    noHp: '081234567890',
                    email: 'budi@email.com'
                }
            },
            {
                id: '2',
                nomorPengajuan: 'PD-20241202-0002',
                tanggal: '2024-12-02',
                jenisSurat: 'KK',
                status: 'Selesai',
                dataDiri: {
                    nik: '3273000000000002',
                    nama: 'Siti Aisyah',
                    tempatLahir: 'Bandung',
                    tanggalLahir: '1985-03-20',
                    jenisKelamin: 'Perempuan',
                    rtRw: '002/003',
                    alamat: 'Jl. Desa No. 2',
                    noHp: '081234567891',
                    email: 'siti@email.com'
                }
            }
        ];
        savePengajuanToStorage();
    }
}

function savePengajuanToStorage() {
    localStorage.setItem('pengajuanDesa', JSON.stringify(pengajuanData));
}

function generateNomorPengajuan() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `PD-${yyyy}${mm}${dd}-${random}`;
}

// ============ User Name Functions ============
function loadUserName() {
    const userName = localStorage.getItem('userNameDesa');
    if (userName) {
        document.querySelectorAll('#userNameDisplay').forEach(el => {
            el.textContent = userName;
        });
    }
}

function showUserNameModal() {
    const modal = document.getElementById('userNameModal');
    const input = document.getElementById('userNameInput');
    const savedName = localStorage.getItem('userNameDesa');
    if (savedName) input.value = savedName;
    modal.style.display = 'flex';
    
    document.querySelector('#userNameModal .modal-close').onclick = () => {
        modal.style.display = 'none';
    };
    
    document.getElementById('saveUserNameBtn').onclick = () => {
        const name = input.value.trim();
        if (name) {
            localStorage.setItem('userNameDesa', name);
            document.querySelectorAll('#userNameDisplay').forEach(el => {
                el.textContent = name;
            });
            modal.style.display = 'none';
            showToast('Nama berhasil disimpan', 'success');
        } else {
            showToast('Nama tidak boleh kosong', 'error');
        }
    };
}

// ============ Navigation ============
function setupNavigation() {
    // Mobile menu toggle
    const toggleBtn = document.getElementById('mobileMenuToggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            document.getElementById('navMenu').classList.toggle('show');
        });
    }
    
    // User name edit
    const editBtn = document.getElementById('editUserNameBtn');
    if (editBtn) {
        editBtn.addEventListener('click', showUserNameModal);
    }
    
    // Set active nav based on current page
    const currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('.nav-menu a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// ============ Form Handlers ============
function setupFormHandlers() {
    if (!document.getElementById('pengajuanForm')) return;
    
    // Step navigation
    document.querySelectorAll('.next-step').forEach(btn => {
        btn.addEventListener('click', () => {
            if (validateCurrentStep()) {
                goToStep(currentStep + 1);
            }
        });
    });
    
    document.querySelectorAll('.prev-step').forEach(btn => {
        btn.addEventListener('click', () => {
            goToStep(currentStep - 1);
        });
    });
    
    // Upload file handling
    const uploadArea = document.getElementById('uploadArea');
    const uploadBtn = document.getElementById('uploadBtn');
    const fileInput = document.getElementById('fileUpload');
    
    if (uploadArea) {
        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#ffd700';
        });
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = '#1a5c4a';
        });
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
        });
    }
    
    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => fileInput.click());
    }
    
    if (fileInput) {
        fileInput.addEventListener('change', (e) => handleFiles(e.target.files));
    }
    
    // Form submit
    document.getElementById('pengajuanForm').addEventListener('submit', submitPengajuan);
    
    // Save draft
    document.getElementById('saveDraftBtn')?.addEventListener('click', saveDraft);
    
    // Real-time validation
    setupRealTimeValidation();
}

function validateCurrentStep() {
    if (currentStep === 1) {
        const jenisSurat = document.getElementById('jenisSurat').value;
        if (!jenisSurat) {
            showError('errorJenisSurat', 'Pilih jenis surat terlebih dahulu');
            return false;
        }
        return true;
    }
    
    if (currentStep === 2) {
        let isValid = true;
        
        const nik = document.getElementById('nik').value;
        if (!nik || !/^\d{16}$/.test(nik)) {
            showError('errorNik', 'NIK harus 16 digit angka');
            isValid = false;
        } else clearError('errorNik');
        
        const nama = document.getElementById('namaLengkap').value;
        if (!nama.trim()) {
            showError('errorNama', 'Nama lengkap wajib diisi');
            isValid = false;
        } else clearError('errorNama');
        
        const tempatLahir = document.getElementById('tempatLahir').value;
        if (!tempatLahir.trim()) {
            showError('errorTempatLahir', 'Tempat lahir wajib diisi');
            isValid = false;
        } else clearError('errorTempatLahir');
        
        const tanggalLahir = document.getElementById('tanggalLahir').value;
        if (!tanggalLahir) {
            showError('errorTanggalLahir', 'Tanggal lahir wajib diisi');
            isValid = false;
        } else clearError('errorTanggalLahir');
        
        const jenisKelamin = document.getElementById('jenisKelamin').value;
        if (!jenisKelamin) {
            showError('errorJenisKelamin', 'Pilih jenis kelamin');
            isValid = false;
        } else clearError('errorJenisKelamin');
        
        const rtRw = document.getElementById('rtRw').value;
        if (!rtRw.trim()) {
            showError('errorRtRw', 'RT/RW wajib diisi');
            isValid = false;
        } else clearError('errorRtRw');
        
        const alamat = document.getElementById('alamat').value;
        if (!alamat.trim()) {
            showError('errorAlamat', 'Alamat wajib diisi');
            isValid = false;
        } else clearError('errorAlamat');
        
        const noHp = document.getElementById('noHp').value;
        if (!noHp || !/^[0-9]{10,13}$/.test(noHp)) {
            showError('ErrorNoHp', 'Nomor HP harus 10-13 digit angka');
            isValid = false;
        } else clearError('ErrorNoHp');
        
        return isValid;
    }
    
    return true;
}

function goToStep(step) {
    if (step < 1 || step > 4) return;
    
    document.querySelectorAll('.form-step').forEach(el => el.style.display = 'none');
    document.getElementById(`step${step}`).style.display = 'block';
    
    document.querySelectorAll('.step').forEach((el, idx) => {
        if (idx + 1 === step) el.classList.add('active');
        else el.classList.remove('active');
    });
    
    currentStep = step;
    
    if (step === 4) {
        displaySummary();
    }
}

function displaySummary() {
    const summary = document.getElementById('summaryData');
    const jenisSurat = document.getElementById('jenisSurat').value;
    const data = {
        'Jenis Surat': jenisSurat,
        'NIK': document.getElementById('nik').value,
        'Nama Lengkap': document.getElementById('namaLengkap').value,
        'Tempat/Tanggal Lahir': `${document.getElementById('tempatLahir').value}, ${document.getElementById('tanggalLahir').value}`,
        'Jenis Kelamin': document.getElementById('jenisKelamin').value,
        'RT/RW': document.getElementById('rtRw').value,
        'Alamat': document.getElementById('alamat').value,
        'Nomor HP': document.getElementById('noHp').value,
        'Email': document.getElementById('email').value || '-'
    };
    
    let html = '<table style="width:100%">';
    for (const [key, value] of Object.entries(data)) {
        html += `<tr><td style="padding:8px; font-weight:600">${key}</td><td style="padding:8px">: ${value}</td></tr>`;
    }
    html += '</table>';
    summary.innerHTML = html;
}

function handleFiles(files) {
    const container = document.getElementById('uploadedFiles');
    uploadedFiles = [];
    container.innerHTML = '';
    
    for (let file of files) {
        if (file.size > 5 * 1024 * 1024) {
            showToast('File terlalu besar (max 5MB)', 'error');
            continue;
        }
        uploadedFiles.push(file.name);
        const fileItem = document.createElement('div');
        fileItem.className = 'uploaded-file';
        fileItem.innerHTML = `<i class="fas fa-file"></i> ${file.name} <span class="remove-file">&times;</span>`;
        container.appendChild(fileItem);
    }
}

function saveDraft() {
    const draftData = {
        jenisSurat: document.getElementById('jenisSurat').value,
        nik: document.getElementById('nik').value,
        namaLengkap: document.getElementById('namaLengkap').value,
        tempatLahir: document.getElementById('tempatLahir').value,
        tanggalLahir: document.getElementById('tanggalLahir').value,
        jenisKelamin: document.getElementById('jenisKelamin').value,
        rtRw: document.getElementById('rtRw').value,
        alamat: document.getElementById('alamat').value,
        noHp: document.getElementById('noHp').value,
        email: document.getElementById('email').value,
        uploadedFiles: uploadedFiles
    };
    localStorage.setItem('draftPengajuan', JSON.stringify(draftData));
    showToast('Data sementara disimpan', 'success');
}

function submitPengajuan(e) {
    e.preventDefault();
    
    // Validate all steps
    let allValid = true;
    for (let i = 1; i <= 3; i++) {
        currentStep = i;
        if (!validateCurrentStep()) {
            goToStep(i);
            allValid = false;
            break;
        }
    }
    currentStep = 4;
    
    if (!allValid) return;
    
    // Show loading
    document.getElementById('loadingOverlay').style.display = 'flex';
    
    setTimeout(() => {
        const newPengajuan = {
            id: Date.now().toString(),
            nomorPengajuan: generateNomorPengajuan(),
            tanggal: new Date().toISOString().split('T')[0],
            jenisSurat: document.getElementById('jenisSurat').value,
            status: 'Diproses',
            dataDiri: {
                nik: document.getElementById('nik').value,
                nama: document.getElementById('namaLengkap').value,
                tempatLahir: document.getElementById('tempatLahir').value,
                tanggalLahir: document.getElementById('tanggalLahir').value,
                jenisKelamin: document.getElementById('jenisKelamin').value,
                rtRw: document.getElementById('rtRw').value,
                alamat: document.getElementById('alamat').value,
                noHp: document.getElementById('noHp').value,
                email: document.getElementById('email').value || ''
            },
            uploadedFiles: uploadedFiles
        };
        
        pengajuanData.unshift(newPengajuan);
        savePengajuanToStorage();
        
        document.getElementById('loadingOverlay').style.display = 'none';
        showToast(`Pengajuan berhasil! Nomor: ${newPengajuan.nomorPengajuan}`, 'success');
        
        // Reset form
        document.getElementById('pengajuanForm').reset();
        uploadedFiles = [];
        document.getElementById('uploadedFiles').innerHTML = '';
        goToStep(1);
        
        // Redirect to status page after 2 seconds
        setTimeout(() => {
            window.location.href = 'status.html';
        }, 2000);
    }, 1500);
}

function setupRealTimeValidation() {
    const nikInput = document.getElementById('nik');
    if (nikInput) {
        nikInput.addEventListener('input', () => {
            if (nikInput.value.length === 16 && /^\d+$/.test(nikInput.value)) {
                clearError('errorNik');
            }
        });
    }
    
    const noHpInput = document.getElementById('noHp');
    if (noHpInput) {
        noHpInput.addEventListener('input', () => {
            if (/^[0-9]{10,13}$/.test(noHpInput.value)) {
                clearError('ErrorNoHp');
            }
        });
    }
}

function showError(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = message;
}

function clearError(elementId) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = '';
}

// ============ Services Page ============
const servicesData = [
    { nama: 'KTP (Kartu Tanda Penduduk)', kategori: 'Kependudukan', estimasi: '3 hari', syarat: 'KK, foto, pengantar RT' },
    { nama: 'KK (Kartu Keluarga)', kategori: 'Keluarga', estimasi: '2 hari', syarat: 'KTP lama, surat nikah/kelahiran' },
    { nama: 'Akta Kelahiran', kategori: 'Keluarga', estimasi: '5 hari', syarat: 'Surat lahir dari bidan/dokter, KK' },
    { nama: 'Surat Kematian', kategori: 'Kependudukan', estimasi: '1 hari', syarat: 'Surat kematian dari rumah sakit/keterangan RT' },
    { nama: 'Surat Pindah', kategori: 'Kependudukan', estimasi: '1 hari', syarat: 'KK, KTP, surat tujuan pindah' },
    { nama: 'Surat Domisili', kategori: 'Perizinan', estimasi: '1 hari', syarat: 'KK, pengantar RT' },
    { nama: 'Surat Keterangan Tidak Mampu', kategori: 'Keterangan', estimasi: '1 hari', syarat: 'KK, pengantar RT' },
    { nama: 'Surat Pengantar RT/RW', kategori: 'Keterangan', estimasi: '1 hari', syarat: 'Datang ke kantor RT setempat' }
];

function setupFilters() {
    if (!document.getElementById('servicesList')) return;
    renderServices('all');
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderServices(btn.dataset.category);
        });
    });
}

function renderServices(category) {
    const container = document.getElementById('servicesList');
    let filtered = servicesData;
    if (category !== 'all') {
        filtered = servicesData.filter(s => s.kategori === category);
    }
    
    container.innerHTML = filtered.map(service => `
        <div class="service-card">
            <div class="service-icon"><i class="fas fa-file-alt"></i></div>
            <h4>${service.nama}</h4>
            <p class="service-category">Kategori: ${service.kategori}</p>
            <div class="service-meta"><i class="far fa-clock"></i> Estimasi: ${service.estimasi}</div>
            <div class="service-meta"><i class="fas fa-paperclip"></i> Syarat: ${service.syarat}</div>
            <a href="formulir.html?jenis=${encodeURIComponent(service.nama.split(' ')[0])}" class="btn btn-sm btn-primary" style="margin-top:15px">Ajukan Sekarang</a>
        </div>
    `).join('');
}

// ============ Status Page ============
function setupStatusPage() {
    if (!document.getElementById('historyTableBody')) return;
    renderHistoryTable(pengajuanData);
    
    document.getElementById('searchBtn')?.addEventListener('click', () => {
        const keyword = document.getElementById('searchInput').value.trim();
        if (!keyword) {
            renderHistoryTable(pengajuanData);
            return;
        }
        const filtered = pengajuanData.filter(p => 
            p.nomorPengajuan.toLowerCase().includes(keyword.toLowerCase()) ||
            p.dataDiri.nik.includes(keyword)
        );
        renderHistoryTable(filtered);
        if (filtered.length === 0) showToast('Data tidak ditemukan', 'error');
    });
    
    document.getElementById('showAllBtn')?.addEventListener('click', () => {
        document.getElementById('searchInput').value = '';
        renderHistoryTable(pengajuanData);
    });
}

function renderHistoryTable(data) {
    const tbody = document.getElementById('historyTableBody');
    if (!tbody) return;
    
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Belum ada data pengajuan</td></tr>';
        return;
    }
    
    tbody.innerHTML = data.map(item => {
        let statusClass = '';
        if (item.status === 'Diproses') statusClass = 'status-diproses';
        else if (item.status === 'Siap Diambil') statusClass = 'status-siap';
        else if (item.status === 'Selesai') statusClass = 'status-selesai';
        else if (item.status === 'Ditolak') statusClass = 'status-ditolak';
        
        return `
            <tr>
                <td>${item.nomorPengajuan}</td>
                <td>${item.jenisSurat}</td>
                <td>${item.tanggal}</td>
                <td><span class="status-badge ${statusClass}">${item.status}</span></td>
                <td><button class="btn btn-sm btn-outline" onclick="showDetail('${item.id}')">Detail</button></td>
            </tr>
        `;
    }).join('');
}

window.showDetail = function(id) {
    const item = pengajuanData.find(p => p.id === id);
    if (!item) return;
    
    const modal = document.getElementById('detailModal');
    const body = document.getElementById('detailModalBody');
    
    body.innerHTML = `
        <p><strong>Nomor Pengajuan:</strong> ${item.nomorPengajuan}</p>
        <p><strong>Jenis Surat:</strong> ${item.jenisSurat}</p>
        <p><strong>Tanggal Pengajuan:</strong> ${item.tanggal}</p>
        <p><strong>Status:</strong> ${item.status}</p>
        <hr>
        <h4>Data Pemohon</h4>
        <p><strong>NIK:</strong> ${item.dataDiri.nik}</p>
        <p><strong>Nama:</strong> ${item.dataDiri.nama}</p>
        <p><strong>Tempat/Tanggal Lahir:</strong> ${item.dataDiri.tempatLahir}, ${item.dataDiri.tanggalLahir}</p>
        <p><strong>Jenis Kelamin:</strong> ${item.dataDiri.jenisKelamin}</p>
        <p><strong>RT/RW:</strong> ${item.dataDiri.rtRw}</p>
        <p><strong>Alamat:</strong> ${item.dataDiri.alamat}</p>
        <p><strong>No. HP:</strong> ${item.dataDiri.noHp}</p>
        ${item.dataDiri.email ? `<p><strong>Email:</strong> ${item.dataDiri.email}</p>` : ''}
        ${item.uploadedFiles && item.uploadedFiles.length ? `<p><strong>Dokumen:</strong> ${item.uploadedFiles.join(', ')}</p>` : ''}
    `;
    
    modal.style.display = 'flex';
    modal.querySelector('.modal-close').onclick = () => modal.style.display = 'none';
};

// ============ Contact Page ============
function setupContactPage() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nama = document.getElementById('contactName').value;
        const email = document.getElementById('contactEmail').value;
        const pesan = document.getElementById('contactMessage').value;
        
        const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
        messages.push({ nama, email, pesan, tanggal: new Date().toISOString() });
        localStorage.setItem('contactMessages', JSON.stringify(messages));
        
        showToast('Pesan Anda telah terkirim', 'success');
        contactForm.reset();
    });
}

function setupFAQ() {
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
            const parent = question.parentElement;
            parent.classList.toggle('active');
            const icon = question.querySelector('i');
            if (parent.classList.contains('active')) {
                icon.className = 'fas fa-chevron-up';
            } else {
                icon.className = 'fas fa-chevron-down';
            }
        });
    });
}

// ============ Statistics ============
function updateStatistics() {
    const totalElement = document.getElementById('totalPengajuan');
    if (totalElement) {
        totalElement.textContent = pengajuanData.length;
    }
}

// ============ Toast ============
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}