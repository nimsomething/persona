import jsPDF from 'jspdf';
import dimensionDescriptionsData from '../data/dimensionDescriptions.json';
import archetypesData from '../data/archetypes.json';
import { getScoreLevel, getScoreColor } from './scoring';

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 20;
const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2);

export async function generatePDF(userName, results) {
  const pdf = new jsPDF();
  const { scores, archetype, stressDeltas, adaptabilityScore } = results;

  let yPos = 0;

  addCoverPage(pdf, userName);
  
  pdf.addPage();
  yPos = addExecutiveSummary(pdf, userName, archetype, scores, adaptabilityScore);
  
  pdf.addPage();
  yPos = addDimensionScorecard(pdf, scores);
  
  addDetailedDimensionProfiles(pdf, scores, stressDeltas);
  
  addArchetypePortrait(pdf, archetype);
  
  addTeamDynamicsMatrix(pdf, archetype);
  
  pdf.addPage();
  yPos = addCareerGuidance(pdf, archetype, scores);
  
  pdf.addPage();
  yPos = addStressInsights(pdf, archetype, scores, stressDeltas);
  
  pdf.addPage();
  yPos = addSummaryDashboard(pdf, userName, archetype, scores, adaptabilityScore);

  pdf.save(`${userName.replace(/\s+/g, '_')}_Personality_Assessment.pdf`);
}

