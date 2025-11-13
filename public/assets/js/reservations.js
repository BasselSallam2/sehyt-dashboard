document.addEventListener('DOMContentLoaded', () => {

    // (1. "إمساك" العناصر)
    const alertPlaceholder = document.getElementById('alert-placeholder');
    const mainContent = document.querySelector('.main-content');
    const tableBody = document.getElementById('reservations-table-body');
    const paginationContainer = document.getElementById('pagination-container');
    const filterForm = document.getElementById('filter-form');
    
    // ("إمساك" الـ Modal)
    const viewBannerModalEl = document.getElementById('viewBannerModal');
    const viewBannerModal = new bootstrap.Modal(viewBannerModalEl);

    // (2. بيانات المستخدم)
    const authToken = localStorage.getItem('authToken');
    const userType = localStorage.getItem('userType');
    let currentPage = 1;
    const limitPerPage = 10; // (تحديد الحد)

    // (3. التحقق الأمني - دكتور فقط)
    if (userType !== 'doctor') {
        showAlert('هذه الصفحة متاحة للأطباء فقط.', 'danger');
        mainContent.innerHTML = ''; 
        return;
    }
    
    /**
     * (دالة لفتح الـ Modal وملء بيانات البانر)
     */
    window.showBannerDetails = function(bannerJson) {
        try {
            const banner = JSON.parse(unescape(bannerJson));

            const img = document.getElementById('banner-modal-image');
            const title = document.getElementById('banner-modal-title');
            const subtitle = document.getElementById('banner-modal-subtitle');
            const percentage = document.getElementById('banner-modal-percentage');

            img.src = banner.image ? banner.image.url : 'https://via.placeholder.com/400x200';
            title.textContent = banner.title || 'لا يوجد عنوان';
            subtitle.textContent = banner.subtitle || '';
            
            if (banner.percentage && banner.percentage > 0) {
                percentage.textContent = `خصم ${banner.percentage}%`;
                percentage.style.display = 'inline-block';
            } else {
                percentage.style.display = 'none';
            }
            viewBannerModal.show();
        } catch (e) {
            console.error("Failed to parse banner JSON:", e);
            showAlert('حدث خطأ أثناء عرض تفاصيل البانر.', 'danger');
        }
    }


    /**
     * (4) دالة جلب وعرض الحجوزات (محدثة)
     */
    async function fetchReservations(page = 1) {
        currentPage = page;
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center"><div class="spinner-border text-primary" role="status"></div></td></tr>`;

        // --- (هذا هو الكود المُصحح) ---
        // (1. إزالة encodeURIComponent)
        const populateQuery = JSON.stringify([
            {"path":"patient"},
            {"path":"bunner"} 
        ]);

       
        
        // (2. إضافة page و limit)
        const params = new URLSearchParams({
            populate: populateQuery,
            page: page,
            limit: limitPerPage,
            sort: '-date'
        });
        
        // (إضافة الفلاتر)
        const filterNameInput = document.getElementById('filter-name');
        const filterPhoneInput = document.getElementById('filter-phone');
        const filterName = filterNameInput ? filterNameInput.value : '';
        const filterPhone = filterPhoneInput ? filterPhoneInput.value : '';

        // (نفترض أن الـ API لا يدعم هذه الفلاتر حالياً، لذلك سنقوم بالفلترة يدوياً)
        // if (filterName) params.append('patientName', filterName); 
        // if (filterPhone) params.append('patientPhone', filterPhone);
        // --- (نهاية الإصلاح) ---

        const url = `${BASE_URL}/slot/doctor/myReservations?${params.toString()}`;

        try {
            const response = await fetch(url, { headers: { 'Authorization': `Bearer ${authToken}` } });
            if (!response.ok) throw new Error('فشل جلب الحجوزات.');
            
            const data = await response.json();
            console.log(data); // (للتأكيد - يجب أن ترى "patient" كـ object)
            tableBody.innerHTML = ''; // تفريغ
            
            // (تطبيق الفلترة يدوياً)
            let filteredData = data.data;
            if (filterName) {
                filteredData = filteredData.filter(slot => 
                    slot.patient && slot.patient.name && slot.patient.name.includes(filterName)
                );
            }
            if (filterPhone) {
                filteredData = filteredData.filter(slot =>
                    slot.patient && slot.patient.phone && slot.patient.phone.includes(filterPhone)
                );
            }

            if (data.success && filteredData && filteredData.length > 0) {
                filteredData.forEach(slot => {
                    // (هذا الكود سيعمل الآن)
                    const patientName = (slot.patient && slot.patient.name) ? slot.patient.name : '<em class="text-muted">مريض محذوف</em>';
                    const patientPhone = (slot.patient && slot.patient.phone) ? slot.patient.phone : '-';
                    const date = new Date(slot.date).toLocaleDateString('ar-EG');
                    
                    let bannerInfo = '<span class="text-muted">لا</span>';
                    if (slot.bunner && slot.bunner.title) {
                        const bannerJson = escape(JSON.stringify(slot.bunner));
                        bannerInfo = `<button class="btn btn-success btn-sm" onclick='showBannerDetails("${bannerJson}")'>
                                          <i class="bi bi-eye-fill me-1"></i> عرض البانر
                                      </button>`;
                    }

                    tableBody.innerHTML += `
                        <tr>
                            <td>${patientName}</td>
                            <td>${patientPhone}</td>
                            <td>${date}</td>
                            <td>من ${slot.from} إلى ${slot.to}</td>
                            <td>${bannerInfo}</td>
                        </tr>
                    `;
                });
                renderPagination(data.pagination);
            } else {
                tableBody.innerHTML = `<tr><td colspan="5" class="text-center">لا توجد حجوزات تطابق البحث.</td></tr>`;
                paginationContainer.innerHTML = '';
            }
        } catch (error) {
            showAlert(error.message, 'danger');
            tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">${error.message}</td></tr>`;
        }
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
    
    paginationContainer.addEventListener('click', (e) => {
        e.preventDefault();
        const page = e.target.dataset.page;
        if (page) fetchReservations(parseInt(page));
    });

    if (filterForm) {
        filterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // (البحث سيتم يدوياً بعد جلب الصفحة الأولى)
            fetchReservations(1); 
        });
    }

    // (دالة التنبيهات)
    function showAlert(message, type) {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = `<div class="alert alert-${type} alert-dismissible" role="alert"><div>${message}</div><button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`;
        alertPlaceholder.append(wrapper);
        setTimeout(() => wrapper.remove(), 3000);
    }

    // (5. بدء تشغيل الصفحة)
    fetchReservations(1);
});