// Utilities tools

function snow(v){
  const tw=v.kind==="Twitter",s=String(v.id).trim();
  if(!(tw?/^\d{10,22}$/:/^\d{15,22}$/).test(s))throw new Error("That doesn't look like a valid ID.");
  const b=BigInt(s),ms=Number((b>>22n)+(tw?1288834974657n:EPOCH));
  return panel("Decoded",dl([["Created (UTC)",esc(new Date(ms).toUTCString())],["Created (your time)",fmtT(ms)],["Age",ago(ms)],["Unix time",ms+" ms"],
    [tw?"Datacenter ID":"Worker ID",Number((b>>17n)&31n)],[tw?"Worker ID":"Process ID",Number((b>>12n)&31n)],["Increment",Number(b&4095n)]]));
}
function messageLink(v){
  const raw=String(v.url).trim();
  let url;
  try{url=new URL(raw)}catch{throw new Error("Enter a valid Discord message link.")}
  if(!["discord.com","www.discord.com","discordapp.com","www.discordapp.com"].includes(url.hostname.toLowerCase())||url.protocol!=="https:")
    throw new Error("Use a message link from discord.com or discordapp.com.");
  const match=url.pathname.match(/^\/channels\/(@me|\d{15,22})\/(\d{15,22})\/(\d{15,22})\/?$/);
  if(!match)throw new Error("That link should have the format /channels/server/channel/message.");
  const [,guild,channel,message]=match,created=Number((BigInt(message)>>22n)+EPOCH);
  const rows=[
    ...(guild==="@me"?[]:[["Server ID",`<code>${guild}</code>`]]),
    ["Channel ID",`<code>${channel}</code>`],
    ["Message ID",`<code>${message}</code>`],
    ["Created",fmtT(created)],
    ["Open message",link(url.href,"Open in Discord")]
  ];
  return `<section class="panel solo"><h2>Message link details</h2>${dl(rows)}<p><button type="button" class="mini" data-copy="${esc([guild,channel,message].filter(x=>x!=="@me").join("\n"))}">Copy IDs</button></p></section>`;
}
const MAX_SNOWFLAKE=(1n<<64n)-1n;
function snowflakeMs(id){
  const value=BigInt(id);
  if(value>MAX_SNOWFLAKE)throw new Error("IDs must fit Discord's 64-bit snowflake format.");
  return Number((value>>22n)+EPOCH);
}
function snowTimeline(v){
  const ids=String(v.ids||"").trim().split(/[\s,;]+/).filter(Boolean);
  if(ids.length<2||ids.length>100)throw new Error("Enter between 2 and 100 Discord IDs.");
  if(ids.some(id=>!/^\d{15,20}$/.test(id)))throw new Error("Each entry must be a 15–20 digit Discord ID.");
  if(new Set(ids).size!==ids.length)throw new Error("Remove duplicate IDs before building the timeline.");
  const events=ids.map(id=>({id,ms:snowflakeMs(id)})).sort((a,b)=>a.ms-b.ms);
  const rows=events.map((event,index)=>{
    const gap=index?Math.round((event.ms-events[index-1].ms)/1000):null;
    return `<tr><td>${index+1}</td><td><code>${event.id}</code></td><td>${esc(new Date(event.ms).toISOString())}</td><td>${gap===null?"—":gap.toLocaleString()+" s"}</td></tr>`;
  });
  const csv="id,created_utc\n"+events.map(event=>`${event.id},${new Date(event.ms).toISOString()}`).join("\n");
  const span=Math.round((events[events.length-1].ms-events[0].ms)/1000);
  return `<section class="panel solo"><h2>Discord ID creation timeline</h2><p class="note">${events.length} unique IDs · earliest to latest · total span ${span.toLocaleString()} seconds. Timestamps are decoded locally; IDs are not looked up.</p><div class="scroll"><table><thead><tr><th>Order</th><th>ID</th><th>Created (UTC)</th><th>Gap from previous</th></tr></thead><tbody>${rows.join("")}</tbody></table></div><p><button type="button" class="mini" data-copy="${esc(csv)}">Copy timeline as CSV</button></p></section>`;
}
function accountCohort(v){
  const ids=String(v.ids||"").trim().split(/[\s,;]+/).filter(Boolean);
  if(!ids.length||ids.length>200)throw new Error("Enter between 1 and 200 Discord user IDs.");
  if(ids.some(id=>!/^\d{15,20}$/.test(id)))throw new Error("Each entry must be a 15–20 digit Discord user ID.");
  const unique=[...new Set(ids)];
  const byHour=v.granularity==="Hour (UTC)";
  const groups=new Map();
  for(const id of unique){
    const ms=snowflakeMs(id),date=new Date(ms);
    date.setUTCMinutes(0,0,0);
    const key=byHour?date.toISOString().slice(0,13)+":00Z":date.toISOString().slice(0,10);
    groups.set(key,(groups.get(key)||0)+1);
  }
  const sorted=[...groups].sort(([a],[b])=>a.localeCompare(b));
  const max=Math.max(...sorted.map(([,count])=>count));
  const rows=sorted.map(([bucket,count])=>`<tr><td>${esc(bucket)}</td><td>${count}</td><td>${(count/unique.length*100).toFixed(1)}%</td><td><progress max="${max}" value="${count}">${count}</progress></td></tr>`);
  const csv="created_"+(byHour?"hour":"day")+"_utc,count\n"+sorted.map(([bucket,count])=>`${bucket},${count}`).join("\n");
  return `<section class="panel solo"><h2>User ID creation cohorts</h2><p class="note">${unique.length} unique IDs grouped by ${byHour?"UTC hour":"UTC day"}.${unique.length<ids.length?` Removed ${ids.length-unique.length} duplicate ID${ids.length-unique.length===1?"":"s"}.`:""} This analyzes ID timestamps locally and does not resolve user profiles.</p><div class="scroll"><table><thead><tr><th>Creation bucket (UTC)</th><th>Accounts</th><th>Share</th><th>Distribution</th></tr></thead><tbody>${rows.join("")}</tbody></table></div><p><button type="button" class="mini" data-copy="${esc(csv)}">Copy cohort summary</button></p></section>`;
}
function assetLink(v){
  const id=needId(v.id,"user or server ID"),hash=String(v.hash).trim();
  if(!/^(?:a_)?[a-f0-9]{16,128}$/i.test(hash))throw new Error("Enter a valid Discord asset hash.");
  const routes={"User avatar":`avatars/${id}`,"Server icon":`icons/${id}`,"Server banner":`banners/${id}`};
  const route=routes[v.type];
  if(!route)throw new Error("Choose a supported Discord asset type.");
  if(!["webp","png","jpg","gif"].includes(v.format))throw new Error("Choose a supported image format.");
  if(!["128","256","512","1024","2048"].includes(v.size))throw new Error("Choose an image size from the list.");
  const url=`https://cdn.discordapp.com/${route}/${hash}.${v.format}?size=${v.size}`;
  return panel("Discord CDN asset",dl([
    ["Type",esc(v.type)],["Asset hash",`<code>${esc(hash)}</code>`],
    ["Image URL",link(url,esc(url))]
  ])+`<p><button type="button" class="mini" data-copy="${esc(url)}">Copy image URL</button></p><p class="note">Built locally from the asset hash. Discord does not verify that this asset exists.</p>`);
}
function inviteCode(raw){
  raw=String(raw).trim();
  if(/^[A-Za-z0-9_-]{2,32}$/.test(raw))return raw;
  let url;
  try{url=new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)?raw:"https://"+raw)}
  catch{throw new Error("Enter invite codes or links from Discord.")}
  const hosts=["discord.gg","www.discord.gg","discord.com","www.discord.com","discordapp.com","www.discordapp.com"];
  if(url.protocol!=="https:"||url.username||url.password||url.port||!hosts.includes(url.hostname.toLowerCase()))
    throw new Error("Use a secure invite link from discord.gg or discord.com.");
  const match=url.pathname.match(/^\/(?:invite\/)?([A-Za-z0-9_-]{2,32})\/?$/);
  if(!match)throw new Error("An invite link does not contain a valid code.");
  return match[1];
}
async function inviteBatch(v){
  const entries=String(v.codes||"").trim().split(/[\s,;]+/).filter(Boolean);
  if(!entries.length||entries.length>5)throw new Error("Enter between 1 and 5 invite codes or links.");
  const codes=[...new Set(entries.map(inviteCode))];
  if(codes.length>5)throw new Error("Inspect no more than 5 unique invites at a time.");
  const results=[];
  for(const [index,code] of codes.entries()){
    if(index)await new Promise(resolve=>setTimeout(resolve,500));
    try{results.push({code,data:await api("/api/invite/"+encodeURIComponent(code))})}
    catch(error){results.push({code,error:error.message})}
  }
  const rows=results.map(({code,data,error})=>{
    if(error)return `<tr><td><code>${esc(code)}</code></td><td colspan="5">${esc(error)}</td></tr>`;
    const server=data.server||{};
    const inviter=data.inviter?`${esc(data.inviter.displayName||data.inviter.username)} (@${esc(data.inviter.username||"unknown")})`:"—";
    return `<tr><td><code>${esc(code)}</code></td><td>${esc(server.name||"Unknown server")}<br><code>${esc(server.id||"")}</code></td><td>${server.created?fmt(server.created):"—"}</td><td>${Number.isFinite(data.members)?data.members.toLocaleString():"—"}</td><td>${data.expires?esc(fmtT(data.expires)):"Never"}</td><td>${inviter}</td></tr>`;
  });
  return `<section class="panel solo"><h2>Public invite inspection</h2><p class="note">Checked ${codes.length} user-supplied invite${codes.length===1?"":"s"} using public preview data. No servers were joined.</p><div class="scroll"><table><thead><tr><th>Code</th><th>Server</th><th>Created</th><th>Members</th><th>Invite expires</th><th>Inviter</th></tr></thead><tbody>${rows.join("")}</tbody></table></div></section>`;
}
function messageTimeline(v){
  const raw=String(v.links||"").trim().split(/\s+/).filter(Boolean);
  if(raw.length<2||raw.length>50)throw new Error("Enter between 2 and 50 Discord message links.");
  const hosts=["discord.com","www.discord.com","discordapp.com","www.discordapp.com"];
  const links=raw.map(value=>{
    let url;
    try{url=new URL(value)}catch{throw new Error("Each entry must be a valid Discord message link.")}
    if(url.protocol!=="https:"||url.username||url.password||url.port||!hosts.includes(url.hostname.toLowerCase()))
      throw new Error("Use secure message links from discord.com or discordapp.com.");
    const match=url.pathname.match(/^\/channels\/(@me|\d{15,20})\/(\d{15,20})\/(\d{15,20})\/?$/);
    if(!match)throw new Error("Each link must use the Discord /channels/server/channel/message format.");
    const [,guild,channel,message]=match;
    return {url,guild,channel,message,ms:snowflakeMs(message)};
  }).sort((a,b)=>a.ms-b.ms);
  const unique=new Set(links.map(item=>item.message));
  if(unique.size!==links.length)throw new Error("Remove duplicate message links before analyzing the timeline.");
  const rows=links.map((item,index)=>{
    const gap=index?Math.round((item.ms-links[index-1].ms)/1000):null;
    return `<tr><td>${index+1}</td><td>${esc(item.guild)}</td><td><code>${esc(item.channel)}</code></td><td>${esc(new Date(item.ms).toISOString())}</td><td>${gap===null?"—":gap.toLocaleString()+" s"}</td><td>${link(item.url.href,"Open message")}</td></tr>`;
  });
  return `<section class="panel solo"><h2>Message chronology</h2><p class="note">${links.length} links sorted by message ID timestamp. Links are parsed locally; message contents are not fetched.</p><div class="scroll"><table><thead><tr><th>Order</th><th>Server</th><th>Channel</th><th>Created (UTC)</th><th>Gap from previous</th><th>Link</th></tr></thead><tbody>${rows.join("")}</tbody></table></div></section>`;
}
function oauth(v){
  const id=String(v.id).trim(),scopes=[...new Set(String(v.scopes).trim().split(/\s+/).filter(Boolean))],permissions=String(v.permissions).trim();
  if(!/^\d{15,22}$/.test(id))throw new Error("Enter a valid 15–22 digit application ID.");
  const allowed=new Set(["bot","applications.commands","identify","email","guilds","connections"]);
  const invalid=scopes.filter(scope=>!allowed.has(scope));
  if(invalid.length)throw new Error("Unsupported scope: "+invalid.join(", ")+".");
  if(!scopes.length)throw new Error("Add at least one OAuth2 scope.");
  if(permissions&&!/^\d{1,20}$/.test(permissions))throw new Error("Permissions must be a numeric bitfield.");
  if(permissions&&!scopes.includes("bot"))throw new Error("Add the bot scope to include bot permissions.");
  const params=new URLSearchParams({client_id:id,scope:scopes.join(" ")});
  if(permissions)params.set("permissions",permissions);
  const invite=`https://discord.com/oauth2/authorize?${params}`;
  return `<section class="panel solo"><h2>Bot invite link</h2><p class="note">Review the scopes and permissions in Discord before authorizing.</p><pre>${esc(invite)}</pre><p>${link(invite,"Review invite in Discord")}</p><button type="button" class="mini" data-copy="${esc(invite)}">Copy invite URL</button></section>`;
}
function extract(v){
  if(v.text.length>100000)throw new Error("Keep the pasted text under 100 KB.");
  const text=v.text;
  const groups=[
    ["User mentions",[...text.matchAll(/<@!?(\d{15,22})>/g)].map(m=>m[1])],
    ["Role mentions",[...text.matchAll(/<@&(\d{15,22})>/g)].map(m=>m[1])],
    ["Channel mentions",[...text.matchAll(/<#(\d{15,22})>/g)].map(m=>m[1])],
    ["Invite codes",[...text.matchAll(/\b(?:https?:\/\/)?(?:www\.)?(?:discord\.gg|discord(?:app)?\.com\/invite)\/([A-Za-z0-9-]{2,32})\b/gi)].map(m=>m[1])]
  ].map(([label,values])=>[label,[...new Set(values)]]);
  const identified=new Set(groups.slice(0,3).flatMap(([,values])=>values));
  const otherIds=[...new Set([...text.matchAll(/\b\d{15,22}\b/g)].map(m=>m[0]).filter(id=>!identified.has(id)))];
  if(otherIds.length)groups.push(["Other numeric IDs",otherIds]);
  const found=groups.filter(([,values])=>values.length);
  if(!found.length)return panel("No references found",'<p class="note">No Discord mentions, invite links or ID-like numbers were found. Pasted text stays in this browser.</p>');
  const rows=found.flatMap(([label,values])=>values.map(value=>`<tr><td>${esc(label)}</td><td><code>${esc(value)}</code></td></tr>`));
  const copied=found.flatMap(([label,values])=>values.map(value=>`${label}: ${value}`)).join("\n");
  return `<section class="panel solo"><h2>${rows.length} reference${rows.length===1?"":"s"} found</h2><p class="note">Extracted locally in your browser. Invite codes are not opened or validated.</p><div class="scroll"><table>
    <tr><th>Type</th><th>Value</th></tr>${rows.join("")}</table></div><p><button type="button" class="mini" data-copy="${esc(copied)}">Copy references</button></p></section>`;
}
function rel(ms){
  const d=(ms-Date.now())/1000,a=Math.abs(d),r=new Intl.RelativeTimeFormat(undefined,{numeric:"auto"});
  for(const[u,n]of[["year",31536000],["month",2592000],["day",86400],["hour",3600],["minute",60]])if(a>=n)return r.format(Math.round(d/n),u);
  return r.format(Math.round(d),"second");
}
const ZONES=[["UTC","UTC"],["New York","America/New_York"],["Chicago","America/Chicago"],["Los Angeles","America/Los_Angeles"],["São Paulo","America/Sao_Paulo"],["London","Europe/London"],["Paris","Europe/Paris"],["Moscow","Europe/Moscow"],["Dubai","Asia/Dubai"],["Mumbai","Asia/Kolkata"],["Singapore","Asia/Singapore"],["Tokyo","Asia/Tokyo"],["Sydney","Australia/Sydney"]];
function time(v){
  let ms;
  if(v.unix&&v.unix.trim()){const n=Number(v.unix.trim());if(!Number.isFinite(n))throw new Error("That Unix timestamp isn't a number.");ms=n<1e11?n*1000:n}
  else ms=new Date(v.dt).getTime();
  if(isNaN(ms))throw new Error("Pick a date and time, or enter a Unix timestamp.");
  const s=Math.floor(ms/1000),st={t:{timeStyle:"short"},T:{timeStyle:"medium"},d:{dateStyle:"short"},D:{dateStyle:"long"},f:{dateStyle:"long",timeStyle:"short"},F:{dateStyle:"full",timeStyle:"short"}};
  const rows=Object.entries(st).map(([k,o])=>[k,new Date(ms).toLocaleString(undefined,o)]).concat([["R",rel(ms)]]);
  return `<section class="panel solo"><h2>Discord timestamps</h2><div class="scroll"><table>${rows.map(([k,p])=>{const c=`<t:${s}:${k}>`;
    return `<tr><td><code>${esc(c)}</code></td><td>${esc(p)}</td><td><button type="button" class="mini" data-copy="${esc(c)}">Copy</button></td></tr>`}).join("")}</table></div></section>
    <section class="panel solo"><h2>Time zones</h2><div class="scroll"><table><tr><td>Unix time</td><td>${s}</td></tr>${ZONES.map(([n,z])=>`<tr><td>${n}</td><td>${esc(new Date(ms).toLocaleString(undefined,{dateStyle:"medium",timeStyle:"short",timeZone:z}))}</td></tr>`).join("")}</table></div></section>`;
}
const P=[
  ["Create invite",0],["Kick members",1],["Ban members",2],["Administrator",3],
  ["Manage channels",4],["Manage server",5],["Add reactions",6],["View audit log",7],
  ["Priority speaker",8],["Stream video",9],["View channels",10],["Send messages",11],
  ["Send TTS messages",12],["Manage messages",13],["Embed links",14],["Attach files",15],
  ["Read message history",16],["Mention everyone",17],["Use external emoji",18],["View server insights",19],
  ["Connect to voice",20],["Speak",21],["Mute members",22],["Deafen members",23],
  ["Move members",24],["Use voice activity",25],["Change nickname",26],["Manage nicknames",27],
  ["Manage roles",28],["Manage webhooks",29],["Manage expressions",30],["Use app commands",31],
  ["Request to speak",32],["Manage events",33],["Manage threads",34],["Create public threads",35],
  ["Create private threads",36],["Use external stickers",37],["Send messages in threads",38],
  ["Use activities",39],["Moderate members",40],["View creator monetization analytics",41],
  ["Use soundboard",42],["Create server expressions",43],["Create events",44],
  ["Use external sounds",45],["Send voice messages",46],["Set voice channel status",48],
  ["Send polls",49],["Use external apps",50],["Pin messages",51],["Bypass slowmode",52]
];
function perms(v){
  if(!/^\d{1,20}$/.test(v.n.trim()))throw new Error("Enter the permissions number, digits only.");
  const b=BigInt(v.n.trim()),on=P.filter(([,bit])=>(b&(1n<<BigInt(bit)))!==0n).map(([name])=>name);
  return panel("Permissions",(on.includes("Administrator")?'<p class="note">Administrator grants every permission.</p>':"")+(on.length?chips(on):'<p class="note">No permissions set.</p>'));
}
function jsonFormat(v){
  const source=String(v.json||"");
  if(source.length>100000)throw new Error("Keep the JSON input under 100 KB.");
  let value;
  try{value=JSON.parse(source)}catch(error){throw new Error("Invalid JSON: "+error.message)}
  const output=JSON.stringify(value,null,v.mode==="Minified"?0:2);
  return `<section class="panel solo"><h2>Formatted JSON</h2><p class="note">Valid JSON, formatted locally in your browser.</p><pre>${esc(output)}</pre><button type="button" class="mini" data-copy="${esc(output)}">Copy JSON</button></section>`;
}

function inlineMarkdown(source){
  const code=[];
  let text=esc(source).replace(/`([^`\n]+)`/g,(_,value)=>{
    code.push(`<code>${value}</code>`);
    return `\u0000${code.length-1}\u0000`;
  });
  text=text.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>")
    .replace(/__(.+?)__/g,"<u>$1</u>")
    .replace(/~~(.+?)~~/g,"<s>$1</s>")
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g,"<em>$1</em>")
    .replace(/(?<!_)_([^_\n]+)_(?!_)/g,"<em>$1</em>");
  return text.replace(/\u0000(\d+)\u0000/g,(_,index)=>code[Number(index)]);
}

function markdownPreview(v){
  const source=String(v.text||"");
  if(source.length>30000)throw new Error("Keep the message under 30 KB.");
  const html=[],lines=source.split(/\r?\n/);
  let fenced=false,code=[];
  for(const line of lines){
    if(/^\s*```/.test(line)){
      if(fenced){html.push(`<pre><code>${esc(code.join("\n"))}</code></pre>`);code=[];fenced=false}
      else fenced=true;
      continue;
    }
    if(fenced){code.push(line);continue}
    if(!line.trim()){html.push('<div class="md-space"></div>');continue}
    const quote=line.match(/^>\s?(.*)$/);
    if(quote){html.push(`<blockquote>${inlineMarkdown(quote[1])}</blockquote>`);continue}
    const heading=line.match(/^(#{1,3})\s+(.+)$/);
    if(heading){const level=heading[1].length;html.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);continue}
    html.push(`<p>${inlineMarkdown(line)}</p>`);
  }
  if(fenced)html.push(`<pre><code>${esc(code.join("\n"))}</code></pre>`);
  return `<section class="panel solo"><h2>Discord message preview</h2><p class="note">Common formatting is rendered locally. If you enabled account history, its inputs and results can be saved there. Links stay as text and are not opened.</p><div class="markdown-preview">${html.join("")}</div></section>`;
}

function iocExtractor(v){
  const source=String(v.text||"");
  if(source.length>200000)throw new Error("Keep the pasted text under 200 KB.");
  const groups=new Map(),add=(kind,value)=>{
    const normalized=value.toLowerCase(),values=groups.get(kind)||new Map();
    if(!values.has(normalized))values.set(normalized,value);
    groups.set(kind,values);
  };
  for(const match of source.matchAll(/\bhttps?:\/\/[^\s<>"']+/gi)){
    const value=match[0].replace(/[),.!?;:]+$/g,"");
    if(value)add("URLs",value);
  }
  for(const match of source.matchAll(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,63}\b/gi))add("Email addresses",match[0]);
  for(const match of source.matchAll(/\b(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,63}\b/gi)){
    if(source[match.index-1]!=="@")add("Domains",match[0]);
  }
  for(const match of source.matchAll(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g)){
    const parts=match[0].split(".").map(Number);
    if(parts.every(part=>part>=0&&part<=255))add("IPv4 addresses",match[0]);
  }
  for(const match of source.matchAll(/\b(?:[a-f0-9]{32}|[a-f0-9]{40}|[a-f0-9]{64}|[a-f0-9]{128})\b/gi)){
    const lengths={32:"MD5",40:"SHA-1",64:"SHA-256",128:"SHA-512"};
    add(lengths[match[0].length]+" hashes",match[0]);
  }
  const found=[...groups].filter(([,values])=>values.size);
  if(!found.length)return panel("No indicators found",'<p class="note">No supported URLs, domains, email addresses, IPv4 addresses or common file hashes were found. The pasted text stayed in this browser.</p>');
  const count=found.reduce((total,[,values])=>total+values.size,0);
  const rows=found.flatMap(([kind,values])=>[...values.values()].map(value=>`<tr><td>${esc(kind)}</td><td><code>${esc(value)}</code></td></tr>`));
  const copied=found.flatMap(([kind,values])=>[...values.values()].map(value=>`${kind}: ${value}`)).join("\n");
  return `<section class="panel solo"><h2>${count} indicator${count===1?"":"s"} found</h2><p class="note">Extracted locally. This tool does not check whether indicators are live or malicious.</p><div class="scroll"><table><thead><tr><th>Type</th><th>Value</th></tr></thead><tbody>${rows.join("")}</tbody></table></div><p><button type="button" class="mini" data-copy="${esc(copied)}">Copy indicators</button></p></section>`;
}

function urlAnalyzer(v){
  let raw=String(v.url||"").trim();
  if(!raw||raw.length>4096)throw new Error("Enter a URL under 4 KB.");
  raw=raw.replace(/^hxxps:\/\//i,"https://").replace(/^hxxp:\/\//i,"http://").replace(/(?:\[\.\]|\(\.\)|\{\.\})/gi,".");
  if(!/^[a-z][a-z0-9+.-]*:\/\//i.test(raw))raw="https://"+raw;
  let url;
  try{url=new URL(raw)}catch{throw new Error("Enter a valid URL or domain name.")}
  if(!["http:","https:"].includes(url.protocol))throw new Error("Only HTTP and HTTPS URLs can be inspected.");
  const host=url.hostname,plainHost=host.replace(/^\[|\]$/g,""),labels=plainHost.split("."),flags=[];
  const ipv4=/^(?:\d{1,3}\.){3}\d{1,3}$/.test(plainHost)&&plainHost.split(".").every(part=>Number(part)<=255);
  const ipv6=host.startsWith("[")&&host.endsWith("]");
  if(url.username||url.password)flags.push("The URL includes user information before the hostname; verify which host the browser would reach.");
  if(host.toLowerCase().split(".").some(label=>label.startsWith("xn--")))flags.push("The hostname contains punycode. Check for lookalike characters.");
  if(ipv4||ipv6)flags.push("The host is an IP address rather than a domain name.");
  if(url.port&&!["80","443"].includes(url.port))flags.push("The URL uses a nonstandard port.");
  if(labels.length>=5)flags.push("The hostname has many subdomains; read it from right to left to identify the registered-looking suffix.");
  if(url.protocol==="http:")flags.push("The URL uses HTTP without transport encryption.");
  const redirectKeys=new Set(["redirect","redirect_uri","return","return_to","next","continue","dest","destination","target","url","u"]);
  const redirects=[...url.searchParams].filter(([key])=>redirectKeys.has(key.toLowerCase()));
  if(redirects.length)flags.push("The query contains a parameter commonly used to pass a redirect destination.");
  const flagHtml=flags.length?`<ul>${flags.map(flag=>`<li>${esc(flag)}</li>`).join("")}</ul>`:'<p class="note">No common structural warning signs were detected. That does not establish that the URL is safe.</p>';
  const query=[...url.searchParams].map(([key,value])=>`<tr><td><code>${esc(key)}</code></td><td><code>${esc(value||"(empty)")}</code></td></tr>`).join("");
  const redirectRows=redirects.map(([key,value])=>`<tr><td>${esc(key)}</td><td><code>${esc(value)}</code></td></tr>`).join("");
  const parts=[
    ["Protocol",url.protocol],
    ["Hostname",host],
    ["Port",url.port||"Default"],
    ["Path",url.pathname||"/"],
    ["Fragment",url.hash||"None"],
    ["Credentials in URL",url.username||url.password?"Present":"None"]
  ];
  return `<section class="panel solo"><h2>URL structure</h2><p class="note">Parsed locally. The URL was not opened, resolved, or sent to a lookup service.</p>${dl(parts.map(([key,value])=>[esc(key),`<code>${esc(value)}</code>`]))}<p><button type="button" class="mini" data-copy="${esc(url.href)}">Copy normalized URL</button></p></section><section class="panel solo"><h2>Review signals</h2>${flagHtml}</section>${redirectRows?`<section class="panel solo"><h2>Possible redirect parameters</h2><div class="scroll"><table><thead><tr><th>Parameter</th><th>Value</th></tr></thead><tbody>${redirectRows}</tbody></table></div></section>`:""}${query?`<section class="panel solo"><h2>Query parameters</h2><div class="scroll"><table><thead><tr><th>Name</th><th>Value</th></tr></thead><tbody>${query}</tbody></table></div></section>`:""}`;
}

function indicatorDefanger(v){
  const source=String(v.text||"");
  if(source.length>200000)throw new Error("Keep the pasted text under 200 KB.");
  let output=source;
  if(v.mode==="Refang for analysis"){
    output=output.replace(/\bhxxps:\/\//gi,"https://").replace(/\bhxxp:\/\//gi,"http://")
      .replace(/(?:\[\.\]|\(\.\)|\{\.\}|\[dot\]|\(dot\))/gi,".");
  }else{
    output=output.replace(/\bhttps?:\/\/[^\s<>"']+/gi,raw=>{
      const suffix=(raw.match(/[),.!?;:]+$/)||[""])[0],core=raw.slice(0,raw.length-suffix.length);
      return core.replace(/^https?/i,scheme=>scheme.toLowerCase()==="https"?"hxxps":"hxxp").replace(/\./g,"[.]")+suffix;
    });
    output=output.replace(/\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}\b/gi,domain=>domain.replace(/\./g,"[.]"));
    output=output.replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g,address=>address.replace(/\./g,"[.]"));
  }
  return `<section class="panel solo"><h2>${v.mode==="Refang for analysis"?"Refanged text":"Defanged text"}</h2><p class="note">Converted locally. Review the result before sharing or opening indicators.</p><pre>${esc(output)}</pre><button type="button" class="mini" data-copy="${esc(output)}">Copy converted text</button></section>`;
}

async function fileHash(v){
  const file=v.file;
  if(!file||typeof file.arrayBuffer!=="function")throw new Error("Choose a file to calculate its hashes.");
  if(file.size>100*1024*1024)throw new Error("For browser memory safety, choose a file smaller than 100 MB.");
  if(!globalThis.crypto?.subtle)throw new Error("Secure browser hashing is unavailable. Open the site over HTTPS in a modern browser.");
  const bytes=await file.arrayBuffer(),algorithms=["SHA-1","SHA-256","SHA-512"],rows=[];
  for(const algorithm of algorithms){
    const digest=await crypto.subtle.digest(algorithm,bytes);
    const hex=[...new Uint8Array(digest)].map(byte=>byte.toString(16).padStart(2,"0")).join("");
    rows.push([algorithm,hex]);
  }
  return `<section class="panel solo"><h2>File fingerprints</h2><p class="note">Calculated locally. The file was not uploaded. These hashes identify file contents; they do not determine whether a file is safe.</p>${dl([["Name",esc(file.name)],["Size",`${file.size.toLocaleString()} bytes`],["Type",esc(file.type||"Unknown")],["Modified",file.lastModified?esc(fmtT(file.lastModified)):"Unknown"]])}<div class="scroll"><table><thead><tr><th>Algorithm</th><th>Fingerprint</th><th></th></tr></thead><tbody>${rows.map(([name,hash])=>`<tr><td>${name}</td><td><code>${hash}</code></td><td><button type="button" class="mini" data-copy="${hash}">Copy</button></td></tr>`).join("")}</tbody></table></div></section>`;
}
