/* ===== Tokens ===== */
:root{
  --paper: #EDEEEA;
  --paper-raised: #F7F7F4;
  --ink: #1F2A24;
  --ink-soft: #55645B;
  --line: #D8D9D2;
  --accent: #3D5A4C;
  --accent-strong: #2C4438;

  --c-salud: #C1666B;
  --c-reembolsos: #E3A857;
  --c-compras: #6C8EAD;
  --c-deseos: #9B7EDE;
  --c-viajes: #4FA89B;
  --c-finanzas: #4A7A63;
  --c-hogar: #B4794A;
  --c-eventos: #A15C8C;
  --c-laboral: #45607A;
  --c-otros: #8A8578;

  --radius: 10px;
  --shadow: 0 1px 2px rgba(31,42,36,0.06), 0 4px 14px rgba(31,42,36,0.06);
}

*{box-sizing:border-box;}
html,body{margin:0;padding:0;}
body{
  background:var(--paper);
  background-image:
    linear-gradient(var(--line) 1px, transparent 1px);
  background-size: 100% 32px;
  color:var(--ink);
  font-family:'Inter',sans-serif;
  min-height:100vh;
}
.hidden{display:none !important;}

h1,h2{
  font-family:'Fraunces',serif;
  font-weight:600;
  margin:0;
  letter-spacing:-0.01em;
}

.eyebrow{
  font-family:'IBM Plex Mono',monospace;
  font-size:12px;
  text-transform:uppercase;
  letter-spacing:0.12em;
  color:var(--accent);
  margin:0 0 6px 0;
}

/* ===== Login / Family screens ===== */
.screen{
  min-height:100vh;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:24px;
}
.login-card{
  background:var(--paper-raised);
  border:1px solid var(--line);
  border-radius:16px;
  box-shadow:var(--shadow);
  padding:40px 36px;
  max-width:440px;
  width:100%;
}
.login-card h1{
  font-size:32px;
  line-height:1.15;
  margin-bottom:14px;
}
.subtitle{
  color:var(--ink-soft);
  font-size:15px;
  line-height:1.5;
  margin-bottom:28px;
}
.login-note{
  font-size:12.5px;
  color:var(--ink-soft);
  margin-top:16px;
  line-height:1.5;
}
#familyForm{display:flex;flex-direction:column;gap:12px;}
#familyForm input{
  font-family:'IBM Plex Mono',monospace;
  padding:12px 14px;
  border-radius:8px;
  border:1px solid var(--line);
  background:#fff;
  font-size:14px;
  color:var(--ink);
}
#familyForm input:focus{outline:2px solid var(--accent);outline-offset:1px;}

.btn-primary{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:10px;
  background:var(--accent);
  color:#fff;
  border:none;
  border-radius:8px;
  padding:13px 20px;
  font-family:'Inter',sans-serif;
  font-weight:600;
  font-size:14.5px;
  cursor:pointer;
  transition:background 0.15s ease;
  width:100%;
}
.btn-primary:hover{background:var(--accent-strong);}
.btn-primary:focus-visible{outline:2px solid var(--ink);outline-offset:2px;}
.btn-small{width:auto;padding:10px 18px;white-space:nowrap;}

.btn-ghost{
  background:transparent;
  border:1px solid var(--line);
  color:var(--ink-soft);
  border-radius:8px;
  padding:8px 14px;
  font-family:'Inter',sans-serif;
  font-size:13px;
  cursor:pointer;
}
.btn-ghost:hover{border-color:var(--ink-soft);color:var(--ink);}

/* ===== App shell ===== */
#appScreen{
  display:block;
  min-height:100vh;
  max-width:760px;
  margin:0 auto;
  padding:28px 20px 80px;
}
.app-header{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  margin-bottom:24px;
  gap:12px;
}
.app-header h1{font-size:26px;}
.header-right{display:flex;align-items:center;gap:10px;flex-shrink:0;}
.user-badge{
  font-family:'IBM Plex Mono',monospace;
  font-size:12px;
  color:var(--ink-soft);
}

