// Developer tools

const q=JSON.stringify,safe=u=>/^https?:\/\//i.test(u||"")?esc(u):"";
const EF=[["title","Title"],["url","Title link"],["description","Description","textarea"],["color","Color","color"],["an","Author name"],["ai","Author icon URL"],["ft","Footer text"],["fi","Footer icon URL"],["th","Thumbnail URL"],["im","Image URL"]];
const embedForm=()=>EF.map(([n,l,t])=>`<label>${l}${t==="textarea"?`<textarea data-e="${n}" rows="3"></textarea>`:`<input data-e="${n}" type="${t||"text"}" ${t==="color"?'value="#5865f2"':""} autocomplete="off">`}</label>`).join("")+
  `<label class="chk"><input type="checkbox" data-e="ts"> Add timestamp</label><div id="flds" class="ed"></div><button type="button" class="mini" id="addf">Add field</button>`;
function readEmbed(root){
  const g=n=>root.querySelector(`[data-e="${n}"]`).value.trim(),e={};
  if(g("title"))e.title=g("title");
  if(g("url"))e.url=g("url");
  if(g("description"))e.description=g("description");
  e.color=parseInt(g("color").slice(1),16)||0;
  if(g("an"))e.author={name:g("an"),...(g("ai")&&{icon_url:g("ai")})};
  if(g("ft"))e.footer={text:g("ft"),...(g("fi")&&{icon_url:g("fi")})};
  if(g("th"))e.thumbnail={url:g("th")};
  if(g("im"))e.image={url:g("im")};
  if(root.querySelector('[data-e="ts"]').checked)e.timestamp=new Date().toISOString();
  const f=[...root.querySelectorAll(".fld")].map(d=>({name:d.querySelector('[data-f="n"]').value.trim(),value:d.querySelector('[data-f="v"]').value.trim(),inline:d.querySelector('[data-f="i"]').checked})).filter(x=>x.name&&x.value);
  if(f.length)e.fields=f;
  return e;
}
const hasEmbed=e=>Object.keys(e).some(k=>k!=="color"&&k!=="timestamp");
function embedPreview(e){
  const c="#"+(e.color||0).toString(16).padStart(6,"0"),ic=u=>safe(u)?`<img src="${safe(u)}" alt="">`:"";
  const fl=(e.fields||[]).map(f=>`<div class="${f.inline?"in":""}"><b>${esc(f.name)}</b><br>${esc(f.value)}</div>`).join("");
  const foot=(e.footer?ic(e.footer.icon_url)+esc(e.footer.text):"")+(e.timestamp?(e.footer?" • ":"")+fmtT(e.timestamp):"");
  return `<div class="pv" style="border-left-color:${c}"><div class="pb">
    ${e.author?`<div class="pa">${ic(e.author.icon_url)}${esc(e.author.name)}</div>`:""}
    ${e.title?`<div class="pt">${safe(e.url)?`<a href="${safe(e.url)}" target="_blank" rel="noopener noreferrer">${esc(e.title)}</a>`:esc(e.title)}</div>`:""}
    ${e.description?`<div class="pd">${esc(e.description)}</div>`:""}
    ${fl?`<div class="pf">${fl}</div>`:""}
    ${e.image&&safe(e.image.url)?`<img class="pi" src="${safe(e.image.url)}" alt="">`:""}
    ${foot?`<div class="pfoot">${foot}</div>`:""}
  </div>${e.thumbnail&&safe(e.thumbnail.url)?`<img class="pth" src="${safe(e.thumbnail.url)}" alt="">`:""}</div>`;
}
function bindEmbed(root,upd){
  root.addEventListener("input",upd);
  root.querySelector("#addf").onclick=()=>{
    if(root.querySelectorAll(".fld").length>=25)return;
    const d=document.createElement("div");d.className="fld";
    d.innerHTML='<input data-f="n" placeholder="Field name" autocomplete="off"><input data-f="v" placeholder="Field value" autocomplete="off"><label class="chk"><input type="checkbox" data-f="i"> Inline</label><button type="button" class="mini" data-rm>Remove</button>';
    root.querySelector("#flds").append(d);upd();
  };
  root.addEventListener("click",e=>{const b=e.target.closest("[data-rm]");if(b){b.closest(".fld").remove();upd()}});
}
const hex6=n=>n.toString(16).padStart(6,"0");
function toJs(e){
  const L=['const { EmbedBuilder } = require("discord.js");',"","const embed = new EmbedBuilder()"];
  if(e.title)L.push(`  .setTitle(${q(e.title)})`);
  if(e.url)L.push(`  .setURL(${q(e.url)})`);
  if(e.description)L.push(`  .setDescription(${q(e.description)})`);
  L.push(`  .setColor(0x${hex6(e.color)})`);
  if(e.author)L.push(`  .setAuthor({ name: ${q(e.author.name)}${e.author.icon_url?`, iconURL: ${q(e.author.icon_url)}`:""} })`);
  if(e.footer)L.push(`  .setFooter({ text: ${q(e.footer.text)}${e.footer.icon_url?`, iconURL: ${q(e.footer.icon_url)}`:""} })`);
  if(e.thumbnail)L.push(`  .setThumbnail(${q(e.thumbnail.url)})`);
  if(e.image)L.push(`  .setImage(${q(e.image.url)})`);
  if(e.fields)L.push("  .addFields(\n"+e.fields.map(f=>`    { name: ${q(f.name)}, value: ${q(f.value)}, inline: ${f.inline} }`).join(",\n")+"\n  )");
  if(e.timestamp)L.push("  .setTimestamp()");
  L[L.length-1]+=";";
  return L.concat(["","channel.send({ embeds: [embed] });"]).join("\n");
}
function toPy(e){
  const a=[];
  if(e.title)a.push(`title=${q(e.title)}`);
  if(e.url)a.push(`url=${q(e.url)}`);
  if(e.description)a.push(`description=${q(e.description)}`);
  a.push(`color=0x${hex6(e.color)}`);
  const L=["import discord","",`embed = discord.Embed(${a.join(", ")})`];
  if(e.author)L.push(`embed.set_author(name=${q(e.author.name)}${e.author.icon_url?`, icon_url=${q(e.author.icon_url)}`:""})`);
  if(e.footer)L.push(`embed.set_footer(text=${q(e.footer.text)}${e.footer.icon_url?`, icon_url=${q(e.footer.icon_url)}`:""})`);
  if(e.thumbnail)L.push(`embed.set_thumbnail(url=${q(e.thumbnail.url)})`);
  if(e.image)L.push(`embed.set_image(url=${q(e.image.url)})`);
  (e.fields||[]).forEach(f=>L.push(`embed.add_field(name=${q(f.name)}, value=${q(f.value)}, inline=${f.inline?"True":"False"})`));
  if(e.timestamp)L.push("embed.timestamp = discord.utils.utcnow()");
  return L.concat(["","await channel.send(embed=embed)"]).join("\n");
}
const codeBlock=(t,c)=>`<h3 class="ch">${t}<button type="button" class="mini" data-copy="${esc(c)}">Copy</button></h3><pre>${esc(c)}</pre>`;
const embedC=()=>`<div id="ew" class="two"><div class="ed">${embedForm()}</div><div><div id="pv"></div><div id="codes"></div></div></div>`;
let lastWebhookSentAt=0;
function embedAfter(){
  const root=$("#ew"),upd=()=>{const e=readEmbed(root);
    $("#pv").innerHTML=embedPreview(e);
    $("#codes").innerHTML=codeBlock("discord.js",toJs(e))+codeBlock("discord.py",toPy(e))+codeBlock("JSON payload",JSON.stringify({embeds:[e]},null,2))};
  bindEmbed(root,upd);upd();
}
const msgPreview=b=>`<div class="msg"><div class="pa">${safe(b.avatar_url)?`<img src="${safe(b.avatar_url)}" alt="">`:""}<b>${esc(b.username||"Webhook")}</b> <span class="chip">App</span></div>${b.content?`<div class="pd">${esc(b.content)}</div>`:""}${b.embeds?embedPreview(b.embeds[0]):""}</div>`;
const hookC=()=>`<div id="ew" class="two"><div class="ed">
  <label>Webhook URLs<textarea data-w="urls" rows="3" autocomplete="off" placeholder="Paste up to 5 webhook URLs, one per line"></textarea></label>
  <button type="button" class="mini" id="load-hooks">Load webhook list</button>
  <div id="hook-targets" class="hook-targets" aria-label="Webhook destinations"><p class="note">Load your webhook list to choose a destination.</p></div>
  <label>Message<textarea data-w="content" rows="3"></textarea></label>
  <label>Username override<input data-w="username" autocomplete="off"></label>
  <label>Avatar override URL<input data-w="avatar" autocomplete="off"></label>
  <h3 class="ch">Embed (optional)</h3>${embedForm()}
  <button type="button" id="send" disabled>Send to selected</button><p id="hs" role="status" class="note"></p></div>
  <div><div id="pv"></div></div></div>`;
