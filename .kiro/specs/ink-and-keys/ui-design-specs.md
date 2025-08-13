# Ink & Keys UI Design Specifications

## 1. Brand Overview

### Mission
Create a digital writing space that adapts to the user's creative mood — whether modern, vintage, playful, professional, cottagecore, or gothic — while maintaining focus, inspiration, and delight.

### Core Values
- **Personalization**: Adaptive themes that match creative moods
- **Immersive creativity**: Deep focus writing environment
- **Minimal distraction, maximum imagination**: Clean, inspiring interface

## 2. Color System

### 2.1 Core Palette
All colors meet WCAG AA contrast ratios for text and background combinations.

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Ink Black | #1A1A1A | (26, 26, 26) | Text on light backgrounds, dark mode base |
| Parchment White | #F9F6F0 | (249, 246, 240) | Light mode background |
| Accent Red | #D96459 | (217, 100, 89) | CTAs, highlights, active states |
| Golden Tan | #C99E6F | (201, 158, 111) | Borders, secondary accents |
| Soft Gray | #ECECEC | (236, 236, 236) | Neutral backgrounds, dividers |

### 2.2 Theme Variations

#### Default Light Mode
- Background: #FFFDFC (255, 253, 252)
- Primary Text: #2A2A2A (42, 42, 42)
- Secondary Text: #555555 (85, 85, 85)
- Primary Accent: #D96459
- Borders: #E6E6E6

#### Default Dark Mode
- Background: #0E0E0E (14, 14, 14)
- Primary Text: #F5F5F5 (245, 245, 245)
- Secondary Text: #CCCCCC (204, 204, 204)
- Primary Accent: #A77979
- Borders: #333333

#### Modern Theme
- Primary: #2E3440 (46, 52, 64)
- Accent: #88C0D0 (136, 192, 208)
- Highlight: #D08770 (208, 135, 112)
- Background: #ECEFF4 (236, 239, 244)

#### Vintage Theme
- Primary: #E7D8C9 (231, 216, 201)
- Accent: #B2967D (178, 150, 125)
- Highlight: #85586F (133, 88, 111)
- Background: #F5E8DF (245, 232, 223)

#### Playful Theme
- Primary: #FFF3B0 (255, 243, 176)
- Accent: #E07A5F (224, 122, 95)
- Highlight: #3D405B (61, 64, 91)
- Background: #F2CC8F (242, 204, 143)

#### Cottagecore Theme
- Primary: #F2E8CF (242, 232, 207)
- Accent: #A3B18A (163, 177, 138)
- Highlight: #588157 (88, 129, 87)
- Background: #F5F3E7 (245, 243, 231)

#### Goth Theme
- Primary: #0B0B0B (11, 11, 11)
- Accent: #3A3A3A (58, 58, 58)
- Highlight: #B30059 (179, 0, 89)
- Background: #151515 (21, 21, 21)

### Color Usage Guidelines

#### Do's ✔
- Use theme background + text combinations as defined
- Maintain accessible contrast (≥ 4.5:1)
- Use accent colors sparingly to emphasize key actions

#### Don'ts ✘
- Use more than 2 accent colors in a single view
- Place accent text on accent backgrounds without contrast check

## 3. Typography System

### 3.1 Font Families

#### Headings / Creative Accents
Theme-specific decorative serif or script fonts:
- **Modern**: Playfair Display
- **Vintage**: Cormorant Garamond
- **Playful**: Pacifico or Fredoka
- **Cottagecore**: Quicksand
- **Goth**: Cinzel Decorative

#### Body / Paragraphs
Inter, Merriweather, or IBM Plex Serif (theme-dependent)

### 3.2 Font Sizes

| Role | Size (px) | Weight | Line Height | Usage |
|------|-----------|--------|-------------|-------|
| H1 | 48 | 700 | 1.2 | Page title |
| H2 | 36 | 600 | 1.3 | Section title |
| H3 | 28 | 500 | 1.3 | Subsection |
| Body Large | 18 | 400 | 1.5 | Reading text |
| Body Small | 16 | 400 | 1.5 | Secondary text |
| Caption | 14 | 400 | 1.4 | Metadata, labels |

