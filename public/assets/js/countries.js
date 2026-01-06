document.addEventListener('DOMContentLoaded', () => {

    // (1. "إمساك" العناصر)
    const alertPlaceholder = document.getElementById('alert-placeholder');
    const mainContent = document.querySelector('.main-content');
    const tableBody = document.getElementById('countries-table-body');
    const paginationContainer = document.getElementById('pagination-container');
    
    // (عناصر Modals)
    const addCountryModalEl = document.getElementById('addCountryModal');
    const addCountryModal = new bootstrap.Modal(addCountryModalEl);
    const addCountryForm = document.getElementById('add-country-form');
    
    const manageCitiesModalEl = document.getElementById('manageCitiesModal');
    const manageCitiesModal = new bootstrap.Modal(manageCitiesModalEl);
    const manageCitiesForm = document.getElementById('manage-cities-form');
    const manageCountryIdInput = document.getElementById('manage-country-id');
    const manageCountryNameSpan = document.getElementById('manage-country-name');
    
    // (عناصر نظام "Tags" الجديد)
    const existingCitiesList = document.getElementById('existing-cities-list');
    const newCityInput = document.getElementById('new-city-name');
    const addCityButton = document.getElementById('add-city-button');

    const deleteModalEl = document.getElementById('deleteConfirmModal');
    const deleteModal = new bootstrap.Modal(deleteModalEl);
    const confirmDeleteButton = document.getElementById('confirm-delete-button');

    // (2. بيانات المستخدم)
    const authToken = localStorage.getItem('authToken');
    const userType = localStorage.getItem('userType');
    
    let currentPage = 1;
    let idToDelete = null;

    // (3. التحقق الأمني - أدمن فقط)
    if (userType !== 'admin') {
        showAlert('ليس لديك الصلاحية للوصول لهذه الصفحة.', 'danger');
        mainContent.innerHTML = ''; 
        setTimeout(() => { window.location.href = '/dashboard'; }, 2000);
        return;
    }

    /**
     * (4) دالة جلب وعرض الدول
     */
    async function fetchCountries(page = 1) {
        currentPage = page;
        tableBody.innerHTML = `<tr><td colspan="4" class="text-center"><div class="spinner-border text-primary" role="status"></div></td></tr>`;

        const url = `${BASE_URL}/country?page=${page}&limit=10`;

        try {
            const response = await fetch(url, { headers: { 'Authorization': `Bearer ${authToken}` } });
            if (!response.ok) throw new Error('فشل جلب الدول.');
            
            const data = await response.json();
            if (data.success && data.data) {
                renderTable(data.data);
                renderPagination(data.pagination);
            } else {
                tableBody.innerHTML = `<tr><td colspan="4" class="text-center">لا توجد دول لعرضها.</td></tr>`;
                paginationContainer.innerHTML = '';
            }
        } catch (error) {
            showAlert(error.message, 'danger');
        }
    }

    function renderTable(countries) {
        tableBody.innerHTML = '';
        if (countries.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" class="text-center">لا توجد دول.</td></tr>`;
            return;
        }

        countries.forEach((country, index) => {
            const tr = document.createElement('tr');
            
            // (تحويل مصفوفة المدن إلى "Tags")
            const citiesHtml = country.cities.map(city => 
                `<span class="badge bg-secondary me-1">${city}</span>`
            ).join(' ');

            tr.innerHTML = `
                <td>${(currentPage - 1) * 10 + index + 1}</td>
                <td>${country.country}</td>
                <td>${citiesHtml || '<em class="text-muted">لا توجد مدن</em>'}</td>
                <td>
                    <button class="btn btn-sm btn-info text-white" 
                            onclick="openManageCitiesModal('${country._id}', '${country.country}', \`${country.cities.join('\n')}\`)">
                        <i class="bi bi-pencil-fill"></i> إدارة المدن
                    </button>
                    
                    <button class="btn btn-sm btn-danger" onclick="openDeleteModal('${country._id}')">
                        <i class="bi bi-trash-fill"></i> حذف الدولة
                    </button>
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
        
        let startPage = Math.max(1, page - 2);
        let endPage = Math.min(pages, page + 2);

        if (page <= 3) endPage = Math.min(5, pages);
        if (page >= pages - 2) startPage = Math.max(1, pages - 4);

        for (let i = startPage; i <= endPage; i++) {
            html += `<li class="page-item ${i === page ? 'active' : ''}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
        }

        html += `<li class="page-item ${!hasNextPage ? 'disabled' : ''}"><a class="page-link" href="#" data-page="${page + 1}">التالي</a></li>`;
        html += '</ul>';
        paginationContainer.innerHTML = html;
    }
    
    paginationContainer.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.target.closest('a.page-link');
        if (!target) return;
        const page = target.dataset.page;
        if (page) {
            fetchCountries(parseInt(page));
        }
    });

    /**
     * (5) دوال عمليات (Create, Update, Delete)
     */

    // (أ. إضافة دولة جديدة)
    addCountryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const button = e.target.querySelector('.save-button');
        setLoading(button, true);

        const countryName = document.getElementById('country-name').value;
        const citiesInput = document.getElementById('country-cities').value;
        
        // (تحويل النص من "سطر جديد" إلى مصفوفة)
        const citiesArray = citiesInput.split('\n')
            .map(city => city.trim())
            .filter(city => city); // (لإزالة الفراغات والأسطر)

        try {
            const response = await fetch(`${BASE_URL}/country`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    country: countryName,
                    cities: citiesArray
                })
            });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.message || 'فشل إضافة الدولة.');
            
            showAlert('تمت إضافة الدولة بنجاح!', 'success');
            addCountryModal.hide();
            addCountryForm.reset();
            fetchCountries(1); // (العودة للصفحة الأولى)

        } catch (error) {
            showAlert(error.message, 'danger', true, addCountryModalEl);
        } finally {
            setLoading(button, false);
        }
    });

    // (ب. فتح Modal إدارة المدن)
    window.openManageCitiesModal = function(id, name, citiesText) {
        manageCountryIdInput.value = id;
        manageCountryNameSpan.textContent = name;
        
        existingCitiesList.innerHTML = ''; // تفريغ القائمة القديمة
        newCityInput.value = ''; // تفريغ حقل الإضافة

        if (citiesText) {
            const citiesArray = citiesText.split('\n'); // (المدن تأتي كـ نص)
            citiesArray.forEach(city => {
                if (city.trim()) {
                    addCityTag(city.trim()); // (استخدام دالة مساعدة لإضافة البطاقة)
                }
            });
        }
        
        manageCitiesModal.show();
    }
    
    // (ج. دالة مساعدة لإنشاء "بطاقة" مدينة)
    function addCityTag(city) {
        const cityName = city.trim();
        if (!cityName) return;

        // (نتأكد أن المدينة غير مضافة مسبقاً)
        const existingTags = existingCitiesList.querySelectorAll('[data-city-name]');
        const isDuplicate = Array.from(existingTags).some(tag => tag.dataset.cityName === cityName);

        if (isDuplicate) {
            showAlert('هذه المدينة مضافة بالفعل.', 'warning', true, manageCitiesModalEl);
            return;
        }

        existingCitiesList.innerHTML += `
            <span class="badge bg-secondary fs-6 me-1 mb-1 d-inline-flex align-items-center">
                <span data-city-name="${cityName}">${cityName}</span>
                <button type="button" class="btn-close btn-close-white ms-1" aria-label="Close"></button>
            </span>
        `;
    }

    // (د. مستمع لحذف "بطاقة" مدينة عند الضغط على ✕)
    existingCitiesList.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-close')) {
            e.target.closest('.badge').remove(); // (احذف البطاقة)
        }
    });

    // (هـ. مستمع لزر "إضافة" مدينة جديدة)
    addCityButton.addEventListener('click', () => {
        addCityTag(newCityInput.value);
        newCityInput.value = ''; // (تفريغ الحقل)
    });
    // (السماح بالإضافة عند الضغط على Enter أيضاً)
    newCityInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // (منع الفورم من الإرسال)
            addCityButton.click();
        }
    });

    // (و. حفظ تعديلات المدن)
    manageCitiesForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const button = e.target.querySelector('.save-button');
        setLoading(button, true);

        const id = manageCountryIdInput.value;
        
        // (قراءة البيانات من "البطاقات")
        const citySpans = existingCitiesList.querySelectorAll('[data-city-name]');
        const newCitiesArray = Array.from(citySpans).map(span => span.dataset.cityName);

        try {
            const response = await fetch(`${BASE_URL}/country/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    cities: newCitiesArray // (إرسال المصفوفة الجديدة)
                })
            });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.message || 'فشل تعديل المدن.');

            showAlert('تم تحديث قائمة المدن بنجاح!', 'success');
            manageCitiesModal.hide();
            fetchCountries(currentPage); // (البقاء في نفس الصفحة)

        } catch (error) {
            showAlert(error.message, 'danger', true, manageCitiesModalEl);
        } finally {
            setLoading(button, false);
        }
    });
    
    // (ز. فتح Modal الحذف)
    window.openDeleteModal = function(id) {
        idToDelete = id;
        deleteModal.show();
    }
    
    // (ح. تأكيد حذف الدولة)
    confirmDeleteButton.addEventListener('click', async () => {
        if (!idToDelete) return;
        const button = confirmDeleteButton;
        setLoading(button, true);

        try {
            const response = await fetch(`${BASE_URL}/country/${idToDelete}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.message || 'فشل حذف الدولة.');

            showAlert('تم حذف الدولة بنجاح.', 'success');
            deleteModal.hide();
            fetchCountries(1); // (العودة للصفحة الأولى)

        } catch (error) {
            showAlert(error.message, 'danger');
        } finally {
            setLoading(button, false);
            idToDelete = null;
        }
    });

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
            // (تحديد مكان التنبيه داخل الـ Modal النشط)
            const activeModal = modalElement ? modalElement : document.querySelector('.modal.show');
            if (activeModal) {
                targetAlertPlaceholder = activeModal.querySelector('.modal-body');
            }
        }
        
        if (!targetAlertPlaceholder) return; 

        const wrapper = document.createElement("div");
        wrapper.innerHTML = `<div class="alert alert-${type} alert-dismissible" role="alert"><div>${message}</div><button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`;
        
        if (insideModal) {
            targetAlertPlaceholder.prepend(wrapper);
        } else {
            alertPlaceholder.append(wrapper);
        }
        
        setTimeout(() => wrapper.remove(), 3000);
    }

    // (6. بدء تشغيل الصفحة)
    fetchCountries(1);
});