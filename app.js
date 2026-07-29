
// ----------------------------------------------------
// Lead gate
// ----------------------------------------------------

// Mailchimp embedded-form endpoint (from Audience > Signup forms > Embedded form).
// These are public list identifiers, not a secret API key — safe to ship in client code.
const MAILCHIMP_URL = "https://lookgoodfitness.us5.list-manage.com/subscribe/post?u=9d11a72a3736b1f1dd92fdfc9&id=b895da0481&f_id=00c78de3f0";
const MAILCHIMP_HONEYPOT_FIELD = "b_9d11a72a3736b1f1dd92fdfc9_b895da0481";

const leadGate = document.getElementById("leadGate");
const leadForm = document.getElementById("leadForm");
const leadValidation = document.getElementById("leadValidation");
const unlockBtn = document.getElementById("unlockBtn");

function validEmail(value){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function gateIsUnlocked(){
  return localStorage.getItem("lcc_raw_cooked_unlocked") === "1";
}

function revealApp(){
  document.body.classList.remove("gated");
  leadGate.classList.add("is-leaving");
  window.setTimeout(() => {
    leadGate.hidden = true;
  }, 280);
}

async function submitLead(payload){
  // Always keep a local record so the tool unlocks even if the network call below fails.
  localStorage.setItem("lcc_raw_cooked_lead", JSON.stringify({
    ...payload,
    capturedAt: new Date().toISOString()
  }));

  // Only subscribe them in Mailchimp if they ticked the separate, optional marketing
  // checkbox. The privacy checkbox is required to use the tool at all, but that's
  // consent to store their details for the tool itself — not the same thing as
  // marketing consent, which UK PECR requires to be freely given, not bundled in.
  if(!payload.marketingConsent){
    return { ok:true, mode:"local-only" };
  }

  const params = new URLSearchParams();
  params.append("FNAME", payload.firstName);
  params.append("EMAIL", payload.email);
  params.append(MAILCHIMP_HONEYPOT_FIELD, ""); // anti-spam honeypot — must stay blank

  // list-manage.com doesn't send CORS headers, so with mode:"no-cors" the response
  // is opaque (can't be read from JS) — but the request still reaches Mailchimp and
  // the subscriber gets added. We can't confirm success client-side; that's a known
  // limit of doing this without a backend.
  await fetch(MAILCHIMP_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString()
  });

  return { ok:true, mode:"mailchimp" };
}

if(gateIsUnlocked()){
  leadGate.hidden = true;
}else{
  document.body.classList.add("gated");
}

leadForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  leadValidation.textContent = "";

  const firstName = document.getElementById("firstName").value.trim();
  const email = document.getElementById("email").value.trim().toLowerCase();
  const privacyConsent = document.getElementById("privacyConsent").checked;
  const marketingConsent = document.getElementById("marketingConsent").checked;

  if(firstName.length < 2){
    leadValidation.textContent = "Enter your first name.";
    document.getElementById("firstName").focus();
    return;
  }

  if(!validEmail(email)){
    leadValidation.textContent = "Enter a valid email address.";
    document.getElementById("email").focus();
    return;
  }

  if(!privacyConsent){
    leadValidation.textContent = "Please tick the box to confirm you're happy for us to store your details.";
    document.getElementById("privacyConsent").focus();
    return;
  }

  unlockBtn.disabled = true;
  unlockBtn.textContent = "UNLOCKING...";

  try{
    await submitLead({
      firstName,
      email,
      marketingConsent,
      source:"raw-cooked-converter"
    });

    localStorage.setItem("lcc_raw_cooked_unlocked","1");
    localStorage.setItem("lcc_raw_cooked_first_name",firstName);
    revealApp();
  }catch(error){
    leadValidation.textContent = "Couldn’t unlock right now. Please try again.";
  }finally{
    unlockBtn.disabled = false;
    unlockBtn.innerHTML = 'UNLOCK THE CONVERTER <span aria-hidden="true">›</span>';
  }
});


