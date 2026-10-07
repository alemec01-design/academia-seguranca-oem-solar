(()=>{"use strict";
const $=id=>document.getElementById(id),KEY="omSolarSafetyV4",cfg=window.OM_SUPABASE||{};
const db=window.supabase&&cfg.url&&cfg.publishableKey?window.supabase.createClient(cfg.url,cfg.publishableKey):null;

const tracks=[
["NR-10 • O primeiro contato","Zona Elétrica","⚡"],["CC x CA • O perigo invisível","Campo Fotovoltaico","☀️"],["LOTO • Controle total","Sala de Bloqueio","🔒"],["Arco elétrico • Reação","Subestação","🔥"],["NR-35 • Altura","Torre de Acesso","🪜"],["Tracker • Zona de movimento","Campo de Trackers","⚙️"],["EPI/EPC • Arsenal","Almoxarifado","🛡️"],["Ferramentas • Equipamento certo","Oficina","🧰"],["Potência • Transformadores e inversores","Casa Elétrica","🔌"],["Emergência • Incêndio","Ponto de Emergência","🚒"],["Calor • Sobreviva ao turno","Zona Solar","🌡️"],["Clima • Raios e ventos","Centro Meteorológico","⛈️"],["Fauna • Área rural","Área Rural","🐍"],["Químicos • FDS","Área Ambiental","🧪"],["Direção • Chegue inteiro","Garagem","🚗"],["APR • Veja antes de fazer","Planejamento","👁️"],["Quase acidente • Fale antes","Centro de Segurança","🚨"],["COG • Comunicação","Centro de Operações","📡"],["Fadiga • Seu cérebro também trabalha","Base Operacional","🧠"],["Primeiros socorros • Resposta","Ponto Médico","⛑️"],["Regras de Ouro • Guardião","Portal Final","🏆"]
];

const questions=[
["Você recebe uma ordem para intervir em um circuito. Qual é a primeira decisão?","Identificar fontes, controlar a energia e verificar a condição segura.",["Começar imediatamente","Identificar fontes, controlar a energia e verificar a condição segura.","Pedir para alguém olhar","Usar apenas EPI"],1],
["O inversor está desligado. O sistema FV está automaticamente sem tensão?","Não. Circuitos CC podem permanecer energizados com irradiância.",["Sim, sempre","Não. Circuitos CC podem permanecer energizados com irradiância.","Somente à noite","Somente se houver alarme"],1],
["A intervenção vai começar. O que o LOTO exige como princípio?","Isolar, bloquear, identificar e verificar o controle da energia conforme procedimento.",["Retirar a etiqueta","Isolar, bloquear, identificar e verificar o controle da energia conforme procedimento.","Somente desligar o disjuntor","Avisar depois"],1],
["Você percebe condição que pode gerar arco. Qual reação?","Interromper, afastar-se e aplicar o controle previsto no procedimento.",["Continuar com pressa","Interromper, afastar-se e aplicar o controle previsto no procedimento.","Abrir o painel para ver","Tirar o EPI"],1],
["O acesso em altura não está adequado. O que fazer?","Parar e corrigir o sistema de proteção antes de prosseguir.",["Improvisar","Parar e corrigir o sistema de proteção antes de prosseguir.","Pedir para outro fazer","Ir rápido"],1],
["O tracker começou a movimentar. Você está dentro da área. O que faz?","Sair da zona de risco e controlar a condição antes de intervir.",["Segurar o tracker","Sair da zona de risco e controlar a condição antes de intervir.","Correr para o motor","Ignorar"],1],
["Qual proteção deve ser priorizada?","Eliminação e controles coletivos; EPI complementa quando aplicável.",["Somente EPI","Eliminação e controles coletivos; EPI complementa quando aplicável.","Velocidade","Improviso"],1],
["Ferramenta com isolamento danificado:","Retire de uso e trate conforme procedimento.",["Use com cuidado","Retire de uso e trate conforme procedimento.","Cubra com fita e continue","Empreste"],1],
["Temperatura fora do padrão em equipamento:","Registre, comunique e avalie conforme procedimento.",["Ignore","Registre, comunique e avalie conforme procedimento.","Resfrie com água","Esconda"],1],
["Princípio de incêndio:","Acione a resposta de emergência e siga o plano aplicável.",["Se arrisque","Acione a resposta de emergência e siga o plano aplicável.","Filme","Continue"],1],
["Calor intenso:","Hidrate-se, faça pausas e controle a exposição.",["Evite pausas","Hidrate-se, faça pausas e controle a exposição.","Acelere","Ignore sintomas"],1],
["Raios na região:","Interrompa atividades expostas quando houver condição insegura.",["Continue","Interrompa atividades expostas quando houver condição insegura.","Acelere","Ignore"],1],
["Animal peçonhento:","Mantenha distância e acione orientação apropriada.",["Capture","Mantenha distância e acione orientação apropriada.","Pegue","Provoque"],1],
["Produto químico:","Consulte rótulo e FDS/FISPQ antes do uso.",["Use pelo cheiro","Consulte rótulo e FDS/FISPQ antes do uso.","Misture","Ignore"],1],
["Direção defensiva:","Antecipe riscos e adapte a condução.",["Velocidade","Antecipe riscos e adapte a condução.","Celular","Ignore checklist"],1],
["APR:","Identifique perigos e defina controles antes da tarefa.",["Burocracia","Identifique perigos e defina controles antes da tarefa.","Substitua treinamento","Registre acidente"],1],
["Quase acidente:","Comunique e use o evento para corrigir controles.",["Ignore","Comunique e use o evento para corrigir controles.","Espere repetir","Só fale se houver dano"],1],
["Comunicação COG/campo:","Seja claro, objetivo e confirme entendimento.",["Ambígua","Seja claro, objetivo e confirme entendimento.","Sem risco","Somente informal"],1],
["Fadiga:","Reduz atenção e aumenta a chance de erro.",["Melhora atenção","Reduz atenção e aumenta a chance de erro.","Não muda nada","Substitui descanso"],1],
["Emergência:","Acione o plano e recursos aplicáveis sem se colocar em risco.",["Se arrisque","Acione o plano e recursos aplicáveis sem se colocar em risco.","Improvisar","Mover todos"],1],
["Cultura:","Todos são responsáveis por comportamento seguro e liderança pelo exemplo.",["Só HSE","Todos são responsáveis por comportamento seguro e liderança pelo exemplo.","Só gestão","Só placas"],1]
];

let state={profile:{},completed:[],xp:0},user=null,profileId=null;

try{state=JSON.parse(localStorage.getItem(KEY)||"null")||state}catch(e){}
const saveLocal=()=>localStorage.setItem(KEY,JSON.stringify(state));
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const rank=x=>x<200?"RECRUTA":x<500?"OPERADOR":x<900?"GUARDIÃO":x<1500?"VETERANO":"MESTRE";

function unlocked(i){
  if(!state.profile.start)return i===0;
  const a=new Date(state.profile.start+"T00:00:00"),b=new Date();
  b.setHours(0,0,0,0);
  return Math.floor((b-a)/86400000)>=i*7;
}

function render(){
  const d=state.completed.length,x=state.xp||0;
  $("xp").textContent=x;
  $("level").textContent=String(Math.floor(x/100)+1).padStart(2,"0");
  $("xpFill").style.width=x%100+"%";
  $("missionsDone").textContent=d+"/21";
  $("rankName").textContent=rank(x);
  $("playerName").textContent=state.profile.name?state.profile.name.split(" ")[0].toUpperCase():"ENTRAR";
  $("streak").textContent=d?Math.min(d,7):0;

  const bs=[["⚡","Elétrico",0],["🔒","LOTO",2],["🪜","Altura",4],["🔥","Emergência",9],["🚗","Motorista",14],["👁️","Olho de Águia",15],["🏆","Guardião",20]];
  const n=bs.filter(b=>d>b[2]).length;
  $("badgeCount").textContent=n+"/7";
  $("badgeProgress").textContent=n+"/7";
  $("badges").innerHTML=bs.map(b=>'<div class="badge '+(d>b[2]?"":"off")+'">'+b[0]+"<small>"+b[1]+"</small></div>").join("");

  const next=Math.max(0,tracks.findIndex((_,i)=>!state.completed.includes(i)));
  $("nextTitle").textContent=tracks[next][0];
  $("nextDesc").textContent=tracks[next][1];
  $("unlockName").textContent=next>=20?"PORTAL FINAL":"FASE "+String(next+1).padStart(2,"0");
  $("unlockText").textContent=next===0?"Seu primeiro treinamento está pronto.":"Conclua o treinamento atual para liberar o próximo.";
  $("unlockFill").style.width=Math.max(5,Math.round(d/21*100))+"%";
  renderWorlds();
}

function renderWorlds(){
  const el=$("worlds");el.innerHTML="";
  tracks.forEach((t,i)=>{
    const d=state.completed.includes(i),u=unlocked(i),w=document.createElement("div");
    w.className="world "+(d?"done":u?"available":"locked");
    w.innerHTML='<div class="node">'+(d?"✓":u?t[2]:"🔒")+'</div><h4>'+(i+1)+". "+esc(t[0].split("•")[0])+'</h4><small>'+esc(t[1])+"</small>"+(u&&!d?'<span class="tag">TREINAR</span>':d?'<span class="tag">CONCLUÍDO</span>':"");
    w.onclick=()=>u&&openTraining(i);
    el.appendChild(w);
  });
}

function loginModal(){
  if($("loginModal"))return;
  const m=document.createElement("div");
  m.className="modal show";
  m.id="loginModal";
  m.innerHTML='<div class="modal-box profile-box login-access-box" style="max-width:520px;position:relative;z-index:9999;pointer-events:auto"><div class="modal-head"><div><span class="eyebrow">ACESSO À ACADEMIA</span><h2>Entrar</h2></div></div><div class="profile-hero"><div class="big-avatar">🛡️</div><div><h3>Academia de Segurança O&M Solar</h3><p>Use sua matrícula e senha.</p></div></div><div class="form-grid" style="position:relative;z-index:10000;pointer-events:auto"><label class="wide">Matrícula<input id="loginMat" type="text" inputmode="numeric" autocomplete="username" placeholder="Ex.: 1025" style="position:relative;z-index:10001;pointer-events:auto;user-select:text"></label><label class="wide">Senha<input id="loginPass" type="password" autocomplete="current-password" placeholder="Senha" style="position:relative;z-index:10001;pointer-events:auto;user-select:text"></label></div><div id="loginNotice" class="notice hidden"></div><button type="button" class="btn primary wide" id="loginBtn" style="position:relative;z-index:10001;pointer-events:auto">ENTRAR</button></div>';
  document.body.appendChild(m);

  const mat=$("loginMat"),pass=$("loginPass"),btn=$("loginBtn");
  btn.onclick=login;
  pass.onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();login()}};
  mat.onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();pass.focus()}};
  setTimeout(()=>mat.focus(),50);
}