function hookAfter(){
  const root=$("#ew"),w=n=>root.querySelector(`[data-w="${n}"]`).value.trim(),targets=$("#hook-targets"),send=$("#send");
  let urls=[],sending=false;
  const body=()=>{const b={};if(w("content"))b.content=w("content");if(w("username"))b.username=w("username");if(w("avatar"))b.avatar_url=w("avatar");
    const e=readEmbed(root);if(hasEmbed(e))b.embeds=[e];b.allowed_mentions={parse:[]};return b};
  const upd=()=>{$("#pv").innerHTML=msgPreview(body())};
  bindEmbed(root,upd);upd();
  const validUrl=url=>/^https:\/\/(?:(?:canary|ptb)\.)?discord(?:app)?\.com\/api(?:\/v\d+)?\/webhooks\/\d+\/[\w-]+$/.test(url);
  const selected=()=>[...targets.querySelectorAll('input[type="checkbox"]:checked')].map(x=>urls[Number(x.value)]);
  const updateSend=()=>{const count=selected().length;send.disabled=sending||!count;send.textContent=count?`Send to ${count} webhook${count===1?"":"s"}`:"Send to selected"};
  $("#load-hooks").onclick=()=>{
    const hs=$("#hs");hs.style.color="";
    const entries=w("urls").split(/[\s,;]+/).filter(Boolean);
    if(!entries.length){hs.textContent="Add at least one webhook URL.";hs.style.color="var(--err)";return}
    if(entries.length>5){hs.textContent="Add no more than 5 webhooks.";hs.style.color="var(--err)";return}
    if(entries.some(url=>!validUrl(url))){hs.textContent="One or more URLs aren't valid Discord webhook URLs.";hs.style.color="var(--err)";return}
    urls=[...new Set(entries)];
    if(urls.length!==entries.length){hs.textContent="Duplicate webhook URLs were removed.";hs.style.color=""}
    else hs.textContent=`${urls.length} webhook${urls.length===1?"":"s"} ready. Select where to send.`;
    targets.innerHTML=urls.map((url,i)=>`<label class="hook-target"><input type="checkbox" value="${i}"><span>Webhook ${i+1}</span><code>…${esc(url.match(/\/webhooks\/(\d+)\//)[1].slice(-4))}</code></label>`).join("");
    targets.querySelectorAll("input").forEach(box=>box.onchange=updateSend);
    updateSend();
  };
  send.onclick=async()=>{
    const hs=$("#hs"),btn=send,destinations=selected(),bad=m=>{hs.textContent=m;hs.style.color="var(--err)"};
    hs.style.color="";
    if(!destinations.length)return bad("Select at least one webhook.");
    const b=body();
    if(!b.content&&!b.embeds)return bad("Add a message or an embed first.");
    if(destinations.length>1&&!confirm(`Send this one message to ${destinations.length} selected webhooks? Sends are sequential, with at least 1.1 seconds between each.`))return;
    sending=true;updateSend();
    try{
      let sent=0;
      for(let i=0;i<destinations.length;i++){
        const wait=Math.max(0,1100-(Date.now()-lastWebhookSentAt));
        if(wait)await new Promise(resolve=>setTimeout(resolve,wait));
        hs.textContent=`Sending ${i+1} of ${destinations.length}…`;
        lastWebhookSentAt=Date.now();
        const r=await fetch(destinations[i],{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b)});
        if(r.status===429){
          const retry=Number(r.headers.get("Retry-After"));
          hs.textContent=`Discord rate-limited this send${Number.isFinite(retry)&&retry>0?`; retry after ${retry} seconds`:""}. ${sent} sent; remaining sends stopped.`;
          hs.style.color="var(--err)";break;
        }
        if(!r.ok){
          const j=await r.json().catch(()=>({}));
          hs.textContent=`Webhook ${i+1} failed: ${j.message||"Discord returned "+r.status}. ${sent} sent; remaining sends stopped.`;
          hs.style.color="var(--err)";break;
        }
        sent++;
      }
      if(sent===destinations.length){hs.textContent=`Sent to ${sent} webhook${sent===1?"":"s"}.`;hs.style.color=""}
    }catch{bad("Couldn't reach Discord. Any completed sends cannot be recalled.")}
    finally{sending=false;updateSend()}
  };
}
const IN=[["Guilds",0],["Guild members",1,1],["Guild moderation",2],["Guild expressions",3],["Guild integrations",4],["Guild webhooks",5],["Guild invites",6],["Guild voice states",7],["Guild presences",8,1],["Guild messages",9],["Guild message reactions",10],["Guild message typing",11],["Direct messages",12],["Direct message reactions",13],["Direct message typing",14],["Message content",15,1],["Guild scheduled events",16],["Auto moderation configuration",20],["Auto moderation execution",21],["Guild message polls",24],["Direct message polls",25]];
const intC=()=>`<div id="ew" class="two"><div class="ed">${IN.map(([n,b,p])=>`<label class="chk"><input type="checkbox" data-b="${b}"> ${n}${p?' <span class="chip">privileged</span>':""}</label>`).join("")}</div>
  <div class="panel"><h2>Bitfield</h2><p><code id="iv" style="font-size:1.5rem">0</code></p><button type="button" class="mini" id="icopy" data-copy="0">Copy</button>
  <label style="margin-top:1.2rem">Decode a number<input id="ii" inputmode="numeric" autocomplete="off" placeholder="e.g. 3276799"></label>
  </div></div>`;
