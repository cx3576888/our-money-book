import "./App.css";

import PWABadge from "./PWABadge.tsx";

export default function App() {
  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      date: formData.get("date"),
      title: formData.get("title"),
      dollar: formData.get("dollar"),
      details: formData.get("details"),
    };
    console.log("hihihi POST data:", data);
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
