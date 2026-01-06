document.addEventListener("DOMContentLoaded", () => {
  // (1. "إمساك" العناصر)
  const alertPlaceholder = document.getElementById("alert-placeholder");
  const mainContent = document.querySelector(".main-content");
  const doctorsTab = document.getElementById("doctors-tab");
  const managersTab = document.getElementById("managers-tab");
  const doctorsLoading = document.getElementById("doctors-loading");
  const doctorsAccordionContainer = document.getElementById(
    "doctors-accordion-container"
  );
  const managersLoading = document.getElementById("managers-loading");
  const managersTableContainer = document.getElementById(
    "managers-table-container"
  );
  const managersTableBody = document.getElementById("managers-table-body");
  const managersPagination = document.getElementById("managers-pagination");

  // --- (الكود الجديد يبدأ هنا) ---
    // (متغيرات الـ Modal)
    const deleteModalElement = document.getElementById('deleteConfirmModal');
    const deleteModal = new bootstrap.Modal(deleteModalElement);
    const confirmDeleteButton = document.getElementById('confirm-delete-button');
    const confirmDeleteSpinner = confirmDeleteButton.querySelector('.spinner-border');

    let idToDelete = null;


  // (2. جلب بيانات المستخدم)
  const authToken = localStorage.getItem("authToken");
  const userType = localStorage.getItem("userType");

  let currentPage = 1;
  const limitPerPage = 10;

  

  // (3. التحقق الأمني - أدمن فقط)
  if (userType !== "admin") {
    showAlert("ليس لديك الصلاحية للوصول لهذه الصفحة.", "danger");
    mainContent.innerHTML = "";
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 2000);
    return;
  }

  // (4. مستمعات التبويبات)
  doctorsTab.addEventListener("click", () => {
    if (doctorsAccordionContainer.innerHTML === "") {
      fetchDoctors();
    }
  });

  managersTab.addEventListener("click", () => {
    // (تعديل بسيط: دائماً اطلب البيانات عند الضغط، لضمان التحديث)
    fetchManagers(1);
  });

  // ------------------------------------------
  // (أ) دوال جلب وعرض "الأطباء" (تجميع)
  // ------------------------------------------
  async function fetchDoctors() {
    doctorsLoading.style.display = "block";
    doctorsAccordionContainer.innerHTML = "";

    const populateQuery = encodeURIComponent(
      JSON.stringify({ path: "specialize" })
    );
    const url = `${BASE_URL}/employee?populate=${populateQuery}&limit=1000`;

    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!response.ok) throw new Error("فشل جلب الأطباء");
      const data = await response.json();

      if (data.success && data.data) {
        renderDoctorsAccordion(data.data);
      } else {
        doctorsAccordionContainer.innerHTML =
          '<p class="text-center">لا يوجد أطباء لعرضهم.</p>';
      }
    } catch (error) {
      showAlert(error.message, "danger");
      doctorsAccordionContainer.innerHTML = `<p class="text-center text-danger">${error.message}</p>`;
    } finally {
      doctorsLoading.style.display = "none";
    }
  }

  function renderDoctorsAccordion(doctors) {
    const groupedByCountry = {};
    doctors.forEach((emp) => {
      if (emp.type !== "doctor") return;
      const country = emp.country || "غير مصنف";
      const city = emp.city || "غير مصنف";
      if (!groupedByCountry[country]) groupedByCountry[country] = {};
      if (!groupedByCountry[country][city])
        groupedByCountry[country][city] = [];
      groupedByCountry[country][city].push(emp);
    });

    doctorsAccordionContainer.innerHTML = "";
    let countryIndex = 0;
    for (const countryName in groupedByCountry) {
      const cities = groupedByCountry[countryName];
      const countryId = `country-${countryIndex}`;
      let cityHTML = "";

      for (const cityName in cities) {
        const cityDoctors = cities[cityName];
        cityHTML += `<h5 class="mt-3 mb-2">${cityName} (${cityDoctors.length})</h5>`;
        cityHTML += `
                    <div class="table-responsive">
                        <table class="table table-bordered table-sm align-middle">
                            <thead class="table-light">
                                <tr>
                                    <th>الاسم</th>
                                    <th>الهاتف</th>
                                    <th>التخصص</th>
                                    <th>إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${cityDoctors
                                  .map((emp) =>
                                    createEmployeeRowHTML(emp, 0, false)
                                  )
                                  .join("")}
                            </tbody>
                        </table>
                    </div>
                `;
      }

      doctorsAccordionContainer.innerHTML += `
                <div class="accordion-item">
                    <h2 class="accordion-header"><button class="accordion-button ${
                      countryIndex > 0 ? "collapsed" : ""
                    }" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${countryId}">${countryName}</button></h2>
                    <div id="collapse-${countryId}" class="accordion-collapse collapse ${
        countryIndex === 0 ? "show" : ""
      }" data-bs-parent="#doctors-accordion-container">
                        <div class="accordion-body">${cityHTML}</div>
                    </div>
                </div>
            `;
      countryIndex++;
    }
  }

  // ------------------------------------------
  // (ب) دوال جلب وعرض "المديرين" (جدول + Pagination)
  // ------------------------------------------
  async function fetchManagers(page = 1) {
    currentPage = page;
    managersLoading.style.display = "block";
    managersTableContainer.style.display = "none";
    managersPagination.innerHTML = "";

    const url = `${BASE_URL}/employee/admin?page=${page}&limit=${limitPerPage}`;

    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!response.ok) throw new Error("فشل جلب المديرين");
      const data = await response.json();

      if (data.success && data.data && data.data.length > 0) {
        renderManagersTable(data.data);
        renderManagersPagination(data.pagination);
      } else {
        renderManagersTable([]);
        renderManagersPagination(null);
      }

      managersTableContainer.style.display = "block";
    } catch (error) {
      showAlert(error.message, "danger");
      managersTableContainer.innerHTML = `<p class="text-center text-danger">${error.message}</p>`;
      managersTableContainer.style.display = "block";
    } finally {
      managersLoading.style.display = "none";
    }
  }

  function renderManagersTable(managers) {
    managersTableBody.innerHTML = "";
    if (managers.length === 0) {
      managersTableBody.innerHTML = `<tr><td colspan="5" class="text-center">لا يوجد مديرين.</td></tr>`;
      return;
    }
    managers.forEach((emp, index) => {
      managersTableBody.innerHTML += createEmployeeRowHTML(emp, index, true);
    });
  }

  function renderManagersPagination(pagination) {
    managersPagination.innerHTML = "";
    if (!pagination || pagination.pages <= 1) return;
    const { page, pages, hasNextPage, hasPrevPage } = pagination;
    let html = '<ul class="pagination">';
    html += `<li class="page-item ${
      !hasPrevPage ? "disabled" : ""
    }"><a class="page-link" href="#" data-page="${page - 1}">السابق</a></li>`;
    for (let i = Math.max(1, page - 2); i <= Math.min(pages, page + 2); i++) {
      html += `<li class="page-item ${
        i === page ? "active" : ""
      }"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
    }
    html += `<li class="page-item ${
      !hasNextPage ? "disabled" : ""
    }"><a class="page-link" href="#" data-page="${page + 1}">التالي</a></li>`;
    html += "</ul>";
    managersPagination.innerHTML = html;
  }

  managersPagination.addEventListener("click", (event) => {
    event.preventDefault();
    const target = event.target.closest("a.page-link");
    if (target) {
      const page = target.dataset.page;
      if (page) fetchManagers(parseInt(page));
    }
  });

  // ------------------------------------------
  // (ج) دوال مساعدة (مشتركة)
  // ------------------------------------------
  function createEmployeeRowHTML(emp, index = 0, isManager = false) {
    if (isManager) {
      // (هذا كود المدير - لا يحتاج للتخصص)
      return `
                <tr id="emp-row-${emp._id}">
                    <td>${(currentPage - 1) * limitPerPage + index + 1}</td>
                    <td>${emp.name}</td>
                    <td>${emp.phone}</td>
                    <td>${emp.city || '<em class="text-muted">-</em>'}</td>
                    <td>
                        <a href="/employees/edit?id=${
                          emp._id
                        }" class="btn btn-sm btn-info text-white"><i class="bi bi-pencil-fill"></i></a>
                        <button class="btn btn-sm btn-danger" onclick="deleteEmployee('${
                          emp._id
                        }')"><i class="bi bi-trash-fill"></i></button>
                    </td>
                </tr>
            `;
    } else {
      // (هذا كود الطبيب)
      const specialize =
        emp.specialize && emp.specialize.title
          ? emp.specialize.title
          : '<em class="text-muted">-</em>';
      return `
                <tr id="emp-row-${emp._id}">
                    <td>${emp.name}</td>
                    <td>${emp.phone}</td>
                    <td>${specialize}</td>
                    <td>
                        <a href="/employees/edit?id=${emp._id}" class="btn btn-sm btn-info text-white"><i class="bi bi-pencil-fill"></i></a>
                        <button class="btn btn-sm btn-danger" onclick="deleteEmployee('${emp._id}')"><i class="bi bi-trash-fill"></i></button>
                    </td>
                </tr>
            `;
    }
  }

  /**
 * (جديد) المستمع لزر "تأكيد الحذف" (داخل الـ Modal)
 */