/* ===== Quick add ===== */
.quick-add{
  background:var(--paper-raised);
  border:1px solid var(--line);
  border-radius:var(--radius);
  box-shadow:var(--shadow);
  padding:16px;
  margin-bottom:20px;
}
#quickAddInput{
  width:100%;
  border:none;
  background:transparent;
  font-family:'Fraunces',serif;
  font-size:18px;
  padding:6px 2px 14px;
  border-bottom:1px solid var(--line);
  color:var(--ink);
}
#quickAddInput:focus{outline:none;border-bottom-color:var(--accent);}

.input-with-mic{
  display:flex;
  align-items:flex-end;
  gap:10px;
}
.input-with-mic #quickAddInput{flex:1;}
.mic-btn{
  flex-shrink:0;
  width:34px;
  height:34px;
  border-radius:50%;
  border:1px solid var(--line);
  background:var(--paper-raised);
  cursor:pointer;
  font-size:15px;
  margin-bottom:8px;
  display:flex;
  align-items:center;
  justify-content:center;
}
.mic-btn:hover{border-color:var(--accent);}
.mic-btn.listening{
  background:#C1666B;
  border-color:#C1666B;
  animation:pulse 1.2s infinite;
}
@keyframes pulse{
  0%,100%{ opacity:1; }
  50%{ opacity:0.5; }
}
.quick-add-row{
  display:flex;
  gap:10px;
  margin-top:12px;
  flex-wrap:wrap;
  align-items:center;
}
#categorySelect, #dueDateInput{
  font-family:'IBM Plex Mono',monospace;
  font-size:12.5px;
  padding:9px 10px;
  border-radius:6px;
  border:1px solid var(--line);
  background:#fff;
  color:var(--ink);
}
.quick-add-row .btn-primary{margin-left:auto;}
.suggest-hint{
  font-family:'IBM Plex Mono',monospace;
  font-size:11.5px;
  color:var(--accent);
  margin:10px 0 0;
}

