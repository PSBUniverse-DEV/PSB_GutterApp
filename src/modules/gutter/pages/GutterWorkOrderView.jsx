"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Container, Row, Col, Form, Table } from "react-bootstrap";
import { Button, Card, toastInfo } from "@/shared/components/ui";
import { calculateMaterials } from "../data/gutter.data";

const MAX_SIZE_ROWS = 4;
const MAX_DSP_ROWS = 8;

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

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

  // Build color lookup
  const colorById = useMemo(() => {
    const map = {};
    (Array.isArray(colors) ? colors : []).forEach((c) => { map[String(c.color_id)] = c.name; });
    return map;
  }, [colors]);

  // Build sections for materials calculation
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
    <Container className="py-4" style={{ maxWidth: 1180 }}>
      <div className="d-flex align-items-center mb-3">
        <Link href={`/gutter/${projectId}`} className="back-link me-3">
          <i className="bi bi-arrow-left" aria-hidden="true" /> Back to Project
        </Link>
        <div>
          <h2 className="mb-0">Work Order</h2>
          <p className="text-muted mb-0">{header.project_name || header.proj_id}</p>
        </div>
      </div>

      <Card className="mb-3">
        <div className="p-3">
          <Row className="g-3 align-items-start">
            <Col lg={4}>
              <div className="border p-3 h-100">
                <h2 className="mb-1 fw-bold">Premium Gutters</h2>
                <p className="mb-0 fw-semibold">&amp; DOORS</p>
                <p className="small mb-0">sales.pdg@premiumsteelgroup.com</p>
                <p className="small mb-0">Phone: 817-502-2520</p>
              </div>
            </Col>

            <Col lg={8}>
              <div className="border">
                <div className="text-center py-2 fw-bold text-white" style={{ backgroundColor: "#111" }}>
                  Work Order
                </div>
                <div className="p-2">
                  <Table size="sm" bordered className="mb-2 align-middle">
                    <tbody>
                      <tr><td style={{ width: "34%" }} className="fw-semibold">DATE</td><td>{toDisplay(header.date)}</td></tr>
                      <tr><td className="fw-semibold">Customer PO#</td><td>{toDisplay(header.proj_id)}</td></tr>
                      <tr><td className="fw-semibold">Project Name</td><td>{toDisplay(header.project_name)}</td></tr>
                      <tr><td className="fw-semibold">Project Address</td><td>{toDisplay(header.project_address)}</td></tr>
                    </tbody>
                  </Table>

                  <Row className="g-2 mb-2">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="small mb-1">Installation Date</Form.Label>
                        <Form.Control size="sm" type="date" value={workOrder.installDate} onChange={(e) => updateField("installDate", e.target.value)} />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="small mb-1">Installer Name</Form.Label>
                        <Form.Control size="sm" value={workOrder.installerName} onChange={(e) => updateField("installerName", e.target.value)} />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Table size="sm" bordered className="mb-2 align-middle">
                    <tbody>
                      <tr><td className="fw-semibold" style={{ width: "34%" }}>K-Style Gutter Color</td><td>{materials?.colors?.kStyleGutterColor || "--"}</td></tr>
                      <tr><td className="fw-semibold">Downspout Color</td><td>{materials?.colors?.downspoutColor || "--"}</td></tr>
                    </tbody>
                  </Table>
                </div>
              </div>
            </Col>
          </Row>

          <Row className="g-3 mt-1">
            <Col lg={6}>
              <Table size="sm" bordered className="align-middle mb-0">
                <thead>
                  <tr>
                    <th style={{ width: "20%" }}>Size</th>
                    <th style={{ width: "40%" }}>Length</th>
                    <th style={{ width: "40%" }}>Height</th>
                  </tr>
                </thead>
                <tbody>
                  {sectionRows.map((row, index) => (
                    <tr key={`section-${index}`}>
                      <td>{workOrder.gutterSize}</td>
                      <td>#{index + 1} Length: {toDisplay(row.length)}</td>
                      <td>#{index + 1} Height: {toDisplay(row.height)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>

            <Col lg={6}>
              <Table size="sm" bordered className="align-middle mb-0">
                <thead>
                  <tr>
                    <th>Field</th>
                    <th style={{ width: "20%" }}>QTY</th>
                    <th style={{ width: "26%" }}>Color</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Gutter Coil 15&quot; (Total Ft / Total Lbs)</td><td>{toDecimalDisplay(materials?.gutterCoil?.totalFt)}</td><td>{toDecimalDisplay(materials?.gutterCoil?.totalLbs)} / {materials?.gutterCoil?.color || "--"}</td></tr>
                  <tr><td>Right End Caps - 6&quot; K-Style</td><td>{toWholeDisplay(materials?.endCaps?.right?.qty)}</td><td>{materials?.endCaps?.right?.color || "--"}</td></tr>
                  <tr><td>Left End Caps - 6&quot; K-Style</td><td>{toWholeDisplay(materials?.endCaps?.left?.qty)}</td><td>{materials?.endCaps?.left?.color || "--"}</td></tr>
                  <tr><td>3&quot; x 4&quot; Downpipe 10&apos;ft</td><td>{toWholeDisplay(materials?.downpipe?.qty)}</td><td>{materials?.downpipe?.color || "--"}</td></tr>
                  <tr><td>3&quot; x 4&quot; - 6&quot; One Piece Offset</td><td>{toWholeDisplay(materials?.onePieceOffset?.qty)}</td><td>{materials?.onePieceOffset?.color || "--"}</td></tr>
                  <tr><td>3&quot; x 4&quot; -(A) Elbow</td><td>{toWholeDisplay(materials?.elbow?.qty)}</td><td>{materials?.elbow?.color || "--"}</td></tr>
                  <tr><td>#8 x 1/2&quot; Zip Screws</td><td>{toWholeDisplay(materials?.zipScrews?.qty)}</td><td>{materials?.zipScrews?.color || "--"}</td></tr>
                  <tr><td>6&quot; Hidden Hangers</td><td>{toWholeDisplay(materials?.internal?.hiddenHangers)}</td><td>Auto</td></tr>
                </tbody>
              </Table>
            </Col>
          </Row>

          <Row className="g-3 mt-2">
            <Col lg={7}>
              <Table size="sm" bordered className="align-middle mb-0">
                <tbody>
                  <tr>
                    <td className="fw-semibold" style={{ width: "28%" }}>Installer Signature</td>
                    <td><Form.Control size="sm" value={workOrder.installerSignature} onChange={(e) => updateField("installerSignature", e.target.value)} /></td>
                  </tr>
                </tbody>
              </Table>
            </Col>
            <Col lg={5}>
              <Table size="sm" bordered className="align-middle mb-0">
                <tbody>
                  <tr>
                    <td className="fw-semibold" style={{ width: "34%" }}>Date</td>
                    <td><Form.Control size="sm" type="date" value={workOrder.signatureDate} onChange={(e) => updateField("signatureDate", e.target.value)} /></td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>

          <Row className="g-3 mt-2">
            <Col lg={7}>
              <div className="border position-relative" style={{ minHeight: 390 }}>
                <div className="position-absolute top-0 start-50 translate-middle-x px-2 bg-white fw-semibold" style={{ marginTop: "-12px" }}>Front</div>
                <div className="position-absolute bottom-0 start-50 translate-middle-x px-2 bg-white fw-semibold" style={{ marginBottom: "-12px" }}>Back</div>
                <div className="position-absolute top-50 start-0 translate-middle-y border px-3 py-2 fw-semibold bg-white" style={{ marginLeft: "-2px" }}>Left</div>
                <div className="position-absolute top-50 end-0 translate-middle-y border px-3 py-2 fw-semibold bg-white" style={{ marginRight: "-2px" }}>Right</div>
              </div>
            </Col>

            <Col lg={5}>
              <Table size="sm" bordered className="align-middle mb-2">
                <tbody>
                  {dspRows.map((dspNumber, index) => (
                    <tr key={`dsp-${dspNumber}`}>
                      <td className="fw-semibold" style={{ width: "36%" }}>DSP#{dspNumber}</td>
                      <td><Form.Control size="sm" value={toDisplay(workOrder.downspoutAssignments[index])} onChange={(e) => updateDownspoutAssignment(index, e.target.value)} /></td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <div className="border p-2" style={{ minHeight: 180 }}>
                <p className="fw-semibold mb-2">Extra Notes</p>
                <Form.Control as="textarea" rows={6} value={workOrder.notes} onChange={(e) => updateField("notes", e.target.value)} placeholder="Installation notes, special instructions..." />
              </div>
            </Col>
          </Row>
        </div>
      </Card>

      <div className="d-flex gap-2 mb-4">
        <Button variant="success" onClick={saveWorkOrder}>Save Work Order</Button>
        <Button variant="secondary" onClick={() => window.print()}>Print Work Order</Button>
      </div>
    </Container>
  );
}
