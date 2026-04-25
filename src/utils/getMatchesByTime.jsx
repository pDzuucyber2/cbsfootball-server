export const getMatchesByTime = async (date) => {

try{

const res = await fetch(`/football/fixtures?date=${date}`);
const data = await res.json();

const matches = data.response || [];

console.log("TOTAL FROM API:", matches.length);

/* 🔥 FILTER TIME (EAT) */
const filtered = matches.filter(m => {

const utc = new Date(m.fixture.date);
const eat = new Date(utc.getTime() + (3 * 60 * 60 * 1000));

const h = eat.getHours();
const min = eat.getMinutes();

/* 🎯 RANGE (IMEPANULIWA) */
if(h >= 12 && h <= 13) return true;   // mchana
if(h >= 22 && h <= 23) return true;   // usiku

return false;

});

console.log("AFTER FILTER:", filtered.length);

/* 🔥 kama hakuna matches → rudisha normal */
if(filtered.length === 0){
return matches.slice(0,5);
}

return filtered.slice(0,5);

}catch(err){
console.log("ERROR:", err);
return [];
}

};