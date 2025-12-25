/* =============================== */
/* ========== script.js ========== */
/* =============================== */

const state = {
  positiveNotes: [],
  negativeNotes: [],
  images: [], // جميع الصور (بما فيها صور الملاحظات الفردية والرفع الجماعي)
  bulkImages: [], // صور مخصصة لصفحة الصور النهائية فقط
};

/* ---------- بيانات المقاولين ---------- */
const contractorsData = {
  "شركة منار الوطنية للمقاولات": {
    projectName:
      "مشروع تنفيذ أعمال شبكات المياه بالمناطق المحيطة بخران ناوان والأحسية",
    projectNumber: "141250115",
    location: "الباحة - المخواة - الأحسية",
  },
  "شركة الهداية للمقاولات": {
    projectName: "مشروع توسعة شبكة الصرف الصحي بمنطقة الرياض الشمالية",
    projectNumber: "142250220",
    location: "الرياض - حي العليا",
  },
  "شركة الصفوة للمقاولات العامة": {
    projectName: "مشروع إنشاء محطة معالجة مياه الصرف الصحي بجدة",
    projectNumber: "143350315",
    location: "جدة - حي الصفا",
  },
  "شركة النهضة للمقاولات": {
    projectName: "مشروع تأهيل وتطوير شبكات المياه بمنطقة مكة المكرمة",
    projectNumber: "144450425",
    location: "مكة المكرمة - حي العزيزية",
  },
  "شركة المستقبل للمقاولات": {
    projectName: "مشروع إنشاء شبكة ري حديثة بالمزارع النموذجية",
    projectNumber: "145550535",
    location: "الشرقية - الأحساء",
  },
};

/* ---------- تهيئة الصفحة ---------- */
document.addEventListener("DOMContentLoaded", () => {
  // تحميل المقاولين المخصصين
  loadCustomContractors();

  // تعيين القيمة الافتراضية وتحديث الحقول
  const defaultContractor = "شركة منار الوطنية للمقاولات";
  document.getElementById("contractor").value = defaultContractor;
  updateContractorDetails(defaultContractor);

  // تعيين تاريخ اليوم كتاريخ افتراضي للزيارة
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("inspectionDate").value = today;

  // تهيئة بقية الصفحة
  renderPositiveList();
  renderNegativeList();
  renderPreview();
});

/* ---------- تحديث بيانات المقاول المختار ---------- */
function updateContractorDetails(contractorName) {
  if (contractorName === "custom") {
    showContractorModal();
    return;
  }

  if (contractorName && contractorsData[contractorName]) {
    const contractor = contractorsData[contractorName];
    document.getElementById("projectName").value = contractor.projectName;
    document.getElementById("projectNumber").value = contractor.projectNumber;
    document.getElementById("location").value = contractor.location;
  } else if (contractorName) {
    // إذا كان المقاول موجوداً في localStorage (مقاول مخصص سابقاً)
    const customContractors = JSON.parse(
      localStorage.getItem("customContractors") || "{}"
    );
    if (customContractors[contractorName]) {
      const contractor = customContractors[contractorName];
      document.getElementById("projectName").value = contractor.projectName;
      document.getElementById("projectNumber").value = contractor.projectNumber;
      document.getElementById("location").value = contractor.location;
    } else {
      // مسح الحقول إذا لم يكن هناك بيانات
      document.getElementById("projectName").value = "";
      document.getElementById("projectNumber").value = "";
      document.getElementById("location").value = "";
    }
  }

  // تحديث المعاينة بعد تغيير المقاول
  renderPreview();
}

/* ---------- تحميل المقاولين المخصصين من localStorage ---------- */
function loadCustomContractors() {
  const customContractors = JSON.parse(
    localStorage.getItem("customContractors") || "{}"
  );
  const select = document.getElementById("contractor");

  // إزالة المقاولين المخصصين الحاليين (باستثناء الخيار الافتراضي وcustom)
  const options = Array.from(select.querySelectorAll("option"));
  options.forEach((option) => {
    if (
      option.value !== "" &&
      option.value !== "custom" &&
      !contractorsData[option.value]
    ) {
      option.remove();
    }
  });

  // إضافة المقاولين المخصصين
  Object.keys(customContractors).forEach((contractorName) => {
    const newOption = document.createElement("option");
    newOption.value = contractorName;
    newOption.textContent = contractorName;

    const customOption = select.querySelector('option[value="custom"]');
    select.insertBefore(newOption, customOption);
  });
}

/* ---------- عرض نافذة إضافة مقاول جديد ---------- */
function showContractorModal() {
  document.getElementById("modalOverlay").style.display = "block";
  document.getElementById("addContractorModal").style.display = "block";

  // مسح الحقول
  document.getElementById("newContractorName").value = "";
  document.getElementById("newProjectName").value = "";
  document.getElementById("newProjectNumber").value = "";
  document.getElementById("newLocation").value = "";

  // تركيز على حقل اسم المقاول
  document.getElementById("newContractorName").focus();
}

/* ---------- إغلاق نافذة إضافة مقاول جديد ---------- */
function closeContractorModal() {
  document.getElementById("modalOverlay").style.display = "none";
  document.getElementById("addContractorModal").style.display = "none";

  // إعادة تعيين القائمة المنسدلة
  document.getElementById("contractor").value = "";
}

/* ---------- حفظ مقاول جديد ---------- */
function saveNewContractor() {
  const name = document.getElementById("newContractorName").value.trim();
  const projectName = document.getElementById("newProjectName").value.trim();
  const projectNumber = document
    .getElementById("newProjectNumber")
    .value.trim();
  const location = document.getElementById("newLocation").value.trim();

  if (!name) {
    alert("يرجى إدخال اسم المقاول");
    return;
  }

  if (!projectName) {
    alert("يرجى إدخال اسم المشروع");
    return;
  }

  if (!projectNumber) {
    alert("يرجى إدخال رقم العقد");
    return;
  }

  if (!location) {
    alert("يرجى إدخال الموقع");
    return;
  }

  // التحقق من عدم وجود مقاول بنفس الاسم
  const select = document.getElementById("contractor");
  const existingOptions = Array.from(select.options);
  const alreadyExists = existingOptions.some((option) => option.value === name);

  if (alreadyExists && !contractorsData[name]) {
    if (!confirm("يوجد مقاول بنفس الاسم مسبقاً. هل تريد تحديث بياناته؟")) {
      return;
    }
  }

  // حفظ في localStorage
  const customContractors = JSON.parse(
    localStorage.getItem("customContractors") || "{}"
  );
  customContractors[name] = {
    projectName,
    projectNumber,
    location,
  };
  localStorage.setItem("customContractors", JSON.stringify(customContractors));

  // إضافة الخيار الجديد للقائمة المنسدلة إذا لم يكن موجوداً
  if (!alreadyExists) {
    const newOption = document.createElement("option");
    newOption.value = name;
    newOption.textContent = name;

    // إدراج الخيار قبل خيار "إضافة مقاول جديد"
    const customOption = select.querySelector('option[value="custom"]');
    select.insertBefore(newOption, customOption);
  }

  // اختيار المقاول الجديد
  select.value = name;

  // تحديث الحقول
  updateContractorDetails(name);

  // إغلاق النافذة
  closeContractorModal();

  // عرض رسالة نجاح
  alert(`تم ${alreadyExists ? "تحديث" : "إضافة"} المقاول "${name}" بنجاح`);
}

/* ---------- إدارة نافذة المقاول الجديد ---------- */
document
  .getElementById("modalOverlay")
  ?.addEventListener("click", closeContractorModal);

document.addEventListener("keydown", function (event) {
  if (
    event.key === "Escape" &&
    document.getElementById("addContractorModal").style.display === "block"
  ) {
    closeContractorModal();
  }
});

/* ---------- ملاحظات ايجابية ---------- */
function addSelectedPositiveNote() {
  const sel = document.getElementById("positiveNoteSelect");
  const value = sel.value.trim();
  if (!value) return alert("اختر ملاحظة من القائمة أو أضف ملاحظة مخصصة.");
  addPositiveToList(value);
  sel.value = "";
}

function toggleCustomNote() {
  const cont = document.getElementById("customNoteContainer");
  cont.style.display = cont.style.display === "none" ? "block" : "none";
}

function addCustomPositiveNote() {
  const input = document.getElementById("customPositiveNote");
  const val = input.value.trim();
  if (!val) return alert("أدخل ملاحظة إيجابية.");
  addPositiveToList(val);
  input.value = "";
  document.getElementById("customNoteContainer").style.display = "none";
}

function addPositiveToList(text) {
  state.positiveNotes.push(text);
  renderPositiveList();
  renderPreview();
}

