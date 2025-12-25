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
