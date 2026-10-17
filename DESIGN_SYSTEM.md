# Nurul Ilm Library  — UI Design System & Engineering Rules

> **Purpose:** This document is the single source of truth for all UI/UX design, component styling, color schemes, and theme conventions for the Nurul Ilm Library  web application. Any new feature, component, or layout modification **must** adhere strictly to the rules outlined here to preserve institutional aesthetic integrity, contrast compliance, and theme reliability.

---

## 1. Design Philosophy & Identity

The Nurul Ilm Library  digital interface reflects a serious, prestigious academic study environment established in Handwara, Kashmir.

- **Aesthetic Tone:** Academic, trustworthy, serene, distraction-free, and institutional.
- **Atmosphere:** Evokes a modern, well-lit scholarly reading room with quiet study carrels, hardwood reference stacks, and clean digital services.
- **Guiding Principles:**
  - **No Frivolous Decorations:** Avoid emojis in institutional interfaces (use Lucide SVG icons).
  - **High-Contrast Readability:** All text must meet WCAG AA standards. No black-on-black or white-on-white collisions.
  - **Color Discipline:** Stick strictly to the curated palette (Oxford Navy, Academic Blue, Slate neutrals). Avoid arbitrary ad-hoc greens or random hex codes.
  - **Subtle Modernism:** Use crisp borders (`border-slate-200 / border-slate-800`), micro-radius corners (`rounded-lg` / `rounded-xl`), and delicate shadows (`shadow-2xs` / `shadow-xs`). Never use exaggerated floating drop shadows or heavy blur cards.

---

## 2. Core Color Tokens

### 2.1 Brand & Action Colors
| Token Role | Hex Code | Tailwind Utility | Usage |
|---|---|---|---|
| **Oxford Navy** | `#0A192F` | `bg-[#0A192F]`, `border-[#1E3A5F]` | Permanent sidebar background, hero plaques, institutional crest containers. Fixed across both light & dark themes. |
| **Deep Academic Navy** | `#0F2D59` | `bg-[#0F2D59]` | Student welcome plaque, primary banner backgrounds. |
| **Primary Academic Blue** | `#004B87` | `bg-[#004B87]`, `text-[#004B87]` | Primary CTA buttons, active sidebar items, link hover states, focus rings. |
| **Primary Blue Hover** | `#003865` | `hover:bg-[#003865]` | Hover state for primary buttons. |
| **Dark Mode Primary Blue** | `#3B82F6` / `#60A5FA` | `dark:bg-blue-600`, `dark:text-blue-400` | Bright blue accents when rendering on dark backgrounds. |

### 2.2 Surface & Canvas Neutrals
| Element | Light Mode (White Mode) | Dark Mode | Notes |
|---|---|---|---|
| **Page Canvas / Body** | `bg-[#F6F8FB]` | `dark:bg-[#0B0F19]` | Reader background (soft neutral, reduces eye fatigue). Never use raw `#000000` or glaring `#FFFFFF` for full page canvas. |
| **Cards & Modals** | `bg-white` (`#FFFFFF`) | `dark:bg-[#111827]` | Content container surfaces. |
| **Subtle Inset / Inputs** | `bg-[#F6F8FB]` | `dark:bg-[#0B0F19]` | Form fields before focus, table headers, stat pill backgrounds. |
| **Dividers & Borders** | `border-slate-200` (`#E2E8F0`) | `dark:border-slate-800` (`#1E293B`) | Clean dividing lines between cards, rows, and sections. |
| **Input Borders** | `border-slate-300` (`#CBD5E1`) | `dark:border-slate-700` (`#334155`) | Form input borders for sharp field boundaries. |

### 2.3 Typography Colors
| Role | Light Mode | Dark Mode | Notes |
|---|---|---|---|
| **Primary Text** | `text-slate-900` (`#0F172A`) | `dark:text-white` / `dark:text-slate-100` | Headings, primary labels, table values. |
| **Secondary Text** | `text-slate-600` (`#475569`) | `dark:text-slate-400` (`#94A3B8`) | Subtitles, descriptive paragraphs, card descriptions. |
| **Tertiary / Meta** | `text-slate-500` (`#64748B`) | `dark:text-slate-400` (`#94A3B8`) | Section eyebrows, timestamps, breadcrumbs. |
| **Placeholder / Muted** | `text-slate-400` (`#94A3B8`) | `dark:text-slate-500` (`#64748B`) | Input placeholders, inactive icons. |

### 2.4 Status & Semantic Accents
| Status | Light Mode Styles | Dark Mode Styles | Meaning |
|---|---|---|---|
| **Verified / Success** | `bg-emerald-50 text-emerald-800 border-emerald-200` | `dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800` | Verified KYC, active pass, library open now, successful payment. |
| **Pending / Warning** | `bg-amber-50 text-amber-800 border-amber-200` | `dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800` | Pending admin audit, expiring dues, unverified receipt. |
| **Overdue / Error** | `bg-rose-50 text-rose-800 border-rose-200` | `dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800` | Overdue circulation, rejected payment, closed library halls. |
| **Informational** | `bg-blue-50 text-[#004B87] border-blue-200` | `dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800` | Academic alerts, noticeboard announcements, seat allocations. |

---

## 3. Critical Technical Rules (Tailwind CSS v4 & Next.js)

