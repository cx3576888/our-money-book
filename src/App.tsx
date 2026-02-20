import "./App.css";

import PWABadge from "./PWABadge.tsx";

const GAS_URL =
  "https://script.google.com/macros/s/AKfycbxTLO5tvIWT9J4FJrVbfX7HDv-8YPSiZFTiNZYJZBx64ZUNklETFNcM_Rn37hPmYdIa/exec";

function getTabName(inputDate: string) {
  if (inputDate) {
    return inputDate.substring(0, 7);
  }
  const currentTime = new Date();
  const monthString = String(currentTime.getMonth() + 1);
  return `${currentTime.getFullYear()}-${monthString.padStart(2, "0")}`;
}

export default function App() {
  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const inputDate = (formData.get("date") ?? "") as string;
    const data = {
      tabName: getTabName(inputDate),
      date: inputDate.substring(5),
      title: formData.get("title"),
      dollar: formData.get("dollar"),
      details: formData.get("details"),
    };
    console.log("hihihi POST data:", data);
    try {
      const result = await fetch(GAS_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      console.log("Success!", result);
    } catch (error) {
      console.error("Failed!", error);
    }
  }

  return (
    <>
      <form className="form-container" onSubmit={handleSubmit}>
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
          <label htmlFor="title">項目</label>
          <input
            id="title"
            name="title"
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
        <div className="form-submit-container">
          <button className="form-submit-btn" type="submit">
            送出
          </button>
        </div>
      </form>
      <PWABadge />
    </>
  );
}
