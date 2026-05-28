const REQUIRED_SPEC_AREAS = [
  "goal",
  "useCases",
  "dataSource",
  "uiStates",
  "businessRules",
  "acceptanceCriteria",
  "provisioning"
];

export function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseGeneratedField(fieldValue) {
  if (!fieldValue || typeof fieldValue !== "object" || !fieldValue.value) {
    return null;
  }

  try {
    return JSON.parse(fieldValue.value);
  } catch {
    return null;
  }
}

export function inferArchetype(record) {
  const text = `${record.fields.Name ?? ""} ${record.fields.Notes ?? ""}`.toLowerCase();
  if (text.includes("audiencia") || text.includes("perfil")) {
    return "audience";
  }
  if (text.includes("acceso") || text.includes("lanzador") || text.includes("favorito") || text.includes("reserva")) {
    return "launcher";
  }
  if (text.includes("reciente") || text.includes("documento útil")) {
    return "recents";
  }
  if (text.includes("resumen") || text.includes("noticia") || text.includes("hito")) {
    return "summary";
  }
  if (text.includes("faq") || text.includes("glosario") || text.includes("cómo hago")) {
    return "knowledge";
  }
  if (text.includes("kpi") || text.includes("estado") || text.includes("analizador")) {
    return "analytics";
  }
  return "general";
}

function hasMeaningfulArray(value) {
  return Array.isArray(value) && value.length > 0;
}

function hasProvisioningHints(dataJson, specsJson) {
  return Boolean(
    hasMeaningfulArray(dataJson?.sources) ||
      specsJson?.configuration ||
      hasMeaningfulArray(specsJson?.functionalRequirements)
  );
}

export function evaluateSpecificationCompleteness({ specsJson, designJson, dataJson }) {
  const gaps = [];
  if (!specsJson?.summary?.productGoal) {
    gaps.push("goal");
  }
  if (!hasMeaningfulArray(specsJson?.useCases)) {
    gaps.push("useCases");
  }
  if (!hasMeaningfulArray(dataJson?.sources)) {
    gaps.push("dataSource");
  }
  if (!hasMeaningfulArray(designJson?.states)) {
    gaps.push("uiStates");
  }
  if (!hasMeaningfulArray(specsJson?.businessRules)) {
    gaps.push("businessRules");
  }
  if (!hasMeaningfulArray(specsJson?.acceptanceCriteria)) {
    gaps.push("acceptanceCriteria");
  }
  if (!hasProvisioningHints(dataJson, specsJson)) {
    gaps.push("provisioning");
  }

  const presentAreas = REQUIRED_SPEC_AREAS.filter((area) => !gaps.includes(area));
  return {
    enrichmentStatus: gaps.length === 0 ? "sufficient" : gaps.length <= 2 ? "needs-enrichment" : "blocked-spec",
    presentAreas,
    missingAreas: gaps
  };
}

export function createProjectWorkItem(record, index) {
  const slug = slugify(record.fields.Name ?? `project-${index + 1}`);
  const specsJson = parseGeneratedField(record.fields["Especificaciones JSON"]);
  const designJson = parseGeneratedField(record.fields["Diseño JSON"]);
  const backlogJson = parseGeneratedField(record.fields["Backlog JSON"]);
  const dataJson = parseGeneratedField(record.fields["Datos JSON"]);
  const technicalJson = parseGeneratedField(record.fields["Diseño técnico JSON"]);
  const archetype = inferArchetype(record);
  const completeness = evaluateSpecificationCompleteness({ specsJson, designJson, dataJson });
  const waveOneSeeds = new Set([
    "lanzador-universal-de-accesos",
    "accesos-rapidos-por-audiencia",
    "favoritos-personales",
    "mis-accesos-recientes",
    "reserva-rapida",
    "resumen-semanal-automatico"
  ]);

  return {
    rowId: record.id,
    name: record.fields.Name,
    slug,
    artifactType: specsJson?.meta?.artifactType ?? "SPFxWebPart",
    archetype,
    waveNumber: waveOneSeeds.has(slug) ? 1 : null,
    dependencies: [],
    provisioningNeeds: dataJson?.sources ?? [],
    enrichmentStatus: completeness.enrichmentStatus,
    completeness,
    sourceJsons: {
      specsJson,
      designJson,
      backlogJson,
      dataJson,
      technicalJson
    },
    sourceFields: {
      notes: record.fields.Notes ?? "",
      createdTime: record.createdTime
    }
  };
}

export function assignWaves(workItems) {
  const seeds = [];
  const others = [];
  for (const item of workItems) {
    if (item.waveNumber === 1) {
      seeds.push(item);
    } else {
      others.push(item);
    }
  }

  const archetypeGroups = new Map();
  for (const item of others) {
    if (!archetypeGroups.has(item.archetype)) {
      archetypeGroups.set(item.archetype, []);
    }
    archetypeGroups.get(item.archetype).push(item);
  }

  const orderedOthers = [...archetypeGroups.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .flatMap(([, items]) => items.sort((left, right) => left.name.localeCompare(right.name)));

  let waveNumber = 2;
  for (let index = 0; index < orderedOthers.length; index += 4) {
    for (const item of orderedOthers.slice(index, index + 4)) {
      item.waveNumber = waveNumber;
    }
    waveNumber += 1;
  }

  return [...seeds, ...orderedOthers].sort((left, right) => {
    if (left.waveNumber !== right.waveNumber) {
      return left.waveNumber - right.waveNumber;
    }
    return left.name.localeCompare(right.name);
  });
}
