export const getMatches = async () => {

const TOKEN = "CSF9bud6Mz98Md2xVcLeKiRBVZImU88pvpGtpZLt9hA6xGVlRTJGM8ARw8iK";

try{

let allMatches = [];

/* 📅 90 DAYS RANGE 🔥 */
const today = new Date();
const future = new Date();
future.setDate(today.getDate() + 90); // 🔥 BADILIKO HAPA

const format = (d)=> d.toISOString().split("T")[0];

const start = format(today);
const end = format(future);

console.log("RANGE:", start, end);

/* 🔁 LOOP PAGES */
let page = 1;
let hasMore = true;

while(hasMore){

const res = await fetch(
`/api/v3/football/fixtures/between/${start}/${end}?api_token=${TOKEN}&include=participants;league;state&per_page=100&page=${page}`
);

const data = await res.json();

const matches = data.data || [];

console.log("PAGE:", page, "COUNT:", matches.length);

/* 🔥 ONLY NOT STARTED */
const filtered = matches.filter(m =>
m.state?.name === "Not Started" &&
new Date(m.starting_at) > new Date()
);

allMatches.push(...filtered);

/* NEXT PAGE */
if(data.pagination && data.pagination.has_more){
page++;
}else{
hasMore = false;
}

}

/* 🔥 REMOVE DUPLICATES */
const seen = new Set();
const unique = [];

for(const m of allMatches){
if(!seen.has(m.id)){
seen.add(m.id);
unique.push(m);
}
}

console.log("FINAL 90 DAYS:", unique.length);

return unique;

}catch(err){
console.log("ERROR:", err);
return [];
}

};