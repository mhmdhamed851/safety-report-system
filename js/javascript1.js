/* =============================== */
/* ========== script.js ========== */
/* =============================== */

const state = {
  positiveNotes: [],
  negativeNotes: [],
  images: [], // جميع الصور
  bulkImages: [], // صور مخصصة لصفحة الصور النهائية فقط
};

/* ---------- بيانات المقاولين ---------- */
const contractorsData = {
  "شركة منار الوطنية للمقاولات": {
    projectName: "مشروع تنفيذ أعمال شبكات المياه بالمناطق المحيطة بخران ناوان والأحسبة",
    projectNumber: "141250115",
    location: "الباحة - المخواة - الأحسبة",
  },
  "شركة الهداية للمقاولات": {
    projectName: "مشروع توسعة شبكة الصرف الصحي بمنطقة الرياض الشمالية",
    projectNumber: "142250220",
    location: "الرياض - حي العليا",
  }
};

/* ---------- تهيئة الصفحة ---------- */
document.addEventListener("DOMContentLoaded", () => {
  loadCustomContractors();
  const defaultContractor = "شركة منار الوطنية للمقاولات";
  document.getElementById("contractor").value = defaultContractor;
  updateContractorDetails(defaultContractor);
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("inspectionDate").value = today;

  renderPositiveList();
  renderNegativeList();
  renderPreview();
});

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
  }
  renderPreview();
}

function loadCustomContractors() {
  const customContractors = JSON.parse(localStorage.getItem("customContractors") || "{}");
  const select = document.getElementById("contractor");
  Object.keys(customContractors).forEach((contractorName) => {
    const newOption = document.createElement("option");
    newOption.value = contractorName;
    newOption.textContent = contractorName;
    const customOption = select.querySelector('option[value="custom"]');
    select.insertBefore(newOption, customOption);
  });
}

/* ---------- ملاحظات ايجابية ---------- */
function addPositiveToList(text) {
  state.positiveNotes.push(text);
  renderPositiveList();
  renderPreview();
}

function renderPositiveList() {
  const container = document.getElementById("positiveList");
  container.innerHTML = "";
  state.positiveNotes.forEach((note, idx) => {
    const div = document.createElement("div");
    div.className = "note-item";
    div.innerHTML = `<div style="flex:1; text-align:right;">${escapeHtml(note)}</div>
    <button class="btn" onclick="removePositive(${idx})">حذف</button>`;
    container.appendChild(div);
  });
}

function removePositive(idx) { state.positiveNotes.splice(idx, 1); renderPositiveList(); renderPreview(); }

/* ---------- إدارة الصور وتعددها ---------- */
function readImageFile(file, callback) {
  const reader = new FileReader();
  reader.onload = (e) => callback(e.target.result);
  reader.readAsDataURL(file);
}

function handleBulkImages(input) {
  if (!input.files) return;
  Array.from(input.files).forEach((file, idx) => {
    readImageFile(file, (dataUrl) => {
      state.bulkImages.push({ id: "bulk-" + Date.now() + idx, dataUrl, name: file.name });
      renderPreview();
    });
  });
}

/* ---------- إضافة المخالفات والملاحظات السلبية ---------- */
const fineMapping = { 1: 5000, 2: 2000, 4: 2000, 6: 5000, 10: 2000, 27: 2000, 30: 5000, 53: 2000 };
function updateFineAmount() {
  const val = document.getElementById("violationType").value;
  const container = document.getElementById("fineAmountContainer");
  if (val && fineMapping[val]) {
    document.getElementById("fineAmount").textContent = `${fineMapping[val].toLocaleString()} ريال`;
    container.style.display = "flex";
  } else { container.style.display = "none"; }
}

function addViolationNote() {
  const type = document.getElementById("violationType").value;
  const desc = document.getElementById("violationDescription").value.trim();
  const severity = document.querySelector('input[name="severity"]:checked')?.value;
  const corrective = document.getElementById("violationCorrectiveAction").value.trim();
  const fileInput = document.getElementById("violationFileInput");

  if (!type || !desc) return alert("أكمل البيانات المطلوبة");

  const note = { id: "v-" + Date.now(), type: "violation", violationText: getViolationLabel(type), description: desc, severity, corrective, fine: fineMapping[type] || 0, imageIds: [] };

  if (fileInput.files && fileInput.files.length > 0) {
    let loaded = 0;
    Array.from(fileInput.files).forEach((file) => {
      readImageFile(file, (dataUrl) => {
        const imgId = "img-" + Date.now() + Math.random();
        state.images.push({ id: imgId, dataUrl, name: file.name });
        note.imageIds.push(imgId);
        loaded++;
        if (loaded === fileInput.files.length) {
          state.negativeNotes.push(note);
          renderNegativeList(); renderPreview();
        }
      });
    });
  } else {
    state.negativeNotes.push(note);
    renderNegativeList(); renderPreview();
  }
}

