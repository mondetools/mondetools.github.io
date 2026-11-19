// Users tools

async function profile(v){
  const id=needId(v.id,"user ID");
  const g=String(v.gid||"").trim();
  if(g)needId(g,"server ID");
  const u=await api("/api/user/"+encodeURIComponent(id)+(g?"?guild="+encodeURIComponent(g):""));
  const glow=u.accent||"#5865f2";
  document.documentElement.style.setProperty("--glow",glow);
  const bg=u.banner?`background-image:url('${esc(u.banner)}')`:`background:${esc(glow)}`;
  const s=u.server;
  const panels=[panel("Account",dl([
    ["User ID",esc(u.id)],["Created",fmt(u.created)],["Account age",ago(u.created)],["Type",u.bot?"Bot":"User"],
    ["Clan tag",u.clan?esc(u.clan):null],
    ["Avatar",link(u.avatar.replace("size=256","size=1024"),"Open full size")],
    ["Banner",u.banner?link(u.banner.replace("size=600","size=1024"),"Open full size"):null]]))];
  if(s&&s.error)panels.push(panel("Server",`<p class="note">${esc(s.error)}</p>`));
  else if(s)panels.push(panel("Server",dl([["Nickname",esc(s.nick||"None")],["Joined",s.joined?fmt(s.joined):"Unknown"]])+
    (s.roles.length?`<div class="chips">${s.roles.map(r=>`<span class="chip"><span class="dot" style="${r.color?"background:"+esc(r.color):""}"></span>${esc(r.name)}</span>`).join("")}</div>`:'<p class="note">No roles in that server.</p>')));
  return view({bg,img:u.avatar,name:u.displayName,sub:"@"+esc(u.username)+(u.clan?` <span class="chip">${esc(u.clan)}</span>`:""),
    chips:chips([...(u.bot?["Bot"]:[]),...u.badges]),id:u.id,panels});
}
function userLink(v){
  const id=needId(v.id,"user ID"),url=`https://discord.com/users/${id}`,mention=`<@${id}>`;
  return panel("User reference",dl([
    ["User ID",`<code>${id}</code>`],
    ["Profile",link(url,"Open Discord profile")],
    ["Mention format",`<code>${mention}</code>`]
  ])+`<div class="chips"><button type="button" class="mini" data-copy="${esc(url)}">Copy profile link</button><button type="button" class="mini" data-copy="${esc(mention)}">Copy mention</button></div><p class="note">Generated locally. A mention only notifies anyone if you choose to post it in a Discord message.</p>`);
}
function userMentions(v){
  const entries=v.ids.trim().split(/[\s,;]+/).filter(Boolean);
  if(!entries.length)throw new Error("Enter at least one user ID.");
  if(entries.some(id=>!/^\d{15,22}$/.test(id)))throw new Error("Each entry must be a 15–22 digit user ID.");
  const ids=[...new Set(entries)];
  if(ids.length>50)throw new Error("Enter no more than 50 unique user IDs.");
  const mentions=ids.map(id=>`<@${id}>`).join("\n");
  const rows=ids.map(id=>`<tr><td><code>${id}</code></td><td><code>${esc(`<@${id}>`)}</code></td><td>${link(`https://discord.com/users/${id}`,"Open profile")}</td></tr>`).join("");
  return `<section class="panel solo"><h2>${ids.length} user reference${ids.length===1?"":"s"}</h2><p class="note">Duplicate IDs removed. Nothing was looked up or sent.</p><div class="scroll"><table><thead><tr><th>User ID</th><th>Mention format</th><th>Profile</th></tr></thead><tbody>${rows}</tbody></table></div><p><button type="button" class="mini" data-copy="${esc(mentions)}">Copy mentions</button></p></section>`;
}
function bulk(v){
  const ids=[...new Set(v.ids.match(/\d{15,22}/g)||[])].slice(0,200);
  if(!ids.length)throw new Error("No IDs found. Paste IDs separated by spaces, commas or new lines.");
  const rows=ids.map(id=>({id,ms:snowMs(id)})).sort((a,b)=>a.ms-b.ms);
  const csv="id,created_utc\n"+rows.map(r=>r.id+","+new Date(r.ms).toISOString()).join("\n");
  return `<section class="panel solo"><h2>${rows.length} ID${rows.length>1?"s":""}, oldest first</h2><div class="scroll"><table>
    <tr><th>ID</th><th>Created</th><th>Age</th></tr>${rows.map(r=>`<tr><td>${r.id}</td><td>${fmt(r.ms)}</td><td>${ago(r.ms)}</td></tr>`).join("")}</table></div>
    <p><button type="button" class="mini" data-copy="${esc(csv)}">Copy as CSV</button></p></section>`;
}
const FL={1:"Discord Staff",2:"Partner",4:"HypeSquad Events",8:"Bug Hunter",64:"HypeSquad Bravery",128:"HypeSquad Brilliance",256:"HypeSquad Balance",512:"Early Supporter",1024:"Team user",16384:"Bug Hunter Gold",65536:"Verified Bot",131072:"Verified Bot Developer",262144:"Certified Moderator",524288:"Bot using HTTP interactions",4194304:"Active Developer"};
function badges(v){
  if(!/^\d{1,12}$/.test(v.n.trim()))throw new Error("Enter the flags number, digits only.");
  const n=BigInt(v.n.trim()),on=Object.entries(FL).filter(([k])=>n&BigInt(k)).map(e=>e[1]);
  return panel("Badges",on.length?chips(on):'<p class="note">No known badges for that number.</p>');
}
async function bulkusers(v){
  const ids=[...new Set(v.ids.match(/\d{15,22}/g)||[])].slice(0,40);
  if(!ids.length)throw new Error("No IDs found. Paste IDs separated by spaces, commas or new lines.");
  const rows=[];
  for(const id of ids){
    try{
      const u=await api("/api/user/"+id);
      rows.push(`<tr><td><img class="mav" src="${esc(u.avatar)}" alt="">${esc(u.displayName)}</td><td>@${esc(u.username)}</td><td>${id}</td><td>${fmt(u.created)}</td><td>${u.bot?"Bot":"User"}</td></tr>`);
    }catch(x){rows.push(`<tr><td colspan="2">${esc(x.message)}</td><td>${id}</td><td colspan="2"></td></tr>`)}
    await new Promise(r=>setTimeout(r,300));
  }
  return `<section class="panel solo"><h2>${ids.length} ID${ids.length>1?"s":""}</h2><div class="scroll"><table>
    <tr><th>Name</th><th>Username</th><th>ID</th><th>Created</th><th>Type</th></tr>${rows.join("")}</table></div></section>`;
}
