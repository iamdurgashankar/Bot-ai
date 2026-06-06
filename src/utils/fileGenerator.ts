import { jsPDF } from 'jspdf';

/**
 * Transforms Markdown text into basic inline HTML for MS Word document rendering
 */
function markdownToSimpleHtml(markdown: string): string {
  let html = markdown || "";
  
  // Escape basic XML/HTML special characters
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Format headings
  html = html.replace(/^### (.*?)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.*?)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.*?)$/gm, "<h1>$1</h1>");

  // Format bold and italic text
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Format code blocks
  html = html.replace(/```([\s\S]*?)```/g, "<pre>$1</pre>");
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Format lists
  html = html.replace(/^\s*[\-\*]\s+(.*?)$/gm, "<li>$1</li>");

  // Wrap rows into paragraphs
  const lines = html.split("\n");
  const processedLines = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return "<br/>";
    if (trimmed.startsWith("<h") || trimmed.startsWith("<li") || trimmed.startsWith("<pre") || trimmed.startsWith("<code")) {
      return line;
    }
    return `<p>${line}</p>`;
  });
  
  return processedLines.join("\n");
}

/**
 * Generates an high-quality free image using Pollinations AI based on prompt with a random seed
 */
export function generateAIImageUrl(prompt: string): string {
  const cleanPrompt = encodeURIComponent(prompt.trim());
  const randomSeed = Math.floor(Math.random() * 1000000);
  return `https://image.pollinations.ai/p/${cleanPrompt}?width=768&height=768&nologo=true&seed=${randomSeed}`;
}

/**
 * Generates an elegant PDF as a Data URL with jsPDF
 */
export function generatePDF(title: string, text: string, themeColorHex: string = '#4F46E5'): string {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Calculate RGB from Hex representing theme color
  let r = 79, g = 70, b = 229;
  if (themeColorHex.startsWith('#')) {
    const hex = themeColorHex.substring(1);
    const parsed = parseInt(hex, 16);
    if (!isNaN(parsed) && hex.length === 6) {
      r = (parsed >> 16) & 255;
      g = (parsed >> 8) & 255;
      b = parsed & 255;
    }
  }

  // Draw vibrant top banner
  doc.setFillColor(r, g, b);
  doc.rect(0, 0, 210, 32, "F");

  // Highlight bar (accent line)
  doc.setFillColor(245, 158, 11); // Gold accent
  doc.rect(0, 32, 210, 2, "F");

  // Title in header
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(title.slice(0, 52), 15, 20);

  // Metadata block (Subtle background)
  doc.setFillColor(248, 250, 252);
  doc.rect(15, 42, 180, 14, "F");
  
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(`Doc Type: Expert Report System`, 18, 48);
  doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 18, 52);

  // Main Text formatting
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(10.5);
  
  // Custom splitting & page break flow
  const lines = doc.splitTextToSize(text, 175);
  let y = 68;
  const pageHeight = 275;

  for (let i = 0; i < lines.length; i++) {
    if (y > pageHeight) {
      doc.addPage();
      // Draw new page header background
      doc.setFillColor(r, g, b);
      doc.rect(0, 0, 210, 15, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(title.slice(0, 40) + " (cont.)", 15, 10);
      
      doc.setTextColor(51, 65, 85);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      y = 25; // Reset position on new page
    }
    doc.text(lines[i], 15, y);
    y += 6.5; // Spacing multiplier
  }

  // Return base64 PDF representation
  return doc.output('datauristring');
}

/**
 * Generates an elegant MS Word-compatible file as a base64-encoded Data URL
 */
export function generateWord(title: string, text: string): string {
  const formattedHtml = markdownToSimpleHtml(text);
  
  const content = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <title>${title}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; color: #333333; line-height: 1.6; }
    h1 { color: #4F46E5; font-size: 24pt; border-bottom: 2px solid #E5E7EB; padding-bottom: 8px; margin-bottom: 20px; font-weight: bold; }
    h2 { color: #1F2937; font-size: 16pt; margin-top: 18px; margin-bottom: 8px; font-weight: bold; }
    h3 { color: #4B5563; font-size: 13pt; margin-top: 14px; margin-bottom: 6px; font-weight: bold; }
    p { font-size: 11.5pt; margin-bottom: 12px; text-align: justify; }
    li { font-size: 11.5pt; margin-bottom: 5px; }
    pre { background: #F3F4F6; border: 1px solid #E5E7EB; padding: 10px; font-family: 'Courier New', monospace; font-size: 10pt; margin-bottom: 15px; }
    code { background: #F3F4F6; font-family: 'Courier New', monospace; font-size: 10.5pt; padding: 2px 4px; }
    .footer { margin-top: 50px; font-size: 9.5pt; color: #9CA3AF; text-align: center; border-top: 1px solid #E5E7EB; padding-top: 15px; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${formattedHtml}
  <div class="footer">Document generated automatically on ${new Date().toLocaleDateString()} by AI Intelligent Suite.</div>
</body>
</html>
  `;

  // Safe encoding conversion using base64
  const base64Data = btoa(unescape(encodeURIComponent(content)));
  return `data:application/msword;base64,${base64Data}`;
}