function intAfter(){
  const boxes=[...$("#ew").querySelectorAll("[data-b]")];
  const calc=()=>{const n=boxes.reduce((s,b)=>s+(b.checked?2**Number(b.dataset.b):0),0);$("#iv").textContent=n;$("#icopy").dataset.copy=n};
  boxes.forEach(b=>b.onchange=calc);
  $("#ii").oninput=e=>{const n=Number(e.target.value.trim());if(!Number.isInteger(n)||n<0)return;boxes.forEach(b=>b.checked=Math.floor(n/2**Number(b.dataset.b))%2===1);calc()};
}
function permissionBuildC(){
  return `<div id="permission-builder" class="two">
    <div class="panel"><h2>Choose permissions</h2><p class="note">Select the permissions to include. Administrator grants all permissions.</p>
      <div class="permission-list" role="group" aria-label="Discord permissions">${P.map(([name,bit])=>`<label class="chk"><input type="checkbox" data-permission-bit="${bit}"> ${esc(name)}</label>`).join("")}</div>
    </div>
    <div class="panel"><h2>Permission bitfield</h2><p class="note">Decimal</p><pre><code id="permission-number">0</code></pre><p class="note" id="permission-hex">Hexadecimal: 0x0</p>
      <p class="note" id="permission-count">0 permissions selected.</p><button type="button" class="mini" id="permission-copy" data-copy="0">Copy number</button>
      <p class="note" style="margin-top:1rem">Paste the decimal value into the Bot Invite Builder or your application command settings.</p>
    </div></div>`;
}
function permissionBuildAfter(){
  const root=$("#permission-builder"),boxes=[...root.querySelectorAll("[data-permission-bit]")];
  const update=()=>{
    const selected=boxes.filter(box=>box.checked);
    const value=selected.reduce((total,box)=>total|(1n<<BigInt(box.dataset.permissionBit)),0n).toString();
    $("#permission-number").textContent=value;
    $("#permission-hex").textContent="Hexadecimal: 0x"+BigInt(value).toString(16).toUpperCase();
    $("#permission-count").textContent=`${selected.length} permission${selected.length===1?"":"s"} selected.`;
    $("#permission-copy").dataset.copy=value;
  };
  boxes.forEach(box=>box.addEventListener("change",update));
}