function removePositive(index) {
  state.positiveNotes.splice(index, 1);
  renderPositiveList();
  renderPreview();
}

function renderPositiveList() {
  const container = document.getElementById("positiveList");
  container.innerHTML = "";
  if (state.positiveNotes.length === 0) {
    container.innerHTML =
      '<div style="padding:10px;color:#6b7280">لا توجد ملاحظات إيجابية بعد.</div>';
    return;
  }
  state.positiveNotes.forEach((note, idx) => {
    const div = document.createElement("div");
    div.className = "note-item";
    div.innerHTML = `
<div style="flex:1; text-align:right;">${escapeHtml(note)}</div>
<div style="min-width:80px; text-align:left;">
    <button class="btn" onclick="removePositive(${idx})">حذف</button>
</div>
`;
    container.appendChild(div);
  });
}

/* ---------- تبديل نموذج الملاحظة ---------- */
function showViolationForm() {
  document.getElementById("toggleViolation").classList.add("active");
  document.getElementById("toggleGeneral").classList.remove("active");
  document.getElementById("violationNoteForm").style.display = "block";
  document.getElementById("generalNoteForm").style.display = "none";
}

function showGeneralForm() {
  document.getElementById("toggleViolation").classList.remove("active");
  document.getElementById("toggleGeneral").classList.add("active");
  document.getElementById("violationNoteForm").style.display = "none";
  document.getElementById("generalNoteForm").style.display = "block";
}

/* ---------- إدارة ملفات الصور ---------- */
function updateViolationFileName(input) {
  const nameEl = document.getElementById("violationFileName");
  if (input.files && input.files[0]) {
    nameEl.textContent = input.files[0].name;
  } else {
    nameEl.textContent = "لم يتم اختيار ملف";
  }
}

function updateGeneralFileName(input) {
  const nameEl = document.getElementById("generalFileName");
  if (input.files && input.files[0]) {
    nameEl.textContent = input.files[0].name;
  } else {
    nameEl.textContent = "لم يتم اختيار ملف";
  }
}

/* قراءة ملف صورة وتحويلها إلى DataURL */
function readImageFile(file, callback) {
  const reader = new FileReader();
  reader.onload = function (e) {
    callback(e.target.result);
  };
  reader.readAsDataURL(file);
}

/* رفع صور دفعة واحدة لصفحة الصور النهائية */
function handleBulkImages(input) {
  const preview = document.getElementById("bulkPreview");
  preview.innerHTML = "";
  if (!input.files || input.files.length === 0) return;
  Array.from(input.files).forEach((file, idx) => {
    readImageFile(file, (dataUrl) => {
      const id = "bulk-" + Date.now() + "-" + idx;
      state.bulkImages.push({ id, dataUrl, name: file.name });
      const img = document.createElement("img");
      img.src = dataUrl;
      img.className = "bulk-thumb";
      preview.appendChild(img);
      renderPreview();
    });
  });
  input.value = "";
}

/* ---------- الغرامات حسب نوع المخالفة ---------- */
const fineMapping = {
  1: 5000,
  2: 2000,
  4: 2000,
  6: 5000,
  10: 2000,
  27: 2000,
  30: 5000,
  53: 2000,
};

function updateFineAmount() {
  const select = document.getElementById("violationType");
  const val = select.value;
  const container = document.getElementById("fineAmountContainer");
  if (val && fineMapping[val]) {
    document.getElementById("fineAmount").textContent = `${fineMapping[
      val
    ].toLocaleString()} ريال`;
    container.style.display = "flex";
  } else {
    container.style.display = "none";
    document.getElementById("fineAmount").textContent = "0 ريال";
  }
}

/* ---------- إضافة مخالفة أو إرسالها مع غرامة ---------- */
function addViolationNote() {
  const type = document.getElementById("violationType").value;
  const desc = document.getElementById("violationDescription").value.trim();
  const severity = document.querySelector(
    'input[name="severity"]:checked'
  )?.value;
  const corrective = document
    .getElementById("violationCorrectiveAction")
    .value.trim();
  const fileInput = document.getElementById("violationFileInput");

  if (!type) return alert("اختر نوع المخالفة.");
  if (!desc) return alert("أدخل وصف المخالفة.");
  if (!severity) return alert("اختر درجة الخطورة.");

  const note = {
    id: "v-" + Date.now(),
    type: "violation",
    violationType: type,
    violationText: getViolationLabel(type),
    description: desc,
    severity,
    corrective,
    fine: fineMapping[type] || 0,
    imageId: null,
  };

  if (fileInput.files && fileInput.files[0]) {
    const file = fileInput.files[0];
    readImageFile(file, (dataUrl) => {
      const imgId = "img-" + Date.now();
      state.images.push({ id: imgId, dataUrl, name: file.name });
      note.imageId = imgId;
      state.negativeNotes.push(note);
      renderNegativeList();
      renderPreview();
      fileInput.value = "";
      document.getElementById("violationFileName").textContent =
        "لم يتم اختيار ملف";
      showTempMessage("violationSuccessMessage");
    });
  } else {
    state.negativeNotes.push(note);
    renderNegativeList();
    renderPreview();
    showTempMessage("violationSuccessMessage");
  }

  // إعادة تعيين النموذج
  document.getElementById("violationDescription").value = "";
  document.getElementById("violationCorrectiveAction").value = "";
}

/* ---------- إضافة ملاحظة عامة ---------- */
function addGeneralNote() {
  const title = document.getElementById("generalNoteTitle").value.trim();
  const desc = document.getElementById("generalNoteDescription").value.trim();
  const severity = document.querySelector(
    'input[name="generalSeverity"]:checked'
  )?.value;
  const corrective = document
    .getElementById("generalCorrectiveAction")
    .value.trim();
  const fileInput = document.getElementById("generalFileInput");

  if (!title) return alert("أدخل عنوان الملاحظة العامة.");
  if (!desc) return alert("أدخل وصف الملاحظة.");
  if (!severity) return alert("اختر درجة الخطورة.");

  const note = {
    id: "g-" + Date.now(),
    type: "general",
    title,
    description: desc,
    severity,
    corrective,
    imageId: null,
  };

  if (fileInput.files && fileInput.files[0]) {
    const file = fileInput.files[0];
    readImageFile(file, (dataUrl) => {
      const imgId = "img-" + Date.now();
      state.images.push({ id: imgId, dataUrl, name: file.name });
      note.imageId = imgId;
      state.negativeNotes.push(note);
      renderNegativeList();
      renderPreview();
      fileInput.value = "";
      document.getElementById("generalFileName").textContent =
        "لم يتم اختيار ملف";
      showTempMessage("generalSuccessMessage");
    });
  } else {
    state.negativeNotes.push(note);
    renderNegativeList();
    renderPreview();
    showTempMessage("generalSuccessMessage");
  }

  // إعادة تعيين النموذج
  document.getElementById("generalNoteTitle").value = "";
  document.getElementById("generalNoteDescription").value = "";
  document.getElementById("generalCorrectiveAction").value = "";
}

/* حذف ملاحظة سلبية */
function removeNegative(index) {
  state.negativeNotes.splice(index, 1);
  renderNegativeList();
  renderPreview();
}


