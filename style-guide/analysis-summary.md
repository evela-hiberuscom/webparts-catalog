# Analysis Summary — Hiberus Visual Style Guide for SPFx Portal

> **Skill**: web-style-analyzer-and-mockup-generator  
> **Target**: Portal interno SharePoint Online con web parts SPFx  
> **Referencia visual**: https://www.hiberus.com/  
> **Fecha**: 2026-03-23  
> **Páginas analizadas**: 6

---

## 1. Resumen Ejecutivo

Se analizaron 6 páginas del sitio público de Hiberus para extraer el sistema visual completo y adaptarlo a un portal interno SPFx:

| Página | URL | Hallazgos principales |
|---|---|---|
| Home | `/` | Hero con vídeo, carruseles, KPIs, formulario, footer |
| Sobre Hiberus | `/sobre-hiberus` | Fotografía corporativa, stats, claim de marca |
| Data & IA | `/data-ia/ia` | Accordion, 50/50 split, technology partner grid, breadcrumb, surface color #F7F8FD |
| Casos de éxito | `/casos-de-exito` | Square cards con flip animation (288×288px), Load More pagination |
| Sector Media | `/sectores/media` | Service feature cards con **accent line violeta** (11×2px #5B53FF), block system vlsuite |
| Sector Banca | `/sectores/banca` | Testimonial quote card, pill form inputs, 4-column grid, product solution cards, hero watermark |

**Conclusión clave**: El sistema visual de Hiberus es altamente consistente en las 6 páginas. Los mismos tokens, componentes y patrones de layout se repiten de forma predecible. Esto facilita la creación de un design system SPFx fiel a la marca.

---

## 2. Observaciones Visuales

### Tokens de color confirmados

| Token | Valor | Fuente | Confianza |
|---|---|---|---|
| Primary | `#1032CF` / rgb(16,50,207) | [OBS] Computed en 6 páginas | Alta |
| Accent | `#5B53FF` / rgb(91,83,255) | [OBS] Computed en botones y accent lines | Alta |
| Navy | `#19255A` / rgb(25,37,90) | [OBS] Computed en footer y secciones oscuras | Alta |
| Text Primary | `#111111` / rgb(17,17,17) | [OBS] Computed en H2 y body | Alta |
| Text Secondary | `#2D2D2D` / rgb(45,45,45) | [OBS] Computed en descripciones | Alta |
| Text Tertiary | `#707070` | [OBS] Placeholders y metadata | Media |
| Border | `#3B477A` / rgb(59,71,122) | [OBS] Computed en inputs | Alta |
| Surface | `#F7F8FD` / rgb(247,248,253) | [OBS] Nuevo — fondo sutil azulado en /data-ia/ia | Alta |
| Form bg | `#F3F3F3` / rgb(243,243,243) | [OBS] Nuevo — fondo del bloque formulario en /sectores/banca | Alta |
| Accent Line | `#5B53FF`, 11px × 2px | [OBS] Nuevo — span.search-line.main-line bajo títulos de cards | Alta |

### Tipografía confirmada

| Rol | Familia | Peso | Tamaño | Fuente |
|---|---|---|---|---|
| Hero heading | Montserrat | 700 | 56px/64px | [OBS] home |
| Section H2 | Montserrat | 700 | 32px/36px | [OBS] 6 páginas — 100% consistente |
| Card title | Montserrat | 700 | 20-24px | [OBS] sector pages |
| Testimonial quote | Montserrat | 600 | 24px | [OBS] /sectores/banca |
| Body text | Lato | 400 | 16px/24px | [OBS] 6 páginas |
| Breadcrumb | Lato | 400 | 16px | [OBS] sector pages |
| CTA button | Lato | 700 | 16px | [OBS] botones en 6 páginas |

### Border-radius confirmados

| Uso | Valor | Fuente |
|---|---|---|
| Botones e inputs | `200px` (pill) | [OBS] Confirmado en 6 páginas sin excepción |
| Contenedores/cards | `8-12px` | [OBS] Cards de carrusel, containers |
| Intermedio | `20px` | [OBS] Nuevo — algunos contenedores en /data-ia/ia |
| Dropdown menus | `0px 0px 8px 8px` (bottom-only) | [OBS] Nuevo — /casos-de-exito |
| Sin radius | `0px` | [OBS] Secciones full-width |

---

## 3. Inferencias

- [INF · high] **Accent line como firma visual**: La tira violeta de 11×2px bajo títulos de cards es un patrón universal en las páginas de servicio y sector. Debe replicarse en el portal SPFx como micro-componente reutilizable.
- [INF · high] **Sector page template**: Las 3 sector pages siguen una estructura idéntica (hero → intro → feature cards → logos → partners → CTA). Esto confirma que una plantilla de página de departamento/sección puede resolverse con una combinación fija de web parts.
- [INF · medium] **Surface color vs white**: El fondo `#F7F8FD` (ligeramente azulado) se usa como alternativa sutil al blanco puro en ciertas secciones. Puede usarse en SPFx para dar profundidad sin añadir sombras.
- [INF · medium] **Form background neutral**: Las zonas de formulario usan `#F3F3F3` como fondo para separar visualmente el form del contenido circundante.
- [INF · medium] **Bold emphasis inline**: En los párrafos descriptivos, se usan `<strong>` tags para destacar términos clave. Esto refuerza la legibilidad sin necesidad de formateo adicional.
- [INF · low] **Watermark decorativo**: El texto `#wEAREDIFFERENT` en opacity baja sobre el hero de banca es un recurso decorativo optativo, no un componente funcional.

---

## 4. Principios Visuales (verificados en 6 páginas)

1. **Alternancia de fondos entre secciones** — blanco ↔ azul primary ↔ navy. Ninguna sección consecutiva comparte fondo.
2. **Tipografía como protagonista** — headings Montserrat bold dominan cada sección, el texto es el ancla visual principal.
3. **Pill como forma universal** — botones, inputs, CTAs: todo interactivo usa border-radius 200px.
4. **Accent line violeta** — marcador distintivo de service/feature cards, presente en todas las sector pages.
5. **Fotografía real** — heroes con fotos corporativas reales, sin stock ni ilustraciones.
6. **Espaciado generoso entre secciones** — ≥64px de padding vertical. Agrupación interna ≤24px.
7. **Patrón de sector page repetible** — Breadcrumb → Hero → Intro → Features → Logos → Partners → CTA.
8. **Dual-family tipográfica** — Montserrat (headings) + Lato (body), sin excepciones.

---

## 5. Tokens y Reglas Nuevos (descubiertos en esta ronda)

| Token | Valor | Archivo actualizado |
|---|---|---|
| `colors.background.surface` | `#F7F8FD` | design-tokens.json |
| `colors.background.formBackground` | `#F3F3F3` | design-tokens.json |
| `colors.accentLine` | `#5B53FF`, 11×2px | design-tokens.json |
| `radii.intermediate` | `20px` | design-tokens.json |
| `radii.bottomOnly` | `0px 0px 8px 8px` | design-tokens.json |
| `layout.cardWidths` | 288px/448px/~220px | design-tokens.json |
| `layout.layoutVariants` | column-two/three/four | design-tokens.json |
| `typography.2xl.usage` | + testimonial quotes 600 | design-tokens.json |
| CMS block system | vlsuite-block__* (11 tipos) | design-tokens.json |
| `--hiberus-bg-surface` | `#F7F8FD` | mockup-spec CSS |
| `--hiberus-bg-form` | `#F3F3F3` | mockup-spec CSS |
| `--hiberus-accent-line-*` | color, width, height | mockup-spec CSS |
| `--hiberus-radius-intermediate` | `20px` | mockup-spec CSS |
| `hiberusTokens` (TS) | +7 nuevos tokens | mockup-spec TS |

---

## 6. Inventario de Componentes (total: 22)

### Componentes originales (home + sobre-hiberus)
1. Header / Sticky Nav
2. Hero con Vídeo/Foto + Overlay
3. Carrusel de Cards
4. Encabezado de Sección
5. Grid de Logos (Clientes/Partners)
6. Pill Button Primary (Solid)
7. Pill Button Ghost/Outline
8. Text Link con Flecha →
9. Form Input Pill
10. Formulario de Contacto
11. Newsletter Inline Form
12. Footer Multi-columna
13. Contador Estadístico / KPI
14. Card de Caso de Éxito
15. Tab Navigation (Pivot)

### Componentes nuevos (deep analysis)
16. **Breadcrumb / Ruta de Navegación** — Lato 16px, separador "|", sobre hero
17. **Service Feature Card** — título + accent line 11×2px + descripción + "Saber más →"
18. **Accordion / FAQ** — Bootstrap-style accordion flush, Montserrat 18px header
19. **Case Study Square Card** — 288×288px, flip animation, overlay azul + logo blanco
20. **50/50 Split Section** — foto full + contenido con fondo color
21. **Technology Partner Grid** — logos blancos sobre fondo azul primary
22. **Testimonial / Quote Card** — foto + cita Montserrat 24px semibold sobre primary
23. **Load More Button** — paginación pill para grids
24. **Product/Solution Card** — logo producto + accent line + descripción + CTA
25. **Hero Watermark** — texto decorativo rotado en opacity baja

---

## 7. Adaptación al Proyecto Destino (SPFx)

### Web Parts propuestos (total: 9)

| # | Web Part | Componentes internos | Prioridad |
|---|---|---|---|
| 3.1 | Hero Banner | HeroBanner, KPICounter | Alta |
| 3.2 | Featured Content Cards | ContentCard, useContentItems | Alta |
| 3.3 | Quick Links / Navigation Grid | Tile, Icon | Alta |
| 3.4 | KPI Dashboard | StatCounter | Media |
| 3.5 | Client/Partner Logo Grid | Logo grid (light + dark variant) | Media |
| 3.6 | Contact/Request Form | PillTextField, PillDropdown, Zod schema | Alta |
| 3.7 | **Service Feature Grid** *(nuevo)* | ServiceFeatureCard, AccentLine | Alta |
| 3.8 | **Testimonial / Quote** *(nuevo)* | TestimonialCard | Media |
| 3.9 | **Accordion / FAQ** *(nuevo)* | AccordionSection | Media |

### Shared components (total: 9)
SectionHeading, PillButton, PillTextField, ContentCard, StatCounter, **AccentLine**, **TestimonialCard**, **AccordionSection**, **ServiceFeatureCard**

### Page templates
- **Home del Portal**: Hero → Quick Links → Featured Content → KPIs → Logos → Contact Form → Footer
- **Página de Sector/Departamento** *(nuevo)*: Breadcrumb → Hero section → Intro → Service Feature Grid → Testimonial → FAQ → Logo Grid → Partners → Contact Form

---

## 8. Archivos Generados y Actualizados

| Archivo | Estado | Cambios |
|---|---|---|
| `brand-profile.json` | **Actualizado** | +6 páginas en sourceReference, +2 visual principles (accent line, sector page template), confirmación cross-page, color strategy actualizado |
| `design-tokens.json` | **Actualizado** | +surface color #F7F8FD, +form bg #F3F3F3, +accent line token, +intermediate radius 20px, +bottom-only radius, +card widths, +layout variants, +CMS block system, +updated pagesAnalyzed |
| `component-inventory.json` | **Actualizado** | +10 componentes nuevos (breadcrumb, service-feature-card, accordion, case-study-square, split-section, tech-partner-grid, testimonial, load-more, product-card, watermark), +3 pattern descriptions |
| `mockup-spec-spfx-portal.md` | **Actualizado** | +3 web parts (Service Feature Grid, Testimonial, Accordion FAQ), +5 shared components, +sector page layout template, +new CSS tokens, +updated checklist, +updated TS tokens |
| `analysis-summary.md` | **Nuevo** | Este archivo — consolidación de las 6 páginas |

---

## 9. Riesgos y Límites

### Riesgos identificados

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Accent line (#5B53FF) es un detalle de 11×2px — puede perderse visualmente a zoom reducido o en pantallas de baja resolución | Bajo | Aumentar tamaño mínimo a 16×2px en portal o usar border-bottom CSS |
| Flip animation de case study cards puede causar problemas de accesibilidad (contenido oculto, motion sensitivity) | Medio | Ofrecer alternativa sin animación (expand/modal), respetar `prefers-reduced-motion` |
| Square cards de 288×288px pueden no encajar en layouts fluidos de SharePoint sections | Medio | Usar aspect-ratio CSS con max-width en lugar de dimensiones fijas |
| El sitio usa Drupal vlsuite-block system — la estructura semántica no se traslada directamente a web parts | Bajo | Los components del inventario ya abstraen la UI de la implementación CMS |
| Contraste de #5B53FF sobre blanco (~4.0:1) sigue siendo borderline AA | Medio | Usar #4A42E0 (~5.2:1) para texto sobre blanco, mantener #5B53FF solo para decorativo |
| 25 componentes identificados → riesgo de scope creep si se intentan implementar todos | Alto | Priorizar los 9 web parts del checklist. Componentes decorativos (watermark, flip cards) son opcionales |

### Límites del análisis

- **CSS no observable**: hover states, focus indicators, transitions y animaciones complejas no fueron directamente medidos — solo observados visualmente y extraídos parcialmente.
- **Responsive**: No se analizaron breakpoints — todas las capturas se hicieron a resolución desktop (~1024px viewport).
- **Dark mode**: No observado — el sitio no ofrece modo oscuro público.
- **Internacionalización**: Se observó selector de idioma (ES) — pendiente verificar si los tamaños de texto y layouts aguantan textos más largos en otros idiomas.
- **Rendimiento real**: No se midieron tiempos de carga de fuentes ni bundle sizes del sitio original.