const foods = [
  {name:"Chicken breast", aliases:["chicken"], base:"RAW", yield:0.75, kcal:120, protein:23.0, carbs:0, fat:2.6},
  {name:"Chicken thigh, skinless", aliases:["chicken thigh"], base:"RAW", yield:0.72, kcal:144, protein:19.7, carbs:0, fat:7.0},
  {name:"Turkey breast", aliases:["turkey"], base:"RAW", yield:0.76, kcal:114, protein:24.0, carbs:0, fat:1.5},
  {name:"Lean beef mince 5%", aliases:["beef mince","mince","5% mince"], base:"RAW", yield:0.72, kcal:137, protein:21.4, carbs:0, fat:5.0},
  {name:"Lean beef mince 10%", aliases:["10% mince"], base:"RAW", yield:0.70, kcal:176, protein:20.0, carbs:0, fat:10.0},
  {name:"Beef steak", aliases:["steak"], base:"RAW", yield:0.74, kcal:164, protein:21.0, carbs:0, fat:8.5},
  {name:"Pork loin", aliases:["pork"], base:"RAW", yield:0.75, kcal:143, protein:21.4, carbs:0, fat:5.9},
  {name:"Salmon fillet", aliases:["salmon"], base:"RAW", yield:0.80, kcal:208, protein:20.4, carbs:0, fat:13.4},
  {name:"Cod fillet", aliases:["cod"], base:"RAW", yield:0.82, kcal:82, protein:17.8, carbs:0, fat:0.7},
  {name:"Haddock", aliases:[], base:"RAW", yield:0.82, kcal:90, protein:20.0, carbs:0, fat:0.6},
  {name:"Tuna steak", aliases:["fresh tuna"], base:"RAW", yield:0.78, kcal:132, protein:28.0, carbs:0, fat:1.3},
  {name:"Basmati rice", aliases:["rice","white basmati"], base:"DRY", yield:3.00, kcal:356, protein:8.5, carbs:77.0, fat:0.8},
  {name:"White rice", aliases:["long grain rice"], base:"DRY", yield:3.00, kcal:356, protein:7.1, carbs:80.0, fat:0.7},
  {name:"Jasmine rice", aliases:[], base:"DRY", yield:3.00, kcal:356, protein:7.1, carbs:80.0, fat:0.7},
  {name:"Brown rice", aliases:[], base:"DRY", yield:2.80, kcal:360, protein:7.5, carbs:76.0, fat:2.7},
  {name:"Pasta", aliases:["white pasta"], base:"DRY", yield:2.50, kcal:359, protein:12.5, carbs:72.0, fat:1.8},
  {name:"Wholewheat pasta", aliases:["wholemeal pasta"], base:"DRY", yield:2.45, kcal:348, protein:13.0, carbs:64.0, fat:2.5},
  {name:"Spaghetti", aliases:[], base:"DRY", yield:2.50, kcal:359, protein:12.5, carbs:72.0, fat:1.8},
  {name:"Couscous", aliases:[], base:"DRY", yield:2.40, kcal:376, protein:12.8, carbs:77.4, fat:0.6},
  {name:"Quinoa", aliases:[], base:"DRY", yield:2.85, kcal:368, protein:14.1, carbs:64.2, fat:6.1},
  {name:"Potato", aliases:["white potato","potatoes"], base:"RAW", yield:0.90, kcal:77, protein:2.0, carbs:17.0, fat:0.1},
  {name:"Sweet potato", aliases:["sweet potatoes"], base:"RAW", yield:0.88, kcal:86, protein:1.6, carbs:20.1, fat:0.1},
  {name:"Butternut squash", aliases:["squash"], base:"RAW", yield:0.88, kcal:45, protein:1.0, carbs:11.7, fat:0.1},
  {name:"Broccoli", aliases:[], base:"RAW", yield:0.92, kcal:34, protein:2.8, carbs:6.6, fat:0.4},
  {name:"Carrots", aliases:["carrot"], base:"RAW", yield:0.93, kcal:41, protein:0.9, carbs:9.6, fat:0.2},
  {name:"Oats", aliases:["porridge oats"], base:"DRY", yield:2.50, kcal:370, protein:13.0, carbs:60.0, fat:7.0},

  {name:"Egg, whole", aliases:["egg","eggs","boiled egg"], base:"RAW", yield:0.90, kcal:143, protein:12.6, carbs:0.7, fat:9.5},
  {name:"Bacon, back", aliases:["bacon"], base:"RAW", yield:0.65, kcal:215, protein:20.9, carbs:0, fat:14.0},
  {name:"Sausages, pork", aliases:["sausage","sausages"], base:"RAW", yield:0.72, kcal:300, protein:13.0, carbs:5.0, fat:25.0},
  {name:"Turkey mince", aliases:["turkey mince"], base:"RAW", yield:0.74, kcal:120, protein:20.0, carbs:0, fat:4.0},
  {name:"King prawns", aliases:["prawns","shrimp"], base:"RAW", yield:0.80, kcal:85, protein:20.0, carbs:0.4, fat:0.5},
  {name:"Lamb leg", aliases:["lamb"], base:"RAW", yield:0.72, kcal:156, protein:20.0, carbs:0, fat:8.0},
  {name:"Chicken drumstick, skinless", aliases:["chicken drumstick","drumstick"], base:"RAW", yield:0.70, kcal:116, protein:19.0, carbs:0, fat:4.1},
  {name:"Lean beef mince 20%", aliases:["20% mince"], base:"RAW", yield:0.68, kcal:250, protein:18.0, carbs:0, fat:20.0},

  {name:"Egg noodles", aliases:["noodles"], base:"DRY", yield:2.20, kcal:350, protein:12.0, carbs:71.0, fat:2.0},
  {name:"Red lentils, dried", aliases:["red lentils","lentils"], base:"DRY", yield:2.50, kcal:325, protein:24.0, carbs:52.0, fat:1.3},
  {name:"Green lentils, dried", aliases:["green lentils","brown lentils"], base:"DRY", yield:2.30, kcal:310, protein:24.0, carbs:48.0, fat:1.0},
  {name:"Chickpeas, dried", aliases:["chickpeas"], base:"DRY", yield:2.50, kcal:364, protein:19.3, carbs:61.0, fat:6.0},
  {name:"Bulgur wheat", aliases:["bulgur"], base:"DRY", yield:2.50, kcal:342, protein:12.3, carbs:75.9, fat:1.3},
  {name:"Pearl barley", aliases:["barley"], base:"DRY", yield:3.00, kcal:352, protein:9.9, carbs:77.7, fat:1.2},

  {name:"Spinach", aliases:[], base:"RAW", yield:0.30, kcal:23, protein:2.9, carbs:3.6, fat:0.4},
  {name:"Green beans", aliases:[], base:"RAW", yield:0.90, kcal:31, protein:1.8, carbs:7.0, fat:0.2},
  {name:"Peas", aliases:[], base:"RAW", yield:0.95, kcal:81, protein:5.4, carbs:14.5, fat:0.4},
  {name:"Mushrooms", aliases:[], base:"RAW", yield:0.60, kcal:22, protein:3.1, carbs:3.3, fat:0.3},
  {name:"Cauliflower", aliases:[], base:"RAW", yield:0.90, kcal:25, protein:1.9, carbs:5.0, fat:0.3},
  {name:"Onion", aliases:[], base:"RAW", yield:0.85, kcal:40, protein:1.1, carbs:9.3, fat:0.1},
  {name:"Courgette", aliases:["zucchini"], base:"RAW", yield:0.85, kcal:17, protein:1.2, carbs:3.1, fat:0.3},
  {name:"Asparagus", aliases:[], base:"RAW", yield:0.90, kcal:20, protein:2.2, carbs:3.9, fat:0.1}
];

