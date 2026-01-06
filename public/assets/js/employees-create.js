document.addEventListener('DOMContentLoaded', () => {

    // (1. "إمساك" العناصر)
    const alertPlaceholder = document.getElementById('alert-placeholder');
    const mainContent = document.querySelector('.main-content');
    const formLoading = document.getElementById('form-loading');
    const createForm = document.getElementById('create-employee-form');
    const saveButton = document.getElementById('save-button');
    const spinner = saveButton.querySelector('.spinner-border');

    // (عناصر الفورم)
    const typeSelect = document.getElementById('emp-type');
    const nameInput = document.getElementById('emp-name');
    const phoneInput = document.getElementById('emp-phone');
    const passwordInput = document.getElementById('emp-password');
    const countrySelect = document.getElementById('emp-country');
    const citySelect = document.getElementById('emp-city');
    const addressInput = document.getElementById('emp-address');
    
    // (عناصر الدكتور)
    const doctorFields = document.getElementById('doctor-fields');
    const specializeSelect = document.getElementById('emp-specialize');
    const descriptionInput = document.getElementById('emp-description');
    const locationInput = document.getElementById('emp-location');
    const contactsInput = document.getElementById('emp-contacts');
    
    // (2. جلب بيانات المستخدم)
    const authToken = localStorage.getItem('authToken');
    const userType = localStorage.getItem('userType');
    
    // (متغير لتخزين بيانات الدول والمدن)
    let countriesData = [];

    // (3. التحقق الأمني)
    if (userType !== 'admin') {
        showAlert('ليس لديك الصلاحية للوصول لهذه الصفحة.', 'danger');
        mainContent.innerHTML = ''; 
        setTimeout(() => { window.location.href = '/dashboard'; }, 2000);
        return;
    }

    /**
     * (4) دالة لجلب البيانات الأولية (التخصصات والدول)
     */
    async function initializeForm() {
        try {
            // (جلب البيانات في نفس الوقت)
            const [specResponse, countryResponse] = await Promise.all([
                fetch(`${BASE_URL}/specialize?limit=1000`, { headers: { 'Authorization': `Bearer ${authToken}` } }),
                fetch(`${BASE_URL}/country?limit=1000`, { headers: { 'Authorization': `Bearer ${authToken}` } })
            ]);

            if (!specResponse.ok) throw new Error('فشل جلب التخصصات.');
            if (!countryResponse.ok) throw new Error('فشل جلب الدول.');

            const specData = await specResponse.json();
            const countryData = await countryResponse.json();

            // (ملء التخصصات)
            populateSpecializeDropdown(specData.data);
            
            // (ملء الدول وتخزين البيانات)
            populateCountryDropdown(countryData.data);

            // (إظهار الفورم)
            createForm.style.display = 'block';
            formLoading.style.display = 'none';

        } catch (error) {
            showAlert(error.message, 'danger');
            formLoading.innerHTML = `<p class="text-danger">${error.message}</p>`;
        }
    }

    function populateSpecializeDropdown(specializations) {
        specializeSelect.innerHTML = '<option value="">-- اختر التخصص --</option>';
        if (specializations) {
            specializations.forEach(spec => {
                specializeSelect.innerHTML += `<option value="${spec._id}">${spec.title}</option>`;
            });
        }
    }

    function populateCountryDropdown(countries) {
        countriesData = countries; // (تخزين البيانات لاستخدامها لاحقاً)
        countrySelect.innerHTML = '<option value="">-- اختر الدولة --</option>';
        if (countries) {
            countries.forEach(country => {
                // (استخدام "اسم" الدولة كقيمة)
                countrySelect.innerHTML += `<option value="${country.country}">${country.country}</option>`;
            });
        }
    }

    /**
     * (5) مستمعات الأحداث (Event Listeners)
     */

    // (المستمع الأول: عند تغيير نوع الموظف)
    typeSelect.addEventListener('change', (e) => {
        if (e.target.value === 'doctor') {
            doctorFields.style.display = 'block';
            // (جعل التخصص إجبارياً)
            specializeSelect.required = true;
        } else {
            doctorFields.style.display = 'none';
            specializeSelect.required = false;
        }
    });

    // (المستمع الثاني: عند تغيير الدولة -> تحديث المدن)
    countrySelect.addEventListener('change', (e) => {
        const selectedCountryName = e.target.value;
        const selectedCountry = countriesData.find(c => c.country === selectedCountryName);

        citySelect.innerHTML = '<option value="">-- اختر المدينة --</option>'; // (تفريغ)

        if (selectedCountry && selectedCountry.cities) {
            selectedCountry.cities.forEach(city => {
                citySelect.innerHTML += `<option value="${city}">${city}</option>`;
            });
            citySelect.disabled = false; // (تفعيل قائمة المدن)
        } else {
            citySelect.disabled = true; // (تعطيلها إذا لم توجد مدن)
        }
    });

    /**
     * (6) مستمع "إرسال" الفورم (حفظ الموظف)
     */
    createForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        setLoading(true);

        // (تجهيز "الجسم" الأساسي للـ API)
        const body = {
            type: typeSelect.value,
            name: nameInput.value,
            phone: phoneInput.value,
            password: passwordInput.value,
            country: countrySelect.value,
            city: citySelect.value,
        };

        // (إضافة حقول الدكتور "فقط" إذا كان النوع "دكتور")
        if (body.type === 'doctor') {
            body.specialize = specializeSelect.value;
            body.description = descriptionInput.value;
            body.location = locationInput.value;
            body.address = addressInput.value;
            // (تحويل حقل أرقام التواصل إلى مصفوفة)
            body.contacts = contactsInput.value
                .split('\n')
                .filter(phone => phone.trim() !== '');
        }

        try {
            const response = await fetch(`${BASE_URL}/employee`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                // (عرض رسالة الخطأ من الـ API مباشرة)
                throw new Error(data.message || 'فشل في حفظ الموظف.');
            }

            // (نجاح!)
            showAlert('تم إنشاء الموظف بنجاح!', 'success');
            createForm.reset(); // (تفريغ الفورم)
            doctorFields.style.display = 'none'; // (إخفاء حقول الدكتور)
            citySelect.disabled = true; // (إعادة تعطيل المدن)

            // (العودة لصفحة العرض)
            setTimeout(() => {
                window.location.href = '/employees';
            }, 2000);

        } catch (error) {
            showAlert(error.message, 'danger');
        } finally {
            setLoading(false);
        }
    });

    // --- دوال مساعدة ---
    function setLoading(isLoading) {
        if (isLoading) {
            saveButton.disabled = true;
            spinner.classList.remove('d-none');
        } else {
            saveButton.disabled = false;
            spinner.classList.add('d-none');
        }
    }

    function showAlert(message, type) {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = `<div class="alert alert-${type} alert-dismissible" role="alert"><div>${message}</div><button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`;
        alertPlaceholder.append(wrapper);
        setTimeout(() => wrapper.remove(), 3000);
    }

    // (7. بدء تحميل بيانات الفورم)
    initializeForm();
});