/* عرض الملاحظات السلبية في جدول */
function renderNegativeList() {
  const container = document.getElementById("negativeList");
  container.innerHTML = "";

  if (state.negativeNotes.length === 0) {
    container.innerHTML =
      '<div style="padding:10px;color:#6b7280">لا توجد ملاحظات سلبية بعد.</div>';
    return;
  }

  // إنشاء الجدول
  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";
  table.style.marginTop = "10px";
  table.style.fontFamily = "inherit";
  table.style.tableLayout = "fixed"; // إضافة هذا السطر

  // رأس الجدول
  const thead = document.createElement("thead");
  thead.innerHTML = `
        <tr style="background-color: #f3f4f6; color: #374151; font-weight: 600;">
            <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #d1d5db; width: 35%;">الملاحظة / العنوان</th>
            <th style="padding: 12px 8px; text-align: center; border-bottom: 2px solid #d1d5db; width: 120px;">درجة الخطورة</th>
            <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #d1d5db; width: 35%;">الإجراء المتخذ/المطلوب</th>
            <th style="padding: 12px 8px; text-align: center; border-bottom: 2px solid #d1d5db; width: 80px;">إجراءات</th>
        </tr>
    `;
  table.appendChild(thead);

  // جسم الجدول
  const tbody = document.createElement("tbody");

  state.negativeNotes.forEach((note, idx) => {
    const tr = document.createElement("tr");
    tr.style.borderBottom = "1px solid #e5e7eb";
    tr.style.verticalAlign = "top";

    // تحديد المحتوى بناءً على نوع الملاحظة
    let titleContent = "";
    let severityContent = "";
    let correctiveContent = escapeHtml(note.corrective || "-");

    if (note.type === "violation") {
      titleContent = `
                <div style="font-weight: 700; color: #dc2626;">${escapeHtml(
                  note.violationText
                )}</div>
                <div style="margin-top: 4px; color: #4b5563; font-size: 14px;">${escapeHtml(
                  note.description
                )}</div>
                ${
                  note.imageId
                    ? '<div style="margin-top: 8px;"><strong>مرفق صورة</strong></div>'
                    : ""
                }
                <div style="margin-top: 4px; font-size: 13px; color: #059669; font-weight: 600;">الغرامة: ${note.fine.toLocaleString()} ر.س</div>
            `;
      severityContent = `<span style="color: #dc2626; font-weight: 700;">${escapeHtml(
        note.severity
      )}</span>`;
    } else {
      titleContent = `
                <div style="font-weight: 700; color: #374151;">${escapeHtml(
                  note.title
                )}</div>
                <div style="margin-top: 4px; color: #4b5563; font-size: 14px;">${escapeHtml(
                  note.description
                )}</div>
                ${
                  note.imageId
                    ? '<div style="margin-top: 8px;"><strong>مرفق صورة</strong></div>'
                    : ""
                }
            `;
      severityContent = `<span style="color: #374151; font-weight: 600;">${escapeHtml(
        note.severity
      )}</span>`;
    }

    // إضافة زر الحذف
    const actionsContent = `
            <button class="btn" onclick="removeNegative(${idx})" style="background-color: #ef4444; color: white; padding: 6px 12px; font-size: 13px; border-radius: 4px; border: none; cursor: pointer;">
                حذف
            </button>
        `;

    tr.innerHTML = `
            <td style="padding: 12px 8px; text-align: right; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word;">
                ${titleContent}
            </td>
            <td style="padding: 12px 8px; text-align: center; vertical-align: middle;">
                ${severityContent}
            </td>
            <td style="padding: 12px 8px; text-align: right; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; white-space: normal; max-width: 300px;">
                <div style="color: #4b5563; font-size: 14px; line-height: 1.5; overflow-wrap: break-word; word-break: break-word;">
                    ${correctiveContent}
                </div>
            </td>
            <td style="padding: 12px 8px; text-align: center; vertical-align: middle;">
                ${actionsContent}
            </td>
        `;

    tbody.appendChild(tr);

    // إضافة صف إضافي للصورة إذا كانت موجودة
    if (note.imageId) {
      const image = state.images.find((i) => i.id === note.imageId);
      if (image) {
        const imgRow = document.createElement("tr");
        imgRow.style.backgroundColor = "#f9fafb";
        imgRow.style.borderBottom = "1px solid #e5e7eb";
        imgRow.innerHTML = `
                    <td colspan="4" style="padding: 12px 8px; text-align: center;">
                        <img src="${image.dataUrl}" 
                             style="max-width: 300px; max-height: 200px; border-radius: 6px; border: 1px solid #d1d5db; margin: 0 auto; display: block;">
                    </td>
                `;
        tbody.appendChild(imgRow);
      }
    }
  });

  table.appendChild(tbody);
  container.appendChild(table);
}
/* عرض/اخفاء معرض الصور */
function showImagesPage() {
  document.getElementById("imagesPage").style.display = "block";
  renderImagesGrid();
}

function hideImagesPage() {
  document.getElementById("imagesPage").style.display = "none";
}

function renderImagesGrid() {
  const grid = document.getElementById("imagesGrid");
  grid.innerHTML = "";
  const allImages = [...state.images, ...state.bulkImages];
  if (allImages.length === 0) {
    grid.innerHTML = '<div style="color:#6b7280">لا توجد صور مرفوعة بعد.</div>';
    return;
  }
  allImages.forEach((img) => {
    const el = document.createElement("div");
    el.style.width = "140px";
    el.style.textAlign = "center";
    el.innerHTML = `<img src="${img.dataUrl}" alt="${escapeHtml(img.name)}">
<div style="font-size:12px; margin-top:6px;">${escapeHtml(img.name)}</div>`;
    grid.appendChild(el);
  });
}

/* رسالة نجاح مؤقتة */
function showTempMessage(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = "block";
  setTimeout(() => {
    el.style.display = "none";
  }, 2200);
}

