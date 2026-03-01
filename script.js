function drawHeader(doc, carrierText){
  const w = doc.internal.pageSize.getWidth();
  doc.setFontSize(14);
  doc.text("TRAVEL ITINERARY / BOOKING SUMMARY", 14, 14);

  doc.setFontSize(10);
  doc.text(carrierText ? `Carrier: ${carrierText}` : "Carrier: —", 14, 20);

  doc.setDrawColor(0);
  doc.setLineWidth(0.4);
  doc.line(14, 23, w - 14, 23);
}

function drawFooter(doc, pageNum, totalPages){
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();

  doc.setFontSize(9);
  doc.text(`Issued: ${new Date().toLocaleDateString()}`, 14, h - 10);
  doc.text(`Page ${pageNum} of ${totalPages}`, w - 14, h - 10, { align: "right" });

  // small, not watermark
  doc.setFontSize(8);
  doc.text("Note: This is an itinerary/summary document and is not a verifiable e-ticket.", 14, h - 6);
}
const PASSENGER_MAX = 5;
const SEGMENT_MAX = 8;

const AIRPORTS = [
  { code: "DAC", city: "Dhaka" },
  { code: "CGP", city: "Chattogram" },
  { code: "ZYL", city: "Sylhet" },
  { code: "SIN", city: "Singapore" },
  { code: "DXB", city: "Dubai" },
  { code: "KUL", city: "Kuala Lumpur" },
  { code: "BKK", city: "Bangkok" },
  { code: "DEL", city: "Delhi" },
  { code: "BOM", city: "Mumbai" },
  { code: "DOH", city: "Doha" },
  { code: "JED", city: "Jeddah" },
  { code: "RUH", city: "Riyadh" },
  { code: "LHR", city: "London" },
  { code: "IST", city: "Istanbul" },
  { code: "SYD", city: "Sydney" },
  { code: "MEL", city: "Melbourne" },
];

const passengersBox = document.getElementById("passengers");
const segmentsBox = document.getElementById("segments");
const addPassengerBtn = document.getElementById("addPassengerBtn");
const addSegmentBtn = document.getElementById("addSegmentBtn");
const generatePdfBtn = document.getElementById("generatePdfBtn");
const previewBox = document.getElementById("previewBox");

function airportOptions(selected) {
  return AIRPORTS.map(a => {
    const sel = a.code === selected ? "selected" : "";
    return `<option value="${a.code}" ${sel}>${a.city} (${a.code})</option>`;
  }).join("");
}

function todayISO(){
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth()+1).padStart(2,"0");
  const dd = String(d.getDate()).padStart(2,"0");
  return `${yyyy}-${mm}-${dd}`;
}

