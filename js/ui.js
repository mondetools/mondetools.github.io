// Tool list, home page and routing

const $=s=>document.querySelector(s);
const nowLocal=()=>new Date(Date.now()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,16);
let accountState={signed_in:false};
const T=[
 {id:"profile",cat:"Users",title:"Profile lookup",desc:"View a public profile, avatar, badges and account age. Server roles and join date are not available yet.",f:[{n:"id",l:"User ID",p:"80351110224678912",m:1,pattern:"[0-9]{15,22}",title:"Enter a 15–22 digit Discord user ID."},{n:"gid",l:"Server ID — working on it",p:"Working on it",m:1,o:1,disabled:true}],run:profile},
 {id:"bulk",cat:"Users",title:"Bulk ID checker",desc:"Paste several IDs to sort them by account age. Handy for spotting freshly made accounts.",f:[{n:"ids",l:"User IDs",t:"textarea",p:"One per line, or separated by spaces or commas"}],run:bulk,b:"Check IDs"},
 {id:"bulkusers",cat:"Users",title:"Bulk user lookup",desc:"Resolve up to 40 IDs into usernames and creation dates. It runs one at a time, so give it a few seconds.",f:[{n:"ids",l:"User IDs",t:"textarea",p:"One per line, or separated by spaces or commas"}],run:bulkusers,b:"Resolve"},
 {id:"saved-ids",cat:"Users",title:"Saved IDs",desc:"Keep a private collection of user and server IDs in your signed-in account.",auth:1,c:savedIdsC,after:savedIdsAfter},
 {id:"history",cat:"Users",title:"Lookup history",desc:"Review saved inputs and results when you have opted in to account history.",auth:1,c:historyC,after:historyAfter},
 {id:"user-link",cat:"Users",title:"User profile link builder",desc:"Create a Discord profile link and mention from a user ID. No lookup is performed.",f:[{n:"id",l:"User ID",p:"Paste a Discord user ID",m:1}],run:userLink,b:"Build profile link"},
 {id:"mentions",cat:"Users",title:"User mention formatter",desc:"Format up to 50 user IDs as Discord mentions and profile links. Results are generated locally and never sent.",f:[{n:"ids",l:"User IDs",t:"textarea",p:"One per line, or separated by spaces or commas"}],run:userMentions,b:"Format mentions"},
 {id:"badges",cat:"Users",title:"Badge decoder",desc:"Turn a public flags number into badge names.",f:[{n:"n",l:"Public flags number",p:"e.g. 64"}],run:badges,b:"Decode"},
 {id:"asset-link",cat:"Users",title:"CDN asset link builder",desc:"Build a direct Discord CDN link for a user avatar or server icon/banner from its ID and asset hash.",f:[{n:"type",l:"Asset type",t:"select",s:["User avatar","Server icon","Server banner"]},{n:"id",l:"User or server ID",p:"15–22 digit ID",m:1,pattern:"[0-9]{15,22}"},{n:"hash",l:"Asset hash",p:"Paste the avatar, icon or banner hash"},{n:"format",l:"Image format",t:"select",s:["webp","png","jpg","gif"]},{n:"size",l:"Image size",t:"select",s:["128","256","512","1024","2048"]}],run:assetLink,b:"Build CDN link"},
 {id:"cohort",cat:"Users",title:"Account creation cohort",desc:"Group user IDs by creation hour or day to spot public account-creation clusters. Analysis stays in your browser.",f:[{n:"ids",l:"User IDs (up to 200)",t:"textarea",p:"One user ID per line"},{n:"granularity",l:"Group by",t:"select",s:["Hour (UTC)","Day (UTC)"]}],run:accountCohort,b:"Analyze cohort"},
 {id:"invite",cat:"Servers",title:"Invite lookup",desc:"See which server an invite leads to, its member counts, and who made it, without joining.",f:[{n:"code",l:"Invite link or code",p:"discord.gg/example"}],run:invite},
 {id:"invite-batch",cat:"Servers",title:"Public invite batch inspector",desc:"Inspect up to five invite codes for public server details, member counts and expiry. It does not join any servers.",f:[{n:"codes",l:"Invite codes or links (up to 5)",t:"textarea",p:"One Discord invite code or link per line"}],run:inviteBatch,b:"Inspect invites"},
 {id:"vanity",cat:"Servers",title:"Vanity URL checker",desc:"Type a vanity name to see which server owns discord.gg/name, or whether nobody is using it.",f:[{n:"name",l:"Vanity name or link",p:"discord.gg/example"}],run:vanity},
 {id:"server",cat:"Servers",title:"Server lookup",desc:"Public details for a server ID. Works only if the server is discoverable or has its widget turned on.",f:[{n:"id",l:"Server ID",p:"Server ID",m:1}],run:server},
 {id:"compare",cat:"Servers",title:"Public server comparison",desc:"Compare names, creation dates, public member counts and features for up to four discoverable or widget-enabled servers.",f:[{n:"ids",l:"Server IDs",t:"textarea",p:"Paste 2–4 server IDs, one per line"}],run:compare,b:"Compare servers"},
 {id:"clan",cat:"Servers",title:"Clan tag finder",desc:"Discord can't search by tag name. Enter the ID of someone wearing the tag and this finds the server it belongs to.",f:[{n:"id",l:"User ID of someone wearing the tag",p:"80351110224678912",m:1}],run:clan},
 {id:"embed",cat:"Developer",title:"Embed builder",desc:"Design an embed with a live preview, then copy it as discord.js, discord.py or raw JSON.",c:embedC,after:embedAfter},
 {id:"webhook",cat:"Developer",title:"Webhook sender",desc:"Send a message or embed to up to five webhooks you control. Sends are sequential and rate-limited; webhook URLs stay in this page.",c:hookC,after:hookAfter},
 {id:"intents",cat:"Developer",title:"Gateway intent calculator",desc:"Tick intents to get the combined number for your bot, or decode a number back into intents.",c:intC,after:intAfter},
 {id:"oauth",cat:"Developer",title:"Bot invite builder",desc:"Build a Discord OAuth2 authorization link from your application ID, scopes and permission bitfield.",f:[{n:"id",l:"Application ID",p:"Your Discord application ID",m:1},{n:"scopes",l:"Scopes (space-separated)",p:"bot applications.commands"},{n:"permissions",l:"Permissions bitfield (optional)",p:"0",m:1,o:1}],run:oauth,b:"Build invite"},
 {id:"permissions-build",cat:"Developer",title:"Permission calculator",desc:"Choose Discord permissions and build the decimal and hexadecimal bitfield for a bot invite or application command.",c:permissionBuildC,after:permissionBuildAfter},
 {id:"json-format",cat:"Developer",title:"JSON formatter",desc:"Validate JSON, then format it for reading or compact it for sharing. Its inputs and results are saved only if you enable account history.",f:[{n:"json",l:"JSON input",t:"textarea",p:"Paste JSON here"},{n:"mode",l:"Output format",t:"select",s:["Readable (2 spaces)","Minified"]}],run:jsonFormat,b:"Format JSON"},
 {id:"snow-timeline",cat:"Utilities",title:"Snowflake timeline",desc:"Order supplied Discord IDs by creation time and calculate the time gaps between them. Runs locally.",f:[{n:"ids",l:"Discord IDs (2–100)",t:"textarea",p:"One user, server, channel or message ID per line"}],run:snowTimeline,b:"Build timeline"},
 {id:"message-timeline",cat:"Utilities",title:"Message link timeline",desc:"Sort supplied Discord message links chronologically and show the time between linked messages. Links are parsed locally, not opened.",f:[{n:"links",l:"Message links (2–50)",t:"textarea",p:"One Discord message link per line"}],run:messageTimeline,b:"Analyze timeline"},
 {id:"snow",cat:"Utilities",title:"Snowflake decoder",desc:"Every Discord ID hides its creation time. Works for users, servers, channels and messages. Twitter IDs work too.",f:[{n:"kind",l:"Platform",t:"select",s:["Discord","Twitter"]},{n:"id",l:"ID",p:"80351110224678912",m:1}],run:snow,b:"Decode"},
 {id:"message-link",cat:"Utilities",title:"Message link parser",desc:"Break a Discord message link into server, channel and message IDs, with the message creation time.",f:[{n:"url",l:"Discord message link",p:"https://discord.com/channels/server/channel/message"}],run:messageLink,b:"Parse link"},
 {id:"extract",cat:"Utilities",title:"Reference extractor",desc:"Find Discord invites, mentions and IDs in pasted text. Runs locally in your browser; nothing is uploaded or checked.",f:[{n:"text",l:"Text to inspect (up to 100 KB)",t:"textarea",p:"Paste text containing Discord references"}],run:extract,b:"Extract references"},
 {id:"time",cat:"Utilities",title:"Time converter",desc:"Convert a date or Unix timestamp into every Discord timestamp format, plus the time in major time zones.",f:[{n:"dt",l:"Date and time",t:"datetime-local",v:nowLocal,o:1},{n:"unix",l:"Or a Unix timestamp",p:"e.g. 1767225600",m:1,o:1}],run:time,b:"Convert"},
 {id:"perms",cat:"Utilities",title:"Permissions decoder",desc:"Turn a permissions number into a readable list.",f:[{n:"n",l:"Permissions number",p:"e.g. 8",m:1}],run:perms,b:"Decode"},
 {id:"markdown-preview",cat:"Utilities",title:"Discord Markdown preview",desc:"Preview common Discord formatting, quotes and code blocks right in the browser.",f:[{n:"text",l:"Message text",t:"textarea",p:"Try **bold**, *italic*, __underline__, ~~strikethrough~~, `inline code`, or a > quote."}],run:markdownPreview,b:"Preview message"}
];
const field=f=>`<label>${f.l}${f.t==="textarea"
  ?`<textarea name="${f.n}" rows="5" placeholder="${esc(f.p||"")}" ${f.o?"":"required"}></textarea>`
  :f.t==="select"?`<select name="${f.n}">${f.s.map(o=>`<option>${o}</option>`).join("")}</select>`
  :`<input name="${esc(f.n)}" type="${f.t||"text"}" ${f.m?'inputmode="numeric"':""} ${f.pattern?`pattern="${esc(f.pattern)}"`:""} ${f.title?`title="${esc(f.title)}"`:""} ${f.disabled?"disabled":""} autocomplete="off" placeholder="${esc(f.p||"")}" value="${f.v?esc(f.v()):""}" ${f.o?"":"required"}>`}</label>`;
