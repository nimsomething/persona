import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logger from './loggerService';
import birkmanColorsData from '../data/birkman_colors.json';
import componentsData from '../data/components.json';
import careerFamiliesData from '../data/career_families.json';

// Dimension colors for consistent visual identity
const DIMENSION_COLORS = {
  assertiveness: { primary: '#3b82f6', stress: '#60a5fa' },
  sociability: { primary: '#10b981', stress: '#34d399' },
  conscientiousness: { primary: '#f59e0b', stress: '#fbbf24' },
  flexibility: { primary: '#8b5cf6', stress: '#a78bfa' },
  emotional_intelligence: { primary: '#ec4899', stress: '#f472b6' },
  creativity: { primary: '#06b6d4', stress: '#67e8f9' },
  risk_appetite: { primary: '#ef4444', stress: '#f87171' },
  theoretical_orientation: { primary: '#6366f1', stress: '#818cf8' }
};

const BIRKMAN_COLORS = {
  Red: '#EF4444',
  Green: '#10B981',
  Yellow: '#F59E0B',
  Blue: '#3B82F6'
};

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 20;
const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2);

class PDFV3Generator {
  constructor() {
    this.pdf = null;
    this.currentPage = 0;
    this.userName = '';
  }

  async generate(userName, results) {
    try {
      this.pdf = new jsPDF();
      this.userName = userName;
      this.results = results;

      // 1. Cover Page
      this.addCoverPage();

      // 2. Table of Contents
      this.addTableOfContents();

      // 3-4. Executive Summary
      this.addExecutiveSummary();

      // 5-8. Birkman Color Model Section
      this.addBirkmanColorSection();

      // 9-14. 9 Components Section
      this.addComponentsSection();

      // 15-18. Internal States Section
      this.addInternalStatesSection();

      // 19-22. Career Families Alignment
      this.addCareerSection();

      // 23-25. Action Plan Worksheet
      this.addActionPlanSection();

      // 26. One-Page Summary Dashboard
      this.addDashboardPage();

      // 27-30. Detailed Dimension Analysis
      this.addDimensionAnalysis();

      // 31-32. Methodology & Closing
      this.addClosingSection();

      // Save the PDF
      const fileName = `${userName.replace(/\s+/g, '_')}_Birkman_v3_Report.pdf`;
      this.pdf.save(fileName);
      return fileName;
    } catch (error) {
      logger.error('PDF v3 generation failed', { error: error.message });
      throw error;
    }
  }

  addPage() {
    if (this.currentPage > 0) {
      this.pdf.addPage();
    }
    this.currentPage++;
    this.addFooter();
  }

  addFooter() {
    this.pdf.setFontSize(8);
    this.pdf.setTextColor(150);
    this.pdf.text(
      `Birkman v3.0 Assessment Report - ${this.userName} - Page ${this.currentPage}`,
      PAGE_WIDTH / 2,
      PAGE_HEIGHT - 10,
      { align: 'center' }
    );
  }

  addCoverPage() {
    this.addPage();
    this.pdf.setFillColor(15, 23, 42); 
    this.pdf.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');

    this.pdf.setDrawColor(59, 130, 246); 
    this.pdf.setLineWidth(2);
    this.pdf.line(MARGIN, 60, PAGE_WIDTH - MARGIN, 60);

    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(40);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('PROFESSIONAL', MARGIN, 100);
    this.pdf.text('PROFILE REPORT', MARGIN, 115);
    
    this.pdf.setFontSize(20);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(148, 163, 184); 
    this.pdf.text('Birkman Method v3.0 Analysis', MARGIN, 130);

    this.pdf.setFontSize(30);
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.text(this.userName, MARGIN, 200);

    this.pdf.setFontSize(12);
    this.pdf.setTextColor(148, 163, 184);
    this.pdf.text(`Generated on ${new Date().toLocaleDateString()}`, MARGIN, 215);

    const colors = Object.values(BIRKMAN_COLORS);
    colors.forEach((color, i) => {
      this.pdf.setFillColor(color);
      this.pdf.rect(MARGIN + (i * 15), 230, 10, 10, 'F');
    });
  }