/*
  IMPORTANTE:
  O login visual é por matrícula.
  Internamente, o Supabase Auth utiliza um identificador de e-mail
  técnico criado para cada matrícula.
*/
const authEmail=m=>String(m).trim().toLowerCase().replace(/[^a-z0-9_-]/g,"")+"@acesso.oemsolar.com.br";

async function login(){
  const m=$("loginMat").value.trim(),p=$("loginPass").value,n=$("loginNotice"),b=$("loginBtn");
  n.classList.add("hidden");

  if(!m||!p){
    n.textContent="Informe matrícula e senha.";
    n.classList.remove("hidden");
    return;
  }

  if(!db){
    n.textContent="Supabase não está conectado.";
    n.classList.remove("hidden");
    return;
  }

  b.disabled=true;
  b.textContent="ENTRANDO...";

  const r=await db.auth.signInWithPassword({
    email:authEmail(m),
    password:p
  });

  if(r.error){
    n.textContent="Matrícula ou senha inválida.";
    n.classList.remove("hidden");
    b.disabled=false;
    b.textContent="ENTRAR";
    return;
  }

  await loadProfile(r.data.user,m);
  $("loginModal").classList.remove("show");
  b.disabled=false;
  b.textContent="ENTRAR";
}

async function loadProfile(u,mat){
  user=u;
  const r=await db.from("profiles").select("*").eq("auth_user_id",u.id).maybeSingle();

  if(r.error){
    console.error(r.error);
    alert("Não foi possível carregar seu perfil.");
    return;
  }

  if(!r.data){
    state.profile={mat};
    state.completed=[];
    state.xp=0;
    openProfile(true);
    render();
    return;
  }

  profileId=r.data.id;
  state.profile={
    name:r.data.full_name,
    mat:r.data.employee_code||mat,
    role:r.data.job_title||"",
    unit:r.data.plant||"",
    start:r.data.admission_date
  };

  await loadProgress();
  render();
}

