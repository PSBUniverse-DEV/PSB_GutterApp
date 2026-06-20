## Revised Analysis & Fix Plan

You're right — I missed several critical issues. Let me lay out the full scope of problems and the fix plan.

### Issue 1: Colors Not Saved During Project Auto-Sync

**Root Cause** in `gutter.actions.js` (lines 192-212):
- `sectionData` passes empty strings for `gutterColor` and `downspoutColor` (lines 197-198)
- PO payload sets `k_style_gutter_color: null` and `downspout_color: null` (lines 211-212)
- The `calculateMaterials()` function can't resolve colors from empty strings, so it returns `"--"` for all colors

**Fix**: Resolve color IDs to color names from the database during auto-sync, then pass them to both PO and WO records.

### Issue 2: Print View Not WYSIWYG

**Problems found** comparing `GutterPrintView.jsx` (screen) vs `GutterPdfDocuments.jsx` (PDF):

| Section | Print View (Screen) | PDF |
|---|---|---|
| **Work Order - Installer Info** | Missing installer name, install date, signature, signature date fields | Shows blank lines for installer details |
| **Work Order - DSP Assignments** | Missing entirely | Shows DSP# table with assigned values |
| **Work Order - Zip Screws** | Missing entirely | Shows zip screws bags |
| **Work Order - Notes** | Shows empty notes box | Shows notes text if present |
| **Purchase Order - Spray Paint** | Missing | Shows spray paint row |
| **Purchase Order - Zip Screws** | Missing | Shows zip screws row |
| **Purchase Order - Box Screws** | Missing | Shows box screws row |

**Fix**: Update the screen print view components (`WorkOrderDocument`, `PurchaseOrderDocument`) to match the PDF output.

### Issue 3: Thorough Page Review

**Project Page** (`GutterProjectFormView.jsx`):
- Print button navigates to `/gutter/{id}/print` — OK
- Save button auto-syncs PO/WO — needs color fix above

**Purchase Order Page** (`GutterPurchaseOrderView.jsx`):
- Print button opens `/gutter/{id}/print` in new tab — OK
- Save button saves to `gtr_m_purchorder` — OK
- Colors are calculated from `calculateMaterials()` — OK since it uses project sides data

**Work Order Page** (`GutterWorkOrderView.jsx`):
- Print button now navigates to `/gutter/{id}/print` (already fixed) — OK
- Save button saves to `gtr_t_workorders` — OK
- Colors are calculated from `calculateMaterials()` — OK

### Summary of Changes Needed

1. **`gutter.actions.js`** — Fix auto-sync to resolve color names from color IDs and save them to PO/WO
2. **`GutterPrintView.jsx`** — Update `WorkOrderDocument` and `PurchaseOrderDocument` to match PDF output (WYSIWYG)

## Clarified Fix Plan

Now I understand. The issue is specifically in the **auto-sync** section of `gutter.actions.js` — when the project is saved, the auto-sync creates/updates PO and WO records but **colors are set to null/empty** because the code doesn't resolve color IDs to color names.

### What needs to happen in `gutter.actions.js` (saveGutterProject):

The `sectionData` on line 192-199 passes `gutterColor: ""` and `downspoutColor: ""` to `calculateMaterials()`. Since empty strings can't match color IDs, `calculateMaterials()` returns `"--"` for all colors.

**Fix**: Resolve the color IDs (`gutter_color_id`, `downspout_color_id`) from the side rows to actual color names using a lookup, then pass them to `calculateMaterials()` so the PO payload gets proper color values.

**Example**: If a side row has `gutter_color_id: 5`, we need to look up color_id=5 from `gtr_s_colors` → get the name → pass `"Brown"` as `gutterColor` in sectionData.

This populates all 10 listed items with their correct colors in both PO and WO records.

Does this plan look correct? If so, please toggle to **Act mode** and I'll implement the fix in `gutter.actions.js`.