/**
 * PDF Generation Shared Utilities
 * Provides common formatting, styling, and helper functions for PDF generation
 * Used by both v2 and v3 PDF generators
 */

import jsPDF from 'jspdf';

// Constants
export const PAGE_WIDTH = 210;
export const PAGE_HEIGHT = 297;
export const MARGIN = 20;
export const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2);
export const HEADER_HEIGHT = 60;
export const FOOTER_HEIGHT = 40;

// Color palette
export const COLORS = {
  PRIMARY: [37, 99, 235],      // Blue-600
  PRIMARY_DARK: [30, 58, 138], // Blue-900
  SECONDARY: [17, 24, 39],     // Gray-900
  ACCENT: [59, 130, 246],      // Blue-500
  SUCCESS: [34, 197, 94],      // Green-500
  WARNING: [251, 146, 60],     // Orange-400
  DANGER: [239, 68, 68],       // Red-600
  GRAY_LIGHT: [243, 244, 246], // Gray-100
  GRAY_MEDIUM: [156, 163, 175], // Gray-500
  GRAY_DARK: [75, 85, 99],     // Gray-700
  WHITE: [255, 255, 255],
  BLACK: [0, 0, 0]
};

// Fonts
export const FONTS = {
  TITLE: 'Helvetica-Bold',
  HEADING: 'Helvetica-Bold',
  SUBHEADING: 'Helvetica',
  BODY: 'Helvetica',
  BODY_BOLD: 'Helvetica-Bold'
};

// Font sizes
export const FONT_SIZES = {
  TITLE: 24,
  SECTION_TITLE: 20,
  SUBSECTION: 16,
  BODY: 12,
  BODY_SMALL: 10,
  CAPTION: 8
};

// Spacing
export const SPACING = {
  XS: 5,
  SM: 10,
  MD: 15,
  LG: 20,
  XL: 30,
  XXL: 40
};

/**
 * Adds a formatted header to a PDF page
 * @param {jsPDF} pdf - jsPDF instance
 * @param {string} title - Page title
 * @param {string} subtitle - Page subtitle (optional)
 * @param {number} pageNumber - Current page number
 * @param {number} totalPages - Total pages in document
 */
export function addPageHeader(pdf, title, subtitle = '', pageNumber, totalPages) {
  // Background
  pdf.setFillColor(...COLORS.PRIMARY);
  pdf.rect(0, 0, PAGE_WIDTH, HEADER_HEIGHT, 'F');

  // Title
  pdf.setTextColor(...COLORS.WHITE);
  pdf.setFont(FONTS.TITLE);
  pdf.setFontSize(FONT_SIZES.TITLE);
  pdf.text(title, MARGIN, 30);

  // Subtitle
  if (subtitle) {
    pdf.setFont(FONTS.BODY);
    pdf.setFontSize(FONT_SIZES.BODY);
    pdf.text(subtitle, MARGIN, 45);
  }

  // Page number
  if (pageNumber && totalPages) {
    pdf.setFont(FONTS.BODY);
    pdf.setFontSize(FONT_SIZES.BODY_SMALL);
    pdf.text(
      `${pageNumber} / ${totalPages}`,
      PAGE_WIDTH - MARGIN,
      30,
      { align: 'right' }
    );
  }

  return HEADER_HEIGHT;
}

/**
 * Adds a formatted footer to a PDF page
 * @param {jsPDF} pdf - jsPDF instance
 * @param {number} pageNumber - Current page number
 */