/* ---------- معاينة التقرير الحي ---------- */
function renderPreview22() {
  const preview = document.getElementById("reportPreview");
  if (!preview) return;

  const contractor = document.getElementById("contractor").value.trim();
  const supervisor = document.getElementById("supervisor").textContent.trim();
  const projectName = document.getElementById("projectName").value.trim();
  const projectNumber = document.getElementById("projectNumber").value.trim();
  const location = document.getElementById("location").value.trim();
  const date = document.getElementById("inspectionDate").value;
  const visitType = document.getElementById("visitType");
  const visitTypeLabel = visitType.options[visitType.selectedIndex]?.text || "";

  let html = `
<div style="font-size:14px; direction: rtl; text-align: right;">
    <div><strong>جهة الإشراف:</strong> ${escapeHtml(supervisor)}</div>
    <div><strong>المقاول:</strong> ${escapeHtml(contractor)}</div>
    <div><strong>المشروع:</strong> ${escapeHtml(projectName)} (${escapeHtml(
    projectNumber
  )})</div>
    <div><strong>الموقع:</strong> ${escapeHtml(location)}</div>
    <div><strong>تاريخ الزيارة:</strong> ${escapeHtml(date)}</div>
    <div><strong>نوع الزيارة:</strong> ${escapeHtml(visitTypeLabel)}</div>

    <hr style="margin:10px 0;">
    <div><strong>نقاط القوة (الإيجابيات):</strong></div>
    <ul>
    `;

  if (state.positiveNotes.length === 0) {
    html += '<li style="color:#6b7280">لا توجد ملاحظات إيجابية بعد.</li>';
  } else {
    state.positiveNotes.forEach((n) => {
      html += `<li>${escapeHtml(n)}</li>`;
    });
  }
  html += `</ul>
    <hr style="margin:10px 0;">
    <div><strong>الملاحظات السلبية والمخالفات:</strong></div>`;

  if (state.negativeNotes.length === 0) {
    html +=
      '<div style="color:#6b7280; padding:10px;">لا توجد ملاحظات سلبية بعد.</div>';
  } else {
    html += `
        <table style="width:100%; border-collapse: collapse; margin-top:10px; font-size:13px; border: 1px solid #d1d5db;">
            <thead>
                <tr style="background-color: #f3f4f6; color: #374151; font-weight: 600;">
                    <th style="padding: 10px 8px; text-align: right; border: 1px solid #d1d5db;">الملاحظة / العنوان</th>
                    <th style="padding: 10px 8px; text-align: center; border: 1px solid #d1d5db; width: 100px;">درجة الخطورة</th>
                    <th style="padding: 10px 8px; text-align: right; border: 1px solid #d1d5db;">الإجراء المتخذ/المطلوب</th>
                </tr>
            </thead>
            <tbody>`;

    state.negativeNotes.forEach((note, idx) => {
      let titleContent = "";
      let severityContent = "";
      let correctiveContent = escapeHtml(note.corrective || "-");

      if (note.type === "violation") {
        titleContent = `
                    <div style="font-weight: 700; color: #dc2626;">${escapeHtml(
                      note.violationText
                    )}</div>
                    <div style="margin-top: 4px; color: #4b5563; font-size: 12px;">${escapeHtml(
                      note.description
                    )}</div>
                    ${
                      note.imageId
                        ? '<div style="margin-top: 6px; font-size: 11px;"><strong>مرفق صورة</strong></div>'
                        : ""
                    }
                    <div style="margin-top: 4px; font-size: 12px; color: #059669; font-weight: 600;">الغرامة: ${note.fine.toLocaleString()} ر.س</div>
                `;
        severityContent = `<span style="color: #dc2626; font-weight: 700;">${escapeHtml(
          note.severity
        )}</span>`;
      } else {
        titleContent = `
                    <div style="font-weight: 700; color: #374151;">${escapeHtml(
                      note.title
                    )}</div>
                    <div style="margin-top: 4px; color: #4b5563; font-size: 12px;">${escapeHtml(
                      note.description
                    )}</div>
                    ${
                      note.imageId
                        ? '<div style="margin-top: 6px; font-size: 11px;"><strong>مرفق صورة</strong></div>'
                        : ""
                    }
                `;
        severityContent = `<span style="color: #374151; font-weight: 600;">${escapeHtml(
          note.severity
        )}</span>`;
      }

      html += `
                <tr>
                    <td style="padding: 10px 8px; text-align: right; border: 1px solid #e5e7eb; vertical-align: top;">
                        ${titleContent}
                    </td>
                    <td style="padding: 10px 8px; text-align: center; border: 1px solid #e5e7eb; vertical-align: middle;">
                        ${severityContent}
                    </td>
                    <td style="padding: 10px 8px; text-align: right; border: 1px solid #e5e7eb; vertical-align: top;">
                        ${correctiveContent}
                    </td>
                </tr>`;

      // إضافة صف للصورة إذا كانت موجودة
      if (note.imageId) {
        const image = state.images.find((i) => i.id === note.imageId);
        if (image) {
          html += `
                <tr>
                    <td colspan="3" style="padding: 10px 8px; text-align: center; border: 1px solid #e5e7eb; background-color: #f9fafb;">
                        <img src="${image.dataUrl}" style="max-width: 200px; max-height: 150px; border-radius: 4px; border: 1px solid #d1d5db;">
                    </td>
                </tr>`;
        }
      }
    });

    html += `</tbody></table>`;

    // إضافة الفقرة المطلوبة بعد جدول الملاحظات السلبية
    html += `
        <div style="margin-top: 15px; padding: 10px; background-color: #f8f9fa; border-radius: 6px; border-right: 4px solid #007bff;">
            <h3 style="font-size:13px; color:#666; margin:0; text-align: right; line-height: 1.5;">
                تم إبلاغ المقاول بجميع الملاحظات المذكورة أعلاه لضرورة إتخاذ الإجراءات التصحيحية الفورية وخاصة الإجراءات المتعلقة بالمخاطر المرتفعة
            </h3>
        </div>`;

    // ملخص الغرامات
    const totalFines = state.negativeNotes.reduce(
      (acc, n) => acc + (n.fine || 0),
      0
    );
    if (totalFines > 0) {
      html += `
            <div style="margin-top: 15px; padding: 10px; background-color: #f9fafb; border-radius: 6px; border: 1px solid #e5e7eb;">
                <div style="font-weight: 700;">ملخص الغرامات:</div>
                <div style="margin-top: 5px;">إجمالي الغرامات المطبقة: <span style="font-weight:700; color: #dc2626;">${totalFines.toLocaleString()} ر.س</span></div>
            </div>`;
    }
  }

  // إضافة معلومات عن صور الباقة
  if (state.bulkImages.length > 0) {
    html += `
        <hr style="margin:10px 0;">
        <div><strong>صور إضافية:</strong></div>
        <div style="color:#6b7280; font-size:12px;">تم رفع ${state.bulkImages.length} صورة ستظهر في نهاية التقرير</div>`;
  }

  html += `</div>`;

  preview.innerHTML = html;
}
/* ---------- معاينة التقرير الحي ---------- */
function renderPreview() {
  const preview = document.getElementById("reportPreview");
  if (!preview) return;

  const contractor = document.getElementById("contractor").value.trim();
  const supervisor = document.getElementById("supervisor").textContent.trim();
  const projectName = document.getElementById("projectName").value.trim();
  const projectNumber = document.getElementById("projectNumber").value.trim();
  const location = document.getElementById("location").value.trim();
  const date = document.getElementById("inspectionDate").value;
  const visitType = document.getElementById("visitType");
  const visitTypeLabel = visitType.options[visitType.selectedIndex]?.text || "";

  let html = `
<div style="font-size:14px; direction: rtl; text-align: right;">
    <div><strong>جهة الإشراف:</strong> ${escapeHtml(supervisor)}</div>
    <div><strong>المقاول:</strong> ${escapeHtml(contractor)}</div>
    <div><strong>المشروع:</strong> ${escapeHtml(projectName)} (${escapeHtml(
    projectNumber
  )})</div>
    <div><strong>الموقع:</strong> ${escapeHtml(location)}</div>
    <div><strong>تاريخ الزيارة:</strong> ${escapeHtml(date)}</div>
    <div><strong>نوع الزيارة:</strong> ${escapeHtml(visitTypeLabel)}</div>

    <hr style="margin:10px 0;">
    <div><strong>نقاط القوة (الإيجابيات):</strong></div>
    <ul>
    `;

  if (state.positiveNotes.length === 0) {
    html += '<li style="color:#6b7280">لا توجد ملاحظات إيجابية بعد.</li>';
  } else {
    state.positiveNotes.forEach((n) => {
      html += `<li>${escapeHtml(n)}</li>`;
    });
  }
  html += `</ul>
    <hr style="margin:10px 0;">
    <div><strong>الملاحظات السلبية والمخالفات:</strong></div>`;

  if (state.negativeNotes.length === 0) {
    html +=
      '<div style="color:#6b7280; padding:10px;">لا توجد ملاحظات سلبية بعد.</div>';
  } else {
    html += `
        <table style="width:100%; border-collapse: collapse; margin-top:10px; font-size:13px; border: 1px solid #d1d5db; table-layout: fixed;">
            <thead>
                <tr style="background-color: #f3f4f6; color: #374151; font-weight: 600;">
                    <th style="padding: 10px 8px; text-align: right; border: 1px solid #d1d5db; width: 40%;">الملاحظة / العنوان</th>
                    <th style="padding: 10px 8px; text-align: center; border: 1px solid #d1d5db; width: 100px;">درجة الخطورة</th>
                    <th style="padding: 10px 8px; text-align: right; border: 1px solid #d1d5db; width: 40%;">الإجراء المتخذ/المطلوب</th>
                </tr>
            </thead>
            <tbody>`;

    state.negativeNotes.forEach((note, idx) => {
      let titleContent = "";
      let severityContent = "";
      let correctiveContent = escapeHtml(note.corrective || "-");

      if (note.type === "violation") {
        titleContent = `
                    <div style="font-weight: 700; color: #dc2626;">${escapeHtml(
                      note.violationText
                    )}</div>
                    <div style="margin-top: 4px; color: #4b5563; font-size: 12px;">${escapeHtml(
                      note.description
                    )}</div>
                    ${
                      note.imageId
                        ? '<div style="margin-top: 6px; font-size: 11px;"><strong>مرفق صورة</strong></div>'
                        : ""
                    }
                    <div style="margin-top: 4px; font-size: 12px; color: #059669; font-weight: 600;">الغرامة: ${note.fine.toLocaleString()} ر.س</div>
                `;
        severityContent = `<span style="color: #dc2626; font-weight: 700;">${escapeHtml(
          note.severity
        )}</span>`;
      } else {
        titleContent = `
                    <div style="font-weight: 700; color: #374151;">${escapeHtml(
                      note.title
                    )}</div>
                    <div style="margin-top: 4px; color: #4b5563; font-size: 12px;">${escapeHtml(
                      note.description
                    )}</div>
                    ${
                      note.imageId
                        ? '<div style="margin-top: 6px; font-size: 11px;"><strong>مرفق صورة</strong></div>'
                        : ""
                    }
                `;
        severityContent = `<span style="color: #374151; font-weight: 600;">${escapeHtml(
          note.severity
        )}</span>`;
      }

      html += `
                <tr>
                    <td style="padding: 10px 8px; text-align: right; border: 1px solid #e5e7eb; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word;">
                        ${titleContent}
                    </td>
                    <td style="padding: 10px 8px; text-align: center; border: 1px solid #e5e7eb; vertical-align: middle;">
                        ${severityContent}
                    </td>
                    <td style="padding: 10px 8px; text-align: right; border: 1px solid #e5e7eb; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; white-space: normal;">
                        <div style="color: #4b5563; font-size: 12px; line-height: 1.5; overflow-wrap: break-word; word-break: break-word;">
                            ${correctiveContent}
                        </div>
                    </td>
                </tr>`;

      // إضافة صف للصورة إذا كانت موجودة
      if (note.imageId) {
        const image = state.images.find((i) => i.id === note.imageId);
        if (image) {
          html += `
                <tr>
                    <td colspan="3" style="padding: 10px 8px; text-align: center; border: 1px solid #e5e7eb; background-color: #f9fafb;">
                        <img src="${image.dataUrl}" style="max-width: 200px; max-height: 150px; border-radius: 4px; border: 1px solid #d1d5db;">
                    </td>
                </tr>`;
        }
      }
    });

    html += `</tbody></table>`;

    // إضافة الفقرة المطلوبة بعد جدول الملاحظات السلبية
    html += `
        <div style="margin-top: 15px; padding: 10px; background-color: #f8f9fa; border-radius: 6px; border-right: 4px solid #007bff;">
            <h3 style="font-size:13px; color:#666; margin:0; text-align: right; line-height: 1.5;">
                تم إبلاغ المقاول بجميع الملاحظات المذكورة أعلاه لضرورة إتخاذ الإجراءات التصحيحية الفورية وخاصة الإجراءات المتعلقة بالمخاطر المرتفعة
            </h3>
        </div>`;

    // ملخص الغرامات
    const totalFines = state.negativeNotes.reduce(
      (acc, n) => acc + (n.fine || 0),
      0
    );
    if (totalFines > 0) {
      html += `
            <div style="margin-top: 15px; padding: 10px; background-color: #f9fafb; border-radius: 6px; border: 1px solid #e5e7eb;">
                <div style="font-weight: 700;">ملخص الغرامات:</div>
                <div style="margin-top: 5px;">إجمالي الغرامات المطبقة: <span style="font-weight:700; color: #dc2626;">${totalFines.toLocaleString()} ر.س</span></div>
            </div>`;
    }
  }

  // إضافة معلومات عن صور الباقة
  if (state.bulkImages.length > 0) {
    html += `
        <hr style="margin:10px 0;">
        <div><strong>صور إضافية:</strong></div>
        <div style="color:#6b7280; font-size:12px;">تم رفع ${state.bulkImages.length} صورة ستظهر في نهاية التقرير</div>`;
  }

  html += `</div>`;

  preview.innerHTML = html;
}
/* ---------- إنشاء التقرير في نافذة جديدة للطباعة ---------- */
function generateReport(returnHTML = false) {
  const contractor = document.getElementById("contractor").value.trim();
  const supervisor = document.getElementById("supervisor").textContent.trim();
  const projectName = document.getElementById("projectName").value.trim();
  const projectNumber = document.getElementById("projectNumber").value.trim();
  const location = document.getElementById("location").value.trim();
  const date = document.getElementById("inspectionDate").value;
  const visitType = document.getElementById("visitType");
  const visitTypeLabel = visitType.options[visitType.selectedIndex]?.text || "";

  // التحقق من البيانات المطلوبة
  if (!contractor) {
    alert("يرجى اختيار المقاول");
    document.getElementById("contractor").focus();
    return;
  }

  if (!projectName) {
    alert("يرجى إدخال اسم المشروع");
    document.getElementById("projectName").focus();
    return;
  }

  if (!projectNumber) {
    alert("يرجى إدخال رقم العقد");
    document.getElementById("projectNumber").focus();
    return;
  }

  if (!location) {
    alert("يرجى إدخال الموقع");
    document.getElementById("location").focus();
    return;
  }

  if (!date) {
    alert("يرجى اختيار تاريخ الزيارة");
    document.getElementById("inspectionDate").focus();
    return;
  }

  // تنسيق التاريخ
  let formattedDateDisplay = "";
  if (date) {
    const dateObj = new Date(date);
    const days = [
      "الأحد",
      "الإثنين",
      "الثلاثاء",
      "الأربعاء",
      "الخميس",
      "الجمعة",
      "السبت",
    ];
    const dayName = days[dateObj.getDay()];
    const day = dateObj.getDate();
    const month = dateObj.getMonth() + 1;
    const year = dateObj.getFullYear();
    formattedDateDisplay = `${dayName} - ${day
      .toString()
      .padStart(2, "0")}/${month.toString().padStart(2, "0")}/${year} م`;
  }

  // Capture header images
  const headerImgs = document.querySelectorAll("header img");
  const img1Src = headerImgs[0] ? headerImgs[0].src : "";
  const img2Src = headerImgs[1] ? headerImgs[1].src : "";

  let html = `
<!doctype html>
<html lang="ar" dir="rtl">

<head>
    <meta charset="utf-8">
    <title>نظام إدارة تقارير السلامة الميدانية - ${escapeHtml(
      projectName
    )}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200..1000&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: "Cairo", Tahoma, Arial, sans-serif;
            direction: rtl;
            padding: 20px;
            color: #111;
            background-color: #fff;
            max-width: 1000px;
            margin: 0 auto;
        }

        h1 {
            text-align: center;
            margin-bottom: 6px;
            font-size: 20px;
            font-weight: 800;
            color: #2c3e50;
        }

        h2 {
            text-align: center;
            margin-bottom: 20px;
            font-size: 18px;
            font-weight: 700;
            color: #34495e;
        }

        .meta {
            margin-bottom: 20px;
        }

        .meta table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            background-color: white;
        }
        
        .meta th {
            background-color: #2c5fa5;
            color: white;
            padding: 12px;
            text-align: right;
            font-size: 18px;
            border: 1px solid #ddd;
            width: 25%;
        }
        
        .meta td {
            padding: 12px;
            text-align: right;
            font-size: 16px;
            border: 1px solid #ddd;
            background-color: #e8f0fe;
            color: #333;
        }
        
        .meta tr:nth-child(even) td {
            background-color: #f2f6fc;
        }

        .section {
            margin-top: 20px;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e8eef8;
            background: #fff;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .section-title {
            font-weight: 700;
            color: #2c3e50;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 2px solid #3498db;
        }

        .note-img {
            max-width: 280px;
            width: 100%;
            height: auto;
            display: block;
            margin-top: 8px;
            border: 1px solid #e0e6ef;
            border-radius: 6px;
        }

        .bold {
            font-weight: 700;
        }

        .images-grid {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            margin-top: 8px;
            justify-content: center;
        }

        .images-grid img {
            width: 47%;
            height: 250px;
            object-fit: cover;
            border-radius: 6px;
            border: 1px solid #e0e6ef;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        /* Header Styles for Print */
        header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: #ebebeb;
            padding: 15px;
            margin-bottom: 25px;
            border-bottom: 2px solid #ccc;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            border-radius: 8px;
        }
        
        header img {
            height: 90px;
            width: auto;
            object-fit: contain;
            max-width: 250px;
        }
        
        /* Table styles for negative notes */
        .negative-notes-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            margin-bottom: 20px;
            font-size: 14px;
            border: 2px solid #ecf0f1;
            table-layout: fixed;
        }
        
        .negative-notes-table th {
            background-color: #2c3e50;
            color: white;
            font-weight: 600;
            padding: 12px 10px;
            text-align: right;
            border: 1px solid #34495e;
        }
        
        .negative-notes-table td {
            padding: 12px 10px;
            text-align: right;
            border: 1px solid #ecf0f1;
            vertical-align: top;
        }
        
        .negative-notes-table tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        
        .violation-title {
            color: #e74c3c;
            font-weight: 700;
            font-size: 15px;
        }
        
        .general-title {
            color: #2c3e50;
            font-weight: 700;
            font-size: 15px;
        }
        
        .severity-cell {
            text-align: center;
            width: 120px;
        }
        
        .action-cell {
            word-wrap: break-word;
            overflow-wrap: break-word;
            white-space: normal;
            line-height: 1.5;
            max-width: 300px;
        }
        
        .fine-amount {
            color: #27ae60;
            font-weight: 600;
            font-size: 13px;
            margin-top: 4px;
            padding: 3px 8px;
            background-color: #e8f6f3;
            border-radius: 4px;
            display: inline-block;
        }
        
        .image-row {
            background-color: #f9fafb;
        }
        
        .image-cell {
            text-align: center;
            padding: 15px !important;
        }
        
        .report-image {
            max-width: 300px;
            max-height: 200px;
            border-radius: 6px;
            border: 1px solid #d1d5db;
            margin: 0 auto;
            display: block;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .notification-box {
            margin-top: 20px;
            padding: 15px;
            background-color: #e8f4fc;
            border-radius: 8px;
            border-right: 4px solid #3498db;
            font-size: 13px;
            color: #2c3e50;
            line-height: 1.6;
            text-align: right;
            box-shadow: 0 2px 4px rgba(52, 152, 219, 0.1);
        }
        
        .fines-summary {
            margin-top: 20px;
            padding: 15px;
            background-color: #fff8e1;
            border-radius: 8px;
            border: 2px solid #f1c40f;
            font-size: 14px;
        }
        
        .footer-note {
            margin-top: 25px;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 8px;
            border-top: 2px solid #95a5a6;
            font-size: 12px;
            color: #7f8c8d;
            text-align: center;
        }
        
        ul {
            padding-right: 20px;
            margin: 10px 0;
        }
        
        li {
            margin-bottom: 8px;
            line-height: 1.5;
        }
        
        hr {
            border: none;
            border-top: 1px solid #ecf0f1;
            margin: 20px 0;
        }
        
        @media print {
            body {
                padding: 15px;
            }
            .no-print {
                display: none;
            }
            header {
                page-break-inside: avoid;
            }
            .section {
                page-break-inside: avoid;
            }
        }
    </style>
</head>

<body>
    <header>
        <img src="${img1Src}" alt="Logo">
        <img src="${img2Src}" alt="Logo">
    </header>
    
    <h1>نظام إدارة تقارير السلامة الميدانية</h1>
    <h2>تقرير متابعة إجراءات السلامة و الأمن في الموقع</h2>
    
    <div class="meta">
        <table>
            <tr>
                <th>المقاول:</th>
                <td>${escapeHtml(contractor)}</td>
            </tr>
            <tr>
                <th>جهة الاشراف:</th>
                <td>${escapeHtml(supervisor)}</td>
            </tr>
            <tr>
                <th>اسم المشروع:</th>
                <td>${escapeHtml(projectName)}</td>
            </tr>
            <tr>
                <th>رقم العقد/المشروع:</th>
                <td>${escapeHtml(projectNumber)}</td>
            </tr>
            <tr>
                <th>الموقع:</th>
                <td>${escapeHtml(location)}</td>
            </tr>
            <tr>
                <th>تاريخ الزيارة:</th>
                <td>${formattedDateDisplay}</td>
            </tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">نقاط القوة (الملاحظات الإيجابية):</div>
        <ul>
    `;

  if (state.positiveNotes.length === 0) {
    html += "<li>لا توجد ملاحظات إيجابية</li>";
  } else {
    state.positiveNotes.forEach((n) => (html += `<li>${escapeHtml(n)}</li>`));
  }

  html += `</ul>
    </div>`;

  html += `<div class="section">
        <div class="section-title">الملاحظات السلبية والمخالفات:</div>`;

  if (state.negativeNotes.length === 0) {
    html +=
      '<div style="color:#95a5a6; text-align:center; padding:20px;">لا توجد ملاحظات سلبية</div>';
  } else {
    // إنشاء جدول للملاحظات السلبية
    html += `
        <table class="negative-notes-table">
            <thead>
                <tr>
                    <th style="width: 40%;">الملاحظة / العنوان</th>
                    <th class="severity-cell">درجة الخطورة</th>
                    <th style="width: 40%;">الإجراء المتخذ/المطلوب</th>
                </tr>
            </thead>
            <tbody>`;

    state.negativeNotes.forEach((note) => {
      let titleContent = "";
      let severityContent = "";
      let correctiveContent = escapeHtml(note.corrective || "-");

      if (note.type === "violation") {
        titleContent = `
                    <div class="violation-title">${escapeHtml(
                      note.violationText
                    )}</div>
                    <div style="margin-top: 6px; color: #4b5563; font-size: 13px;">${escapeHtml(
                      note.description
                    )}</div>
                    ${
                      note.imageId
                        ? '<div style="margin-top: 8px; font-size: 12px; color: #7f8c8d;"><strong>✓ مرفق صورة</strong></div>'
                        : ""
                    }
                    <div class="fine-amount">الغرامة: ${note.fine.toLocaleString()} ر.س</div>
                `;
        severityContent = `<span style="color: #e74c3c; font-weight: 700; font-size: 14px;">${escapeHtml(
          note.severity
        )}</span>`;
      } else {
        titleContent = `
                    <div class="general-title">${escapeHtml(note.title)}</div>
                    <div style="margin-top: 6px; color: #4b5563; font-size: 13px;">${escapeHtml(
                      note.description
                    )}</div>
                    ${
                      note.imageId
                        ? '<div style="margin-top: 8px; font-size: 12px; color: #7f8c8d;"><strong>✓ مرفق صورة</strong></div>'
                        : ""
                    }
                `;
        severityContent = `<span style="color: #2c3e50; font-weight: 600; font-size: 14px;">${escapeHtml(
          note.severity
        )}</span>`;
      }

      html += `
                <tr>
                    <td style="word-wrap: break-word; overflow-wrap: break-word; white-space: normal; line-height: 1.5;">${titleContent}</td>
                    <td class="severity-cell">${severityContent}</td>
                    <td class="action-cell" style="word-wrap: break-word; overflow-wrap: break-word; white-space: normal; line-height: 1.5;">${correctiveContent}</td>
                </tr>`;

      // إضافة صف إضافي للصورة إذا كانت موجودة
      if (note.imageId) {
        const image = state.images.find((i) => i.id === note.imageId);
        if (image) {
          html += `
                <tr class="image-row">
                    <td colspan="3" class="image-cell">
                        <div style="font-weight: 600; margin-bottom: 8px; color: #3498db;">صورة الملاحظة:</div>
                        <img src="${image.dataUrl}" class="report-image">
                    </td>
                </tr>`;
        }
      }
    });

    html += `</tbody>
        </table>`;

    // إضافة الفقرة المطلوبة بعد جدول الملاحظات السلبية
    html += `
        <div class="notification-box">
            تم إبلاغ المقاول بجميع الملاحظات المذكورة أعلاه لضرورة إتخاذ الإجراءات التصحيحية الفورية وخاصة الإجراءات المتعلقة بالمخاطر المرتفعة
        </div>`;

    // ملخص الغرامات
    const totalFines = state.negativeNotes.reduce(
      (acc, n) => acc + (n.fine || 0),
      0
    );
    if (totalFines > 0) {
      html += `
        <div class="fines-summary">
            <div style="font-weight: 700; font-size: 15px; color: #d35400;">ملخص الغرامات:</div>
            <div style="margin-top: 8px; font-size: 14px;">إجمالي الغرامات المطبقة: <span style="font-weight:700; color: #c0392b; font-size: 16px;">${totalFines.toLocaleString()} ر.س</span></div>
        </div>`;
    }
  }

  html += `</div>`;

  // صفحة الصور النهائية - فقط الصور دون تفاصيل
  const allBulk = [...state.bulkImages];
  if (allBulk.length > 0) {
    html += `
        <div style="page-break-before:always; margin-top:25px;">
            <div class="section">
                <div class="section-title">صور المخالفات (صفحة الصور النهائية)</div>
                <div class="images-grid">
        `;

    allBulk.forEach((img) => {
      html += `<img src="${img.dataUrl}" alt="${escapeHtml(img.name)}">`;
    });

    html += `</div>
                <div style="text-align: center; margin-top: 15px; color: #7f8c8d; font-size: 13px;">
                    عدد الصور: ${allBulk.length} صورة
                </div>
            </div>
        </div>`;
  }

  html += `
        <div class="footer-note">
            تم إنشاء هذا التقرير بواسطة نظام إدارة تقارير السلامة الميدانية<br>
            تاريخ الإنشاء: ${new Date().toLocaleString("ar-SA", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}<br>
            <div style="margin-top: 8px; font-size: 11px; color: #bdc3c7;">
                جميع الحقوق محفوظة © ${new Date().getFullYear()} - نظام إدارة تقارير السلامة الميدانية
            </div>
        </div>
</body>

</html>
`;

  if (returnHTML) {
    return html;
  }

  const w = window.open(
    "",
    "_blank",
    "width=1200,height=800,scrollbars=yes,resizable=yes"
  );
  w.document.open();
  w.document.write(html);
  w.document.close();

  setTimeout(() => {
    w.focus();

    const printBtn = w.document.createElement("button");
    printBtn.textContent = "🖨️ طباعة التقرير";
    printBtn.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background-color: #3498db;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-family: "Cairo", sans-serif;
            font-size: 14px;
            z-index: 1000;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        `;
    printBtn.onclick = () => w.print();
    printBtn.onmouseover = () => (printBtn.style.backgroundColor = "#2980b9");
    printBtn.onmouseout = () => (printBtn.style.backgroundColor = "#3498db");

    w.document.body.appendChild(printBtn);

    const style = w.document.createElement("style");
    style.textContent = `
            @media print {
                button {
                    display: none !important;
                }
            }
        `;
    w.document.head.appendChild(style);

    alert(
      "تم إنشاء التقرير بنجاح. يمكنك معاينة التقرير والضغط على زر الطباعة في أعلى النافذة."
    );
  }, 500);
}
/* ---------- إنشاء التقرير في نافذة جديدة للطباعة ---------- */
function generateReport222(returnHTML = false) {
  const contractor = document.getElementById("contractor").value.trim();
  const supervisor = document.getElementById("supervisor").textContent.trim();
  const projectName = document.getElementById("projectName").value.trim();
  const projectNumber = document.getElementById("projectNumber").value.trim();
  const location = document.getElementById("location").value.trim();
  const date = document.getElementById("inspectionDate").value;
  const visitType = document.getElementById("visitType");
  const visitTypeLabel = visitType.options[visitType.selectedIndex]?.text || "";

  // التحقق من البيانات المطلوبة
  if (!contractor) {
    alert("يرجى اختيار المقاول");
    document.getElementById("contractor").focus();
    return;
  }

  if (!projectName) {
    alert("يرجى إدخال اسم المشروع");
    document.getElementById("projectName").focus();
    return;
  }

  if (!projectNumber) {
    alert("يرجى إدخال رقم العقد");
    document.getElementById("projectNumber").focus();
    return;
  }

  if (!location) {
    alert("يرجى إدخال الموقع");
    document.getElementById("location").focus();
    return;
  }

  if (!date) {
    alert("يرجى اختيار تاريخ الزيارة");
    document.getElementById("inspectionDate").focus();
    return;
  }

  // Capture header images
  const headerImgs = document.querySelectorAll("header img");
  const img1Src = headerImgs[0] ? headerImgs[0].src : "";
  const img2Src = headerImgs[1] ? headerImgs[1].src : "";

  let html = `
<!doctype html>
<html lang="ar" dir="rtl">

<head>
    <meta charset="utf-8">
    <title>نظام إدارة تقارير السلامة الميدانية - ${escapeHtml(
      projectName
    )}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200..1000&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: "Cairo", Tahoma, Arial, sans-serif;
            direction: rtl;
            padding: 20px;
            color: #111;
            background-color: #fff;
            max-width: 1000px;
            margin: 0 auto;
        }

        h1 {
            text-align: center;
            margin-bottom: 6px;
            font-size: 20px;
            font-weight: 800;
            color: #2c3e50;
        }

        h2 {
            text-align: center;
            margin-bottom: 20px;
            font-size: 18px;
            font-weight: 700;
            color: #34495e;
        }

        .meta {
            margin-bottom: 20px;
        }

        .meta table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
           border: 2px solid #2c5fa5; /* تغيير لون الحدود إلى الأزرق الداكن */
            border-radius: 8px;
        }
        
        .meta th {
            background-color: #2c5fa5;
            color: white;
            padding: 10px;
            text-align: right;
            width: 25%;
            border: 1px solid #2c5fa5;
        }
        
        .meta td {
            padding: 10px;
            text-align: right;
            border: 1px solid #2c5fa5;
            background-color: #e8f0fe;
        }

        .section {
            margin-top: 20px;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e8eef8;
            background: #fff;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .section-title {
            font-weight: 700;
            color: #2c3e50;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 2px solid #3498db;
        }

        .note-img {
            max-width: 280px;
            width: 100%;
            height: auto;
            display: block;
            margin-top: 8px;
            border: 1px solid #e0e6ef;
            border-radius: 6px;
        }

        .bold {
            font-weight: 700;
        }

        .images-grid {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            margin-top: 8px;
            justify-content: center;
        }

        .images-grid img {
            width: 47%;
            height: 250px;
            object-fit: cover;
            border-radius: 6px;
            border: 1px solid #e0e6ef;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        /* Header Styles for Print */
        header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: #ebebeb;
            padding: 15px;
            margin-bottom: 25px;
            border-bottom: 2px solid #ccc;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            border-radius: 8px;
        }
        
        header img {
            height: 90px;
            width: auto;
            object-fit: contain;
            max-width: 250px;
        }
        
        /* Table styles for negative notes */
        .negative-notes-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            margin-bottom: 20px;
            font-size: 14px;
            border: 2px solid #ecf0f1;
            table-layout: fixed; /* إضافة لتوزيع ثابت للعرض */
        }
        
        .negative-notes-table th {
            background-color: #2c3e50;
            color: white;
            font-weight: 600;
            padding: 12px 10px;
            text-align: right;
            border: 1px solid #34495e;
        }
        
        .negative-notes-table td {
            padding: 12px 10px;
            text-align: right;
            border: 1px solid #ecf0f1;
            vertical-align: top;
        }
        
        .negative-notes-table tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        
        .violation-title {
            color: #e74c3c;
            font-weight: 700;
            font-size: 15px;
        }
        
        .general-title {
            color: #2c3e50;
            font-weight: 700;
            font-size: 15px;
        }
        
        .severity-cell {
            text-align: center;
            width: 120px;
        }
        
        /* خلية الإجراء - تم تعديلها لكسر النص */
        .action-cell {
            word-wrap: break-word;
            overflow-wrap: break-word;
            white-space: normal;
            line-height: 1.5;
            max-width: 300px; /* يمكن تعديل هذا حسب الحاجة */
        }
        
        .fine-amount {
            color: #27ae60;
            font-weight: 600;
            font-size: 13px;
            margin-top: 4px;
            padding: 3px 8px;
            background-color: #e8f6f3;
            border-radius: 4px;
            display: inline-block;
        }
        
        .image-row {
            background-color: #f9fafb;
        }
        
        .image-cell {
            text-align: center;
            padding: 15px !important;
        }
        
        .report-image {
            max-width: 300px;
            max-height: 200px;
            border-radius: 6px;
            border: 1px solid #d1d5db;
            margin: 0 auto;
            display: block;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .notification-box {
            margin-top: 20px;
            padding: 15px;
            background-color: #e8f4fc;
            border-radius: 8px;
            border-right: 4px solid #3498db;
            font-size: 13px;
            color: #2c3e50;
            line-height: 1.6;
            text-align: right;
            box-shadow: 0 2px 4px rgba(52, 152, 219, 0.1);
        }
        
        .fines-summary {
            margin-top: 20px;
            padding: 15px;
            background-color: #fff8e1;
            border-radius: 8px;
            border: 2px solid #f1c40f;
            font-size: 14px;
        }
        
        .footer-note {
            margin-top: 25px;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 8px;
            border-top: 2px solid #95a5a6;
            font-size: 12px;
            color: #7f8c8d;
            text-align: center;
        }
        
        ul {
            padding-right: 20px;
            margin: 10px 0;
        }
        
        li {
            margin-bottom: 8px;
            line-height: 1.5;
        }
        
        hr {
            border: none;
            border-top: 1px solid #ecf0f1;
            margin: 20px 0;
        }
        
        @media print {
            body {
                padding: 15px;
            }
            .no-print {
                display: none;
            }
            header {
                page-break-inside: avoid;
            }
            .section {
                page-break-inside: avoid;
            }
        }
    </style>
</head>

<body>
    <header>
        <img src="${img1Src}" alt="Logo">
        <img src="${img2Src}" alt="Logo">
    </header>
    
    <h1>نظام إدارة تقارير السلامة الميدانية</h1>
    <h2>تقرير متابعة إجراءات السلامة و الأمن في الموقع</h2>
    
    <div class="meta">
        <table>
            <tr>
                <th>جهة الإشراف</th>
                <td>${escapeHtml(supervisor)}</td>
            </tr>
            <tr>   
                <th>المقاول</th>
                <td>${escapeHtml(contractor)}</td>
            </tr>
            <tr>
                <th>المشروع</th>
                <td>${escapeHtml(projectName)}</td> 
                </tr>
        <tr>
                <th>رقم العقد</th>
                <td>${escapeHtml(projectNumber)}</td>
            </tr>
            <tr>
                <th>الموقع</th>
                <td>${escapeHtml(location)}</td>
                 </tr>
        <tr>
                <th>تاريخ الزيارة</th>
                <td>${escapeHtml(date)}</td>
            </tr>
            <tr>
                <th>نوع الزيارة</th>
                <td colspan="3">${escapeHtml(visitTypeLabel)}</td>
            </tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">نقاط القوة (الملاحظات الإيجابية):</div>
        <ul>
    `;

  if (state.positiveNotes.length === 0) {
    html += "<li>لا توجد ملاحظات إيجابية</li>";
  } else {
    state.positiveNotes.forEach((n) => (html += `<li>${escapeHtml(n)}</li>`));
  }

  html += `</ul>
    </div>`;

  html += `<div class="section">
        <div class="section-title">الملاحظات السلبية والمخالفات:</div>`;

  if (state.negativeNotes.length === 0) {
    html +=
      '<div style="color:#95a5a6; text-align:center; padding:20px;">لا توجد ملاحظات سلبية</div>';
  } else {
    // إنشاء جدول للملاحظات السلبية
    html += `
        <table class="negative-notes-table">
            <thead>
                <tr>
                    <th style="width: 40%;">الملاحظة / العنوان</th>
                    <th class="severity-cell">درجة الخطورة</th>
                    <th style="width: 40%;">الإجراء المتخذ/المطلوب</th>
                </tr>
            </thead>
            <tbody>`;

    state.negativeNotes.forEach((note) => {
      // تحديد المحتوى بناءً على نوع الملاحظة
      let titleContent = "";
      let severityContent = "";
      let correctiveContent = escapeHtml(note.corrective || "-");

      if (note.type === "violation") {
        titleContent = `
                    <div class="violation-title">${escapeHtml(
                      note.violationText
                    )}</div>
                    <div style="margin-top: 6px; color: #4b5563; font-size: 13px;">${escapeHtml(
                      note.description
                    )}</div>
                    ${
                      note.imageId
                        ? '<div style="margin-top: 8px; font-size: 12px; color: #7f8c8d;"><strong>✓ مرفق صورة</strong></div>'
                        : ""
                    }
                    <div class="fine-amount">الغرامة: ${note.fine.toLocaleString()} ر.س</div>
                `;
        severityContent = `<span style="color: #e74c3c; font-weight: 700; font-size: 14px;">${escapeHtml(
          note.severity
        )}</span>`;
      } else {
        titleContent = `
                    <div class="general-title">${escapeHtml(note.title)}</div>
                    <div style="margin-top: 6px; color: #4b5563; font-size: 13px;">${escapeHtml(
                      note.description
                    )}</div>
                    ${
                      note.imageId
                        ? '<div style="margin-top: 8px; font-size: 12px; color: #7f8c8d;"><strong>✓ مرفق صورة</strong></div>'
                        : ""
                    }
                `;
        severityContent = `<span style="color: #2c3e50; font-weight: 600; font-size: 14px;">${escapeHtml(
          note.severity
        )}</span>`;
      }

      html += `
                <tr>
                    <td style="word-wrap: break-word; overflow-wrap: break-word; white-space: normal; line-height: 1.5;">${titleContent}</td>
                    <td class="severity-cell">${severityContent}</td>
                    <td class="action-cell" style="word-wrap: break-word; overflow-wrap: break-word; white-space: normal; line-height: 1.5;">${correctiveContent}</td>
                </tr>`;

      // إضافة صف إضافي للصورة إذا كانت موجودة
      if (note.imageId) {
        const image = state.images.find((i) => i.id === note.imageId);
        if (image) {
          html += `
                <tr class="image-row">
                    <td colspan="3" class="image-cell">
                        <div style="font-weight: 600; margin-bottom: 8px; color: #3498db;">صورة الملاحظة:</div>
                        <img src="${image.dataUrl}" class="report-image">
                    </td>
                </tr>`;
        }
      }
    });

    html += `</tbody>
        </table>`;

    // إضافة الفقرة المطلوبة بعد جدول الملاحظات السلبية
    html += `
        <div class="notification-box">
            تم إبلاغ المقاول بجميع الملاحظات المذكورة أعلاه لضرورة إتخاذ الإجراءات التصحيحية الفورية وخاصة الإجراءات المتعلقة بالمخاطر المرتفعة
        </div>`;

    // ملخص الغرامات
    const totalFines = state.negativeNotes.reduce(
      (acc, n) => acc + (n.fine || 0),
      0
    );
    if (totalFines > 0) {
      html += `
        <div class="fines-summary">
            <div style="font-weight: 700; font-size: 15px; color: #d35400;">ملخص الغرامات:</div>
            <div style="margin-top: 8px; font-size: 14px;">إجمالي الغرامات المطبقة: <span style="font-weight:700; color: #c0392b; font-size: 16px;">${totalFines.toLocaleString()} ر.س</span></div>
        </div>`;
    }
  }

  html += `</div>`; // إغلاق div.section للملاحظات السلبية

  // صفحة الصور النهائية - فقط الصور دون تفاصيل
  const allBulk = [...state.bulkImages];
  if (allBulk.length > 0) {
    html += `
        <div style="page-break-before:always; margin-top:25px;">
            <div class="section">
                <div class="section-title">صور المخالفات (صفحة الصور النهائية)</div>
                <div class="images-grid">
        `;

    allBulk.forEach((img) => {
      html += `<img src="${img.dataUrl}" alt="${escapeHtml(img.name)}">`;
    });

    html += `</div>
                <div style="text-align: center; margin-top: 15px; color: #7f8c8d; font-size: 13px;">
                    عدد الصور: ${allBulk.length} صورة
                </div>
            </div>
        </div>`;
  }

  html += `
        <div class="footer-note">
            تم إنشاء هذا التقرير بواسطة نظام إدارة تقارير السلامة الميدانية<br>
            تاريخ الإنشاء: ${new Date().toLocaleString("ar-SA", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}<br>
            <div style="margin-top: 8px; font-size: 11px; color: #bdc3c7;">
                جميع الحقوق محفوظة © ${new Date().getFullYear()} - نظام إدارة تقارير السلامة الميدانية
            </div>
        </div>
</body>

</html>
`;

  if (returnHTML) {
    return html;
  }

  const w = window.open(
    "",
    "_blank",
    "width=1200,height=800,scrollbars=yes,resizable=yes"
  );
  w.document.open();
  w.document.write(html);
  w.document.close();

  // إضافة زر للطباعة في نافذة التقرير
  setTimeout(() => {
    w.focus();

    // إضافة زر طباعة في التقرير
    const printBtn = w.document.createElement("button");
    printBtn.textContent = "🖨️ طباعة التقرير";
    printBtn.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background-color: #3498db;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-family: "Cairo", sans-serif;
            font-size: 14px;
            z-index: 1000;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        `;
    printBtn.onclick = () => w.print();
    printBtn.onmouseover = () => (printBtn.style.backgroundColor = "#2980b9");
    printBtn.onmouseout = () => (printBtn.style.backgroundColor = "#3498db");

    w.document.body.appendChild(printBtn);

    // إضافة فئة no-print لإخفاء الزر عند الطباعة
    const style = w.document.createElement("style");
    style.textContent = `
            @media print {
                button {
                    display: none !important;
                }
            }
        `;
    w.document.head.appendChild(style);

    // عرض رسالة للمستخدم
    alert(
      "تم إنشاء التقرير بنجاح. يمكنك معاينة التقرير والضغط على زر الطباعة في أعلى النافذة."
    );
  }, 500);
}

