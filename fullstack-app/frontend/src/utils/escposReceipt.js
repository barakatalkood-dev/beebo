import { formatOMR } from "./currency";

const ESC = "\x1B";
const GS = "\x1D";

const CMD = {
  INIT: `${ESC}@`,
  ALIGN_LEFT: `${ESC}a\x00`,
  ALIGN_CENTER: `${ESC}a\x01`,
  BOLD_ON: `${ESC}E\x01`,
  BOLD_OFF: `${ESC}E\x00`,
  CUT: `${GS}V\x01`,
};

const METHOD_LABELS = {
  cash: "Cash",
  transfer: "Bank Transfer",
  visa: "Visa / Card",
};

function twoColumns(left, right, width) {
  left = String(left);
  right = String(right);

  const space = width - left.length - right.length;

  if (space <= 0) {
    return `${left}\n${" ".repeat(Math.max(0, width - right.length))}${right}`;
  }

  return left + " ".repeat(space) + right;
}

function divider(width) {
  return "-".repeat(width);
}

// Builds a raw ESC/POS command string ready to send to a thermal printer
// (via QZ Tray's "raw" print type). `width` is the printer's characters
// per line — 32 for 58mm paper, 48 for 80mm paper.
export function buildReceiptCommands(invoice, { width = 32, storeName = "Beebo Beauty Center" } = {}) {
  const lines = [];

  lines.push(CMD.INIT);
  lines.push(CMD.ALIGN_CENTER);
  lines.push(CMD.BOLD_ON);
  lines.push(storeName + "\n");
  lines.push(CMD.BOLD_OFF);
  lines.push("Payment Receipt\n");
  lines.push(divider(width) + "\n");

  lines.push(CMD.ALIGN_LEFT);
  lines.push(twoColumns("Customer:", invoice.Customer?.full_name || "-", width) + "\n");

  if (invoice.Customer?.phone) {
    lines.push(twoColumns("Phone:", invoice.Customer.phone, width) + "\n");
  }

  lines.push(twoColumns("Employee:", invoice.User?.full_name || "-", width) + "\n");
  lines.push(
    twoColumns(
      "Date:",
      `${invoice.appointment_date} ${invoice.appointment_time?.slice(0, 5) || ""}`,
      width
    ) + "\n"
  );

  lines.push(divider(width) + "\n");

  (invoice.services || []).forEach((s) => {
    lines.push(twoColumns(s.name, formatOMR(s.price), width) + "\n");
  });

  lines.push(divider(width) + "\n");

  lines.push(CMD.BOLD_ON);
  lines.push(twoColumns("TOTAL PAID", formatOMR(invoice.paid_amount), width) + "\n");
  lines.push(CMD.BOLD_OFF);

  lines.push(
    twoColumns("Method:", METHOD_LABELS[invoice.payment_method] || invoice.payment_method, width) + "\n"
  );
  lines.push(
    twoColumns("Paid At:", invoice.paid_at ? new Date(invoice.paid_at).toLocaleString() : "-", width) + "\n"
  );

  lines.push(divider(width) + "\n");
  lines.push(CMD.ALIGN_CENTER);
  lines.push("Thank you!\n");
  lines.push("\n\n\n");
  lines.push(CMD.CUT);

  return lines.join("");
}
