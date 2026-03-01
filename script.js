const PASSENGER_MAX = 5;
const SEGMENT_MAX = 6;

const passengerBox = document.getElementById("passengerBox");
const segmentBox = document.getElementById("segmentBox");

let passengers = [{title:"MR", name:"", nationality:"Bangladesh"}];
let segments = [{from:"DAC", to:"BKK", date:"", flight:"", dep:"10:00", arr:"13:00"}];

const airports = ["DAC","BKK","SIN","DXB","KUL","DEL","DOH","LHR"];

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
      </div>
    `;
  });
}

document.getElementById("addPassenger").onclick=()=>{
  if(passengers.length>=PASSENGER_MAX) return alert("Max 5 passengers");
  passengers.push({title:"MR", name:"", nationality:"Bangladesh"});
  renderPassengers();
};

document.getElementById("addSegment").onclick=()=>{
  if(segments.length>=SEGMENT_MAX) return alert("Max 6 segments for single page");
  segments.push({from:"DAC", to:"BKK", date:"", flight:""});
  renderSegments();
};

document.getElementById("generate").onclick=()=>{

  const {jsPDF}=window.jspdf;
  const doc=new jsPDF("p","mm","a4");

  const carrier=document.getElementById("carrier").value;
  const cabin=document.getElementById("cabin").value;
  const baggage=document.getElementById("baggage").value;
  const notes=document.getElementById("notes").value;

  // HEADER
  doc.setFontSize(12);
  doc.text("VISA A2Z",14,12);
  doc.setFontSize(15);
  doc.text("TRAVEL ITINERARY / BOOKING SUMMARY",14,20);
  doc.setFontSize(9);
  doc.text("4th Floor, Golden Tower, AmberKhana, Syhet",14,25);
  doc.text("travelvisaa2z@gmail.com | +8801572631745",14,29);

  if(carrier){
    doc.text(`Carrier: ${carrier}`,150,20);
  }

  doc.line(14,32,196,32);

  // PASSENGER TABLE
  doc.autoTable({
    startY:38,
    head:[["#","FULL NAME","NATIONALITY"]],
    body:passengers.map((p,i)=>[
      i+1,
      `${p.title} ${p.name}`,
      p.nationality
    ]),
    theme:"striped"
  });

  // SEGMENTS
  doc.autoTable({
    startY:doc.lastAutoTable.finalY+8,
    head:[["#","ROUTE","DATE","FLIGHT"]],
    body:segments.map((s,i)=>[
      i+1,
      `${s.from} → ${s.to}`,
      s.date,
      s.flight
    ]),
    theme:"striped"
  });

  let y=doc.lastAutoTable.finalY+8;

  doc.text(`Cabin: ${cabin}`,14,y);
  y+=6;
  doc.text(`Baggage: ${baggage}`,14,y);
  y+=6;
  doc.text(`Notes: ${notes}`,14,y);

  doc.setFontSize(8);
  doc.text("This document is a travel itinerary summary and not a verifiable e-ticket.",14,287);

  doc.save("visa-a2z-itinerary.pdf");
};

renderPassengers();
renderSegments();