/* ---------- مسح النموذج ---------- */
function clearForm() {
  if (
    !confirm(
      "هل أنت متأكد من مسح النموذج (سيتم حذف جميع الملاحظات والصور المضافة)؟"
    )
  )
    return;

  state.positiveNotes = [];
  state.negativeNotes = [];
  state.images = [];
  state.bulkImages = [];

  // إعادة تعيين بيانات المقاول
  const defaultContractor = "شركة منار الوطنية للمقاولات";
  document.getElementById("contractor").value = defaultContractor;
  updateContractorDetails(defaultContractor);

  document.getElementById("inspectionDate").value = new Date()
    .toISOString()
    .split("T")[0];
  document.getElementById("visitType").value = "1";

  // إعادة تعيين نموذج المخالفات
  document.getElementById("violationType").value = "";
  updateFineAmount();
  document.getElementById("violationDescription").value = "";
  document.getElementById("violationCorrectiveAction").value = "";
  document.getElementById("violationFileInput").value = "";
  document.getElementById("violationFileName").textContent =
    "لم يتم اختيار ملف";

  // إعادة تعيين أزرار درجة الخطورة
  const severityRadios = document.querySelectorAll('input[name="severity"]');
  if (severityRadios.length > 0) severityRadios[0].checked = true;

  // إعادة تعيين نموذج الملاحظات العامة
  document.getElementById("generalNoteTitle").value = "";
  document.getElementById("generalNoteDescription").value = "";
  document.getElementById("generalCorrectiveAction").value = "";
  document.getElementById("generalFileInput").value = "";
  document.getElementById("generalFileName").textContent = "لم يتم اختيار ملف";

  // إعادة تعيين أزرار درجة الخطورة العامة
  const generalSeverityRadios = document.querySelectorAll(
    'input[name="generalSeverity"]'
  );
  if (generalSeverityRadios.length > 0) generalSeverityRadios[0].checked = true;

  // إعادة تعيين صور الباقة
  document.getElementById("bulkImageInput").value = "";
  document.getElementById("bulkPreview").innerHTML = "";

  // إعادة تعيين عرض النماذج
  document.getElementById("toggleViolation").classList.add("active");
  document.getElementById("toggleGeneral").classList.remove("active");
  document.getElementById("violationNoteForm").style.display = "block";
  document.getElementById("generalNoteForm").style.display = "none";

  // إعادة تعيين الملاحظات الإيجابية
  document.getElementById("positiveNoteSelect").value = "";
  document.getElementById("customPositiveNote").value = "";
  document.getElementById("customNoteContainer").style.display = "none";

  renderPositiveList();
  renderNegativeList();
  renderPreview();

  alert("تم مسح النموذج بنجاح وإعادة تعيين جميع الحقول.");
}

/* استرجاع اسم المخالفة كنص */
function getViolationLabel(key) {
  const sel = document.getElementById("violationType");
  const opt = Array.from(sel.options).find((o) => o.value === key);
  return opt ? opt.text : `مخالفة ${key}`;
}

/* حماية XSS */
function escapeHtml(unsafe) {
  if (unsafe === undefined || unsafe === null) return "";
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
