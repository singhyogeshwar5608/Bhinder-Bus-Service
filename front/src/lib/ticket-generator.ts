import jsPDF from "jspdf";

const C = {
  primary: "#0F172A", secondary: "#1E293B", accent: "#F59E0B",
  success: "#22C55E", white: "#FFFFFF", text: "#1E293B",
  muted: "#94A3B8", border: "#E2E8F0", cardBg: "#F8FAFC", subtext: "#64748B",
  blue: "#2563EB", red: "#DC2626",
};

function t(ctx: CanvasRenderingContext2D, text: string, maxW: number): string {
  if (ctx.measureText(text).width <= maxW) return text;
  let s = text;
  while (ctx.measureText(s + "...").width > maxW && s.length > 1) s = s.slice(0, -1);
  return s + "...";
}

function drawCardHeader(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, title: string) {
  if (!title) return y + 34;
  ctx.fillStyle = C.cardBg;
  ctx.beginPath();
  ctx.roundRect(x, y, w, 32, 4);
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = C.border;
  ctx.stroke();
  ctx.fillStyle = C.accent;
  ctx.fillRect(x, y, 4, 32);
  ctx.fillStyle = C.primary;
  ctx.font = "bold 13px Arial";
  ctx.textAlign = "left";
  ctx.fillText(title, x + 14, y + 21);
  return y + 34;
}

function drawRoute(ctx: CanvasRenderingContext2D, LX: number, LWR: number, y: number, d: any) {
  const x1 = LX + 12, x2 = LX + LWR - 12, cy = y, lY = cy + 10;
  const halfW = (x2 - x1) / 2 - 10;
  ctx.strokeStyle = C.accent;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x1 + 14, lY);
  ctx.lineTo(x2 - 14, lY);
  ctx.stroke();
  ctx.beginPath(); ctx.arc(x1 + 14, lY, 6, 0, Math.PI * 2); ctx.fillStyle = C.accent; ctx.fill();
  ctx.beginPath(); ctx.arc(x2 - 14, lY, 6, 0, Math.PI * 2); ctx.fill();
  ctx.textAlign = "left";
  ctx.font = "bold 13px Arial";
  ctx.fillStyle = C.blue;
  ctx.fillText(t(ctx, d.routeFrom || d.boardingLocation || "—", halfW), x1, cy + 32);
  ctx.textAlign = "right";
  ctx.font = "bold 13px Arial";
  ctx.fillStyle = C.success;
  ctx.fillText(t(ctx, d.routeTo || d.destination || "—", halfW), x2, cy + 32);
  ctx.textAlign = "center";
  ctx.fillStyle = C.accent;
  ctx.font = "bold 13px Arial";
  ctx.fillText(d.distance || "—", (x1 + x2) / 2, lY - 8);
  ctx.textAlign = "left";
  ctx.fillStyle = C.blue;
  ctx.font = "13px Arial";
  ctx.fillText(d.depTime || d.boardingTime || "", x1, cy + 52);
  ctx.textAlign = "right";
  ctx.fillStyle = C.success;
  ctx.font = "13px Arial";
  ctx.fillText(d.arrTimeFull || d.arrivalTime || "", x2, cy + 52);

  const boardPoint = d.boardingPoint || "";
  const boardStop = (d.stops || []).find((s: any) => s.stop_name === boardPoint);
  const boardFare = boardStop ? Number(boardStop.fare) : (d.fare || 0);
  if (boardPoint) {
    ctx.textAlign = "left";
    ctx.fillStyle = C.text;
    ctx.font = "bold 14px Arial";
    ctx.fillText("Boarding: " + boardPoint, x1, cy + 76);
    ctx.textAlign = "right";
    ctx.fillStyle = C.text;
    ctx.font = "bold 16px Arial";
    ctx.fillText("₹" + Number(boardFare).toLocaleString("en-IN"), x2, cy + 76);
    if (boardStop) {
      const arrTime = boardStop.arrival_time || "";
      const depTime = boardStop.departure_time || "";
      const timeStr = depTime ? (arrTime ? arrTime + " - " + depTime : depTime) : (arrTime || "");
      if (timeStr) {
        ctx.textAlign = "left";
        ctx.fillStyle = C.text;
        ctx.font = "13px Arial";
        ctx.fillText(timeStr, x1, cy + 96);
      }
    }
  }
  return cy + (boardPoint ? (boardStop ? 110 : 92) : 62);
}

