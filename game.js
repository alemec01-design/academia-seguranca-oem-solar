(() => {
"use strict";
const $=id=>document.getElementById(id), KEY="omSolarSafetyV4";
const tracks=[
["NR-10 • O primeiro contato","Zona Elétrica","⚡"],
["CC x CA • O perigo invisível","Campo Fotovoltaico","☀️"],
["LOTO • Controle total","Sala de Bloqueio","🔒"],
["Arco elétrico • Reação","Subestação","🔥"],
["NR-35 • Altura","Torre de Acesso","🪜"],
["Tracker • Zona de movimento","Campo de Trackers","⚙️"],
["EPI/EPC • Arsenal","Almoxarifado","🛡️"],
["Ferramentas • Equipamento certo","Oficina","🧰"],
["Potência • Transformadores e inversores","Casa Elétrica","🔌"],
["Emergência • Incêndio","Ponto de Emergência","🚒"],
["Calor • Sobreviva ao turno","Zona Solar","🌡️"],
["Clima • Raios e ventos","Centro Meteorológico","⛈️"],
["Fauna • Área rural","Área Rural","🐍"],
["Químicos • FDS","Área Ambiental","🧪"],
["Direção • Chegue inteiro","Garagem","🚗"],
["APR • Veja antes de fazer","Planejamento","👁️"],
["Quase acidente • Fale antes","Centro de Segurança","🚨"],
["COG • Comunicação","Centro de Operações","📡"],
["Fadiga • Seu cérebro também trabalha","Base Operacional","🧠"],
["Primeiros socorros • Resposta","Ponto Médico","⛑️"],
["Regras de Ouro • Guardião","Portal Final","🏆"]
];
const questions=[
["Você recebe uma ordem para intervir em um circuito. Qual é a primeira decisão?","Identificar fontes, controlar a energia e verificar a condição segura.",["Começar imediatamente","Identificar fontes, controlar a energia e verificar a condição segura.","Pedir para alguém olhar","Usar apenas EPI"],1],
["O inversor está desligado. O sistema FV está automaticamente sem tensão?","Não. Circuitos CC podem permanecer energizados com irradiância.",["Sim, sempre","Não. Circuitos CC podem permanecer energizados com irradiância.","Somente à noite","Somente se houver alarme"],1],
["A intervenção vai começar. O que o LOTO exige como princípio?","Isolar, bloquear, identificar e verificar o controle da energia conforme procedimento.",["Retirar a etiqueta","Isolar, bloquear, identificar e verificar o controle da energia conforme procedimento.","Somente desligar o disjuntor","Avisar depois"],1],
["Você percebe condição que pode gerar arco. Qual reação?","Interromper, afastar-se e aplicar o controle previsto no procedimento.",["Continuar com pressa","Interromper, afastar-se e aplicar o controle previsto no procedimento.","Abrir o painel para ver","Tirar o EPI"],1],
["O acesso em altura não está adequado. O que fazer?","Parar e corrigir o sistema de proteção antes de prosseguir.",["Improvisar","Parar e corrigir o sistema de proteção antes de prosseguir.","Pedir para outro fazer","Ir rápido"],1],
["O tracker começou a movimentar. Você está dentro da área. O que faz?","Sair da zona de risco e controlar a condição antes de intervir.",["Segurar o tracker","Sair da zona de risco e controlar a condição antes de intervir.","Correr para o motor","Ignorar"],1],
["Qual proteção deve ser priorizada?","Eliminação e controles coletivos; EPI complementa quando aplicável.",["Somente EPI","Eliminação e controles coletivos; EPI complementa quando aplicável.","Velocidade","Improviso"],1],
["Ferramenta com isolamento danificado:", "Retire de uso e trate conforme procedimento.",["Use com cuidado","Retire de uso e trate conforme procedimento.","Cubra com fita e continue","Empreste"],1],
["Temperatura fora do padrão em equipamento:", "Registre, comunique e avalie conforme procedimento.",["Ignore","Registre, comunique e avalie conforme procedimento.","Resfrie com água","Esconda"],1],
["Princípio de incêndio:", "Acione a resposta de emergência e siga o plano aplicável.",["Se arrisque","Acione a resposta de emergência e siga o plano aplicável.","Filme","Continue"],1],
["Calor intenso:", "Hidrate-se, faça pausas e controle a exposição.",["Evite pausas","Hidrate-se, faça pausas e controle a exposição.","Acelere","Ignore sintomas"],1],
["Raios na região:", "Interrompa atividades expostas quando houver condição insegura.",["Continue","Interrompa atividades expostas quando houver condição insegura.","Acelere","Ignore"],1],
["Animal peçonhento:", "Mantenha distância e acione orientação apropriada.",["Capture","Mantenha distância e acione orientação apropriada.","Pegue","Provoque"],1],
["Produto químico:", "Consulte rótulo e FDS/FISPQ antes do uso.",["Use pelo cheiro","Consulte rótulo e FDS/FISPQ antes do uso.","Misture","Ignore"],1],
["Direção defensiva:", "Antecipe riscos e adapte a condução.",["Velocidade","Antecipe riscos e adapte a condução.","Celular","Ignore checklist"],1],
["APR:", "Identifique perigos e defina controles antes da tarefa.",["Burocracia","Identifique perigos e defina controles antes da tarefa.","Substitua treinamento","Registre acidente"],1],
["Quase acidente:", "Comunique e use o evento para corrigir controles.",["Ignore","Comunique e use o evento para corrigir controles.","Espere repetir","Só fale se houver dano"],1],
["Comunicação COG/campo:", "Seja claro, objetivo e confirme entendimento.",["Ambígua","Seja claro, objetivo e confirme entendimento.","Sem risco","Somente informal"],1],
["Fadiga:", "Reduz atenção e aumenta a chance de erro.",["Melhora atenção","Reduz atenção e aumenta a chance de erro.","Não muda nada","Substitui descanso"],1],
["Emergência:", "Acione o plano e recursos aplicáveis sem se colocar em risco.",["Se arrisque","Acione o plano e recursos aplicáveis sem se colocar em risco.","Improvisar","Mover todos"],1],
["Cultura:", "Todos são responsáveis por comportamento seguro e liderança pelo exemplo.",["Só HSE","Todos são responsáveis por comportamento seguro e liderança pelo exemplo.","Só gestão","Só placas"],1]
];
let state;try{state=JSON.parse(localStorage.getItem(KEY)||"null")}catch(e){state=null}
if(!state)state={profile:{},completed:[],xp:0};
function save(){localStorage.setItem(KEY,JSON.stringify(state));render()}
function unlocked(i){if(i===0&&!state.profile.start)return true;if(!state.profile.start)return false;const a=new Date(state.profile.start+"T00:00:00"),b=new Date();b.setHours(0,0,0,0);return Math.floor((b-a)/86400000)>=i*7}
function rank(x){return x<200?"RECRUTA":x<500?"OPERADOR":x<900?"GUARDIÃO":x<1500?"VETERANO":"MESTRE"}
function render(){
 const done=state.completed.length,x=state.xp||0;
 $("xp").textContent=x;$("level").textContent=String(Math.floor(x/100)+1).padStart(2,"0");$("xpFill").style.width=(x%100)+"%";
 $("missionsDone").textContent=`${done}/21`;$("rankName").textContent=rank(x);
 const badges=[["⚡","Elétrico",0],["🔒","LOTO",2],["🪜","Altura",4],["🔥","Emergência",9],["🚗","Motorista",14],["👁️","Olho de Águia",15],["🏆","Guardião",20]];
 $("badgeCount").textContent=badges.filter(b=>done>b[2]).length+"/7";$("badgeProgress").textContent=badges.filter(b=>done>b[2]).length+"/7";
 $("badges").innerHTML=badges.map(b=>`<div class="badge ${done>b[2]?"":"off"}">${b[0]}<small>${b[1]}</small></div>`).join("");
 $("playerName").textContent=state.profile.name?state.profile.name.split(" ")[0].toUpperCase():"GUARDIÃO";
 $("streak").textContent=done?Math.min(done,7):0;
 const next=Math.max(0,tracks.findIndex((_,i)=>!state.completed.includes(i)));
 $("nextTitle").textContent=tracks[next][0];$("nextDesc").textContent=tracks[next][1];
 $("unlockName").textContent=next>=20?"PORTAL FINAL":"FASE "+String(next+1).padStart(2,"0");
 $("unlockText").textContent=next===0?"Sua primeira missão está pronta.":"Complete a missão atual para liberar a próxima.";
 $("unlockFill").style.width=Math.max(5,Math.round(done/21*100))+"%";
 renderWorlds();
}
function renderWorlds(){
 const el=$("worlds");el.innerHTML="";
 tracks.forEach((t,i)=>{
  const d=state.completed.includes(i),u=unlocked(i),w=document.createElement("div");w.className=`world ${d?"done":u?"available":"locked"}`;
  w.innerHTML=`<div class="node">${u&&!d?'<span class="ping"></span>':''}${d?"✓":u?t[2]:"🔒"}</div><h4>${i+1}. ${esc(t[0].split("•")[0])}</h4><small>${esc(t[1])}</small>${u&&!d?'<span class="tag">JOGAR AGORA</span>':d?'<span class="tag">CONCLUÍDA</span>':""}`;
  w.addEventListener("click",()=>{if(u)openTraining(i)});el.appendChild(w);
 });
}
function openProfile(){
 $("pName").value=state.profile.name||"";$("pMat").value=state.profile.mat||"";$("pRole").value=state.profile.role||"";$("pUnit").value=state.profile.unit||"";$("pStart").value=state.profile.start||"";$("profilePreview").textContent=state.profile.name||"Novo Guardião";
 $("profileModal").classList.add("show");
}
function saveProfile(){
 const name=$("pName").value.trim(),start=$("pStart").value;
 if(!name||!start){alert("Preencha nome e data de admissão.");return}
 state.profile={name,mat:$("pMat").value.trim(),role:$("pRole").value.trim(),unit:$("pUnit").value.trim(),start};save();$("profileModal").classList.remove("show");alert("Guardião cadastrado. Sua jornada começou!");
}
function openTraining(i){
 const t=tracks[i],q=questions[i];$("mEyebrow").textContent=`TREINAMENTO ${String(i+1).padStart(2,"0")} • ${t[2]} • +100 XP`;$("mTitle").textContent=t[0];
 $("missionBody").innerHTML=`<div class="phase"><span class="eyebrow">BRIEFING DE CAMPO</span><h3>Você está entrando na ${esc(t[1])}.</h3><p>Observe o cenário. Não existe prêmio por ser rápido; existe prêmio por tomar a decisão segura.</p></div>
 <div class="phase"><span class="eyebrow">EVENTO</span><p>${esc(q[0])}</p><div id="choices"></div><div id="feedback" class="notice hidden"></div></div>
 <div class="phase hidden" id="win"><span class="eyebrow">CHECKPOINT CONQUISTADO</span><h3>Zona segura!</h3><p>${esc(q[1])}</p><button class="btn primary" id="finish">COLETAR +100 XP</button></div>`;
 q[2].forEach((a,n)=>{const b=document.createElement("button");b.className="choice";b.textContent=a;b.onclick=()=>answer(i,n,b);$("choices").appendChild(b)});
 $("missionModal").classList.add("show");
}
function answer(i,n,b){
 const q=questions[i],f=$("feedback");
 if(n===q[3]){b.classList.add("correct");f.textContent="✓ DECISÃO SEGURA. Você controlou o risco antes de agir.";f.classList.remove("hidden");$("win").classList.remove("hidden");$("choices").querySelectorAll("button").forEach(x=>x.disabled=true);$("finish").onclick=()=>complete(i)}
 else{b.classList.add("wrong");f.textContent="⚠ DECISÃO DE RISCO. Observe novamente e escolha uma ação que controle a exposição.";f.classList.remove("hidden");setTimeout(()=>b.classList.remove("wrong"),700)}
}
function complete(i){if(!state.completed.includes(i)){state.completed.push(i);state.xp+=100;save()}$("missionModal").classList.remove("show");certificate(i)}
function certificate(i){
 const p=state.profile,w=window.open("","_blank","width=900,height=800");if(!w){alert("Permita pop-ups.");return}
 const code=`OMS-${String(i+1).padStart(2,"0")}-${(p.name||"GUARDIAO").replace(/\W/g,"").slice(0,8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
 w.document.write(`<html><head><meta charset="utf-8"><title>Certificado O&M Solar</title><style>body{font-family:Arial;background:#e6edf2;padding:30px}.c{background:white;border:8px solid #0c3852;padding:55px;text-align:center;min-height:560px;color:#0a2232}.logo{width:180px;object-fit:contain}.name{font-size:34px;font-weight:bold;margin:25px}.small{font-size:12px;color:#536b78}button{margin:25px;padding:12px 18px;background:#0b4262;color:#fff;border:0;border-radius:8px}@media print{button{display:none}body{padding:0;background:white}}</style></head><body><div class="c"><img class="logo" src="assets/logo-om-solar.png"><h1>Certificado de Participação e Conclusão</h1><p>Academia de Segurança O&M Solar</p><div class="name">${esc(p.name)}</div><p>Concluiu a Treinamento ${String(i+1).padStart(2,"0")} — <b>${esc(tracks[i][0])}</b></p><p>Matrícula: ${esc(p.mat||"—")} • Cargo: ${esc(p.role||"—")} • Unidade: ${esc(p.unit||"—")}</p><p>Data: ${new Date().toLocaleDateString("pt-BR")}</p><p class="small">Certificado interno de participação e conclusão. Não constitui, por si só, certificação legal de NR.</p><p class="small">Código: ${code}</p><button onclick="window.print()">Imprimir / Salvar em PDF</button></div></body></html>`);w.document.close()
}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
document.addEventListener("DOMContentLoaded",()=>{
 $("profileBtn").onclick=openProfile;$("profileHero").onclick=openProfile;$("saveProfile").onclick=saveProfile;
 $("continueBtn").onclick=()=>{const i=tracks.findIndex((_,x)=>!state.completed.includes(x));openTraining(i<0?20:i)};$("missionBtn").onclick=()=>{const i=tracks.findIndex((_,x)=>!state.completed.includes(x));openTraining(i<0?20:i)};
 document.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>$(b.dataset.close).classList.remove("show"));render();
});
})();