document.addEventListener('DOMContentLoaded', () => {

    // (1. "إمساك" العناصر)
    const alertPlaceholder = document.getElementById('alert-placeholder');
    const authToken = localStorage.getItem('authToken');
    const userType = localStorage.getItem('userType');

    // (عناصر الأدمن)
    const adminElements = document.querySelectorAll('[data-role="admin"]');
    const statsDoctors = document.getElementById('stats-doctors');
    const statsPatients = document.getElementById('stats-patients');
    const statsTotalReservations = document.getElementById('stats-total-reservations');
    const statsSpecializations = document.getElementById('stats-specializations');

    // (عناصر الدكتور)
    const doctorElements = document.querySelectorAll('[data-role="doctor"]');
    const statsMyReservations = document.getElementById('stats-my-reservations');
    const todayReservationsBody = document.getElementById('today-reservations-body');

    // (جديد: "إمساك" الـ Modal)
    const viewBannerModalEl = document.getElementById('viewBannerModal');
    const viewBannerModal = new bootstrap.Modal(viewBannerModalEl);

    /**
     * (جديد) دالة لفتح الـ Modal وملء بيانات البانر
     */
    window.showBannerDetails = function(bannerJson) {
        try {
            // (استخدام unescape() لفك تشفير النص القادم من onclick)
            const banner = JSON.parse(unescape(bannerJson));

            // (ملء عناصر الـ Modal)
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

            // (إظهار الـ Modal)
            viewBannerModal.show();
            
        } catch (e) {
            console.error("Failed to parse banner JSON:", e);
            showAlert('حدث خطأ أثناء عرض تفاصيل البانر.', 'danger');
        }
    }

    /**
     * (دالة مساعدة لإصلاح مشكلة التوقيت (Timezone))
     */
    function toLocalISOString(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * (2) التحقق من الصلاحية وتحديد ما سيتم عرضه
     */
    if (!authToken) return; // (main.js سيتولى الطرد)

    if (userType === 'admin') {
        // (إظهار عناصر الأدمن)
        adminElements.forEach(el => {
            if(el) el.style.display = 'block';
        });
        // (جلب إحصائيات الأدمن)
        fetchAdminStatistics();
    } else if (userType === 'doctor') {
        // (إظهار عناصر الدكتور)
        doctorElements.forEach(el => {
            if(el) el.style.display = 'block';
        });
        // (جلب إحصائيات الدكتور)
        fetchDoctorStatistics();
        fetchTodayReservations();
    }

    /**
     * (3) دوال جلب البيانات
     */

    // (أ. دالة الأدمن)
    async function fetchAdminStatistics() {
        try {
            const response = await fetch(`${BASE_URL}/statistics`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (!response.ok) throw new Error('فشل جلب إحصائيات الأدمن.');
            
            const data = await response.json();
            if (statsDoctors) statsDoctors.textContent = data.doctorsCount || 0;
            if (statsPatients) statsPatients.textContent = data.patientsCount || 0;
            if (statsTotalReservations) statsTotalReservations.textContent = data.reservationsCount || 0;
            if (statsSpecializations) statsSpecializations.textContent = data.specializesCount || 0;

        } catch (error) {
            console.error('Fetch Admin Stats Error:', error);
            showAlert(error.message, 'danger');
        }
    }

    // (ب. دالة الدكتور - الكارت)
    async function fetchDoctorStatistics() {
        try {
            const response = await fetch(`${BASE_URL}/statistics/myReservations`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (!response.ok) throw new Error('فشل جلب إحصائيات الدكتور.');

            const data = await response.json();
            if (statsMyReservations) statsMyReservations.textContent = data.reservationsCount || 0;

        } catch (error) {
            console.error('Fetch Doctor Stats Error:', error);
            showAlert(error.message, 'danger');
        }
    }

    // (ج. دالة الدكتور - جدول اليوم - مُصححة)
    async function fetchTodayReservations() {
        if (!todayReservationsBody) return; // (حماية إذا كان العنصر غير موجود)
        todayReservationsBody.innerHTML = `<tr><td colspan="4" class="text-center"><div class="spinner-border spinner-border-sm" role="status"></div></td></tr>`;
        
        // --- (هذا هو الكود المُصحح) ---
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1); 

        const dateGte = toLocalISOString(today);
        const dateLte = toLocalISOString(tomorrow); 
        // --- (نهاية الكود المُصحح) ---

        const populateQuery = encodeURIComponent(JSON.stringify([
            {"path":"patient"}, 
            {"path":"bunner"} 
        ]));

        const url = `${BASE_URL}/slot/doctor/myReservations?populate=${populateQuery}&date[gte]=${dateGte}&date[lte]=${dateLte}&limit=100`;

        try {
            const response = await fetch(url, { headers: { 'Authorization': `Bearer ${authToken}` } });
            if (!response.ok) throw new Error('فشل جلب حجوزات اليوم.');

            const data = await response.json();
            todayReservationsBody.innerHTML = ''; 

            if (data.success && data.data && data.data.length > 0) {
                data.data.forEach(slot => {
                    const patientName = (slot.patient && slot.patient.name) ? slot.patient.name : 'مريض غير مسجل';
                    const patientPhone = (slot.patient && slot.patient.phone) ? slot.patient.phone : '-';
                    const time = `من ${slot.from} إلى ${slot.to}`;
                    
                    let bannerInfo = '<span class="text-muted">لا</span>';
                    if (slot.bunner && slot.bunner.title) {
                        const bannerJson = escape(JSON.stringify(slot.bunner));
                        bannerInfo = `<button class="btn btn-success btn-sm" onclick='showBannerDetails("${bannerJson}")'>
                                          <i class="bi bi-eye-fill me-1"></i> عرض البانر
                                      </button>`;
                    }

                    todayReservationsBody.innerHTML += `
                        <tr>
                            <td>${patientName}</td>
                            <td>${patientPhone}</td>
                            <td>${time}</td>
                            <td>${bannerInfo}</td>
                        </tr>
                    `;
                });
            } else {
                todayReservationsBody.innerHTML = `<tr><td colspan="4" class="text-center">لا توجد حجوزات لهذا اليوم.</td></tr>`;
            }

        } catch (error) {
            console.error('Fetch Today Reservations Error:', error);
            todayReservationsBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">${error.message}</td></tr>`;
        }
    }

    // (دالة مساعدة لإظهار التنبيهات)
    function showAlert(message, type) {
        if (!alertPlaceholder) return;
        const wrapper = document.createElement("div");
        wrapper.innerHTML = `<div class="alert alert-${type} alert-dismissible" role="alert"><div>${message}</div><button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`;
        alertPlaceholder.append(wrapper);
        setTimeout(() => wrapper.remove(), 3000);
    }
    
    // (5. بدء تشغيل الصفحة)
    // (لا نستدعي أي شيء هنا، الكود في خطوة (2) هو الذي يقرر)
});