function drawRouteTimeline(ctx: CanvasRenderingContext2D, LX: number, LWR: number, y: number, stops: any[], bp: string, d?: any) {
  const bx = LX + 18;
  const maxW = LWR - 50;
  const dd = d || {};

  const from = dd.routeFrom || dd.boardingLocation || "";
  const to = dd.routeTo || dd.destination || "";
  if (from || to) {
    ctx.fillStyle = C.blue;
    ctx.font = "bold 13px Arial";
    ctx.textAlign = "left";
    ctx.fillText(t(ctx, from, 120), bx, y + 9);
    ctx.fillStyle = C.accent;
    ctx.font = "bold 13px Arial";
    ctx.textAlign = "center";
    ctx.fillText("→", bx + 130, y + 9);
    ctx.textAlign = "right";
    ctx.fillStyle = C.success;
    ctx.fillText(t(ctx, to, 120), bx + 260, y + 9);
    y += 14;
  }

  if (stops.length === 0) {
    ctx.fillStyle = C.text;
    ctx.font = "bold 13px Arial";
    ctx.textAlign = "left";
    ctx.fillText(t(ctx, bp || "—", maxW), bx, y + 16);
    return y + 26;
  }
  const bpIdx = stops.findIndex((s: any) => s.stop_name === bp);
  const boardIdx = bpIdx >= 0 ? bpIdx : 0;

  ctx.strokeStyle = C.border;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(bx, y + 14);
  ctx.lineTo(bx, y + stops.length * 32 - 6);
  ctx.stroke();

  stops.forEach((s: any, i: number) => {
    const isBefore = i < boardIdx;
    const isSel = s.stop_name === bp;

    if (i > 0) {
      ctx.strokeStyle = isBefore ? C.border : C.accent;
      ctx.lineWidth = isBefore ? 1 : 2;
      ctx.beginPath();
      ctx.moveTo(bx, y + 14);
      ctx.lineTo(bx, y + 32);
      ctx.stroke();
    }

    if (isBefore) {
      ctx.fillStyle = C.muted;
      ctx.font = "13px Arial";
      ctx.textAlign = "left";
      ctx.fillText(t(ctx, s.stop_name, maxW - 70), bx + 14, y + 18);
      const time = s.departure_time || s.arrival_time || "";
      if (time) {
        ctx.textAlign = "right";
        ctx.font = "13px Arial";
        ctx.fillStyle = "#CBD5E1";
        ctx.fillText(time, LX + LWR - 70, y + 18);
      }
      const fare = Number(s.fare || 0);
      if (fare > 0) {
        ctx.textAlign = "right";
        ctx.font = "13px Arial";
        ctx.fillStyle = "#CBD5E1";
        ctx.fillText("₹" + fare.toLocaleString("en-IN"), LX + LWR - 14, y + 18);
      }
    } else {
      const dotCol = isSel ? C.accent : C.accent;
      ctx.beginPath();
      ctx.arc(bx, y + 14, isSel ? 6 : 5, 0, Math.PI * 2);
      ctx.fillStyle = dotCol;
      ctx.fill();
      if (isSel) {
        ctx.beginPath(); ctx.arc(bx, y + 14, 2.5, 0, Math.PI * 2); ctx.fillStyle = C.white; ctx.fill();
      }

      ctx.textAlign = "left";
      ctx.font = isSel ? "bold 13px Arial" : "13px Arial";
      ctx.fillStyle = isSel ? C.accent : C.blue;
      ctx.fillText(t(ctx, s.stop_name, maxW - 70), bx + 14, y + 18);

      const time = s.departure_time || s.arrival_time || "";
      if (time) {
        ctx.textAlign = "right";
        ctx.font = "bold 13px Arial";
        ctx.fillStyle = "#000000";
        ctx.fillText(time, LX + LWR - 70, y + 18);
      }

      const fare = Number(s.fare || 0);
      if (fare > 0) {
        ctx.textAlign = "right";
        ctx.font = "bold 13px Arial";
        ctx.fillStyle = C.success;
        ctx.fillText("₹" + fare.toLocaleString("en-IN"), LX + LWR - 14, y + 18);
      }
    }

    y += 32;
  });
  return y + 4;
}