let selected = null;
let mode = "base-to-cooked";
let lastResult = null;

const $ = id => document.getElementById(id);
const foodSearch = $("foodSearch");
const suggestions = $("foodSuggestions");

function clean(s){return String(s||"").trim().toLowerCase();}
function matchesFood(food,q){
  const hay=[food.name,...food.aliases].join(" ").toLowerCase();
  return hay.includes(q);
}
function fmtWeight(n){
  const rounded=Math.round(n*10)/10;
  return `${Number.isInteger(rounded)?rounded.toFixed(0):rounded.toFixed(1)}g`;
}
function fmtMacro(n){
  const rounded=Math.round(n*10)/10;
  return `${Number.isInteger(rounded)?rounded.toFixed(0):rounded.toFixed(1)}g`;
}
function setMode(next){
  mode=next;
  $("rawBtn").classList.toggle("active",mode==="base-to-cooked");
  $("cookedBtn").classList.toggle("active",mode==="cooked-to-base");
  $("result").hidden=true;
}
function updateBaseLabel(){
  $("rawLabel").textContent=selected ? selected.base : "RAW / DRY";
}
function renderSuggestions(){
  const q=clean(foodSearch.value);
  suggestions.innerHTML="";
  if(!q){suggestions.hidden=true;return;}
  const hits=foods.filter(f=>matchesFood(f,q)).slice(0,8);
  if(!hits.length){
    const empty=document.createElement("div");
    empty.className="suggestion";
    empty.innerHTML="<strong>No match yet</strong><small>Try chicken, rice, pasta, potato…</small>";
    suggestions.appendChild(empty);
    suggestions.hidden=false;
    return;
  }
  hits.forEach(food=>{
    const b=document.createElement("button");
    b.type="button"; b.className="suggestion";
    b.innerHTML=`<strong>${food.name}</strong><small>${food.base} ↔ COOKED</small>`;
    b.addEventListener("click",()=>selectFood(food));
    suggestions.appendChild(b);
  });
  suggestions.hidden=false;
}
function selectFood(food){
  selected=food;
  $("selectedFoodName").textContent=food.name;
  $("selectedFoodBar").hidden=false;
  foodSearch.hidden=true;
  $("clearSearch").hidden=true;
  suggestions.hidden=true;
  updateBaseLabel();
  $("result").hidden=true;
  $("weightInput").focus();
}
function resetFood(){
  selected=null;
  foodSearch.hidden=false;
  foodSearch.value="";
  $("selectedFoodBar").hidden=true;
  updateBaseLabel();
  $("result").hidden=true;
  foodSearch.focus();
}
function convert(){
  $("validation").textContent="";
  if(!selected){
    $("validation").textContent="Pick a food first.";
    if(foodSearch.hidden) resetFood();
    foodSearch.focus();
    return;
  }
  const w=Number($("weightInput").value);
  if(!Number.isFinite(w)||w<=0){
    $("validation").textContent="Enter a weight in grams.";
    $("weightInput").focus();
    return;
  }

  let baseWeight,cookedWeight,inputType,outputType,inputWeight,outputWeight;
  if(mode==="base-to-cooked"){
    baseWeight=w;
    cookedWeight=w*selected.yield;
    inputType=selected.base; outputType="COOKED";
    inputWeight=w; outputWeight=cookedWeight;
  }else{
    cookedWeight=w;
    baseWeight=w/selected.yield;
    inputType="COOKED"; outputType=selected.base;
    inputWeight=w; outputWeight=baseWeight;
  }

  const m=baseWeight/100;
  $("resultFood").textContent=selected.name;
  $("resultInputType").textContent=inputType;
  $("resultOutputType").textContent=outputType;
  $("resultInputWeight").textContent=fmtWeight(inputWeight);
  $("resultOutputWeight").textContent=fmtWeight(outputWeight);
  $("kcal").textContent=Math.round(selected.kcal*m);
  $("protein").textContent=fmtMacro(selected.protein*m);
  $("carbs").textContent=fmtMacro(selected.carbs*m);
  $("fat").textContent=fmtMacro(selected.fat*m);

  const per100Base = mode==="base-to-cooked" ? (100/selected.yield) : (100/selected.yield);
  const per100m=per100Base/100;
  $("per100Title").textContent="PER 100g COOKED";
  $("per100Kcal").textContent=`${Math.round(selected.kcal*per100m)} KCAL`;
  $("per100Protein").textContent=fmtMacro(selected.protein*per100m);
  $("per100Carbs").textContent=fmtMacro(selected.carbs*per100m);
  $("per100Fat").textContent=fmtMacro(selected.fat*per100m);

  $("result").hidden=false;
  $("result").scrollIntoView({behavior:"smooth",block:"nearest"});

  lastResult={
    foodName:selected.name,
    inputType,outputType,
    inputWeight:fmtWeight(inputWeight),
    outputWeight:fmtWeight(outputWeight),
    kcal:Math.round(selected.kcal*m)
  };
}

