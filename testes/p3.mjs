import { nomeDeLocal, tiposComNome, generosDaToponimia } from "../src/toponimia.js";
function mulberry(a){return function(){a|=0;a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
const rnd = mulberry(4242);
const FEM=/^A\s|^As\s/, oo=/[^aeiou]o$/;
const maus=[];
for (const g of generosDaToponimia()) for (const tipo of tiposComNome()) for (let i=0;i<200;i++){
  const n=nomeDeLocal(tipo,g,rnd); if(!n) continue;
  const w=n.split(/\s+/); const u=w[w.length-1]; const p=w[w.length-2]||"";
  if(FEM.test(n)&&oo.test(u)&&!/^(d[eoa]s?|&|sem|a)$/i.test(p)) maus.push(n);
}
console.log(maus.length);
console.log([...new Set(maus)].slice(0,25).join("\n"));
