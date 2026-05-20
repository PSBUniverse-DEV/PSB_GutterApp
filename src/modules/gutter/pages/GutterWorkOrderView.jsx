"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Container, Row, Col, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCheck, faPrint, faRulerCombined, faBoxOpen, faSignsPost } from "@fortawesome/free-solid-svg-icons";
import { faBuilding, faPenToSquare, faIdBadge, faNoteSticky } from "@fortawesome/free-regular-svg-icons";
import { Button, toastInfo } from "@/shared/components/ui";
import { calculateMaterials } from "../data/gutter.data";
import styles from "./GutterWorkOrder.module.css";

const MAX_SIZE_ROWS = 4;
const MAX_DSP_ROWS = 8;

const toDisplay = (value) => {
  if (value === null || value === undefined || value === "") return "";
  return String(value);
};

const toWholeDisplay = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return "0";
  return String(Math.round(parsed));
};

const toDecimalDisplay = (value, digits = 2) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return "0";
  return parsed.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: digits });
};

export default function GutterWorkOrderView({ projectId, projectData }) {
  const header = projectData?.projectHeader || null;
  const sides = projectData?.projectSides || [];
  const colors = projectData?.colors || [];

  const [workOrder, setWorkOrder] = useState({
    installerName: "",
    installDate: "",
    notes: "",
    installerSignature: "",
    signatureDate: "",
    downspoutAssignments: Array.from({ length: MAX_DSP_ROWS }, () => ""),
    gutterSize: "6 inch K-Style",
  });

  const colorById = useMemo(() => {
    const map = {};
    (Array.isArray(colors) ? colors : []).forEach((c) => { map[String(c.color_id)] = c.name; });
    return map;
  }, [colors]);

  const sections = useMemo(() => {
    return (Array.isArray(sides) ? sides : []).map((side) => {
      const gutterColor = colorById[String(side.gutter_color_id)] || "--";
      const downspoutColor = colorById[String(side.downspout_color_id)] || gutterColor || "--";
      return {
        sides: side.segments,
        length: side.length,
        height: side.height,
        downspoutQty: side.downspout_qty,
        color: gutterColor,
        gutterColor,
        downspoutColor,
      };
    });
  }, [sides, colorById]);

  const materials = useMemo(() => {
    if (!sections.length) return null;
    return calculateMaterials({ sections });
  }, [sections]);

  const sectionRows = useMemo(() => {
    const rows = sections.slice(0, MAX_SIZE_ROWS).map((s) => ({
      length: s.length,
      height: s.height,
    }));
    while (rows.length < MAX_SIZE_ROWS) {
      rows.push({ length: "", height: "" });
    }
    return rows;
  }, [sections]);

  const dspRows = useMemo(() => Array.from({ length: MAX_DSP_ROWS }, (_, i) => i + 1), []);

  const updateField = (field, value) => setWorkOrder((prev) => ({ ...prev, [field]: value }));

  const updateDownspoutAssignment = (index, value) => {
    setWorkOrder((prev) => {
      const next = [...(prev.downspoutAssignments || [])];
      next[index] = value;
      return { ...prev, downspoutAssignments: next };
    });
  };

  const saveWorkOrder = () => {
    toastInfo("Work-order notes are not persisted yet — no dedicated work-order table exists.", "Work Order");
  };

  if (!header) return <Container className="py-4">Project not found.</Container>;

  return (
    <div className={styles.woPage}>
      {/* ─── Compact Top Header ─── */}
      <div className={styles.woHeader}>
        <div className={styles.woHeaderLeft}>
          <Link href={`/gutter/${projectId}`} className={styles.woBackLink}>
            <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" />
          </Link>
          <div className={styles.woHeaderTitle}>
            <h1 className={styles.woTitle}>Work Order</h1>
            <span className={styles.woSubtitle}>{header.project_name || `PO# ${header.proj_id}`}</span>
          </div>
          <div className={styles.woHeaderMeta}>
            <div className={styles.woMetaItem}>
              <span className={styles.woMetaLabel}>PO#</span>
              <span className={styles.woMetaValue}>{toDisplay(header.proj_id)}</span>
            </div>
            <div className={styles.woMetaItem}>
              <span className={styles.woMetaLabel}>Date</span>
              <span className={styles.woMetaValue}>{toDisplay(header.date)}</span>
            </div>
            <div className={styles.woMetaItem}>
              <span className={styles.woMetaLabel}>Address</span>
              <span className={styles.woMetaValue}>{toDisplay(header.project_address)}</span>
            </div>
          </div>
        </div>
        <div className={styles.woHeaderActions}>
          <Button variant="secondary" onClick={() => window.open(`/gutter/${projectId}/print`, "_blank")}>
            <FontAwesomeIcon icon={faPrint} className="me-1" /> Print
          </Button>
          <Button variant="success" onClick={saveWorkOrder}>
            <FontAwesomeIcon icon={faCheck} className="me-1" /> Save
          </Button>
        </div>
      </div>

      {/* ─── Workspace Body ─── */}
      <div className={styles.woBody}>
        {/* ─── Main Content (Left) ─── */}
        <div className={styles.woMain}>

          {/* Project + Gutter Config */}
          <div className={styles.woSection}>
            <div className={styles.woSectionHeader}>
              <FontAwesomeIcon icon={faBuilding} /> Project &amp; Configuration
            </div>
            <div className={styles.woSectionBody}>
              <div className={styles.woInfoGrid}>
                <div className={styles.woCompanyBlock}>
                  <strong className={styles.woCompanyName}>Premium Gutters &amp; DOORS</strong>
                  <span className={styles.woCompanyDetail}>sales.pdg@premiumsteelgroup.com</span>
                  <span className={styles.woCompanyDetail}>817-502-2520</span>
                </div>
                <div className={styles.woConfigGrid}>
                  <div className={styles.woConfigItem}>
                    <span className={styles.woConfigLabel}>K-Style Gutter Color</span>
                    <span className={styles.woConfigValue}>{materials?.colors?.kStyleGutterColor || "--"}</span>
                  </div>
                  <div className={styles.woConfigItem}>
                    <span className={styles.woConfigLabel}>Downspout Color</span>
                    <span className={styles.woConfigValue}>{materials?.colors?.downspoutColor || "--"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Measurements */}
          <div className={styles.woSection}>
            <div className={styles.woSectionHeader}>
              <FontAwesomeIcon icon={faRulerCombined} /> Measurements
            </div>
            <div className={styles.woSectionBody}>
              <div className={styles.woMeasureGrid}>
                {sectionRows.map((row, index) => (
                  <div key={`section-${index}`} className={styles.woMeasureRow}>
                    <span className={styles.woMeasureLabel}>#{index + 1}</span>
                    <span className={styles.woMeasureSize}>{workOrder.gutterSize}</span>
                    <div className={styles.woMeasureField}>
                      <span className={styles.woMeasureFieldLabel}>L</span>
                      <span className={styles.woMeasureFieldValue}>{toDisplay(row.length) || "—"}</span>
                    </div>
                    <div className={styles.woMeasureField}>
                      <span className={styles.woMeasureFieldLabel}>H</span>
                      <span className={styles.woMeasureFieldValue}>{toDisplay(row.height) || "—"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Material Summary */}
          <div className={styles.woSection}>
            <div className={styles.woSectionHeader}>
              <FontAwesomeIcon icon={faBoxOpen} /> Material Summary
            </div>
            <div className={styles.woSectionBody}>
              <div className={styles.woMaterialList}>
                <div className={`${styles.woMaterialRow} ${styles.woMaterialRowHeader}`}>
                  <span className={styles.woMaterialName}>Item</span>
                  <span className={styles.woMaterialQty}>QTY</span>
                  <span className={styles.woMaterialColor}>Color</span>
                </div>
                <div className={styles.woMaterialRow}>
                  <span className={styles.woMaterialName}>Gutter Coil 15&quot; (Ft / Lbs)</span>
                  <span className={styles.woMaterialQty}>{toDecimalDisplay(materials?.gutterCoil?.totalFt)}</span>
                  <span className={styles.woMaterialColor}>{toDecimalDisplay(materials?.gutterCoil?.totalLbs)} / {materials?.gutterCoil?.color || "--"}</span>
                </div>
                <div className={styles.woMaterialRow}>
                  <span className={styles.woMaterialName}>Right End Caps - 6&quot; K-Style</span>
                  <span className={styles.woMaterialQty}>{toWholeDisplay(materials?.endCaps?.right?.qty)}</span>
                  <span className={styles.woMaterialColor}>{materials?.endCaps?.right?.color || "--"}</span>
                </div>
                <div className={styles.woMaterialRow}>
                  <span className={styles.woMaterialName}>Left End Caps - 6&quot; K-Style</span>
                  <span className={styles.woMaterialQty}>{toWholeDisplay(materials?.endCaps?.left?.qty)}</span>
                  <span className={styles.woMaterialColor}>{materials?.endCaps?.left?.color || "--"}</span>
                </div>
                <div className={styles.woMaterialRow}>
                  <span className={styles.woMaterialName}>3&quot; x 4&quot; Downpipe 10&apos;ft</span>
                  <span className={styles.woMaterialQty}>{toWholeDisplay(materials?.downpipe?.qty)}</span>
                  <span className={styles.woMaterialColor}>{materials?.downpipe?.color || "--"}</span>
                </div>
                <div className={styles.woMaterialRow}>
                  <span className={styles.woMaterialName}>3&quot; x 4&quot; - 6&quot; One Piece Offset</span>
                  <span className={styles.woMaterialQty}>{toWholeDisplay(materials?.onePieceOffset?.qty)}</span>
                  <span className={styles.woMaterialColor}>{materials?.onePieceOffset?.color || "--"}</span>
                </div>
                <div className={styles.woMaterialRow}>
                  <span className={styles.woMaterialName}>3&quot; x 4&quot; -(A) Elbow</span>
                  <span className={styles.woMaterialQty}>{toWholeDisplay(materials?.elbow?.qty)}</span>
                  <span className={styles.woMaterialColor}>{materials?.elbow?.color || "--"}</span>
                </div>
                <div className={styles.woMaterialRow}>
                  <span className={styles.woMaterialName}>#8 x 1/2&quot; Zip Screws</span>
                  <span className={styles.woMaterialQty}>{toWholeDisplay(materials?.zipScrews?.qty)}</span>
                  <span className={styles.woMaterialColor}>{materials?.zipScrews?.color || "--"}</span>
                </div>
                <div className={styles.woMaterialRow}>
                  <span className={styles.woMaterialName}>6&quot; Hidden Hangers</span>
                  <span className={styles.woMaterialQty}>{toWholeDisplay(materials?.internal?.hiddenHangers)}</span>
                  <span className={styles.woMaterialColor}>Auto</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sketch Workspace */}
          <div className={styles.woSection}>
            <div className={styles.woSectionHeader}>
              <FontAwesomeIcon icon={faPenToSquare} /> Sketch / Diagram
            </div>
            <div className={styles.woSectionBody}>
              <div className={styles.woSketchContainer}>
                <div className={styles.woSketchCanvas}>
                  <span className={styles.woSketchLabelTop}>Front</span>
                  <span className={styles.woSketchLabelBottom}>Back</span>
                  <span className={styles.woSketchLabelLeft}>Left</span>
                  <span className={styles.woSketchLabelRight}>Right</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Utility Sidebar (Right) ─── */}
        <div className={styles.woSidebar}>

          {/* Installer Info */}
          <div className={styles.woSection}>
            <div className={styles.woSectionHeader}>
              <FontAwesomeIcon icon={faIdBadge} /> Installer
            </div>
            <div className={styles.woSectionBody}>
              <Form.Group className="mb-2">
                <Form.Label className={styles.woFormLabel}>Installer Name</Form.Label>
                <Form.Control size="sm" value={workOrder.installerName} onChange={(e) => updateField("installerName", e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label className={styles.woFormLabel}>Installation Date</Form.Label>
                <Form.Control size="sm" type="date" value={workOrder.installDate} onChange={(e) => updateField("installDate", e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label className={styles.woFormLabel}>Signature</Form.Label>
                <Form.Control size="sm" value={workOrder.installerSignature} onChange={(e) => updateField("installerSignature", e.target.value)} />
              </Form.Group>
              <Form.Group>
                <Form.Label className={styles.woFormLabel}>Signature Date</Form.Label>
                <Form.Control size="sm" type="date" value={workOrder.signatureDate} onChange={(e) => updateField("signatureDate", e.target.value)} />
              </Form.Group>
            </div>
          </div>

          {/* DSP Assignments */}
          <div className={styles.woSection}>
            <div className={styles.woSectionHeader}>
              <FontAwesomeIcon icon={faSignsPost} /> DSP Assignments
            </div>
            <div className={styles.woSectionBody}>
              <div className={styles.woDspGrid}>
                {dspRows.map((dspNumber, index) => (
                  <div key={`dsp-${dspNumber}`} className={styles.woDspRow}>
                    <label className={styles.woDspLabel}>DSP#{dspNumber}</label>
                    <Form.Control size="sm" className={styles.woDspInput} value={toDisplay(workOrder.downspoutAssignments[index])} onChange={(e) => updateDownspoutAssignment(index, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className={styles.woSection}>
            <div className={styles.woSectionHeader}>
              <FontAwesomeIcon icon={faNoteSticky} /> Notes
            </div>
            <div className={styles.woSectionBody}>
              <Form.Control as="textarea" rows={5} value={workOrder.notes} onChange={(e) => updateField("notes", e.target.value)} placeholder="Installation notes, special instructions..." className={styles.woNotesInput} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
