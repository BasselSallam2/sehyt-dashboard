// ننتظر حتى يتم تحميل الصفحة بالكامل
document.addEventListener('DOMContentLoaded', () => {

    // 1. "إمساك" عناصر الفورم
    const createForm = document.getElementById('create-spec-form');
    const titleInput = document.getElementById('spec-title');
    const imageInput = document.getElementById('spec-image');
    const imagePreview = document.getElementById('image-preview');
    const saveButton = document.getElementById('save-button');
    const alertPlaceholder = document.getElementById('alert-placeholder');
    const spinner = saveButton.querySelector('.spinner-border');

    // جلب التوكن
    const authToken = localStorage.getItem('authToken');

    // 2. (اختياري) كود لمعاينة الصورة عند اختيارها
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

    // 3. المستمع الرئيسي لحدث "إرسال" الفورم
    createForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // منع إعادة تحميل الصفحة

        // التحقق من أن التوكن موجود (حماية إضافية)
        if (!authToken) {
            showAlert('انتهت صلاحية الجلسة. قم بتسجيل الدخول مرة أخرى.', 'danger');
            setTimeout(handleLogout, 2000); // (handleLogout من main.js)
            return;
        }

        // 4. تفعيل حالة التحميل
        setLoading(true);

        const title = titleInput.value;
        const imageFile = imageInput.files[0];

        try {
            // --- الخطوة الأولى: رفع الصورة ---
            // نحتاج إلى استخدام FormData لإرسال الملفات
            const formData = new FormData();
            formData.append('file', imageFile);

            const uploadResponse = await fetch(`${BASE_URL}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                    // (لا نضع 'Content-Type'، المتصفح سيحددها تلقائياً مع FormData)
                },
                body: formData
            });

            if (!uploadResponse.ok) {
                throw new Error('فشل في رفع الصورة. تأكد أن حجمها مناسب.');
            }

            const uploadData = await uploadResponse.json();
            
            // من ملف Postman، يبدو أن الرد يحتوي على "result"
            // ومن داخل "result" نحتاج "public_id" (fileId) و "secure_url" (url)
            // (تعديل: ملف Postman أظهر أن الرد هو uploadData.result.public_id و uploadData.result.secure_url)
            // (تعديل 2: ملف Postman في bunners/create One أظهر أنك تحتاج {fileId, url})
            // سنستخدم الـ API Response الذي أرسلته لي:
            const imageObject = {
                fileId: uploadData.result.public_id,
                url: uploadData.result.secure_url
            };

            // --- الخطوة الثانية: حفظ التخصص ---
            const createSpecResponse = await fetch(`${BASE_URL}/specialize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    title: title,
                    image: imageObject // إرسال الأوبجكت كما يتوقعه الـ API
                })
            });

            const createData = await createSpecResponse.json();

            if (!createSpecResponse.ok || !createData.success) {
                throw new Error(createData.message || 'فشل في حفظ التخصص.');
            }

            // 5. نجاح!
            showAlert('تم حفظ التخصص بنجاح!', 'success');
            
            // تفريغ الفورم
            createForm.reset();
            imagePreview.style.display = 'none';

            // إعادة توجيه المستخدم لصفحة العرض بعد ثانيتين
            setTimeout(() => {
                window.location.href = '/specializations';
            }, 2000);


        } catch (error) {
            // 6. التعامل مع الأخطاء
            console.error('Create specialization error:', error);
            showAlert(error.message, 'danger');
        } finally {
            // 7. إيقاف حالة التحميل (سواء نجح أو فشل)
            setLoading(false);
        }
    });

    /**
     * دالة للتحكم في حالة التحميل (الزر والسبينر)
     */
    function setLoading(isLoading) {
        if (isLoading) {
            saveButton.disabled = true;
            spinner.classList.remove('d-none');
        } else {
            saveButton.disabled = false;
            spinner.classList.add('d-none');
        }
    }

    /**
     * دالة لإظهار تنبيه (للنجاح أو الخطأ)
     */
    function showAlert(message, type) {
        // (يمكنك نسخ هذه الدالة من ملف specializations.js أو كتابتها مجدداً)
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
            <div class="alert alert-${type} alert-dismissible" role="alert">
                <div>${message}</div>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        alertPlaceholder.append(wrapper);
        // إخفاء التنبيه بعد 3 ثواني
        setTimeout(() => {
            wrapper.remove();
        }, 3000);
    }
});