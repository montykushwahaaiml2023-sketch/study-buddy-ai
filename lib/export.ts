export interface SummaryData {
  summary: string;
  keyTerms: Array<{ term: string; definition: string }>;
  formulas?: Array<{ name: string; formula: string; explanation: string }>;
  questions: Array<{
    question: string;
    options: string[];
    correct: string;
    explanation: string;
  }>;
}

export const exportToJSON = (data: SummaryData, filename: string = "study-summary.json") => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToTXT = (data: SummaryData, filename: string = "study-summary.txt") => {
  let content = `STUDY SUMMARY\n${"=".repeat(20)}\n\n`;
  
  // Summary
  content += `SUMMARY\n${"-".repeat(10)}\n${data.summary.replace(/\\n/g, "\n")}\n\n`;
  
  // Key Terms
  if (data.keyTerms.length > 0) {
    content += `KEY TERMS\n${"-".repeat(10)}\n`;
    data.keyTerms.forEach((item, i) => {
      content += `${i + 1}. ${item.term}: ${item.definition}\n`;
    });
    content += "\n";
  }
  
  // Formulas
  if (data.formulas && data.formulas.length > 0) {
    content += `FORMULAS\n${"-".repeat(10)}\n`;
    data.formulas.forEach((item, i) => {
      content += `${i + 1}. ${item.name}: ${item.formula}\n   Expl: ${item.explanation}\n`;
    });
    content += "\n";
  }
  
  // Questions (No answers for study purposes)
  if (data.questions.length > 0) {
    content += `PRACTICE QUESTIONS\n${"-".repeat(10)}\n`;
    data.questions.forEach((q, i) => {
      content += `Q${i + 1}: ${q.question}\n`;
      q.options.forEach((opt, j) => {
        content += `   ${String.fromCharCode(65 + j)}) ${opt}\n`;
      });
      content += "\n";
    });
  }

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToPDF = async (data: SummaryData, filename: string = "study-summary.pdf") => {
  // Use zero-dependency native browser print functionality
  const originalTitle = document.title;
  document.title = filename.replace('.pdf', '');
  window.print();
  setTimeout(() => { document.title = originalTitle; }, 500);
};