### 3.1 Class-Based Theme Switching (Mandatory)
In Tailwind v4 (`@tailwindcss/postcss`), dark mode defaults to OS media query `@media (prefers-color-scheme: dark)`. If a user's operating system has dark mode enabled, Tailwind will apply dark styles to your light mode pages.

> [!IMPORTANT]
> **Always maintain this declaration in `src/styles/globals.css` directly below `@import "tailwindcss";`:**
> ```css
> @custom-variant dark (&:where(.dark, .dark *));
> ```
> This guarantees the `.dark` class on the `<html>` element is the **only** trigger for dark mode styles.

### 3.2 Heading Specificity Rule (Never Override Heading Color Globally)
Never define generic color overrides on heading tags in global CSS:
```css
/* ❌ FORBIDDEN: This overrides utility classes like text-white on dark banners! */
h1, h2, h3, h4, h5, h6, .font-serif-lib {
  color: var(--foreground);
}

/* ✅ CORRECT: Let headings inherit color and use font-family only */
h1, h2, h3, h4, h5, h6, .font-serif-lib {
  font-family: var(--font-serif);
}
```

### 3.3 Fixed Brand Surfaces (Never Invert Sidebar in Light Mode)
The primary navigation sidebar (`<aside>`) is permanently styled in **Oxford Navy (`#0A192F`)**. 
- ❌ **Never** add global overrides like `html:not(.dark) aside { background: white !important; }`. Doing so turns the sidebar white while its text/icons remain white, causing unreadable navigation.
- ✅ The sidebar stays `#0A192F` across **both** light and dark themes.

---

## 4. Typography & Font Hierarchy

- **Primary Headings (`font-serif-lib`):**
  - Font: `Cormorant Garamond` / `Playfair Display` serif.
  - Used for: Major page titles, hero headlines, stat numbers (`font-serif-lib text-3xl font-bold`).
- **Body & Controls (`font-sans`):**
  - Font: `Inter`, system-ui.
  - Used for: Navigation labels, forms, body text, buttons, tooltips.
- **Code & Identifiers (`font-mono`):**
  - Font: `JetBrains Mono`, monospace.
  - Used for: Transaction IDs, verification tokens, ISBN numbers, timestamps.
- **Section Eyebrows:**
  - Classes: `text-[10px]` or `text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400`.

---

## 5. Reusable Component Specifications

### 5.1 Buttons
- **Primary Action Button:**
  ```jsx
  <button className="flex items-center justify-center gap-2 bg-[#004B87] hover:bg-[#003865] dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition disabled:opacity-50 text-xs shadow-2xs cursor-pointer">
    <Icon size={15} />
    <span>Action Title</span>
  </button>
  ```
- **Secondary / Outline Button:**
  ```jsx
  <button className="flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold py-2 px-3.5 rounded-lg transition text-xs cursor-pointer">
    <Icon size={14} />
    <span>Secondary Action</span>
  </button>
  ```

### 5.2 Form Inputs
- **Text / Number Field:**
  ```jsx
  <input
    type="text"
    className="w-full px-3 py-2 bg-[#F6F8FB] dark:bg-[#0B0F19] border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-[#111827] focus:border-[#004B87] dark:focus:border-blue-400 focus:ring-1 focus:ring-[#004B87] transition shadow-2xs"
    placeholder="Enter value…"
  />
  ```

### 5.3 Metric & Stat Cards
- **Dashboard Stat Card:**
  ```jsx
  <div className="rounded-xl p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-xs">
    <div className="flex items-center justify-between mb-2">
      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        Metric Title
      </span>
      <div className="w-8 h-8 rounded-lg bg-slate-100 text-[#004B87] dark:bg-slate-800 dark:text-slate-300 flex items-center justify-center">
        <Icon size={16} />
      </div>
    </div>
    <p className="font-serif-lib text-3xl font-bold text-slate-900 dark:text-white">
      {value}
    </p>
    <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
  </div>
  ```

### 5.4 Empty State
- Always use the centralized `EmptyState` component (`src/components/common/EmptyState.jsx`) instead of ad-hoc placeholders:
  ```jsx
  <EmptyState
    icon={BookOpen}
    title="No Books Found"
    description="Try adjusting your title, author, or subject search query."
    actionText="Clear Search"
    onAction={resetQuery}
  />
  ```

---

## 6. Pre-Commit Verification Checklist

Whenever creating or modifying any view or component, verify the following before committing:

1. **Test in White Mode:** Open the browser with `.dark` removed from `<html>` or toggle to Daylight mode.
   - [ ] Page background is calm `#F6F8FB`, not pitch black or raw blinding white.
   - [ ] Headings are high-contrast `#0F172A` (or `text-white` if resting on navy plaques).
   - [ ] Card surfaces are `#FFFFFF` with distinct `border-slate-200`.
   - [ ] Inputs have visible `border-slate-300` and legible `#0F172A` text.
2. **Test in Dark Mode:** Toggle to Night mode (`.dark` on `<html>`).
   - [ ] Background is deep `#0B0F19`, cards are `#111827`.
   - [ ] Headings and body texts are bright `text-white` or `text-slate-100`.
   - [ ] Borders are soft `border-slate-800`.
3. **Sidebar Integrity:** Confirm that the sidebar remains Oxford Navy (`#0A192F`) in both modes.
4. **No Console Contrast Warnings:** Verify that icons and status badges are clearly legible against their parent backgrounds.