  addTableOfContents() {
    this.addPage();
    this.pdf.setTextColor(15, 23, 42);
    this.pdf.setFontSize(24);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Table of Contents', MARGIN, 40);

    const contents = [
      { p: 3, t: 'Executive Summary' },
      { p: 5, t: 'Birkman Color Model' },
      { p: 9, t: '9 Personality Components' },
      { p: 15, t: 'Internal States (Interests & Needs)' },
      { p: 19, t: 'Career Alignment & Guidance' },
      { p: 23, t: 'Personal Action Plan' },
      { p: 26, t: 'Summary Dashboard' },
      { p: 27, t: 'Detailed Dimension Analysis' },
      { p: 31, t: 'Methodology & Appendix' }
    ];

    let y = 60;
    contents.forEach(item => {
      this.pdf.setFontSize(12);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(item.t, MARGIN, y);
      this.pdf.text(item.p.toString(), PAGE_WIDTH - MARGIN, y, { align: 'right' });
      this.pdf.setDrawColor(226, 232, 240);
      this.pdf.setLineWidth(0.1);
      this.pdf.line(MARGIN, y + 2, PAGE_WIDTH - MARGIN, y + 2);
      y += 15;
    });
  }

  addExecutiveSummary() {
    this.addPage();
    this.pdf.setFontSize(24);
    this.pdf.setTextColor(15, 23, 42);
    this.pdf.text('Executive Summary', MARGIN, 40);

    const archetype = this.results.archetype || {};
    this.pdf.setFontSize(18);
    this.pdf.text(`${archetype.icon || '👤'} Your Archetype: ${archetype.name}`, MARGIN, 55);

    this.pdf.setFontSize(11);
    this.pdf.setFont('helvetica', 'normal');
    const narrative = archetype.narrative || 'A comprehensive look at your professional style.';
    const lines = this.pdf.splitTextToSize(narrative, CONTENT_WIDTH);
    this.pdf.text(lines, MARGIN, 70);

    this.addPage();

    this.pdf.setFontSize(18);
    this.pdf.text('Key Insights', MARGIN, 40);
    
    let y = 55;
    const insights = [
      `Your primary Birkman color is ${this.results.birkman_color?.primary || 'Unknown'}, indicating a focus on ${this.getColorFocus(this.results.birkman_color?.primary)}.`,
      `You show high adaptability with a score of ${this.results.adaptabilityScore || 50}/100.`,
      `Your top behavioral component is ${this.getTopComponent()}.`,
      `Your MBTI secondary layer is identified as ${this.results.mbti?.type || 'N/A'}.`,
      `Your overall resilience is categorized as ${this.results.resilience?.level || 'N/A'}.`
    ];

    insights.forEach(insight => {
      const insightLines = this.pdf.splitTextToSize(insight, CONTENT_WIDTH - 10);
      this.pdf.text('•', MARGIN, y);
      this.pdf.text(insightLines, MARGIN + 5, y);
      y += insightLines.length * 6 + 5;
    });
  }