foodSearch.addEventListener("input",()=>{
  $("clearSearch").hidden=!foodSearch.value;
  renderSuggestions();
});
foodSearch.addEventListener("focus",renderSuggestions);
$("clearSearch").addEventListener("click",()=>{foodSearch.value="";$("clearSearch").hidden=true;suggestions.hidden=true;foodSearch.focus();});
$("changeFood").addEventListener("click",resetFood);
$("rawBtn").addEventListener("click",()=>setMode("base-to-cooked"));
$("cookedBtn").addEventListener("click",()=>setMode("cooked-to-base"));
$("swapBtn").addEventListener("click",()=>setMode(mode==="base-to-cooked"?"cooked-to-base":"base-to-cooked"));
$("convertBtn").addEventListener("click",convert);
$("weightInput").addEventListener("keydown",e=>{if(e.key==="Enter")convert();});
document.addEventListener("click",e=>{if(!e.target.closest(".search-area"))suggestions.hidden=true;});

const info=$("infoDialog");
$("infoBtn").addEventListener("click",()=>info.showModal());
$("closeInfo").addEventListener("click",()=>info.close());
info.addEventListener("click",e=>{if(e.target===info)info.close();});

const shareBtn=$("shareResult");
if(shareBtn){
  const shareLabel=shareBtn.innerHTML;
  shareBtn.addEventListener("click",async()=>{
    const url=window.location.href.split("#")[0].split("?")[0];
    const food=lastResult?lastResult.foodName.toLowerCase():"food";
    const detail=lastResult
      ? `${lastResult.inputWeight} ${lastResult.inputType.toLowerCase()} ${food} = ${lastResult.outputWeight} ${lastResult.outputType.toLowerCase()}. `
      : "";
    const text=`Turns out ${detail}I've been weighing my food wrong this whole time. Free converter, worth two minutes:`;

    if(navigator.share){
      try{ await navigator.share({title:"Raw ↔ Cooked Macro Converter",text,url}); }
      catch(err){ /* user cancelled share sheet — no action needed */ }
      return;
    }

    if(navigator.clipboard){
      try{
        await navigator.clipboard.writeText(`${text} ${url}`);
        shareBtn.textContent="LINK COPIED";
        setTimeout(()=>{ shareBtn.innerHTML=shareLabel; },2200);
      }catch(err){
        window.prompt("Copy this link:",url);
      }
    }else{
      window.prompt("Copy this link:",url);
    }
  });
}

