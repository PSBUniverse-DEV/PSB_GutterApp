"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Container, Row, Col, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faPrint, faRulerCombined, faBoxOpen, faSignsPost } from "@fortawesome/free-solid-svg-icons";
import { faBuilding, faPenToSquare, faIdBadge, faNoteSticky } from "@fortawesome/free-regular-svg-icons";
import { Button } from "@/shared/components/ui";
import { calculateMaterials, calculateQuote } from "../data/gutter.data";
import styles from "./GutterWorkOrder.module.css";

const MAX_SIZE_ROWS = 10;
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

export default function GutterWorkOrderView({ projectId, projectData, manufacturerName }) {
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
    return sections.map((sec, i) => ({
      index: i + 1,
      length: sec.length,
      height: sec.height,
      sides: sec.sides,
      gutterColor: sec.gutterColor,
      downspoutColor: sec.downspoutColor,
      downspoutQty: sec.downspoutQty,
    }));
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
                  <div className={styles.woConfigItem}>
                    <span className={styles.woConfigLabel}>Manufacturer</span>
                    <span className={styles.woConfigValue}>{manufacturerName || "--"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gutter & Downspout Sections */}
          <div className={styles.woSection}>
            <div className={styles.woSectionHeader}>
              <FontAwesomeIcon icon={faRulerCombined} /> Gutter &amp; Downspout Sections
            </div>
            <div className={styles.woSectionBody}>
              {sectionRows.map((row) => (
                <div key={row.index} className={styles.woSectionCard}>
                  <div className={styles.woSectionCardTitle}>Section {row.index}</div>
                  <div className={styles.woSectionCardGrid}>
                    <div className={styles.woSectionCardGroup}>
                      <div className={styles.woSectionCardGroupLabel}>Gutter</div>
                      <div className={styles.woSectionCardRow}>
                        <span className={styles.woSectionCardLabel}>Color</span>
                        <span className={styles.woSectionCardValue}>{row.gutterColor}</span>
                      </div>
                      <div className={styles.woSectionCardRow}>
                        <span className={styles.woSectionCardLabel}>Sides</span>
                        <span className={styles.woSectionCardValue}>{toDisplay(row.sides) || "—"}</span>
                      </div>
                      <div className={styles.woSectionCardRow}>
                        <span className={styles.woSectionCardLabel}>Length (LF)</span>
                        <span className={styles.woSectionCardValue}>{toDisplay(row.length) || "—"}</span>
                      </div>
                      <div className={styles.woSectionCardRow}>
                        <span className={styles.woSectionCardLabel}>Height (FT)</span>
                        <span className={styles.woSectionCardValue}>{toDisplay(row.height) || "—"}</span>
                      </div>
                    </div>
                    <div className={styles.woSectionCardGroup}>
                      <div className={styles.woSectionCardGroupLabel}>Downspout</div>
                      <div className={styles.woSectionCardRow}>
                        <span className={styles.woSectionCardLabel}>Color</span>
                        <span className={styles.woSectionCardValue}>{row.downspoutColor}</span>
                      </div>
                      <div className={styles.woSectionCardRow}>
                        <span className={styles.woSectionCardLabel}>Quantity</span>
                        <span className={styles.woSectionCardValue}>{toDisplay(row.downspoutQty) || "—"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Material Summary */}
          <div className={styles.woSection}>
            <div className={styles.woSectionHeader}>
              <FontAwesomeIcon icon={faBoxOpen} /> Material Summary
            </div>
            <div className={styles.woSectionBody}>
              {/* Gutter Coil */}
              <table className={styles.woTable}>
                <thead>
                  <tr><th>Item</th><th>FT</th><th>LBS</th><th>Color</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Gutter Coil 15&quot;</td>
                    <td>{toDecimalDisplay(materials?.gutterCoil?.totalFt)}</td>
                    <td>{toDecimalDisplay(materials?.gutterCoil?.totalLbs)}</td>
                    <td>{materials?.gutterCoil?.color || "--"}</td>
                  </tr>
                </tbody>
              </table>

              {/* Parts */}
              <table className={styles.woTable} style={{ marginTop: "10px" }}>
                <thead>
                  <tr><th>Item</th><th>QTY</th><th>Color</th></tr>
                </thead>
                <tbody>
                  <tr><td>Right End Caps - 6&quot; K-Style</td><td>{toWholeDisplay(materials?.endCaps?.right?.qty)}</td><td>{materials?.endCaps?.right?.color || "--"}</td></tr>
                  <tr><td>Left End Caps - 6&quot; K-Style</td><td>{toWholeDisplay(materials?.endCaps?.left?.qty)}</td><td>{materials?.endCaps?.left?.color || "--"}</td></tr>
                  <tr><td>#8 x 1/2&quot; Zip Screws</td><td>{toWholeDisplay(materials?.zipScrews?.qty)}</td><td>{materials?.zipScrews?.color || "--"}</td></tr>
                  <tr><td>3&quot; x 4&quot; Downpipe 10&apos;ft</td><td>{toWholeDisplay(materials?.downpipe?.qty)}</td><td>{materials?.downpipe?.color || "--"}</td></tr>
                  <tr><td>3&quot; x 4&quot; - 6&quot; One Piece Offset</td><td>{toWholeDisplay(materials?.onePieceOffset?.qty)}</td><td>{materials?.onePieceOffset?.color || "--"}</td></tr>
                  <tr><td>3&quot; x 4&quot; -(A) Elbow</td><td>{toWholeDisplay(materials?.elbow?.qty)}</td><td>{materials?.elbow?.color || "--"}</td></tr>
                  <tr><td>6&quot; Hidden Hangers</td><td>{toWholeDisplay(materials?.internal?.hiddenHangers)}</td><td>Auto</td></tr>
                </tbody>
              </table>
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
