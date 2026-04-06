import "./App.css";

import { useRef, useState } from "react";
import PWABadge from "./PWABadge.tsx";

interface FormDataObj {
  uiForm: UIForm;
  gasPayload: GASPayload;
}

interface UIForm {
  inputDate: string;
  item: string;
  dollar: number;
  details: string;
  isSplit: boolean;
  payer: PayerType;
}

interface GASPayload {
  tabName: string;
  rowData: GASRowDataType;
}

type GASRowDataType = [
  displayDate: string,
  item: string,
  dollar: number,
  details: string,
  p1Paid: number,
  p2Paid: number,
  p1Owe: number,
  p2Owe: number,
  p1GiveP2: number,
  p2GiveP1: number,
];

type PayerType = "p1" | "p2";

const GAS_URL =
  "https://script.google.com/macros/s/AKfycbxKMuTkS0P_qoLuWgis_7A1DD1daSqTPLz_t3SGpwermrzvyTo6kWIesfLtvoSWFHcP/exec";

function getTabName(inputDate: string) {
  if (inputDate) {
    return inputDate.substring(0, 7);
  }
  const currentTime = new Date();
  const monthString = String(currentTime.getMonth() + 1);
  return `${currentTime.getFullYear()}-${monthString.padStart(2, "0")}`;
}

function createFormDataObj(form: HTMLFormElement): FormDataObj {
  const formData = new FormData(form);

  // uiForm
  const inputDate = (formData.get("inputDate") ?? "") as string;
  const item = formData.get("item") as string;
  const dollar = Number(formData.get("dollar") as string);
  const details = formData.get("details") as string;
  const isSplit = formData.get("isSplit") === "on";
  console.log("hihihi", isSplit);
  const payer = formData.get("payer") as PayerType;

  // gasPayload
  const payerShouldPay = isSplit ? Math.ceil(dollar / 2) : dollar;
  const nonPayerShouldPay = dollar - payerShouldPay;
  let p1Paid, p2Paid, p1Owe, p2Owe, p1GiveP2, p2GiveP1;
  if (payer === "p1") {
    p1Paid = dollar;
    p2Paid = 0;
    p1Owe = payerShouldPay;
    p2Owe = nonPayerShouldPay;
    p1GiveP2 = 0;
    p2GiveP1 = nonPayerShouldPay;
  } else {
    p1Paid = 0;
    p2Paid = dollar;
    p1Owe = nonPayerShouldPay;
    p2Owe = payerShouldPay;
    p1GiveP2 = nonPayerShouldPay;
    p2GiveP1 = 0;
  }

  return {
    uiForm: { inputDate, item, dollar, details, isSplit, payer },
    gasPayload: {
      tabName: getTabName(inputDate),
      rowData: [
        inputDate.substring(5),
        item,
        dollar,
        details,
        p1Paid,
        p2Paid,
        p1Owe,
        p2Owe,
        p1GiveP2,
        p2GiveP1,
      ],
    },
  };
}

export default function App() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitHistory, setSubmitHistory] = useState<Array<string>>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const oldUIFormRef = useRef<UIForm>({
    inputDate: "",
    item: "",
    dollar: NaN,
    details: "",
    isSplit: true,
    payer: "p1",
  });
  const iconCounterRef = useRef(0);

  function addHistory(isSuccess: boolean) {
    if (isSuccess) {
      let icons = "";
      for (let i = 0; i <= iconCounterRef.current; i++) {
        icons += "🦛";
      }
      iconCounterRef.current = (iconCounterRef.current + 1) % 3;
      const succString = `「${oldUIFormRef.current.item}」新增成功${icons}`;
      setSubmitHistory((prev) => [succString, ...prev]);
    } else {
      const failString = `「${oldUIFormRef.current.item}」新增失敗！`;
      setSubmitHistory((prev) => [failString, ...prev]);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const { uiForm, gasPayload } = createFormDataObj(form);
    oldUIFormRef.current = uiForm;
    try {
      setIsSubmitting(true);
      const result = await fetch(GAS_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gasPayload),
      });
      addHistory(true);
      setSubmitError(null);

      // clear fields, but if user already modify a field after click submit, then keep it
      const { uiForm: newUiForm } = createFormDataObj(form);
      form.reset();
      form.inputDate.value = newUiForm.inputDate; // never clear inputDate field
      form.isSplit.checked = newUiForm.isSplit; // never clear isSplit field
      form.payer.value = newUiForm.payer; // never clear payer field
      if (newUiForm.item !== oldUIFormRef.current.item) {
        form.item.value = newUiForm.item;
      }
      if (newUiForm.dollar !== oldUIFormRef.current.dollar) {
        form.dollar.value = newUiForm.dollar;
      }
      if (newUiForm.details !== oldUIFormRef.current.details) {
        form.details.value = newUiForm.details;
      }
    } catch (error) {
      addHistory(false);
      setSubmitError((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <form
        className="form-container"
        onKeyDown={handleKeyDown}
        onSubmit={handleSubmit}
      >
        <div className="form-field">
          <label htmlFor="inputDate">日期</label>
          <input
            id="inputDate"
            name="inputDate"
            className="form-field-input"
            type="date"
          />
        </div>
        <div className="form-field">
          <label htmlFor="item">
            項目（
            <label>
              <input type="checkbox" name="isSplit" defaultChecked />
              <span>平分</span>
            </label>
            ）
          </label>
          <input
            id="item"
            name="item"
            className="form-field-input"
            type="text"
          />
        </div>
        <div className="form-field">
          <label htmlFor="dollar">
            花費（
            <div className="payer-group">
              <label className="radio-label">
                <input type="radio" name="payer" value="p1" defaultChecked />
                <span>言</span>
              </label>
              <label className="radio-label">
                <input type="radio" name="payer" value="p2" />
                <span>伊</span>
              </label>
            </div>
            ）
          </label>
          <input
            id="dollar"
            name="dollar"
            className="form-field-input"
            type="number"
            inputMode="decimal"
          />
        </div>
        <div className="form-field">
          <label htmlFor="details">詳細說明、備註</label>
          <input
            id="details"
            name="details"
            className="form-field-input"
            type="text"
          />
        </div>
        <div className="form-submit-btn-container">
          <button
            className="form-submit-btn"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "送出中..." : "送出"}
          </button>
        </div>
        <div className="form-submit-history-container">
          {submitHistory.map((string, i) => (
            <div key={i} className="form-submit-history">
              {string}
            </div>
          ))}
        </div>
        <pre className="form-submit-error-container">{submitError}</pre>
      </form>
      <PWABadge />
    </>
  );
}