function drawPassengers(ctx: CanvasRenderingContext2D, LX: number, LWR: number, y: number, pass: any[], d?: any) {
  const tx = LX + 12, c1 = tx, c2 = tx + 85, c3 = tx + LWR - 110;
  const nameW = LWR - 210;
  const dd = d || {};

  if (dd.customerName || dd.customerPhone || dd.customerEmail) {
    ctx.fillStyle = C.text;
    ctx.font = "bold 13px Arial";
    ctx.textAlign = "left";
    const labelW = 110;
    const valX = tx + labelW;
    const valW = LWR - labelW - 20;

    if (dd.customerName) {
      ctx.fillText("Booked By:", tx, y + 20);
      ctx.font = "13px Arial";
      ctx.fillText(t(ctx, dd.customerName, valW), valX, y + 20);
      y += 22;
      ctx.font = "bold 13px Arial";
    }

    if (dd.customerPhone) {
      ctx.fillText("Mobile:", tx, y + 20);
      ctx.font = "13px Arial";
      ctx.fillText(dd.customerPhone, valX, y + 20);
      y += 22;
      ctx.font = "bold 13px Arial";
    }

    if (dd.customerEmail) {
      ctx.fillText("Email:", tx, y + 20);
      ctx.font = "13px Arial";
      ctx.fillText(t(ctx, dd.customerEmail, valW), valX, y + 20);
      y += 22;
      ctx.font = "bold 13px Arial";
    }

    const jDate = dd.journeyDate || dd.scheduleDate || "";
    if (jDate) {
      ctx.fillText("Journey Date:", tx, y + 20);
      ctx.font = "13px Arial";
      const shortDate = jDate.length > 15 ? jDate.slice(0, 15) : jDate;
      ctx.fillText(shortDate, valX, y + 20);
      y += 26;
    }
    y += 7;
  }

  ctx.fillStyle = C.muted;
  ctx.font = "13px Arial";
  ctx.textAlign = "left";
  ctx.fillText("SEAT", c1, y + 9);
  ctx.fillText("NAME", c2, y + 9);
  ctx.textAlign = "right";
  ctx.fillText("AGE", c3, y + 9);
  ctx.strokeStyle = C.border;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(tx, y + 16);
  ctx.lineTo(tx + LWR - 20, y + 16);
  ctx.stroke();
  y += 20;
  pass.forEach((p: any) => {
    ctx.fillStyle = C.blue;
    ctx.font = "bold 13px Arial";
    ctx.textAlign = "left";
    ctx.fillText(p.seat_number || "—", c1, y + 14);
    ctx.font = "13px Arial";
    ctx.fillStyle = C.text;
    ctx.fillText(t(ctx, p.name || "", nameW), c2, y + 14);
    ctx.textAlign = "right";
    ctx.fillStyle = C.success;
    ctx.font = "bold 13px Arial";
    ctx.fillText(String(p.age || ""), c3, y + 14);
    y += 24;
  });
  return y + 4;
}

function drawSeats(ctx: CanvasRenderingContext2D, LX: number, LWR: number, y: number, seatNums: string[]) {
  const sx = LX + 12, sw = LWR - 24, cols = 10, ss = 16, sg = 4;
  const tw = cols * (ss + sg);
  const sx2 = sx + (sw - tw) / 2;
  const rows = 2, totalH = rows * (ss + sg);
  const totalS = cols * rows;
  ctx.font = "bold 11px Arial";
  ctx.textAlign = "center";
  for (let i = 0; i < totalS; i++) {
    const r = Math.floor(i / cols), c = i % cols;
    const cx = sx2 + c * (ss + sg), cy = y + r * (ss + sg);
    const isBooked = i < seatNums.length;
    ctx.beginPath();
    ctx.arc(cx + ss / 2, cy + ss / 2, ss / 2 - 1, 0, Math.PI * 2);
    if (isBooked) { ctx.fillStyle = C.red; ctx.fill(); }
    else { ctx.fillStyle = "#DCFCE7"; ctx.fill(); }
    ctx.strokeStyle = isBooked ? "#991B1B" : "#22C55E";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = isBooked ? C.white : C.primary;
    ctx.fillText(isBooked ? seatNums[i] : String(i + 1), cx + ss / 2, cy + ss / 2 + 3);
  }
  const lgY = y + totalH + 14;
  ctx.beginPath(); ctx.arc(sx + 14, lgY + 5, 5, 0, Math.PI * 2); ctx.fillStyle = C.red; ctx.fill();
  ctx.fillStyle = C.subtext;
  ctx.font = "13px Arial";
  ctx.textAlign = "left";
  ctx.fillText("= Booked", sx + 24, lgY + 9);
  ctx.beginPath(); ctx.arc(sx + 100, lgY + 5, 5, 0, Math.PI * 2); ctx.fillStyle = "#DCFCE7"; ctx.strokeStyle = "#22C55E"; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = C.subtext;
  ctx.fillText("= Available", sx + 110, lgY + 9);
  return lgY + 22;
}