export function addPageFooter(pdf, pageNumber) {
  const y = PAGE_HEIGHT - FOOTER_HEIGHT + 10;
  
  // Separator line
  pdf.setDrawColor(...COLORS.GRAY_MEDIUM);
  pdf.setLineWidth(0.5);
  pdf.line(MARGIN, y - 10, PAGE_WIDTH - MARGIN, y - 10);

  // Footer text
  pdf.setTextColor(...COLORS.GRAY_DARK);
  pdf.setFont(FONTS.BODY);
  pdf.setFontSize(FONT_SIZES.CAPTION);
  pdf.text(
    'Birkman Personality Assessment • Confidential • For Personal Development',
    PAGE_WIDTH / 2,
    y,
    { align: 'center' }
  );

  // Page number
  pdf.text(
    `Page ${pageNumber}`,
    PAGE_WIDTH - MARGIN,
    y,
    { align: 'right' }
  );
}

/**
 * Adds formatted text with proper spacing
 * @param {jsPDF} pdf - jsPDF instance
 * @param {string} text - Text to add
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {Object} options - Formatting options
 * @returns {number} New Y position after text
 */
export function addFormattedText(pdf, text, x, y, options = {}) {
  const {
    fontSize = FONT_SIZES.BODY,
    font = FONTS.BODY,
    color = COLORS.BLACK,
    maxWidth = CONTENT_WIDTH,
    lineHeight = 1.2
  } = options;

  pdf.setFont(font);
  pdf.setFontSize(fontSize);
  pdf.setTextColor(...color);

  // Split text into lines that fit within maxWidth
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const testWidth = pdf.getTextWidth(testLine);
    
    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  // Add each line
  let currentY = y;
  for (const line of lines) {
    pdf.text(line, x, currentY);
    currentY += fontSize * lineHeight / 2.83465; // Convert pt to mm
  }

  return currentY;
}

/**
 * Adds a colored section block with text
 * @param {jsPDF} pdf - jsPDF instance  
 * @param {string} title - Section title
 * @param {string} content - Section content
 * @param {number} y - Starting Y position
 * @param {Array} bgColor - RGB color array for background
 * @returns {number} New Y position after section
 */
export function addSectionBlock(pdf, title, content, y, bgColor = COLORS.GRAY_LIGHT) {
  const blockHeight = 60;
  const blockPadding = 15;
  
  // Background
  pdf.setFillColor(...bgColor);
  pdf.rect(MARGIN, y, CONTENT_WIDTH, blockHeight, 'F');

  // Title
  pdf.setTextColor(...COLORS.SECONDARY);
  pdf.setFont(FONTS.HEADING);
  pdf.setFontSize(FONT_SIZES.SUBSECTION);
  pdf.text(title, MARGIN + blockPadding, y + 20);

  // Content
  pdf.setTextColor(...COLORS.BLACK);
  pdf.setFont(FONTS.BODY);
  pdf.setFontSize(FONT_SIZES.BODY);
  const lines = pdf.splitTextToSize(content, CONTENT_WIDTH - (blockPadding * 2));
  pdf.text(lines, MARGIN + blockPadding, y + 35);

  return y + blockHeight + SPACING.MD;
}

/**
 * Adds a score visualization bar
 * @param {jsPDF} pdf - jsPDF instance
 * @param {string} label - Score label
 * @param {number} score - Score value (1-5)
 * @param {number} x - X position
 * @param {number} y - Y position
 * @returns {number} New Y position
 */
export function addScoreBar(pdf, label, score, x, y) {
  const barWidth = 100;
  const barHeight = 8;
  const scorePercent = ((score - 1) / 4) * 100; // Convert 1-5 to percentage

  // Label
  pdf.setTextColor(...COLORS.SECONDARY);
  pdf.setFont(FONTS.BODY);
  pdf.setFontSize(FONT_SIZES.BODY);
  pdf.text(label, x, y + 5);

  // Bar background
  pdf.setFillColor(...COLORS.GRAY_LIGHT);
  pdf.rect(x + 40, y, barWidth, barHeight, 'F');

  // Bar fill
  pdf.setFillColor(...COLORS.PRIMARY);
  pdf.rect(x + 40, y, (barWidth * scorePercent) / 100, barHeight, 'F');

  // Score text
  pdf.setTextColor(...COLORS.BLACK);
  pdf.text(score.toString(), x + 145, y + 5);

  return y + SPACING.MD;
}