confirmDeleteButton.addEventListener('click', async () => {

    if (!idToDelete) return; 
    setLoadingOnDeleteButton(true);

    try {
        const response = await fetch(`${BASE_URL}/employee/${idToDelete}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const data = await response.json();

        if (response.ok && data.success) {
            showAlert('تم حذف الموظف بنجاح.', 'success');
            deleteModal.hide(); 

            // (إعادة تحميل التبويب النشط حالياً)
            if (doctorsTab.classList.contains('active')) {
                fetchDoctors(); // (تحديث قائمة الأطباء)
            } else {
                fetchManagers(currentPage); // (تحديث الصفحة الحالية للمديرين)
            }

        } else {
            throw new Error(data.message || 'فشل في حذف الموظف.');
        }

    } catch (error) {
        console.error('Delete error:', error);
        deleteModal.hide();
        showAlert(error.message, 'danger');
    } finally {
        setLoadingOnDeleteButton(false);
        idToDelete = null; 
    }
});

/**
 * (جديد) دالة مساعدة للتحكم بالسبينر على زر الحذف
 */
function setLoadingOnDeleteButton(isLoading) {
    if (isLoading) {
        confirmDeleteButton.disabled = true;
        confirmDeleteSpinner.classList.remove('d-none');
    } else {
        confirmDeleteButton.disabled = false;
        confirmDeleteSpinner.classList.add('d-none');
    }
}

  // (دالة الحذف - مؤقتة)
  window.deleteEmployee = function(id) {
    idToDelete = id;
    deleteModal.show();
}

  // (دالة التنبيهات)
  function showAlert(message, type) {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `<div class="alert alert-${type} alert-dismissible" role="alert"><div>${message}</div><button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`;
    alertPlaceholder.append(wrapper);
    setTimeout(() => wrapper.remove(), 3000);
  }

  // (5. تحميل التبويب الافتراضي)
  fetchDoctors();
});
