// Native lightweight export utilities without bulky external packages

function formatCSVValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function recordsToCSV(data: Record<string, unknown>[]): string {
  if (!data || data.length === 0) return "";
  const headers = Object.keys(data[0]);
  const headerRow = headers.map(formatCSVValue).join(",");
  const rows = data.map((row) =>
    headers.map((h) => formatCSVValue(row[h])).join(","),
  );
  return [headerRow, ...rows].join("\r\n");
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToExcel(
  data: Record<string, unknown>[],
  filename: string,
) {
  const finalFilename = filename.endsWith(".csv")
    ? filename
    : `${filename.replace(/\.xlsx?$/, "")}.csv`;
  exportToCSV(data, finalFilename);
}

export function exportToCSV(data: Record<string, unknown>[], filename: string) {
  const csvContent = "\uFEFF" + recordsToCSV(data); // UTF-8 BOM for Excel UTF-8 compatibility
  downloadBlob(csvContent, filename, "text/csv;charset=utf-8;");
}

export async function exportToPDF(elementRef: HTMLDivElement | null) {
  if (typeof window === "undefined") return;
  if (elementRef) {
    window.print();
  }
}

export function getDateRange(period: string): {
  startDate: Date;
  endDate: Date;
} {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (period) {
    case "today":
      return { startDate: today, endDate: today };
    case "yesterday": {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return { startDate: yesterday, endDate: yesterday };
    }
    case "last7days": {
      const last7 = new Date(today);
      last7.setDate(last7.getDate() - 7);
      return { startDate: last7, endDate: today };
    }
    case "last30days": {
      const last30 = new Date(today);
      last30.setDate(last30.getDate() - 30);
      return { startDate: last30, endDate: today };
    }
    case "thisMonth": {
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { startDate: thisMonthStart, endDate: thisMonthEnd };
    }
    case "lastMonth": {
      const lastMonthStart = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1,
      );
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      return { startDate: lastMonthStart, endDate: lastMonthEnd };
    }
    case "thisYear": {
      const thisYearStart = new Date(now.getFullYear(), 0, 1);
      const thisYearEnd = new Date(now.getFullYear(), 11, 31);
      return { startDate: thisYearStart, endDate: thisYearEnd };
    }
    default:
      return { startDate: new Date(0), endDate: today };
  }
}