.chore-chips{
  display:flex;
  gap:6px;
  flex-wrap:wrap;
  margin-top:10px;
}
.chore-chip{
  font-family:'IBM Plex Mono',monospace;
  font-size:11px;
  padding:5px 10px;
  border-radius:999px;
  border:1px dashed var(--c-hogar);
  background:transparent;
  color:var(--c-hogar);
  cursor:pointer;
}
.chore-chip:hover{background:var(--c-hogar);color:#fff;}

.recurring-row{margin-top:12px;}
.checkbox-label{
  display:flex;
  align-items:center;
  gap:8px;
  font-family:'IBM Plex Mono',monospace;
  font-size:12px;
  color:var(--ink-soft);
  cursor:pointer;
}
.recurring-options{
  display:flex;
  gap:8px;
  margin-top:8px;
  flex-wrap:wrap;
}
.recurring-options select, .recurring-options input{
  font-family:'IBM Plex Mono',monospace;
  font-size:12px;
  padding:8px 10px;
  border-radius:6px;
  border:1px solid var(--line);
  background:#fff;
  color:var(--ink);
}

.item-badge-recurring{
  font-family:'IBM Plex Mono',monospace;
  font-size:10.5px;
  color:var(--ink-soft);
}

/* ===== View tabs ===== */
.view-tabs{
  display:flex;
  gap:4px;
  border-bottom:1px solid var(--line);
  margin-bottom:18px;
}
.view-tab{
  font-family:'Inter',sans-serif;
  font-weight:600;
  font-size:14px;
  padding:10px 6px;
  background:transparent;
  border:none;
  border-bottom:2px solid transparent;
  color:var(--ink-soft);
  cursor:pointer;
  margin-right:14px;
}
.view-tab.active{color:var(--ink);border-bottom-color:var(--accent);}

/* ===== Menu semanal ===== */
.menu-week-nav{
  display:flex;
  align-items:center;
  justify-content:space-between;
  margin-bottom:16px;
  gap:10px;
}
.week-label{
  font-family:'Fraunces',serif;
  font-size:16px;
  color:var(--ink);
}
.menu-grid{
  display:grid;
  grid-template-columns:100px repeat(7,1fr);
  gap:1px;
  background:var(--line);
  border:1px solid var(--line);
  border-radius:8px;
  overflow:hidden;
}
.menu-cell{
  background:var(--paper-raised);
  padding:8px;
}
.menu-cell.head{
  background:var(--accent);
  color:#fff;
  font-family:'IBM Plex Mono',monospace;
  font-size:11px;
  text-transform:uppercase;
  letter-spacing:0.05em;
  display:flex;
  align-items:center;
  justify-content:center;
  text-align:center;
}
.menu-cell.meal-label{
  font-family:'IBM Plex Mono',monospace;
  font-size:11px;
  color:var(--ink-soft);
  display:flex;
  align-items:center;
}
.menu-cell textarea{
  width:100%;
  min-height:52px;
  border:none;
  background:transparent;
  font-family:'Inter',sans-serif;
  font-size:12.5px;
  color:var(--ink);
  resize:vertical;
  padding:0;
}
.menu-cell textarea:focus{outline:1px solid var(--accent);}

@media(max-width:700px){
  .menu-grid{display:flex;flex-direction:column;}
}


/* ===== Category tabs ===== */
.category-tabs{
  display:flex;
  gap:8px;
  overflow-x:auto;
  padding-bottom:6px;
  margin-bottom:18px;
}
.cat-tab{
  font-family:'IBM Plex Mono',monospace;
  font-size:12px;
  padding:7px 12px;
  border-radius:999px;
  border:1px solid var(--line);
  background:var(--paper-raised);
  color:var(--ink-soft);
  cursor:pointer;
  white-space:nowrap;
  flex-shrink:0;
}
.cat-tab.active{
  color:#fff;
  border-color:transparent;
}

/* ===== Item list ===== */
.item-list{display:flex;flex-direction:column;gap:10px;}
.item-card{
  display:flex;
  align-items:flex-start;
  gap:12px;
  background:var(--paper-raised);
  border:1px solid var(--line);
  border-left:4px solid var(--c-otros);
  border-radius:8px;
  padding:14px 16px;
  box-shadow:var(--shadow);
}
.item-card.done{opacity:0.5;}
.item-card.done .item-text{text-decoration:line-through;}
.item-check{
  width:20px;height:20px;
  border-radius:50%;
  border:2px solid var(--line);
  background:#fff;
  flex-shrink:0;
  margin-top:2px;
  cursor:pointer;
}
.item-check.checked{background:var(--accent);border-color:var(--accent);}
.item-body{flex:1;min-width:0;}
.item-text{font-size:15px;line-height:1.4;word-break:break-word;}
.item-meta{
  display:flex;
  gap:10px;
  align-items:center;
  margin-top:6px;
  flex-wrap:wrap;
}
.item-tag{
  font-family:'IBM Plex Mono',monospace;
  font-size:10.5px;
  text-transform:uppercase;
  letter-spacing:0.06em;
  padding:2px 8px;
  border-radius:999px;
  color:#fff;
}
.item-due{
  font-family:'IBM Plex Mono',monospace;
  font-size:11.5px;
  color:var(--ink-soft);
}
.item-author{
  font-family:'IBM Plex Mono',monospace;
  font-size:11px;
  color:var(--ink-soft);
  opacity:0.7;
}
.item-actions{display:flex;gap:6px;flex-shrink:0;}
.icon-btn{
  background:transparent;
  border:none;
  cursor:pointer;
  padding:4px;
  color:var(--ink-soft);
  font-size:15px;
  line-height:1;
}
.icon-btn:hover{color:var(--ink);}

.empty-state{
  text-align:center;
  color:var(--ink-soft);
  font-family:'Fraunces',serif;
  font-size:17px;
  margin-top:60px;
}

.toast{
  position:fixed;
  bottom:20px;
  left:50%;
  transform:translateX(-50%);
  background:var(--ink);
  color:#fff;
  padding:10px 18px;
  border-radius:8px;
  font-size:13px;
  font-family:'Inter',sans-serif;
  box-shadow:var(--shadow);
  z-index:100;
}

@media(max-width:480px){
  .login-card{padding:28px 22px;}
  .login-card h1{font-size:26px;}
  .app-header{flex-direction:column;}
}

@media (prefers-reduced-motion: reduce){
  *{transition:none !important;}
}