async function loadProgress(){
  if(!profileId)return;

  const r=await db.from("training_progress")
    .select("track_number,status,xp")
    .eq("profile_id",profileId);

  if(r.error){
    console.error(r.error);
    return;
  }

  state.completed=(r.data||[])
    .filter(x=>x.status==="completed")
    .map(x=>x.track_number-1)
    .sort((a,b)=>a-b);

  state.xp=(r.data||[])
    .reduce((s,x)=>s+(x.status==="completed"?Number(x.xp||0):0),0);

  saveLocal();
}

function openProfile(force){
  $("pName").value=state.profile.name||"";
  $("pMat").value=state.profile.mat||"";
  $("pRole").value=state.profile.role||"";
  $("pUnit").value=state.profile.unit||"";
  $("pStart").value=state.profile.start||"";
  $("profilePreview").textContent=state.profile.name||"Novo Guardião";
  $("pMat").disabled=!!state.profile.mat;
  $("saveProfile").textContent=force?"CRIAR PERFIL E ENTRAR":"SALVAR PERFIL";
  $("profileModal").classList.add("show");
}

async function saveProfile(){
  if(!db||!user){
    alert("Faça login primeiro.");
    return;
  }

  const name=$("pName").value.trim();
  const mat=$("pMat").value.trim();
  const role=$("pRole").value.trim();
  const unit=$("pUnit").value.trim();
  const start=$("pStart").value;

  if(!name||!mat||!start){
    alert("Preencha nome, matrícula e data de admissão.");
    return;
  }

  const payload={
    auth_user_id:user.id,
    full_name:name,
    employee_code:mat,
    job_title:role,
    plant:unit,
    admission_date:start
  };

  const r=profileId
    ?await db.from("profiles").update(payload).eq("id",profileId).select().single()
    :await db.from("profiles").insert(payload).select().single();

  if(r.error){
    alert("Não foi possível salvar o perfil: "+r.error.message);
    return;
  }

  profileId=r.data.id;
  state.profile={name,mat,role,unit,start};
  $("profileModal").classList.remove("show");
  await loadProgress();
  render();
}

