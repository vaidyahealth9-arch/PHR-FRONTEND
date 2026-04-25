export const exportTrendsToPdf = async (_elementId: string, _patientName: string) => {
  // We now use high-fidelity @media print styles in index.css
  // This is instant and handles multi-page breaks natively in the browser.
  window.print();
};
