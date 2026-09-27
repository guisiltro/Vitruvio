/* ============================================================
   VITRUVIANO · Geração de imagens com IA (Pollinations - grátis)
   ============================================================ */

export function gerarPromptImagem(state, tipo = "fachada") {
  const estilos = {
    popular: "simple contemporary",
    medio: "modern elegant",
    alto: "luxury minimalist"
  };

  // Extrai materiais das observações
  const materiais = [];
  const obs = (state.obs || "").toLowerCase();
  if (obs.includes("madeira")) materiais.push("wood cladding");
  if (obs.includes("concreto")) materiais.push("exposed concrete");
  if (obs.includes("vidro")) materiais.push("floor to ceiling glass");
  if (obs.includes("tijolo")) materiais.push("exposed brick");
  if (obs.includes("pedra")) materiais.push("natural stone");
  if (obs.includes("aço") || obs.includes("metal")) materiais.push("steel accents");
  const matText = materiais.length ? materiais.join(", ") : "mixed modern materials";

  // Ambiente baseado na localização
  const local = (state.local || "").toLowerCase();
  let ambiente = "suburban Brazilian setting, tropical vegetation";
  if (local.includes("serra") || local.includes("montanha") || local.includes("jordão"))
    ambiente = "mountain setting with pine trees, misty atmosphere";
  else if (local.includes("praia") || local.includes("litoral") || local.includes("rio"))
    ambiente = "coastal setting, ocean view, palm trees";
  else if (local.includes("jardim") || local.includes("campo") || local.includes("chácara"))
    ambiente = "rural setting, green fields, garden";
  else if (local.includes("são paulo") || local.includes("sao paulo") || local.includes("sp"))
    ambiente = "urban São Paulo context, Brazilian metropolis";

  const tipoMap = {
    residencial: "modern residential house",
    comercial: "modern commercial building",
    reforma: "renovated contemporary house",
    interiores: "modern interior space"
  };

  const base = tipoMap[state.tipo] || "modern house";
  const estilo = estilos[state.padrao] || "modern";
  const area = state.area || 180;
  const pav = state.pav > 1 ? `, ${state.pav} floors` : "";

  const prompts = {
    fachada: `${estilo} ${base}, ${area}m², ${matText}${pav}, ${ambiente}, architectural photography, golden hour, ultra realistic, cinematic lighting, 4k highly detailed render`,
    interior: `${estilo} interior of ${base}, ${matText}, spacious living room, large windows, natural lighting, warm tones, minimalist Brazilian design, architectural digest photography, 4k`,
    aerea: `aerial drone view of ${estilo} ${base}, ${area}m², ${matText}${pav}, ${ambiente}, drone photography, golden hour, architectural visualization, ultra realistic 4k`,
    planta3d: `isometric 3D floor plan of ${estilo} ${base}, ${area}m²${pav}, cutaway view, furniture layout visible, architectural visualization, clean white background, colorful accents, 4k render`
  };

  return prompts[tipo] || prompts.fachada;
}

export function urlImagem(prompt, seed = null, width = 1024, height = 768) {
  const s = seed || Math.floor(Math.random() * 999999);
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${s}&nologo=true&model=flux`;
}

export function gerarImagens(state, tipo, quantidade = 3) {
  const prompt = gerarPromptImagem(state, tipo);
  const imagens = [];
  for (let i = 0; i < quantidade; i++) {
    const seed = Math.floor(Math.random() * 999999);
    imagens.push({ url: urlImagem(prompt, seed), seed, prompt });
  }
  return { prompt, imagens };
}