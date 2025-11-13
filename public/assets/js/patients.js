document.addEventListener('DOMContentLoaded', () => {

    // (1. "إمساك" العناصر)
    const alertPlaceholder = document.getElementById('alert-placeholder');
    const mainContent = document.querySelector('.main-content');
    const tableBody = document.getElementById('patients-table-body');
    const paginationContainer = document.getElementById('pagination-container');
    
    // (عناصر الفلاتر)
    const filterForm = document.getElementById('filter-form');
    const phoneFilter = document.getElementById('filter-phone');
    const countryFilter = document.getElementById('filter-country'); 
    const cityFilter = document.getElementById('filter-city');       
    const clearFilterButton = document.getElementById('clear-filter-button');

    // (Modals)
    const editPatientModalEl = document.getElementById('editPatientModal');
    const editPatientModal = new bootstrap.Modal(editPatientModalEl);
    const editPatientForm = document.getElementById('edit-patient-form');
    
    const reservationsModalEl = document.getElementById('viewReservationsModal');
    const reservationsModal = new bootstrap.Modal(reservationsModalEl);
    const reservationsLoading = document.getElementById('reservations-loading');
    const reservationsListContainer = document.getElementById('reservations-list-container');
    const reservationsListBody = document.getElementById('reservations-list-body');
    const reservationsPatientName = document.getElementById('reservations-patient-name');
    
    const deleteModalEl = document.getElementById('deleteConfirmModal');
    const deleteModal = new bootstrap.Modal(deleteModalEl);
    const confirmDeleteButton = document.getElementById('confirm-delete-button');

    // (2. بيانات المستخدم)
    const authToken = localStorage.getItem('authToken');
    const userType = localStorage.getItem('userType');
    
    let currentPage = 1;
    let idToDelete = null;
    let countriesData = []; // (لتخزين بيانات الدول)

    // (3. التحقق الأمني - أدمن فقط)
    if (userType !== 'admin') {
        showAlert('ليس لديك الصلاحية للوصول لهذه الصفحة.', 'danger');
        mainContent.innerHTML = ''; 
        setTimeout(() => { window.location.href = '/dashboard'; }, 2000);
        return;
    }

    /**
     * (4) دالة جلب وعرض المرضى (مع الفلاتر)
     */
    async function fetchPatients(page = 1) {
        currentPage = page;
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center"><div class="spinner-border text-primary" role="status"></div></td></tr>`;

        const params = new URLSearchParams({
            page: page,
            limit: 10
        });
        if (phoneFilter.value) params.append('phone', phoneFilter.value);
        if (countryFilter.value) params.append('country', countryFilter.value); 
        if (cityFilter.value) params.append('city', cityFilter.value);       

        const url = `${BASE_URL}/user?${params.toString()}`;

        try {
            const response = await fetch(url, { headers: { 'Authorization': `Bearer ${authToken}` } });
            if (!response.ok) throw new Error('فشل جلب بيانات المرضى.');
            
            const data = await response.json();
            if (data.success && data.data && data.data.length > 0) {
                renderTable(data.data);
                renderPagination(data.pagination);
            } else {
                tableBody.innerHTML = `<tr><td colspan="7" class="text-center">لا توجد بيانات تطابق هذا البحث.</td></tr>`;
                paginationContainer.innerHTML = '';
            }
        } catch (error) {
            showAlert(error.message, 'danger');
            tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">${error.message}</td></tr>`;
        }
    }
    
    function renderTable(patients) {
        tableBody.innerHTML = '';
        if (patients.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" class="text-center">لا يوجد مرضى لعرضهم.</td></tr>`;
            return;
        }
        patients.forEach((patient, index) => {
            const tr = document.createElement('tr');
            const createdAt = new Date(patient.createdAt).toLocaleDateString('ar-EG');
            const patientJson = JSON.stringify(patient).replace(/'/g, "\\'");
            tr.innerHTML = `
                <td>${(currentPage - 1) * 10 + index + 1}</td>
                <td>${patient.name}</td>
                <td>${patient.phone}</td>
                <td>${patient.country}</td>
                <td>${patient.city}</td>
                <td>${createdAt}</td>
                <td>
                    <button class="btn btn-sm btn-info text-white" title="تعديل" onclick='openEditModal(\`${patientJson}\`)'><i class="bi bi-pencil-fill"></i></button>
                    <button class="btn btn-sm btn-primary" title="عرض الحجوزات" onclick='openReservationsModal("${patient._id}", "${patient.name}")'><i class="bi bi-calendar-check"></i></button>
                    <button class="btn btn-sm btn-danger" title="حذف" onclick="openDeleteModal('${patient._id}')"><i class="bi bi-trash-fill"></i></button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    function renderPagination(pagination) {
        paginationContainer.innerHTML = ''; 
        if (!pagination || pagination.pages <= 1) return;
        const { page, pages, hasNextPage, hasPrevPage } = pagination;
        let html = '<ul class="pagination">';
        html += `<li class="page-item ${!hasPrevPage ? 'disabled' : ''}"><a class="page-link" href="#" data-page="${page - 1}">السابق</a></li>`;
        for (let i = Math.max(1, page - 2); i <= Math.min(pages, page + 2); i++) {
            html += `<li class="page-item ${i === page ? 'active' : ''}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
        }
        html += `<li class="page-item ${!hasNextPage ? 'disabled' : ''}"><a class="page-link" href="#" data-page="${page + 1}">التالي</a></li>`;
        html += '</ul>';
        paginationContainer.innerHTML = html;
    }
    
    /**
     * (5) دالة لجلب بيانات الفلاتر (الدول)
     */
    async function initializeFilters() {
        try {
            const response = await fetch(`${BASE_URL}/country?limit=1000`, { 
                headers: { 'Authorization': `Bearer ${authToken}` } 
            });
            if (!response.ok) throw new Error('فشل جلب بيانات الدول.');
            
            const data = await response.json();
            if (data.success && data.data) {
                countriesData = data.data; // (تخزين البيانات)
                countryFilter.innerHTML = '<option value="" selected>كل الدول</option>'; // (إعادة تعيين)
                countriesData.forEach(country => {
                    countryFilter.innerHTML += `<option value="${country.country}">${country.country}</option>`;
                });
            }
        } catch (error) {
            console.error('Filter load error:', error);
            countryFilter.innerHTML = `<option value="">خطأ في تحميل الدول</option>`;
        }
    }

    /**
     * (6) مستمعات الفلاتر والـ Pagination
     */
    filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        fetchPatients(1); 
    });

    clearFilterButton.addEventListener('click', () => {
        filterForm.reset();
        cityFilter.innerHTML = '<option value="">كل المدن</option>';
        cityFilter.disabled = true;
        fetchPatients(1); 
    });

    countryFilter.addEventListener('change', () => {
        const selectedCountryName = countryFilter.value;
        cityFilter.innerHTML = '<option value="">كل المدن</option>'; 
        cityFilter.disabled = true;

        if (selectedCountryName) {
            const selectedCountry = countriesData.find(c => c.country === selectedCountryName);
            if (selectedCountry && selectedCountry.cities) {
                selectedCountry.cities.forEach(city => {
                    cityFilter.innerHTML += `<option value="${city}">${city}</option>`;
                });
                cityFilter.disabled = false;
            }
        }
    });

    paginationContainer.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.target.closest('a.page-link');
        if (!target) return;
        const page = target.dataset.page;
        if (page) fetchPatients(parseInt(page));
    });

    /**
     * (7) دوال Modals (تعديل، حذف، عرض الحجوزات)
     */

    // (أ. فتح Modal التعديل)
    window.openEditModal = function(patientJson) {
        const patient = JSON.parse(patientJson);
        document.getElementById('edit-patient-id').value = patient._id;
        document.getElementById('edit-name').value = patient.name;
        document.getElementById('edit-phone').value = patient.phone;
        document.getElementById('edit-country').value = patient.country;
        document.getElementById('edit-city').value = patient.city;
        editPatientModal.show();
    }

    // (ب. حفظ تعديلات المريض)
    editPatientForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const button = e.target.querySelector('.save-button');
        setLoading(button, true);
        const id = document.getElementById('edit-patient-id').value;
        const body = {
            name: document.getElementById('edit-name').value,
            phone: document.getElementById('edit-phone').value,
            country: document.getElementById('edit-country').value,
            city: document.getElementById('edit-city').value,
        };
        try {
            const response = await fetch(`${BASE_URL}/user/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(body)
            });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.message || 'فشل تعديل بيانات المريض.');
            showAlert('تم حفظ التعديلات بنجاح!', 'success');
            editPatientModal.hide();
            fetchPatients(currentPage);
        } catch (error) {
            showAlert(error.message, 'danger', true, editPatientModalEl);
        } finally {
            setLoading(button, false);
        }
    });

    // (ج. فتح Modal الحذف)
    window.openDeleteModal = function(id) {
        idToDelete = id;
        deleteModal.show();
    }
    
    // (د. تأكيد حذف المريض)
    confirmDeleteButton.addEventListener('click', async () => {
        if (!idToDelete) return;
        setLoading(confirmDeleteButton, true);
        try {
            const response = await fetch(`${BASE_URL}/user/${idToDelete}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.message || 'فشل حذف المريض.');
            showAlert('تم حذف المريض بنجاح.', 'success');
            deleteModal.hide();
            fetchPatients(1);
        } catch (error) {
            showAlert(error.message, 'danger', true, deleteModalEl);
        } finally {
            setLoading(confirmDeleteButton, false);
            idToDelete = null;
        }
    });

    // (هـ. فتح Modal عرض الحجوزات)
    window.openReservationsModal = function(patientId, patientName) {
        reservationsPatientName.textContent = patientName;
        reservationsListContainer.style.display = 'none';
        reservationsLoading.style.display = 'block';
        reservationsListBody.innerHTML = '';
        reservationsModal.show();
        
        // (جلب الحجوزات الخاصة بهذا المريض)
        fetchReservations(patientId);
    }
    
    // (و. دالة جلب الحجوزات - محدثة)
    async function fetchReservations(patientId) {
        
        // (تحديث: استخدام الـ Endpoint الصحيح الذي زودتني به)
        // (سأضيف populate=doctor لمحاولة جلب اسم الطبيب)
        const populateQuery = encodeURIComponent(JSON.stringify({"path":"doctor"}));
        const url = `${BASE_URL}/slot/user/${patientId}?populate=${populateQuery}&limit=1000`;

        try {
            const response = await fetch(url, { headers: { 'Authorization': `Bearer ${authToken}` } });
            if (!response.ok) throw new Error('فشل جلب الحجوزات.');
            
            const data = await response.json();
            reservationsListBody.innerHTML = ''; // تفريغ

            if (data.success && data.data && data.data.length > 0) {
                data.data.forEach(slot => {
                    // (التحقق من أن الـ populate يعمل)
                    const doctorName = (slot.doctor && slot.doctor.name) ? slot.doctor.name : `<em class="text-muted">${slot.doctor || 'طبيب غير محدد'}</em>`;
                    const date = new Date(slot.date).toLocaleDateString('ar-EG');
                    reservationsListBody.innerHTML += `
                        <tr>
                            <td>${doctorName}</td>
                            <td>${date}</td>
                            <td>${slot.from}</td>
                            <td>${slot.to}</td>
                        </tr>
                    `;
                });
            } else {
                reservationsListBody.innerHTML = `<tr><td colspan="4" class="text-center">لا توجد حجوزات لهذا المريض.</td></tr>`;
            }
        } catch (error) {
            console.error(error);
            reservationsListBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">حدث خطأ: ${error.message}</td></tr>`;
        } finally {
            reservationsLoading.style.display = 'none';
            reservationsListContainer.style.display = 'block';
        }
    }


    // --- دوال مساعدة ---
    function setLoading(button, isLoading) {
        if (!button) return;
        const spinner = button.querySelector('.spinner-border');
        if (isLoading) {
            button.disabled = true;
            if (spinner) spinner.classList.remove('d-none');
        } else {
            button.disabled = false;
            if (spinner) spinner.classList.add('d-none');
        }
    }

    function showAlert(message, type, insideModal = false, modalElement = null) {
        let targetAlertPlaceholder = alertPlaceholder;
        if (insideModal) {
            const activeModal = modalElement ? modalElement : document.querySelector('.modal.show');
            if (activeModal) targetAlertPlaceholder = activeModal.querySelector('.modal-body');
        }
        if (!targetAlertPlaceholder) return; 
        const wrapper = document.createElement("div");
        wrapper.innerHTML = `<div class="alert alert-${type} alert-dismissible" role="alert"><div>${message}</div><button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`;
        targetAlertPlaceholder.prepend(wrapper);
        setTimeout(() => wrapper.remove(), 3000);
    }

    // (8. بدء تشغيل الصفحة)
    fetchPatients(1); // (جلب المرضى)
    initializeFilters(); // (جلب الدول)
});