document.addEventListener('DOMContentLoaded', () => {

    // (1. "إمساك" العناصر)
    const alertPlaceholder = document.getElementById('alert-placeholder');
    const mainContent = document.querySelector('.main-content');
    const formLoading = document.getElementById('form-loading');
    const editForm = document.getElementById('create-employee-form'); // (ملاحظة: اسم الفورم موروث من create)
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
    
    // (2. جلب بيانات المستخدم + ID الموظف)
    const authToken = localStorage.getItem('authToken');
    const userType = localStorage.getItem('userType');
    const urlParams = new URLSearchParams(window.location.search);
    const employeeId = urlParams.get('id'); // (جلب الـ ID من الرابط)

    let countriesData = []; // (لتخزين بيانات الدول)

    // (3. التحقق الأمني)
    if (userType !== 'admin') {
        // ... (كود التحقق الأمني) ...
        return;
    }
    if (!employeeId) {
        showAlert('خطأ: لم يتم تحديد الموظف.', 'danger');
        mainContent.innerHTML = '';
        return;
    }

    /**
     * (4) دالة لجلب كل البيانات الأولية (موظف + تخصصات + دول)
     */
    async function initializeForm() {
        try {
            // (جلب البيانات في نفس الوقت)
            const [empResponse, specResponse, countryResponse] = await Promise.all([
                fetch(`${BASE_URL}/employee/${employeeId}?populate=specialize`, { headers: { 'Authorization': `Bearer ${authToken}` } }),
                fetch(`${BASE_URL}/specialize?limit=1000`, { headers: { 'Authorization': `Bearer ${authToken}` } }),
                fetch(`${BASE_URL}/country?limit=1000`, { headers: { 'Authorization': `Bearer ${authToken}` } })
            ]);

            if (!empResponse.ok) throw new Error('فشل جلب بيانات الموظف.');
            if (!specResponse.ok) throw new Error('فشل جلب التخصصات.');
            if (!countryResponse.ok) throw new Error('فشل جلب الدول.');

            const empData = await empResponse.json();
            const specData = await specResponse.json();
            const countryData = await countryResponse.json();
            
            const employee = empData.data;

            // (1. ملء التخصصات)
            populateSpecializeDropdown(specData.data, employee.specialize ? employee.specialize._id : '');
            
            // (2. ملء الدول وتخزينها)
            populateCountryDropdown(countryData.data, employee.country);
            
            // (3. ملء المدن (بناءً على الدولة المحفوظة))
            populateCityDropdown(employee.country, employee.city);

            // (4. ملء باقي الفورم)
            fillFormWithEmployeeData(employee);

            // (إظهار الفورم)
            editForm.style.display = 'block';
            formLoading.style.display = 'none';

        } catch (error) {
            showAlert(error.message, 'danger');
            formLoading.innerHTML = `<p class="text-danger">${error.message}</p>`;
        }
    }

    /**
     * (5) دوال مساعدة لملء القوائم المنسدلة والفورم
     */
    function populateSpecializeDropdown(specializations, currentSpecId) {
        specializeSelect.innerHTML = '<option value="">-- اختر التخصص --</option>';
        if (specializations) {
            specializations.forEach(spec => {
                const selected = (spec._id === currentSpecId) ? 'selected' : '';
                specializeSelect.innerHTML += `<option value="${spec._id}" ${selected}>${spec.title}</option>`;
            });
        }
    }

    function populateCountryDropdown(countries, currentCountry) {
        countriesData = countries; 
        countrySelect.innerHTML = '<option value="">-- اختر الدولة --</option>';
        if (countries) {
            countries.forEach(country => {
                const selected = (country.country === currentCountry) ? 'selected' : '';
                countrySelect.innerHTML += `<option value="${country.country}" ${selected}>${country.country}</option>`;
            });
        }
    }

    function populateCityDropdown(selectedCountryName, currentCity) {
        const selectedCountry = countriesData.find(c => c.country === selectedCountryName);
        citySelect.innerHTML = '<option value="">-- اختر المدينة --</option>';
        
        if (selectedCountry && selectedCountry.cities) {
            selectedCountry.cities.forEach(city => {
                const selected = (city === currentCity) ? 'selected' : '';
                citySelect.innerHTML += `<option value="${city}" ${selected}>${city}</option>`;
            });
            citySelect.disabled = false;
        } else {
            citySelect.disabled = true;
        }
    }

    function fillFormWithEmployeeData(emp) {
        typeSelect.value = emp.type;
        nameInput.value = emp.name;
        phoneInput.value = emp.phone;
        addressInput.value = emp.address || '';
        
        // (إظهار حقول الدكتور إذا كان نوعه دكتور)
        if (emp.type === 'doctor') {
            doctorFields.style.display = 'block';
            specializeSelect.required = true;
            descriptionInput.value = emp.description || '';
            locationInput.value = emp.location || '';
            contactsInput.value = (emp.contacts && emp.contacts.length > 0) ? emp.contacts.join('\n') : '';
        }
    }

    /**
     * (6) مستمعات الأحداث (Event Listeners)
     */

    // (عند تغيير النوع -> إظهار/إخفاء حقول الدكتور)
    typeSelect.addEventListener('change', (e) => {
        if (e.target.value === 'doctor') {
            doctorFields.style.display = 'block';
            specializeSelect.required = true;
        } else {
            doctorFields.style.display = 'none';
            specializeSelect.required = false;
        }
    });

    // (عند تغيير الدولة -> تحديث المدن)
    countrySelect.addEventListener('change', (e) => {
        populateCityDropdown(e.target.value, null); // (null = لا يوجد مدينة محددة مسبقاً)
    });

    /**
     * (7) مستمع "إرسال" الفورم (حفظ التعديلات)
     */
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        setLoading(true);

        const body = {
            type: typeSelect.value,
            name: nameInput.value,
            phone: phoneInput.value,
            country: countrySelect.value,
            city: citySelect.value,
        };

        // (إضافة كلمة المرور فقط إذا تم كتابتها)
        if (passwordInput.value) {
            body.password = passwordInput.value;
        }

        if (body.type === 'doctor') {
            body.specialize = specializeSelect.value;
            body.description = descriptionInput.value;
            body.location = locationInput.value;
            body.address = addressInput.value;
            body.contacts = contactsInput.value
                .split('\n')
                .filter(phone => phone.trim() !== '');
        }

        try {
            const response = await fetch(`${BASE_URL}/employee/${employeeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'فشل حفظ التعديلات.');
            }

            showAlert('تم حفظ التعديلات بنجاح!', 'success');
            
            setTimeout(() => {
                window.location.href = '/employees'; // العودة للقائمة
            }, 2000);

        } catch (error) {
            showAlert(error.message, 'danger');
        } finally {
            setLoading(false);
        }
    });

    // --- دوال مساعدة (نسخ) ---
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

    // (8. بدء تحميل بيانات الفورم)
    initializeForm();
});