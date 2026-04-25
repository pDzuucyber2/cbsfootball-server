import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./SportsTabs.css";

export default function SportsTabs(){

const navigate = useNavigate();
const location = useLocation();

const tabs = [
{ name:"Home", path:"/mypage" },
{ name:"SPORTS", path:"/sports" },
{ name:"LIVE", path:"/live" },
{ name:"CASINO", path:"/casino" },
{ name:"PROMO", path:"/virtuals" },
{ name:"AVIATOR", path:"/aviator" }
];

return(

<div className="sports-tabs">

{tabs.map((tab)=>(
<div
key={tab.path}
className={`tab ${location.pathname === tab.path ? "active":""}`}
onClick={()=>navigate(tab.path)}
>

{tab.name}

</div>
))}

</div>

)

}