function openTraining(i){
  if(!state.profile.start){
    openProfile(true);
    return;
  }

  if(!unlocked(i)){
    alert("Este treinamento ainda não está liberado pela sua data de admissão.");
    return;
  }

  const t=tracks[i],q=questions[i];

  $("mEyebrow").textContent="TREINAMENTO "+String(i+1).padStart(2,"0")+" • "+t[2]+" • +100 XP";
  $("mTitle").textContent=t[0];

  $("missionBody").innerHTML=
    '<div class="phase"><span class="eyebrow">BRIEFING</span><h3>Você está entrando na '+esc(t[1])+'.</h3><p>Observe o cenário. O objetivo é tomar a decisão segura.</p></div>'+
    '<div class="phase"><span class="eyebrow">DESAFIO DE FIXAÇÃO</span><p>'+esc(q[0])+'</p><div id="choices"></div><div id="feedback" class="notice hidden"></div></div>'+
    '<div class="phase hidden" id="win"><span class="eyebrow">TREINAMENTO CONCLUÍDO</span><h3>Zona segura!</h3><p>'+esc(q[1])+'</p><button class="btn primary" id="finish">CONCLUIR E REGISTRAR +100 XP</button></div>';

  q[2].forEach((a,n)=>{
    const b=document.createElement("button");
    b.className="choice";
    b.textContent=a;
    b.onclick=()=>answer(i,n,b);
    $("choices").appendChild(b);
  });

  $("missionModal").classList.add("show");
}

function answer(i,n,b){
  const q=questions[i],f=$("feedback");

  if(n===q[3]){
    b.classList.add("correct");
    f.textContent="✓ DECISÃO SEGURA.";
    f.classList.remove("hidden");
    $("win").classList.remove("hidden");
    $("choices").querySelectorAll("button").forEach(x=>x.disabled=true);
    $("finish").onclick=()=>complete(i);
  }else{
    b.classList.add("wrong");
    f.textContent="⚠ DECISÃO DE RISCO. Escolha uma ação que controle a exposição.";
    f.classList.remove("hidden");
    setTimeout(()=>b.classList.remove("wrong"),700);
  }
}