function fmtDate(iso){
  if(!iso) return "—";
  const dt = new Date(iso);
  if(Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString(undefined, { year:"numeric", month:"short", day:"2-digit" });
}

let passengers = [
  { title: "MR", fullName: "", nationality: "Bangladesh", passport: "" }
];

let segments = [
  { from: "DAC", to: "SIN", date: todayISO(), flightNo: "", departTime: "10:00", arriveTime: "18:00" },
  { from: "SIN", to: "DAC", date: "", flightNo: "", departTime: "11:00", arriveTime: "19:00" }
];

function renderPassengers(){
  passengersBox.innerHTML = "";
  passengers.forEach((p, idx) => {
    const div = document.createElement("div");
    div.className = "group";
    div.innerHTML = `
      <div class="grouphead">
        <b>Passenger ${idx+1}</b>
        ${passengers.length > 1 ? `<button type="button" class="smallbtn" data-rm-pass="${idx}">Remove</button>` : ""}
      </div>

      <div class="row">
        <label>
          Title
          <select data-pass-title="${idx}">
            ${["MR","MRS","MS","MISS","DR"].map(t => `<option ${t===p.title?"selected":""}>${t}</option>`).join("")}
          </select>
        </label>
        <label>
          Full Name
          <input data-pass-name="${idx}" placeholder="e.g., ABC XYZ" value="${escapeHtml(p.fullName)}" />
        </label>
      </div>

      <div class="row">
        <label>
          Nationality
          <input data-pass-nat="${idx}" placeholder="Bangladesh" value="${escapeHtml(p.nationality)}" />
        </label>
        <label>
          Passport No (optional)
          <input data-pass-pp="${idx}" placeholder="Optional" value="${escapeHtml(p.passport)}" />
        </label>
      </div>
    `;
    passengersBox.appendChild(div);
  });
}

function renderSegments(){
  segmentsBox.innerHTML = "";
  segments.forEach((s, idx) => {
    const div = document.createElement("div");
    div.className = "group";
    div.innerHTML = `
      <div class="grouphead">
        <b>Segment ${idx+1}</b>
        ${segments.length > 1 ? `<button type="button" class="smallbtn" data-rm-seg="${idx}">Remove</button>` : ""}
      </div>

      <div class="row">
        <label>
          From
          <select data-seg-from="${idx}">${airportOptions(s.from)}</select>
        </label>
        <label>
          To
          <select data-seg-to="${idx}">${airportOptions(s.to)}</select>
        </label>
      </div>

      <div class="row">
        <label>
          Date
          <input type="date" data-seg-date="${idx}" value="${escapeHtml(s.date)}" />
        </label>
        <label>
          Flight No (text)
          <input data-seg-flight="${idx}" placeholder="e.g., SQ447" value="${escapeHtml(s.flightNo)}" />
        </label>
      </div>

      <div class="row">
        <label>
          Depart Time
          <input type="time" data-seg-dep="${idx}" value="${escapeHtml(s.departTime)}" />
        </label>
        <label>
          Arrive Time
          <input type="time" data-seg-arr="${idx}" value="${escapeHtml(s.arriveTime)}" />
        </label>
      </div>
    `;
    segmentsBox.appendChild(div);
  });
}

function escapeHtml(str){
  return (str ?? "").toString()
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function syncFromUI(){
  // passengers
  passengers = passengers.map((p, idx) => ({
    title: document.querySelector(`[data-pass-title="${idx}"]`)?.value || p.title,
    fullName: document.querySelector(`[data-pass-name="${idx}"]`)?.value || "",
    nationality: document.querySelector(`[data-pass-nat="${idx}"]`)?.value || "",
    passport: document.querySelector(`[data-pass-pp="${idx}"]`)?.value || "",
  }));

  // segments
  segments = segments.map((s, idx) => ({
    from: document.querySelector(`[data-seg-from="${idx}"]`)?.value || s.from,
    to: document.querySelector(`[data-seg-to="${idx}"]`)?.value || s.to,
    date: document.querySelector(`[data-seg-date="${idx}"]`)?.value || "",
    flightNo: document.querySelector(`[data-seg-flight="${idx}"]`)?.value || "",
    departTime: document.querySelector(`[data-seg-dep="${idx}"]`)?.value || "",
    arriveTime: document.querySelector(`[data-seg-arr="${idx}"]`)?.value || "",
  }));
}

function updatePreview(){
  syncFromUI();
  const cabin = document.getElementById("cabin").value;
  const baggage = document.getElementById("baggage").value || "—";

  const paxLines = passengers.map((p,i)=> `${i+1}. ${p.title} ${p.fullName || "—"} (${p.nationality || "—"})`).join("\n");
  const segLines = segments.map((s,i)=> `${i+1}. ${s.from} → ${s.to} | ${fmtDate(s.date)} | ${s.flightNo||"—"} | ${s.departTime||"—"}-${s.arriveTime||"—"}`).join("\n");

  previewBox.innerHTML = `
    <div class="preview-title">Quick Preview</div>
    <div class="preview-sub">Passengers & segments summary</div>
    <pre>
Passengers:
${paxLines}

Segments:
${segLines}

Cabin: ${cabin}
Baggage: ${baggage}
    </pre>
  `;
}

addPassengerBtn.addEventListener("click", () => {
  syncFromUI();
  if(passengers.length >= PASSENGER_MAX){
    alert(`Max ${PASSENGER_MAX} passengers allowed.`);
    return;
  }
  passengers.push({ title:"MR", fullName:"", nationality:"Bangladesh", passport:"" });
  renderPassengers();
  updatePreview();
});

addSegmentBtn.addEventListener("click", () => {
  syncFromUI();
  if(segments.length >= SEGMENT_MAX){
    alert(`Max ${SEGMENT_MAX} segments allowed.`);
    return;
  }
  const last = segments[segments.length - 1];
  segments.push({
    from: last?.to || "DAC",
    to: "SIN",
    date: "",
    flightNo: "",
    departTime: "10:00",
    arriveTime: "18:00"
  });
  renderSegments();
  updatePreview();
});

document.addEventListener("click", (e) => {
  const t = e.target;

  if(t?.dataset?.rmPass !== undefined){
    const idx = Number(t.dataset.rmPass);
    syncFromUI();
    passengers.splice(idx, 1);
    renderPassengers();
    updatePreview();
  }

  if(t?.dataset?.rmSeg !== undefined){
    const idx = Number(t.dataset.rmSeg);
    syncFromUI();
    segments.splice(idx, 1);
    renderSegments();
    updatePreview();
  }
});

document.addEventListener("input", (e) => {
  const el = e.target;
  if(el.matches("input, select")) updatePreview();
});

function addHeaderFooter(doc, pageNum, totalPages){
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();

  doc.setFontSize(12);
  doc.text("TRAVEL ITINERARY / BOOKING SUMMARY", 14, 14);

  doc.setFontSize(9);
  doc.text("SAMPLE / NOT A REAL TICKET", w - 14, 14, { align: "right" });

  doc.setFontSize(9);
  doc.text(`Page ${pageNum} of ${totalPages}`, w - 14, h - 10, { align: "right" });

  doc.setFontSize(9);
  doc.text(`Issued: ${new Date().toLocaleDateString()}`, 14, h - 10);
}

function validate(){
  syncFromUI();

  const badPax = passengers.some(p => !p.fullName || !p.fullName.trim());
  if(badPax){
    alert("Please enter Full Name for all passengers.");
    return false;
  }

  const badSeg = segments.some(s => !s.from || !s.to || s.from === s.to);
  if(badSeg){
    alert("Please check segments: From/To must be different and not empty.");
    return false;
  }

  const badDate = segments.some(s => !s.date);
  if(badDate){
    alert("Please enter Date for all segments.");
    return false;
  }

  return true;
}

generatePdfBtn.addEventListener("click", () => {
  if(!validate()) return;

  const cabin = document.getElementById("cabin").value;
  const baggage = document.getElementById("baggage").value || "—";
  const notes = document.getElementById("notes").value || "—";
  const carrier = (document.getElementById("carrier")?.value || "").trim();

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");

  // Build rows once
  const paxRows = passengers.map((p, i) => ([
    String(i + 1),
    `${p.title} ${p.fullName}`,
    p.nationality || "—",
    p.passport || "—"
  ]));

  const segRows = segments.map((s, i) => ([
    String(i + 1),
    `${s.from} → ${s.to}`,
    fmtDate(s.date),
    s.flightNo || "—",
    `${s.departTime || "—"}–${s.arriveTime || "—"}`
  ]));

  // Always 2 pages: first 4 segments on page 1
  const firstPart = segRows.slice(0, 4);
  const secondPart = segRows.slice(4);

  // ================= PAGE 1 =================
  drawHeader(doc, carrier);

  doc.setFontSize(11);
  doc.text("PASSENGER INFORMATION", 14, 32);

  doc.autoTable({
    startY: 36,
    head: [["#", "FULL NAME", "NATIONALITY", "PASSPORT (opt)"]],
    body: paxRows,
    styles: { fontSize: 9, cellPadding: 2.2 },
    headStyles: { fillColor: [20, 20, 20] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 14, right: 14 },
    theme: "striped"
  });

  let y = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.text("TRIP SEGMENTS (PART 1)", 14, y);

  doc.autoTable({
    startY: y + 4,
    head: [["#", "ROUTE", "DATE", "FLIGHT", "TIME"]],
    body: firstPart.length ? firstPart : [["—", "—", "—", "—", "—"]],
    styles: { fontSize: 9, cellPadding: 2.2 },
    headStyles: { fillColor: [20, 20, 20] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 14, right: 14 },
    theme: "striped"
  });

  // ================= PAGE 2 =================
  doc.addPage();
  drawHeader(doc, carrier);

  doc.setFontSize(11);
  doc.text("TRIP SEGMENTS (PART 2)", 14, 32);

  doc.autoTable({
    startY: 36,
    head: [["#", "ROUTE", "DATE", "FLIGHT", "TIME"]],
    body: secondPart.length ? secondPart : [["—", "—", "—", "—", "—"]],
    styles: { fontSize: 9, cellPadding: 2.2 },
    headStyles: { fillColor: [20, 20, 20] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 14, right: 14 },
    theme: "striped"
  });

  let y2 = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.text("SUMMARY", 14, y2);

  y2 += 6;
  doc.setFontSize(10);
  doc.text(`Cabin: ${cabin}`, 14, y2); y2 += 6;
  doc.text(`Baggage: ${baggage}`, 14, y2); y2 += 6;

  doc.setFontSize(10);
  doc.text("Notes:", 14, y2); y2 += 5;
  doc.setFontSize(9);
  doc.text(String(notes), 14, y2, { maxWidth: 180 });

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawFooter(doc, p, totalPages);
  }

  doc.save("itinerary-summary.pdf");
});
  const doc = new jsPDF("p", "mm", "a4");

  // ---------- PAGE 1 ----------
  doc.setFontSize(10);
  doc.text("PASSENGER INFORMATION", 14, 24);

  const paxRows = passengers.map((p, i) => ([
    String(i+1),
    `${p.title} ${p.fullName}`,
    p.nationality || "—",
    p.passport || "—"
  ]));

  doc.autoTable({
    startY: 28,
    head: [["#", "FULL NAME", "NATIONALITY", "PASSPORT (opt)"]],
    body: paxRows,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [17,17,17] },
    margin: { left: 14, right: 14 }
  });

  let yAfterPax = doc.lastAutoTable.finalY + 8;

  doc.setFontSize(10);
  doc.text("TRIP SEGMENTS (OUTBOUND / PART 1)", 14, yAfterPax);

  const segRows = segments.map((s, i) => ([
    String(i+1),
    `${s.from} → ${s.to}`,
    fmtDate(s.date),
    s.flightNo || "—",
    `${s.departTime || "—"} - ${s.arriveTime || "—"}`
  ]));

  // Split: keep first ~6 segments on page 1, rest on page 2
  const firstSeg = segRows.slice(0, 6);
  const restSeg = segRows.slice(6);

  doc.autoTable({
    startY: yAfterPax + 4,
    head: [["#", "ROUTE", "DATE", "FLIGHT", "TIME"]],
    body: firstSeg.length ? firstSeg : [["—","—","—","—","—"]],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [17,17,17] },
    margin: { left: 14, right: 14 }
  });

  // ---------- PAGE 2 ----------
  doc.addPage();

  doc.setFontSize(10);
  doc.text("TRIP SEGMENTS (CONTINUED / RETURN)", 14, 24);

  doc.autoTable({
    startY: 28,
    head: [["#", "ROUTE", "DATE", "FLIGHT", "TIME"]],
    body: restSeg.length ? restSeg : [["—","—","—","—","—"]],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [17,17,17] },
    margin: { left: 14, right: 14 }
  });

  let y2 = doc.lastAutoTable.finalY + 10;

  doc.setFontSize(10);
  doc.text("SUMMARY", 14, y2);
  y2 += 6;

  doc.setFontSize(9);
  doc.text(`Cabin: ${cabin}`, 14, y2); y2 += 5;
  doc.text(`Baggage: ${baggage}`, 14, y2); y2 += 5;
  doc.text(`Notes: ${notes}`, 14, y2); y2 += 8;

  doc.setFontSize(9);
  doc.text("Important: This document is a sample itinerary/summary and does not confirm a real booking.", 14, y2);

  // Headers/Footers (after content so we know pages count)
  const totalPages = doc.getNumberOfPages();
  for(let p=1; p<=totalPages; p++){
    doc.setPage(p);
    addHeaderFooter(doc, p, totalPages);
  }

  doc.save("itinerary-sample.pdf");
});

// initial render
renderPassengers();
renderSegments();
updatePreview();