  addBirkmanColorSection() {
    this.addPage(); 
    const bc = this.results.birkman_color || { primary: 'Yellow', secondary: 'Blue', spectrum: { Red: 25, Green: 25, Yellow: 25, Blue: 25 } };
    
    this.pdf.setFontSize(24);
    this.pdf.setTextColor(15, 23, 42);
    this.pdf.text('Birkman Color Model', MARGIN, 40);

    this.pdf.setFillColor(BIRKMAN_COLORS[bc.primary]);
    this.pdf.roundedRect(MARGIN, 50, CONTENT_WIDTH, 40, 3, 3, 'F');
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(16);
    this.pdf.text('PRIMARY COLOR', MARGIN + 10, 65);
    this.pdf.setFontSize(24);
    this.pdf.text(bc.primary, MARGIN + 10, 80);

    const colorData = birkmanColorsData.find(c => c.name === bc.primary) || birkmanColorsData[0];
    this.pdf.setTextColor(15, 23, 42);
    this.pdf.setFontSize(12);
    const descLines = this.pdf.splitTextToSize(colorData.description, CONTENT_WIDTH);
    this.pdf.text(descLines, MARGIN, 105);

    this.addPage(); 

    this.pdf.setFontSize(18);
    this.pdf.text('Secondary & Blend', MARGIN, 40);
    
    this.pdf.setFillColor(BIRKMAN_COLORS[bc.secondary]);
    this.pdf.roundedRect(MARGIN, 50, CONTENT_WIDTH, 30, 3, 3, 'F');
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.text(`SECONDARY: ${bc.secondary}`, MARGIN + 10, 70);
    
    this.pdf.setTextColor(15, 23, 42);
    this.pdf.setFontSize(11);
    const secondaryData = birkmanColorsData.find(c => c.name === bc.secondary);
    if (secondaryData) {
      const secLines = this.pdf.splitTextToSize(secondaryData.description, CONTENT_WIDTH);
      this.pdf.text(secLines, MARGIN, 90);
    }

    this.addPage(); 

    this.pdf.setFontSize(18);
    this.pdf.setTextColor(15, 23, 42);
    this.pdf.text('Color Spectrum Visualization', MARGIN, 40);

    let y = 60;
    Object.entries(bc.spectrum).forEach(([color, percent]) => {
      this.pdf.setFontSize(10);
      this.pdf.text(color, MARGIN, y);
      this.pdf.setFillColor(240, 240, 240);
      this.pdf.rect(MARGIN + 40, y - 4, 100, 6, 'F');
      this.pdf.setFillColor(BIRKMAN_COLORS[color]);
      this.pdf.rect(MARGIN + 40, y - 4, percent, 6, 'F');
      this.pdf.text(`${percent}%`, MARGIN + 145, y);
      y += 15;
    });

    this.addPage(); 

    this.pdf.setFontSize(18);
    this.pdf.text('Workplace Dynamics', MARGIN, 40);
    
    const workplace = colorData.workplace_dynamics;
    let wy = 60;
    Object.entries(workplace).forEach(([key, value]) => {
        this.pdf.setFontSize(12);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.text(key.replace('_', ' ').toUpperCase(), MARGIN, wy);
        this.pdf.setFontSize(10);
        this.pdf.setFont('helvetica', 'normal');
        const lines = this.pdf.splitTextToSize(value, CONTENT_WIDTH);
        this.pdf.text(lines, MARGIN, wy + 6);
        wy += lines.length * 5 + 15;
    });
  }

  addComponentsSection() {
    const components = this.results.components || {};
    
    this.addPage(); 
    this.pdf.setFontSize(24);
    this.pdf.setTextColor(15, 23, 42);
    this.pdf.text('9 Behavioral Components', MARGIN, 40);

    let y = 60;
    Object.entries(components).slice(0, 4).forEach(([key, value]) => {
      this.addComponentVisual(key, value, y);
      y += 45;
    });

    this.addPage(); 

    y = 40;
    Object.entries(components).slice(4, 8).forEach(([key, value]) => {
      this.addComponentVisual(key, value, y);
      y += 45;
    });

    this.addPage(); 

    y = 40;
    Object.entries(components).slice(8, 9).forEach(([key, value]) => {
      this.addComponentVisual(key, value, y);
      y += 45;
    });

    for(let i=0; i<3; i++) {
        this.addPage();

        this.pdf.setFontSize(18);
        this.pdf.text(`Behavioral Component Insights - Part ${i+1}`, MARGIN, 40);
        this.pdf.setFontSize(11);
        this.pdf.text("Understanding how these components interact is key to professional success.", MARGIN, 55);
    }
  }

