// (Auth Guard)
// هذا الكود يعمل فوراً عند استدعائه
// للتحقق من وجود التوكن قبل تحميل أي شيء في الصفحة

// 1. احصل على التوكن من "ذاكرة المتصفح"
const authToken = localStorage.getItem("authToken");

// 2. تحقق من وجود التوكن
if (!authToken) {
  window.location.href = "/";
}

// ----------------------------------------------
// (Logout Function)
// سنحتاج هذه الدالة لاحقاً في كل الصفحات
// ----------------------------------------------

function handleLogout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userType"); // (تأكد من مسح هذا أيضاً)

  window.location.href = "/";
}

// سنضيف مستمع "DOMContentLoaded" للتأكد أن الصفحة قد تم تحميلها
// قبل ربط زر تسجيل الخروج
document.addEventListener("DOMContentLoaded", () => {
  const userType = localStorage.getItem("userType");

  if (userType === "admin") {
    // إذا كان المستخدم "أدمن"
    // قم بإخفاء كل الروابط الخاصة بـ "الدكتور"
    const doctorLinks = document.querySelectorAll('[data-role="doctor"]');
    doctorLinks.forEach((link) => {
      link.style.display = "none";
    });
  } else if (userType === "doctor") {
    // إذا كان المستخدم "دكتور"
    // قم بإخفاء كل الروابط الخاصة بـ "الأدمن"
    const adminLinks = document.querySelectorAll('[data-role="admin"]');
    adminLinks.forEach((link) => {
      link.style.display = "none";
    });
  }

  const logoutButton = document.getElementById("logout-button");

  if (logoutButton) {
    logoutButton.addEventListener("click", (event) => {
      event.preventDefault(); // منع أي سلوك افتراضي للرابط
      handleLogout();
    });
  }
});