function addGeneralNote() {
  const title = document.getElementById("generalNoteTitle").value.trim();
  const desc = document.getElementById("generalNoteDescription").value.trim();
  const severity = document.querySelector('input[name="generalSeverity"]:checked')?.value;
  const corrective = document.getElementById("generalCorrectiveAction").value.trim();
  const fileInput = document.getElementById("generalFileInput");

  if (!title || !desc) return alert("أكمل البيانات");

  const note = { id: "g-" + Date.now(), type: "general", title, description: desc, severity, corrective, imageIds: [] };

  if (fileInput.files && fileInput.files.length > 0) {
    let loaded = 0;
    Array.from(fileInput.files).forEach((file) => {
      readImageFile(file, (dataUrl) => {
        const imgId = "img-" + Date.now() + Math.random();
        state.images.push({ id: imgId, dataUrl, name: file.name });
        note.imageIds.push(imgId);
        loaded++;
        if (loaded === fileInput.files.length) {
          state.negativeNotes.push(note);
          renderNegativeList(); renderPreview();
        }
      });
    });
  } else {
    state.negativeNotes.push(note);
    renderNegativeList(); renderPreview();
  }
}

function removeNegative(idx) { state.negativeNotes.splice(idx, 1); renderNegativeList(); renderPreview(); }

/* ---------- المعاينة الحية وإضافة اسم المراقب ---------- */
function renderPreview() {
  const preview = document.getElementById("reportPreview");
  if (!preview) return;

  const observer = document.getElementById("safetyObserverName")?.value || "لم يتم الاختيار";
  const contractor = document.getElementById("contractor").value;
  const projectName = document.getElementById("projectName").value;
  const date = document.getElementById("inspectionDate").value;
  const visitTypeLabel = document.getElementById("visitType").options[document.getElementById("visitType").selectedIndex]?.text || "";

  let html = `
  <div style="font-size:14px; direction: rtl; text-align: right;">
    <div><strong>مراقب السلامة:</strong> ${escapeHtml(observer)}</div>
    <div><strong>المقاول:</strong> ${escapeHtml(contractor)}</div>
    <div><strong>المشروع:</strong> ${escapeHtml(projectName)}</div>
    <div><strong>تاريخ الزيارة:</strong> ${escapeHtml(date)}</div>
    <div><strong>نوع الزيارة:</strong> ${escapeHtml(visitTypeLabel)}</div>
    <hr>
    <div><strong>الملاحظات السلبية:</strong> ${state.negativeNotes.length} ملاحظة</div>
  </div>`;
  preview.innerHTML = html;
}