function addCoverPage(pdf, userName) {
  pdf.setFillColor(37, 99, 235);
  pdf.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(40);
  pdf.text(userName + "'s", PAGE_WIDTH / 2, 100, { align: 'center' });
  pdf.setFontSize(48);
  pdf.text("Personality Profile", PAGE_WIDTH / 2, 120, { align: 'center' });
  
  pdf.setFontSize(16);
  const date = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  pdf.text(date, PAGE_WIDTH / 2, 150, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.text("Professional Personality Assessment", PAGE_WIDTH / 2, 250, { align: 'center' });
  pdf.text("6 Core Dimensions • Dual-Profile Analysis • Personalized Insights", PAGE_WIDTH / 2, 260, { align: 'center' });
}

function addExecutiveSummary(pdf, userName, archetype, scores, adaptabilityScore) {
  let y = MARGIN;
  
  pdf.setTextColor(37, 99, 235);
  pdf.setFontSize(24);
  pdf.text("Executive Summary", MARGIN, y);
  y += 15;
  
  pdf.setDrawColor(37, 99, 235);
  pdf.setLineWidth(0.5);
  pdf.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 10;
  
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(16);
  pdf.text(`Your Archetype: ${archetype.name} ${archetype.icon}`, MARGIN, y);
  y += 10;
  
  pdf.setFontSize(11);
  const narrativeLines = pdf.splitTextToSize(archetype.shortDescription, CONTENT_WIDTH);
  pdf.text(narrativeLines, MARGIN, y);
  y += narrativeLines.length * 6 + 5;
  
  pdf.setFontSize(14);
  pdf.setTextColor(37, 99, 235);
  pdf.text("Key Insights About Your Usual Behavior:", MARGIN, y);
  y += 8;
  
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(10);
  
  const dimensions = [
    { key: 'assertiveness', name: 'Assertiveness' },
    { key: 'sociability', name: 'Sociability' },
    { key: 'patience', name: 'Patience' },
    { key: 'flexibility', name: 'Flexibility' },
    { key: 'conscientiousness', name: 'Conscientiousness' },
    { key: 'emotional_intelligence', name: 'Emotional Intelligence' }
  ];
  
  const topDimensions = dimensions
    .map(dim => ({ ...dim, score: scores[`${dim.key}_usual`] }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  
  topDimensions.forEach(dim => {
    const level = getScoreLevel(dim.score);
    const descriptor = level === 'high' ? 'High' : level === 'medium' ? 'Moderate' : 'Lower';
    const text = `• ${descriptor} ${dim.name} (${dim.score}th percentile) - You ${getQuickInsight(dim.key, level)}`;
    const lines = pdf.splitTextToSize(text, CONTENT_WIDTH - 5);
    pdf.text(lines, MARGIN + 3, y);
    y += lines.length * 5 + 2;
  });
  
  y += 5;
  pdf.setFontSize(14);
  pdf.setTextColor(37, 99, 235);
  pdf.text("Your Stress Response:", MARGIN, y);
  y += 8;
  
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(10);
  const stressInsight = getStressResponseHeadline(scores);
  const stressLines = pdf.splitTextToSize(stressInsight, CONTENT_WIDTH);
  pdf.text(stressLines, MARGIN, y);
  y += stressLines.length * 5 + 5;
  
  pdf.setFontSize(14);
  pdf.setTextColor(37, 99, 235);
  pdf.text("Your Top Strengths:", MARGIN, y);
  y += 8;
  
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(10);
  archetype.strengths.slice(0, 3).forEach(strength => {
    const lines = pdf.splitTextToSize(`• ${strength}`, CONTENT_WIDTH - 5);
    pdf.text(lines, MARGIN + 3, y);
    y += lines.length * 5 + 2;
  });
  
  return y;
}

function getQuickInsight(dimension, level) {
  const insights = {
    assertiveness: {
      high: 'naturally take charge and speak up confidently in most situations',
      medium: 'balance stepping forward with supporting others as situations require',
      low: 'prefer to contribute thoughtfully rather than leading from the front'
    },
    sociability: {
      high: 'thrive on collaboration and build relationships easily across teams',
      medium: 'balance independent work with collaborative engagement',
      low: 'focus best with independent work and selective interactions'
    },
    patience: {
      high: 'maintain composure and calm even during uncertainty or delays',
      medium: 'show reasonable patience while maintaining momentum',
      low: 'operate with urgency and have limited tolerance for ambiguity'
    },
    flexibility: {
      high: 'adapt easily to change and embrace new approaches readily',
      medium: 'adapt when needed while valuing some consistency',
      low: 'prefer established processes and find unexpected change challenging'
    },
    conscientiousness: {
      high: 'approach work with thorough planning and attention to detail',
      medium: 'balance detail orientation with maintaining forward momentum',
      low: 'focus on big-picture direction more than detailed planning'
    },
    emotional_intelligence: {
      high: 'are highly attuned to emotions and interpersonal dynamics',
      medium: 'show reasonable emotional awareness while staying task-focused',
      low: 'focus on logic and outcomes more than emotional factors'
    }
  };
  
  return insights[dimension]?.[level] || 'show typical patterns in this area';
}

function getStressResponseHeadline(scores) {
  const dimensions = ['assertiveness', 'sociability', 'patience', 'flexibility', 'conscientiousness', 'emotional_intelligence'];
  
  const changes = dimensions.map(dim => ({
    dimension: dim,
    change: scores[`${dim}_stress`] - scores[`${dim}_usual`]
  }));
  
  const biggestIncrease = changes.reduce((max, curr) => curr.change > max.change ? curr : max);
  const biggestDecrease = changes.reduce((min, curr) => curr.change < min.change ? curr : min);
  
  if (Math.abs(biggestIncrease.change) < 10 && Math.abs(biggestDecrease.change) < 10) {
    return 'Under pressure, you maintain relatively consistent behavior patterns, which provides stability to those around you during challenging times.';
  }
  
  if (biggestIncrease.change > Math.abs(biggestDecrease.change)) {
    const dimName = biggestIncrease.dimension.replace('_', ' ');
    return `When stressed, your ${dimName} increases significantly. You become more ${getStressDirection(biggestIncrease.dimension, 'increase')} under pressure.`;
  } else {
    const dimName = biggestDecrease.dimension.replace('_', ' ');
    return `Under pressure, your ${dimName} decreases noticeably. You become more ${getStressDirection(biggestDecrease.dimension, 'decrease')} when stressed.`;
  }
}

function getStressDirection(dimension, direction) {
  const directions = {
    assertiveness: { increase: 'directive and vocal', decrease: 'passive and hesitant' },
    sociability: { increase: 'collaborative and outgoing', decrease: 'withdrawn and independent' },
    patience: { increase: 'calm and measured', decrease: 'urgent and impatient' },
    flexibility: { increase: 'adaptable and open', decrease: 'rigid and resistant to change' },
    conscientiousness: { increase: 'detail-focused and careful', decrease: 'spontaneous and less structured' },
    emotional_intelligence: { increase: 'empathetic and aware', decrease: 'task-focused and less attuned' }
  };
  
  return directions[dimension]?.[direction] || 'changed';
}

function addDimensionScorecard(pdf, scores) {
  let y = MARGIN;
  
  pdf.setTextColor(37, 99, 235);
  pdf.setFontSize(24);
  pdf.text("Dimension Scorecard", MARGIN, y);
  y += 15;
  
  pdf.setDrawColor(37, 99, 235);
  pdf.setLineWidth(0.5);
  pdf.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 15;
  
  const dimensions = [
    { key: 'assertiveness', name: 'Assertiveness' },
    { key: 'sociability', name: 'Sociability' },
    { key: 'patience', name: 'Patience' },
    { key: 'flexibility', name: 'Flexibility' },
    { key: 'conscientiousness', name: 'Conscientiousness' },
    { key: 'emotional_intelligence', name: 'Emotional Intelligence' }
  ];
  
  dimensions.forEach(dim => {
    const usualScore = scores[`${dim.key}_usual`];
    const stressScore = scores[`${dim.key}_stress`];
    const delta = stressScore - usualScore;
    
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text(dim.name, MARGIN, y);
    
    pdf.setFontSize(10);
    pdf.setTextColor(59, 130, 246);
    pdf.text(`Usual: ${usualScore}`, MARGIN + 80, y);
    
    pdf.setTextColor(249, 115, 22);
    pdf.text(`Stress: ${stressScore}`, MARGIN + 110, y);
    
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Δ ${delta > 0 ? '+' : ''}${delta}`, MARGIN + 140, y);
    
    y += 7;
    
    const barY = y - 3;
    const barHeight = 8;
    const barMaxWidth = CONTENT_WIDTH - 10;
    
    pdf.setFillColor(220, 220, 220);
    pdf.rect(MARGIN, barY, barMaxWidth, barHeight, 'F');
    
    pdf.setFillColor(59, 130, 246);
    pdf.setGState(new pdf.GState({ opacity: 0.7 }));
    pdf.rect(MARGIN, barY, (usualScore / 100) * barMaxWidth, barHeight, 'F');
    
    pdf.setFillColor(249, 115, 22);
    pdf.setGState(new pdf.GState({ opacity: 0.5 }));
    pdf.rect(MARGIN, barY, (stressScore / 100) * barMaxWidth, barHeight, 'F');
    
    pdf.setGState(new pdf.GState({ opacity: 1 }));
    
    y += 12;
  });
  
  y += 10;
  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  pdf.text("Blue: Usual Behavior  |  Orange: Stress Behavior  |  Δ: Change under stress", PAGE_WIDTH / 2, y, { align: 'center' });
  
  return y;
}

function addDetailedDimensionProfiles(pdf, scores, stressDeltas) {
  const dimensions = [
    { key: 'assertiveness', name: 'Assertiveness' },
    { key: 'sociability', name: 'Sociability' },
    { key: 'patience', name: 'Patience' },
    { key: 'flexibility', name: 'Flexibility' },
    { key: 'conscientiousness', name: 'Conscientiousness' },
    { key: 'emotional_intelligence', name: 'Emotional Intelligence' }
  ];
  
  const sortedDimensions = dimensions
    .map(dim => ({ ...dim, score: scores[`${dim.key}_usual`] }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
  
  sortedDimensions.forEach((dim, index) => {
    pdf.addPage();
    addDimensionProfile(pdf, dim, scores, stressDeltas, dimensionDescriptionsData[dim.key]);
  });
}

function addDimensionProfile(pdf, dimension, scores, stressDeltas, description) {
  let y = MARGIN;
  
  const usualScore = scores[`${dimension.key}_usual`];
  const stressScore = scores[`${dimension.key}_stress`];
  const level = getScoreLevel(usualScore);
  const scoreData = description[`${level}Score`];
  
  pdf.setTextColor(37, 99, 235);
  pdf.setFontSize(20);
  pdf.text(dimension.name, MARGIN, y);
  y += 10;
  
  pdf.setFontSize(12);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Usual: ${usualScore}th percentile  |  Stress: ${stressScore}th percentile`, MARGIN, y);
  y += 8;
  
  pdf.setDrawColor(37, 99, 235);
  pdf.setLineWidth(0.5);
  pdf.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 10;
  
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  const descLines = pdf.splitTextToSize(description.description, CONTENT_WIDTH);
  pdf.text(descLines, MARGIN, y);
  y += descLines.length * 5 + 8;
  
  pdf.setFontSize(12);
  pdf.setTextColor(37, 99, 235);
  pdf.text("What This Means for You:", MARGIN, y);
  y += 7;
  
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  const narrativeLines = pdf.splitTextToSize(scoreData.narrative, CONTENT_WIDTH);
  pdf.text(narrativeLines, MARGIN, y);
  y += narrativeLines.length * 5 + 8;
  
  if (y > 200) {
    pdf.addPage();
    y = MARGIN;
  }
  
  pdf.setFontSize(12);
  pdf.setTextColor(37, 99, 235);
  pdf.text("Your Stress Behavior:", MARGIN, y);
  y += 7;
  
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  const stressLines = pdf.splitTextToSize(scoreData.stressBehavior, CONTENT_WIDTH);
  pdf.text(stressLines, MARGIN, y);
  y += stressLines.length * 5 + 8;
  
  if (y > 200) {
    pdf.addPage();
    y = MARGIN;
  }
  
  pdf.setFontSize(12);
  pdf.setTextColor(37, 99, 235);
  pdf.text("Real Workplace Scenarios:", MARGIN, y);
  y += 7;
  
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  scoreData.scenarios.forEach((scenario, idx) => {
    if (y > 240) {
      pdf.addPage();
      y = MARGIN;
    }
    const scenarioLines = pdf.splitTextToSize(scenario, CONTENT_WIDTH - 5);
    pdf.text(scenarioLines, MARGIN + 3, y);
    y += scenarioLines.length * 5 + 5;
  });
  
  if (y > 200) {
    pdf.addPage();
    y = MARGIN;
  }
  
  pdf.setFontSize(12);
  pdf.setTextColor(37, 99, 235);
  pdf.text("Development Tips:", MARGIN, y);
  y += 7;
  
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  scoreData.developmentTips.forEach((tip, idx) => {
    if (y > 260) {
      pdf.addPage();
      y = MARGIN;
    }
    const tipLines = pdf.splitTextToSize(`${idx + 1}. ${tip}`, CONTENT_WIDTH - 5);
    pdf.text(tipLines, MARGIN + 3, y);
    y += tipLines.length * 5 + 3;
  });
}

function addArchetypePortrait(pdf, archetype) {
  pdf.addPage();
  let y = MARGIN;
  
  pdf.setTextColor(37, 99, 235);
  pdf.setFontSize(24);
  pdf.text(`Your Archetype: ${archetype.name}`, MARGIN, y);
  y += 10;
  
  pdf.setFontSize(40);
  pdf.text(archetype.icon, PAGE_WIDTH - MARGIN - 20, MARGIN + 5);
  
  y += 5;
  pdf.setDrawColor(37, 99, 235);
  pdf.setLineWidth(0.5);
  pdf.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 10;
  
  pdf.setFontSize(11);
  pdf.setTextColor(0, 0, 0);
  const narrativeLines = pdf.splitTextToSize(archetype.narrative, CONTENT_WIDTH);
  pdf.text(narrativeLines, MARGIN, y);
  y += narrativeLines.length * 6 + 10;
  
  pdf.setFontSize(14);
  pdf.setTextColor(37, 99, 235);
  pdf.text("Core Strengths:", MARGIN, y);
  y += 8;
  
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  archetype.strengths.forEach(strength => {
    if (y > 250) {
      pdf.addPage();
      y = MARGIN;
    }
    const strengthLines = pdf.splitTextToSize(`• ${strength}`, CONTENT_WIDTH - 5);
    pdf.text(strengthLines, MARGIN + 3, y);
    y += strengthLines.length * 5 + 3;
  });
  
  y += 5;
  
  if (y > 200) {
    pdf.addPage();
    y = MARGIN;
  }
  
  pdf.setFontSize(14);
  pdf.setTextColor(37, 99, 235);
  pdf.text("Potential Blind Spots:", MARGIN, y);
  y += 8;
  
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  archetype.blindSpots.forEach(blindSpot => {
    if (y > 260) {
      pdf.addPage();
      y = MARGIN;
    }
    const blindSpotLines = pdf.splitTextToSize(`• ${blindSpot}`, CONTENT_WIDTH - 5);
    pdf.text(blindSpotLines, MARGIN + 3, y);
    y += blindSpotLines.length * 5 + 3;
  });
  
  pdf.addPage();
  y = MARGIN;
  
  pdf.setFontSize(14);
  pdf.setTextColor(37, 99, 235);
  pdf.text("Typical Career Paths:", MARGIN, y);
  y += 8;
  
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  archetype.careerPaths.forEach(path => {
    const pathLines = pdf.splitTextToSize(`• ${path}`, CONTENT_WIDTH - 5);
    pdf.text(pathLines, MARGIN + 3, y);
    y += pathLines.length * 5 + 3;
  });
  
  y += 8;
  pdf.setFontSize(14);
  pdf.setTextColor(37, 99, 235);
  pdf.text("Your Team Role:", MARGIN, y);
  y += 8;
  
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  const teamRoleLines = pdf.splitTextToSize(archetype.teamRole, CONTENT_WIDTH);
  pdf.text(teamRoleLines, MARGIN, y);
  y += teamRoleLines.length * 5 + 8;
  
  pdf.setFontSize(14);
  pdf.setTextColor(37, 99, 235);
  pdf.text("Your Leadership Style:", MARGIN, y);
  y += 8;
  
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  const leadershipLines = pdf.splitTextToSize(archetype.leadershipStyle, CONTENT_WIDTH);
  pdf.text(leadershipLines, MARGIN, y);
}

function addTeamDynamicsMatrix(pdf, userArchetype) {
  pdf.addPage();
  let y = MARGIN;
  
  pdf.setTextColor(37, 99, 235);
  pdf.setFontSize(24);
  pdf.text("Team Dynamics Matrix", MARGIN, y);
  y += 10;
  
  pdf.setFontSize(11);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`How ${userArchetype.name}s work with other archetypes`, MARGIN, y);
  y += 8;
  
  pdf.setDrawColor(37, 99, 235);
  pdf.setLineWidth(0.5);
  pdf.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 10;
  
  const otherArchetypes = archetypesData.filter(a => a.id !== userArchetype.id);
  
  otherArchetypes.forEach(archetype => {
    if (y > 240) {
      pdf.addPage();
      y = MARGIN;
    }
    
    const compatibility = calculateCompatibility(userArchetype, archetype);
    
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`${archetype.icon} ${archetype.name}`, MARGIN, y);
    
    pdf.setFontSize(9);
    const compatColor = compatibility === 'High' ? [16, 185, 129] : compatibility === 'Medium' ? [245, 158, 11] : [239, 68, 68];
    pdf.setTextColor(...compatColor);
    pdf.text(`${compatibility} Synergy`, MARGIN + 100, y);
    y += 7;
    
    pdf.setFontSize(9);
    pdf.setTextColor(80, 80, 80);
    const dynamics = getTeamDynamics(userArchetype, archetype);
    const dynamicsLines = pdf.splitTextToSize(dynamics, CONTENT_WIDTH);
    pdf.text(dynamicsLines, MARGIN + 3, y);
    y += dynamicsLines.length * 4 + 5;
  });
}

function calculateCompatibility(archetype1, archetype2) {
  const synergies = {
    'strategist-connector': 'High',
    'strategist-analyst': 'High',
    'strategist-stabilizer': 'High',
    'connector-advocate': 'High',
    'connector-catalyst': 'High',
    'stabilizer-analyst': 'High',
    'innovator-catalyst': 'High',
    'leader-strategist': 'High',
    'leader-connector': 'High',
    'advocate-leader': 'High'
  };
  
  const key1 = `${archetype1.id}-${archetype2.id}`;
  const key2 = `${archetype2.id}-${archetype1.id}`;
  
  if (synergies[key1] || synergies[key2]) return 'High';
  
  if (archetype1.primaryDimensions.some(d => archetype2.primaryDimensions.includes(d))) {
    return 'Medium';
  }
  
  return 'Medium';
}

function getTeamDynamics(userArchetype, otherArchetype) {
  const dynamics = {
    'strategist-connector': 'You provide structure and direction; they build relationships and engagement. Together, you create well-planned initiatives with strong team buy-in.',
    'strategist-stabilizer': 'Both value thoroughness and planning. You bring more assertiveness; they bring calm patience. Strong alignment on quality standards.',
    'strategist-innovator': 'You prefer planned execution; they want rapid experimentation. Complementary if you balance your structure with their adaptability.',
    'strategist-advocate': 'You focus on systems and outcomes; they focus on people and culture. Balance task and relationship needs.',
    'strategist-leader': 'Both bring strong direction and accountability. Align on roles to avoid competing for control.',
    'strategist-analyst': 'Both value detail and preparation. Natural alignment on thorough analysis before action.',
    'strategist-catalyst': 'You provide structure; they bring energy and connections. Ensure your plans leave room for their spontaneity.',
    'connector-advocate': 'Both excel at building relationships and understanding people. Natural partnership in creating inclusive, engaged teams.',
    'connector-innovator': 'You bring people together; they bring change and new ideas. Combined, you help teams embrace evolution.',
    'connector-stabilizer': 'You bring social energy; they bring steady calm. Balance your outreach with their need for consistency.',
    'connector-leader': 'You build relationships; they provide direction. Strong combination of influence through connection and authority.',
    'connector-analyst': 'You focus on relationships; they focus on analysis. Complementary when you need both people skills and technical depth.',
    'connector-catalyst': 'Both bring social energy and collaboration. High-energy partnership that builds networks and momentum.',
    'stabilizer-innovator': 'You prefer consistency; they want change. Productive tension if you help ground their ideas while staying open to evolution.',
    'stabilizer-advocate': 'You bring calm reliability; they bring emotional intelligence. Together, you create stable, supportive environments.',
    'stabilizer-leader': 'You provide steady foundation; they provide direction. Complementary when they set vision and you ensure quality execution.',
    'stabilizer-analyst': 'Both value thoroughness and careful thinking. Natural alignment on quality standards and methodical approaches.',
    'stabilizer-catalyst': 'You bring stability; they bring energy and change. Balance is key—your calm grounds their dynamism.',
    'innovator-advocate': 'You drive change; they ensure people are supported through it. Complementary in transformation efforts.',
    'innovator-leader': 'Both bring confidence and direction. You focus on new approaches; they focus on mobilizing people. Powerful when aligned.',
    'innovator-analyst': 'You want rapid experimentation; they want thorough analysis. Tension can be productive if you respect different paces.',
    'innovator-catalyst': 'Both love change and new approaches. High-energy partnership that drives innovation but needs grounding from others.',
    'advocate-leader': 'Both bring emotional intelligence. You focus on support; they focus on direction. Strong combination for people-centered leadership.',
    'advocate-analyst': 'You focus on people and emotions; they focus on data and analysis. Complementary perspectives that balance decisions.',
    'advocate-catalyst': 'Both bring social energy and care about people. Together, you create inclusive, dynamic team environments.',
    'leader-analyst': 'You provide direction; they provide depth. Complementary when combining decisive leadership with thorough analysis.',
    'leader-catalyst': 'Both bring energy and influence. You provide direction; they provide connections. High-impact when aligned on goals.',
    'analyst-catalyst': 'You bring depth and thoroughness; they bring energy and connections. Different paces require mutual adjustment.'
  };
  
  const key1 = `${userArchetype.id}-${otherArchetype.id}`;
  const key2 = `${otherArchetype.id}-${userArchetype.id}`;
  
  return dynamics[key1] || dynamics[key2] || 'You bring different strengths to the team. Success requires understanding and valuing each other\'s approaches.';
}

function addCareerGuidance(pdf, archetype, scores) {
  let y = MARGIN;
  
  pdf.setTextColor(37, 99, 235);
  pdf.setFontSize(24);
  pdf.text("Career Guidance", MARGIN, y);
  y += 15;
  
  pdf.setDrawColor(37, 99, 235);
  pdf.setLineWidth(0.5);
  pdf.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 10;
  
  pdf.setFontSize(14);
  pdf.setTextColor(37, 99, 235);
  pdf.text("Roles That Play to Your Strengths:", MARGIN, y);
  y += 8;
  
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  archetype.careerPaths.forEach(path => {
    const pathLines = pdf.splitTextToSize(`• ${path}`, CONTENT_WIDTH - 5);
    pdf.text(pathLines, MARGIN + 3, y);
    y += pathLines.length * 5 + 3;
  });
  
  y += 8;
  pdf.setFontSize(14);
  pdf.setTextColor(37, 99, 235);
  pdf.text("Where You Thrive:", MARGIN, y);
  y += 8;
  
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  const thriveEnvironment = getThrivingEnvironment(archetype, scores);
  const thriveLines = pdf.splitTextToSize(thriveEnvironment, CONTENT_WIDTH);
  pdf.text(thriveLines, MARGIN, y);
  y += thriveLines.length * 5 + 8;
  
  pdf.setFontSize(14);
  pdf.setTextColor(37, 99, 235);
  pdf.text("Growth Opportunities:", MARGIN, y);
  y += 8;
  
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  const growthOps = getGrowthOpportunities(archetype);
  growthOps.forEach(opp => {
    const oppLines = pdf.splitTextToSize(`• ${opp}`, CONTENT_WIDTH - 5);
    pdf.text(oppLines, MARGIN + 3, y);
    y += oppLines.length * 5 + 3;
  });
  
  y += 8;
  pdf.setFontSize(14);
  pdf.setTextColor(37, 99, 235);
  pdf.text("Potential Career Pitfalls:", MARGIN, y);
  y += 8;
  
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  const pitfalls = getCareerPitfalls(archetype);
  pitfalls.forEach(pitfall => {
    const pitfallLines = pdf.splitTextToSize(`• ${pitfall}`, CONTENT_WIDTH - 5);
    pdf.text(pitfallLines, MARGIN + 3, y);
    y += pitfallLines.length * 5 + 3;
  });
}

function getThrivingEnvironment(archetype, scores) {
  const environments = {
    strategist: 'You thrive in organizations that value planning, accountability, and clear execution. Look for roles where you can set direction, create systems, and see plans through to completion. You do well with ambitious goals that require both vision and detailed implementation.',
    connector: 'You excel in people-focused roles and collaborative environments. Seek organizations with strong team cultures where relationship-building is valued. You thrive when working across teams, building partnerships, and in roles that require understanding diverse perspectives.',
    stabilizer: 'You do best in environments that value quality, consistency, and thoughtful decision-making. Look for roles where thoroughness is rewarded over speed, and where your calm presence during uncertainty is appreciated. Stable organizations with clear processes suit you well.',
    innovator: 'You thrive in dynamic, fast-paced environments that embrace change and experimentation. Seek roles where you can challenge the status quo, pilot new approaches, and where your adaptability is a competitive advantage. Startup environments or innovation-focused roles suit you.',
    advocate: 'You excel in environments that prioritize people development, inclusion, and culture. Look for organizations that value emotional intelligence and invest in creating positive work environments. Roles involving coaching, culture-building, or change management leverage your strengths.',
    leader: 'You thrive when given authority to make decisions and responsibility for outcomes. Seek roles with clear ownership where you can set direction, make tough calls, and build strong teams. You do well in environments that value both results and people.',
    analyst: 'You excel in roles requiring deep expertise, careful analysis, and attention to detail. Look for environments where quality and accuracy matter more than speed, and where your thorough approach is valued. Technical roles or specialist positions suit you well.',
    catalyst: 'You thrive in dynamic, collaborative environments with lots of variety. Seek roles that involve connecting people and ideas, facilitating change, and building momentum. You do well in roles with diverse interactions and opportunities to energize others.'
  };
  
  return environments[archetype.id] || 'You thrive in environments that align with your natural strengths and values.';
}

function getGrowthOpportunities(archetype) {
  const opportunities = {
    strategist: [
      'Develop flexibility in execution to adapt when plans need to change',
      'Build stronger facilitation skills to gather input without losing control',
      'Practice delegation to scale your impact beyond what you can personally plan'
    ],
    connector: [
      'Strengthen your ability to have difficult conversations and deliver critical feedback',
      'Develop comfort with making unpopular decisions when necessary',
      'Build skills in project management to complement your relationship strengths'
    ],
    stabilizer: [
      'Practice making faster decisions when the situation calls for it',
      'Develop comfort with ambiguity and change to expand your versatility',
      'Build influence skills to ensure your steady perspective is heard'
    ],
    innovator: [
      'Develop follow-through skills to complement your strong initiation',
      'Practice patience with necessary processes and governance',
      'Build structure into your approach to help others keep pace with your changes'
    ],
    advocate: [
      'Strengthen your ability to balance empathy with accountability',
      'Develop skills in strategic thinking to complement your people focus',
      'Practice setting boundaries to prevent burnout from emotional labor'
    ],
    leader: [
      'Continue developing your strategic thinking to complement your strong execution',
      'Build deeper coaching skills to develop leaders rather than just directing them',
      'Practice patience with different working styles and paces'
    ],
    analyst: [
      'Develop comfort with making recommendations before you have all information',
      'Build broader strategic thinking to complement your strong analytical skills',
      'Practice communicating insights to non-technical audiences'
    ],
    catalyst: [
      'Develop project management skills to strengthen your follow-through',
      'Build deeper expertise in specific areas to complement your broad connections',
      'Practice creating stability when teams need it, not just driving change'
    ]
  };
  
  return opportunities[archetype.id] || ['Continue developing your natural strengths while building complementary skills'];
}

function getCareerPitfalls(archetype) {
  const pitfalls = {
    strategist: [
      'Taking on too much direct control rather than empowering others to execute',
      'Becoming rigid when plans need to adapt to changing circumstances',
      'Moving into roles requiring high flexibility without adequate support'
    ],
    connector: [
      'Avoiding necessary conflict or tough decisions to preserve harmony',
      'Taking on too much emotional labor without adequate boundaries',
      'Moving into purely transactional roles that underutilize your relationship strengths'
    ],
    stabilizer: [
      'Staying too long in roles that have become routine and unchallenging',
      'Resisting necessary changes due to preference for stability',
      'Missing opportunities due to excessive caution or risk aversion'
    ],
    innovator: [
      'Starting more initiatives than you can sustain',
      'Leaving roles before seeing projects through to completion',
      'Frustrating stakeholders with too frequent changes in direction'
    ],
    advocate: [
      'Burning out from taking on everyone\'s emotional burdens',
      'Being passed over for advancement due to perception as "too soft"',
      'Avoiding roles with necessary accountability for results'
    ],
    leader: [
      'Taking on too much personal responsibility for team outcomes',
      'Burning out from maintaining high intensity without adequate support',
      'Alienating team members who need more gradual change or support'
    ],
    analyst: [
      'Analysis paralysis preventing timely decision-making',
      'Being perceived as too cautious or slow in fast-paced environments',
      'Missing leadership opportunities due to reluctance to act without full information'
    ],
    catalyst: [
      'Spreading yourself too thin across too many connections and initiatives',
      'Being seen as lacking depth due to breadth of focus',
      'Burning out from maintaining high energy without adequate recovery'
    ]
  };
  
  return pitfalls[archetype.id] || ['Be aware of overusing your strengths to the point they become weaknesses'];
}

function addStressInsights(pdf, archetype, scores, stressDeltas) {
  let y = MARGIN;
  
  pdf.setTextColor(37, 99, 235);
  pdf.setFontSize(24);
  pdf.text("Stress & Resilience Insights", MARGIN, y);
  y += 15;
  
  pdf.setDrawColor(37, 99, 235);
  pdf.setLineWidth(0.5);
  pdf.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 10;
  
  pdf.setFontSize(14);
  pdf.setTextColor(37, 99, 235);
  pdf.text("How Your Stress Profile Differs:", MARGIN, y);
  y += 8;
  
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  const stressProfile = getStressProfileDescription(scores, stressDeltas);
  const stressProfileLines = pdf.splitTextToSize(stressProfile, CONTENT_WIDTH);
  pdf.text(stressProfileLines, MARGIN, y);
  y += stressProfileLines.length * 5 + 8;
  
  pdf.setFontSize(14);
  pdf.setTextColor(37, 99, 235);
  pdf.text("What Triggers Stress in Your Type:", MARGIN, y);
  y += 8;
  
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  archetype.stressTriggers.forEach(trigger => {
    const triggerLines = pdf.splitTextToSize(`• ${trigger}`, CONTENT_WIDTH - 5);
    pdf.text(triggerLines, MARGIN + 3, y);
    y += triggerLines.length * 5 + 3;
  });
  
  y += 8;
  pdf.setFontSize(14);
  pdf.setTextColor(37, 99, 235);
  pdf.text("Coping Strategies for Your Profile:", MARGIN, y);
  y += 8;
  
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  archetype.copingStrategies.forEach((strategy, idx) => {
    if (y > 260) {
      pdf.addPage();
      y = MARGIN;
    }
    const strategyLines = pdf.splitTextToSize(`${idx + 1}. ${strategy}`, CONTENT_WIDTH - 5);
    pdf.text(strategyLines, MARGIN + 3, y);
    y += strategyLines.length * 5 + 3;
  });
  
  y += 8;
  pdf.setFontSize(14);
  pdf.setTextColor(37, 99, 235);
  pdf.text("Team Support Needs When Under Pressure:", MARGIN, y);
  y += 8;
  
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  const supportNeeds = getTeamSupportNeeds(archetype);
  const supportLines = pdf.splitTextToSize(supportNeeds, CONTENT_WIDTH);
  pdf.text(supportLines, MARGIN, y);
  y += supportLines.length * 5 + 8;
  
  pdf.setFontSize(14);
  pdf.setTextColor(37, 99, 235);
  pdf.text("Recovery Recommendations:", MARGIN, y);
  y += 8;
  
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  const recoveryRecs = getRecoveryRecommendations(archetype);
  const recoveryLines = pdf.splitTextToSize(recoveryRecs, CONTENT_WIDTH);
  pdf.text(recoveryLines, MARGIN, y);
}

function getStressProfileDescription(scores, stressDeltas) {
  const dimensions = ['assertiveness', 'sociability', 'patience', 'flexibility', 'conscientiousness', 'emotional_intelligence'];
  
  const significantChanges = dimensions
    .map(dim => ({
      dimension: dim,
      delta: stressDeltas[dim],
      usual: scores[`${dim}_usual`],
      stress: scores[`${dim}_stress`]
    }))
    .filter(item => Math.abs(item.delta) > 10)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  
  if (significantChanges.length === 0) {
    return 'Your behavior remains relatively consistent under stress, which provides valuable stability to teams during challenging times. This consistency means colleagues can rely on you to show up similarly regardless of pressure levels.';
  }
  
  let description = 'Under stress, you experience noticeable behavioral shifts: ';
  
  significantChanges.slice(0, 2).forEach((change, idx) => {
    const dimName = change.dimension.replace('_', ' ');
    const direction = change.delta > 0 ? 'increases' : 'decreases';
    const magnitude = Math.abs(change.delta);
    
    if (idx > 0) description += ' Additionally, your ';
    description += `your ${dimName} ${direction} significantly (by ${magnitude} points). `;
  });
  
  description += 'Being aware of these shifts can help you manage your stress responses more effectively.';
  
  return description;
}

function getTeamSupportNeeds(archetype) {
  const needs = {
    strategist: 'When under pressure, you need your team to maintain quality standards and follow established processes. You appreciate when others anticipate problems and bring solutions rather than just issues. Give you space to think through challenges systematically rather than demanding immediate responses.',
    connector: 'Under stress, you need emotional support and connection, not isolation. Check in with you regularly and acknowledge that relationship concerns are legitimate, not distractions. Help protect you from taking on too much emotional labor from others.',
    stabilizer: 'When pressure increases, you need time to adapt to changes and process information before responding. Don\'t mistake your calm for lack of concern. Provide clear information and reduce unnecessary urgency so you can maintain your thoughtful approach.',
    innovator: 'Under stress, you need freedom to try different approaches without excessive process. Give you autonomy to pivot as needed while helping ensure follow-through. Challenge you when your changes become too frequent, but do so constructively.',
    advocate: 'When under pressure, you need to know that people issues are being addressed, not ignored. Support you in setting boundaries so you don\'t take on everyone\'s problems. Recognize that your empathy is valuable, not a weakness.',
    leader: 'Under stress, you need your team to take ownership and bring solutions, not just escalate problems. Be direct with you—you can handle hard truths and prefer them to sugar-coating. Help ensure you\'re not carrying too much personal responsibility.',
    analyst: 'When pressure increases, you need access to quality information and enough time to be thorough where it matters. Help you distinguish between analyses that require depth versus those where quick assessment is sufficient. Don\'t dismiss your concerns about data quality.',
    catalyst: 'Under stress, you need opportunities for collaboration and variety, not isolation in routine tasks. Help you prioritize so you don\'t spread yourself too thin. Ground your energy with structure, but don\'t constrain it entirely.'
  };
  
  return needs[archetype.id] || 'Understand your natural patterns and provide support that aligns with your needs under pressure.';
}

function getRecoveryRecommendations(archetype) {
  const recommendations = {
    strategist: 'Recover by taking time to plan and organize without pressure. Engage in activities where you can see clear progress and completion. Exercise or hobbies that involve skill development and measurable improvement help you reset.',
    connector: 'Recover by connecting with people you care about in low-stakes, enjoyable contexts. Quality time with friends, family, or community activities helps restore your energy. Balance social recovery with enough downtime to avoid burnout.',
    stabilizer: 'Recover by engaging in predictable, calming activities that don\'t require rapid adaptation. Routines, hobbies that allow deep focus, and time in peaceful environments help you restore equilibrium. Avoid overstimulating or chaotic activities during recovery.',
    innovator: 'Recover by pursuing new experiences, learning new skills, or exploring unfamiliar territory. Change of scenery and variety help you recharge. Physical activities that require adaptation, like hiking or adventure sports, can be particularly restorative.',
    advocate: 'Recover by setting clear boundaries and engaging in activities that replenish your emotional energy. Spending time with people who care for you rather than always being the caregiver is essential. Self-care practices and activities that don\'t require empathy help you restore.',
    leader: 'Recover by temporarily stepping back from decision-making and allowing others to lead. Engage in physical activities that release intensity. Spend time with peers who understand leadership challenges, or in contexts where you can just be yourself without responsibility.',
    analyst: 'Recover by engaging in activities that allow deep focus without pressure for quick outputs. Reading, learning, or hobbies that involve careful attention help you recharge. Time alone or with small groups to process and reflect is restorative.',
    catalyst: 'Recover by maintaining some social connection and variety while reducing intensity. Lower-stakes social activities, exploring new places or experiences, and time with people who energize you help restore your batteries. Avoid complete isolation.'
  };
  
  return recommendations[archetype.id] || 'Find recovery activities that align with your natural preferences and help you restore your energy.';
}

function addSummaryDashboard(pdf, userName, archetype, scores, adaptabilityScore) {
  let y = MARGIN;
  
  pdf.setTextColor(37, 99, 235);
  pdf.setFontSize(24);
  pdf.text("Your Profile Summary", MARGIN, y);
  y += 15;
  
  pdf.setDrawColor(37, 99, 235);
  pdf.setLineWidth(0.5);
  pdf.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 15;
  
  const centerX = PAGE_WIDTH / 2;
  
  pdf.setFontSize(48);
  pdf.text(archetype.icon, centerX, y, { align: 'center' });
  y += 15;
  
  pdf.setFontSize(20);
  pdf.setTextColor(0, 0, 0);
  pdf.text(archetype.name, centerX, y, { align: 'center' });
  y += 20;
  
  const dimensions = [
    { key: 'assertiveness', name: 'Assertiveness' },
    { key: 'sociability', name: 'Sociability' },
    { key: 'patience', name: 'Patience' },
    { key: 'flexibility', name: 'Flexibility' },
    { key: 'conscientiousness', name: 'Conscientiousness' },
    { key: 'emotional_intelligence', name: 'Emotional Intelligence' }
  ];
  
  pdf.setFillColor(240, 240, 240);
  pdf.rect(MARGIN, y, CONTENT_WIDTH, 60, 'F');
  
  pdf.setFontSize(12);
  pdf.setTextColor(37, 99, 235);
  pdf.text("Dimension Scores (Usual | Stress)", centerX, y + 8, { align: 'center' });
  
  let scoreY = y + 18;
  const col1X = MARGIN + 10;
  const col2X = MARGIN + (CONTENT_WIDTH / 2) + 5;
  
  pdf.setFontSize(9);
  pdf.setTextColor(0, 0, 0);
  
  dimensions.forEach((dim, idx) => {
    const x = idx < 3 ? col1X : col2X;
    const localY = scoreY + (idx % 3) * 10;
    const usualScore = scores[`${dim.key}_usual`];
    const stressScore = scores[`${dim.key}_stress`];
    
    pdf.text(`${dim.name}:`, x, localY);
    pdf.text(`${usualScore} | ${stressScore}`, x + 50, localY);
  });
  
  y += 70;
  
  pdf.setFillColor(240, 248, 255);
  pdf.rect(MARGIN, y, (CONTENT_WIDTH / 2) - 5, 35, 'F');
  
  pdf.setFontSize(11);
  pdf.setTextColor(37, 99, 235);
  pdf.text("Top Strengths", MARGIN + 5, y + 8);
  
  pdf.setFontSize(9);
  pdf.setTextColor(0, 0, 0);
  const topDimensions = dimensions
    .map(dim => ({ ...dim, score: scores[`${dim.key}_usual`] }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  
  topDimensions.forEach((dim, idx) => {
    pdf.text(`${idx + 1}. ${dim.name} (${dim.score})`, MARGIN + 5, y + 16 + (idx * 6));
  });
  
  pdf.setFillColor(255, 248, 240);
  pdf.rect(MARGIN + (CONTENT_WIDTH / 2) + 5, y, (CONTENT_WIDTH / 2) - 5, 35, 'F');
  
  pdf.setFontSize(11);
  pdf.setTextColor(37, 99, 235);
  pdf.text("Adaptability Score", MARGIN + (CONTENT_WIDTH / 2) + 10, y + 8);
  
  pdf.setFontSize(24);
  pdf.setTextColor(59, 130, 246);
  pdf.text(`${adaptabilityScore}/100`, PAGE_WIDTH - MARGIN - 30, y + 25);
  
  y += 45;
  
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  const footerText = `This assessment provides insights into your professional personality across multiple dimensions. Use these insights to understand your strengths, recognize your growth areas, and work effectively with diverse team members.`;
  const footerLines = pdf.splitTextToSize(footerText, CONTENT_WIDTH);
  pdf.text(footerLines, MARGIN, y);
  
  y += footerLines.length * 5 + 10;
  
  pdf.setFontSize(9);
  pdf.setTextColor(150, 150, 150);
  pdf.text(`Generated for ${userName} on ${new Date().toLocaleDateString()}`, centerX, PAGE_HEIGHT - 15, { align: 'center' });
}
