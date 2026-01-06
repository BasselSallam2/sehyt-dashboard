// (ملف: assets/js/specialization-edit.js)

// متغيرات عامة
let specId = null;
let existingImageObject = null;
// ملاحظة: قمنا بحذف تعريف authToken من هنا لمنع تعارض الأسماء (SyntaxError)

// "إمساك" عناصر الفورم
const createForm = document.getElementById('create-spec-form');
const titleInput = document.getElementById('spec-title');
const imageInput = document.getElementById('spec-image');
const imagePreview = document.getElementById('image-preview');
const saveButton = document.getElementById('save-button');
const alertPlaceholder = document.getElementById('alert-placeholder');
const spinner = saveButton.querySelector('.spinner-border');

// 1. ننتظر تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // تعريف المتغير هنا (داخل الدالة) لضمان عدم حدوث مشاكل مع الملفات الأخرى
    const authToken = localStorage.getItem('authToken');
    
    // التحقق الأمني
    if (!authToken) {
        window.location.href = '/specializations';
        return;
    }

    // 2. جلب الـ ID من الـ URL
    const urlParams = new URLSearchParams(window.location.search);
    specId = urlParams.get('id');

    if (!specId) {
        showAlert('خطأ: لا يوجد ID للتخصص.', 'danger');
        setTimeout(() => { window.location.href = '/specializations'; }, 2000);
        return;
    }

    // 3. جلب البيانات لملء الفورم
    fetchAndFillData(authToken);

    // 4. مستمع لمعاينة الصورة الجديدة
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
            imagePreview.src = existingImageObject ? existingImageObject.url : '';
            imagePreview.style.display = existingImageObject ? 'block' : 'none';
        }
    });

    // 5. مستمع لحفظ التعديلات
    createForm.addEventListener('submit', (e) => handleFormSubmit(e, authToken));
});

/**
 * دالة لجلب البيانات القديمة وملء الفورم
 */
async function fetchAndFillData(authToken) {
    try {
        // استخدام الرابط المباشر لجلب العنصر بالـ ID
        const response = await fetch(`${BASE_URL}/specialize/${specId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!response.ok) {
            throw new Error('فشل في جلب بيانات التخصص.');
        }

        const jsonResponse = await response.json();

        // بناءً على شكل الـ JSON: { success: true, data: { ... } }
        if (!jsonResponse.success || !jsonResponse.data) {
             throw new Error('التخصص غير موجود أو لا يمكن الوصول إليه.');
        }
        
        const specialty = jsonResponse.data;

        // 6. ملء الفورم (Prefill)
        titleInput.value = specialty.title || '';
        
        if (specialty.image && specialty.image.url) {
            existingImageObject = specialty.image;
            imagePreview.src = specialty.image.url;
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
async function handleFormSubmit(event, authToken) {
    event.preventDefault();
    setLoading(true);

    const title = titleInput.value;
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
        const updateResponse = await fetch(`${BASE_URL}/specialize/${specId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                title: title,
                image: imageObjectToSave
            })
        });

        const updateData = await updateResponse.json();
        
        // التحقق من النجاح (أحياناً الـ API يرجع success داخل الـ json)
        if (!updateResponse.ok) {
             throw new Error(updateData.message || 'فشل في حفظ التعديلات.');
        }

        // 3. نجاح!
        showAlert('تم حفظ التعديلات بنجاح!', 'success');
        
        setTimeout(() => {
            window.location.href = '/specializations'; // العودة لصفحة القائمة
        }, 2000);

    } catch (error) {
        console.error('Update error:', error);
        showAlert(error.message, 'danger');
    } finally {
        setLoading(false);
    }
}

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