/**
 * Creates a new page with standard formatting
 * @param {jsPDF} pdf - jsPDF instance
 * @param {string} title - Page title
 * @param {string} subtitle - Page subtitle (optional)
 * @param {number} pageNumber - Current page number
 * @param {number} totalPages - Total pages in document
 * @returns {number} Content start Y position
 */
export function createNewPage(pdf, title, subtitle, pageNumber, totalPages) {
  pdf.addPage();
  const headerHeight = addPageHeader(pdf, title, subtitle, pageNumber, totalPages);
  return headerHeight + SPACING.LG;
}

/**
 * Gets score level description (High/Medium/Low)
 * @param {number} score - Score value (1-5)
 * @returns {string} Level description
 */
export function getScoreLevel(score) {
  if (score >= 4) return 'High';
  if (score >= 3) return 'Medium';
  return 'Low';
}

/**
 * Gets score color based on level
 * @param {number} score - Score value (1-5)
 * @returns {Array} RGB color array
 */
export function getScoreColor(score) {
  if (score >= 4) return COLORS.SUCCESS;
  if (score >= 3) return COLORS.WARNING;
  return COLORS.DANGER;
}

/**
 * Adds a table with data
 * @param {jsPDF} pdf - jsPDF instance
 * @param {Array} headers - Array of header objects {title, dataKey}
 * @param {Array} data - Array of data objects
 * @param {number} y - Starting Y position
 * @returns {number} New Y position after table
 */
export function addTable(pdf, headers, data, y) {
  const startY = y;
  const rowHeight = 20;
  const colWidth = CONTENT_WIDTH / headers.length;
  
  // Table header background
  pdf.setFillColor(...COLORS.PRIMARY);
  pdf.rect(MARGIN, y, CONTENT_WIDTH, rowHeight, 'F');
  
  // Header text
  pdf.setTextColor(...COLORS.WHITE);
  pdf.setFont(FONTS.HEADING);
  pdf.setFontSize(FONT_SIZES.BODY);
  
  headers.forEach((header, index) => {
    const x = MARGIN + (index * colWidth) + 5;
    pdf.text(header.title, x, y + 12);
  });
  
  // Data rows
  let currentY = y + rowHeight;
  pdf.setTextColor(...COLORS.BLACK);
  pdf.setFont(FONTS.BODY);
  
  data.forEach((row, rowIndex) => {
    // Alternating row background
    if (rowIndex % 2 === 1) {
      pdf.setFillColor(...COLORS.GRAY_LIGHT);
      pdf.rect(MARGIN, currentY, CONTENT_WIDTH, rowHeight, 'F');
    }
    
    headers.forEach((header, colIndex) => {
      const x = MARGIN + (colIndex * colWidth) + 5;
      const text = row[header.dataKey] || '';
      pdf.text(text.toString(), x, currentY + 12);
    });
    
    currentY += rowHeight;
  });
  
  return currentY + SPACING.MD;
}

/**
 * Helper: Format current date nicely
 * @returns {string} Formatted date string
 */
export function formatCurrentDate() {
  return new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

/**
 * Helper: Check if value is valid for display
 * @param {*} value - Value to check
 * @returns {boolean} True if valid
 */
export function isValidValue(value) {
  return value !== null && value !== undefined && value !== '';
}

export default {
  PAGE_WIDTH,
  PAGE_HEIGHT,
  MARGIN,
  CONTENT_WIDTH,
  HEADER_HEIGHT,
  FOOTER_HEIGHT,
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  addPageHeader,
  addPageFooter,
  addFormattedText,
  addSectionBlock,
  addScoreBar,
  createNewPage,
  getScoreLevel,
  getScoreColor,
  addTable,
  formatCurrentDate,
  isValidValue
};