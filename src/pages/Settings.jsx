import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc
} from "firebase/firestore";
import { standardDb } from "../firebaseStandard";
import "./Settings.css";
import { db } from "../firebase";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function Settings() {

  const navigate = useNavigate();
  const userId = localStorage.getItem("username");

  const [selectedDate, setSelectedDate] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [data, setData] = useState({});
  const [modal, setModal] = useState(null);
  const [input, setInput] = useState("");
  const [input2, setInput2] = useState("");

  const [showQuestions, setShowQuestions] = useState(false);
  const [showAuto, setShowAuto] = useState(false);

  const questions = [
    "Your lucky number",
    "Your favorite person's birthday",
    "Your wedding anniversary",
    "The front of your bank account number 4 yards",
    "When's your graduation date?"
  ];

  const autoOptions = [
    "7 days - 0.5% interest per day",
    "14 days - 0.8% interest per day",
    "28 days - 1.2% interest per day",
    "56 days - 1.5% interest per day",
    "84 days - 1.8% interest per day"
  ];

  // FETCH
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      const ref = doc(standardDb, "security", userId);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setData(snap.data());
      }
    };

    fetchData();
  }, [userId]);


useEffect(() => {
  const user = localStorage.getItem("user");

  if (user) {
    const parsed = JSON.parse(user);
    setPhoneNumber(parsed.phoneNumber);
  }
}, []);


  // SAVE
  const saveField = async (newData) => {
    if (!userId) {
      alert("User not found");
      return;
    }

    const ref = doc(standardDb, "security", userId);

    try {
      await updateDoc(ref, newData);
    } catch {
      await setDoc(ref, newData, { merge: true });
    }

    setData(prev => ({ ...prev, ...newData }));
    setModal(null);
    setInput("");
    setInput2("");
    setSelectedDate(null);
  };



