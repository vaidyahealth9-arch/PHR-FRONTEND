import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const exportTrendsToPdf = async (elementId: string, patientName: string) => {
  const container = document.getElementById(elementId);
  if (!container) return;

  // Temporarily make the element visible for capture but keep it off-screen
  const originalStyle = container.style.cssText;
  const originalClasses = container.className;
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.zIndex = '-9999';
  container.style.visibility = 'visible';
  container.style.width = '1000px';
  container.style.backgroundColor = '#ffffff'; // Force white background

  // Force reflow and layout computation
  container.getBoundingClientRect();
  await new Promise(resolve => setTimeout(resolve, 300)); // Give a slightly longer delay for full reflow

  try {
    // Collect all stylesheets to ensure the clone gets them, especially in Vite dev mode
    const styleTags = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
                           .map(el => el.cloneNode(true) as HTMLElement);

    const canvas = await html2canvas(container, {
      scale: 2, // Better quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1000,
      windowHeight: container.scrollHeight,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc) => {
        // Manually inject missing styles from the main document to the cloned document
        styleTags.forEach(styleNode => {
          clonedDoc.head.appendChild(styleNode);
        });

        // Ensure tailwind injected styles are processed
        const clonedContainer = clonedDoc.getElementById(elementId);
        if (clonedContainer) {
          clonedContainer.style.display = 'block';
          clonedContainer.style.position = 'static';
          clonedContainer.style.left = '0';
          clonedContainer.style.top = '0';
          clonedContainer.style.visibility = 'visible';
          clonedContainer.style.zIndex = '1';
        }
      }
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Create a tall, continuous PDF page to avoid splitting cards
    const pdf = new jsPDF('p', 'mm', [imgWidth, imgHeight]);
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');

    const dateStr = new Date().toISOString().split('T')[0];
    pdf.save(`Trend_Report_${patientName.replace(/\s+/g, '_')}_${dateStr}.pdf`);
  } finally {
    // Restore original styles
    container.style.cssText = originalStyle;
    container.className = originalClasses;
  }
};