### Typography Guidelines

#### Do's ✔
- Keep body font size ≥16px for readability
- Use heading fonts only for titles, not long paragraphs

#### Don'ts ✘
- Mix more than 2 font families on one page
- Overuse decorative fonts for small text

## 4. Spacing & Grid System

### 4.1 Spacing Scale (8px base unit)
4px (XXS) → 8px (XS) → 16px (S) → 24px (M) → 32px (L) → 48px (XL) → 64px (XXL)

#### Rules
- Vertical rhythm: multiples of 8px
- Horizontal padding inside components: at least 16px

### 4.2 Grid System
- **Desktop**: 12-column grid, 72px margins, 24px gutters
- **Tablet**: 8-column grid, 32px margins, 16px gutters
- **Mobile**: 4-column grid, 16px margins, 16px gutters

## 5. Component Guidelines

### 5.1 Buttons

#### Primary Buttons
- Solid accent background, white text, rounded 8px

#### Secondary Buttons
- Outline style with 2px border, text in accent color

#### Button States
- **Hover**: Slight scale-up (1.05x), subtle shadow
- **Active**: Scale-down (0.98x), deeper shadow
- **Disabled**: 50% opacity, no shadow

#### Button Guidelines

##### Do's ✔
- Maintain consistent button heights
- Use primary buttons for main actions per screen

##### Don'ts ✘
- Place two primary buttons next to each other

### 5.2 Writing Canvas
- **Background**: Theme background or parchment texture
- **Text Alignment**: Left by default, justified optional
- **Margins**: 48px left/right on desktop, 24px on mobile

### 5.3 OCR Upload Component
- **Style**: Drag-and-drop area styled as an open sketchbook
- **Border**: Dashed border in accent color
- **Hover Animation**: Doodles appear along the edges

### 5.4 Navigation
- **Primary**: Persistent top nav for primary actions
- **Secondary**: Floating chapter ribbon on right side for quick navigation

## 6. Interaction Patterns (Toggleable Features)

### 6.1 Ink Flow Animation
- **Trigger**: On typing, a faint ink line appears under each new word and fades in 1s

### 6.2 Idea Sparks Mode
- **Trigger**: No typing for 30s → Fade-in inspiration bubble with dismiss option

### 6.3 Story Threads
- **Trigger**: Highlighted text expands a side panel linked with a connecting line

## 7. Accessibility Requirements

### Minimum Standards
- All clickable areas ≥44x44px
- Text contrast ratio ≥4.5:1
- Provide motion-reduction option for animations
- Keyboard navigation support
- Screen reader compatibility

### Implementation Notes
- Use semantic HTML elements
- Provide alt text for images
- Include focus indicators
- Support high contrast mode
- Offer font size adjustment options

## 8. Implementation Guidelines

### CSS Custom Properties Structure
```css
:root {
  /* Core Palette */
  --ink-black: #1A1A1A;
  --parchment-white: #F9F6F0;
  --accent-red: #D96459;
  --golden-tan: #C99E6F;
  --soft-gray: #ECECEC;
  
  /* Spacing Scale */
  --space-xxs: 4px;
  --space-xs: 8px;
  --space-s: 16px;
  --space-m: 24px;
  --space-l: 32px;
  --space-xl: 48px;
  --space-xxl: 64px;
  
  /* Typography */
  --font-size-h1: 48px;
  --font-size-h2: 36px;
  --font-size-h3: 28px;
  --font-size-body-large: 18px;
  --font-size-body-small: 16px;
  --font-size-caption: 14px;
}
```

### Theme Switching Implementation
- Use CSS custom properties for theme values
- Implement theme context provider in React
- Store theme preference in localStorage
- Provide smooth transitions between themes

### Responsive Design Breakpoints
- Mobile: 320px - 768px
- Tablet: 768px - 1024px
- Desktop: 1024px+

This specification serves as the single source of truth for all UI design decisions in the Ink & Keys application.