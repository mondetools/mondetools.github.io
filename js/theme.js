// Theme picker: choose a look, remembered in this browser
const THEMES=[
 {id:"midnight",name:"Midnight",sw:["#08090b","#111215","#e5e6e8"]},
 {id:"daylight",name:"Daylight",sw:["#f4f5ff","#ffffff","#4f56e8"]},
 {id:"ocean",name:"Ocean",sw:["#07161f","#0e2533","#38c8ee"]},
 {id:"sunset",name:"Sunset",sw:["#1d0f14","#2b161d","#ff8a5c"]},
 {id:"forest",name:"Forest",sw:["#0b1712","#132a20","#4ade80"]},
 {id:"mono",name:"Mono",sw:["#000000","#171717","#ffffff"]},
 {id:"lavender",name:"Lavender",sw:["#171123","#261b38","#bd91ff"]},
 {id:"rose",name:"Rose",sw:["#21121b","#321b29","#ff78a8"]},
 {id:"nord",name:"Nord",sw:["#202733","#2e3848","#88c0d0"]},
 {id:"mint",name:"Mint",sw:["#10201e","#19312d","#64e6c1"]},
 {id:"amber",name:"Amber",sw:["#20180d","#322613","#ffc857"]},
 {id:"cyber",name:"Cyber",sw:["#100d20","#211739","#e879f9"]}
];
function setTheme(id,save=true){
  const t=THEMES.find(x=>x.id===id)||THEMES[0],root=document.documentElement;
  root.classList.add("theme-transition");
  root.dataset.theme=t.id;
  if(save){try{localStorage.setItem("monde-theme",t.id)}catch{}}
  document.querySelectorAll("#thm [data-t]").forEach(b=>b.setAttribute("aria-checked",String(b.dataset.t===t.id)));
  setTimeout(()=>root.classList.remove("theme-transition"),400);
}
function initThemes(){
  const box=$("#themes");
  box.innerHTML=`<button type="button" class="thb" id="thb" aria-haspopup="true" aria-expanded="false" aria-label="Choose theme" title="Choose theme">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="13.5" cy="6.5" r="1"/><circle cx="17.5" cy="10.5" r="1"/><circle cx="8.5" cy="7.5" r="1"/><circle cx="6.5" cy="12.5" r="1"/><path d="M12 22a10 10 0 110-20 9 7 0 019 7c0 3-2 4-4 4h-2a2 2 0 00-1 3.7c.7.8.2 2.3-2 2.3z"/></svg><span>Themes</span></button>
    <div class="thm" id="thm" role="menu" aria-label="Theme" hidden>${THEMES.map(t=>`<button type="button" role="menuitemradio" aria-checked="false" data-t="${t.id}"><span class="sw">${t.sw.map(c=>`<i style="background:${c}"></i>`).join("")}</span>${t.name}</button>`).join("")}</div>`;
  const menu=$("#thm"),btn=$("#thb");
  const toggle=open=>{menu.hidden=!open;btn.setAttribute("aria-expanded",String(open))};
  btn.onclick=()=>toggle(menu.hidden);
  menu.onclick=e=>{const b=e.target.closest("[data-t]");if(b){setTheme(b.dataset.t);toggle(false);btn.focus()}};
  document.addEventListener("click",e=>{if(!box.contains(e.target))toggle(false)});
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!menu.hidden){toggle(false);btn.focus()}});
  let saved=null;
  try{saved=localStorage.getItem("monde-theme")}catch{}
  setTheme(saved||document.documentElement.dataset.theme||"midnight",false);
}
initThemes();
