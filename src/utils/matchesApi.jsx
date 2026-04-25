export const getMatches = async () => {

const cache = localStorage.getItem("matches_cache");
const cacheTime = localStorage.getItem("matches_cache_time");

const now = Date.now();

// kama cache ipo na haijapita dakika 5
if(cache && cacheTime && (now - cacheTime) < 5 * 60 * 1000){

return JSON.parse(cache);

}

const res = await fetch("/api/v4/matches",{
headers:{
"X-Auth-Token":"0888f219aeb04b8fb80ebb3fbee65375"
}
});

const data = await res.json();

const list = data.matches || [];

localStorage.setItem("matches_cache",JSON.stringify(list));
localStorage.setItem("matches_cache_time",Date.now());

return list;

};