function drawBus(ctx: CanvasRenderingContext2D, RX: number, RWR: number, y: number, d: any) {
  const bx = RX + 12, bw = RWR - 24;
  const maxVW = bw - 10;
  const items: [string, string][] = [
    ["Bus Name", d.busName || d.scheduleName || "—"],
    ["Bus Type", d.busType || "—"],
    ["Bus Number", d.busNumber || "—"],
    ["Operator", d.operator || "—"],
  ];
  items.forEach(([label, val], i) => {
    ctx.fillStyle = C.text;
    ctx.font = "13px Arial";
    ctx.textAlign = "left";
    ctx.fillText(label, bx, y + 16);
    ctx.textAlign = "right";
    ctx.font = "bold 13px Arial";
    ctx.fillStyle = i === 0 ? C.accent : (i === 1 ? C.blue : C.text);
    ctx.fillText(t(ctx, val, maxVW), bx + bw, y + 16);
    y += 24;
  });
  return y + 4;
}

function drawPayment(ctx: CanvasRenderingContext2D, RX: number, RWR: number, y: number, d: any) {
  const bx = RX + 12, bw = RWR - 24;
  const maxVW = bw - 10;
  const items: [string, string][] = [
    ["Total Fare", "₹" + Number(d.totalAmount || 0).toLocaleString("en-IN")],
    ["Discount", "₹0"],
    ["Paid Amount", "₹" + Number(d.totalAmount || 0).toLocaleString("en-IN")],
    ["Payment Mode", "UPI"],
  ];
  items.forEach(([label, val], i) => {
    ctx.fillStyle = C.text;
    ctx.font = "13px Arial";
    ctx.textAlign = "left";
    ctx.fillText(label, bx, y + 9);
    ctx.textAlign = "right";
    ctx.font = "bold 13px Arial";
    ctx.fillStyle = i === 2 ? C.success : C.text;
    ctx.fillText(t(ctx, val, maxVW), bx + bw, y + 9);
    y += 22;
  });
  return y + 4;
}

function drawStatus(ctx: CanvasRenderingContext2D, RX: number, RWR: number, y: number) {
  ctx.fillStyle = C.success;
  ctx.font = "bold 13px Arial";
  ctx.textAlign = "left";
  ctx.fillText("✓ CONFIRMED", RX + 12, y + 18);
  return y + 28;
}