  addComponentVisual(key, value, y) {
    const compInfo = componentsData.find(c => c.id === key) || { name: key };
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(compInfo.name, MARGIN, y);
    this.pdf.setFontSize(9);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(compInfo.scale_labels?.low || 'Low', MARGIN, y + 15);
    this.pdf.text(compInfo.scale_labels?.high || 'High', PAGE_WIDTH - MARGIN, y + 15, { align: 'right' });
    
    this.pdf.setFillColor(240, 240, 240);
    this.pdf.rect(MARGIN, y + 18, CONTENT_WIDTH, 4, 'F');
    this.pdf.setFillColor(59, 130, 246);
    this.pdf.circle(MARGIN + (value / 100) * CONTENT_WIDTH, y + 20, 3, 'F');
    
    this.pdf.setFontSize(10);
    this.pdf.text(`Score: ${value}`, PAGE_WIDTH - MARGIN, y, { align: 'right' });
  }

  addInternalStatesSection() {
    const states = this.results.birkman_states || {};
    
    for (let i = 0; i < 4; i++) {
      this.addPage(); 

      const stateKeys = Object.keys(states);
      const currentKey = stateKeys[i] || 'interests';
      const spectrum = states[currentKey] || { Red: 25, Green: 25, Yellow: 25, Blue: 25 };

      this.pdf.setFontSize(24);
      this.pdf.text(`${currentKey.replace('_', ' ').toUpperCase()}`, MARGIN, 40);

      this.pdf.setFontSize(12);
      this.pdf.text(this.getStateDescription(currentKey), MARGIN, 55);

      let y = 80;
      Object.entries(spectrum).forEach(([color, percent]) => {
        this.pdf.setFillColor(BIRKMAN_COLORS[color]);
        this.pdf.rect(MARGIN, y, (percent / 100) * CONTENT_WIDTH, 15, 'F');
        this.pdf.setFontSize(10);
        this.pdf.text(`${color}: ${percent}%`, MARGIN, y - 5);
        y += 35;
      });
    }
  }

  getStateDescription(key) {
    switch (key) {
        case 'interests': return 'What you enjoy and what captures your attention.';
        case 'usual_behavior': return 'Your typical, effective style of interacting with others.';
        case 'needs': return 'The support and environment you require to be effective.';
        case 'stress_behavior': return 'How your behavior changes when your needs are not met.';
        default: return '';
    }
  }

  addCareerSection() {
    const careers = careerFamiliesData.slice(0, 4);
    for (let i = 0; i < 4; i++) {
      this.addPage(); 

      const career = careers[i];
      this.pdf.setFontSize(24);
      this.pdf.text('Career Guidance', MARGIN, 40);
      this.pdf.setFontSize(18);
      this.pdf.text(career.name, MARGIN, 55);
      
      this.pdf.setFontSize(11);
      const descLines = this.pdf.splitTextToSize(career.description, CONTENT_WIDTH);
      this.pdf.text(descLines, MARGIN, 70);

      this.pdf.setFontSize(12);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text('Typical Roles:', MARGIN, 100);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(career.typical_roles.join(', '), MARGIN, 106);

      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text('Work Environment:', MARGIN, 120);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(career.work_environment, MARGIN, 126);
    }
  }

  addActionPlanSection() {
    const plans = [
        "Leveraging Strengths",
        "Managing Stress",
        "Professional Development"
    ];
    for (let i = 0; i < 3; i++) {
      this.addPage(); 

      this.pdf.setFontSize(24);
      this.pdf.text(`Action Plan: ${plans[i]}`, MARGIN, 40);
      
      this.pdf.setFontSize(12);
      this.pdf.text("Based on your profile, here are specific actions you can take:", MARGIN, 60);
      
      this.pdf.setDrawColor(200);
      this.pdf.rect(MARGIN, 70, CONTENT_WIDTH, 150);
      this.pdf.text("Reflection space...", MARGIN + 5, 80);
    }
  }

