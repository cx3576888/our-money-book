import "./App.css";

import { useRef, useState } from "react";
import PWABadge from "./PWABadge.tsx";

interface FormDataObj {
  tabName: string;
  date: string;
  displayDate: string;
  item: string;
  dollar: number;
  details: string;
}

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
  const inputDate = (formData.get("date") ?? "") as string;
  return {
    tabName: getTabName(inputDate),
    date: inputDate,
    displayDate: inputDate.substring(5),
    item: formData.get("item") as string,
    dollar: Number(formData.get("dollar") as string),
    details: formData.get("details") as string,
  };
}

export default function App() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitHistory, setSubmitHistory] = useState<Array<string>>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const oldDataRef = useRef<FormDataObj>({
    tabName: "",
    date: "",
    displayDate: "",
    item: "",
    dollar: NaN,
    details: "",
  });
  const iconCounterRef = useRef(0);

  function addHistory(isSuccess: boolean) {
    if (isSuccess) {
      let icons = "";
      for (let i = 0; i <= iconCounterRef.current; i++) {
        icons += "🦛";
      }
      iconCounterRef.current = (iconCounterRef.current + 1) % 3;
      const succString = `「${oldDataRef.current.item}」新增成功${icons}`;
      setSubmitHistory((prev) => [succString, ...prev]);
    } else {
      const failString = `「${oldDataRef.current.item}」新增失敗！`;
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
    const currentData = createFormDataObj(form);
    oldDataRef.current = currentData;
    try {
      setIsSubmitting(true);
      const payload = {
        tabName: currentData.tabName,
        rowData: [
          currentData.displayDate,
          currentData.item,
          currentData.dollar,
          currentData.details,
        ],
      };
      const result = await fetch(GAS_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      addHistory(true);
      setSubmitError(null);

      // clear fields, but if user already modify a field after click submit, then keep it
      const newData = createFormDataObj(form);
      form.reset();
      form.date.value = newData.date; // never clear date field
      if (newData.item !== oldDataRef.current.item) {
        form.item.value = newData.item;
      }
      if (newData.dollar !== oldDataRef.current.dollar) {
        form.dollar.value = newData.dollar;
      }
      if (newData.details !== oldDataRef.current.details) {
        form.details.value = newData.details;
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
          <label htmlFor="date">日期</label>
          <input
            id="date"
            name="date"
            className="form-field-input"
            type="date"
          />
        </div>
        <div className="form-field">
          <label htmlFor="item">項目</label>
          <input
            id="item"
            name="item"
            className="form-field-input"
            type="text"
          />
        </div>
        <div className="form-field">
          <label htmlFor="dollar">花費</label>
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
