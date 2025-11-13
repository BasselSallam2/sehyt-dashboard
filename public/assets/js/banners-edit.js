// (ملف: assets/js/banners-edit.js)

// متغيرات عامة
let bannerId = null;
let existingImageObject = null;
let authToken = null;

// "إمساك" عناصر الفورم
const editForm = document.getElementById('edit-banner-form'); // (تأكد أن ID الفورم في HTML هو edit-banner-form)
const titleInput = document.getElementById('banner-title');
const subtitleInput = document.getElementById('banner-subtitle');
const descriptionInput = document.getElementById('banner-description');
const percentageInput = document.getElementById('banner-percentage');
const imageInput = document.getElementById('banner-image');
const imagePreview = document.getElementById('image-preview');
const saveButton = document.getElementById('save-button');
const alertPlaceholder = document.getElementById('alert-placeholder');
const spinner = saveButton.querySelector('.spinner-border');

// 1. ننتظر تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    authToken = localStorage.getItem('authToken');
    const userType = localStorage.getItem('userType');

    // (التحقق الأمني: يجب أن يكون مسجلاً)
    if (!authToken) {
        window.location.href = '/banner';
        return;
    }
    
    // (ملاحظة: لا نحتاج للتحقق من النوع، لأن الأدمن والدكتور كلاهما يستطيع التعديل)

    // 2. جلب الـ ID من الـ URL
    const urlParams = new URLSearchParams(window.location.search);
    bannerId = urlParams.get('id');

    if (!bannerId) {
        showAlert('خطأ: لا يوجد ID للبنر.', 'danger');
        return;
    }

    // 3. جلب البيانات لملء الفورم
    fetchAndFillData();

    // 4. مستمع لمعاينة الصورة الجديدة
    imageInput.addEventListener('change', () => {
        const file = imageInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => { imagePreview.src = e.target.result; };
            reader.readAsDataURL(file);
        } else {
            imagePreview.src = existingImageObject ? existingImageObject.url : '';
        }
    });

    // 5. مستمع لحفظ التعديلات
    editForm.addEventListener('submit', handleFormSubmit);
});

/**
 * دالة لجلب البيانات القديمة وملء الفورم
 */
// (داخل دالة fetchAndFillData في banners-edit.js)

async function fetchAndFillData() {
    try {
        // --- (هذا هو الكود الصحيح) ---
        // (نستخدم الـ Endpoint المخصص لجلب عنصر واحد)
        const response = await fetch(`${BASE_URL}/bunner/${bannerId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!response.ok) {
            throw new Error('فشل في جلب بيانات البنر.');
        }

        const data = await response.json();
        
        // (افترض أن الرد يأتي مباشرة في data.data)
        if (!data.success || !data.data) {
             throw new Error('البنر غير موجود أو لا يمكن الوصول إليه.');
        }
        
        const banner = data.data;
        // --- (نهاية الكود الصحيح) ---

        // 6. ملء الفورم (Prefill)
        titleInput.value = banner.title || '';
        subtitleInput.value = banner.subtitle || '';
        descriptionInput.value = banner.description || '';
        percentageInput.value = banner.percentage || 0;
        
        if (banner.image) {
            existingImageObject = banner.image;
            imagePreview.src = banner.image.url;
            imagePreview.style.display = 'block';
        }

    } catch (error) {
        console.error('Fetch error:', error);
        showAlert(error.message, 'danger');
    }
}

/**
 * دالة للتعامل مع "إرسال" فورم التعديل
 */
async function handleFormSubmit(event) {
    event.preventDefault();
    setLoading(true);

    const title = titleInput.value;
    const subtitle = subtitleInput.value;
    const description = descriptionInput.value;
    const percentage = percentageInput.value;
    const imageFile = imageInput.files[0];

    let imageObjectToSave = existingImageObject; // الافتراضي هو الصورة القديمة

    try {
        // 1. التحقق: هل قام المستخدم برفع صورة جديدة؟
        if (imageFile) {
            const formData = new FormData();
            formData.append('file', imageFile);

            const uploadResponse = await fetch(`${BASE_URL}/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${authToken}` },
                body: formData
            });

            if (!uploadResponse.ok) throw new Error('فشل في رفع الصورة الجديدة.');
            
            const uploadData = await uploadResponse.json();
            imageObjectToSave = {
                fileId: uploadData.result.public_id,
                url: uploadData.result.secure_url
            };
        }
        
        // 2. إرسال طلب التعديل (PUT)
        const updateResponse = await fetch(`${BASE_URL}/bunner/${bannerId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                title: title,
                subtitle: subtitle,
                description: description,
                percentage: percentage,
                image: imageObjectToSave
            })
        });

        const updateData = await updateResponse.json();
        if (!updateResponse.ok || !updateData.success) {
            throw new Error(updateData.message || 'فشل في حفظ التعديلات.');
        }

        // 3. نجاح!
        showAlert('تم حفظ التعديلات بنجاح!', 'success');
        
        setTimeout(() => {
            window.location.href = '/banner'; // العودة لصفحة العرض
        }, 2000);

    } catch (error) {
        console.error('Update error:', error);
        showAlert(error.message, 'danger');
    } finally {
        setLoading(false);
    }
}

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