/* ---------- إنشاء التقرير النهائي (الطباعة) ---------- */
function generateReport(returnHTML = false) {
  const supervisor = document.getElementById("supervisor").textContent.trim();
  const contractor = document.getElementById("contractor").value.trim();
  const projectName = document.getElementById("projectName").value.trim();
  const projectNumber = document.getElementById("projectNumber").value.trim();
  const location = document.getElementById("location").value.trim();
  const date = document.getElementById("inspectionDate").value;
  const observer = document.getElementById("safetyObserverName")?.value || "لم يتم الاختيار";
  const visitTypeLabel = document.getElementById("visitType").options[document.getElementById("visitType").selectedIndex]?.text || "";

  if (!contractor || !projectName) return alert("يرجى إكمال البيانات الأساسية");

  const headerImgs = document.querySelectorAll("header img");
  const img1Src = headerImgs[0]?.src || "";
  const img2Src = headerImgs[1]?.src || "";

  let html = `
<!doctype html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <title>تقرير السلامة - ${escapeHtml(projectName)}</title>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Cairo', sans-serif; direction: rtl; padding: 20px; color: #333; }
        header { display: flex; justify-content: space-between; align-items: center; background: #f0f0f0; padding: 10px; border-bottom: 2px solid #ccc; }
        header img { height: 70px; }
        .meta-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .meta-table th { background: #2c5fa5; color: white; padding: 10px; text-align: right; border: 1px solid #ddd; width: 25%; }
        .meta-table td { padding: 10px; border: 1px solid #ddd; background: #f9f9f9; }
        .section { margin-top: 25px; border: 1px solid #eee; padding: 15px; border-radius: 8px; }
        .section-title { font-weight: bold; border-bottom: 2px solid #3498db; margin-bottom: 10px; }
        .neg-table { width: 100%; border-collapse: collapse; margin-top: 10px; table-layout: fixed; }
        .neg-table th { background: #2c3e50; color: white; padding: 10px; border: 1px solid #ddd; }
        .neg-table td { padding: 10px; border: 1px solid #ddd; vertical-align: top; word-wrap: break-word; }
        .report-img { max-width: 250px; margin: 5px; border-radius: 5px; border: 1px solid #ccc; }
        .observer-footer { margin-top: 40px; border-top: 2px solid #333; padding-top: 15px; display: flex; justify-content: space-between; }
    </style>
</head>
<body>
    <header><img src="${img1Src}"><img src="${img2Src}"></header>
    <h1 style="text-align:center;">تقرير متابعة إجراءات السلامة في الموقع</h1>
    
    <table class="meta-table">
        <tr><th>مراقب السلامة:</th><td>${escapeHtml(observer)}</td></tr>
        <tr><th>جهة الإشراف:</th><td>${escapeHtml(supervisor)}</td></tr>
        <tr><th>المقاول:</th><td>${escapeHtml(contractor)}</td></tr>
        <tr><th>المشروع:</th><td>${escapeHtml(projectName)}</td></tr>
        <tr><th>الموقع:</th><td>${escapeHtml(location)}</td></tr>
        <tr><th>تاريخ الزيارة:</th><td>${escapeHtml(date)}</td></tr>
    </table>

    <div class="section">
        <div class="section-title">الملاحظات السلبية والإجراءات التصحيحية:</div>
        <table class="neg-table">
            <thead><tr><th>الملاحظة</th><th style="width:100px;">الخطورة</th><th>الإجراء المطلوب</th></tr></thead>
            <tbody>`;

  state.negativeNotes.forEach(note => {
    html += `<tr>
        <td><strong>${escapeHtml(note.violationText || note.title)}</strong><br>${escapeHtml(note.description)}</td>
        <td style="text-align:center;">${escapeHtml(note.severity)}</td>
        <td>${escapeHtml(note.corrective)}</td>
    </tr>`;
    if (note.imageIds && note.imageIds.length > 0) {
        html += `<tr><td colspan="3" style="text-align:center; background:#fcfcfc;">`;
        note.imageIds.forEach(id => {
            const img = state.images.find(i => i.id === id);
            if (img) html += `<img src="${img.dataUrl}" class="report-image" style="max-width:280px; margin:5px; border:1px solid #ddd;">`;
        });
        html += `</td></tr>`;
    }
  });

  html += `</tbody></table></div>`;

  // صفحة الصور النهائية
  if (state.bulkImages.length > 0) {
      html += `<div style="page-break-before:always;" class="section">
      <div class="section-title">صور لموقع العمل</div>
      <div style="display:flex; flex-wrap:wrap; justify-content:center;">`;
      state.bulkImages.forEach(img => {
          html += `<img src="${img.dataUrl}" style="width:45%; margin:5px; height:250px; object-fit:cover; border-radius:5px;">`;
      });
      html += `</div></div>`;
  }

  // قسم التوقيع والاسم في النهاية
  html += `
    <div class="observer-footer">
        <div style="text-align: right;">
            <p><strong>معد التقرير (مراقب السلامة):</strong></p>
            <p style="font-size: 18px; font-weight: bold;">${escapeHtml(observer)}</p>
        </div>
        <div style="text-align: left;">
            <p><strong>التوقيع:</strong></p>
            <div style="margin-top: 10px; width: 150px; border-bottom: 1px solid #000; height: 30px;"></div>
        </div>
    </div>
    <div style="text-align:center; font-size:10px; margin-top:50px; color:#aaa;">جميع الحقوق محفوظة © 2025</div>
</body></html>`;

  if (returnHTML) return html;
  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
}

function getViolationLabel(key) {
  const sel = document.getElementById("violationType");
  return Array.from(sel.options).find(o => o.value === key)?.text || "مخالفة";
}

function escapeHtml(unsafe) {
  if (!unsafe) return "";
  return String(unsafe).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#039;"}[m]));
}

function clearForm() {
    if(confirm("هل تريد مسح البيانات؟")) location.reload();
}
