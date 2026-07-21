import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { API_BASE_URL as API } from "../config/api";
import {
  getSavedPaperWidth,
  getSavedPrinterName,
  isQzAvailable,
  listPrinters,
  printTestReceipt,
  setSavedPaperWidth,
  setSavedPrinterName,
} from "../utils/thermalPrinter";
import "./Settings.css";

function Settings() {
  const { user, token, updateUser } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [form, setForm] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    password: "",
  });

  const [saving, setSaving] = useState(false);

  const [qzStatus, setQzStatus] = useState("checking"); // checking | connected | offline
  const [printers, setPrinters] = useState([]);
  const [loadingPrinters, setLoadingPrinters] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState(getSavedPrinterName());
  const [paperWidth, setPaperWidth] = useState(getSavedPaperWidth());
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    checkQzStatus();
  }, []);

  const checkQzStatus = async () => {
    setQzStatus("checking");
    const available = await isQzAvailable();
    setQzStatus(available ? "connected" : "offline");

    if (available) {
      refreshPrinters();
    }
  };

  const refreshPrinters = async () => {
    setLoadingPrinters(true);

    try {
      const found = await listPrinters();
      setPrinters(found || []);
    } catch (error) {
      console.error(error);
      toast.error("Could not list printers from QZ Tray");
    } finally {
      setLoadingPrinters(false);
    }
  };

  const handleSavePrinter = () => {
    setSavedPrinterName(selectedPrinter);
    setSavedPaperWidth(paperWidth);
    toast.success("Printer settings saved");
  };

  const handleTestPrint = async () => {
    if (!selectedPrinter) {
      toast.error("Select a printer first");
      return;
    }

    setSavedPrinterName(selectedPrinter);
    setSavedPaperWidth(paperWidth);
    setTesting(true);

    try {
      await printTestReceipt();
      toast.success("Test receipt sent to printer");
    } catch (error) {
      toast.error(error.message || "Test print failed");
    } finally {
      setTesting(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data } = await axios.put(
        `${API}/users/${user.id}`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      updateUser(data.user || form);
      setForm((prev) => ({ ...prev, password: "" }));

      toast.success(t("save_changes"));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-page">

      <div className="header">
        <div>
          <h1>{t("settings_title")}</h1>
          <p>{t("settings_subtitle")}</p>
        </div>
      </div>

      <div className="settings-grid">

        <div className="table-card">
          <h2>{t("profile_section")}</h2>

          <form className="settings-form" onSubmit={handleSave}>

            <label>{t("full_name")}</label>
            <input
              type="text"
              name="full_name"
              className="input"
              value={form.full_name}
              onChange={handleChange}
              required
            />

            <label>{t("email")}</label>
            <input
              type="email"
              name="email"
              className="input"
              value={form.email}
              onChange={handleChange}
              required
            />

            <label>{t("phone")}</label>
            <input
              type="text"
              name="phone"
              className="input"
              value={form.phone}
              onChange={handleChange}
            />

            <label>{t("new_password")}</label>
            <input
              type="password"
              name="password"
              className="input"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
            />

            <button type="submit" className="save-btn" disabled={saving}>
              {saving ? "..." : t("save_changes")}
            </button>

          </form>
        </div>

        <div className="table-card">
          <h2>{t("language_section")}</h2>

          <div className="language-options">

            <button
              type="button"
              className={`language-option ${language === "en" ? "active" : ""}`}
              onClick={() => setLanguage("en")}
            >
              🇬🇧 {t("english")}
            </button>

            <button
              type="button"
              className={`language-option ${language === "ar" ? "active" : ""}`}
              onClick={() => setLanguage("ar")}
            >
              🇸🇦 {t("arabic")}
            </button>

          </div>
        </div>

        <div className="table-card">
          <h2>{t("printer_section")}</h2>

          <div className={`qz-status qz-status-${qzStatus}`}>
            {qzStatus === "checking" && "Checking QZ Tray connection..."}
            {qzStatus === "connected" && "✅ QZ Tray connected"}
            {qzStatus === "offline" && "⚠️ QZ Tray not detected — install it from qz.io/download and keep it running"}
          </div>

          {qzStatus === "offline" && (
            <button type="button" className="link-btn" onClick={checkQzStatus}>
              Retry connection
            </button>
          )}

          {qzStatus === "connected" && (
            <div className="printer-form">

              <label>Thermal Printer</label>
              <div className="printer-select-row">
                <select
                  className="input"
                  value={selectedPrinter}
                  onChange={(e) => setSelectedPrinter(e.target.value)}
                >
                  <option value="">Select a printer...</option>
                  {printers.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>

                <button type="button" onClick={refreshPrinters} disabled={loadingPrinters}>
                  {loadingPrinters ? "..." : "⟳"}
                </button>
              </div>

              <label>Paper Width</label>
              <select
                className="input"
                value={paperWidth}
                onChange={(e) => setPaperWidth(Number(e.target.value))}
              >
                <option value={32}>58mm (32 characters)</option>
                <option value={48}>80mm (48 characters)</option>
              </select>

              <div className="printer-actions">
                <button type="button" className="save-btn" onClick={handleSavePrinter}>
                  {t("save")}
                </button>

                <button type="button" className="test-print-btn" onClick={handleTestPrint} disabled={testing}>
                  {testing ? "..." : "🖨 Test Print"}
                </button>
              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
}

export default Settings;
