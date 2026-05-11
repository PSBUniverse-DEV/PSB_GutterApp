# Toolbar Button Styling — Consistency Issue

## What I noticed

The gutter project form toolbar (`GutterProjectFormView.jsx`) has three action buttons that use **different styling approaches**:

| Button | Current Implementation | Look |
|---|---|---|
| Save Project | `<Button variant="success">` (shared UI, filled green) | Solid filled |
| Work Order | `<Link className="btn btn-outline-primary btn-sm">` (raw Bootstrap) | Outlined |
| Print / PDF | `<Button variant="secondary">` (shared UI, filled gray) | Solid filled |

The outlined "Work Order" button looks cleaner and more in line with modern SaaS UI — the filled buttons feel heavy when grouped together in a toolbar. Most SaaS apps (Stripe, Linear, Notion) use outlined or ghost buttons for secondary actions and only fill the primary CTA.

## Suggestion

Adopt an **outlined style as the default for toolbar actions**, keeping only the primary CTA (Save) as a filled button. Something like:

```
Save Project  →  filled (primary CTA, keep filled to draw attention)
Work Order    →  outlined (secondary action, already looks good)
Print / PDF   →  outlined (secondary action)
```

This means adding outline variants to the shared `<Button>` component. Right now the only way to get an outlined button is to bypass the shared UI entirely with raw Bootstrap classes, which defeats the purpose of having it.

## What needs to change

### 1. `Button.js` — Add outline variants

The current `ALLOWED_VARIANTS` set:
```js
const ALLOWED_VARIANTS = new Set(["primary", "secondary", "danger", "success", "warning", "restore", "ghost"]);
```

Add these:
```js
const ALLOWED_VARIANTS = new Set([
  "primary", "secondary", "danger", "success", "warning", "restore", "ghost",
  "outline-primary", "outline-secondary", "outline-danger", "outline-success"
]);
```

In the `variantClassMap` / `bootstrapVariant` logic, outline variants need to pass through to Bootstrap as `outline-primary`, `outline-secondary`, etc. and get their own CSS class:
```js
const isOutline = normalizedVariant.startsWith("outline-");
const bootstrapVariant = isOutline ? normalizedVariant : (variantClassMap[normalizedVariant] || normalizedVariant);
```

And in the `mergedClassName` array, add:
```js
isOutline ? "psb-ui-button-outline" : "",
```

### 2. `globals.css` — Add outline CSS

Place this after the existing `.psb-ui-button-restore:hover` block (~line 363):

```css
/* ── Outline button variants ── */
.psb-ui-button-outline {
  background: transparent;
}

.psb-ui-button.btn-outline-primary {
  color: var(--psb-action-edit);
  border-color: var(--psb-action-edit);
  background: transparent;
}
.psb-ui-button.btn-outline-primary:hover:not(:disabled) {
  background-color: var(--psb-action-edit);
  border-color: var(--psb-action-edit);
  color: #fff;
}

.psb-ui-button.btn-outline-secondary {
  color: var(--psb-action-cancel);
  border-color: var(--psb-action-cancel);
  background: transparent;
}
.psb-ui-button.btn-outline-secondary:hover:not(:disabled) {
  background-color: var(--psb-action-cancel);
  border-color: var(--psb-action-cancel);
  color: #fff;
}

.psb-ui-button.btn-outline-danger {
  color: var(--psb-action-delete);
  border-color: var(--psb-action-delete);
  background: transparent;
}
.psb-ui-button.btn-outline-danger:hover:not(:disabled) {
  background-color: var(--psb-action-delete);
  border-color: var(--psb-action-delete);
  color: #fff;
}

.psb-ui-button.btn-outline-success {
  color: var(--psb-action-add);
  border-color: var(--psb-action-add);
  background: transparent;
}
.psb-ui-button.btn-outline-success:hover:not(:disabled) {
  background-color: var(--psb-action-add);
  border-color: var(--psb-action-add);
  color: #fff;
}
```

This keeps it consistent with the existing token system (`--psb-action-edit`, `--psb-action-cancel`, etc.) so outline buttons use the same color palette as their filled counterparts.

### 3. Usage after the change

```jsx
<Button variant="success" onClick={saveProject}>Save Project</Button>
<Button variant="outline-primary" onClick={() => router.push(`/gutter/${projectId}/work-order`)}>Work Order</Button>
<Button variant="outline-secondary" onClick={() => window.print()}>Print / PDF</Button>
```

No more raw `<Link className="btn btn-outline-...">` — everything goes through the shared component.

## Scope

This applies to the gutter module toolbar right now, but the same pattern will show up in any module that has a detail page with multiple actions. Worth considering as a shared UI improvement.