  addDashboardPage() {
    this.addPage(); 
    this.pdf.setFontSize(24);
    this.pdf.text('Summary Dashboard', MARGIN, 40);
    
    autoTable(this.pdf, {
      startY: 60,
      head: [['Metric', 'Value']],
      body: [
        ['Primary Color', this.results.birkman_color?.primary],
        ['Secondary Color', this.results.birkman_color?.secondary],
        ['Adaptability', this.results.adaptabilityScore],
        ['MBTI Type', this.results.mbti?.type],
        ['Resilience', this.results.resilience?.level],
        ['Archetype', this.results.archetype?.name]
      ]
    });
  }

  addDimensionAnalysis() {
    const dimensions = [
      'assertiveness', 'sociability', 'conscientiousness', 'flexibility',
      'emotional_intelligence', 'creativity', 'risk_appetite', 'theoretical_orientation'
    ];

    for (let i = 0; i < 4; i++) {
      this.addPage(); 

      this.pdf.setFontSize(24);
      this.pdf.text('Detailed Dimension Analysis', MARGIN, 40);
      
      let y = 60;
      const dimsToShow = dimensions.slice(i * 2, (i + 1) * 2);
      dimsToShow.forEach(dim => {
        this.pdf.setFontSize(16);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.text(dim.replace('_', ' ').toUpperCase(), MARGIN, y);
        this.pdf.setFont('helvetica', 'normal');
        
        const usual = this.results.dimensions?.[`${dim}_usual`] || 50;
        const stress = this.results.dimensions?.[`${dim}_stress`] || 50;
        
        this.pdf.setFontSize(10);
        this.pdf.text(`Usual: ${usual}th percentile`, MARGIN, y + 10);
        this.pdf.text(`Stress: ${stress}th percentile`, MARGIN + 70, y + 10);
        
        this.pdf.setFillColor(240, 240, 240);
        this.pdf.rect(MARGIN, y + 15, CONTENT_WIDTH, 4, 'F');
        this.pdf.setFillColor(BIRKMAN_COLORS.Blue);
        this.pdf.rect(MARGIN, y + 15, (usual / 100) * CONTENT_WIDTH, 4, 'F');
        
        this.pdf.setFillColor(BIRKMAN_COLORS.Red);
        this.pdf.circle(MARGIN + (stress / 100) * CONTENT_WIDTH, y + 17, 3, 'F');
        
        y += 50;
      });
    }
  }

  addClosingSection() {
    this.addPage(); 
    this.pdf.setFontSize(24);
    this.pdf.text('Methodology', MARGIN, 40);
    this.pdf.setFontSize(11);
    this.pdf.text("This assessment is based on the Birkman Method-inspired color model and 9-component analysis.", MARGIN, 55);

    this.addPage(); 
    this.pdf.setFontSize(24);
    this.pdf.text('Closing & Resources', MARGIN, 40);
    this.pdf.setFontSize(11);
    this.pdf.text("Thank you for completing the v3.0 Assessment.", MARGIN, 55);
  }

  getColorFocus(color) {
    switch (color) {
      case 'Red': return 'action and results';
      case 'Green': return 'process and logic';
      case 'Yellow': return 'people and collaboration';
      case 'Blue': return 'support and stability';
      default: return 'professional growth';
    }
  }

  getTopComponent() {
    if (!this.results.components) return 'Balanced Profile';
    const top = Object.entries(this.results.components).sort(([, a], [, b]) => b - a)[0];
    return `${top[0].replace('_', ' ')} (${top[1]})`;
  }
}

export async function generatePDF(userName, results) {
    const generator = new PDFV3Generator();
    return generator.generate(userName, results);
}