function openForm(id){
  const t=T.find(x=>x.id===id)||T[0];
  document.documentElement.style.removeProperty("--glow");
  $("#stage").innerHTML=`${head(t)}
    <form class="form">${t.f.map(field).join("")}<button>${t.b||"Look up"}</button></form><p id="err" role="alert"></p><div id="out"></div>`;
  history.replaceState(null,"","#"+t.id);
  $("#stage form").onsubmit=async e=>{
    e.preventDefault();
    const v=Object.fromEntries(new FormData(e.target)),btn=e.target.querySelector("button"),label=btn.textContent;
    $("#err").textContent="";btn.disabled=true;btn.textContent="Working…";
    try{
      const result=await t.run(v);
      $("#out").innerHTML=result;
      if(accountState.signed_in&&accountState.history_enabled&&t.id!=="webhook"){
        try{await siteApi("/api/history",jsonOptions({tool:t.id,inputs:v,result}))}
        catch(error){$("#err").textContent="Lookup succeeded, but history could not be saved: "+error.message}
      }
    }
    catch(x){$("#out").innerHTML="";$("#err").textContent=x instanceof NetworkError?x.message:x.message||"Lookup failed.";const er=$("#err");er.classList.remove("shake");void er.offsetWidth;er.classList.add("shake")}
    finally{btn.disabled=false;btn.textContent=label}
  };
}
const CC={Users:"#7c83ff",Servers:"#3ddbc0",Developer:"#ff7ab6",Utilities:"#ffb454"};
const IC={
 profile:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
 "asset-link":'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 3v6M21 12h-6"/>',
 cohort:'<path d="M4 19V5M4 19h17"/><path d="M7 15l4-4 3 2 6-7"/><circle cx="7" cy="15" r="1"/><circle cx="11" cy="11" r="1"/><circle cx="14" cy="13" r="1"/>',
 bulk:'<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/>',
 bulkusers:'<circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3-5.5 7-5.5s7 2 7 5.5"/><path d="M16 4.5a3.5 3.5 0 010 7M18 14.8c2.4.7 4 2.3 4 5.2"/>',
 "user-link":'<circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3-5.5 7-5.5 1.5 0 2.8.3 3.8.8"/><path d="M15 14h6M18 11v6"/>',
 mentions:'<path d="M8 12a4 4 0 118 0v1a2 2 0 01-4 0v-1a4 4 0 018 0v1a8 8 0 11-2.3-5.6"/>',
 badges:'<circle cx="12" cy="9" r="6"/><path d="M8.5 14.5L7 22l5-3 5 3-1.5-7.5"/>',
 vanity:'<circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 006 0v-1a10 10 0 10-4 8"/>',
 invite:'<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/>',
 "invite-batch":'<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/>',
 server:'<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01"/>',
 clan:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
 compare:'<rect x="3" y="4" width="8" height="16" rx="2"/><rect x="13" y="4" width="8" height="16" rx="2"/><path d="M6 8h2M16 8h2M6 12h2M16 12h2"/>',
 extract:'<path d="M8 7H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-3M16 3h5v5M21 3l-9 9"/><path d="M6 12h3M6 16h6"/>',
 embed:'<path d="M8 8l-5 4 5 4M16 8l5 4-5 4M14 5l-4 14"/>',
 webhook:'<path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/>',
 intents:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
 oauth:'<path d="M10 13a5 5 0 007.1 0l3-3a5 5 0 00-7.1-7.1l-1.7 1.7"/><path d="M14 11a5 5 0 00-7.1 0l-3 3a5 5 0 007.1 7.1l1.7-1.7"/>',
 snow:'<path d="M5 9h14M5 15h14M10 3L8 21M16 3l-2 18"/>',
 "message-link":'<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/><path d="M12 2v2M22 12h-2M4 12H2"/>',
 "snow-timeline":'<path d="M4 19V5M4 19h17"/><path d="M7 15l4-4 3 2 6-7"/>',
 "message-timeline":'<circle cx="6" cy="7" r="2"/><circle cx="18" cy="17" r="2"/><path d="M8 7h8a2 2 0 012 2v6M16 17H8a2 2 0 01-2-2V9"/>',
 time:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 perms:'<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/>',
 "permissions-build":'<path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6l1 1 2-2M3 12l1 1 2-2M3 18l1 1 2-2"/>',
 "json-format":'<path d="M8 3H6a2 2 0 00-2 2v4a3 3 0 01-3 3 3 3 0 013 3v4a2 2 0 002 2h2M16 3h2a2 2 0 012 2v4a3 3 0 003 3 3 3 0 00-3 3v4a2 2 0 01-2 2h-2"/>',
 "markdown-preview":'<path d="M4 6h16M4 12h12M4 18h16"/>'};
