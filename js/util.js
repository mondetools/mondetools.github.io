// Shared helpers

const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const EPOCH=1420070400000n;
class NetworkError extends Error{}
const fmt=d=>new Date(d).toLocaleDateString(undefined,{dateStyle:"long"});
const fmtT=d=>new Date(d).toLocaleString(undefined,{dateStyle:"long",timeStyle:"short"});
function ago(d){const days=(Date.now()-new Date(d))/864e5;return days>=365?(days/365.25).toFixed(1)+" years old":days>=30?Math.floor(days/30.4)+" months old":Math.floor(days)+" days old"}
const dl=r=>"<dl>"+r.filter(x=>x[1]!=null&&x[1]!=="").map(x=>`<dt>${x[0]}</dt><dd>${x[1]}</dd>`).join("")+"</dl>";
const panel=(t,h)=>`<section class="panel"><h2>${t}</h2>${h}</section>`;
const chips=a=>a.length?`<div class="chips">${a.map(c=>`<span class="chip">${esc(c)}</span>`).join("")}</div>`:"";
const nice=f=>f.replace(/_/g," ").toLowerCase().replace(/^./,c=>c.toUpperCase());
const copyBtn=(t,l)=>`<button type="button" class="copy" data-copy="${esc(t)}">${l}</button>`;
const link=(u,t)=>`<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${t}</a>`;
const snowMs=id=>Number((BigInt(id)>>22n)+EPOCH);
const needId=(s,what)=>{s=String(s).trim();if(!/^\d{15,22}$/.test(s))throw new Error(`That doesn't look like a ${what}. IDs are 15–22 digits.`);return s};
async function api(path){
  let r;
  try{r=await fetch(path,{headers:{Accept:"application/json"}})}
  catch{throw new NetworkError("Couldn't reach the lookup service. Check that the NebulaKit Web Service is running, then try again.")}
  let j;
  try{j=await r.json()}
  catch{throw new Error(`The lookup service returned an invalid response (HTTP ${r.status}). Check the server logs.`)}
  if(!r.ok)throw new Error(j.error||`Lookup failed (HTTP ${r.status}).`);
  return j;
}
function view(o){
  return `<div class="grid"><article class="card"><div class="banner" style="${o.bg||""}"></div><div class="pad">
    ${o.img?`<img class="av${o.sq?" sq":""}" src="${esc(o.img)}" alt="${esc(o.name)}">`:`<div class="av${o.sq?" sq":""}"></div>`}
    <h2 class="name">${esc(o.name)}</h2>${o.sub?`<p class="user">${o.sub}</p>`:""}${o.chips||""}${o.id?copyBtn(o.id,"Copy ID"):""}
  </div></article><div>${o.panels.join("")}</div></div>`;
}
