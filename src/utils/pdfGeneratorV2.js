import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 20;
const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2);
const CONTENT_HEIGHT = PAGE_HEIGHT - (MARGIN * 2);

class PDFReportGenerator {
  constructor() {
    this.pdf = null;
    this.currentPage = 1;
    this.userName = '';
  }

  async generate(userName, results) {
    this.pdf = new jsPDF();
    this.userName = userName;
    
    // Create comprehensive report with all sections
    this.addCoverPage();
    this.addExecutiveSummary(results);
    this.addDimensionDashboard(results);
    this.addProfileNarrative(results);
    this.addStrengthsAndShadows(results);
    this.addWorkEnvironmentSection(results);
    this.addCreativityAngle(results);
    this.addTeamDynamicsMatrix(results);
    this.addStressStrategy(results);
    this.addDevelopmentPlaybook(results);
    this.addMBTISection(results);
    this.addArchetypeDeepDive(results);
    this.addVisualSummary(results);
    
    // Save the PDF
    const fileName = `${userName.replace(/\s+/g, '_')}_Personality_Assessment_v2.pdf`;
    this.pdf.save(fileName);
    
    return fileName;
  }

  addCoverPage() {
    // Modern gradient cover
    this.pdf.setFillColor(30, 58, 138); // Deep blue
    this.pdf.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');
    
    // Decorative shapes
    this.pdf.setFillColor(59, 130, 246, 0.1); // Light blue with transparency
    this.pdf.circle(PAGE_WIDTH - 40, 40, 30, 'F');
    
    this.pdf.setFillColor(99, 102, 241, 0.1); // Indigo with transparency
    this.pdf.circle(40, PAGE_HEIGHT - 40, 40, 'F');
    
    // Main title
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(36);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(`${this.userName}'s`, PAGE_WIDTH / 2, 80, { align: 'center' });
    
    this.pdf.setFontSize(48);
    this.pdf.text('Personality Assessment', PAGE_WIDTH / 2, 100, { align: 'center' });
    this.pdf.text('v2.0', PAGE_WIDTH / 2, 115, { align: 'center' });
    
    // Subtitle
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text('Comprehensive 10-Dimensional Analysis', PAGE_WIDTH / 2, 140, { align: 'center' });
    this.pdf.text('with Archetypes & MBTI Integration', PAGE_WIDTH / 2, 150, { align: 'center' });
    
    // Date and version
    const date = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    this.pdf.setFontSize(12);
    this.pdf.text(date, PAGE_WIDTH / 2, 260, { align: 'center' });
    this.pdf.text('10-12 Page Detailed Report', PAGE_WIDTH / 2, 270, { align: 'center' });
  }