async function complete(i){
  if(state.completed.includes(i))return;

  if(!db||!profileId){
    alert("Seu perfil ainda não está conectado ao banco.");
    return;
  }

  const code="OMS-"+String(i+1).padStart(2,"0")+"-"+(state.profile.name||"GUARDIAO").replace(/\W/g,"").slice(0,8).toUpperCase()+"-"+Date.now().toString(36).toUpperCase();

  const p=await db.from("training_progress").upsert({
    profile_id:profileId,
    track_number:i+1,
    status:"completed",
    score:100,
    xp:100,
    completed_at:new Date().toISOString()
  },{onConflict:"profile_id,track_number"});

  if(p.error){
    alert("Não foi possível registrar o treinamento: "+p.error.message);
    return;
  }

  const c=await db.from("certificates").insert({
    profile_id:profileId,
    track_number:i+1,
    certificate_code:code
  });

  if(c.error)console.warn(c.error);

  await loadProgress();
  $("missionModal").classList.remove("show");
  certificate(i,code);
}

function certificate(i,code){
  const p=state.profile;
  const w=window.open("","_blank","width=900,height=800");

  if(!w){
    alert("Permita pop-ups para visualizar o certificado.");
    return;
  }

  w.document.write(
    '<html><head><meta charset="utf-8"><title>Certificado O&M Solar</title>'+
    '<style>body{font-family:Arial;background:#e6edf2;padding:30px}.c{background:#fff;border:8px solid #0c3852;padding:55px;text-align:center;min-height:560px;color:#0a2232}.logo{width:180px}.name{font-size:34px;font-weight:bold;margin:25px}.small{font-size:12px;color:#536b78}button{margin:25px;padding:12px 18px;background:#0b4262;color:#fff;border:0;border-radius:8px}@media print{button{display:none}body{padding:0;background:#fff}}</style></head><body>'+
    '<div class="c"><img class="logo" src="https://alemec01-design.github.io/academia-seguranca-oem-solar/logo-om-solar.png">'+
    '<h1>Certificado de Participação e Conclusão</h1>'+
    '<p>Academia de Segurança O&M Solar</p>'+
    '<div class="name">'+esc(p.name)+'</div>'+
    '<p>Concluiu o Treinamento '+String(i+1).padStart(2,"0")+' — <b>'+esc(tracks[i][0])+'</b></p>'+
    '<p>Matrícula: '+esc(p.mat||"—")+' • Cargo: '+esc(p.role||"—")+' • Unidade: '+esc(p.unit||"—")+'</p>'+
    '<p>Data: '+new Date().toLocaleDateString("pt-BR")+'</p>'+
    '<p class="small">Certificado interno de participação e conclusão. Não constitui, por si só, certificação legal de NR.</p>'+
    '<p class="small">Código: '+esc(code)+'</p>'+
    '<button onclick="window.print()">Imprimir / Salvar em PDF</button></div></body></html>'
  );

  w.document.close();
}

async function init(){
  loginModal();

  $("profileBtn").onclick=()=>user?openProfile():$("loginModal").classList.add("show");
  $("profileHero").onclick=()=>user?openProfile():$("loginModal").classList.add("show");
  $("saveProfile").onclick=saveProfile;

  $("continueBtn").onclick=()=>{
    openTraining(Math.max(0,tracks.findIndex((_,x)=>!state.completed.includes(x))));
  };

  $("missionBtn").onclick=()=>{
    openTraining(Math.max(0,tracks.findIndex((_,x)=>!state.completed.includes(x))));
  };

  document.querySelectorAll("[data-close]").forEach(b=>{
    b.onclick=()=>$(b.dataset.close).classList.remove("show");
  });

  render();

  if(!db){
    console.error("Supabase não configurado");
    return;
  }

  const s=await db.auth.getSession();

  if(s.data.session){
    await loadProfile(s.data.session.user);
    $("loginModal").classList.remove("show");
  }else{
    $("loginModal").classList.add("show");
  }

  db.auth.onAuthStateChange(async(e,s)=>{
    if(e==="SIGNED_OUT"){
      user=null;
      profileId=null;
      state={profile:{},completed:[],xp:0};
      render();
      $("loginModal").classList.add("show");
    }else if(e==="SIGNED_IN"&&s){
      await loadProfile(s.user);
      $("loginModal").classList.remove("show");
    }
  });
}

document.addEventListener("DOMContentLoaded",init);
})();
