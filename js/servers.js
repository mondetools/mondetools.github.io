// Servers tools

const VERIFY=["None","Low","Medium","High","Highest"];
async function invite(v){return inviteView(await api("/api/invite/"+encodeURIComponent(v.code.trim())))}
async function vanity(v){
  const code=v.name.trim().replace(/^.*discord\.gg\//i,"").replace(/^\/+|\/+$/g,"");
  if(!/^[\w-]{2,32}$/.test(code))throw new Error("Enter a vanity name like cats, or a link like discord.gg/cats.");
  let d;
  try{d=await api("/api/invite/"+encodeURIComponent(code))}
  catch(x){
    if(/not found/i.test(x.message))return panel("discord.gg/"+esc(code),'<p class="note">No server is using this link right now. It could be free to claim, expired, or reserved by Discord.</p>');
    throw x;
  }
  const mine=(d.server.vanity||"").toLowerCase()===code.toLowerCase();
  return inviteView(d,panel("discord.gg/"+esc(code),`<p class="note">${mine?"This is the server's official vanity link.":"This code works, but it's a regular invite rather than the server's vanity link."}</p>`));
}
function inviteView(d,extra){
  const s=d.server,panels=[
    panel("Server",dl([["Server ID",esc(s.id||"Unknown")],["Created",s.created?fmt(s.created):null],["Verification",s.verification!=null?VERIFY[s.verification]||null:null],
      ["Vanity URL",s.vanity?"discord.gg/"+esc(s.vanity):null],["Boosts",s.boosts],["Icon",s.icon?link(s.icon.replace("size=256","size=1024"),"Open full size"):null]])),
    panel("Invite",dl([["Members",d.members?.toLocaleString()],["Online",d.online?.toLocaleString()],
      ["Channel",d.channel?"#"+esc(d.channel.name)+(d.channel.kind?" ("+d.channel.kind+")":""):null],["Expires",d.expires?fmtT(d.expires):"Never"]]))];
  if(extra)panels.unshift(extra);
  if(d.inviter)panels.push(panel("Invited by",dl([["Name",esc(d.inviter.displayName)],["Username","@"+esc(d.inviter.username)],["User ID",esc(d.inviter.id)]])));
  return view({bg:s.banner?`background-image:url('${esc(s.banner)}')`:"",img:s.icon,sq:1,name:s.name||"Unknown server",sub:s.description?esc(s.description):"",
    chips:chips(s.features.slice(0,12).map(nice)),id:s.id,panels});
}
async function server(v){
  const id=needId(v.id,"server ID");
  const d=await api("/api/server/"+id),w=d.widget;
  const panels=[panel("Server",dl([["Server ID",esc(d.id)],["Created",fmt(d.created)],["Members",d.members?.toLocaleString()],["Online",(d.online??w?.online)?.toLocaleString()],
    ["Emojis",d.emojis],["Stickers",d.stickers]])),
    panel("Where this came from",dl([["Server preview",d.sources.preview?"Available (server is discoverable)":"Not available"],["Widget",d.sources.widget?"Available (turned on by the server)":"Not available"]]))];
  if(w){
    const mem=w.members?.length?`<h3 class="ch">Online members (${w.members.length})</h3><div class="scroll"><table><tr><th>Name</th><th>Status</th><th>Activity</th></tr>${w.members.map(m=>`<tr><td>${m.avatar?`<img class="mav" src="${esc(m.avatar)}" alt="">`:""}${esc(m.name||"")}</td><td>${esc(m.status||"")}</td><td>${esc(m.activity||"")}</td></tr>`).join("")}</table></div>`:"";
    panels.push(panel("Widget",dl([["Invite",w.invite?link(w.invite,esc(w.invite)):"None"]])+chips(w.channels.map(c=>"#"+c))+mem));
  }
  return view({bg:d.banner?`background-image:url('${esc(d.banner)}')`:"",img:d.icon,sq:1,name:d.name||"Unknown server",sub:d.description?esc(d.description):"",
    chips:chips((d.features||[]).slice(0,12).map(nice)),id:d.id,panels});
}
async function compare(v){
  const ids=v.ids.trim().split(/[\s,;]+/).filter(Boolean);
  if(ids.length<2||ids.length>4)throw new Error("Enter between 2 and 4 server IDs.");
  if(ids.some(id=>!/^\d{15,22}$/.test(id)))throw new Error("Each entry must be a 15–22 digit server ID.");
  if(new Set(ids).size!==ids.length)throw new Error("Remove duplicate server IDs before comparing.");

  const results=await Promise.all(ids.map(async id=>{
    try{return {id,data:await api("/api/server/"+id)}}
    catch(e){return {id,error:e.message}}
  }));
  const rows=results.map(({id,data,error})=>{
    if(error)return `<tr class="compare-unavailable-row"><td colspan="5"><div class="compare-unavailable"><code>${esc(id)}</code><span><b>Public details unavailable</b><small>${esc(error)}</small></span></div></td></tr>`;
    const features=data.features||[],shown=features.slice(0,3);
    const featureList=features.length
      ?`<div class="compare-features" title="${esc(features.map(nice).join(", "))}">${shown.map(f=>`<span class="compare-feature">${esc(nice(f))}</span>`).join("")}${features.length>shown.length?`<span class="compare-more">+${features.length-shown.length} more</span>`:""}</div>`
      :'<span class="compare-empty">No listed features</span>';
    return `<tr><td class="compare-server"><strong>${esc(data.name||"Unknown server")}</strong><code>${esc(id)}</code></td><td>${data.created?fmt(data.created):"—"}</td><td class="compare-number">${data.members==null?"—":data.members.toLocaleString()}</td><td class="compare-number">${data.online==null?"—":data.online.toLocaleString()}</td><td>${featureList}</td></tr>`;
  });
  const found=results.filter(r=>r.data).length,unavailable=ids.length-found;
  return `<section class="panel solo compare-panel"><div class="compare-heading"><div><span class="eyebrow">SIDE-BY-SIDE</span><h2>Server comparison</h2></div><span class="compare-count">${found} of ${ids.length} public</span></div><p class="note">Only public preview or enabled widget details are shown. No servers were joined.</p><div class="scroll compare-scroll"><table class="compare-table">
    <thead><tr><th scope="col">Server</th><th scope="col">Created</th><th scope="col">Members</th><th scope="col">Online</th><th scope="col">Public features</th></tr></thead><tbody>${rows.join("")}</tbody></table></div>${unavailable?`<p class="compare-footnote">${unavailable} server${unavailable===1?"":"s"} did not provide public preview or widget details.</p>`:""}</section>`;
}
async function clan(v){
  const id=needId(v.id,"user ID");
  const u=await api("/api/user/"+id);
  if(!u.clan||!u.clanGuildId)throw new Error(u.displayName+" isn't wearing a clan tag, or has it hidden.");
  let d=null;try{d=await api("/api/server/"+u.clanGuildId)}catch{}
  const panels=[panel("Clan tag",dl([["Tag",esc(u.clan)],["Worn by",esc(u.displayName)+" (@"+esc(u.username)+")"],["Server ID",esc(u.clanGuildId)],["Server created",fmt(snowMs(u.clanGuildId))]]))];
  if(d)panels.push(panel("Server",dl([["Members",d.members?.toLocaleString()],["Online",(d.online??d.widget?.online)?.toLocaleString()],["Invite",d.widget?.invite?link(d.widget.invite,esc(d.widget.invite)):null]])));
  else panels.push(panel("Server",'<p class="note">This server isn\'t public (not discoverable and no widget), so only its ID and creation date are available.</p>'));
  return view({img:d?.icon||u.clanBadge,sq:1,name:d?.name||"Server "+u.clanGuildId,sub:`<span class="chip">${esc(u.clan)}</span>`+(d?.description?" "+esc(d.description):""),
    chips:chips((d?.features||[]).slice(0,12).map(nice)),id:u.clanGuildId,panels});
}
