"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Container, Row, Col, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCheck, faPrint, faBoxOpen, faUpRightFromSquare, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { Button, toastError, toastSuccess } from "@/shared/components/ui";
import { savePurchaseOrder } from "../data/gutter.actions";
import { calculateMaterials } from "../data/gutter.data";
import styles from "./GutterPurchaseOrder.module.css";

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatNumber = (value, fractionDigits = 2) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "0";
  return numeric.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: fractionDigits });
};

export default function GutterPurchaseOrderView({ projectId, projectData, storedPurchaseOrder }) {
  const header = projectData?.projectHeader || null;

  const sides = useMemo(() => projectData?.projectSides || [], [projectData?.projectSides]);
  const colors = useMemo(() => projectData?.colors || [], [projectData?.colors]);

  const [manualInputs, setManualInputs] = useState(() => {
    const stored = storedPurchaseOrder;
    return {
      zipScrewsQty: String(toNumber(stored?.zip_screws_qty)),
      sprayPaintQty: String(toNumber(stored?.spray_paint_qty)),
      boxScrewsQty: String(toNumber(stored?.box_screws_qty)),
    };
  });
  const [saving, setSaving] = useState(false);

  const colorById = useMemo(() => {
    const map = {};
    (Array.isArray(colors) ? colors : []).forEach((c) => { map[String(c.color_id)] = c.name; });
    return map;
  }, [colors]);

  const materialSource = useMemo(() => {
    const sections = (Array.isArray(sides) ? sides : []).map((side) => {
      const gutterColor = colorById[String(side.gutter_color_id)] || "";
      const downspoutColor = colorById[String(side.downspout_color_id)] || gutterColor || "";
      return {
        sides: toNumber(side.segments),
        length: toNumber(side.length),
        height: toNumber(side.height),
        downspoutQty: toNumber(side.downspout_qty),
        gutterColor,
        downspoutColor,
      };
    });
    return { sections };
  }, [sides, colorById]);

  const materials = useMemo(() => {
    return calculateMaterials({
      ...materialSource,
      zipScrewsQty: manualInputs.zipScrewsQty,
      sprayPaintQty: manualInputs.sprayPaintQty,
      boxScrewsQty: manualInputs.boxScrewsQty,
    });
  }, [materialSource, manualInputs]);

  const handleManualInputChange = (field, value) => {
    setManualInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = useCallback(async () => {
    if (!projectId || !materials) return;
    setSaving(true);
    try {
      await savePurchaseOrder(projectId, {
        k_style_gutter_color: materials.colors.kStyleGutterColor,
        downspout_color: materials.colors.downspoutColor,
        gutter_coil_total_ft: materials.gutterCoil.totalFt,
        gutter_coil_total_lbs: materials.gutterCoil.totalLbs,
        right_end_caps_qty: materials.endCaps.right.qty,
        left_end_caps_qty: materials.endCaps.left.qty,
        downpipe_qty: materials.downpipe.qty,
        one_piece_offset_qty: materials.onePieceOffset.qty,
        elbow_a_qty: materials.elbow.qty,
        spray_paint_qty: materials.sprayPaint.qty,
        zip_screws_qty: materials.zipScrews.qty,
        zip_screws_internal_qty: materials.internal.internalScrews,
        total_downspouts: materials.internal.totalDownspouts,
        total_endcaps: materials.internal.totalEndcaps,
        rectangular_outlets: materials.internal.rectangularOutlets,
        internal_screws: materials.internal.internalScrews,
        hidden_hangers_qty: materials.internal.hiddenHangers,
        box_screws_qty: materials.internal.boxScrews,
      });
      toastSuccess("Purchase order saved.", "Purchase Order");
    } catch (err) {
      toastError(err?.message || "Unable to save purchase order.", "Purchase Order");
    } finally {
      setSaving(false);
    }
  }, [projectId, materials]);

  if (!header || !materials) return <Container className="py-4">Project not found.</Container>;

  return (
    <div className={styles.poPage}>
      {/* ─── Compact Top Header ─── */}
      <div className={styles.poHeader}>
        <div className={styles.poHeaderLeft}>
          <Link href={`/gutter/${projectId}`} className={styles.poBackLink}>
            <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" />
          </Link>
          <div className={styles.poHeaderTitle}>
            <h1 className={styles.poTitle}>Purchase Order</h1>
            <span className={styles.poSubtitle}>{header.project_name || `PO# ${header.proj_id}`}</span>
          </div>
          <div className={styles.poHeaderMeta}>
            <div className={styles.poMetaItem}>
              <span className={styles.poMetaLabel}>Customer</span>
              <span className={styles.poMetaValue}>{header.customer || "--"}</span>
            </div>
            <div className={styles.poMetaItem}>
              <span className={styles.poMetaLabel}>Date</span>
              <span className={styles.poMetaValue}>{header.date || "--"}</span>
            </div>
            <div className={styles.poMetaItem}>
              <span className={styles.poMetaLabel}>Address</span>
              <span className={styles.poMetaValue}>{header.project_address || "--"}</span>
            </div>
          </div>
        </div>
        <div className={styles.poHeaderActions}>
          {header.request_link && (
            <Button variant="secondary" onClick={() => window.open(header.request_link, "_blank", "noopener,noreferrer")}>
              <FontAwesomeIcon icon={faUpRightFromSquare} className="me-1" /> Source Sheet
            </Button>
          )}
          <Button variant="secondary" onClick={() => window.open(`/gutter/${projectId}/print`, "_blank")}>
            <FontAwesomeIcon icon={faPrint} className="me-1" /> Print
          </Button>
          <Button variant="success" onClick={handleSave} disabled={saving} loading={saving}>
            <FontAwesomeIcon icon={faCheck} className="me-1" /> Save
          </Button>
        </div>
      </div>

      {/* ─── Workspace Body ─── */}
      <div className={styles.poBody}>
        {/* ─── Main Content ─── */}
        <div className={styles.poMain}>

          {/* Material Fields */}
          <div className={styles.poSection}>
            <div className={styles.poSectionHeader}>
              <FontAwesomeIcon icon={faBoxOpen} /> Material Fields
            </div>
            <div className={styles.poSectionBody}>
              <div className={styles.poMaterialList}>
                <div className={`${styles.poMaterialRow} ${styles.poMaterialRowHeader}`}>
                  <span className={styles.poMaterialName}>Field</span>
                  <span className={styles.poMaterialQty}>Qty / Value</span>
                  <span className={styles.poMaterialColor}>Color / Note</span>
                </div>
                <div className={styles.poMaterialRow}>
                  <span className={styles.poMaterialName}>K-Style Gutter Color</span>
                  <span className={styles.poMaterialQty}>--</span>
                  <span className={styles.poMaterialColor}>{materials.colors.kStyleGutterColor}</span>
                </div>
                <div className={styles.poMaterialRow}>
                  <span className={styles.poMaterialName}>Downspout Color</span>
                  <span className={styles.poMaterialQty}>--</span>
                  <span className={styles.poMaterialColor}>{materials.colors.downspoutColor}</span>
                </div>
                <div className={styles.poMaterialRow}>
                  <span className={styles.poMaterialName}>Gutter Coil 15&quot;</span>
                  <span className={styles.poMaterialQty}>{formatNumber(materials.gutterCoil.totalFt)} ft</span>
                  <span className={styles.poMaterialColor}>{materials.gutterCoil.color} ({formatNumber(materials.gutterCoil.totalLbs, 3)} lbs)</span>
                </div>
                <div className={styles.poMaterialRow}>
                  <span className={styles.poMaterialName}>Right End Caps - 6&quot; K-Style</span>
                  <span className={styles.poMaterialQty}>{formatNumber(materials.endCaps.right.qty)}</span>
                  <span className={styles.poMaterialColor}>{materials.endCaps.right.color}</span>
                </div>
                <div className={styles.poMaterialRow}>
                  <span className={styles.poMaterialName}>Left End Caps - 6&quot; K-Style</span>
                  <span className={styles.poMaterialQty}>{formatNumber(materials.endCaps.left.qty)}</span>
                  <span className={styles.poMaterialColor}>{materials.endCaps.left.color}</span>
                </div>
                <div className={styles.poMaterialRow}>
                  <span className={styles.poMaterialName}>3&quot; x 4&quot; Downpipe 10&apos;ft</span>
                  <span className={styles.poMaterialQty}>{formatNumber(materials.downpipe.qty)}</span>
                  <span className={styles.poMaterialColor}>{materials.downpipe.color}</span>
                </div>
                <div className={styles.poMaterialRow}>
                  <span className={styles.poMaterialName}>3&quot; x 4&quot; - 6&quot; One Piece Offset</span>
                  <span className={styles.poMaterialQty}>{formatNumber(materials.onePieceOffset.qty)}</span>
                  <span className={styles.poMaterialColor}>{materials.onePieceOffset.color}</span>
                </div>
                <div className={styles.poMaterialRow}>
                  <span className={styles.poMaterialName}>3&quot; x 4&quot; -(A) Elbow</span>
                  <span className={styles.poMaterialQty}>{formatNumber(materials.elbow.qty)}</span>
                  <span className={styles.poMaterialColor}>{materials.elbow.color}</span>
                </div>
                <div className={styles.poMaterialRow}>
                  <span className={styles.poMaterialName}>Spray Paint for Touch up</span>
                  <span className={styles.poMaterialQty}>
                    <Form.Control size="sm" type="number" min="0" step="1" className={styles.poInlineInput} value={manualInputs.sprayPaintQty} onChange={(e) => handleManualInputChange("sprayPaintQty", e.target.value)} />
                  </span>
                  <span className={styles.poMaterialColor}>{materials.sprayPaint.color}</span>
                </div>
                <div className={styles.poMaterialRow}>
                  <span className={styles.poMaterialName}>#8 x 1/2&quot; Zip Screws</span>
                  <span className={styles.poMaterialQty}>
                    <Form.Control size="sm" type="number" min="0" step="1" className={styles.poInlineInput} value={manualInputs.zipScrewsQty} onChange={(e) => handleManualInputChange("zipScrewsQty", e.target.value)} />
                  </span>
                  <span className={styles.poMaterialColor}>{materials.zipScrews.color}</span>
                </div>
                <div className={styles.poMaterialRow}>
                  <span className={styles.poMaterialName}>#8 x 1/2&quot; Zip Screws</span>
                  <span className={styles.poMaterialQty}>{formatNumber(materials.internal.internalScrews)}</span>
                  <span className={styles.poMaterialColor}>Internal Use Only</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Sidebar ─── */}
        <div className={styles.poSidebar}>

          {/* Internal Information */}
          <div className={`${styles.poSection} ${styles.poSectionInternal}`}>
            <div className={`${styles.poSectionHeader} ${styles.poSectionHeaderDanger}`}>
              <FontAwesomeIcon icon={faTriangleExclamation} /> Internal (Do Not Print)
            </div>
            <div className={styles.poSectionBody}>
              <div className={styles.poInternalList}>
                <div className={styles.poInternalRow}>
                  <span className={styles.poInternalLabel}>Total Downspouts</span>
                  <span className={styles.poInternalValue}>{formatNumber(materials.internal.totalDownspouts)}</span>
                </div>
                <div className={styles.poInternalRow}>
                  <span className={styles.poInternalLabel}>Total Endcaps</span>
                  <span className={styles.poInternalValue}>{formatNumber(materials.internal.totalEndcaps)}</span>
                </div>
                <div className={styles.poInternalRow}>
                  <span className={styles.poInternalLabel}>3&quot; x 4&quot; Rectangular Outlets</span>
                  <span className={styles.poInternalValue}>{formatNumber(materials.internal.rectangularOutlets)}</span>
                </div>
                <div className={styles.poInternalRow}>
                  <span className={styles.poInternalLabel}>Qty of Screws (Internal)</span>
                  <span className={styles.poInternalValue}>{formatNumber(materials.internal.internalScrews)}</span>
                </div>
                <div className={styles.poInternalRow}>
                  <span className={styles.poInternalLabel}>6&quot; Hidden Hangers</span>
                  <span className={styles.poInternalValue}>{formatNumber(materials.internal.hiddenHangers)}</span>
                </div>
                <div className={styles.poInternalRow}>
                  <span className={styles.poInternalLabel}>Box Metal Screws (Hangers)</span>
                  <span className={styles.poInternalValue}>
                    <Form.Control size="sm" type="number" min="0" step="1" className={styles.poInlineInput} value={manualInputs.boxScrewsQty} onChange={(e) => handleManualInputChange("boxScrewsQty", e.target.value)} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
