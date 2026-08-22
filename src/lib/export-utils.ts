// Export utilities for CSV, Excel, and PDF generation

export function exportToCSV(data: Record<string, any>[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers.map((h) => {
        const val = row[h];
        const str = val === null || val === undefined ? "" : String(val);
        return str.includes(",") || str.includes('"') || str.includes("\n")
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      }).join(",")
    ),
  ].join("\n");

  downloadFile(csvContent, `${filename}.csv`, "text/csv;charset=utf-8;");
}

export function exportToExcel(data: Record<string, any>[], filename: string) {
  // Creates a simple HTML table that Excel can open (xlsx format requires heavy libraries)
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const table = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
    <head><meta charset="UTF-8"></head>
    <body>
      <table border="1" style="border-collapse:collapse">
        <thead><tr>${headers.map((h) => `<th style="background:#2563EB;color:#fff;padding:8px;font-weight:bold">${h}</th>`).join("")}</tr></thead>
        <tbody>${data.map((row) =>
          `<tr>${headers.map((h) => `<td style="padding:6px">${row[h] ?? ""}</td>`).join("")}</tr>`
        ).join("")}</tbody>
      </table>
    </body></html>`;

  downloadFile(table, `${filename}.xls`, "application/vnd.ms-excel");
}

export function exportToPDF(title: string, data: Record<string, any>[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1a1a2e; }
        h1 { font-size: 24px; margin-bottom: 8px; color: #2563EB; }
        .meta { font-size: 12px; color: #666; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th { background: #2563EB; color: white; padding: 10px 12px; text-align: left; font-weight: 600; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px; }
        td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
        tr:nth-child(even) { background: #f9fafb; }
        tr:hover { background: #eff6ff; }
        @media print {
          body { padding: 20px; }
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p class="meta">Generated on ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })} • GadgetHub BD Admin</p>
      <table>
        <thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
        <tbody>${data.map((row) =>
          `<tr>${headers.map((h) => `<td>${row[h] ?? ""}</td>`).join("")}</tr>`
        ).join("")}</tbody>
      </table>
      <script>setTimeout(() => { window.print(); }, 500);</script>
    </body>
    </html>`;

  printWindow.document.write(html);
  printWindow.document.close();
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
