import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { secondaryDb } from "../firebaseSecondary";
import { standardDb } from "../firebaseStandard";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function AdminManageNumbers() {

  // BUSINESS
  const [businessProvider, setBusinessProvider] = useState("Vodacom");
  const [businessFullname, setBusinessFullname] = useState("");
  const [businessNumber, setBusinessNumber] = useState("");

  // NORMAL
  const [normalProvider, setNormalProvider] = useState("Vodacom");
  const [normalFullname, setNormalFullname] = useState("");
  const [normalNumber, setNormalNumber] = useState("");

  // STANDARD 🔥
  const [standardFullname, setStandardFullname] = useState("");
  const [standardNumber, setStandardNumber] = useState("");
  const [standardNumbers, setStandardNumbers] = useState([]);

  const [businessNumbers, setBusinessNumbers] = useState([]);
  const [normalNumbers, setNormalNumbers] = useState([]);

  const businessRef = collection(db, "depositNumbers");
  const normalRef = collection(secondaryDb, "normalNumbers");
  const standardRef = collection(standardDb, "othercountry"); // 🔥

  const providers = ["Vodacom", "Airtel", "Tigo", "Halotel"];

  const loadNumbers = async () => {

    const businessData = await getDocs(businessRef);
    const normalData = await getDocs(normalRef);
    const standardData = await getDocs(standardRef); // 🔥

    setBusinessNumbers(
      businessData.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }))
    );

    setNormalNumbers(
      normalData.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }))
    );

    setStandardNumbers(
      standardData.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }))
    );
  };

  useEffect(() => {
    loadNumbers();
  }, []);

  // ADD BUSINESS
  const handleAddBusiness = async () => {

    if (!businessFullname || !businessNumber) {
      alert("Fill all fields");
      return;
    }

    await addDoc(businessRef, {
      provider: businessProvider,
      fullname: businessFullname,
      number: businessNumber,
    });

    setBusinessFullname("");
    setBusinessNumber("");

    loadNumbers();
  };

  // ADD NORMAL
  const handleAddNormal = async () => {

    if (!normalFullname || !normalNumber) {
      alert("Fill all fields");
      return;
    }

    await addDoc(normalRef, {
      provider: normalProvider,
      fullname: normalFullname,
      number: normalNumber,
    });

    setNormalFullname("");
    setNormalNumber("");

    loadNumbers();
  };

  // ADD STANDARD 🔥
  const handleAddStandard = async () => {

    if (!standardFullname || !standardNumber) {
      alert("Fill all fields");
      return;
    }

    await addDoc(standardRef, {
      name: standardFullname, // muhimu kwa OtherCountry
      number: standardNumber,
    });

    setStandardFullname("");
    setStandardNumber("");

    loadNumbers();
  };

  // DELETE
  const handleDeleteBusiness = async (id) => {
    await deleteDoc(doc(db, "depositNumbers", id));
    loadNumbers();
  };

  const handleDeleteNormal = async (id) => {
    await deleteDoc(doc(secondaryDb, "normalNumbers", id));
    loadNumbers();
  };

  const handleDeleteStandard = async (id) => {
    await deleteDoc(doc(standardDb, "othercountry", id));
    loadNumbers();
  };

  // RENDER BUSINESS
  const renderBusinessGroup = (provider) => {

    const filtered = businessNumbers.filter(n => n.provider === provider);

    if (filtered.length === 0) return null;

    return (
      <div style={{ marginTop: 15 }}>
        <h4>{provider}</h4>

        {filtered.map(item => (
          <div key={item.id} style={{
            background:"#111",
            padding:10,
            borderRadius:6,
            marginTop:6,
            display:"flex",
            justifyContent:"space-between"
          }}>
            <div>
              <div style={{fontWeight:"bold"}}>{item.fullname}</div>
              <div style={{opacity:.7}}>{item.number}</div>
            </div>

            <button onClick={()=>handleDeleteBusiness(item.id)} style={{
              background:"red",
              border:"none",
              color:"white",
              padding:"5px 10px",
              borderRadius:4
            }}>
              Delete
            </button>
          </div>
        ))}
      </div>
    );
  };

  // RENDER NORMAL
  const renderNormalGroup = (provider) => {

    const filtered = normalNumbers.filter(n => n.provider === provider);

    if (filtered.length === 0) return null;

    return (
      <div style={{ marginTop: 15 }}>
        <h4>{provider}</h4>

        {filtered.map(item => (
          <div key={item.id} style={{
            background:"#111",
            padding:10,
            borderRadius:6,
            marginTop:6,
            display:"flex",
            justifyContent:"space-between"
          }}>
            <div>
              <div style={{fontWeight:"bold"}}>{item.fullname}</div>
              <div style={{opacity:.7}}>{item.number}</div>
            </div>

            <button onClick={()=>handleDeleteNormal(item.id)} style={{
              background:"red",
              border:"none",
              color:"white",
              padding:"5px 10px",
              borderRadius:4
            }}>
              Delete
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{
      minHeight:"100vh",
      background:"#0f0f10",
      color:"white",
      padding:20,
      display:"flex",
      justifyContent:"center"
    }}>

      <div style={{
        width:"100%",
        maxWidth:1200,
        display:"flex",
        gap:30
      }}>

        {/* BUSINESS */}
        <div style={{flex:1}}>

          <h2>Business Numbers</h2>

          <select value={businessProvider} onChange={(e)=>setBusinessProvider(e.target.value)} style={{width:"100%",padding:10,marginTop:10}}>
            <option>Vodacom</option>
            <option>Airtel</option>
            <option>Tigo</option>
          </select>

          <input type="text" placeholder="Full Name" value={businessFullname} onChange={(e)=>setBusinessFullname(e.target.value)} style={{width:"100%",padding:10,marginTop:10}} />

          <input type="text" placeholder="Business Number" value={businessNumber} onChange={(e)=>setBusinessNumber(e.target.value)} style={{width:"100%",padding:10,marginTop:10}} />

          <button onClick={handleAddBusiness} style={{width:"100%",padding:12,marginTop:10,background:"green",border:"none",color:"white"}}>
            Add Business
          </button>

          {providers.map(p=>renderBusinessGroup(p))}
        </div>

        {/* NORMAL */}
        <div style={{flex:1}}>

          <h2>Normal Phones</h2>

          <select value={normalProvider} onChange={(e)=>setNormalProvider(e.target.value)} style={{width:"100%",padding:10,marginTop:10}}>
            <option>Vodacom</option>
            <option>Airtel</option>
            <option>Tigo</option>
            <option>Halotel</option>
          </select>

          <input type="text" placeholder="Full Name" value={normalFullname} onChange={(e)=>setNormalFullname(e.target.value)} style={{width:"100%",padding:10,marginTop:10}} />

          <input type="text" placeholder="Phone Number" value={normalNumber} onChange={(e)=>setNormalNumber(e.target.value)} style={{width:"100%",padding:10,marginTop:10}} />

          <button onClick={handleAddNormal} style={{width:"100%",padding:12,marginTop:10,background:"blue",border:"none",color:"white"}}>
            Add Phone
          </button>

          {providers.map(p=>renderNormalGroup(p))}
        </div>

        {/* STANDARD 🔥 */}
        <div style={{flex:1}}>

          <h2>Standard Accounts</h2>

          <input
            type="text"
            placeholder="Full Name"
            value={standardFullname}
            onChange={(e)=>setStandardFullname(e.target.value)}
            style={{width:"100%",padding:10,marginTop:10}}
          />

          <input
            type="text"
            placeholder="Phone Number"
            value={standardNumber}
            onChange={(e)=>setStandardNumber(e.target.value)}
            style={{width:"100%",padding:10,marginTop:10}}
          />

          <button
            onClick={handleAddStandard}
            style={{
              width:"100%",
              padding:12,
              marginTop:10,
              background:"purple",
              border:"none",
              color:"white"
            }}
          >
            Add Standard
          </button>

          {standardNumbers.map(item => (
            <div key={item.id} style={{
              background:"#111",
              padding:10,
              borderRadius:6,
              marginTop:6,
              display:"flex",
              justifyContent:"space-between"
            }}>
              <div>
                <div style={{fontWeight:"bold"}}>{item.name}</div>
                <div style={{opacity:.7}}>{item.number}</div>
              </div>

              <button onClick={()=>handleDeleteStandard(item.id)} style={{
                background:"red",
                border:"none",
                color:"white",
                padding:"5px 10px",
                borderRadius:4
              }}>
                Delete
              </button>
            </div>
          ))}

        </div>

      </div>
    </div>
  );
}