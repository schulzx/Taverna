/* Os pedaços de JavaScript que correm DENTRO da página do jogo.
   Cada um é uma expressão que devolve texto (JSON) ou um valor simples.
   Escritos com String.raw: a barra invertida das expressões regulares chega
   à página como está (sem a dança do duplo escape). */

const CHAVE_DO_SAVE = "taverna_save_v1";
const R = String.raw;

export const CAMPO_PRONTO = R`(()=>{if(document.querySelector("textarea"))return "campo";const b=Array.from(document.querySelectorAll("button")).find(b=>/^CONTINUAR/i.test(b.innerText.trim()));return b?"menu":"nada"})()`;

export const CLICAR_BOTAO = (texto) => R`(()=>{const t=${JSON.stringify(texto)}.toLowerCase();const b=Array.from(document.querySelectorAll("button")).find(b=>b.innerText.trim().replace(/\s+/g," ").toLowerCase().startsWith(t));if(!b)return "nenhum";b.click();return "clicou"})()`;

/* a ficha: tudo o que a troca pode mexer. Item é string ou { nome, qtd }. */
export const LER_FICHA = R`(()=>{
const s=JSON.parse(localStorage.getItem(${JSON.stringify(CHAVE_DO_SAVE)})||"{}");const p=s.personagem||{};
const nome=(i)=>typeof i==="string"?i:(i&&i.nome?i.nome+((i.qtd>1)?" x"+i.qtd:""):JSON.stringify(i));
const lista=(l)=>(Array.isArray(l)?l:[]).filter(Boolean).map(nome).sort();
const eq=Object.entries(p.equipados||{}).filter(([k,v])=>v).map(([k,v])=>k+"="+(v.nome||v)).sort();
const sup=p.suprimentos||{};
return JSON.stringify({moedas:p.moedas,inv:lista(p.inventario),eq,rac:sup.racoes,agua:sup.agua,toc:sup.tochas,
grupo:(p.grupo||[]).map(c=>({nome:c.nome,inv:lista(c.inventario),moedas:c.moedas})),lugar:(s.lugar&&s.lugar.nome)||"",cidade:s.cidadeAtual||"",pv:p.vida,dia:s.dia})})()`;

/* as mensagens do save, na ordem: { autor, texto } */
export const LER_MENSAGENS = R`(()=>{const s=JSON.parse(localStorage.getItem(${JSON.stringify(CHAVE_DO_SAVE)})||"{}");return JSON.stringify((s.mensagens||[]).map(m=>({autor:m.autor,texto:String(m.texto||"")})))})()`;

/* OS CARTÕES (a «soleira do momento», ui.jsx): cada um é um grupo com
   data-momento = proposta | rolagem | chamado | escolha | proposta-aberta | crime.
   A proposta nasce fechada (verbo + o que cede + preço, num botão âmbar); tocar
   nele abre a «proposta-aberta», com o veredito por extenso e o botão de confirmar. */
const MOMENTOS = R`Array.from(document.querySelectorAll("[data-momento]")).filter(e=>!/^(dado|outras-ofertas|sinal-na-estrada)$/.test(e.getAttribute("data-momento")))`;

export const LER_CARTAO = R`(()=>{const ms=${MOMENTOS};if(!ms.length)return JSON.stringify(null);
const lim=(t)=>String(t||"").replace(/\s+/g," ").trim();
const t=(e,s)=>{const x=e.querySelector(s);return x?lim(x.innerText):""};
return JSON.stringify(ms.map(e=>({momento:e.getAttribute("data-momento"),verbo:t(e,"[data-momento-verbo]"),cede:t(e,"[data-momento-cede]"),preco:t(e,"[data-momento-preco]"),texto:lim(e.innerText),botoes:Array.from(e.querySelectorAll("button")).map(b=>lim(b.innerText||b.getAttribute("aria-label")))})))})()`;

/* abre a proposta (um toque no botão âmbar) e devolve o veredito por extenso */
export const ABRIR_PROPOSTA = R`(async()=>{const p=document.querySelector('[data-momento="proposta"] [data-momento-principal]');
if(p){p.click();await new Promise(r=>setTimeout(r,450))}
const a=document.querySelector('[data-momento="proposta-aberta"]');if(!a)return JSON.stringify(null);
const lim=(t)=>String(t||"").replace(/\s+/g," ").trim();
return JSON.stringify({texto:lim(a.innerText),botoes:Array.from(a.querySelectorAll("button")).map(b=>lim(b.innerText||b.getAttribute("aria-label")))})})()`;

/* confirma a proposta aberta: o último botão que não é o cabeçalho nem «Reescrever» */
export const CLICAR_CONFIRMAR = R`(()=>{const a=document.querySelector('[data-momento="proposta-aberta"]');if(!a)return "sem proposta aberta";
const bs=Array.from(a.querySelectorAll("button")).filter(b=>!b.hasAttribute("aria-expanded")&&!b.disabled&&!/^Reescrever/.test(b.innerText.trim()));
if(!bs.length)return "sem botao";const b=bs[bs.length-1];const r=b.innerText.trim().replace(/\s+/g," ");b.click();return "clicou "+r})()`;

/* a pergunta numerada («… ? 1. Dar · 2. …») que ficou depois da última frase */
export const LER_PERGUNTA = R`(()=>{const t=document.body.innerText;const f=window.__FR||"";const i=f?t.lastIndexOf(f):-1;if(i<0)return JSON.stringify(null);
const resto=t.slice(i+f.length);const m=resto.match(/([^\n]*[?])\s*\n?\s*1[.] [^\n]*(\n[^\n]*[0-9][.] [^\n]*)*/);return JSON.stringify(m?m[0].replace(/\n+/g," / ").slice(0,400):null)})()`;

export const ESTA_OCUPADO = R`(()=>{const t=document.body.innerText;const s=JSON.parse(localStorage.getItem(${JSON.stringify(CHAVE_DO_SAVE)})||"{}");
const c=${MOMENTOS}.length>0;const f=window.__FR||"";const i=f?t.lastIndexOf(f):-1;const perg=i>=0&&/[?]\s*\n?\s*1[.] /.test(t.slice(i+f.length));
return JSON.stringify({ocupado:/preparando/.test(t),n:(s.mensagens||[]).length,cartao:c,pergunta:perg})})()`;

export const ENVIAR_FRASE = (frase) => R`(()=>{const ta=document.querySelector("textarea");if(!ta)return "sem campo";
window.__FR=${JSON.stringify(frase)};
const set=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,"value").set;set.call(ta,${JSON.stringify(frase)});ta.dispatchEvent(new Event("input",{bubbles:true}));
const b=document.querySelector('button[aria-label="Agir"]');if(!b)return "sem botao";b.click();return "enviou"})()`;

/* quem o jogo diz estar «em cena» (a gaveta) */
export const LER_EM_CENA = R`(()=>{const b=Array.from(document.querySelectorAll("button")).map(b=>b.getAttribute("aria-label")||"").find(x=>/^Em cena:/.test(x));return JSON.stringify(b||"")})()`;
