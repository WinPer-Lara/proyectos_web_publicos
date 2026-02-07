/* Simuladores básicos para Conecta Mayor
   - Email simulator
   - Chat simulator
   - Video meeting simulator
   - Security checklist & quiz
   - Telemedicine scheduler
   Guarda datos en localStorage para persistencia simple.
*/
(function(){
  // Helpers
  function q(id, root=document){ return root.querySelector(id); }
  function qs(id, root=document){ return Array.from(root.querySelectorAll(id)); }

  /* Email simulator */
  function initEmailSimulator(rootId){
    const root = document.getElementById(rootId);
    if(!root) return;
    const STORAGE='cm_email_v1';
    let state = JSON.parse(localStorage.getItem(STORAGE) || '[]');

    function render(){
      const inbox = root.querySelector('.inbox-list');
      const sent = root.querySelector('.sent-list');
      if(inbox) inbox.innerHTML = state.filter(m=>m.folder==='inbox').map(m=>`<li class="list-group-item"><strong>${escapeHtml(m.from)}</strong>: ${escapeHtml(m.subject)}</li>`).join('') || '<li class="list-group-item text-muted">Sin mensajes</li>';
      if(sent) sent.innerHTML = state.filter(m=>m.folder==='sent').map(m=>`<li class="list-group-item"><strong>A:</strong> ${escapeHtml(m.to)} — ${escapeHtml(m.subject)}</li>`).join('') || '<li class="list-group-item text-muted">Sin mensajes enviados</li>';
    }

    function save(){ localStorage.setItem(STORAGE, JSON.stringify(state)); }

    function addMessage(folder, obj){ obj.folder = folder; obj.id = Date.now(); state.unshift(obj); save(); render(); }

    const form = root.querySelector('.compose-form');
    if(form){
      form.addEventListener('submit', e =>{
        e.preventDefault();
        const to = form.querySelector('[name=to]').value.trim();
        const subject = form.querySelector('[name=subject]').value.trim();
        const body = form.querySelector('[name=body]').value.trim();
        if(!to || !subject) return alert('Por favor completa "Para" y "Asunto".');
        addMessage('sent',{to,subject,body,from:'Tú'});
        // For demo, also push a simulated reply into inbox
        setTimeout(()=>{
          addMessage('inbox',{from: to, subject: 'RE: '+subject, body: 'Gracias por tu mensaje.'});
        },800);
        form.reset();
      });
    }

    // seed sample message
    if(state.length===0){
      state.push({id:1,folder:'inbox',from:'Servicio',subject:'Bienvenido a Conecta Mayor',body:'Este es un mensaje de prueba.'}); save();
    }
    render();
  }

  /* Chat simulator */
  function initChatSimulator(rootId){
    const root = document.getElementById(rootId);
    if(!root) return;
    const STORAGE='cm_chat_v1';
    let msgs = JSON.parse(localStorage.getItem(STORAGE) || '[]');
    const area = root.querySelector('.chat-messages');
    const input = root.querySelector('.chat-input');
    const btn = root.querySelector('.chat-send');

    function render(){
      if(!area) return;
      area.innerHTML = msgs.map(m=>`<div class="mb-2 ${m.from==='me'?'text-end':''}"><div class="d-inline-block p-2" style="background:${m.from==='me'?'var(--primary)':'#f1f5f9'};color:${m.from==='me'?'#fff':'#000'};border-radius:8px;max-width:80%;">${escapeHtml(m.text)}</div></div>`).join('');
      area.scrollTop = area.scrollHeight;
    }

    function save(){ localStorage.setItem(STORAGE, JSON.stringify(msgs)); }

    if(btn) btn.addEventListener('click', ()=>{
      const text = input.value.trim(); if(!text) return; msgs.push({from:'me',text}); save(); render(); input.value='';
      // auto-reply
      setTimeout(()=>{ msgs.push({from:'them',text:'(respuesta automática) Gracias, recibí tu mensaje.'}); save(); render(); },900);
    });

    if(input) input.addEventListener('keypress', e=>{ if(e.key==='Enter'){ e.preventDefault(); btn.click(); } });
    if(msgs.length===0) msgs.push({from:'them',text:'Hola, bienvenido al simulador de mensajería.'});
    render();
  }

  /* Video meeting simulator */
  function initVideoSimulator(rootId){
    const root = document.getElementById(rootId); if(!root) return;
    const joinBtn = root.querySelector('.join-meeting');
    const meetingArea = root.querySelector('.meeting-area');
    const video = root.querySelector('.meeting-video');
    if(joinBtn){
      joinBtn.addEventListener('click', ()=>{
        joinBtn.disabled = true; joinBtn.textContent = 'Conectando...';
        setTimeout(()=>{
          joinBtn.style.display = 'none';
          if(video) { video.style.display='block'; video.play().catch(()=>{}); }
          if(meetingArea) meetingArea.classList.add('border','p-2');
        },900);
      });
    }
  }

  /* Security checklist & quiz */
  function initSecuritySimulator(rootId){
    const root = document.getElementById(rootId); if(!root) return;
    const checklist = qs('.sec-check', root);
    const progress = root.querySelector('.sec-progress');
    function update(){
      const total = checklist.length; const done = checklist.filter(c=>c.checked).length; if(progress) progress.textContent = `${done}/${total} completado`;
    }
    checklist.forEach(cb=>cb.addEventListener('change', update)); update();

    // simple quiz
    const quizForm = root.querySelector('.sec-quiz');
    if(quizForm){
      quizForm.addEventListener('submit', e=>{
        e.preventDefault(); const answers = Array.from(quizForm.querySelectorAll('input[type=radio]:checked')).map(i=>i.value);
        let score = 0; if(answers[0]==='b') score++; if(answers[1]==='a') score++;
        alert(`Tu puntuación: ${score}/2`);
      });
    }
  }

  /* Telemedicine scheduler */
  function initTelemedicineSimulator(rootId){
    const root = document.getElementById(rootId); if(!root) return;
    const STORAGE='cm_tele_aps';
    let appts = JSON.parse(localStorage.getItem(STORAGE) || '[]');
    const list = root.querySelector('.appointments-list');
    const form = root.querySelector('.appt-form');

    function render(){
      if(!list) return; list.innerHTML = appts.map(a=>`<li class="list-group-item">${escapeHtml(a.name)} — ${escapeHtml(a.date)} ${escapeHtml(a.time)}</li>`).join('') || '<li class="list-group-item text-muted">No hay citas</li>';
    }
    if(form){
      form.addEventListener('submit', e=>{
        e.preventDefault(); const name=form.querySelector('[name=name]').value.trim(); const date=form.querySelector('[name=date]').value; const time=form.querySelector('[name=time]').value; if(!name||!date||!time) return alert('Completa todos los campos');
        appts.push({name,date,time}); localStorage.setItem(STORAGE, JSON.stringify(appts)); render(); form.reset();
      });
    }
    render();
  }

  // small helper to escape HTML
  function escapeHtml(s){ return String(s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

  // expose to global
  window.ConectaSim = { initEmailSimulator, initChatSimulator, initVideoSimulator, initSecuritySimulator, initTelemedicineSimulator };

})();

/* Additional simulators: banking, payments, home devices, voice assistant, gov services */
(function(){
  function qsel(s,root=document){ return root.querySelector(s); }
  function qsels(s,root=document){ return Array.from(root.querySelectorAll(s)); }

  function initBankSimulator(rootId){
    const root = document.getElementById(rootId); if(!root) return;
    const KEY = 'cm_bank_v1';
    let tx = JSON.parse(localStorage.getItem(KEY) || '[]');
    const list = root.querySelector('.bank-transactions');
    const form = root.querySelector('.transfer-form');
    const checks = qsels('.bank-check', root);

    function render(){
      if(list) list.innerHTML = tx.map(t=>`<li class="list-group-item">${escapeHtml(t.date)} — ${escapeHtml(t.to)} — ${t.amount}€</li>`).join('') || '<li class="list-group-item text-muted">Sin transacciones</li>';
      const total = checks.length? checks.filter(c=>c.checked).length : 0;
      const prog = root.querySelector('.bank-progress'); if(prog) prog.textContent = `${total}/${checks.length} recomendaciones aplicadas`;
    }

    if(form){
      form.addEventListener('submit', e=>{
        e.preventDefault(); const to=form.querySelector('[name=to]').value.trim(); const amount=parseFloat(form.querySelector('[name=amount]').value);
        if(!to || !amount || amount<=0) return alert('Completa cuenta y cantidad válida');
        tx.unshift({to,amount,date: new Date().toLocaleString()}); localStorage.setItem(KEY, JSON.stringify(tx)); render(); form.reset();
      });
    }

    checks.forEach(c=>c.addEventListener('change', render)); render();
  }

  function initPaymentSimulator(rootId){
    const root = document.getElementById(rootId); if(!root) return;
    const form = root.querySelector('.payment-form');
    const result = root.querySelector('.payment-result');
    if(!form) return;
    form.addEventListener('submit', e=>{
      e.preventDefault(); const card = form.querySelector('[name=card]').value.replace(/\s+/g,''); const amount=form.querySelector('[name=amount]').value;
      if(!card || !amount) return alert('Introduce tarjeta y importe');
      // fake validation: if starts with 4 -> success, else require 3D secure (fail here)
      if(card.startsWith('4')){
        result.innerHTML = `<div class="alert alert-success">Pago de ${escapeHtml(amount)}€ realizado correctamente.</div>`;
      } else {
        result.innerHTML = `<div class="alert alert-danger">Pago rechazado: tarjeta no soportada en este simulador.</div>`;
      }
    });
  }

  function initHomeSimulator(rootId){
    const root = document.getElementById(rootId); if(!root) return;
    qsels('.device-toggle', root).forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const state = btn.getAttribute('data-on')==='true';
        btn.setAttribute('data-on', (!state).toString());
        btn.textContent = (!state)? 'Apagar' : 'Encender';
        const badge = btn.closest('.device-item').querySelector('.device-state'); if(badge) badge.textContent = (!state)? 'Encendido' : 'Apagado';
      });
    });
  }

  function initVoiceSimulator(rootId){
    const root = document.getElementById(rootId); if(!root) return;
    const input = root.querySelector('.voice-input'); const out = root.querySelector('.voice-output'); const btn = root.querySelector('.voice-send');
    if(!input || !btn) return;
    function respond(cmd){ cmd = cmd.toLowerCase(); if(cmd.includes('tiempo')) return 'Hoy hace sol, 22°C (simulado).';
      if(cmd.includes('música')) return 'Reproduciendo tu lista de reproducción favorita (simulado).';
      if(cmd.includes('recordatorio')) return 'Recordatorio creado para la hora indicada.';
      return 'No entiendo el comando, intenta con "¿qué tiempo hace?" o "pon música".';
    }
    btn.addEventListener('click', ()=>{ const v = input.value.trim(); if(!v) return; out.textContent = respond(v); input.value=''; });
    input.addEventListener('keypress', e=>{ if(e.key==='Enter'){ e.preventDefault(); btn.click(); } });
  }

  function initGovSimulator(rootId){
    const root = document.getElementById(rootId); if(!root) return;
    const form = root.querySelector('.gov-form'); const list = root.querySelector('.gov-requests'); const KEY='cm_gov_v1';
    let reqs = JSON.parse(localStorage.getItem(KEY) || '[]');
    function render(){ list.innerHTML = reqs.map(r=>`<li class="list-group-item">${escapeHtml(r.name)} — ${escapeHtml(r.proc)} — ${escapeHtml(r.date)}</li>`).join('') || '<li class="list-group-item text-muted">Sin solicitudes</li>' }
    if(form){ form.addEventListener('submit', e=>{ e.preventDefault(); const name=form.querySelector('[name=name]').value; const proc=form.querySelector('[name=proc]').value; const date=new Date().toLocaleString(); if(!name||!proc) return alert('Completa los campos'); reqs.unshift({name,proc,date}); localStorage.setItem(KEY, JSON.stringify(reqs)); render(); form.reset(); }); }
    render();
  }

  // expose
  window.ConectaSim = Object.assign(window.ConectaSim||{}, { initBankSimulator, initPaymentSimulator, initHomeSimulator, initVoiceSimulator, initGovSimulator });

  // small helper re-used
  function escapeHtml(s){ return String(s).replace(/[&<>\"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

})();
