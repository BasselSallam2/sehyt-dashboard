// ننتظر حتى يتم تحميل كل عناصر الصفحة (HTML) بالكامل
document.addEventListener('DOMContentLoaded', () => {

    // 1. تحديد كل العناصر التي سنتعامل معها في الفورم
    const loginForm = document.getElementById('login-form');
    const phoneInput = document.getElementById('phone');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('login-button');
    const errorMessageDiv = document.getElementById('error-message');
    
    // نحدد السبينر (دائرة التحميل) الموجود داخل الزر
    const spinner = loginButton.querySelector('.spinner-border');

    // 2. إضافة "مستمع" لحدث إرسال الفورم (عند الضغط على الزر)
    loginForm.addEventListener('submit', async (event) => {
        
        // 3. منع السلوك الافتراضي للفورم (وهو إعادة تحميل الصفحة)
        event.preventDefault();

        // 4. إظهار حالة التحميل
        // (تعطيل الزر وإظهار السبينر)
        loginButton.disabled = true;
        spinner.classList.remove('d-none');
        errorMessageDiv.classList.add('d-none'); // إخفاء أي رسائل خطأ قديمة

        // 5. جلب القيم من حقول الإدخال
        const phone = phoneInput.value;
        const password = passwordInput.value;

        // 6. استخدام try...catch للتعامل مع أي أخطاء (مثل فشل الاتصال)
        try {
            // 7. إرسال الطلب إلى الـ API
            // (نستخدم BASE_URL من ملف api.js الذي قمنا بتضمينه)
            const response = await fetch(`${BASE_URL}/employee/auth/signin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phone: phone,
                    password: password
                })
            });

            // 8. تحويل الرد القادم من الخادم إلى (JSON)
            const data = await response.json();

            // 9. التحقق من الرد
            if (response.ok && data.success) {
                // نجاح!
                // 10. تخزين "التوكن" في الـ localStorage
                // هذا هو أهم جزء، الـ localStorage هو "ذاكرة" المتصفح
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userType', data.type); // (سيخزن "doctor" أو "admin")

                // 11. توجيه المستخدم إلى صفحة الـ dashboard
                // (هذه الصفحة غير موجودة بعد، سننشئها في الخطوة التالية)
                window.location.href = '/dashboard';

            } else {
                // فشل (مثل: كلمة مرور خاطئة)
                // إظهار رسالة الخطأ التي جاءت من الـ Backend
                showError( 'رقم الهاتف أو كلمة المرور غير صحيحة.');
            }

        } catch (error) {
            // فشل (مثل: الخادم لا يعمل أو مشكلة في الاتصال)
            console.error('Login Error:', error);
            showError('حدث خطأ. تأكد من أن الخادم يعمل أو أنك متصل بالإنترنت.');
        } finally {
            // 12. "finally" يعمل دائماً (سواء نجح أو فشل)
            // (إعادة تفعيل الزر وإخفاء السبينر)
            loginButton.disabled = false;
            spinner.classList.add('d-none');
        }
    });

    // دالة مساعدة لإظهار رسائل الخطأ
    function showError(message) {
        errorMessageDiv.textContent = message;
        errorMessageDiv.classList.remove('d-none');
    }

});