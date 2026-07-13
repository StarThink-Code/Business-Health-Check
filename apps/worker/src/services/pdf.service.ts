import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage, type RGB } from "pdf-lib";
import { CONTACT, type AssessmentReport, type CategoryScore } from "@bhc/shared";

const PAGE_WIDTH = 595.28; // A4
const PAGE_HEIGHT = 841.89;
const MARGIN = 50;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function hex(hexColor: string): RGB {
  const r = parseInt(hexColor.slice(1, 3), 16) / 255;
  const g = parseInt(hexColor.slice(3, 5), 16) / 255;
  const b = parseInt(hexColor.slice(5, 7), 16) / 255;
  return rgb(r, g, b);
}

const COLOR = {
  ink: hex("#0b0b0b"),
  inkSecondary: hex("#52514e"),
  inkMuted: hex("#898781"),
  border: hex("#e1e0d9"),
  accentText: hex("#37840b"),
  accentPanel: hex("#2b6808"),
  good: hex("#0ca30c"),
  goodTint: hex("#e5f6e5"),
  warning: hex("#b8790a"),
  warningTint: hex("#fdf1dc"),
  serious: hex("#c85a30"),
  seriousTint: hex("#fbe7de"),
  critical: hex("#d03b3b"),
  criticalTint: hex("#fbe2e2"),
  white: rgb(1, 1, 1),
} as const;

function statusColor(status: AssessmentReport["businessStatus"]): { text: RGB; tint: RGB } {
  switch (status) {
    case "strong_performer":
      return { text: COLOR.good, tint: COLOR.goodTint };
    case "on_the_right_track":
      return { text: COLOR.warning, tint: COLOR.warningTint };
    case "just_getting_started":
      return { text: COLOR.critical, tint: COLOR.criticalTint };
  }
}

function scoreColor(percentage: number): RGB {
  if (percentage >= 75) return COLOR.good;
  if (percentage >= 60) return COLOR.warning;
  if (percentage >= 40) return COLOR.serious;
  return COLOR.critical;
}

/** Greedy word-wrap for a fixed font/size/width — pdf-lib has no built-in layout engine. */
function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Tracks the current page/cursor and creates a new page automatically when content overflows. */
class PageFlow {
  page: PDFPage;
  y: number;

  constructor(
    private doc: PDFDocument,
    private regular: PDFFont,
    private bold: PDFFont,
  ) {
    this.page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    this.y = PAGE_HEIGHT - MARGIN;
  }

  ensureSpace(height: number) {
    if (this.y - height < MARGIN) {
      this.page = this.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      this.y = PAGE_HEIGHT - MARGIN;
    }
  }

  text(value: string, opts: { size: number; font?: PDFFont; color?: RGB; gap?: number }) {
    const font = opts.font ?? this.regular;
    this.ensureSpace(opts.size + (opts.gap ?? 0));
    this.page.drawText(value, { x: MARGIN, y: this.y - opts.size, size: opts.size, font, color: opts.color ?? COLOR.ink });
    this.y -= opts.size + (opts.gap ?? opts.size * 0.5);
  }

  paragraph(value: string, opts: { size: number; color?: RGB; maxWidth?: number; lineHeight?: number; gap?: number }) {
    const lines = wrapText(value, this.regular, opts.size, opts.maxWidth ?? CONTENT_WIDTH);
    const lineHeight = opts.lineHeight ?? opts.size * 1.4;
    for (const line of lines) {
      this.ensureSpace(lineHeight);
      this.page.drawText(line, { x: MARGIN, y: this.y - opts.size, size: opts.size, font: this.regular, color: opts.color ?? COLOR.inkSecondary });
      this.y -= lineHeight;
    }
    this.y -= opts.gap ?? 4;
  }

  divider() {
    this.ensureSpace(20);
    this.page.drawLine({
      start: { x: MARGIN, y: this.y },
      end: { x: MARGIN + CONTENT_WIDTH, y: this.y },
      thickness: 1,
      color: COLOR.border,
    });
    this.y -= 20;
  }

  /** A labeled meter bar: label + percentage on the right, colored fill bar below. */
  scoreBar(score: CategoryScore) {
    this.ensureSpace(36);
    // Text baseline sits at y-10; 10pt bold descenders reach roughly y-12, so
    // the bar needs to start at least a few points below that to avoid the
    // bar striking through the label (measured this by rendering the PDF).
    const barY = this.y - 24;
    this.page.drawText(score.label, { x: MARGIN, y: this.y - 10, size: 10, font: this.bold, color: COLOR.ink });
    const pctLabel = `${Math.round(score.percentage)}%`;
    const pctWidth = this.bold.widthOfTextAtSize(pctLabel, 10);
    this.page.drawText(pctLabel, {
      x: MARGIN + CONTENT_WIDTH - pctWidth,
      y: this.y - 10,
      size: 10,
      font: this.bold,
      color: COLOR.ink,
    });
    this.page.drawRectangle({ x: MARGIN, y: barY, width: CONTENT_WIDTH, height: 6, color: COLOR.border });
    this.page.drawRectangle({
      x: MARGIN,
      y: barY,
      width: (CONTENT_WIDTH * Math.min(100, Math.max(0, score.percentage))) / 100,
      height: 6,
      color: scoreColor(score.percentage),
    });
    this.y = barY - 12;
  }
}