  addExecutiveSummary(results) {
    this.addPage();
    this.pdf.setFontSize(28);
    this.pdf.setTextColor(30, 58, 138);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Executive Summary', MARGIN, MARGIN + 10);
    
    // Add decorative line
    this.pdf.setDrawColor(99, 102, 241);
    this.pdf.setLineWidth(1);
    this.pdf.line(MARGIN, MARGIN + 15, MARGIN + 40, MARGIN + 15);
    
    const { archetype, mbti, resilience, personalizedNarrative } = results;
    
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFont('helvetica', 'normal');
    
    let y = MARGIN + 30;
    
    // Archetype Overview
    this.pdf.setFontSize(18);
    this.pdf.setTextColor(30, 58, 138);
    this.pdf.text(`${archetype.icon} ${archetype.name}`, MARGIN, y);
    y += 10;
    
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(0, 0, 0);
    const descriptionLines = this.pdf.splitTextToSize(archetype.narrative, CONTENT_WIDTH);
    this.pdf.text(descriptionLines, MARGIN, y);
    y += descriptionLines.length * 5 + 8;
    
    // Key Metrics Grid
    const metrics = [
      { label: 'Resilience Score', value: `${resilience.score}/100`, subtext: resilience.level, color: this.getResilienceColor(resilience.score) },
      { label: 'MBTI Confidence', value: `${mbti.confidence}%`, subtext: mbti.type, color: DIMENSION_COLORS.assertiveness.primary },
      { label: 'Top Values', value: this.getTopValues(results.scores), subtext: 'Core motivators', color: DIMENSION_COLORS.sociability.primary }
    ];
    
    metrics.forEach((metric, i) => {
      const x = MARGIN + (i * 60);
      const metricY = y;
      
      this.pdf.setFillColor(metric.color);
      this.pdf.rect(x, metricY, 55, 40, 'F');
      
      this.pdf.setTextColor(255, 255, 255);
      this.pdf.setFontSize(10);
      this.pdf.text(metric.label, x + 27.5, metricY + 10, { align: 'center' });
      this.pdf.setFontSize(14);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(metric.value, x + 27.5, metricY + 25, { align: 'center' });
      this.pdf.setFontSize(8);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(metric.subtext, x + 27.5, metricY + 35, { align: 'center' });
    });
    
    y += 50;
    
    // Personalized Narrative
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Your Unique Profile', MARGIN, y);
    y += 8;
    
    this.pdf.setFontSize(11);
    this.pdf.setFont('helvetica', 'normal');
    const narrativeLines = this.pdf.splitTextToSize(personalizedNarrative, CONTENT_WIDTH);
    this.pdf.text(narrativeLines, MARGIN, y);
    y += narrativeLines.length * 5 + 15;
    
    // Archetype Strengths Extract
    if (archetype.strengths && archetype.strengths.length > 0) {
      this.pdf.setFontSize(12);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text('Key Strengths', MARGIN, y);
      y += 6;
      
      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'normal');
      archetype.strengths.slice(0, 3).forEach(strength => {
        this.pdf.text(`• ${strength}`, MARGIN + 5, y);
        y += 5;
      });
    }
  }

  addDimensionDashboard(results) {
    this.addPage();
    
    this.pdf.setFontSize(24);
    this.pdf.setTextColor(30, 58, 138);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('10-Dimension Profile Dashboard', MARGIN, MARGIN + 10);
    
    // Create visual radar chart concept
    const centerX = PAGE_WIDTH / 2;
    const centerY = MARGIN + 80;
    const radius = 60;
    
    // Draw grid circles
    this.pdf.setDrawColor(200, 200, 200);
    this.pdf.setLineWidth(0.3);
    for (let i = 1; i <= 3; i++) {
      this.pdf.circle(centerX, centerY, radius * i / 3);
    }
    
    // Draw axes and data
    const dimensions = Object.keys(DIMENSION_COLORS);
    const angleStep = (2 * Math.PI) / dimensions.length;
    
    dimensions.forEach((dim, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const x1 = centerX + Math.cos(angle) * radius / 3;
      const y1 = centerY + Math.sin(angle) * radius / 3;
      const x2 = centerX + Math.cos(angle) * radius;
      const y2 = centerY + Math.sin(angle) * radius;
      
      // Axis line
      this.pdf.line(x1, y1, x2, y2);
      
      // Dimension label
      const labelX = centerX + Math.cos(angle) * (radius + 10);
      const labelY = centerY + Math.sin(angle) * (radius + 10);
      
      this.pdf.setFontSize(8);
      this.pdf.text(dim.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()), labelX, labelY, { align: 'center' });
      
      // Data point (usual behavior)
      const usualScore = results.scores[`${dim}_usual`] || 50;
      const dataRadius = radius * (usualScore / 100);
      const dataX = centerX + Math.cos(angle) * dataRadius;
      const dataY = centerY + Math.sin(angle) * dataRadius;
      
      this.pdf.setFillColor(DIMENSION_COLORS[dim].primary);
      this.pdf.circle(dataX, dataY, 2, 'F');
      
      // Stress behavior point
      const stressScore = results.scores[`${dim}_stress`] || 50;
      const stressRadius = radius * (stressScore / 100);
      const stressX = centerX + Math.cos(angle) * stressRadius;
      const stressY = centerY + Math.sin(angle) * stressRadius;
      
      this.pdf.setFillColor(DIMENSION_COLORS[dim].stress);
      this.pdf.circle(stressX, stressY, 1.5, 'F');
    });
    
    // Legend
    let legendY = centerY + radius + 30;
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text('Usual Behavior (Solid)', MARGIN, legendY);
    this.pdf.setFillColor(0, 0, 0);
    this.pdf.circle(MARGIN + 50, legendY - 1, 2, 'F');
    
    this.pdf.text('Stress Behavior (Light)', MARGIN + 70, legendY);
    this.pdf.setFillColor(100, 100, 100);
    this.pdf.circle(MARGIN + 130, legendY - 1, 1.5, 'F');
  }

  addProfileNarrative(results) {
    this.addPage();
    
    const { archetype, scores } = results;
    
    this.pdf.setFontSize(22);
    this.pdf.setTextColor(30, 58, 138);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Detailed Profile Analysis', MARGIN, MARGIN + 10);
    
    // Theoretical vs Practical orientation analysis
    const theoretical = scores.theoretical_orientation_usual;
    let orientationLabel, orientationDesc;
    
    if (theoretical > 70) {
      orientationLabel = 'Visionary Thinker';
      orientationDesc = 'You excel at developing frameworks and understanding abstract principles before applying them.';
    } else if (theoretical < 30) {
      orientationLabel = 'Pragmatic Executor';
      orientationDesc = 'You prefer learning by doing and focus on practical results over theoretical purity.';
    } else {
      orientationLabel = 'Balanced Approach';
      orientationDesc = 'You balance theoretical understanding with practical application based on the situation.';
    }
    
    let y = MARGIN + 30;
    
    this.pdf.setFontSize(16);
    this.pdf.text(`${orientationLabel} - ${archetype.name}`, MARGIN, y);
    y += 10;
    
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(0, 0, 0);
    const orientationLines = this.pdf.splitTextToSize(
      `Your theoretical orientation score of ${theoretical}th percentile indicates you are ${orientationLabel.toLowerCase()}. ${orientationDesc} This shapes how you approach problems and learn new skills.`,
      CONTENT_WIDTH
    );
    this.pdf.text(orientationLines, MARGIN, y);
    y += orientationLines.length * 5 + 10;
    
    // Risk appetite and creativity combination
    const riskAppetite = scores.risk_appetite_usual;
    const creativity = scores.creativity_usual;
    
    if (creativity > 70 && riskAppetite > 70) {
      this.pdf.setFontSize(14);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text('Innovation Profile', MARGIN, y);
      y += 8;
      
      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'normal');
      const innovationLines = this.pdf.splitTextToSize(
        'Your combination of high creativity and risk appetite suggests you thrive on breakthrough innovation. You are comfortable with uncertainty and enjoy exploring uncharted territory.',
        CONTENT_WIDTH
      );
      this.pdf.text(innovationLines, MARGIN, y);
      y += innovationLines.length * 5 + 8;
    }
    
    // Values integration
    const topValues = Object.entries(scores.values_profile || {})
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([key]) => key);
    
    if (topValues.length > 0) {
      this.pdf.setFontSize(14);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text('Core Values', MARGIN, y);
      y += 8;
      
      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'normal');
      topValues.forEach(value => {
        const label = value.charAt(0).toUpperCase() + value.slice(1);
        this.pdf.text(`• ${label}`, MARGIN + 5, y);
        y += 5;
      });
    }
  }

  addStrengthsAndShadows(results) {
    this.addPage();
    
    const { archetype } = results;
    
    this.pdf.setFontSize(22);
    this.pdf.setTextColor(30, 58, 138);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Strengths & Shadows', MARGIN, MARGIN + 10);
    
    let y = MARGIN + 25;
    
    // Two column layout
    const columnWidth = (CONTENT_WIDTH - 10) / 2;
    
    // Left column - Strengths
    this.pdf.setFillColor(16, 185, 129, 0.1);
    this.pdf.roundedRect(MARGIN, y, columnWidth, 120, 3, 3, 'F');
    
    this.pdf.setFontSize(16);
    this.pdf.setTextColor(16, 185, 129);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('✓', MARGIN + 5, y + 8);
    this.pdf.text('Strengths in Your Sweet Spot', MARGIN + 15, y + 8);
    
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFont('helvetica', 'normal');
    
    let strengthsY = y + 15;
    if (archetype.strengths) {
      archetype.strengths.slice(0, 4).forEach(strength => {
        const strengthLines = this.pdf.splitTextToSize(strength, columnWidth - 10);
        this.pdf.text(strengthLines, MARGIN + 5, strengthsY);
        strengthsY += strengthLines.length * 4 + 8;
      });
    }
    
    // Right column - Blind spots
    this.pdf.setFillColor(239, 68, 68, 0.1);
    this.pdf.roundedRect(MARGIN + columnWidth + 10, y, columnWidth, 120, 3, 3, 'F');
    
    this.pdf.setFontSize(16);
    this.pdf.setTextColor(239, 68, 68);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('⚠', MARGIN + columnWidth + 15, y + 8);
    this.pdf.text('Blind Spots & Growth Areas', MARGIN + columnWidth + 25, y + 8);
    
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFont('helvetica', 'normal');
    
    let blindSpotsY = y + 15;
    if (archetype.blindSpots) {
      archetype.blindSpots.slice(0, 3).forEach(spot => {
        const spotLines = this.pdf.splitTextToSize(spot, columnWidth - 10);
        this.pdf.text(spotLines, MARGIN + columnWidth + 15, blindSpotsY);
        blindSpotsY += spotLines.length * 4 + 8;
      });
    }
    
    y += 130;
    
    // Stress impact note
    this.pdf.setFontSize(11);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Under Stress:', MARGIN, y);
    y += 8;
    
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    const stressNote = 'Your stress response patterns show that blind spots may become more pronounced under pressure. Awareness of these patterns allows you to compensate and maintain effectiveness.';
    const stressLines = this.pdf.splitTextToSize(stressNote, CONTENT_WIDTH);
    this.pdf.text(stressLines, MARGIN, y);
  }

  addWorkEnvironmentSection(results) {
    this.addPage();
    
    const { scores } = results;
    
    this.pdf.setFontSize(22);
    this.pdf.setTextColor(30, 58, 138);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Work Environment & Values', MARGIN, MARGIN + 10);
    
    let y = MARGIN + 25;
    
    // Values bar chart
    this.pdf.setFontSize(14);
    this.pdf.text('Core Work Values', MARGIN, y);
    y += 10;
    
    const values = scores.values_profile;
    if (values) {
      const sortedValues = Object.entries(values).sort(([,a], [,b]) => b - a);
      
      sortedValues.forEach(([key, score], index) => {
        if (index < 6) { // Show top 6
          const label = key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ');
          
          this.pdf.setFontSize(10);
          this.pdf.setTextColor(0, 0, 0);
          this.pdf.text(label, MARGIN, y);
          
          // Bar
          this.pdf.setFillColor(59, 130, 246);
          this.pdf.rect(MARGIN + 40, y - 3, score * 0.8, 6, 'F');
          
          // Score
          this.pdf.text(`${score}%`, MARGIN + 45 + score * 0.8, y);
          y += 8;
        }
      });
    }
    
    y += 10;
    
    // Work style preferences
    this.pdf.setFontSize(14);
    this.pdf.text('Work Style Preferences', MARGIN, y);
    y += 10;
    
    const workStyle = scores.work_style_profile;
    if (workStyle) {
      const preferences = [
        { key: 'pace', label: 'Pace', description: 'Fast-paced vs Steady' },
        { key: 'structure', label: 'Structure', description: 'Clear vs Flexible' },
        { key: 'autonomy', label: 'Autonomy', description: 'Independent vs Directed' }
      ];
      
      preferences.forEach(pref => {
        const score = workStyle[pref.key];
        if (score !== undefined) {
          const level = score > 60 ? 'High' : score > 40 ? 'Medium' : 'Low';
          
          this.pdf.setFontSize(10);
          this.pdf.text(`${pref.label}: ${level} preference`, MARGIN, y);
          
          // Visual indicator
          this.pdf.setFillColor(score > 60 ? '#10b981' : score > 40 ? '#f59e0b' : '#ef4444');
          this.pdf.rect(MARGIN + 50, y - 2, 20, 4, 'F');
          
          y += 6;
        }
      });
    }
  }

  addCreativityAngle(results) {
    this.addPage();
    
    const { scores, archetype } = results;
    
    this.pdf.setFontSize(22);
    this.pdf.setTextColor(30, 58, 138);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('The Creativity Angle', MARGIN, MARGIN + 10);
    
    let y = MARGIN + 25;
    
    // Creativity profile analysis
    const creativity = scores.creativity_usual;
    const theoretical = scores.theoretical_orientation_usual;
    
    let creativeType, creativeDesc;
    
    if (creativity > 70 && theoretical > 70) {
      creativeType = 'Conceptual Innovator';
      creativeDesc = 'You excel at developing breakthrough frameworks and theoretical innovations. Your creativity shines in abstract problem-solving and pioneering new conceptual territory.';
    } else if (creativity > 70 && theoretical < 30) {
      creativeType = 'Applied Creator';
      creativeDesc = 'Your creativity focuses on practical solutions and hands-on innovation. You excel at finding novel ways to make things work better in real-world applications.';
    } else if (creativity > 60) {
      creativeType = 'Balanced Creative';
      creativeDesc = 'You bring creative thinking to both conceptual and practical challenges, adapting your innovative approach based on the situation requirements.';
    } else {
      creativeType = 'Systematic Improver';
      creativeDesc = 'While not primarily focused on creative innovation, you excel at systematically improving existing processes and methods through careful refinement.';
    }
    
    this.pdf.setFontSize(16);
    this.pdf.text(creativeType, MARGIN, y);
    y += 10;
    
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFont('helvetica', 'normal');
    const typeLines = this.pdf.splitTextToSize(creativeDesc, CONTENT_WIDTH);
    this.pdf.text(typeLines, MARGIN, y);
    y += typeLines.length * 5 + 10;
    
    // Creative collaboration insights
    if (archetype.id === 'creator' || archetype.id === 'visionary') {
      this.pdf.setFontSize(14);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text('Creative Collaboration', MARGIN, y);
      y += 8;
      
      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'normal');
      const collabText = 'Your creative style works best when paired with colleagues who excel at execution and detail orientation. Consider partnering with Craftsman or Analyst archetypes to turn creative visions into reality.';
      const collabLines = this.pdf.splitTextToSize(collabText, CONTENT_WIDTH);
      this.pdf.text(collabLines, MARGIN, y);
      y += collabLines.length * 5 + 8;
    }
    
    // Unlocking more creativity
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Unlocking Your Creative Potential', MARGIN, y);
    y += 8;
    
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    const suggestions = [
      'Schedule dedicated time for creative exploration, even during busy periods',
      'Expose yourself to diverse perspectives and fields outside your expertise',
      'Practice divergent thinking exercises to strengthen creative muscles',
      'Create space for incubation - creativity often emerges during downtime'
    ];
    
    suggestions.forEach(suggestion => {
      const suggestionLines = this.pdf.splitTextToSize(`• ${suggestion}`, CONTENT_WIDTH - 10);
      this.pdf.text(suggestionLines, MARGIN + 5, y);
      y += suggestionLines.length * 5 + 3;
    });
  }

  addTeamDynamicsMatrix(results) {
    this.addPage();
    
    const { archetype } = results;
    
    this.pdf.setFontSize(22);
    this.pdf.setTextColor(30, 58, 138);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Team Dynamics & Collaboration', MARGIN, MARGIN + 10);
    
    let y = MARGIN + 25;
    
    // Your team role
    this.pdf.setFontSize(16);
    this.pdf.text('Your Team Role', MARGIN, y);
    y += 8;
    
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFont('helvetica', 'normal');
    const roleLines = this.pdf.splitTextToSize(
      archetype.teamRole || 'You bring unique strengths to team collaboration.',
      CONTENT_WIDTH
    );
    this.pdf.text(roleLines, MARGIN, y);
    y += roleLines.length * 5 + 10;
    
    // Compatibility matrix
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Working with Other Types', MARGIN, y);
    y += 8;
    
    this.pdf.setFontSize(9);
    this.pdf.setFont('helvetica', 'normal');
    
    // Simple matrix showing compatibility
    const archetypes = ['strategist', 'visionary', 'craftsman', 'connector', 'catalyst', 'analyst', 'creator', 'maverick'];
    const compatibilityData = [
      ['Your Type', 'Synergy', 'Potential Challenges', 'Best Collaboration'],
      [`${archetype.name}`, 'High', 'Managing different paces', 'Clear communication'],
      [archetype.id === 'strategist' ? 'Visionary' : 'Strategist', 'Medium', 'Different planning styles', 'Complementary strengths']
    ];
    
    // Draw simple table
    autoTable(this.pdf, {
      startY: y,
      head: [['Archetype', 'Compatibility', 'How to Work Together', 'Watch Out For']],
      body: [
        ['Visionary', 'High', 'Balance vision with execution', 'Follow-through gaps'],
        ['Analyst', 'Medium', 'Combine analysis with action', 'Overthinking vs acting'],
        ['Connector', 'High', 'Leverage relationship networks', 'Maintaining focus']
      ],
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [30, 58, 138],
        textColor: 255,
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      }
    });
  }

  addStressStrategy(results) {
    this.addPage();
    
    const { archetype, scores, stressDeltas } = results;
    
    this.pdf.setFontSize(22);
    this.pdf.setTextColor(30, 58, 138);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Stress & Resilience Strategy', MARGIN, MARGIN + 10);
    
    let y = MARGIN + 25;
    
    // Stress signature
    this.pdf.setFontSize(16);
    this.pdf.text('Your Stress Signature', MARGIN, y);
    y += 10;
    
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFont('helvetica', 'normal');
    
    const significantChanges = Object.entries(stressDeltas).filter(([_, delta]) => Math.abs(delta) > 20);
    
    if (significantChanges.length > 0) {
      const stressDesc = `Under pressure, you show significant changes in: ${significantChanges.map(([dim]) => dim.replace('_', ' ')).join(', ')}. This is ${significantChanges.length > 2 ? 'higher' : 'typical'} for most professionals.`;
      
      const stressLines = this.pdf.splitTextToSize(stressDesc, CONTENT_WIDTH);
      this.pdf.text(stressLines, MARGIN, y);
      y += stressLines.length * 5 + 10;
    }
    
    // Recovery strategies
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Personalized Recovery Strategies', MARGIN, y);
    y += 8;
    
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    
    const strategies = archetype.copingStrategies || [
      'Practice self-awareness to recognize early stress signals',
      'Develop specific coping mechanisms that align with your work style',
      'Build support networks that complement your personality type',
      'Create structured recovery periods after high-stress situations'
    ];
    
    strategies.forEach((strategy, i) => {
      if (i < 4) { // Show max 4 strategies
        const strategyLines = this.pdf.splitTextToSize(`${i + 1}. ${strategy}`, CONTENT_WIDTH - 10);
        this.pdf.text(strategyLines, MARGIN + 5, y);
        y += strategyLines.length * 5 + 3;
      }
    });
    
    y += 10;
    
    // Early warning signs
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Early Warning Signs', MARGIN, y);
    y += 8;
    
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    
    const warnings = [
      'Notice when your typical behaviors start to shift',
      'Monitor physical and emotional exhaustion indicators',
      'Watch for decreased effectiveness in your key strengths',
      'Be aware when usual coping mechanisms stop working'
    ];
    
    warnings.forEach(warning => {
      this.pdf.text(`• ${warning}`, MARGIN + 5, y);
      y += 6;
    });
  }

  addDevelopmentPlaybook(results) {
    this.addPage();
    
    this.pdf.setFontSize(22);
    this.pdf.setTextColor(30, 58, 138);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Development Playbook', MARGIN, MARGIN + 10);
    
    let y = MARGIN + 25;
    
    // Growth edge
    this.pdf.setFontSize(16);
    this.pdf.text('Your Growth Edge', MARGIN, y);
    y += 10;
    
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFont('helvetica', 'normal');
    
    const growthText = 'Based on your profile, focus on balancing your natural strengths with complementary skills. The key is developing versatility while honoring your core preferences.';
    const growthLines = this.pdf.splitTextToSize(growthText, CONTENT_WIDTH);
    this.pdf.text(growthLines, MARGIN, y);
    y += growthLines.length * 5 + 15;
    
    // 90-day action plan
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('90-Day Development Plan', MARGIN, y);
    y += 8;
    
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    
    const plan = [
      {
        phase: 'Discovery (Days 1-30)',
        actions: [
          'Map your current patterns and identify growth opportunities',
          'Gather feedback from colleagues about your collaboration style',
          'Track situations where your profile helps or hinders progress'
        ]
      },
      {
        phase: 'Practice (Days 31-60)',
        actions: [
          'Experiment with behaviors outside your comfort zone',
          'Apply new approaches in low-stakes situations',
          'Build habits that support your development goals'
        ]
      },
      {
        phase: 'Integration (Days 61-90)',
        actions: [
          'Apply learning to real workplace challenges',
          'Measure progress against initial baseline',
          'Refine your approach based on what works'
        ]
      }
    ];
    
    plan.forEach((period, i) => {
      this.pdf.setFontSize(11);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(`${i + 1}. ${period.phase}`, MARGIN, y);
      y += 6;
      
      this.pdf.setFontSize(9);
      this.pdf.setFont('helvetica', 'normal');
      
      period.actions.forEach(action => {
        const actionLines = this.pdf.splitTextToSize(`• ${action}`, CONTENT_WIDTH - 10);
        this.pdf.text(actionLines, MARGIN + 5, y);
        y += actionLines.length * 4 + 3;
      });
      
      y += 5;
    });
  }

  addMBTISection(results) {
    this.addPage();
    
    const { mbti } = results;
    
    this.pdf.setFontSize(22);
    this.pdf.setTextColor(30, 58, 138);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('MBTI Cognitive Style', MARGIN, MARGIN + 10);
    
    let y = MARGIN + 25;
    
    // MBTI type display
    this.pdf.setFontSize(48);
    this.pdf.setTextColor(99, 102, 241);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(mbti.type, PAGE_WIDTH / 2, y, { align: 'center' });
    y += 15;
    
    // Profile name
    this.pdf.setFontSize(18);
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text(mbti.profile.name, PAGE_WIDTH / 2, y, { align: 'center' });
    y += 8;
    
    // Confidence
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.text(`Confidence: ${mbti.confidence}%`, PAGE_WIDTH / 2, y, { align: 'center' });
    y += 15;
    
    // Description
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(0, 0, 0);
    const descLines = this.pdf.splitTextToSize(mbti.profile.description, CONTENT_WIDTH);
    this.pdf.text(descLines, MARGIN, y);
    y += descLines.length * 5 + 15;
    
    // Cognitive functions
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Cognitive Functions', MARGIN, y);
    y += 8;
    
    this.pdf.setFontSize(9);
    this.pdf.setFont('helvetica', 'normal');
    
    mbti.profile.cognitiveStack.forEach((func, i) => {
      const funcName = `${func} (${i === 0 ? 'Dominant' : i === 1 ? 'Auxiliary' : i === 2 ? 'Tertiary' : 'Inferior'})`;
      this.pdf.text(`${i + 1}. ${funcName}`, MARGIN + 5, y);
      y += 6;
    });
    
    y += 10;
    
    // Complementing your profile
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('How Your MBTI Complements Your Profile', MARGIN, y);
    y += 8;
    
    this.pdf.setFontSize(9);
    this.pdf.setFont('helvetica', 'normal');
    const complementText = 'Your MBTI type provides insights into your cognitive preferences that complement your dimensional scores. This dual perspective offers a more complete picture of your operating style.';
    const complementLines = this.pdf.splitTextToSize(complementText, CONTENT_WIDTH);
    this.pdf.text(complementLines, MARGIN, y);
    y += complementLines.length * 4 + 10;
    
    // Disclaimer
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(239, 68, 68);
    this.pdf.setFont('helvetica', 'italic');
    const disclaimer = 'Note: MBTI is one perspective for self-reflection, not a definitive label. Use it alongside your dimensional assessment for a richer understanding.';
    const disclaimerLines = this.pdf.splitTextToSize(disclaimer, CONTENT_WIDTH);
    this.pdf.text(disclaimerLines, MARGIN, y);
  }

  addArchetypeDeepDive(results) {
    this.addPage();
    
    const { archetype } = results;
    
    this.pdf.setFontSize(26);
    this.pdf.setTextColor(30, 58, 138);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(`${archetype.name} Deep Dive`, MARGIN, MARGIN + 10);
    
    let y = MARGIN + 25;
    
    // Full narrative
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFont('helvetica', 'normal');
    
    const fullNarrative = archetype.narrative + ' ' + (archetype.teamRole || '');
    const narrativeLines = this.pdf.splitTextToSize(fullNarrative, CONTENT_WIDTH);
    this.pdf.text(narrativeLines, MARGIN, y);
    y += narrativeLines.length * 5 + 15;
    
    // Career paths
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Ideal Career Paths', MARGIN, y);
    y += 10;
    
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    
    if (archetype.careerPaths) {
      archetype.careerPaths.forEach((path, i) => {
        this.pdf.text(`${i + 1}. ${path}`, MARGIN + 5, y);
        y += 6;
      });
    }
    
    y += 10;
    
    // Leadership style details
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Leadership Approach', MARGIN, y);
    y += 8;
    
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    
    const leadership = archetype.leadershipStyle || 'You lead through your core strengths and natural tendencies.';
    const leadershipLines = this.pdf.splitTextToSize(leadership, CONTENT_WIDTH);
    this.pdf.text(leadershipLines, MARGIN, y);
  }

  addVisualSummary(results) {
    this.addPage();
    
    const { archetype, scores } = results;
    
    this.pdf.setFontSize(28);
    this.pdf.setTextColor(30, 58, 138);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Your Visual Summary', MARGIN, MARGIN + 10);
    
    let y = MARGIN + 30;
    
    // Central archetype badge
    this.pdf.setFillColor(59, 130, 246);
    this.pdf.circle(PAGE_WIDTH / 2, y + 15, 25, 'F');
    
    this.pdf.setFontSize(24);
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.text(archetype.icon, PAGE_WIDTH / 2, y + 20, { align: 'center' });
    
    this.pdf.setFontSize(14);
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text(archetype.name, PAGE_WIDTH / 2, y + 45, { align: 'center' });
    
    y += 70;
    
    // Top strengths grid
    const strengths = [
      { name: 'Assertiveness', score: scores.assertiveness_usual, icon: '💪' },
      { name: 'Conscientiousness', score: scores.conscientiousness_usual, icon: '⚡' },
      { name: 'Creativity', score: scores.creativity_usual, icon: '🎨' }
    ];
    
    strengths.forEach((strength, i) => {
      const x = MARGIN + (i * 55);
      
      this.pdf.setFillColor(240, 240, 240);
      this.pdf.rect(x, y, 50, 35, 'F');
      
      this.pdf.setFontSize(12);
      this.pdf.setTextColor(59, 130, 246);
      this.pdf.text(strength.icon, x + 5, y + 10);
      this.pdf.setTextColor(0, 0, 0);
      this.pdf.text(strength.score, x + 25, y + 10);
      
      this.pdf.setFontSize(8);
      this.pdf.text(strength.name, x + 5, y + 25);
    });
    
    y += 50;
    
    // Key takeaways
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Key Takeaways', MARGIN, y);
    y += 8;
    
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    
    const takeaways = [
      'Use this profile for self-awareness and professional development',
      'Share insights with your team to improve collaboration',
      'Revisit quarterly to track growth and changes',
      'Remember that personality is dynamic, not fixed'
    ];
    
    takeaways.forEach(takeaway => {
      const takeawayLines = this.pdf.splitTextToSize(`• ${takeaway}`, CONTENT_WIDTH - 5);
      this.pdf.text(takeawayLines, MARGIN + 5, y);
      y += takeawayLines.length * 5 + 3;
    });
    
    // Signature line
    y = PAGE_HEIGHT - 40;
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.text(`Assessment completed for ${this.userName}`, MARGIN, y);
    this.pdf.text(`${new Date().toLocaleDateString()}`, PAGE_WIDTH - MARGIN, y, { align: 'right' });
  }

  // Utility methods
  getResilienceColor(score) {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  }
  
  getTopValues(scores) {
    if (!scores.values_profile) return 'Values';
    const sorted = Object.entries(scores.values_profile)
      .sort(([,a], [,b]) => b - a);
    return sorted[0]?.[0] || 'Values';
  }

  addPage() {
    this.pdf.addPage();
    this.currentPage++;
    
    // Add header to new pages
    this.pdf.setDrawColor(200, 200, 200);
    this.pdf.setLineWidth(0.3);
    this.pdf.line(MARGIN, MARGIN - 5, PAGE_WIDTH - MARGIN, MARGIN - 5);
    
    // Page number
    this.pdf.setFontSize(9);
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.text(`Page ${this.currentPage}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 10, { align: 'right' });
  }
}
  
  // Utility methods
  getResilienceColor(score) {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  }
  
  getTopValues(scores) {
    if (!scores.values_profile) return 'Values';
    const sorted = Object.entries(scores.values_profile)
      .sort(([,a], [,b]) => b - a);
    return sorted[0]?.[0] || 'Values';
  }

  addPage() {
    this.pdf.addPage();
    this.currentPage++;
    
    // Add header to new pages
    this.pdf.setDrawColor(200, 200, 200);
    this.pdf.setLineWidth(0.3);
    this.pdf.line(MARGIN, MARGIN - 5, PAGE_WIDTH - MARGIN, MARGIN - 5);
    
    // Page number
    this.pdf.setFontSize(9);
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.text(`Page ${this.currentPage}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 10, { align: 'right' });
  }
}

// Export function
export async function generatePDF(userName, results) {
  const generator = new PDFReportGenerator();
  return generator.generate(userName, results);
}

export default { generatePDF };