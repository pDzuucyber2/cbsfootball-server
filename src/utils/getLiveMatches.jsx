

export const getLiveMatches = async () => {

const TOKEN = "TbJg0H6XPmpmReOgTLAto1bBQeaFPRgdcVlZ8mOwbITPukn9WJqJ25nFESf5";

const res = await fetch(
`https://api.sportmonks.com/v3/football/livescores?api_token=${TOKEN}&include=participants,league,scores`
);

const data = await res.json();

return data.data.map(match => ({

fixture:{
date: match.starting_at,
status:{short:"LIVE"}
},

league:{
name: match.league?.name
},

teams:{
home:{
name: match.participants?.[0]?.name,
logo: match.participants?.[0]?.image_path
},
away:{
name: match.participants?.[1]?.name,
logo: match.participants?.[1]?.image_path
}
}

}));

};