export async function generateReportPdf(report: AssessmentReport, logoPngBytes?: ArrayBuffer): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`${report.business.name} — Business Health Report`);
  doc.setProducer("Digital Business Growth Audit");

  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const flow = new PageFlow(doc, regular, bold);

  // Header: logo + company name, generated date on the right, then an
  // agency introduction and contact details, before the report content.
  let headerX = MARGIN;
  if (logoPngBytes) {
    try {
      const logo = await doc.embedPng(logoPngBytes);
      const size = 20;
      flow.page.drawImage(logo, { x: MARGIN, y: flow.y - size, width: size, height: size });
      headerX = MARGIN + size + 8;
    } catch {
      // Malformed/unreachable logo asset — the report is still useful without it.
    }
  }
  flow.page.drawText(CONTACT.companyName, { x: headerX, y: flow.y - 16, size: 16, font: bold, color: COLOR.ink });
  const dateLabel = new Date().toLocaleDateString("en-MY", { year: "numeric", month: "long", day: "numeric" });
  const dateWidth = regular.widthOfTextAtSize(dateLabel, 9);
  flow.page.drawText(dateLabel, {
    x: MARGIN + CONTENT_WIDTH - dateWidth,
    y: flow.y - 15,
    size: 9,
    font: regular,
    color: COLOR.inkMuted,
  });
  flow.y -= 34;

  flow.paragraph(CONTACT.introduction, { size: 9.5, color: COLOR.inkSecondary, lineHeight: 13, gap: 8 });
  flow.text(`Email: ${CONTACT.email}    ·    Phone: ${CONTACT.phoneDisplay}`, {
    size: 9.5,
    color: COLOR.inkMuted,
    gap: 6,
  });

  flow.divider();

  // Hero: business name, overall score, status.
  flow.text(report.business.name, { size: 20, font: bold, gap: 6 });
  const status = statusColor(report.businessStatus);
  flow.page.drawText(`${Math.round(report.overallScore)}`, {
    x: MARGIN,
    y: flow.y - 36,
    size: 40,
    font: bold,
    color: status.text,
  });
  flow.page.drawRectangle({
    x: MARGIN + 110,
    y: flow.y - 26,
    width: bold.widthOfTextAtSize(report.businessStatusLabel, 11) + 20,
    height: 20,
    color: status.tint,
  });
  flow.page.drawText(report.businessStatusLabel, {
    x: MARGIN + 120,
    y: flow.y - 20,
    size: 11,
    font: bold,
    color: status.text,
  });
  flow.y -= 60;
  flow.divider();

  // Category scores
  flow.text("Category Scores", { size: 14, font: bold, gap: 10 });
  for (const score of report.categoryScores) {
    flow.scoreBar(score);
  }
  flow.y -= 10;
  flow.divider();

  // Strengths / weaknesses
  if (report.strengths.length > 0) {
    flow.text("Strengths", { size: 14, font: bold, gap: 10 });
    for (const s of report.strengths) {
      flow.paragraph(`•  ${s.label} — ${Math.round(s.percentage)}%`, { size: 11, color: COLOR.inkSecondary, gap: 4 });
    }
    flow.y -= 6;
  }
  if (report.weaknesses.length > 0) {
    flow.text("Improvement Priorities", { size: 14, font: bold, gap: 10 });
    for (const w of report.weaknesses) {
      flow.paragraph(`•  ${w.label} — ${Math.round(w.percentage)}%`, { size: 11, color: COLOR.inkSecondary, gap: 4 });
    }
    flow.y -= 6;
  }

  // Recommendations
  if (report.recommendations.length > 0) {
    flow.divider();
    flow.text("Recommendations", { size: 14, font: bold, gap: 10 });
    report.recommendations.forEach((r, i) => {
      flow.paragraph(`${i + 1}. ${r.title}`, { size: 11, color: COLOR.ink, gap: 2, lineHeight: 15 });
      flow.paragraph(r.description, { size: 10, color: COLOR.inkSecondary, gap: 10, lineHeight: 14 });
    });
  }

  // Footer CTA
  const ctaPanelHeight = 74;
  flow.ensureSpace(ctaPanelHeight + 10);
  flow.page.drawRectangle({
    x: MARGIN,
    y: flow.y - ctaPanelHeight,
    width: CONTENT_WIDTH,
    height: ctaPanelHeight,
    color: COLOR.accentPanel,
  });
  flow.page.drawText("Want help acting on this? Book a free consultation.", {
    x: MARGIN + 20,
    y: flow.y - 30,
    size: 12,
    font: bold,
    color: COLOR.white,
  });
  flow.page.drawText(`${CONTACT.companyName} — WhatsApp ${CONTACT.whatsappDisplay}`, {
    x: MARGIN + 20,
    y: flow.y - 50,
    size: 10,
    font: regular,
    color: COLOR.white,
    opacity: 0.85,
  });
  flow.y -= ctaPanelHeight;

  // Copyright — drawn last so it lands on every page the flow ended up creating.
  const copyrightText = `Copyright © ${new Date().getFullYear()} ${CONTACT.copyrightHolder}. All Rights Reserved.`;
  const copyrightSize = 8;
  for (const page of doc.getPages()) {
    const width = page.getWidth();
    const textWidth = regular.widthOfTextAtSize(copyrightText, copyrightSize);
    page.drawText(copyrightText, {
      x: (width - textWidth) / 2,
      y: 24,
      size: copyrightSize,
      font: regular,
      color: COLOR.inkMuted,
    });
  }

  return doc.save();
}
