const PASSENGER_MAX = 5;
const SEGMENT_MAX = 8;

const airports = ["DAC","BKK","SIN","DXB","KUL","DEL","DOH","LHR","SYD"];

const passengerBox = document.getElementById("passengerBox");
const segmentBox = document.getElementById("segmentBox");

let passengers = [{title:"MR", name:"", nationality:"Bangladesh"}];
let segments = [
  {from:"DAC", to:"BKK", date:"", flight:"", dep:"10:00", arr:"13:00"}
];

function renderPassengers(){
  passengerBox.innerHTML="";
  passengers.forEach((p,i)=>{
    passengerBox.innerHTML+=`
      <div>
        <div class="row">
          <select onchange="passengers[${i}].title=this.value">
            <option>MR</option>
            <option>MRS</option>
            <option>MS</option>
          </select>

          <input placeholder="Full Name"
            oninput="passengers[${i}].name=this.value">
        </div>

        <input placeholder="Nationality"
          oninput="passengers[${i}].nationality=this.value">
      </div>
    `;
  });
}

function renderSegments(){
  segmentBox.innerHTML="";
  segments.forEach((s,i)=>{
    segmentBox.innerHTML+=`
      <div>
        <div class="row">
          <select onchange="segments[${i}].from=this.value">
            ${airports.map(a=>`<option>${a}</option>`).join("")}
          </select>

          <select onchange="segments[${i}].to=this.value">
            ${airports.map(a=>`<option>${a}</option>`).join("")}
          </select>
        </div>

        <div class="row">
          <input type="date" onchange="segments[${i}].date=this.value">
          <input placeholder="Flight No" onchange="segments[${i}].flight=this.value">
        </div>

        <div class="row">
          <input type="time" onchange="segments[${i}].dep=this.value">
          <input type="time" onchange="segments[${i}].arr=this.value">
        </div>
      </div>
    `;
  });
}

document.getElementById("addPassengerBtn").onclick=()=>{
  if(passengers.length>=PASSENGER_MAX) return alert("Max 5 passengers");
  passengers.push({title:"MR", name:"", nationality:"Bangladesh"});
  renderPassengers();
};

document.getElementById("addSegmentBtn").onclick=()=>{
  if(segments.length>=SEGMENT_MAX) return alert("Max 8 segments");
  segments.push({from:"DAC", to:"BKK", date:"", flight:"", dep:"10:00", arr:"13:00"});
  renderSegments();
};

function header(doc, carrier){
  doc.setFontSize(14);
  doc.text("TRAVEL ITINERARY / BOOKING SUMMARY",14,15);
  doc.setFontSize(10);
  doc.text(`Carrier: ${carrier||"—"}`,14,22);
  doc.line(14,25,196,25);
}

function footer(doc,page,total){
  doc.setFontSize(9);
  doc.text(`Page ${page} of ${total}`,196,287,{align:"right"});
  doc.text("This is a travel itinerary summary document.",14,287);
}

document.getElementById("generateBtn").onclick=()=>{

  const {jsPDF}=window.jspdf;
  const doc=new jsPDF("p","mm","a4");

  const carrier=document.getElementById("carrier").value;
  const cabin=document.getElementById("cabin").value;
  const baggage=document.getElementById("baggage").value;
  const notes=document.getElementById("notes").value;

  const segRows=segments.map((s,i)=>[
    i+1,
    `${s.from} → ${s.to}`,
    s.date,
    s.flight,
    `${s.dep}-${s.arr}`
  ]);

  const first=segRows.slice(0,4);
  const second=segRows.slice(4);

  // PAGE 1
  header(doc,carrier);

  doc.autoTable({
    startY:35,
    head:[["#","FULL NAME","NATIONALITY"]],
    body:passengers.map((p,i)=>[
      i+1,
      `${p.title} ${p.name}`,
      p.nationality
    ])
  });

  doc.autoTable({
    startY:doc.lastAutoTable.finalY+10,
    head:[["#","ROUTE","DATE","FLIGHT","TIME"]],
    body:first.length?first:[["-","-","-","-","-"]]
  });

  // PAGE 2
  doc.addPage();
  header(doc,carrier);

  doc.autoTable({
    startY:35,
    head:[["#","ROUTE","DATE","FLIGHT","TIME"]],
    body:second.length?second:[["-","-","-","-","-"]]
  });

  let y=doc.lastAutoTable.finalY+10;
  doc.text(`Cabin: ${cabin}`,14,y); y+=6;
  doc.text(`Baggage: ${baggage}`,14,y); y+=6;
  doc.text(`Notes: ${notes}`,14,y);

  const total=doc.getNumberOfPages();
  for(let i=1;i<=total;i++){
    doc.setPage(i);
    footer(doc,i,total);
  }

  doc.save("itinerary.pdf");
};

renderPassengers();
renderSegments();
