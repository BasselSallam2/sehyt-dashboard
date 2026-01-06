document.addEventListener('DOMContentLoaded', () => {
    
    // (1. "إمساك" العناصر - بما في ذلك الزر)
    const loadingSpinner = document.getElementById('loading-spinner');
    const adminViewContainer = document.getElementById('admin-group-view');
    const doctorViewContainer = document.getElementById('doctor-list-view');
    const doctorTableBody = document.getElementById('banners-table-body-doctor');
    const alertPlaceholder = document.getElementById('alert-placeholder');
    const paginationContainer = document.getElementById('pagination-container');
    const addBannerButton = document.getElementById('add-banner-button'); // (إمساك الزر)

    // (Modals)
    const deleteModalEl = document.getElementById('deleteConfirmModal');
    const deleteModal = new bootstrap.Modal(deleteModalEl);
    const confirmDeleteButton = document.getElementById('confirm-delete-button');
    const confirmDeleteSpinner = confirmDeleteButton.querySelector('.spinner-border');

    // (2. جلب بيانات المستخدم)
    const authToken = localStorage.getItem('authToken');
    const userType = localStorage.getItem('userType');
    
    let currentPage = 1;
    const limitPerPage = 7;
    let idToDelete = null;

    // --- (هذا هو الكود المفقود) ---
    // (3. التحكم في زر الإضافة)
    if (userType === 'doctor') {
        if (addBannerButton) {
            addBannerButton.style.display = 'block'; // (أظهر الزر للدكتور فقط)
        }
    }
    // ---------------------------------

    /**
     * (4) الدالة الرئيسية لجلب البيانات
     */
    async function fetchBanners(page = 1) {
        loadingSpinner.classList.remove('d-none');
        adminViewContainer.classList.add('d-none');
        doctorViewContainer.classList.add('d-none');
        
        let url = '';

        if (userType === 'admin') {
            url = `${BASE_URL}/bunner?populate=[{"path":"doctor"},{"path":"specialize"}]`;
        } else if (userType === 'doctor') {
            currentPage = page;
            url = `${BASE_URL}/bunner?populate=[{"path":"specialize"}]&page=${page}&limit=${limitPerPage}`;
        }

        try {
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                     showAlert('انتهت صلاحية الجلسة، سيتم تسجيل خروجك...', 'danger');
                     setTimeout(handleLogout, 2000);
                     return;
                }
                throw new Error('فشل في جلب البيانات.');
            }

            const data = await response.json();
            loadingSpinner.classList.add('d-none');

            if (data.success && data.data && data.data.length > 0) {
                if (userType === 'admin') {
                    renderAdminView(data.data);
                } else if (userType === 'doctor') {
                    renderDoctorView(data.data);
                    renderPagination(data.pagination);
                }
            } else {
                // (إظهار الحاوية حتى لو فارغة)
                if (userType === 'admin') {
                    adminViewContainer.classList.remove('d-none');
                    adminViewContainer.innerHTML = '<p class="text-center">لا توجد أي بنرات في النظام.</p>';
                } else if (userType === 'doctor') {
                    doctorViewContainer.classList.remove('d-none');
                    doctorTableBody.innerHTML = `<tr><td colspan="6" class="text-center">لا توجد بنرات خاصة بك.</td></tr>`;
                    renderPagination(data.pagination); // (إظهار الـ pagination حتى لو فارغة)
                }
            }

        } catch (error) {
            console.error('Fetch Banners Error:', error);
            loadingSpinner.classList.add('d-none');
            showAlert(error.message, 'danger');
        }
    }

    /**
     * (5) بناء واجهة الدكتور
     */
    function renderDoctorView(banners) {
        doctorTableBody.innerHTML = ''; 
        if (banners.length === 0) {
            doctorTableBody.innerHTML = `<tr><td colspan="6" class="text-center">لا توجد بنرات خاصة بك.</td></tr>`;
        } else {
            banners.forEach(banner => {
                doctorTableBody.innerHTML += createDoctorBannerRowHTML(banner);
            });
        }
        doctorViewContainer.classList.remove('d-none');
    }
    
    /**
     * (6) بناء واجهة الأدمن
     */
    function renderAdminView(banners) {
        adminViewContainer.innerHTML = ''; 
        if (banners.length === 0) {
            adminViewContainer.innerHTML = '<p class="text-center">لا توجد أي بنرات في النظام.</p>';
            adminViewContainer.classList.remove('d-none');
            return;
        }

        const groupedByCountry = {};
        banners.forEach(banner => {
            const country = banner.country || 'غير مصنف';
            const city = banner.city || 'غير مصنف';
            if (!groupedByCountry[country]) groupedByCountry[country] = {};
            if (!groupedByCountry[country][city]) groupedByCountry[country][city] = [];
            groupedByCountry[country][city].push(banner);
        });

        let countryIndex = 0;
        for (const countryName in groupedByCountry) {
            const cities = groupedByCountry[countryName];
            const countryId = `country-${countryIndex}`;
            let countryBannersCount = 0; 
            let cityHTML = ''; 

            for (const cityName in cities) {
                const cityBanners = cities[cityName];
                countryBannersCount += cityBanners.length;
                
                cityHTML += `<h5 class="mt-3 mb-2">${cityName} (${cityBanners.length})</h5>`;
                cityHTML += `
                    <div class="table-responsive">
                        <table class="table table-bordered table-sm align-middle">
                            <thead class="table-light">
                                <tr>
                                    <th scope="col">صورة</th>
                                    <th scope="col">العنوان</th>
                                    <th scope="col">الدكتور</th>
                                    <th scope="col">التخصص</th>
                                    <th scope="col">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${cityBanners.map(banner => createAdminBannerRowHTML(banner)).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            }

            adminViewContainer.innerHTML += `
                <div class="accordion-item">
                    <h2 class="accordion-header" id="heading-${countryId}">
                        <button class="accordion-button ${countryIndex > 0 ? 'collapsed' : ''}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${countryId}">
                            ${countryName}
                            <span class="badge bg-primary rounded-pill me-auto ms-2">${countryBannersCount}</span>
                        </button>
                    </h2>
                    <div id="collapse-${countryId}" class="accordion-collapse collapse ${countryIndex === 0 ? 'show' : ''}" data-bs-parent="#admin-group-view">
                        <div class="accordion-body">
                            ${cityHTML}
                        </div>
                    </div>
                </div>
            `;
            countryIndex++;
        }
        adminViewContainer.classList.remove('d-none');
    }

    /**
     * (7) دوال بناء الصفوف (HTML Rows)
     */
    function createAdminBannerRowHTML(banner) {
        const imageUrl = banner.image ? banner.image.url : 'https://via.placeholder.com/100x50';
        const title = banner.title || 'لا يوجد عنوان';
        const doctorName = banner.doctor ? banner.doctor.name : '<em class="text-muted">غير محدد</em>';
        const specName = banner.specialize ? banner.specialize.title : '<em class="text-muted">عام</em>';

        return `
            <tr id="banner-row-${banner._id}">
                <td><img src="${imageUrl}" alt="${title}" style="width: 120px; height: 60px; object-fit: cover;" class="rounded"></td>
                <td>${title}</td>
                <td>${doctorName}</td>
                <td>${specName}</td>
                <td>
                    <a href="/banner/edit?id=${banner._id}" class="btn btn-sm btn-info text-white"><i class="bi bi-pencil-fill"></i></a>
                    <button class="btn btn-sm btn-danger" onclick="deleteBanner('${banner._id}')"><i class="bi bi-trash-fill"></i></button>
                </td>
            </tr>
        `;
    }

    function createDoctorBannerRowHTML(banner) {
        const imageUrl = banner.image ? banner.image.url : 'https://via.placeholder.com/100x50';
        const title = banner.title || 'لا يوجد عنوان';
        const subtitle = banner.subtitle || '<em class="text-muted">-</em>';
        const description = banner.description ? (banner.description.substring(0, 30) + '...') : '<em class="text-muted">-</em>';
        const percentage = banner.percentage ? `<span class="badge bg-success">${banner.percentage}%</span>` : '<em class="text-muted">0%</em>';

        return `
            <tr id="banner-row-${banner._id}">
                <td><img src="${imageUrl}" alt="${title}" style="width: 120px; height: 60px; object-fit: cover;" class="rounded"></td>
                <td>${title}</td>
                <td>${subtitle}</td>
                <td>${description}</td>
                <td>${percentage}</td>
                <td>
                    <a href="/banner/edit?id=${banner._id}" class="btn btn-sm btn-info text-white"><i class="bi bi-pencil-fill"></i></a>
                    <button class="btn btn-sm btn-danger" onclick="deleteBanner('${banner._id}')"><i class="bi bi-trash-fill"></i></button>
                </td>
            </tr>
        `;
    }

    /**
     * (8) دالة بناء أزرار التنقل (Pagination)
     */
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

    /**
     * (9) مستمع لأزرار التنقل
     */
    paginationContainer.addEventListener('click', (event) => {
        event.preventDefault(); 
        const target = event.target.closest('a.page-link'); 
        if (!target) return;
        const page = target.dataset.page;
        if (page) {
            fetchBanners(parseInt(page)); 
        }
    });

    /**
     * (10) دوال الحذف (Modals)
     */
    window.deleteBanner = function(id) {
        idToDelete = id;
        deleteModal.show();
    }
    
    confirmDeleteButton.addEventListener('click', async () => {
        if (!idToDelete) return;
        setLoadingOnDeleteButton(true);

        try {
            const response = await fetch(`${BASE_URL}/bunner/${idToDelete}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.message || 'فشل حذف البنر.');

            showAlert('تم حذف البنر بنجاح.', 'success');
            deleteModal.hide();
            fetchBanners(currentPage); // (إعادة تحميل الصفحة الحالية)
        } catch (error) {
            showAlert(error.message, 'danger', true, deleteModalEl);
        } finally {
            setLoadingOnDeleteButton(false);
            idToDelete = null;
        }
    });

    // (دالة مساعدة للتحكم بالسبينر - تم تصحيحها)
    function setLoadingOnDeleteButton(isLoading) {
        if (isLoading) {
            confirmDeleteButton.disabled = true;
            confirmDeleteSpinner.classList.remove('d-none'); // (الصحيح: d-none)
        } else {
            confirmDeleteButton.disabled = false;
            confirmDeleteSpinner.classList.add('d-none'); // (الصحيح: d-none)
        }
    }
    
    // (دالة مساعدة لإظهار التنبيهات)
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

    // (11. تشغيل الكود)
    fetchBanners(1); // (ابدأ من صفحة 1)
});