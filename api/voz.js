// api/voz.js — voz do Mestre (Fish Audio S2.1 Pro Free — mesma qualidade, US$ 0)
// A chave NUNCA fica no código: configure FISH_AUDIO_KEY nas Environment Variables da Vercel.
import { deixarEntrar } from "./_portao.js";

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ erro: "Método não permitido." });
  /* v9.155: a voz tambem gasta chave de terceiro, e ficou de fora do
     portao na primeira passada — a rota mais facil de esquecer e a que
     nao se parece com as outras. */
  { const p = await deixarEntrar(req); if (!p.ok) return res.status(p.status).json({ erro: p.erro, motivo: p.motivo, origem: p.origem }); }

  const chave = process.env.FISH_AUDIO_KEY;
  if (!chave) return res.status(500).json({ erro: "Voz não configurada no servidor (FISH_AUDIO_KEY)." });

  let texto = "";
  try { texto = String((req.body && req.body.texto) || ""); } catch { texto = ""; }
  // Limpa marcações de sistema e limita o tamanho (custo/latência).
  texto = texto.replace(/\[[A-ZÁÉÍÓÚÃÕÇ][^\]]*\]/g, " ").replace(/\s+/g, " ").trim().slice(0, 3000);
  if (!texto) return res.status(400).json({ erro: "Nada para ler." });

  try {
    const r = await fetch("https://api.fish.audio/v1/tts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${chave}`,
        "Content-Type": "application/json",
        model: "s2.1-pro-free",
      },
      body: JSON.stringify({
        text: texto,
        /* VOZ pt-BR (v7.3.2): sem reference_id a Fish cai numa voz de
           Portugal. Padrão: voz escolhida a dedo pelo autor do app
           (fish.audio/m/f3f59da2d3164c05846421a20d087b62). Para trocar SEM
           deploy: copie o ID de qualquer voz em fish.audio (página da voz)
           e crie a variável FISH_VOZ_ID na Vercel. */
        reference_id: process.env.FISH_VOZ_ID || "f3f59da2d3164c05846421a20d087b62",
        format: "mp3",
        mp3_bitrate: 128,
        normalize: true,
        latency: "balanced",
      }),
    });
    if (!r.ok) {
      const detalhe = (await r.text()).slice(0, 300);
      return res.status(r.status).json({ erro: `Fish Audio recusou (${r.status}).`, detalhe });
    }
    const buf = Buffer.from(await r.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(buf);
  } catch (e) {
    return res.status(500).json({ erro: "Falha ao gerar a voz.", detalhe: String(e && e.message || e) });
  }
}
