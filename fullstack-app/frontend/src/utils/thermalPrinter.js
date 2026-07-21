import qz from "qz-tray";
import { buildReceiptCommands } from "./escposReceipt";

const PRINTER_KEY = "thermalPrinterName";
const WIDTH_KEY = "thermalPrinterWidth";

// Unsigned mode: fine for an internal LAN business app talking to a local
// QZ Tray install. QZ Tray shows a one-time trust prompt on first connect
// (a local app dialog, not the browser print dialog).
qz.security.setCertificatePromise(() => Promise.resolve(""));
qz.security.setSignaturePromise(() => (resolve) => resolve(""));

export function getSavedPrinterName() {
  return localStorage.getItem(PRINTER_KEY) || "";
}

export function setSavedPrinterName(name) {
  localStorage.setItem(PRINTER_KEY, name);
}

export function getSavedPaperWidth() {
  return Number(localStorage.getItem(WIDTH_KEY)) || 32;
}

export function setSavedPaperWidth(width) {
  localStorage.setItem(WIDTH_KEY, String(width));
}

async function ensureConnected() {
  if (!qz.websocket.isActive()) {
    await qz.websocket.connect();
  }
}

export async function isQzAvailable() {
  try {
    await ensureConnected();
    return true;
  } catch {
    return false;
  }
}

export async function listPrinters() {
  await ensureConnected();
  return qz.printers.find();
}

export async function printTestReceipt() {
  const printerName = getSavedPrinterName();

  if (!printerName) {
    throw new Error("No thermal printer selected");
  }

  await ensureConnected();

  const config = qz.configs.create(printerName);
  const data = "\x1B@\x1Ba\x01Test Print OK\nBeebo Beauty Center\n\n\n\x1DV\x01";

  await qz.print(config, [{ type: "raw", format: "plain", data }]);
}

// Sends a paid appointment straight to the configured thermal printer via
// QZ Tray — no browser print dialog. Throws if QZ Tray isn't running/
// installed or no printer has been configured yet, so callers can fall
// back to window.print().
export async function printReceipt(invoice) {
  const printerName = getSavedPrinterName();

  if (!printerName) {
    throw new Error("No thermal printer configured");
  }

  await ensureConnected();

  const width = getSavedPaperWidth();
  const commands = buildReceiptCommands(invoice, { width });

  const config = qz.configs.create(printerName);

  await qz.print(config, [{ type: "raw", format: "plain", data: commands }]);
}
