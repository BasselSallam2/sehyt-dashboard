document.addEventListener('DOMContentLoaded', () => {

    // 1. "إمساك" عناصر الفورم
    const createForm = document.getElementById('create-banner-form');
    const titleInput = document.getElementById('banner-title');
    const subtitleInput = document.getElementById('banner-subtitle');
    const descriptionInput = document.getElementById('banner-description');
    const percentageInput = document.getElementById('banner-percentage');
    const imageInput = document.getElementById('banner-image');
    const imagePreview = document.getElementById('image-preview');
    const saveButton = document.getElementById('save-button');
    const alertPlaceholder = document.getElementById('alert-placeholder');
    const spinner = saveButton.querySelector('.spinner-border');

    // 2. جلب بيانات المستخدم
    const authToken = localStorage.getItem('authToken');
    const userType = localStorage.getItem('userType');

    // ------------------------------------------
    // (3. التحقق الأمني - Security Check)
    // ------------------------------------------
    if (userType !== 'doctor') {
        // إذا كان المستخدم ليس "دكتور" (قد يكون "أدمن" أو غير مسجل)
        // قم بطرده
        showAlert('ليس لديك الصلاحية للوصول لهذه الصفحة.', 'danger');
        saveButton.disabled = true; // تعطيل الزر
        createForm.style.display = 'none'; // إخفاء الفورم
        
        // إعادة توجيهه بعد ثانيتين
        setTimeout(() => {
            window.location.href = '/dashboard'; // العودة للرئيسية
        }, 2000);
        return; // إيقاف تنفيذ باقي الكود
    }

    // 4. كود معاينة الصورة عند اختيارها
    imageInput.addEventListener('change', () => {
        const file = imageInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            imagePreview.src = '';
            imagePreview.style.display = 'none';
        }
    });

    // 5. المستمع الرئيسي لحدث "إرسال" الفورم
    createForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // منع إعادة تحميل الصفحة
        setLoading(true);

        const title = titleInput.value;
        const subtitle = subtitleInput.value;
        const description = descriptionInput.value;
        const percentage = percentageInput.value;
        const imageFile = imageInput.files[0];

        try {
            // --- الخطوة الأولى: رفع الصورة ---
            const formData = new FormData();
            formData.append('file', imageFile);

            const uploadResponse = await fetch(`${BASE_URL}/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${authToken}` },
                body: formData
            });

            if (!uploadResponse.ok) {
                throw new Error('فشل في رفع الصورة.');
            }
            const uploadData = await uploadResponse.json();
            const imageObject = {
                fileId: uploadData.result.public_id,
                url: uploadData.result.secure_url
            };

            // --- الخطوة الثانية: حفظ البنر ---
            // (الـ API سيأخذ (الدكتور، التخصص، الدولة، المدينة) من التوكن)
            const createBannerResponse = await fetch(`${BASE_URL}/bunner`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    title: title,
                    subtitle: subtitle,
                    description: description,
                    percentage: percentage,
                    image: imageObject 
                })
            });

            const createData = await createBannerResponse.json();

            if (!createBannerResponse.ok || !createData.success) {
                throw new Error(createData.message || 'فشل في حفظ البنر.');
            }

            // 6. نجاح!
            showAlert('تم حفظ البنر بنجاح!', 'success');
            
            createForm.reset();
            imagePreview.style.display = 'none';

            // إعادة توجيه المستخدم لصفحة العرض
            setTimeout(() => {
                window.location.href = '/banner';
            }, 2000);

        } catch (error) {
            console.error('Create banner error:', error);
            showAlert(error.message, 'danger');
        } finally {
            setLoading(false);
        }
    });

    // --- دوال مساعدة ---
    function setLoading(isLoading) {
        if (isLoading) {
            saveButton.disabled = true;
            spinner.classList.remove('d_none');
        } else {
            saveButton.disabled = false;
            spinner.classList.add('d_none');
        }
    }

    function showAlert(message, type) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
            <div class="alert alert-${type} alert-dismissible" role="alert">
                <div>${message}</div>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        alertPlaceholder.append(wrapper);
        setTimeout(() => wrapper.remove(), 3000);
    }
});