const head=t=>`<div class="crumb"><a href="#tools">← All tools</a><span class="crumb-cat">${t.cat}</span></div><div class="th"><span class="ti" style="--c:${CC[t.cat]}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[t.id]||""}</svg></span><div><h2 class="tt">${t.title}</h2><p class="note">${t.desc}</p></div></div>`;
function setPrimaryNav(page){
  document.querySelectorAll(".site-nav a").forEach(link=>{
    if(link.id===`nav-${page}`)link.setAttribute("aria-current","page");
    else link.removeAttribute("aria-current");
  });
}
function openHome(){
  document.documentElement.style.removeProperty("--glow");
  $(".shell").classList.add("home");
  $(".shell").classList.remove("tools-page");
  history.replaceState(null,"","#home");
  setPrimaryNav("home");
  const tools=T.filter(t=>accountState.signed_in||!t.auth);
  const categories=[
    {cat:"Users",icon:"profile",desc:"Profiles, public IDs and account details."},
    {cat:"Servers",icon:"server",desc:"Invite lookups and public server details."},
    {cat:"Developer",icon:"embed",desc:"Embeds, permissions and bot setup."},
    {cat:"Utilities",icon:"snow",desc:"Time, message links and ID helpers."}
  ];
  $("#stage").innerHTML=`<div class="landing">
    <section class="hero landing-hero"><div class="orb o1"></div><div class="orb o2"></div>
      <div class="hero-eye" aria-hidden="true"><svg viewBox="0 0 300 160" focusable="false"><path class="eye-contour" d="M11 80c36-43 90-65 139-65s103 22 139 65c-36 43-90 65-139 65S47 123 11 80Z"/><path class="eye-upper" d="M22 77c34-32 78-49 128-49s94 17 128 49"/><path class="eye-lower" d="M22 83c34 32 78 49 128 49s94-17 128-49"/><path class="eye-highlight" d="M43 70c31-24 68-36 107-36s76 12 107 36"/></svg><span class="eye-iris"><img src="./nebulakit-mark.svg" alt=""></span><span class="eye-glint"></span></div>
      <span class="pill">MONDE TOOLS · DISCORD TOOLKIT</span>
      <h1 class="hero-h">Your Discord toolkit, <span>in one place.</span></h1>
      <p class="sub">Look up public profiles and servers, decode Discord data, and build developer tools from one simple workspace.</p>
      <form class="home-search" id="home-search"><span class="home-search-icon" aria-hidden="true">⌕</span><input id="home-q" type="search" aria-label="Search tools" placeholder="Search the tool directory"><button type="submit">Search <span aria-hidden="true">→</span></button></form>
      <div class="home-actions"><a class="home-cta" href="#tools">Explore all tools <span aria-hidden="true">↗</span></a><span class="note">${tools.length} tools · 4 categories · Free to use</span></div>
      <div class="featured-heading"><span class="eyebrow">POPULAR STARTING POINTS</span><span class="note">Jump straight in</span></div>
      <div class="featured" aria-label="Popular tools">${["profile","server","embed"].map(id=>{const t=T.find(x=>x.id===id);return `<a class="feature" href="#${t.id}" style="--c:${CC[t.cat]}"><span class="ti"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[t.id]}</svg></span><span><b>${t.title}</b><small>${t.cat} tool</small></span><span class="feature-go" aria-hidden="true">↗</span></a>`}).join("")}</div>
    </section>
    <section class="home-categories" aria-labelledby="category-heading"><div class="category-heading"><div><span class="eyebrow">BROWSE BY CATEGORY</span><h2 id="category-heading">What do you need to do?</h2></div><p class="note">Choose a category to see matching tools</p></div><div class="category-grid">${categories.map(category=>`<a class="category-card" href="#tools/${category.cat}" style="--c:${CC[category.cat]}"><span class="category-icon ti"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[category.icon]}</svg></span><span class="category-copy"><b>${category.cat}</b><small>${category.desc}</small></span><span class="category-foot"><span>${tools.filter(t=>t.cat===category.cat).length} tools</span><span class="category-arrow" aria-hidden="true">↗</span></span></a>`).join("")}</div></section>
    <section class="home-bottom"><div><span class="eyebrow">READY WHEN YOU ARE</span><h2>Find the right tool and get going.</h2><p class="note">Search the full directory or browse by category.</p></div><a class="home-cta" href="#tools">Browse the toolbox <span aria-hidden="true">→</span></a></section>
  </div>`;
  $("#home-search").onsubmit=event=>{event.preventDefault();openTools("All",$("#home-q").value.trim())};
}
function openTools(initialCategory="All",initialSearch=""){
  document.documentElement.style.removeProperty("--glow");
  $(".shell").classList.remove("home");
  $(".shell").classList.add("tools-page");
  history.replaceState(null,"","#tools");
  setPrimaryNav("tools");
  const categoryNames=["All","Users","Servers","Developer","Utilities"];
  let cat=categoryNames.find(x=>x.toLowerCase()===String(initialCategory).toLowerCase())||"All";
  const tools=T.filter(t=>accountState.signed_in||!t.auth);
  $("#stage").innerHTML=`<div class="directory-page"><div class="directory-intro"><a class="directory-back" href="#home">← Home</a><span class="eyebrow">THE TOOLBOX</span><h1>Explore all tools</h1><p class="sub">Search the directory or narrow it down by category.</p></div>
    <div class="finder" id="tool-directory"><div class="directory-heading"><div><span class="eyebrow">TOOL DIRECTORY</span><h2>Find what you need</h2></div><span class="note">${tools.length} tools · 4 categories</span></div><input id="q" type="search" placeholder="Search tools…  (press /)" aria-label="Search tools" autocomplete="off">
    <div class="filters" id="flt">${["All","Users","Servers","Developer","Utilities"].map(c=>`<button type="button" class="fchip" data-c="${c}" aria-pressed="${c==="All"}">${c}</button>`).join("")}</div></div>
    <div class="tiles" id="tiles"></div>`;
  const draw=anim=>{
    const k=$("#q").value.trim().toLowerCase(),list=tools.filter(t=>(cat==="All"||t.cat===cat)&&(t.title+" "+t.desc).toLowerCase().includes(k));
    $("#tiles").innerHTML=list.length?list.map((t,i)=>`<a class="tile${anim?"":" still"}" href="#${t.id}" style="--c:${CC[t.cat]};--i:${i}"><span class="ti"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[t.id]||""}</svg></span><h3>${t.title}</h3><p>${t.desc}</p><span class="tag">${t.cat}</span><span class="go" aria-hidden="true">→</span></a>`).join(""):'<p class="note">No tools match that search.</p>';
  };
  $("#q").oninput=()=>draw(false);
  $("#flt").onclick=e=>{const b=e.target.closest("button");if(!b)return;cat=b.dataset.c;document.querySelectorAll(".fchip").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));draw(true)};
  $("#q").value=initialSearch;
  document.querySelector(`.fchip[data-c="${cat}"]`).setAttribute("aria-pressed","true");
  draw(true);
}
function open(id){
  setPrimaryNav("");
  if(id==="account")return openAccount();
  if(id==="help")return openHelp();
  if(id==="terms")return openTerms();
  if(id==="admin")return openAdmin();
  if(id==="tools")return openTools();
  if(id.startsWith("tools/"))return openTools(decodeURIComponent(id.slice(6)));
  if(id.startsWith("ticket/"))return openTicket(id.slice(7));
  if(!id||id==="home")return openHome();
  $(".shell").classList.remove("home");
  const t=T.find(x=>x.id===id)||T[0];
  setPrimaryNav("tools");
  if(t.auth&&!accountState.signed_in){openAccount("Sign in to use this private tool.");return}
  if(!t.c)return openForm(t.id);
  document.documentElement.style.removeProperty("--glow");
  $("#stage").innerHTML=`${head(t)}${t.c()}`;
  history.replaceState(null,"","#"+t.id);
  t.after();
}
async function siteApi(path,options={}){
  const response=await fetch(`${API_BASE}${path}`,{credentials:"include",...options});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(data.error||"Request failed ("+response.status+").");
  return data;
}
const jsonOptions=data=>({method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
function siteHeading(title,description){
  return `<div class="crumb"><a href="#home">← Home</a><span class="crumb-cat">NebulaKit</span></div><div class="th"><span class="ti" style="--c:var(--accent)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1- 8-4-8-9V6z"/></svg></span><div><h2 class="tt">${esc(title)}</h2><p class="note">${esc(description)}</p></div></div>`;
}
function openAccount(message=""){
  $(".shell").classList.remove("home");
  history.replaceState(null,"","#account");
  if(!accountState.signed_in){
    $("#stage").innerHTML=siteHeading("Your NebulaKit account","Sign in with Discord to unlock your personal tools and saved workspace.")+
      `<section class="panel site-panel"><p class="note">${esc(message||"Sign-in is optional. Public tools work without an account.")}</p><a class="discord-signin" href="${API_BASE}/auth/discord">Continue with Discord</a><p class="note account-privacy">NebulaKit requests your Discord account identity only. It does not request access to your servers or messages.</p></section>`;
    return;
  }
  $("#stage").innerHTML=siteHeading("Your account","Your private tools and saved workspace.")+
    `<section class="panel site-panel account-panel"><div class="account-profile">${accountState.avatar?`<img src="${esc(accountState.avatar)}" alt="">`:""}<div><h3>${esc(accountState.username)}</h3><code>${esc(accountState.id)}</code></div></div>
    <h3 class="ch">Your signed-in tools</h3><div class="account-tools">
      <a class="feature" href="#saved-ids"><span class="ti" style="--c:#7c83ff">ID</span><span><b>Saved IDs</b><small>Your private user and server list</small></span><span class="feature-go">↗</span></a>
      <a class="feature" href="#history"><span class="ti" style="--c:#3ddbc0">↺</span><span><b>Lookup history</b><small>Review your saved tool activity</small></span><span class="feature-go">↗</span></a>
    </div>
    <label class="chk history-toggle"><input id="history-enabled" type="checkbox" ${accountState.history_enabled?"checked":""}> Save tool inputs and results to my account</label>
    <p class="note">History is off until you enable it. Webhook URLs and sender activity are never saved. Turning history off deletes your saved history.</p>
    <p id="account-status" role="status" class="note"></p>
    <div class="account-actions"><button type="button" class="mini" id="clear-history">Clear history</button><button type="button" class="mini" id="signout">Sign out</button></div></section>`;
  $("#history-enabled").onchange=async e=>{
    const status=$("#account-status");status.textContent="Saving setting…";
    try{const data=await siteApi("/api/history/settings",jsonOptions({enabled:e.target.checked}));accountState.history_enabled=data.enabled;status.textContent=data.enabled?"History is on. New tool inputs and results will be saved.":"History is off and saved entries were deleted."}
    catch(error){e.target.checked=accountState.history_enabled;status.textContent=error.message}
  };
  $("#clear-history").onclick=async()=>{
    const status=$("#account-status");
    try{await siteApi("/api/history/clear",jsonOptions({}));status.textContent="Lookup history cleared."}
    catch(error){status.textContent=error.message}
  };
  $("#signout").onclick=async()=>{
    try{await siteApi("/api/auth/logout",jsonOptions({}));accountState={signed_in:false};renderAccountNav();openAccount("You have been signed out.")}
    catch(error){$("#account-status").textContent=error.message}
  };
}
function savedIdsC(){
  return `<section class="panel site-panel"><h3 class="ch">Save an ID</h3><form id="save-id-form" class="save-id-form">
    <label>Type<select name="kind"><option value="user">User</option><option value="server">Server</option></select></label>
    <label>Discord ID<input name="value" inputmode="numeric" pattern="[0-9]{15,22}" required placeholder="15–22 digit ID"></label>
    <label>Label (optional)<input name="label" maxlength="80" placeholder="A label for your reference"></label>
    <button>Save ID</button></form><p id="saved-status" role="status" class="note"></p><div id="saved-list"></div></section>`;
}
async function savedIdsAfter(){
  const list=$("#saved-list"),status=$("#saved-status");
  const render=async()=>{
    const rows=await siteApi("/api/saved-ids");
    list.innerHTML=rows.length?`<div class="saved-list">${rows.map(row=>`<div class="saved-item"><div><span class="saved-kind">${esc(row.kind)}</span><b>${esc(row.label||row.value)}</b><code>${esc(row.value)}</code></div><div class="saved-actions"><a class="mini action-link" href="#${row.kind==="user"?"profile":"server"}">${row.kind==="user"?"Profile":"Server tool"}</a><button type="button" class="mini" data-remove-saved="${row.id}">Remove</button></div></div>`).join("")}</div>`:'<p class="note">No saved IDs yet.</p>';
  };
  try{await render()}catch(error){status.textContent=error.message}
  $("#save-id-form").onsubmit=async event=>{
    event.preventDefault();const data=Object.fromEntries(new FormData(event.currentTarget));
    try{await siteApi("/api/saved-ids",jsonOptions(data));event.currentTarget.reset();status.textContent="ID saved.";await render()}
    catch(error){status.textContent=error.message}
  };
  list.onclick=async event=>{
    const button=event.target.closest("[data-remove-saved]");if(!button)return;
    try{await siteApi("/api/saved-ids/"+button.dataset.removeSaved,jsonOptions({}));await render()}
    catch(error){status.textContent=error.message}
  };
}
function historyC(){
  return `<section class="panel site-panel"><div class="account-actions"><p class="note">History is private to your account and limited to the latest 100 entries.</p><button type="button" class="mini" id="clear-history-page">Clear history</button></div><p id="history-status" role="status" class="note"></p><div id="history-list"></div></section>`;
}
async function historyAfter(){
  const list=$("#history-list"),status=$("#history-status");
  $("#clear-history-page").onclick=async()=>{
    try{await siteApi("/api/history/clear",jsonOptions({}));status.textContent="Lookup history cleared.";list.innerHTML=""}
    catch(error){status.textContent=error.message}
  };
  if(!accountState.history_enabled){status.textContent="History is off. Turn it on from your account page to save future tool inputs and results.";return}
  try{
    const rows=await siteApi("/api/history");
    list.innerHTML=rows.length?`<div class="history-list">${rows.map(row=>`<details class="history-item"><summary><span>${esc(row.tool)}</span><time>${esc(fmtT(row.created_at))}</time></summary><h4>Inputs</h4><pre>${esc(JSON.stringify(row.inputs,null,2))}</pre><h4>Result snapshot</h4><pre>${esc(row.result)}</pre></details>`).join("")}</div>`:'<p class="note">No saved history yet.</p>';
  }catch(error){status.textContent=error.message}
}
function openHelp(){
  $(".shell").classList.remove("home");history.replaceState(null,"","#help");
  $("#stage").innerHTML=siteHeading("Help","Send a message to NebulaKit support or return to an existing ticket.")+
    `<div class="two help-layout"><section class="panel site-panel"><h3 class="ch">Contact support</h3><p class="note">You’ll receive a private ticket code. Keep it safe; anyone with the code can read and reply to the ticket.</p>
      <form id="help-form" class="form"><label>Category<select name="category"><option>Bug</option><option>Account</option><option>Feature request</option><option>Other</option></select></label><label>Subject<input name="subject" required minlength="3" maxlength="120"></label><label>Message<textarea name="message" rows="5" required minlength="10" maxlength="10000"></textarea></label><p class="note ticket-disclosure">Your subject and message will be sent to NebulaKit support and its configured Discord notification channel. Don’t include passwords, tokens, or other secrets.</p><button>Send help request</button></form><p id="help-status" role="status" class="note"></p><div id="new-ticket"></div>
    </section><section class="panel site-panel"><h3 class="ch">Open a ticket</h3><form id="ticket-open" class="form"><label>Ticket ID<input name="id" required autocomplete="off"></label><label>Private access code<input name="key" required autocomplete="off"></label><button>Open ticket</button></form></section></div>`;
  $("#help-form").onsubmit=async event=>{
    event.preventDefault();const status=$("#help-status"),button=event.currentTarget.querySelector("button");button.disabled=true;
    try{
      const ticket=await siteApi("/api/tickets",jsonOptions(Object.fromEntries(new FormData(event.currentTarget))));
      try{sessionStorage.setItem("monde-ticket-key:"+ticket.id,ticket.key)}catch{}
      const url=location.href.split("#")[0]+`#ticket=${encodeURIComponent(ticket.id)}&key=${encodeURIComponent(ticket.key)}`;
      $("#new-ticket").innerHTML=`<section class="ticket-created"><h3>Request received</h3><p>Your ticket ID and private access code are shown below once. Save them to check for replies.</p><p><b>Ticket ID</b><br><code>${esc(ticket.id)}</code></p><p><b>Private access code</b><br><code class="break-code">${esc(ticket.key)}</code></p><p><a href="${esc(url)}">Save private ticket link</a></p><button type="button" class="mini" data-copy="${esc(ticket.key)}">Copy access code</button></section>`;
      status.textContent=ticket.notification_status==="sent"
        ?"Support has been notified. Keep your ticket code private."
        :ticket.notification_status==="not_configured"
          ?"Ticket created, but Discord notifications are not configured on this server. Keep your ticket code private."
          :"Ticket created, but the Discord notification could not be delivered. Your ticket is saved in the support inbox. Keep your ticket code private.";
      event.currentTarget.reset();
    }catch(error){status.textContent=error.message}
    finally{button.disabled=false}
  };
  $("#ticket-open").onsubmit=event=>{
    event.preventDefault();const data=Object.fromEntries(new FormData(event.currentTarget));
    try{sessionStorage.setItem("monde-ticket-key:"+data.id,data.key)}catch{}
    location.hash="ticket/"+encodeURIComponent(data.id);
  };
}
async function openTicket(ticketId){
  $(".shell").classList.remove("home");
  const id=decodeURIComponent(ticketId);
  history.replaceState(null,"","#ticket/"+encodeURIComponent(id));
  $("#stage").innerHTML=siteHeading("Support ticket","Private conversation with NebulaKit support.")+
    `<section class="panel site-panel"><div id="ticket-content"><p class="note">Loading ticket…</p></div></section>`;
  let key="";try{key=sessionStorage.getItem("monde-ticket-key:"+id)||""}catch{}
  const render=async()=>{
    const ticket=await siteApi("/api/tickets/"+encodeURIComponent(id),{headers:{"X-Ticket-Key":key}});
    $("#ticket-content").innerHTML=`<h3 class="ch">${esc(ticket.subject)} <span class="ticket-status">${esc(ticket.status)}</span></h3><p class="note">Category: ${esc(ticket.category)}</p><div class="ticket-messages">${ticket.messages.map(m=>`<article class="ticket-message ${m.sender==="admin"?"staff":""}"><div><b>${m.sender==="admin"?"NebulaKit support":"You"}</b><time>${esc(fmtT(m.created_at))}</time></div><p>${esc(m.body)}</p></article>`).join("")}</div>
      ${ticket.status==="open"?`<form id="ticket-reply" class="form"><label>Your reply<textarea name="message" rows="3" maxlength="10000" required></textarea></label><button>Send reply</button></form>`:'<p class="note">This ticket has been closed. Contact support with a new ticket if you still need help.'}<p id="ticket-status-msg" role="status" class="note"></p>`;
    const replyForm=$("#ticket-reply");
    if(replyForm)replyForm.onsubmit=async event=>{
      event.preventDefault();const button=event.currentTarget.querySelector("button");button.disabled=true;
      try{await siteApi(`/api/tickets/${encodeURIComponent(id)}/messages`,{...jsonOptions(Object.fromEntries(new FormData(event.currentTarget))),headers:{"Content-Type":"application/json","X-Ticket-Key":key}});event.currentTarget.reset();await render()}
      catch(error){$("#ticket-status-msg").textContent=error.message}
      finally{button.disabled=false}
    };
  };
  try{await render()}
  catch(error){
    $("#ticket-content").innerHTML=`<p class="note">${esc(error.message)}</p><form id="ticket-key-form" class="form"><label>Private access code<input name="key" required autocomplete="off"></label><button>Open ticket</button></form>`;
    $("#ticket-key-form").onsubmit=async event=>{event.preventDefault();key=new FormData(event.currentTarget).get("key");try{sessionStorage.setItem("monde-ticket-key:"+id,key)}catch{};await render().catch(e=>{$("#ticket-content").innerHTML=`<p class="note">${esc(e.message)}</p>`})};
  }
}
function openTerms(){
  $(".shell").classList.remove("home");history.replaceState(null,"","#terms");
  $("#stage").innerHTML=siteHeading("Terms of use","Last updated November 12, 2026.")+
    `<article class="panel site-panel terms-copy"><h3>Using NebulaKit</h3><p>Use NebulaKit lawfully and respectfully. Do not use the tools to harass, spam, impersonate, or violate another service’s terms. You are responsible for actions you take using generated links, IDs, embeds, or webhook messages.</p>
    <h3>Discord data</h3><p>Lookups are limited to public Discord data and data available to the configured bot. Public data may be incomplete or change without notice. NebulaKit is independent and is not affiliated with Discord Inc.</p>
    <h3>Accounts and saved information</h3><p>Discord sign-in is optional and requests account identity only. Saved IDs are stored in your account. Lookup history is off by default; when enabled, NebulaKit stores tool inputs and displayed results, up to 100 entries. Webhook URLs and webhook activity are never saved to history. You can turn history off and delete entries from your account page.</p>
    <h3>Support notifications</h3><p>When the website is opened, NebulaKit sends a site-visit notice with the time to its configured Discord support channel. The server uses visitor addresses in memory to limit notices to one per minute; the address and browser details are not included in the Discord notification. When you create a help ticket, its category, subject, ticket ID, and message are also sent to that channel.</p>
    <h3>Help tickets</h3><p>Ticket access codes act like passwords. Anyone with a code can read and reply to its ticket. Keep the private link and code confidential.</p>
    <h3>Availability</h3><p>NebulaKit is provided as-is. We do not guarantee uninterrupted operation or the accuracy of third-party data. We may remove or restrict features to protect the service.</p>
    <p class="note">This page is a plain-language service notice, not legal advice. Review it for your jurisdiction before publishing.</p></article>`;
}
function openAdmin(message=""){
  $(".shell").classList.remove("home");history.replaceState(null,"","#admin");
  $("#stage").innerHTML=siteHeading("Support admin","Private support inbox.")+
    `<section class="panel site-panel"><form id="admin-login" class="form"><label>Admin password<input name="password" type="password" autocomplete="current-password" required></label><button>Sign in</button></form><p id="admin-status" role="status" class="note">${esc(message)}</p><div id="admin-activity"></div><div id="admin-inbox"></div></section>`;
  $("#admin-login").onsubmit=async event=>{
    event.preventDefault();const button=event.currentTarget.querySelector("button");button.disabled=true;
    try{await siteApi("/api/admin/login",jsonOptions(Object.fromEntries(new FormData(event.currentTarget))));await renderAdminInbox()}
    catch(error){$("#admin-status").textContent=error.message}
    finally{button.disabled=false}
  };
  renderAdminInbox();
}
function activityChart(rows){
  if(!Array.isArray(rows)||rows.length!==30)throw new Error("The activity report returned an invalid date range.");
  const values=rows.map(row=>{
    const value=Number(row.active_users);
    if(!Number.isInteger(value)||value<0||typeof row.date!=="string")throw new Error("The activity report contains invalid data.");
    return value;
  });
  const width=760,height=280,left=58,right=18,top=22,bottom=50;
  const plotWidth=width-left-right,plotHeight=height-top-bottom;
  const max=Math.max(1,Math.ceil(Math.max(...values)/4)*4);
  const points=rows.map((row,index)=>({
    x:left+plotWidth*index/(rows.length-1),
    y:top+plotHeight*(1-values[index]/max),
    value:values[index],
    date:row.date
  }));
  const grid=Array.from({length:5},(_,index)=>{
    const value=max*(4-index)/4,y=top+plotHeight*index/4;
    return `<line class="activity-gridline" x1="${left}" y1="${y}" x2="${width-right}" y2="${y}"></line><text class="activity-axis-label" x="${left-10}" y="${y+4}" text-anchor="end">${value}</text>`;
  }).join("");
  const ticks=points.filter((_,index)=>index===0||index%7===0||index===points.length-1)
    .map(point=>`<text class="activity-axis-label" x="${point.x}" y="${height-16}" text-anchor="middle">${esc(point.date.slice(5))}</text>`).join("");
  const line=points.map(point=>`${point.x},${point.y}`).join(" ");
  const dots=points.map(point=>`<circle class="activity-point" cx="${point.x}" cy="${point.y}" r="3"><title>${esc(point.date)}: ${point.value} active account${point.value===1?"":"s"}</title></circle>`).join("");
  return `<section class="activity-section"><div class="activity-heading"><div><h3 class="ch">Daily active accounts</h3><p class="note">Unique signed-in accounts per day · last 30 days</p></div><span class="activity-total">${Math.max(...values)}<small>peak per day</small></span></div><div class="activity-plot"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Daily active signed-in accounts over the last 30 days. Vertical axis: active accounts. Horizontal axis: date in UTC.">${grid}<text class="activity-y-title" transform="translate(16 ${top+plotHeight/2}) rotate(-90)" text-anchor="middle">Active accounts</text><polyline class="activity-line" points="${line}"></polyline>${dots}${ticks}</svg></div><p class="note activity-caption">Activity counts an account once per UTC day when it checks its sign-in status. No tool inputs or results are included. Dates are UTC.</p></section>`;
}
function ticketCategoryChart(rows){
  if(!Array.isArray(rows)||rows.length!==4)throw new Error("The category report returned invalid data.");
  const max=Math.max(1,...rows.map(row=>{
    const count=Number(row.ticket_count);
    if(!Number.isInteger(count)||count<0||typeof row.category!=="string")throw new Error("The category report contains invalid data.");
    return count;
  }));
  const width=760,left=154,right=42,rowHeight=42,top=18,bottom=42;
  const height=top+bottom+rows.length*rowHeight;
  const plotWidth=width-left-right;
  const bars=rows.map((row,index)=>{
    const y=top+index*rowHeight+5;
    const barWidth=plotWidth*Number(row.ticket_count)/max;
    return `<text class="activity-axis-label" x="${left-12}" y="${y+17}" text-anchor="end">${esc(row.category)}</text><rect class="category-bar" x="${left}" y="${y}" width="${barWidth}" height="22" rx="6"><title>${esc(row.category)}: ${row.ticket_count} tickets</title></rect><text class="activity-axis-label" x="${left+barWidth+8}" y="${y+16}">${row.ticket_count}</text>`;
  }).join("");
  const ticks=Array.from({length:5},(_,index)=>{
    const value=Math.ceil(max*index/4),x=left+plotWidth*index/4;
    return `<line class="activity-gridline" x1="${x}" y1="${top}" x2="${x}" y2="${height-bottom}"></line><text class="activity-axis-label" x="${x}" y="${height-12}" text-anchor="middle">${value}</text>`;
  }).join("");
  return `<section class="activity-section"><div class="activity-heading"><div><h3 class="ch">Tickets by category</h3><p class="note">All support tickets · grouped by category</p></div></div><div class="activity-plot"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Support ticket counts by category. Horizontal axis: number of tickets. Vertical axis: ticket category.">${ticks}${bars}</svg></div><p class="note activity-caption">Source: NebulaKit support tickets · all recorded tickets.</p></section>`;
}
async function renderAdminInbox(){
  const inbox=$("#admin-inbox"),status=$("#admin-status");
  try{
    const [tickets,activity,categories]=await Promise.all([
      siteApi("/api/admin/tickets"),
      siteApi("/api/admin/activity"),
      siteApi("/api/admin/ticket-categories")
    ]);
    $("#admin-login").hidden=true;
    status.innerHTML=`${tickets.length} recent support ticket${tickets.length===1?"":"s"}. <button type="button" class="mini" id="admin-signout">Sign out</button>`;
    $("#admin-activity").innerHTML=activityChart(activity)+ticketCategoryChart(categories);
    inbox.innerHTML=tickets.length?tickets.map(ticket=>`<article class="admin-ticket" data-admin-ticket="${esc(ticket.id)}"><div class="admin-ticket-head"><h3>${esc(ticket.subject)}</h3><time>${esc(fmtT(ticket.created_at))}</time></div><div class="admin-ticket-controls"><label>Category<select data-ticket-category="${esc(ticket.id)}">${["Bug","Account","Feature request","Other"].map(category=>`<option${category===ticket.category?" selected":""}>${esc(category)}</option>`).join("")}</select></label><span class="ticket-status">${esc(ticket.status)}</span><button type="button" class="mini ticket-toggle" data-ticket-status="${esc(ticket.id)}" data-next-status="${ticket.status==="open"?"closed":"open"}">${ticket.status==="open"?"Close ticket":"Reopen ticket"}</button></div><div class="ticket-messages">${ticket.messages.map(m=>`<article class="ticket-message ${m.sender==="admin"?"staff":""}"><div><b>${m.sender==="admin"?"NebulaKit support":"Visitor"}</b><time>${esc(fmtT(m.created_at))}</time></div><p>${esc(m.body)}</p></article>`).join("")}</div>${ticket.status==="open"?`<form class="admin-reply form" data-ticket="${esc(ticket.id)}"><label>Reply<textarea name="message" rows="3" maxlength="10000" required></textarea></label><button>Send reply</button></form>`:'<p class="note">This ticket is closed. Reopen it to send a reply.</p>'}</article>`).join(""):'<p class="note">No help tickets yet.</p>';
    $("#admin-signout").onclick=async()=>{
      try{await siteApi("/api/auth/logout",jsonOptions({}));openAdmin("You have been signed out.")}
      catch(error){status.textContent=error.message}
    };
    inbox.querySelectorAll(".admin-reply").forEach(form=>form.onsubmit=async event=>{
      event.preventDefault();const button=form.querySelector("button");button.disabled=true;
      try{await siteApi(`/api/admin/tickets/${form.dataset.ticket}/messages`,jsonOptions({message:new FormData(form).get("message")}));await renderAdminInbox()}
      catch(error){status.textContent=error.message}
      finally{button.disabled=false}
    });
    inbox.querySelectorAll("[data-ticket-category]").forEach(select=>select.onchange=async()=>{
      select.disabled=true;
      try{await siteApi(`/api/admin/tickets/${select.dataset.ticketCategory}/category`,jsonOptions({category:select.value}));await renderAdminInbox()}
      catch(error){status.textContent=error.message;select.disabled=false}
    });
    inbox.querySelectorAll("[data-ticket-status]").forEach(button=>button.onclick=async()=>{
      button.disabled=true;
      try{await siteApi(`/api/admin/tickets/${button.dataset.ticketStatus}/status`,jsonOptions({status:button.dataset.nextStatus}));await renderAdminInbox()}
      catch(error){status.textContent=error.message;button.disabled=false}
    });
  }catch(error){status.textContent=error.message}
}
async function refreshAccount(){
  try{
    const r=await fetch(`${API_BASE}/api/auth/me`,{credentials:"include"});
    if(!r.ok)throw new Error("Account status could not be loaded.");
    accountState=await r.json();
    if(location.hash==="#account")openAccount();
    else if(location.hash==="#home"||location.hash==="")openHome();
  }catch(e){
    console.error("Could not load account status:",e);
    accountState={signed_in:false};
  }
}
document.addEventListener("click",async e=>{
  const b=e.target.closest("[data-copy]");if(!b)return;
  const old=b.textContent;
  try{await navigator.clipboard.writeText(b.dataset.copy);b.textContent="Copied"}catch{b.textContent="Couldn't copy"}
  setTimeout(()=>b.textContent=old,1500);
});
document.addEventListener("keydown",e=>{
  if(e.key==="/"&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){const q=$("#q");if(q){e.preventDefault();q.focus()}}
});
function routeHash(){
  const raw=location.hash.slice(1);
  if(raw.startsWith("oauth-error=")){
    const message=new URLSearchParams(raw).get("oauth-error");
    return openAccount(message||"Discord sign-in did not finish. Please try again.");
  }
  if(raw.startsWith("ticket=")){
    const query=new URLSearchParams(raw),id=query.get("ticket"),key=query.get("key");
    if(id&&key){try{sessionStorage.setItem("monde-ticket-key:"+id,key)}catch{};history.replaceState(null,"","#ticket/"+encodeURIComponent(id));return openTicket(id)}
    if(id)return openTicket(id);
  }
  open(raw);
}
window.onhashchange=routeHash;
routeHash();
refreshAccount();