// 🔥 CALCULATE DATE RANGE
const calculateRange = (days) => {
  const start = new Date();
  const end = new Date();

  end.setDate(start.getDate() + days);

  const format = (date) =>
    String(date.getDate()).padStart(2, "0") + "/" +
    String(date.getMonth() + 1).padStart(2, "0") + "/" +
    date.getFullYear();

  return `${format(start)} - ${format(end)}`;
};




  return (
    <div className="settings-container">

      {/* HEADER */}
      <div className="settings-header">
        <span onClick={() => navigate(-1)}>←</span>
        <h3>Info</h3>
      </div>

      {/* LIST */}
      <div className="settings-list">

      <div
  className="item clickable"
  onClick={() => {
    if (data.realName) return; // 🔒 lock
    setModal("realName");
  }}
  style={
    data.realName
      ? { pointerEvents: "none", opacity: 0.6 }
      : {}
  }
>
  <span>Real Name</span>
  <span>{data.realName || "Set up now"}</span>
</div>

        <div className="item clickable" onClick={() => setModal("nickname")}>
          <span>Nickname</span>
          <span>{data.nickname || "›"}</span>
        </div>


      <div className="item clickable" style={{pointerEvents:"none", opacity:0.6}}>
  <span>Login Password</span>
  <span>********</span>
</div>
         

<div
  className="item clickable"
  onClick={() => {
    if (data.withdrawalCode) return; // ❌ usifungue modal
    setModal("withdraw");
  }}
  style={
    data.withdrawalCode
      ? { pointerEvents: "none", opacity: 0.6 }
      : {}
  }
>
  <span>Withdrawal Code</span>
  <span>
    {data.withdrawalCode ? "****" : "Set up now"}
  </span>
</div>





        <div className="divider"></div>

        <div className="item">
          <span>Phone Number</span>
       <span>{phoneNumber || "+255XXXXXXXXX"}</span>
        </div>

        <div className="item clickable" onClick={() => setModal("facebook")}>
          <span>Facebook/whatsuppName</span>
          <span>{data.facebook || "Set up now/Option"}</span>
        </div>

        <div className="item clickable" onClick={() => setModal("line")}>
          <span>Line/Network</span>
          <span>{data.line || "Set up now/Option"}</span>
        </div>

      <div
  className="item clickable"
  onClick={() => {
    if (data.email) return; // 🔒 lock baada ya kuwekwa
    setModal("email");
  }}
  style={
    data.email
      ? { pointerEvents: "none", opacity: 0.6 }
      : {}
  }
>
  <span>Email</span>
  <span>{data.email || "Set up now"}</span>
</div>

        <div className="divider"></div>
<div
  className="item clickable"
  onClick={() => {
    if (data.autoBet) return; // 🔒 lock
    setShowAuto(true);
  }}
  style={
    data.autoBet
      ? { pointerEvents: "none", opacity: 0.6 }
      : {}
  }
>
  <span>Automatic Betting</span>
  <span>
    {data.autoBet ? (
      <>
        {data.autoBet}
        <br />
        <small>{data.autoRange}</small>
      </>
    ) : "Set up now"}
  </span>
</div>

        <div className="divider"></div>

      <div
  className="item clickable"
  onClick={() => {
    if (data.securityQuestion) return; // 🔒 lock
    setModal("security");
  }}
  style={
    data.securityQuestion
      ? { pointerEvents: "none", opacity: 0.6 }
      : {}
  }
>
  <span>Security Question</span>
  <span>
    {data.securityQuestion ? "Set ✅" : "Set up now"}
  </span>
</div>

        <div className="divider"></div>

        <div className="item clickable" onClick={() => setModal("birthdate")}>
          <span>Birthdate</span>
          <span>{data.birthdate || "Set up now"}</span>
        </div>

      </div>

      {/* MODAL */}
      {modal && (
        <div className="modal">

          {/* REAL NAME */}
          {modal === "realName" ? (
            <div className="modal-box realname-box">
              <div className="realname-header">Add real name</div>

              <div className="realname-body">
                <p>
                  Your real name must match the name on your bank or mobile money account.
                  Once submitted, it cannot be changed.
                </p>

                <input
                  placeholder="Enter your real name"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />

                <div className="realname-actions">
                  <button onClick={() => setModal(null)}>CANCEL</button>

                  <button
                    className="confirm"
                    onClick={() => {
                      if (!input) return alert("Enter name");
                      if (data.realName) return alert("Already set");

                      saveField({ realName: input });
                    }}
                  >
                    CONFIRM
                  </button>
                </div>
              </div>
            </div>

          ) : (

            <div className="modal-box">

             



 {/* 🔥 BIRTHDATE */}
              {modal === "birthdate" ? (
                <>
              <DatePicker
  selected={selectedDate}
  onChange={(date) => setSelectedDate(date)}
  dateFormat="yyyy-MM-dd"
  placeholderText="Select your birthdate"
  className="date-input"

  renderCustomHeader={({
    date,
    changeYear,
    changeMonth,
    decreaseMonth,
    increaseMonth
  }) => (
    <div className="custom-header">

      {/* LEFT */}
      <button onClick={decreaseMonth}>‹</button>

      {/* YEAR */}
      <select
        value={date.getFullYear()}
        onChange={(e) => changeYear(Number(e.target.value))}
      >
        {Array.from({ length: 2156 - 1922 + 1 }, (_, i) => {
          const year = 1922 + i;
          return (
            <option key={year} value={year}>
              {year}
            </option>
          );
        })}
      </select>

      {/* MONTH */}
      <select
        value={date.getMonth()}
        onChange={(e) => changeMonth(Number(e.target.value))}
      >
        {[
          "Jan","Feb","Mar","Apr","May","Jun",
          "Jul","Aug","Sep","Oct","Nov","Dec"
        ].map((m, i) => (
          <option key={i} value={i}>{m}</option>
        ))}
      </select>

      {/* RIGHT */}
      <button onClick={increaseMonth}>›</button>

    </div>
  )}
/>

                  <button
                    onClick={() => {
                      if (!selectedDate) return alert("Select date");

                      const formatted =
                        selectedDate.getFullYear() + "-" +
                        String(selectedDate.getMonth() + 1).padStart(2, "0") + "-" +
                        String(selectedDate.getDate()).padStart(2, "0");

                      saveField({ birthdate: formatted });
                    }}
                  >












                    CONFIRM
                  </button>
                </>
              ) :

              /* SECURITY */
              modal === "security" ? (
                <>
                  <div
                    className="select-box"
                    onClick={() => setShowQuestions(true)}
                  >
                    {input || "Select a security question ›"}
                  </div>

                  <input
                    placeholder="Your answer"
                    value={input2}
                    onChange={(e) => setInput2(e.target.value)}
                  />

                  <button
                    onClick={() => {
                      if (!input || !input2) return alert("Fill all fields");

                      saveField({
                        securityQuestion: input,
                        securityAnswer: input2
                      });
                    }}
                  >
                    CONFIRM
                  </button>
                </>
              ) : modal === "withdraw" ? (
                <>
                  {!data.securityQuestion && (
                    <p style={{ color: "red" }}>
                      Set security question first
                    </p>
                  )}

                <input
  placeholder="Enter 4–8 characters"
  value={input}
  maxLength={8}
  onChange={(e) => setInput(e.target.value)}
/>

               <button
  onClick={() => {
    if (!data.securityQuestion) return;

    if (input.length < 4 || input.length > 8) {
      return alert("Enter 4 to 8 characters");
    }

    saveField({ withdrawalCode: input });
  }}
>
  CONFIRM
</button>
                </>
              ) : (
                <>
                  <input
                    placeholder={`Enter ${modal}`}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />

                  <button
                    onClick={() => {
                      if (!input) return alert("Required");
                      saveField({ [modal]: input });
                    }}
                  >
                    CONFIRM
                  </button>
                </>
              )}

              <button onClick={() => setModal(null)}>CANCEL</button>

            </div>
          )}
        </div>
      )}

      {/* QUESTIONS */}
      {showQuestions && (
        <div className="question-modal">
          <div className="question-header">
            <span onClick={() => setShowQuestions(false)}>✕</span>
            <h3>Select a security question</h3>
          </div>

          {questions.map((q, i) => (
            <div
              key={i}
              className="question-item"
              onClick={() => {
                setInput(q);
                setShowQuestions(false);
              }}
            >
              {q}
            </div>
          ))}
        </div>
      )}

      {/* AUTO BET */}
      {showAuto && (
        <div className="auto-modal">
          <div className="auto-box">
      {autoOptions.map((opt, i) => {

  const days = parseInt(opt); // 7, 14, 28...
  const range = calculateRange(days);

  return (
    <div
      key={i}
      className="auto-item"
      onClick={() => {
        saveField({
          autoBet: opt,
          autoRange: range
        });
        setShowAuto(false);
      }}
    >
      <div>{opt}</div>
      <small style={{ color: "#888" }}>{range}</small>
    </div>
  );
})}
          </div>
        </div>
      )}

    </div>
  );
}