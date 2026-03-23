# Mockup Spec — Portal Interno SPFx Hiberus

> **Target**: Portal interno SharePoint Online con web parts SPFx  
> **Referencia visual**: https://www.hiberus.com/  
> **Generado**: 2026-03-23  
> **Skill**: web-style-analyzer-and-mockup-generator — Stage 4 (Adaptation)

---

## 1. Visión General

Adaptar el ADN visual de Hiberus (corporativo-tecnológico, azul/violeta, tipografía Montserrat/Lato, formas pill) a un portal interno SPFx manteniendo la identidad de marca pero respetando las restricciones de SharePoint Online y Fluent UI.

### Principios de adaptación

| Principio original | Adaptación SPFx |
|---|---|
| Full-bleed sections con color alternado | Secciones con fondo en canvas zones full-width |
| Pill buttons (#5B53FF) | PrimaryButton/DefaultButton con borderRadius override |
| Montserrat bold headings | Webfont cargada via CSS @import desde CDN seguro (Google Fonts) |
| Lato body text | Webfont cargada via CSS @import |
| Hero con vídeo | Hero con imagen estática + overlay (vídeo no recomendado en SPFx por peso/rendimiento) |
| Carruseles con arrows + dots | Scroll horizontal con CSS scroll-snap (sin dependencias externas) |
| Formulario con inputs pill | TextField con estilos custom pill — considerar wrapper reutilizable |

### Lo que NO se traslada directamente

- **Vídeo background**: peso excesivo para intranet, usar imagen estática
- **Hamburger menu**: SharePoint tiene su propia navegación
- **Sticky header custom**: el suite bar de SharePoint ya cumple esta función
- **Animaciones de scroll complejas**: mantener discretas para no interferir con el rendimiento del workbench

---

## 2. Theme SPFx — Mapeo de Tokens a ITheme

```typescript
// theme.ts — Hiberus Theme para SPFx
import { createTheme, ITheme } from '@fluentui/react';

export const hiberusTheme: ITheme = createTheme({
  palette: {
    themePrimary: '#1032CF',        // Primary blue
    themeLighterAlt: '#F0F2FC',
    themeLighter: '#C4CCF4',
    themeLight: '#95A1EB',
    themeTertiary: '#4A5FD7',
    themeSecondary: '#1A3FD4',
    themeDarkAlt: '#0E2DBA',
    themeDark: '#0C269D',
    themeDarker: '#091C74',
    neutralLighterAlt: '#FAFAFA',
    neutralLighter: '#F5F5F5',
    neutralLight: '#E8E8E8',
    neutralQuaternaryAlt: '#D6D6D6',
    neutralQuaternary: '#C8C8C8',
    neutralTertiaryAlt: '#A0A0A0',
    neutralTertiary: '#707070',
    neutralSecondary: '#3A3A3A',
    neutralSecondaryAlt: '#3A3A3A',
    neutralPrimaryAlt: '#2D2D2D',
    neutralPrimary: '#111111',
    neutralDark: '#0A0A0A',
    black: '#000000',
    white: '#FFFFFF',
    accent: '#5B53FF',              // Violet accent
  },
  defaultFontStyle: {
    fontFamily: "Lato, 'Open Sans', 'Helvetica Neue', arial, system-ui, sans-serif",
  },
});

// Tokens adicionales no cubiertos por ITheme
export const hiberusTokens = {
  fontFamilyHeading: "Montserrat, sans-serif",
  fontFamilyBody: "Lato, 'Open Sans', 'Helvetica Neue', arial, system-ui, sans-serif",
  colorAccent: '#5B53FF',
  colorAccentHover: '#4A42E0',
  colorNavy: '#19255A',
  colorSurface: '#F7F8FD',
  colorFormBg: '#F3F3F3',
  accentLineColor: '#5B53FF',
  accentLineWidth: '11px',
  accentLineHeight: '2px',
  radiusPill: '200px',
  radiusIntermediate: '20px',
  radiusCard: '12px',
  radiusDropdownBottom: '0px 0px 8px 8px',
  shadowCard: '0 4px 8px rgba(0, 0, 0, 0.08)',
  spacingSection: '80px',
  spacingComponent: '24px',
  maxContentWidth: '1200px',
};
```

### CSS Custom Properties (inyectar en root del web part)

```css
/* hiberus-tokens.css */
:root {
  /* Colors */
  --hiberus-primary: #1032CF;
  --hiberus-accent: #5B53FF;
  --hiberus-accent-hover: #4A42E0;
  --hiberus-navy: #19255A;
  --hiberus-text-primary: #111111;
  --hiberus-text-secondary: #3A3A3A;
  --hiberus-text-tertiary: #707070;
  --hiberus-text-inverse: #FFFFFF;
  --hiberus-bg-default: #FFFFFF;
  --hiberus-bg-surface: #F7F8FD;
  --hiberus-bg-elevated: #F5F5F5;
  --hiberus-bg-form: #F3F3F3;
  --hiberus-border-default: #3B477A;
  --hiberus-border-subtle: #D6D6D6;
  --hiberus-error: #D32F2F;

  /* Accent line */
  --hiberus-accent-line-color: #5B53FF;
  --hiberus-accent-line-width: 11px;
  --hiberus-accent-line-height: 2px;

  /* Typography */
  --hiberus-font-heading: 'Montserrat', sans-serif;
  --hiberus-font-body: 'Lato', 'Open Sans', 'Helvetica Neue', arial, system-ui, sans-serif;

  /* Spacing */
  --hiberus-space-xs: 4px;
  --hiberus-space-sm: 8px;
  --hiberus-space-md: 16px;
  --hiberus-space-lg: 24px;
  --hiberus-space-xl: 32px;
  --hiberus-space-2xl: 48px;
  --hiberus-space-section: 80px;

  /* Radii */
  --hiberus-radius-sm: 4px;
  --hiberus-radius-md: 8px;
  --hiberus-radius-lg: 12px;
  --hiberus-radius-intermediate: 20px;
  --hiberus-radius-pill: 200px;

  /* Shadows */
  --hiberus-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --hiberus-shadow-md: 0 4px 8px rgba(0, 0, 0, 0.08);
  --hiberus-shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);

  /* Layout */
  --hiberus-max-width: 1200px;
}
```

---

## 3. Web Parts Propuestos

### 3.1 Hero Banner Web Part

**Propósito**: Sección de bienvenida prominente con imagen, heading, subtítulo y CTA.

```
┌─────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────┐│
│  │ [Imagen de fondo con overlay azul primary 65% opacity]  ││
│  │                                                         ││
│  │    Bienvenido al Portal Hiberus                         ││
│  │    Montserrat 48px bold, #FFFFFF                        ││
│  │                                                         ││
│  │    Accede a recursos, proyectos y herramientas          ││
│  │    Lato 18px, #FFFFFF 80% opacity                       ││
│  │                                                         ││
│  │    [ Explorar recursos → ]  (ghost pill button)         ││
│  │                                                         ││
│  │    ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐              ││
│  │    │+3800 │  │ +30  │  │+1500 │  │ +24  │  KPI Stats   ││
│  │    │employ│  │oficin│  │proyec│  │ años │              ││
│  │    └──────┘  └──────┘  └──────┘  └──────┘              ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

**PropertyPane**:
- `imageUrl`: PropertyFieldFilePicker — imagen de fondo
- `heading`: TextField — título principal
- `subtitle`: TextField — subtítulo
- `ctaText`: TextField — texto del CTA
- `ctaUrl`: TextField — URL del CTA
- `kpis`: PropertyFieldCollectionData — array de {value, label}
- `overlayOpacity`: Slider — 0.4 a 0.9

**Componente React**:
```
HeroBanner/
├── HeroBanner.tsx
├── HeroBanner.module.scss
├── IHeroBannerProps.ts
└── KPICounter.tsx
```

**Estilos clave**:
- Container: `position:relative; min-height:400px; overflow:hidden`
- Overlay: `position:absolute; inset:0; background:rgba(16,50,207,var(--overlay-opacity))`
- Heading: `font-family:var(--hiberus-font-heading); font-size:48px; font-weight:700; color:#fff`
- CTA: `border-radius:200px; border:1px solid #fff; background:transparent; color:#fff; padding:15px 24px`

---

### 3.2 Featured Content Cards Web Part

**Propósito**: Grid o carrusel de cards para destacar contenido (noticias, proyectos, recursos).

```
┌─────────────────────────────────────────────────────────────┐
│  Proyectos Destacados        Montserrat 32px bold           │
│  Los últimos proyectos del equipo   Lato 16px #3A3A3A       │
│                                                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ [Imagen]   │  │ [Imagen]   │  │ [Imagen]   │            │
│  │            │  │            │  │            │            │
│  │ Proyecto A │  │ Proyecto B │  │ Proyecto C │            │
│  │ Montserrat │  │ Montserrat │  │ Montserrat │            │
│  │ 20px bold  │  │ 20px bold  │  │ 20px bold  │            │
│  │            │  │            │  │            │            │
│  │ Descripción│  │ Descripción│  │ Descripción│            │
│  │ Lato 16px  │  │ Lato 16px  │  │ Lato 16px  │            │
│  │            │  │            │  │            │            │
│  │ Saber más →│  │ Saber más →│  │ Saber más →│            │
│  │ #5B53FF bld│  │ #5B53FF bld│  │ #5B53FF bld│            │
│  └────────────┘  └────────────┘  └────────────┘            │
│                                                             │
│              ← ● ● ○ ● →  (si carousel mode)               │
└─────────────────────────────────────────────────────────────┘
```

**PropertyPane**:
- `listId`: PropertyFieldListPicker — lista SharePoint fuente
- `displayMode`: Dropdown — 'grid' | 'carousel'
- `columns`: Slider — 2, 3, 4
- `itemLimit`: Slider — 3 a 12
- `showImage`: Toggle
- `ctaText`: TextField

**Componente React**:
```
FeaturedContent/
├── FeaturedContent.tsx
├── FeaturedContent.module.scss
├── IFeaturedContentProps.ts
├── ContentCard.tsx
├── ContentCard.module.scss
├── useContentItems.ts          (hook — fetch de lista SP)
└── contentService.ts           (service — queries SharePoint)
```

**Estilos clave cards**:
- Card: `border-radius:12px; overflow:hidden; background:#fff`
- Image: `aspect-ratio:16/10; object-fit:cover; width:100%`
- Title: `font-family:Montserrat; font-size:20px; font-weight:700; color:#111`
- CTA link: `font-weight:700; color:#5B53FF; text-decoration:none` + ` →`

---

### 3.3 Quick Links / Navigation Grid Web Part

**Propósito**: Grid de accesos rápidos con icono + label para las secciones más usadas del portal.

```
┌─────────────────────────────────────────────────────────────┐
│  Accesos Rápidos                Montserrat 32px bold        │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   📊     │  │   📝     │  │   👥     │  │   📅     │   │
│  │ Informes │  │ Formación│  │ Directorio│  │Calendario│   │
│  │          │  │          │  │          │  │          │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   🔧     │  │   💬     │  │   📦     │  │   ❓     │   │
│  │   IT     │  │  Chat    │  │ Recursos │  │  Ayuda   │   │
│  │          │  │          │  │          │  │          │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Estilos clave**:
- Tile: `border-radius:12px; padding:24px; background:#F5F5F5; text-align:center; transition:shadow 300ms`
- Tile hover: `box-shadow:var(--hiberus-shadow-md); background:#FFFFFF`
- Icon: Fluent UI Icon, `font-size:32px; color:#1032CF`
- Label: `font-family:Montserrat; font-weight:600; font-size:16px; color:#111`

---

### 3.4 KPI Dashboard Web Part

**Propósito**: Panel de métricas clave con contadores animados, similar a los KPIs del hero de Hiberus.

```
┌─────────────────────────────────────────────────────────────┐
│  En Cifras                      Montserrat 32px bold        │
│                                                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   +3,800   │  │     94%    │  │    +150    │            │
│  │  Montserrat│  │  Montserrat│  │  Montserrat│            │
│  │  48px bold │  │  48px bold │  │  48px bold │            │
│  │  #1032CF   │  │  #5B53FF   │  │  #1032CF   │            │
│  │            │  │            │  │            │            │
│  │  Empleados │  │ Satisfacción│ │  Proyectos │            │
│  │  Lato 16px │  │  Lato 16px │  │  Lato 16px │            │
│  │  #3A3A3A   │  │  #3A3A3A   │  │  #3A3A3A   │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

**Fuente de datos**: Lista SharePoint "KPIs" con columnas: Title, Value (number), Prefix (+, etc.), Suffix (%, etc.), Order.

---

### 3.5 Client/Partner Logo Grid Web Part

**Propósito**: Mostrar logos de clientes, partners o certificaciones en grid responsivo.

```
┌─────────────────────────────────────────────────────────────┐
│  Nuestros Clientes             Montserrat 32px bold         │
│                                                             │
│  ┌────┐  ┌────┐  ┌────┐  ┌────┐  ┌────┐  ┌────┐          │
│  │logo│  │logo│  │logo│  │logo│  │logo│  │logo│          │
│  └────┘  └────┘  └────┘  └────┘  └────┘  └────┘          │
│  ┌────┐  ┌────┐  ┌────┐  ┌────┐  ┌────┐  ┌────┐          │
│  │logo│  │logo│  │logo│  │logo│  │logo│  │logo│          │
│  └────┘  └────┘  └────┘  └────┘  └────┘  └────┘          │
└─────────────────────────────────────────────────────────────┘
```

**Estilos clave**:
- Grid: `display:grid; grid-template-columns:repeat(auto-fill, minmax(120px, 1fr)); gap:32px; align-items:center`
- Logo: `max-height:50px; object-fit:contain; filter:grayscale(100%); opacity:0.7; transition:all 300ms`
- Logo hover: `filter:grayscale(0%); opacity:1`

---

### 3.6 Contact/Request Form Web Part

**Propósito**: Formulario de contacto o solicitud interna con la estética pill de Hiberus.

```
┌─────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Envíanos tu consulta        Montserrat 32px bold #FFF  ││
│  │  bg: #19255A (navy)                                     ││
│  │                                                         ││
│  │  ┌─────────── form bg: #FFFFFF, radius: 16px ─────────┐││
│  │  │                                                     │││
│  │  │  ┌─────────────────┐  ┌─────────────────┐          │││
│  │  │  │ Nombre*          │  │ Email*           │          │││
│  │  │  │ pill input       │  │ pill input       │          │││
│  │  │  └─────────────────┘  └─────────────────┘          │││
│  │  │                                                     │││
│  │  │  ┌─────────────────┐  ┌─────────────────┐          │││
│  │  │  │ Departamento     │  │ Prioridad        │          │││
│  │  │  │ pill dropdown    │  │ pill dropdown    │          │││
│  │  │  └─────────────────┘  └─────────────────┘          │││
│  │  │                                                     │││
│  │  │  ┌──────────────────────────────────────┐           │││
│  │  │  │ Mensaje*                              │           │││
│  │  │  │ textarea con border-radius: 16px      │           │││
│  │  │  └──────────────────────────────────────┘           │││
│  │  │                                                     │││
│  │  │  ☐ Acepto la política de privacidad                 │││
│  │  │                                                     │││
│  │  │  [ Enviar consulta ]  pill button #5B53FF           │││
│  │  │                                                     │││
│  │  └─────────────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

**Arquitectura** (según AGENTS.md):
```
ContactForm/
├── ContactForm.tsx              (componente — solo UI y estado de form)
├── ContactForm.module.scss
├── IContactFormProps.ts
├── components/
│   ├── PillTextField.tsx         (wrapper reutilizable para input pill)
│   └── PillDropdown.tsx          (wrapper reutilizable para dropdown pill)
├── hooks/
│   └── useContactForm.ts         (hook — manejo de estado del formulario)
├── services/
│   └── contactFormService.ts     (service — envío a lista SharePoint)
├── models/
│   └── contactFormSchema.ts      (Zod schema — validación y sanitización)
└── repositories/
    └── contactFormRepository.ts  (repository — CRUD contra SP list)
```

---

### 3.7 Service Feature Grid Web Part

**Propósito**: Grid de servicios/features con el patrón accent line observado en todas las páginas de sector de Hiberus.

```
┌─────────────────────────────────────────────────────────────┐
│  Nuestros Servicios            Montserrat 32px bold         │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Servicio Alpha  │  │ Servicio Beta   │  │ Servicio Gamma  │ │
│  │ ███ accent line │  │ ███ accent line │  │ ███ accent line │ │
│  │                 │  │                 │  │                 │ │
│  │ Descripción con │  │ Descripción con │  │ Descripción con │ │
│  │ **bold** en key │  │ **bold** en key │  │ **bold** en key │ │
│  │ terms...        │  │ terms...        │  │ terms...        │ │
│  │                 │  │                 │  │                 │ │
│  │ Saber más →     │  │ Saber más →     │  │ Saber más →     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

accent line = 11px × 2px, color `#5B53FF`

**PropertyPane**:
- `listId`: PropertyFieldListPicker — lista SharePoint fuente
- `columns`: Slider — 2, 3, 4
- `itemLimit`: Slider — 3 a 12
- `ctaText`: TextField — default "Saber más"
- `showAccentLine`: Toggle — default true

**Componente React**:
```
ServiceFeatureGrid/
├── ServiceFeatureGrid.tsx
├── ServiceFeatureGrid.module.scss
├── IServiceFeatureGridProps.ts
├── ServiceFeatureCard.tsx         (card individual con accent line)
├── ServiceFeatureCard.module.scss
├── hooks/
│   └── useServiceItems.ts
└── services/
    └── serviceFeatureService.ts
```

**Estilos clave**:
- Card: `padding:24px 0; border:none; background:transparent`
- Title: `font-family:Montserrat; font-size:20px; font-weight:700; color:#111`
- Accent line: `display:block; width:11px; height:2px; background:#5B53FF; margin:8px 0 16px`
- Description: `font-family:Lato; font-size:16px; color:#2D2D2D; strong { font-weight:700 }`
- CTA: `font-weight:700; color:#5B53FF; text-decoration:none` + ` →`
- Grid: `display:grid; grid-template-columns:repeat(var(--cols), 1fr); gap:32px`

---

### 3.8 Testimonial / Quote Web Part

**Propósito**: Bloque de testimonial con foto + cita sobre fondo azul, siguiendo el patrón de /sectores/banca.

```
┌─────────────────────────────────────────────────────────────┐
│  ┌───────────────────────────────────┐                      │
│  │  [Foto de persona/equipo]         │                      │
│  │  aspect-ratio libre               │                      │
│  ├───────────────────────────────────┤                      │
│  │  bg: #1032CF                      │                      │
│  │                                   │                      │
│  │  "Más de 15 años promoviendo      │                      │
│  │   la transformación digital"       │                      │
│  │                                   │                      │
│  │  Montserrat 24px semibold #FFF    │                      │
│  │                                   │                      │
│  │  — Nombre, Cargo                  │                      │
│  │  Lato 14px #FFF 80%              │                      │
│  └───────────────────────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

**PropertyPane**:
- `quoteText`: TextField multiline
- `authorName`: TextField
- `authorRole`: TextField
- `imageUrl`: PropertyFieldFilePicker
- `backgroundColor`: PropertyFieldColorPicker — default #1032CF

**Componente React**:
```
Testimonial/
├── Testimonial.tsx
├── Testimonial.module.scss
├── ITestimonialProps.ts
└── TestimonialCard.tsx
```

---

### 3.9 Accordion / FAQ Web Part

**Propósito**: Secciones expandibles para FAQs, detalles de servicio o información contextual.

```
┌─────────────────────────────────────────────────────────────┐
│  Preguntas Frecuentes          Montserrat 32px bold         │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ ▼ ¿Qué servicios de IA ofrecéis?      Montserrat 18px  ││
│  │                                                         ││
│  │   Ofrecemos consultoría, implementación de modelos...   ││
│  │   Lato 16px #2D2D2D                                    ││
│  ├─────────────────────────────────────────────────────────┤│
│  │ ▶ ¿Cuánto dura una implantación típica?                ││
│  ├─────────────────────────────────────────────────────────┤│
│  │ ▶ ¿Con qué partners tecnológicos trabajáis?            ││
│  ├─────────────────────────────────────────────────────────┤│
│  │ ▶ ¿Cómo garantizáis la seguridad de los datos?         ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

**PropertyPane**:
- `listId`: PropertyFieldListPicker — lista SP con Title (pregunta) y Answer (respuesta richtext)
- `allowMultipleOpen`: Toggle
- `defaultOpenFirst`: Toggle

**Componente React**:
```
AccordionFAQ/
├── AccordionFAQ.tsx
├── AccordionFAQ.module.scss
├── IAccordionFAQProps.ts
├── AccordionSection.tsx
├── hooks/
│   └── useAccordionItems.ts
└── services/
    └── accordionService.ts
```

**Estilos clave**:
- Header: `font-family:Montserrat; font-size:18px; font-weight:600; padding:16px 0; border-bottom:1px solid #E8E8E8; cursor:pointer`
- Body: `font-family:Lato; font-size:16px; color:#2D2D2D; padding:0 0 16px; transition:max-height 300ms ease`
- Chevron: `Icon('ChevronDown'); transform:rotate(0deg/180deg); transition:transform 300ms`

---

## 4. Page Layouts Recomendados

### 4.1 Home del Portal

```
┌─────────────────────────────────────────────┐
│           Hero Banner (full-width)           │
│         imagen + overlay + KPIs              │
├─────────────────────────────────────────────┤
│        Quick Links (4 columnas)              │
│      accesos rápidos al contenido            │
├─────────────────────────────────────────────┤
│     Featured Content (3 cards grid)          │
│     noticias / proyectos destacados          │
├─────────────────────────────────────────────┤
│       KPI Dashboard (3 counters)             │
│       métricas clave de la empresa           │
├─────────────────────────────────────────────┤
│      Logo Grid (partners/clientes)           │
│                                              │
├─────────────────────────────────────────────┤
│     Contact Form (sobre sección navy)        │
│                                              │
├─────────────────────────────────────────────┤
│           Footer (App Customizer)            │
│         Bottom placeholder                   │
└─────────────────────────────────────────────┘
```

### 4.2 Página de Departamento / Sección

```
┌─────────────────────────────────────────────┐
│   Breadcrumb (Inicio | Sector | Subsección) │
├─────────────────────────────────────────────┤
│     Section Header (bg color + heading)      │
│     + ghost pill CTA                         │
├───────────────────────┬─────────────────────┤
│   Contenido principal │   Sidebar links     │
│   (2/3 width)        │   (1/3 width)       │
│                       │                      │
│   - Rich text        │   - Quick links     │
│   - Document lists   │   - Team contacts   │
│   - Embedded forms   │   - Related docs    │
├───────────────────────┴─────────────────────┤
│    Service Feature Grid (3-4 columnas)       │
│    con accent line violeta                   │
├─────────────────────────────────────────────┤
│    Testimonial / Quote Card                  │
├─────────────────────────────────────────────┤
│    Accordion FAQ (si aplica)                 │
├─────────────────────────────────────────────┤
│    Logo Grid (clientes del sector)           │
├─────────────────────────────────────────────┤
│    Partners Grid (fondo azul primary)        │
├─────────────────────────────────────────────┤
│    Contact Form (sobre sección navy)         │
└─────────────────────────────────────────────┘
```

---

## 5. Shared Components (Reutilizables entre Web Parts)

### 5.1 SectionHeading

```typescript
interface ISectionHeadingProps {
  title: string;
  subtitle?: string;
  alignment?: 'left' | 'center';
  theme?: 'light' | 'dark';
  ctaText?: string;
  ctaUrl?: string;
}
```

### 5.2 PillButton

```typescript
interface IPillButtonProps {
  text: string;
  variant: 'primary' | 'ghost' | 'ghost-on-dark';
  onClick?: () => void;
  href?: string;
  iconName?: string;
  disabled?: boolean;
}
```

### 5.3 PillTextField

```typescript
interface IPillTextFieldProps extends ITextFieldProps {
  // Extiende TextField con estilos pill automáticos
  // border-radius: 200px
  // border-color: #3B477A
  // padding: 12px 24px
}
```

### 5.4 ContentCard

```typescript
interface IContentCardProps {
  imageUrl?: string;
  title: string;
  description?: string;
  ctaText?: string;
  ctaUrl?: string;
  tags?: string[];
}
```

### 5.5 StatCounter

```typescript
interface IStatCounterProps {
  value: number;
  label: string;
  prefix?: string;   // e.g., "+"
  suffix?: string;   // e.g., "%"
  animate?: boolean;
  color?: 'primary' | 'accent';
}
```

### 5.6 AccentLine

```typescript
// Micro-componente reusable para la tira violeta decorativa
// Implementar como div o pseudo-element
interface IAccentLineProps {
  color?: string;     // default: #5B53FF
  width?: string;     // default: 11px
  height?: string;    // default: 2px
  margin?: string;    // default: 8px 0 16px
}
```

### 5.7 TestimonialCard

```typescript
interface ITestimonialCardProps {
  quoteText: string;
  authorName?: string;
  authorRole?: string;
  imageUrl?: string;
  backgroundColor?: string;  // default: #1032CF
}
```

### 5.8 AccordionSection

```typescript
interface IAccordionSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
}
```

### 5.9 ServiceFeatureCard

```typescript
interface IServiceFeatureCardProps {
  title: string;
  description: string;
  ctaText?: string;       // default: "Saber más"
  ctaUrl?: string;
  showAccentLine?: boolean;  // default: true
}
```

---

## 6. Responsiveness

| Breakpoint | Comportamiento |
|---|---|
| ≥1200px (xl) | Layout completo, 3-4 columnas cards, sidebar visible |
| 992-1199px (lg) | 3 columnas cards, sidebar debajo del contenido |
| 768-991px (md) | 2 columnas cards, quick links en 2x2 |
| <768px (sm) | 1 columna, cards apiladas, carrusel 1 item |

SharePoint Online tiene sus propios breakpoints para secciones. Los web parts deben ser fluidos dentro de su contenedor y usar `@container` queries cuando sea posible.

---

## 7. Typography Loading Strategy

```html
<!-- Inyectar via Application Customizer en <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&family=Montserrat:wght@600;700&display=swap" rel="stylesheet">
```

**Alternativa sin CDN externo**: Alojar los archivos .woff2 en SharePoint (Site Assets) y cargarlos via @font-face en el Application Customizer.

**Fallback**: Si las fuentes no cargan, el sistema degrada a `system-ui, sans-serif` de forma transparente.

---

## 8. CSS Architecture

```
src/
├── styles/
│   ├── _tokens.scss          (CSS custom properties)
│   ├── _typography.scss       (font-face + type scale)
│   ├── _mixins.scss           (pill-button, pill-input, section-padding)
│   └── _reset.scss            (normalize dentro del scope del web part)
├── components/
│   └── shared/
│       ├── SectionHeading/
│       ├── PillButton/
│       ├── PillTextField/
│       ├── ContentCard/
│       └── StatCounter/
```

Todos los estilos deben estar **scoped** al web part (CSS Modules via `.module.scss`). NUNCA usar selectores globales que contaminen el DOM de SharePoint.

---

## 9. Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Pill inputs pueden tener problemas de accesibilidad con focus ring | Alto | Implementar `outline: 2px solid #5B53FF; outline-offset: 2px` en :focus-visible |
| #5B53FF sobre blanco tiene ratio ~4.0:1 (borderline AA) | Medio | Usar #4A42E0 como alternativa para texto sobre blanco — ratio ~5.2:1 |
| Montserrat/Lato incrementan el tiempo de carga inicial | Bajo-Medio | Usar `display=swap`, limitar weights a 400,600,700 |
| Carruseles sin librería externa pueden ser limitados | Bajo | CSS scroll-snap cubre el 90% de los casos; evaluar si se necesita más |
| Los estilos pill de TextField requieren overrides agresivos de Fluent | Medio | Crear wrapper PillTextField una vez y reutilizar |
| Estilos pueden colisionar con el theme corporativo de SharePoint | Alto | Scoping estricto con CSS Modules; no tocar variables globales de SP |

---

## 10. Checklist de Implementación

- [ ] Application Customizer para inyectar Google Fonts (o font-face local)
- [ ] Tema Fluent UI con `createTheme()` y paleta Hiberus
- [ ] Fichero `_tokens.scss` con CSS custom properties (incluyendo accent-line, surface, form-bg)
- [ ] Componentes shared: PillButton, PillTextField, SectionHeading, ContentCard, StatCounter, AccentLine, TestimonialCard, AccordionSection, ServiceFeatureCard
- [ ] Hero Banner web part
- [ ] Featured Content Cards web part
- [ ] Quick Links web part
- [ ] KPI Dashboard web part
- [ ] Client/Partner Logo Grid web part (con variante dark)
- [ ] Contact Form web part (con Zod validation + repository pattern)
- [ ] Service Feature Grid web part (con accent line)
- [ ] Testimonial / Quote web part
- [ ] Accordion / FAQ web part
- [ ] Footer via Application Customizer
- [ ] Tests unitarios para todos los componentes y services
- [ ] Validación de accesibilidad con axe-core
- [ ] Test de contraste para todas las combinaciones color/fondo
- [ ] Verificar scoping CSS — sin leaks al DOM de SharePoint
- [ ] Bundle size check — target <250KB por web part
