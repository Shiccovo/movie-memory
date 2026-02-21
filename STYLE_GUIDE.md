# iOS-Style UI Design System

This project uses a clean, modern iOS-inspired design system built with Tailwind CSS and custom CSS utilities.

## Design Principles

- **Clean & Simple** — Minimal visual elements, focus on content
- **Translucent Cards** — Frosted glass effect with backdrop blur
- **Smooth Interactions** — Transitions and hover effects for feedback
- **Accessible** — Proper contrast, readable typography
- **Dark Mode Support** — Full light/dark theme support

## Color Palette

### Light Mode
- **Background** — `#f5f5f7` (light gray)
- **Foreground** — `#1d1d1f` (near black)
- **Card Background** — `rgba(255, 255, 255, 0.8)` (translucent white)
- **Text Secondary** — `#86868b` (gray)
- **Accent** — `#007aff` (iOS blue)

### Dark Mode
- **Background** — `#000000` (pure black)
- **Foreground** — `#f5f5f7` (light gray)
- **Card Background** — `rgba(255, 255, 255, 0.1)` (translucent white)
- **Text Secondary** — `#a1a1a6` (light gray)
- **Accent** — `#0a84ff` (lighter blue)

### Status Colors
- **Success** — `#34c759` (green)
- **Danger** — `#ff3b30` (red)
- **Warning** — `#ff9500` (orange)

## CSS Classes

### Cards
```html
<div class="ios-card p-6 space-y-4">
  <!-- Card content -->
</div>
```

Features:
- Rounded corners (`rounded-2xl`)
- Translucent background with blur effect (`backdrop-blur-xl`)
- Subtle border
- Soft shadow

### Buttons

**Primary Button**
```html
<button class="ios-button">Button text</button>
```

**Secondary Button**
```html
<button class="ios-button-secondary">Button text</button>
```

Features:
- Smooth transitions
- Hover scale effect (`scale-105`)
- Disabled state support
- Full width option with `w-full`

### Inputs
```html
<input class="ios-input" type="text" placeholder="..." />
```

Features:
- Rounded corners
- Focus state with blue highlight and subtle shadow
- Inherits card styling for consistency

### Text Utilities
```html
<p class="text-secondary">Secondary text</p>
<p class="text-danger">Error message</p>
<p class="text-success">Success message</p>
<p class="text-warning">Warning message</p>
```

## Component Usage Examples

### Home Page
- Uses centered card layout with gradient title
- Sign-in button in translucent card

### Onboarding Page
- Form inputs with iOS styling
- Error alerts in colored cards
- Helper text under inputs

### Dashboard
- User header with translucent card
- Movie section with edit mode
- Fact section with loading spinner
- Gradient background for displayed movie

### Loading States
```html
<div class="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
```

### Error Messages
```html
<div class="ios-card p-4 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
  <p role="alert" class="text-danger font-medium text-sm">Error message</p>
</div>
```

## Tailwind Classes Used

### Layout
- `flex`, `flex-col`, `items-center`, `justify-center`
- `gap-*`, `space-*` for spacing
- `max-w-*` for width constraints
- `px-*`, `py-*`, `p-*` for padding

### Typography
- `text-xl`, `text-2xl`, `text-3xl` for headings
- `font-bold`, `font-semibold`, `font-medium` for font weight
- `text-secondary` for muted text
- `break-words` for long text

### Effects
- `backdrop-blur-xl` for card blur
- `transition-all duration-200` for smooth animations
- `scale-105` for button hover
- `animate-spin` for loading spinner

## Responsive Design

- Mobile-first approach
- Cards use padding for consistent spacing
- Inputs are `w-full` for mobile
- Layout uses `max-w-md` or `max-w-2xl` for desktop

## Dark Mode

The design system automatically adapts to dark mode using:
- CSS custom properties with `@media (prefers-color-scheme: dark)`
- Tailwind's `dark:` prefix for specific overrides
- Color adjustments for readability in both themes

## Animation & Transitions

- Button hover: `scale-105` with shadow
- All elements: `transition-all duration-200` for smooth effects
- Loading spinner: `animate-spin` with border style

## Best Practices

1. **Use `ios-card`** for container elements
2. **Use `ios-button`** for primary actions, **`ios-button-secondary`** for alternatives
3. **Use `ios-input`** for all form inputs
4. **Add `space-*` and `gap-*`** classes instead of custom margins
5. **Use `text-secondary`** for muted text
6. **Add `w-full`** to buttons and inputs for full-width layouts
7. **Wrap error messages** in colored cards with proper semantics (`role="alert"`)
