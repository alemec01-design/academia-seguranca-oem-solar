(()=>{"use strict";
const $=id=>document.getElementById(id);
const cfg=window.OM_SUPABASE||{};
const db=window.supabase&&cfg.url?window.supabase.createClient(cfg.url,cfg.publishableKey):null;
const KEY="omSolarAcademiaV8";
let state={profile:null,completed:[],progress:{},xp:0};
let profileId=null,currentTrack=0,slide=0,quizIndex=0,quizScore=0,checkpointPassed={},caseDone=false;

try{state=JSON.parse(localStorage.getItem(KEY))||state}catch(e){}
profileId=state.profile?.profile_id||null;
const save=()=>localStorage.setItem(KEY,JSON.stringify(state));
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const content=()=>window.ACADEMIA_CONTENT||[];
const isAdmin=()=>state.profile?.access_role==="ADMIN";

function unlocked(i){
  if(isAdmin()) return true;
  if(!state.profile?.admission_date) return i===0;
  const a=new Date(state.profile.admission_date+"T00:00:00"), b=new Date();
  b.setHours(0,0,0,0);
  return Math.floor((b-a)/86400000)>=i*7;
}
function rank(x){return x<200?"RECRUTA":x<500?"OPERADOR":x<900?"GUARDIÃO":x<1500?"VETERANO":"MESTRE"}
function setHeader(){
  const p=state.profile,x=state.xp||0;
  $("playerName").textContent=p?p.full_name.split(" ")[0].toUpperCase():"ENTRAR";
  $("roleLabel").textContent=p?.access_role||"COLABORADOR";
  $("level").textContent=String(Math.floor(x/100)+1).padStart(2,"0");
  $("adminViewBtn").hidden=!isAdmin();
  $("profileBtn").textContent=p?"PERFIL":"ENTRAR";
}
function render(){setHeader();home()}

function home(){
  const d=state.completed.length,x=state.xp||0;
  const next=Math.max(0,content().findIndex((_,i)=>!state.completed.includes(i)));
  const active=Math.min(4,Math.floor(next/5));
  const phases=[["01","FUNDAMENTOS",0,5],["02","OPERAÇÃO SEGURA",5,10],["03","RISCOS DA UFV",10,15],["04","CULTURA E COMPORTAMENTO",15,20],["05","GUARDIÃO",20,21]];
  $("appMain").innerHTML=`<section class="field-home">
    <div class="field-welcome">
      <div><span class="eyebrow">ACADEMIA DE SEGURANÇA • O&M SOLAR</span><h1>Olá, ${esc(state.profile?.full_name?.split(" ")[0]||"Colaborador")}!</h1><p>Siga sua jornada. Um treinamento por vez.</p></div>
      <div class="stat"><small>PROGRESSO</small><b>${d}/21</b></div>
    </div>
    <div class="continue-card">
      <div class="play">▶</div>
      <div><small>PRÓXIMO TREINAMENTO</small><b>${next<21?esc(content()[next].title):"Jornada concluída"}</b><small>${next<21?"Treinamento "+String(next+1).padStart(2,"0")+" • "+(state.completed.includes(next)?"Concluído":"Próximo passo"):"Parabéns! Você concluiu os 21 treinamentos."}</small></div>
      <button class="primary" id="continueBtn">${next<21?"CONTINUAR →":"VER JORNADA"}</button>
    </div>
    <div class="journey-simple">
      <span class="eyebrow">SUA JORNADA</span><h2>21 treinamentos • 5 fases</h2>
      <div class="sub">Avance em sequência. Os próximos treinamentos serão liberados conforme sua jornada.</div>
      <div class="phase-row">${phases.map((v,i)=>{
        let nodes="";
        for(let n=v[2];n<v[3];n++){
          const done=state.completed.includes(n),u=unlocked(n);
          nodes+=`<button class="dice-node ${done?"done":n===next?"current":u?"":"locked"}" data-phase-track="${n}" ${u?"":"disabled"}>${n+1}</button>`;
        }
        return `<div class="phase-box ${i===active?"active":""}">
          <div class="phase-head"><div class="phase-num">${v[0]}</div><div><strong>${v[1]}</strong><small>${v[2]+1}–${v[3]}</small></div></div>
          <div class="dice-track">${nodes}</div>
          <div class="phase-label">${i===active?"Você está aqui":"Continue a sequência para liberar esta fase."}</div>
        </div>`;
      }).join("")}</div>
    </div>
    <div class="field-bottom">
      <div class="field-tile" id="allTrainings"><strong>📚 Meus treinamentos</strong><span>Veja os 21 treinamentos da Academia.</span></div>
      <div class="field-tile" id="goCerts"><strong>🏆 Meus certificados</strong><span>Consulte suas conclusões.</span></div>
      <div class="field-tile" id="goRanking"><strong>🏅 Ranking</strong><span>Veja sua posição e XP.</span></div>
    </div>
  </section>`;
  document.querySelectorAll("[data-phase-track]").forEach(b=>b.onclick=()=>openTraining(Number(b.dataset.phaseTrack)));
  $("continueBtn").onclick=()=>{if(!state.profile){openLogin();return}next<21?openTraining(next):showJourney()};
  $("allTrainings").onclick=showTrainings;$("goCerts").onclick=showCertificates;$("goRanking").onclick=showRanking;
}

function courseHtml(t,i){
  const done=state.completed.includes(i),u=unlocked(i);
  return `<article class="course ${u?"":"locked"}"><div class="course-img" style="background-image:linear-gradient(145deg,#05101c22,#02091099),url('${t.slides[0].image}')"><span>${t.icon||"•"} ${String(t.id).padStart(2,"0")}</span></div><div class="course-body"><small class="eyebrow">${esc(t.phase)}</small><h3>${esc(t.title)}</h3><p>${esc(t.description)}</p><div class="progress"><span style="width:${done?100:0}%"></span></div><div class="course-foot"><span class="tag">${done?"✓ CONCLUÍDO":u?"DISPONÍVEL":"🔒 BLOQUEADO"}</span><button class="primary btnStart" data-i="${i}" ${u?"":"disabled"}>${done?"REVER":"INICIAR"}</button></div></div></article>`;
}
function bindCourseButtons(){document.querySelectorAll(".btnStart").forEach(b=>b.onclick=()=>openTraining(Number(b.dataset.i)))}
function showTrainings(){if(!state.profile){openLogin();return}$("appMain").innerHTML=`<section class="view"><span class="eyebrow">TREINAMENTOS</span><h1>Meus treinamentos</h1><p>21 conteúdos. Um passo de cada vez.</p><div class="cards">${content().map(courseHtml).join("")}</div></section>`;bindCourseButtons()}
function showJourney(){if(!state.profile){openLogin();return}const d=state.completed.length;$("appMain").innerHTML=`<section class="view"><span class="eyebrow">MINHA JORNADA</span><h1>${d}/21 concluídos</h1><div class="panel"><b>${Math.round(d/21*100)}%</b><div class="progress" style="height:12px;margin-top:10px"><span style="width:${d/21*100}%"></span></div></div><div class="cards">${content().map(courseHtml).join("")}</div></section>`;bindCourseButtons()}

async function showCertificates(){
  if(!state.profile){openLogin();return}
  const items=state.completed.map(i=>content()[i]);
  $("appMain").innerHTML=`<section class="view"><span class="eyebrow">MEUS CERTIFICADOS</span><h1>${items.length} certificado(s)</h1><div class="cert-list">${items.length?items.map((t,k)=>`<div class="panel cert-row"><div><span class="eyebrow">TREINAMENTO ${String(state.completed[k]+1).padStart(2,"0")}</span><h3>${esc(t.title)}</h3><p>Participação registrada.</p></div><button class="primary" data-cert="${state.completed[k]}">VER</button></div>`).join(""):'<div class="panel">Nenhum certificado ainda.</div>'}</div></section>`;
  document.querySelectorAll("[data-cert]").forEach(b=>b.onclick=()=>showCertificate(Number(b.dataset.cert)));
}
function showRanking(){if(!state.profile){openLogin();return}$("appMain").innerHTML=`<section class="view"><span class="eyebrow">RANKING</span><h1>Ranking da segurança</h1><div class="panel"><h3>${esc(state.profile.full_name)}</h3><p>${state.xp||0} XP • ${rank(state.xp||0)}</p></div></section>`}

async function showAdminDashboard(){
  if(!isAdmin()){openLogin();return}
  if(!db){alert("Banco não conectado.");return}
  const r=await db.rpc("academia_admin_dashboard",{p_profile_id:profileId});
  if(r.error){alert(r.error.message);return}
  const d=r.data||{};
  $("appMain").innerHTML=`<section class="view"><span class="eyebrow">ADMIN • EVOLUÇÃO DA EQUIPE</span><h1>Visão de evolução</h1><p>Acompanhamento da jornada de segurança da equipe.</p>
  <div class="admin-stats"><div class="stat"><small>COLABORADORES</small><b>${d.collaborators||0}</b></div><div class="stat"><small>CONCLUSÕES</small><b>${d.completed||0}</b></div><div class="stat"><small>MÉDIA</small><b>${d.avg_score||0}%</b></div><div class="stat"><small>CERTIFICADOS</small><b>${d.certificates||0}</b></div></div>
  <div class="admin-grid"><div class="panel"><h3>Evolução semanal</h3><div class="weekly">${(d.weekly||[]).map(w=>`<div class="weekbar"><span style="height:${Math.max(8,Math.min(100,(w.completed||0)*8))}%"></span><small>${esc(w.label)}</small><b>${w.completed||0}</b></div>`).join("")}</div></div>
  <div class="panel"><h3>Acompanhamento</h3><div class="attention">${(d.people||[]).filter(p=>Number(p.completed||0)<3).slice(0,8).map(p=>`<div><b>${esc(p.full_name)}</b><span>${p.completed||0}/21 • ${p.avg_score||0}%</span></div>`).join("")||"<p>Nenhum alerta de progresso.</p>"}</div></div></div>
  <div class="panel" style="margin-top:12px"><h3>Evolução individual</h3><div class="table-wrap"><table><thead><tr><th>Colaborador</th><th>Matrícula</th><th>Progresso</th><th>Média</th><th>XP</th></tr></thead><tbody>${(d.people||[]).map(p=>`<tr><td>${esc(p.full_name)}</td><td>${esc(p.employee_code)}</td><td>${p.completed||0}/21</td><td>${p.avg_score||0}%</td><td>${p.xp||0}</td></tr>`).join("")}</tbody></table></div></div></section>`;
}

function openLogin(){$("loginModal").classList.add("show");setTimeout(()=>$("loginMat").focus(),100)}
function openProfile(){
  if(!state.profile){openLogin();return}
  const p=state.profile;
  $("profileBody").innerHTML=`<div class="panel"><b>${esc(p.full_name)}</b><p>Matrícula: ${esc(p.employee_code)}</p><p>Cargo: ${esc(p.job_title||"—")}</p><p>Unidade: ${esc(p.plant||"—")}</p><p>XP: ${state.xp||0} • ${rank(state.xp||0)}</p><button class="secondary wide" id="logoutBtn">SAIR</button></div>`;
  $("profileModal").classList.add("show");
  $("logoutBtn").onclick=()=>{state={profile:null,completed:[],progress:{},xp:0};profileId=null;save();$("profileModal").classList.remove("show");render()};
}
function openTraining(i){
  if(!state.profile){openLogin();return}
  if(!unlocked(i)){alert("Este treinamento ainda não está liberado pela jornada semanal.");return}
  currentTrack=i;slide=0;quizIndex=0;quizScore=0;checkpointPassed={};caseDone=false;renderLesson();$("trainingModal").classList.add("show");
}
function renderLesson(){
  const t=content()[currentTrack];
  $("lessonEyebrow").textContent=`TREINAMENTO ${String(t.id).padStart(2,"0")} • ${t.phase}`;
  $("lessonTitle").textContent=t.title;$("lessonDesc").textContent=t.description;
  $("lessonDuration").textContent=(t.duration||25)+" min";$("lessonSlidesCount").textContent=t.slides.length+" slides";
  $("lessonUserName").textContent=state.profile?.full_name||"COLABORADOR";$("lessonXp").textContent=(state.xp||0)+" XP";
  $("lessonLevel").textContent="NÍVEL "+String(Math.floor((state.xp||0)/100)+1).padStart(2,"0");
  $("outlineCount").textContent=t.slides.length+" SLIDES";renderTrackList();renderOutline();renderTab("aula");updateProgress();
}
function renderTrackList(){
  $("lessonTrackList").innerHTML=content().map((t,i)=>{const done=state.completed.includes(i),u=unlocked(i);return `<button class="track-item ${i===currentTrack?"active":""} ${done?"done":""}" data-ti="${i}" ${u?"":"disabled"}><span>${String(i+1).padStart(2,"0")}</span><b>${esc(t.title)}</b><i>${done?"✓":u?"›":"🔒"}</i></button>`}).join("");
  document.querySelectorAll("[data-ti]").forEach(b=>b.onclick=()=>openTraining(Number(b.dataset.ti)));
}
function renderOutline(){
  const t=content()[currentTrack];
  $("lessonOutline").innerHTML=t.slides.map((s,i)=>`<div class="outline-item ${i===slide?"current":""} ${i<slide?"seen":""}"><span>${i+1}</span><b>${esc(s.title)}</b></div>`).join("");
}
function updateProgress(){
  const t=content()[currentTrack],pct=Math.round(((slide+1)/t.slides.length)*100);
  $("lessonProgressPct").textContent=pct+"%";$("lessonProgressText").textContent=(slide+1)+"/"+t.slides.length;
  document.querySelector(".progress-ring").style.setProperty("--pct",pct+"%");
}
function inlineVideo(t){if(!t.video)return"";return `<div class="inline-video"><div><span class="eyebrow">VÍDEO DO TEMA</span><h4>${esc(t.video.title)}</h4><p>Material complementar diretamente relacionado ao treinamento.</p></div><iframe src="https://www.youtube-nocookie.com/embed/${t.video.id}?rel=0" title="${esc(t.video.title)}" allowfullscreen></iframe></div>`}

function renderTab(tab){
  const t=content()[currentTrack];
  if(tab==="aula")renderSlide(t);
  else if(tab==="caso")renderCase(t);
  else if(tab==="materiais")renderMaterials(t);
  else if(tab==="avaliacao"){
    if(slide<t.slides.length-1){alert("Conclua todos os slides antes da avaliação.");renderSlide(t);return}
    if(!caseDone){alert("Conclua o caso prático antes da avaliação.");renderCase(t);return}
    renderQuiz(t);
  }else if(tab==="certificado")showCertificate(currentTrack);
}
function renderSlide(t){
  const s=t.slides[slide];
  const cpDone=!s.checkpoint||checkpointPassed[slide];
  const last=slide===t.slides.length-1;
  const nextLabel=last?(caseDone?"IR PARA AVALIAÇÃO":"IR PARA CASO PRÁTICO"):"PRÓXIMO →";
  $("lessonArea").innerHTML=`<div class="slide-card"><div class="slide-copy"><span class="eyebrow">SLIDE ${slide+1} / ${t.slides.length}</span><h3>${esc(s.title)}</h3><p>${esc(s.body)}</p><ul>${(s.bullets||[]).map(x=>`<li>${esc(x)}</li>`).join("")}</ul>${s.checkpoint?`<div class="checkpoint"><span>CHECKPOINT</span><p>${esc(s.checkpointQuestion||"Responda antes de avançar.")}</p><button class="secondary" id="checkpointBtn">${checkpointPassed[slide]?"✓ CONCLUÍDO":"RESPONDER"}</button></div>`:""}</div><div class="slide-img" style="background-image:linear-gradient(145deg,#07172311,#030a1199),url('${s.image}')"></div></div>${inlineVideo(t)}<div class="lesson-nav"><button class="secondary" id="prev" ${slide===0?"disabled":""}>← ANTERIOR</button><span>${slide+1} / ${t.slides.length}</span><button class="primary" id="next" ${s.checkpoint&&!cpDone?"disabled":""}>${nextLabel}</button></div>`;
  if(s.checkpoint)$("checkpointBtn").onclick=()=>checkpoint(s);
  $("prev").onclick=()=>{if(slide>0){slide--;renderLesson()}};
  $("next").onclick=()=>{
    if(s.checkpoint&&!checkpointPassed[slide]){checkpoint(s);return}
    if(!last){slide++;renderLesson();return}
    const pending=t.slides.map((x,i)=>x.checkpoint&&!checkpointPassed[i]?i:null).filter(x=>x!==null);
    if(pending.length){slide=pending[0];renderLesson();alert("Conclua os checkpoints antes de seguir para o caso prático.");return}
    if(!caseDone){document.querySelector('[data-tab="caso"]').click();return}
    document.querySelector('[data-tab="avaliacao"]').click();
  };
}
function checkpoint(s){
  const correct=s.checkpointAnswer||"Aplicar o controle previsto, verificar a condição segura e comunicar qualquer desvio.";
  const options=[correct,"Continuar com base no hábito da equipe, sem rever a condição.","Improvisar uma solução e comunicar apenas depois.","Ignorar a mudança porque o serviço já começou."];
  const modal=document.createElement("div");modal.className="checkpoint-modal";
  modal.innerHTML=`<div class="checkpoint-box"><span class="eyebrow">CHECKPOINT DE FIXAÇÃO</span><h3>${esc(s.checkpointQuestion||"Qual é a decisão mais segura?")}</h3>${options.map((o,i)=>`<button data-cp="${i}">${esc(o)}</button>`).join("")}<div id="cpf"></div></div>`;
  document.body.appendChild(modal);
  modal.querySelectorAll("[data-cp]").forEach(b=>b.onclick=()=>{
    const ok=Number(b.dataset.cp)===0;
    modal.querySelector("#cpf").textContent=ok?"✓ Correto. Você pode avançar.":"⚠ Revise o bloco e tente novamente.";
    if(ok){checkpointPassed[slide]=true;setTimeout(()=>{modal.remove();renderLesson()},450);}
  });
}
function renderCase(t){
  const c=t.case||{};
  $("lessonArea").innerHTML=`<div class="case"><div class="panel"><span class="eyebrow">CASO PRÁTICO • TREINAMENTO ${String(t.id).padStart(2,"0")}</span><h2>${esc(c.title||"Situação de campo")}</h2><p>${esc(c.scenario||"Uma condição diferente da prevista apareceu durante a atividade.")}</p><p><b>${esc(c.question||"Qual deve ser a primeira decisão da equipe?")}</b></p></div><div class="panel" id="caseChoices">${(c.options||[]).map((o,i)=>`<button class="choice" data-case="${i}">${esc(o.text)}</button>`).join("")}<div id="caseFeedback"></div></div></div>`;
  document.querySelectorAll("[data-case]").forEach(b=>b.onclick=()=>{
    const item=c.options[Number(b.dataset.case)];
    document.querySelectorAll("[data-case]").forEach(x=>x.disabled=true);
    if(item&&item.correct){
      b.classList.add("correct");caseDone=true;
      $("caseFeedback").innerHTML=`<div class="quiz-result pass">✓ Caso concluído. O treinamento está liberado para a avaliação final.</div><button class="primary wide" id="caseNext">IR PARA AVALIAÇÃO →</button>`;
      $("caseNext").onclick=()=>document.querySelector('[data-tab="avaliacao"]').click();
    }else{
      b.classList.add("wrong");
      $("caseFeedback").innerHTML=`<div class="quiz-result fail">✗ Essa decisão mantém uma exposição sem controle. Revise o conteúdo e tente novamente.</div><button class="secondary wide" id="caseRetry">TENTAR NOVAMENTE</button>`;
      $("caseRetry").onclick=()=>renderCase(t);
    }
  });
}
function renderMaterials(t){
  $("lessonArea").innerHTML=`<div class="materials-grid"><div class="ref-card"><h3>Base de estudo</h3><ul><li>15 slides técnicos do treinamento</li><li>3 checkpoints de fixação</li><li>1 caso prático de campo</li><li>10 questões de avaliação final</li><li>Procedimentos internos e manuais aplicáveis à instalação</li></ul></div><div class="ref-card"><h3>Referências técnicas e legais</h3><ul>${(t.references||[]).map(r=>`<li>${esc(r)}</li>`).join("")}</ul><p class="ref-note">Normas ABNT e documentos de fabricante devem ser consultados em suas edições vigentes e aplicáveis ao equipamento.</p></div></div>`;
}
function renderQuiz(t){
  const q=t.questions||[];
  if(quizIndex>=q.length){finishQuiz(t);return}
  const item=q[quizIndex];
  $("lessonArea").innerHTML=`<div class="quiz-card"><span class="eyebrow">AVALIAÇÃO FINAL • ${quizIndex+1}/${q.length}</span><div class="quiz-q">${esc(item.q)}</div><div>${item.options.map((o,i)=>`<button class="choice" data-q="${i}">${esc(o)}</button>`).join("")}</div><div id="quizFeedback"></div></div>`;
  document.querySelectorAll("[data-q]").forEach(b=>b.onclick=()=>answerQuiz(t,Number(b.dataset.q)));
}
function answerQuiz(t,n){
  const q=t.questions[quizIndex],ok=n===q.correct;
  document.querySelectorAll("[data-q]").forEach(b=>b.disabled=true);
  const b=document.querySelector(`[data-q="${n}"]`);b.classList.add(ok?"correct":"wrong");
  if(ok)quizScore++;
  $("quizFeedback").innerHTML=`<div class="quiz-result ${ok?"pass":"fail"}">${ok?"✓ Correto. ":"✗ Não é a alternativa segura. "}${esc(q.a||"Revise o conteúdo.")}</div><button class="primary wide" id="quizNext">CONTINUAR →</button>`;
  $("quizNext").onclick=()=>{quizIndex++;renderQuiz(t)};
}
async function finishQuiz(t){
  const score=Math.round((quizScore/t.questions.length)*100);
  if(score>=70){
    $("lessonArea").innerHTML=`<div class="quiz-card"><span class="eyebrow">APROVADO</span><h2>${score}% — treinamento concluído</h2><p>Você atingiu o mínimo de 70%. Seu certificado de participação será liberado.</p><button class="primary" id="completeBtn">CONCLUIR E GERAR CERTIFICADO</button></div>`;
    $("completeBtn").onclick=()=>completeTraining(currentTrack,score);
  }else{
    $("lessonArea").innerHTML=`<div class="quiz-card"><span class="eyebrow">REPROVADO</span><h2>${score}%</h2><p>O mínimo é 70%. Conforme a regra da Academia, você deverá refazer o treinamento completo desde o primeiro slide.</p><button class="primary" id="redoBtn">REFAZER DESDE O SLIDE 1</button></div>`;
    $("redoBtn").onclick=()=>{slide=0;quizIndex=0;quizScore=0;checkpointPassed={};caseDone=false;renderLesson()};
  }
}
async function completeTraining(i,score){
  if(!db||!profileId){alert("Seu perfil ainda não está conectado ao banco.");return}
  const code="OMS-P-"+String(i+1).padStart(2,"0")+"-"+(state.profile.full_name||"COLABORADOR").replace(/\W/g,"").slice(0,8).toUpperCase()+"-"+Date.now().toString(36).toUpperCase();
  const r=await db.rpc("academia_complete_training",{p_profile_id:profileId,p_track_number:i+1,p_certificate_code:code,p_score:score});
  if(r.error){alert("Não foi possível registrar: "+r.error.message);return}
  await loadProgress();$("trainingModal").classList.remove("show");showCertificate(i,code);
}
function showCertificate(i,code){
  const p=state.profile||{},t=content()[i];
  const c=code||"OMS-P-"+String(i+1).padStart(2,"0")+"-"+Date.now().toString(36).toUpperCase();
  const w=window.open("","_blank","width=1100,height=780");
  if(!w){alert("Permita pop-ups para visualizar o certificado.");return}
  const date=new Date().toLocaleDateString("pt-BR",{day:"2-digit",month:"long",year:"numeric"});
  w.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Certificado O&M Solar</title><style>
  *{box-sizing:border-box}body{margin:0;background:#06111e;font-family:Arial,Segoe UI,sans-serif;color:#102437;display:grid;place-items:center;min-height:100vh;padding:25px}
  .cert{width:100%;max-width:1000px;min-height:650px;background:linear-gradient(135deg,#f9fcff,#edf5fa);position:relative;overflow:hidden;border:1px solid #789aae;box-shadow:0 25px 80px #0008;padding:52px 70px;text-align:center}
  .cert:before{content:"";position:absolute;inset:13px;border:2px solid #173c57;opacity:.65}.orb{position:absolute;width:190px;height:190px;border-radius:50%;right:-65px;top:-65px;background:#35d9a044}.orb2{position:absolute;width:150px;height:150px;border-radius:50%;left:-55px;bottom:-55px;background:#168fc733}
  .logo{width:175px;height:70px;object-fit:contain;position:relative;z-index:1}.kicker{font-size:13px;letter-spacing:2.5px;color:#087aa7;font-weight:800;margin-top:10px}.title{font-size:38px;letter-spacing:1px;margin:12px 0 7px;color:#09283e}.sub{font-size:14px;color:#5e7586}.name{font-size:38px;font-weight:800;color:#09283e;margin:28px 0 7px}.course{font-size:20px;font-weight:700;color:#087aa7;margin:14px auto;max-width:760px}.info{display:flex;justify-content:center;gap:25px;flex-wrap:wrap;margin:20px 0;color:#405a6b;font-size:12px}.badge{display:inline-block;padding:9px 18px;border-radius:999px;background:#d9f5e9;border:1px solid #55c99b;color:#086c4c;font-size:11px;font-weight:800;letter-spacing:1px}.note{max-width:760px;margin:23px auto 7px;font-size:11px;line-height:1.5;color:#687d8c}.code{font-family:monospace;font-size:10px;color:#8093a0;margin-top:13px}.print{position:fixed;right:18px;bottom:18px;background:#087aa7;color:#fff;border:0;border-radius:9px;padding:11px 17px;font-weight:800}@media print{body{background:#fff;padding:0}.cert{max-width:none;width:100%;min-height:100vh;box-shadow:none}.print{display:none}}
  </style></head><body><div class="cert"><div class="orb"></div><div class="orb2"></div><img class="logo" src="https://alemec01-design.github.io/academia-seguranca-oem-solar/logo-om-solar.png"><div class="kicker">ACADEMIA DE SEGURANÇA O&M SOLAR</div><div class="title">CERTIFICADO DE PARTICIPAÇÃO</div><div class="sub">Instrução interna de segurança</div><div class="name">${esc(p.full_name||"Colaborador")}</div><div class="course">Participou e concluiu o treinamento<br><strong>${String(i+1).padStart(2,"0")} — ${esc(t?.title||"Treinamento de Segurança")}</strong></div><div class="info"><span><b>Matrícula:</b> ${esc(p.employee_code||"—")}</span><span><b>Cargo:</b> ${esc(p.job_title||"—")}</span><span><b>Unidade:</b> ${esc(p.plant||"—")}</span><span><b>Data:</b> ${date}</span></div><div class="badge">PARTICIPAÇÃO REGISTRADA • ACADEMIA O&M SOLAR</div><div class="note">Documento interno de participação e conclusão de treinamento da O&M Solar. Não possui validade como certificação legal, habilitação profissional ou certificado oficial de NR.</div><div class="code">Código de registro: ${esc(c)}</div></div><button class="print" onclick="window.print()">Imprimir / Salvar em PDF</button></body></html>`);
  w.document.close();
}

async function loadProgress(){
  if(!db||!profileId)return;
  const r=await db.rpc("academia_progress",{p_profile_id:profileId});
  if(r.error)return;
  state.completed=[];state.progress={};state.xp=0;
  (r.data||[]).forEach(x=>{state.progress[x.track_number-1]=x;if(x.status==="completed"){state.completed.push(x.track_number-1);state.xp+=Number(x.xp||0)}})
  state.completed.sort((a,b)=>a-b);save();render();
}
async function login(){
  const mat=$("loginMat").value.trim(),pin=$("loginPin").value.trim();
  if(!mat||!pin){$("loginNotice").textContent="Informe matrícula e PIN.";$("loginNotice").classList.remove("hidden");return}
  if(!db){$("loginNotice").textContent="Banco não configurado.";$("loginNotice").classList.remove("hidden");return}
  $("loginBtn").disabled=true;
  const r=await db.rpc("academia_login",{p_matricula:mat,p_pin:pin});
  $("loginBtn").disabled=false;
  if(r.error||!r.data?.length){$("loginNotice").textContent="Matrícula ou PIN inválido.";$("loginNotice").classList.remove("hidden");return}
  state.profile=r.data[0];profileId=state.profile.profile_id;state.completed=[];state.progress={};state.xp=0;save();
  $("loginNotice").classList.add("hidden");$("loginModal").classList.remove("show");await loadProgress();
}
function showTabFromClick(b){document.querySelectorAll(".lesson-tabs button").forEach(x=>x.classList.toggle("active",x===b));renderTab(b.dataset.tab)}
function showCertificateTab(){showCertificate(currentTrack)}

document.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>$(b.dataset.close).classList.remove("show"));
document.querySelectorAll(".topbar nav button").forEach(b=>b.onclick=()=>{const v=b.dataset.view;if(v==="home")home();if(v==="journey")showJourney();if(v==="trainings")showTrainings();if(v==="certs")showCertificates();if(v==="ranking")showRanking();if(v==="admin")showAdminDashboard()});
$("profileBtn").onclick=openProfile;$("loginBtn").onclick=login;
$("loginPin").addEventListener("keydown",e=>{if(e.key==="Enter")login()});
$("backTrainings").onclick=()=>{$("trainingModal").classList.remove("show");showTrainings()};
$("lessonContinue").onclick=()=>{const t=content()[currentTrack];if(slide<t.slides.length-1){slide++;renderLesson()}else{document.querySelector('[data-tab="avaliacao"]').click()}};
document.querySelectorAll(".lesson-tabs button").forEach(b=>b.onclick=()=>showTabFromClick(b));

if(db){
  db.auth?.getSession?.().catch(()=>{});
}
if(state.profile){loadProgress()}else{render();openLogin()}
})();