export function generateTicketCanvas(d: any): { canvas: HTMLCanvasElement; height: number } {
  const pass = d.passengers || [];
  const stops: any[] = d.stops || [];
  const bp = d.boardingPoint || "";
  const seatNums = d.seatNumbers || [];

  const w = 1000;
  const margin = 30;
  const split = 0.58;
  const cw = w - margin * 2;
  const leftW = Math.floor(cw * split);
  const rightW = cw - leftW;
  const LX = margin;
  const LWR = leftW - 4;
  const RX = margin + leftW + 10;
  const RWR = rightW - 10;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = 3000;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, w, 3000);

  ctx.fillStyle = C.blue;
  ctx.fillRect(0, 0, w, 90);
  ctx.fillStyle = C.white;
  ctx.font = "bold 13px Arial";
  ctx.textAlign = "center";
  ctx.fillText("BHINDER BUS SERVICE", w / 2, 36);
  ctx.fillStyle = C.accent;
  ctx.font = "bold 13px Arial";
  ctx.fillText("BOOKING CONFIRMATION TICKET", w / 2, 56);
  ctx.fillStyle = C.muted;
  ctx.font = "13px Arial";
  ctx.fillText(`Booking: ${d.bookingNumber || "—"}  |  ${d.journeyDate || d.scheduleDate || "—"}`, w / 2, 76);

  let ly = 105;
  ly = drawCardHeader(ctx, LX, ly, LWR, "ROUTE DETAILS") + 8;
  ly = drawRoute(ctx, LX, LWR, ly, d) + 10;
  ly = drawCardHeader(ctx, LX, ly, LWR, "PASSENGER DETAILS") + 8;
  ly = drawPassengers(ctx, LX, LWR, ly, pass, d) + 10;
  ly = drawCardHeader(ctx, LX, ly, LWR, "BOARDING DETAILS") + 8;
  ly = drawRouteTimeline(ctx, LX, LWR, ly, stops, bp, d) + 10;
  ly = drawCardHeader(ctx, LX, ly, LWR, "SEAT MAP") + 8;
  ly = drawSeats(ctx, LX, LWR, ly, seatNums);

  let ry = 105;
  ry = drawCardHeader(ctx, RX, ry, RWR, "BUS DETAILS") + 8;
  ctx.save(); ctx.beginPath(); ctx.rect(RX + 2, ry - 42, RWR - 4, 220); ctx.clip();
  ry = drawBus(ctx, RX, RWR, ry, d) + 10; ctx.restore();
  ry = drawCardHeader(ctx, RX, ry, RWR, "PAYMENT SUMMARY") + 8;
  ctx.save(); ctx.beginPath(); ctx.rect(RX + 2, ry - 42, RWR - 4, 200); ctx.clip();
  ry = drawPayment(ctx, RX, RWR, ry, d) + 10; ctx.restore();
  ry = drawCardHeader(ctx, RX, ry, RWR, "BOOKING STATUS") + 8;
  ctx.save(); ctx.beginPath(); ctx.rect(RX + 2, ry - 42, RWR - 4, 100); ctx.clip();
  ry = drawStatus(ctx, RX, RWR, ry); ctx.restore();

  const beforeFootY = Math.max(ly, ry) + 16;
  const disclaimerY = beforeFootY + 10;
  ctx.fillStyle = "#94A3B8";
  ctx.font = "11px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Please note that bus, route, driver, boarding/drop points, and travel", w / 2, disclaimerY + 12);
  ctx.fillText("schedules may be modified due to operational requirements or unforeseen circumstances.", w / 2, disclaimerY + 26);

  const footY = disclaimerY + 40;
  ctx.fillStyle = C.blue;
  ctx.fillRect(0, footY, w, 60);
  ctx.fillStyle = C.muted;
  ctx.font = "13px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Contact: 8092000025  |  Email: bhinderbusservice@gmail.com", w / 2, footY + 24);
  ctx.fillStyle = C.accent;
  ctx.font = "bold 13px Arial";
  ctx.fillText("Thank you for travelling with Bhinder Bus Service", w / 2, footY + 42);

  const totalH = footY + 60 + 10;

  return { canvas, height: totalH };
}

export function downloadTicketPdf(d: any, filename?: string) {
  const { canvas, height } = generateTicketCanvas(d);
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 8;
  const maxImgH = pageH - margin * 2;
  const fullImgH = (height / canvas.width) * pageW;
  const totalPages = Math.ceil(fullImgH / maxImgH);
  for (let p = 0; p < totalPages; p++) {
    if (p > 0) pdf.addPage();
    const srcY = (height / totalPages) * p;
    const sliceH = height / totalPages;
    const canvasSlice = document.createElement("canvas");
    canvasSlice.width = canvas.width;
    canvasSlice.height = sliceH;
    const sliceCtx = canvasSlice.getContext("2d")!;
    sliceCtx.fillStyle = "#FFFFFF";
    sliceCtx.fillRect(0, 0, canvasSlice.width, canvasSlice.height);
    sliceCtx.drawImage(canvas, 0, srcY, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
    const sliceData = canvasSlice.toDataURL("image/png");
    const sliceImgH = (sliceH / canvas.width) * pageW;
    pdf.addImage(sliceData, "PNG", 0, margin, pageW, sliceImgH);
  }
  pdf.save(filename || `ticket-${d.bookingNumber || "booking"}.pdf`);
}

export function getTicketImageDataUrl(d: any): string {
  const { canvas, height } = generateTicketCanvas(d);
  const cropped = document.createElement("canvas");
  cropped.width = canvas.width;
  cropped.height = height;
  const ctx = cropped.getContext("2d")!;
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, cropped.width, cropped.height);
  ctx.drawImage(canvas, 0, 0, canvas.width, height, 0, 0, canvas.width, height);
  return cropped.toDataURL("image/png");
}
