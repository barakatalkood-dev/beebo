import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { printReceipt } from "../../utils/thermalPrinter";
import { API_BASE_URL as API } from "../../config/api";
import { formatOMR } from "../../utils/currency";
import "./Modal.css";
import "./PaymentModal.css";

const METHODS = [
  { value: "cash", label: "Cash", icon: "💵" },
  { value: "transfer", label: "Bank Transfer", icon: "🏦" },
  { value: "visa", label: "Visa / Card", icon: "💳" },
];

function methodLabel(value) {
  return METHODS.find((m) => m.value === value)?.label || value;
}

// Tries to print straight to the configured thermal printer via QZ Tray
// (silent, no dialog). Falls back to the browser print dialog if QZ Tray
// isn't running/installed or no printer has been set up in Settings yet.
async function printThermalOrFallback(invoice) {
  try {
    await printReceipt(invoice);
    toast.success("Receipt sent to thermal printer");
  } catch (error) {
    console.warn("Thermal print unavailable, falling back to browser print:", error.message);
    toast.info("Thermal printer not connected — opening browser print instead");
    window.print();
  }
}

function PaymentModal({ open, appointment, onClose, onPaid }) {
  const token = localStorage.getItem("token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const [method, setMethod] = useState("cash");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const justPaidRef = useRef(false);

  useEffect(() => {
    if (open && appointment) {
      if (appointment.payment_status === "paid") {
        setInvoice(appointment);
      } else {
        setInvoice(null);
        setMethod("cash");
        setAmount(appointment.total_price ?? "");
      }
    }
  }, [open, appointment]);

  // Auto-print the receipt the moment a payment is confirmed — but not when
  // just viewing an already-paid appointment's invoice later.
  useEffect(() => {
    if (invoice && justPaidRef.current) {
      justPaidRef.current = false;
      printThermalOrFallback(invoice);
    }
  }, [invoice]);

  if (!open || !appointment) return null;

  const handleConfirm = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setSaving(true);

    try {
      const { data } = await axios.post(
        `${API}/appointments/${appointment.id}/pay`,
        { payment_method: method, amount },
        authHeader
      );

      toast.success("Payment recorded");
      justPaidRef.current = true;
      setInvoice(data.appointment);
      onPaid();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to record payment"
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePrintClick = async () => {
    setPrinting(true);
    await printThermalOrFallback(invoice);
    setPrinting(false);
  };

  return (
    <div className="modal-overlay payment-overlay">
      <div className="modal payment-modal">

        {!invoice ? (
          <>
            <div className="appointment-modal-header">
              <h2>Payment</h2>
              <button className="close-btn" onClick={onClose}>×</button>
            </div>

            <div className="payment-summary">
              <div className="payment-summary-row">
                <span>Customer</span>
                <strong>{appointment.Customer?.full_name}</strong>
              </div>
              <div className="payment-summary-row">
                <span>Employee</span>
                <strong>{appointment.User?.full_name}</strong>
              </div>
              <div className="payment-summary-row">
                <span>Date</span>
                <strong>
                  {appointment.appointment_date} {appointment.appointment_time?.slice(0, 5)}
                </strong>
              </div>
            </div>

            <div className="payment-services">
              {(appointment.services || []).map((s) => (
                <div className="payment-service-row" key={s.id}>
                  <span>{s.name}</span>
                  <strong>{formatOMR(s.price)}</strong>
                </div>
              ))}
              <div className="payment-service-row payment-service-total">
                <span>Total</span>
                <strong>{formatOMR(appointment.total_price)}</strong>
              </div>
            </div>

            <label>Amount</label>
            <input
              type="number"
              className="input"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <label>Payment Method</label>
            <div className="method-grid">
              {METHODS.map((m) => (
                <div
                  key={m.value}
                  className={`method-card ${method === m.value ? "active" : ""}`}
                  onClick={() => setMethod(m.value)}
                >
                  <span className="method-icon">{m.icon}</span>
                  <span>{m.label}</span>
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button type="button" onClick={onClose} disabled={saving}>
                Cancel
              </button>
              <button
                type="button"
                className="save-btn"
                onClick={handleConfirm}
                disabled={saving}
              >
                {saving ? "Processing..." : "Confirm Payment"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="appointment-modal-header no-print">
              <h2>Invoice</h2>
              <button className="close-btn" onClick={onClose}>×</button>
            </div>

            <div className="invoice-print-area">

              <div className="invoice-brand">
                <div className="invoice-brand-name">Beebo Beauty Center</div>
                <div className="invoice-brand-sub">Payment Receipt</div>
              </div>

              <div className="invoice-row">
                <span>Customer</span>
                <strong>{invoice.Customer?.full_name}</strong>
              </div>
              <div className="invoice-row">
                <span>Phone</span>
                <strong>{invoice.Customer?.phone}</strong>
              </div>
              <div className="invoice-row">
                <span>Employee</span>
                <strong>{invoice.User?.full_name}</strong>
              </div>
              <div className="invoice-row">
                <span>Appointment</span>
                <strong>
                  {invoice.appointment_date} {invoice.appointment_time?.slice(0, 5)}
                </strong>
              </div>
              <div className="invoice-row">
                <span>Payment Method</span>
                <strong>{methodLabel(invoice.payment_method)}</strong>
              </div>
              <div className="invoice-row">
                <span>Paid At</span>
                <strong>
                  {invoice.paid_at ? new Date(invoice.paid_at).toLocaleString() : "-"}
                </strong>
              </div>

              <div className="invoice-services">
                {(invoice.services || []).map((s) => (
                  <div className="invoice-row" key={s.id}>
                    <span>{s.name}</span>
                    <strong>{formatOMR(s.price)}</strong>
                  </div>
                ))}
              </div>

              <div className="invoice-total">
                <span>Total Paid</span>
                <strong>{formatOMR(invoice.paid_amount)}</strong>
              </div>

            </div>

            <div className="modal-actions no-print">
              <button type="button" onClick={onClose}>
                Close
              </button>
              <button
                type="button"
                className="save-btn"
                onClick={handlePrintClick}
                disabled={printing}
              >
                {printing ? "Printing..." : "Print Receipt"}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default PaymentModal;
