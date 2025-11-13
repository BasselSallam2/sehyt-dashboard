document.addEventListener('DOMContentLoaded', () => {

    // (1. "إمساك" كل العناصر)
    const profileLoading = document.getElementById('profile-loading');
    const profileViewContainer = document.getElementById('profile-view-container');
    const alertPlaceholder = document.getElementById('alert-placeholder');

    // (عناصر العرض "View")
    const viewAvatar = document.getElementById('view-avatar');
    const viewName = document.getElementById('view-name');
    const viewType = document.getElementById('view-type');
    const viewPhone = document.getElementById('view-phone');
    const viewCountry = document.getElementById('view-country');
    const viewCity = document.getElementById('view-city');
    const viewAddress = document.getElementById('view-address');
    
    // (عناصر عرض الدكتور)
    const doctorCard = document.querySelector('[data-role="doctor"]');
    const viewDescription = document.getElementById('view-description');
    const viewSpecialize = document.getElementById('view-specialize');
    const viewLocation = document.getElementById('view-location');
    const viewContacts = document.getElementById('view-contacts');

    // (عناصر الفورمات والنوافذ)
    const basicInfoForm = document.getElementById('basic-info-form');
    const contactForm = document.getElementById('contact-form');
    const doctorForm = document.getElementById('doctor-form');
    const passwordForm = document.getElementById('password-form');
    
    // (عناصر الإدخال)
    const imageInput = document.getElementById('profile-image');
    const nameInput = document.getElementById('profile-name');
    const phoneInput = document.getElementById('profile-phone');
    const countryInput = document.getElementById('profile-country');
    const cityInput = document.getElementById('profile-city');
    const addressInput = document.getElementById('profile-address');
    const descriptionInput = document.getElementById('profile-description');
    const specializeSelect = document.getElementById('profile-specialize');
    const locationInput = document.getElementById('profile-location');
    const contactsInput = document.getElementById('profile-contacts');
    const passwordInput = document.getElementById('profile-password');
    const passwordConfirmInput = document.getElementById('profile-password-confirm');

    // (متغيرات عامة)
    const authToken = localStorage.getItem('authToken');
    const userType = localStorage.getItem('userType');
    let currentUserId = null;
    let existingImageObject = null;
    let allModals = {}; // (لتخزين النوافذ لسهولة الإغلاق)
    ['basicInfoModal', 'contactModal', 'doctorModal', 'passwordModal'].forEach(id => {
        allModals[id] = new bootstrap.Modal(document.getElementById(id));
    });

    /**
     * (2) دالة جلب البيانات الرئيسية (Me + Specializations)
     */
    async function initializeProfile() {
        try {
            // (جلب "ME" و "Specializations" في نفس الوقت)
            const [meResponse, specResponse] = await Promise.all([
                fetch(`${BASE_URL}/employee/auth/me`, { headers: { 'Authorization': `Bearer ${authToken}` } }),
                fetch(`${BASE_URL}/specialize`, { headers: { 'Authorization': `Bearer ${authToken}` } })
            ]);

            if (!meResponse.ok) throw new Error('فشل جلب بيانات الملف الشخصي.');
            
            const meData = await meResponse.json();
            const me = meData.data;

            // (تخزين الـ ID)
            currentUserId = me._id;

            // (ملء قائمة التخصصات أولاً - إذا كان دكتور)
            if (userType === 'doctor' && specResponse.ok) {
                const specData = await specResponse.json();
                populateSpecializeDropdown(specData.data, me.specialize ? me.specialize._id : '');
            }

            // (ملء بيانات العرض "View")
            populateViewData(me);
            
            // (ملء بيانات الفورم "Inputs" في النوافذ)
            populateModalForms(me);

            // (إظهار/إخفاء الكروت بناءً على النوع)
            if (userType === 'doctor') {
                doctorCard.style.display = 'block';
            }

            // (إظهار المحتوى وإخفاء التحميل)
            profileViewContainer.style.display = 'block';
            profileLoading.style.display = 'none';

        } catch (error) {
            console.error('Fetch Profile Error:', error);
            showAlert(error.message, 'danger');
            profileLoading.innerHTML = `<p class="text-center text-danger">${error.message}</p>`;
        }
    }

    /**
     * (3) دوال مساعدة لملء البيانات
     */
    function populateViewData(me) {
        viewAvatar.src = (me.avatar && me.avatar.url) ? me.avatar.url : 'https://via.placeholder.com/150';
        viewName.textContent = me.name || 'لا يوجد اسم';
        viewType.textContent = me.type === 'doctor' ? '🩺 دكتور' : '👤 إداري';
        viewPhone.textContent = me.phone || '-';
        viewCountry.textContent = me.country || '-';
        viewCity.textContent = me.city || '-';
        viewAddress.textContent = me.address || '-';
        
        // (بيانات الدكتور)
        if (userType === 'doctor') {
            viewDescription.textContent = me.description || 'لا يوجد وصف.';
            viewSpecialize.textContent = (me.specialize && me.specialize.title) ? me.specialize.title : '-';
            
            if(me.location) {
                viewLocation.href = me.location;
                viewLocation.textContent = 'فتح الرابط';
            } else {
                viewLocation.textContent = '-';
            }

            viewContacts.innerHTML = ''; // تفريغ
            if (me.contacts && me.contacts.length > 0) {
                me.contacts.forEach(contact => {
                    viewContacts.innerHTML += `<span class="badge bg-secondary me-1">${contact}</span>`;
                });
            } else {
                viewContacts.innerHTML = 'لا توجد أرقام إضافية.';
            }
        }
    }

    function populateModalForms(me) {
        // (تخزين الصورة)
        existingImageObject = me.avatar;
        
        // (فورم 1: الأساسي)
        nameInput.value = me.name || '';
        
        // (فورم 2: التواصل)
        phoneInput.value = me.phone || '';
        countryInput.value = me.country || '';
        cityInput.value = me.city || '';
        addressInput.value = me.address || '';

        // (فورم 3: الدكتور)
        if (userType === 'doctor') {
            descriptionInput.value = me.description || '';
            locationInput.value = me.location || '';
            // (تحويل المصفوفة إلى نص)
            contactsInput.value = (me.contacts && me.contacts.length > 0) ? me.contacts.join('\n') : '';
        }
    }

    function populateSpecializeDropdown(specializations, currentSpecId) {
        specializeSelect.innerHTML = '<option value="">-- اختر التخصص --</option>'; // تفريغ
        specializations.forEach(spec => {
            const selected = (spec._id === currentSpecId) ? 'selected' : '';
            specializeSelect.innerHTML += `<option value="${spec._id}" ${selected}>${spec.title}</option>`;
        });
    }

    /**
     * (4) دوال حفظ التعديلات (لكل فورم)
     */
    
    // (حفظ البيانات الأساسية)
    basicInfoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const button = e.target.querySelector('.save-button');
        setLoading(button, true);

        try {
            let imageObjectToSave = existingImageObject;
            // (هل تم رفع صورة جديدة؟)
            if (imageInput.files[0]) {
                imageObjectToSave = await uploadImage(imageInput.files[0]);
            }
            
            // (تجهيز البيانات)
            const updateBody = {
                name: nameInput.value,
                avatar: imageObjectToSave
            };
            
            await updateMyData(updateBody, button, allModals.basicInfoModal);

        } catch (error) {
            showAlert(error.message, 'danger', true);
            setLoading(button, false);
        }
    });

    // (حفظ بيانات التواصل)
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const button = e.target.querySelector('.save-button');
        setLoading(button, true);

        const updateBody = {
            phone: phoneInput.value,
            country: countryInput.value,
            city: cityInput.value,
            address: addressInput.value
        };
        await updateMyData(updateBody, button, allModals.contactModal);
    });

    // (حفظ بيانات الدكتور)
    doctorForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const button = e.target.querySelector('.save-button');
        setLoading(button, true);

        // (تحويل النص إلى مصفوفة)
        const contactsArray = contactsInput.value
            .split('\n')
            .filter(phone => phone.trim() !== ''); // (إزالة الأسطر الفارغة)

        const updateBody = {
            description: descriptionInput.value,
            specialize: specializeSelect.value,
            location: locationInput.value,
            contacts: contactsArray
        };
        await updateMyData(updateBody, button, allModals.doctorModal);
    });

    // (حفظ كلمة المرور)
    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const button = e.target.querySelector('.save-button');
        
        if (passwordInput.value !== passwordConfirmInput.value) {
            showAlert('كلمتا المرور غير متطابقتين.', 'danger', true);
            return;
        }
        
        setLoading(button, true);
        const updateBody = { password: passwordInput.value };
        await updateMyData(updateBody, button, allModals.passwordModal);
        passwordForm.reset(); // (تفريغ حقول كلمة المرور بعد الحفظ)
    });

    /**
     * (5) دوال مساعدة عامة
     */

    // (دالة الرفع)
    async function uploadImage(imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        const response = await fetch(`${BASE_URL}/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` },
            body: formData
        });
        if (!response.ok) throw new Error('فشل في رفع الصورة.');
        const data = await response.json();
        return {
            fileId: data.result.public_id,
            url: data.result.secure_url
        };
    }

    // (دالة التحديث)
    async function updateMyData(body, button, modalInstance) {
        try {
            const response = await fetch(`${BASE_URL}/employee/${currentUserId}`, {
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
            modalInstance.hide(); // (إغلاق الـ Modal)
            
            // (إعادة تحميل كل البيانات في الصفحة لتحديث العرض)
            await initializeProfile(); 

        } catch (error) {
            showAlert(error.message, 'danger', true); // (true = اعرضها داخل الـ modal)
        } finally {
            setLoading(button, false);
        }
    }

    // (دالة التحميل)
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

    // (دالة التنبيهات)
    function showAlert(message, type, insideModal = false) {
        // (إذا كان (true)، اعرض التنبيه داخل الـ modal النشط حالياً)
        const targetAlertPlaceholder = insideModal ? 
            document.querySelector('.modal.show .modal-body') : 
            alertPlaceholder;
        
        if (!targetAlertPlaceholder) return; // (حماية)

        const wrapper = document.createElement('div');
        wrapper.innerHTML = `<div class="alert alert-${type} alert-dismissible" role="alert"><div>${message}</div><button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`;
        
        // (إضافة التنبيه)
        if (insideModal) {
            targetAlertPlaceholder.prepend(wrapper);
        } else {
            alertPlaceholder.append(wrapper);
        }
        
        setTimeout(() => wrapper.remove(), 3000);
    }

    // (6. بدء تشغيل الصفحة)
    initializeProfile();
});