// ----------------------------------------------------
// Save / install this tool
// ----------------------------------------------------
const installBtn=$("installBtn");
const saveInstructionsDialog=$("saveInstructionsDialog");
const saveInstructionsBody=$("saveInstructionsBody");

function isStandalone(){
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}
function isIos(){
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent) && !window.MSStream;
}
function isMobile(){
  return /android|iphone|ipad|ipod|mobile/i.test(window.navigator.userAgent);
}
function isMac(){
  return /mac/i.test(window.navigator.platform || window.navigator.userAgent);
}

let deferredInstallPrompt=null;

if(installBtn){
  if(isStandalone()){
    // Already installed/running as an app — nothing left for this button to do.
    installBtn.hidden=true;
  }else{
    window.addEventListener("beforeinstallprompt",(event)=>{
      event.preventDefault();
      deferredInstallPrompt=event;
    });

    installBtn.addEventListener("click",async()=>{
      // Chrome/Edge/Android — real native install prompt when available.
      if(deferredInstallPrompt){
        deferredInstallPrompt.prompt();
        try{ await deferredInstallPrompt.userChoice; }catch(err){ /* dismissed */ }
        deferredInstallPrompt=null;
        return;
      }

      // Everyone else — no programmatic install/bookmark API exists in any browser,
      // so show the right manual steps for their platform instead.
      if(!saveInstructionsDialog || !saveInstructionsBody) return;

      if(isIos()){
        saveInstructionsBody.innerHTML=`
          <p>iPhone doesn't let sites install themselves — takes two taps to sort:</p>
          <p><strong>1.</strong> Tap the <strong>Share</strong> icon at the bottom of Safari.</p>
          <p><strong>2.</strong> Scroll down and tap <strong>"Add to Home Screen."</strong></p>
          <p>It'll sit on your home screen like any other app — no App Store, no faff.</p>`;
      }else if(isMobile()){
        saveInstructionsBody.innerHTML=`
          <p>Tap your browser's menu button, then look for <strong>"Add to Home screen"</strong> or <strong>"Install app."</strong></p>
          <p>It'll sit on your home screen like any other app.</p>`;
      }else{
        saveInstructionsBody.innerHTML=`
          <p>Press <strong>${isMac() ? "Cmd+D" : "Ctrl+D"}</strong> to bookmark this page in your browser.</p>
          <p>Some browsers can also install this as a standalone app — check your browser's menu for an <strong>"Install"</strong> option.</p>`;
      }
      saveInstructionsDialog.showModal();
    });

    window.addEventListener("appinstalled",()=>{
      installBtn.hidden=true;
      deferredInstallPrompt=null;
    });
  }
}

if(saveInstructionsDialog){
  const closeSaveInstructions=$("closeSaveInstructions");
  if(closeSaveInstructions) closeSaveInstructions.addEventListener("click",()=>saveInstructionsDialog.close());
  saveInstructionsDialog.addEventListener("click",e=>{if(e.target===saveInstructionsDialog)saveInstructionsDialog.close();});
}

// ----------------------------------------------------
// Force a real thumbnail frame on iOS Safari
// ----------------------------------------------------
// iOS Safari loads duration/dimensions with preload="metadata" but doesn't actually
// decode and paint a visible frame — it just shows black until playback starts.
// Nudging currentTime forces a real decode+paint of the video's own first frame,
// so the thumbnail always matches whatever intro-video.mp4 currently is.
const introVideo=$("introVideo");
if(introVideo){
  introVideo.addEventListener("loadedmetadata",()=>{
    try{ introVideo.currentTime=0.05; }catch(err){ /* ignore */ }
  },{once:true});
}

updateBaseLabel();
