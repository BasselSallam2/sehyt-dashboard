// ننتظر حتى يتم تحميل الصفحة بالكامل
document.addEventListener("DOMContentLoaded", () => {
  // 1. "إمساك" العناصر التي سنتعامل معها
  const tableBody = document.getElementById("specializations-table-body");
  const alertPlaceholder = document.getElementById("alert-placeholder");

  const deleteModalElement = document.getElementById("deleteConfirmModal");
  const deleteModal = new bootstrap.Modal(deleteModalElement); // تهيئة الـ Modal
  const confirmDeleteButton = document.getElementById("confirm-delete-button");
  const confirmDeleteSpinner =
    confirmDeleteButton.querySelector(".spinner-border");

  let idToDelete = null;

  /**
   * المستمع لزر "تأكيد الحذف" (داخل الـ Modal)
   */
  confirmDeleteButton.addEventListener("click", async () => {
    if (!idToDelete) return; // حماية (إذا لم يتم تحديد ID)

    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      showAlert("انتهت صلاحية الجلسة، يرجى تسجيل الدخول.", "danger");
      deleteModal.hide(); // إخفاء الـ Modal
      return;
    }

    // 1. إظهار حالة التحميل
    setLoadingOnDeleteButton(true);

    try {
      // 2. إرسال طلب الحذف
      const response = await fetch(`${BASE_URL}/specialize/${idToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // 3. نجاح!
        showAlert("تم حذف التخصص بنجاح.", "success");

        // 4. إزالة الصف من الجدول
        // (نبحث عن الصف الذي قمنا بتخزين الـ ID الخاص به)
        const rowId = `spec-row-${idToDelete}`;
        const rowToRemove = document.getElementById(rowId);
        if (rowToRemove) {
          rowToRemove.remove();
        }

        deleteModal.hide(); // إخفاء الـ Modal
      } else {
        // 5. فشل
        throw new Error(data.message || "فشل في حذف التخصص.");
      }
    } catch (error) {
      // 6. التعامل مع الأخطاء
      console.error("Delete error:", error);
      // إظهار الخطأ داخل الـ Modal (أو خارجه، الأفضل خارجه)
      deleteModal.hide();
      showAlert(error.message, "danger");
    } finally {
      // 7. إيقاف التحميل وإعادة تعيين الـ ID
      setLoadingOnDeleteButton(false);
      idToDelete = null;
    }
  });

  /**
   * دالة مساعدة للتحكم بالسبينر على زر الحذف (داخل الـ Modal)
   */
  function setLoadingOnDeleteButton(isLoading) {
    if (isLoading) {
      confirmDeleteButton.disabled = true;
      confirmDeleteSpinner.classList.remove("d-none");
    } else {
      confirmDeleteButton.disabled = false;
      confirmDeleteSpinner.classList.add("d-none");
    }
  }

  // 2. جلب التوكن من ذاكرة المتصفح
  // (يجب أن نرسله مع الطلب لنثبت للـ API أننا مسجلون الدخول)
  const authToken = localStorage.getItem("authToken");

  /**
   * دالة لجلب البيانات من الـ API وعرضها
   */
  async function fetchSpecializations() {
    // (يمكنك ترك السبينر الذي وضعناه في الـ HTML يعمل)
    // tableBody.innerHTML = '<tr><td colspan="5" class="text-center">... loading ...</td></tr>';

    try {
      // 3. إرسال الطلب إلى الـ API (مع التوكن)
      const response = await fetch(`${BASE_URL}/specialize`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // إرسال التوكن في الـ Headers
          Authorization: `Bearer ${authToken}`,
        },
      });

      // 4. التأكد من الرد
      if (!response.ok) {
        // إذا فشل (مثل: التوكن غير صالح)، ألقِ خطأ
        throw new Error("فشل في جلب البيانات. قد تكون جلسة العمل انتهت.");
      }

      const data = await response.json();

      // 5. التحقق من نجاح العملية ووجود بيانات
      if (data.success && data.data) {
        renderTable(data.data); // استدعاء دالة عرض الجدول
      } else {
        showNoDataMessage();
      }
    } catch (error) {
      // 6. التعامل مع الأخطاء (مثل انتهاء الجلسة أو خطأ بالشبكة)
      console.error("Error fetching specializations:", error);

      // إذا كان الخطأ بسبب انتهاء الجلسة (unauthorized)، قم بإرجاع المستخدم للوجن
      if (error.message.includes("401") || error.message.includes("انتهت")) {
        showAlert("انتهت صلاحية الجلسة، سيتم تسجيل خروجك...", "danger");
        setTimeout(handleLogout, 2000); // (handleLogout من ملف main.js)
      } else {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">حدث خطأ: ${error.message}</td></tr>`;
      }
    }
  }

  /**
   * دالة لرسم الجدول بالبيانات
   * @param {Array} specializations - مصفوفة التخصصات القادمة من الـ API
   */
  function renderTable(specializations) {
    // 1. تفريغ الجدول من السبينر (دائرة التحميل)
    tableBody.innerHTML = "";

    // 2. التحقق إذا كانت المصفوفة فارغة
    if (specializations.length === 0) {
      showNoDataMessage();
      return;
    }

    // 3. المرور على كل عنصر في المصفوفة وإنشاء صف (<tr>) له
    specializations.forEach((spec, index) => {
      const tr = document.createElement("tr");
      tr.id = `spec-row-${spec._id}`;

      // جلب بيانات الحقول (مع التأكد من وجودها لتجنب الأخطاء)
      const imageUrl = spec.image
        ? spec.image.url
        : "https://via.placeholder.com/50"; // صورة افتراضية
      const title = spec.title || "لا يوجد عنوان";
      // تنسيق التاريخ ليكون سهل القراءة
      const createdAt = spec.createdAt
        ? new Date(spec.createdAt).toLocaleDateString("ar-EG")
        : "غير معروف";

      tr.innerHTML = `
                <td>${index + 1}</td>
                <td>
                    <img src="${imageUrl}" alt="${title}" class="rounded" style="width: 50px; height: 50px; object-fit: cover;">
                </td>
                <td>${title}</td>
                <td>${createdAt}</td>
                <td>
                    <a href="/specializations/edit?id=${
                      spec._id
                    }" class="btn btn-sm btn-info text-white">
    <i class="bi bi-pencil-fill"></i> تعديل
</a>
                    <button class="btn btn-sm btn-danger" data-id="${
                      spec._id
                    }" onclick="deleteSpec(this)">
                        <i class="bi bi-trash-fill"></i> حذف
                    </button>
                </td>
            `;

      // 4. إضافة الصف الجديد إلى الجدول
      tableBody.appendChild(tr);
    });
  }

  /**
   * دالة لإظهار رسالة "لا توجد بيانات"
   */
  function showNoDataMessage() {
    tableBody.innerHTML =
      '<tr><td colspan="5" class="text-center">لا توجد تخصصات لعرضها حالياً.</td></tr>';
  }

  /**
   * دالة لإظهار تنبيه (للنجاح أو الخطأ)
   * @param {string} message - الرسالة
   * @param {string} type - (success | danger | warning)
   */
  function showAlert(message, type) {
    const wrapper = document.createElement("div");
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

  // --- (دوال مؤقتة للأزرار) ---
  // سنقوم ببرمجتها لاحقاً
  

  window.deleteSpec = function (button) {
    // 1. جلب الـ ID من الزر
    idToDelete = button.getAttribute("data-id");

    // 2. "إمساك" الصف الخاص به (سنحتاجه لاحقاً)
    const row = button.closest("tr");
    // 3. تخزين الصف في الـ Modal (حتى نتمكن من الوصول إليه لاحقاً)
    deleteModalElement.dataset.row = row.id; // (سنحتاج لإعطاء الصف ID)

    // --- (تحديث بسيط في دالة renderTable) ---
    // نحتاج لإعطاء الصف (tr) ID فريد
    // ارجع لدالة renderTable وعدل السطر:
    // const tr = document.createElement('tr');
    // إلى:
    // const tr = document.createElement('tr');
    // tr.id = `spec-row-${spec._id}`; // <-- هذا السطر مهم جداً

    // 4. إظهار الـ Modal
    deleteModal.show();
  };

  // 4. استدعاء الدالة الرئيسية لبدء جلب البيانات
  fetchSpecializations();
});
