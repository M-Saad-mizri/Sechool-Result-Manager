import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Generate Landscape Class Sheet Report PDF
export const generatePdfReport = (mainHeading, students, subjects, teacherSignatureBase64, customDate) => {
  const count = students.length;
  let passes = 0;
  let fails = 0;
  students.forEach(s => {
    if (s.grade !== "F") passes++;
    else fails++;
  });

  const pdf = new jsPDF({ orientation: "landscape" });

  // Title
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text(mainHeading, 140, 16, { align: "center" });

  // Statistics Row
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Total Students: ${count}`, 14, 25);
  pdf.text(`Pass Students: ${passes}`, 60, 25);
  pdf.text(`Fail Students: ${fails}`, 100, 25);

  // Headers uppercase
  const headers = ["POS", "STUDENT NAME", "FATHER'S NAME", ...subjects.map(s => s.name.toUpperCase()), "OBT. MARKS", "PERCENTAGE", "GRADE"];

  // Table body lines
  const body = students.map((std, idx) => {
    const row = [
      idx + 1,
      std.name,
      std.fatherName
    ];
    
    subjects.forEach(sub => {
      row.push(std.marks[sub.name] || "0");
    });

    row.push(std.totalMarks);
    row.push(`${std.percentage.toFixed(2)}%`);
    row.push(std.grade);

    return row;
  });

  // Render table
  autoTable(pdf, {
    startY: 32,
    head: [headers],
    body: body,
    theme: "grid",
    styles: { fontSize: 9, halign: "center", cellPadding: 3 },
    headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      1: { halign: "left" },
      2: { halign: "left" }
    },
    margin: { left: 14, right: 14 }
  });

  const finalY = pdf.lastAutoTable.finalY || 35;
  
  // Footer signature
  pdf.setFontSize(10);
  pdf.text("Teacher's Signature: _______________________", 14, finalY + 18);
  
  // Draw signature image if present
  if (teacherSignatureBase64) {
    try {
      pdf.addImage(teacherSignatureBase64, 'PNG', 50, finalY + 6, 35, 12);
    } catch (err) {
      console.error("Failed to render teacher signature on report PDF:", err);
    }
  }

  // Date
  const displayDate = customDate || new Date().toLocaleDateString("en-US", {
    weekday: "short", year: "numeric", month: "short", day: "numeric"
  });
  pdf.text(`Dated: ${displayDate}`, 220, finalY + 18);

  pdf.save("Result_Report_Sheet.pdf");
};

// Generate Portrait Booklet Cards Booklet PDF (fully dynamic and configurable)
export const generateStudentResultCards = (
  schoolName,
  className,
  termExam,
  students,
  subjects,
  teacherSignatureBase64,
  principalSignatureBase64,
  gradeRules,
  templateStyle = 'classic_navy',
  customDate
) => {
  const doc = new jsPDF();
  let printedCount = 0;

  // Define 5 different premium visual themes
  const themes = {
    classic_navy: {
      primary: [79, 70, 229],      // Royal Indigo
      secondary: [249, 115, 22],   // Tangerine Orange
      textDark: [15, 23, 42],
      textMuted: [71, 85, 105],
      bgLight: [248, 250, 252],
      borderOuter: true,
      borderStyle: 'double'
    },
    modern_emerald: {
      primary: [16, 185, 129],     // Emerald Green
      secondary: [20, 184, 166],    // Teal Accent
      textDark: [15, 23, 42],
      textMuted: [71, 85, 105],
      bgLight: [240, 253, 250],
      borderOuter: true,
      borderStyle: 'single'
    },
    royal_crimson: {
      primary: [190, 24, 74],      // Deep Crimson Rose
      secondary: [217, 119, 6],    // Gold Amber
      textDark: [27, 2, 8],
      textMuted: [115, 12, 40],
      bgLight: [255, 241, 242],
      borderOuter: true,
      borderStyle: 'double'
    },
    minimalist_slate: {
      primary: [71, 85, 105],      // Charcoal Slate
      secondary: [148, 163, 184],  // Light Grey
      textDark: [15, 23, 42],
      textMuted: [100, 116, 139],
      bgLight: [248, 250, 252],
      borderOuter: false,
      borderStyle: 'none'
    },
    vintage_sepia: {
      primary: [101, 67, 33],      // Sepia Earth
      secondary: [196, 164, 132],  // Pastel Tan
      textDark: [51, 34, 17],
      textMuted: [139, 90, 43],
      bgLight: [253, 246, 227],    // Pale Warm Parchment
      borderOuter: true,
      borderStyle: 'vintage'
    }
  };

  const theme = themes[templateStyle] || themes.classic_navy;

  // Generate dynamic scale label for the footer based on user's grade configurations
  let scaleKey = '';
  if (gradeRules && gradeRules.length > 0) {
    const sortedRules = [...gradeRules].sort((a, b) => b.minPercent - a.minPercent);
    scaleKey = "Grading Scale Key: " + sortedRules.map((rule, idx) => {
      if (rule.grade === "F") return `${rule.grade} (Below ${sortedRules[idx - 1]?.minPercent || 50}%)`;
      const nextRule = sortedRules[idx + 1];
      const rangeMax = nextRule ? ` (${rule.minPercent}-${nextRule.minPercent - 1}%)` : ` (≥${rule.minPercent}%)`;
      return `${rule.grade}${rangeMax}`;
    }).join(", ");
  } else {
    scaleKey = "Grading Scale Key: A+ (>=90%), A (80-89%), B (70-79%), C (60-69%), D (50-59%), F (Below 50%)";
  }

  // Loop students
  students.forEach((student, index) => {
    if (index > 0) {
      doc.addPage();
    }
    printedCount++;

    // Draw borders based on chosen theme
    if (theme.borderOuter) {
      doc.setDrawColor(theme.primary[0], theme.primary[1], theme.primary[2]);
      doc.setLineWidth(theme.borderStyle === 'double' ? 0.75 : 1.0);
      doc.rect(10, 10, 190, 277);

      if (theme.borderStyle === 'double' || theme.borderStyle === 'vintage') {
        doc.setDrawColor(theme.secondary[0], theme.secondary[1], theme.secondary[2]);
        doc.setLineWidth(0.25);
        doc.rect(11.5, 11.5, 187, 274);
      }
    }

    // Header info
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(theme.primary[0], theme.primary[1], theme.primary[2]);
    doc.text(schoolName, 105, 22, { align: "center" });

    // Colored ribbon block behind the subheader
    doc.setFillColor(theme.primary[0], theme.primary[1], theme.primary[2]);
    doc.rect(20, 28, 170, 7.5, "F");

    doc.setFontSize(10.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("OFFICIAL REPORT CARD", 105, 33, { align: "center" });

    // Student Details rounded-like structured box
    doc.setFillColor(theme.bgLight[0], theme.bgLight[1], theme.bgLight[2]);
    doc.setDrawColor(theme.primary[0], theme.primary[1], theme.primary[2]);
    doc.setLineWidth(0.5);
    doc.rect(20, 42, 170, 18, "FD");

    doc.setFontSize(9.5);
    // Student Name
    doc.setFont("helvetica", "bold"); doc.setTextColor(theme.textMuted[0], theme.textMuted[1], theme.textMuted[2]); doc.text("Student Name:", 24, 48);
    doc.setFont("helvetica", "normal"); doc.setTextColor(theme.textDark[0], theme.textDark[1], theme.textDark[2]); doc.text(student.name, 50, 48);

    // Class
    doc.setFont("helvetica", "bold"); doc.setTextColor(theme.textMuted[0], theme.textMuted[1], theme.textMuted[2]); doc.text("Class / Grade:", 114, 48);
    doc.setFont("helvetica", "normal"); doc.setTextColor(theme.textDark[0], theme.textDark[1], theme.textDark[2]); doc.text(className, 140, 48);

    // Father's Name
    doc.setFont("helvetica", "bold"); doc.setTextColor(theme.textMuted[0], theme.textMuted[1], theme.textMuted[2]); doc.text("Father's Name:", 24, 54);
    doc.setFont("helvetica", "normal"); doc.setTextColor(theme.textDark[0], theme.textDark[1], theme.textDark[2]); doc.text(student.fatherName || "N/A", 50, 54);

    // Term Exam
    doc.setFont("helvetica", "bold"); doc.setTextColor(theme.textMuted[0], theme.textMuted[1], theme.textMuted[2]); doc.text("Term Session:", 114, 54);
    doc.setFont("helvetica", "normal"); doc.setTextColor(theme.textDark[0], theme.textDark[1], theme.textDark[2]); doc.text(termExam, 140, 54);

    // Academic performance stats boxes (KPI Dashboard style)
    const totalMaxMarks = subjects.reduce((sum, sub) => sum + (parseFloat(sub.maxMarks) || 0), 0);

    // Box 1: Obtained Marks
    doc.setFillColor(theme.bgLight[0], theme.bgLight[1], theme.bgLight[2]); 
    doc.setDrawColor(theme.primary[0], theme.primary[1], theme.primary[2]); 
    doc.rect(20, 68, 52, 14, "FD");
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(theme.primary[0], theme.primary[1], theme.primary[2]); doc.text("TOTAL OBTAINED", 46, 72, { align: "center" });
    doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(theme.textDark[0], theme.textDark[1], theme.textDark[2]); doc.text(`${student.totalMarks} / ${totalMaxMarks}`, 46, 79, { align: "center" });

    // Box 2: Percentage Score
    doc.setFillColor(theme.bgLight[0], theme.bgLight[1], theme.bgLight[2]); 
    doc.setDrawColor(theme.secondary[0], theme.secondary[1], theme.secondary[2]); 
    doc.rect(78, 68, 52, 14, "FD");
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(theme.secondary[0], theme.secondary[1], theme.secondary[2]); doc.text("PERCENTAGE SCORE", 104, 72, { align: "center" });
    doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(theme.textDark[0], theme.textDark[1], theme.textDark[2]); doc.text(`${student.percentage.toFixed(2)}%`, 104, 79, { align: "center" });

    // Box 3: Final standings
    doc.setFillColor(theme.bgLight[0], theme.bgLight[1], theme.bgLight[2]); 
    doc.setDrawColor(theme.primary[0], theme.primary[1], theme.primary[2]); 
    doc.rect(136, 68, 54, 14, "FD");
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(theme.primary[0], theme.primary[1], theme.primary[2]); doc.text("GRADE & CLASS RANK", 163, 72, { align: "center" });
    doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(theme.textDark[0], theme.textDark[1], theme.textDark[2]); doc.text(`Grade ${student.grade} (#${index + 1})`, 163, 79, { align: "center" });

    // Subjects Marks Table
    const tableBody = subjects.map(sub => [
      sub.name,
      sub.maxMarks,
      student.marks[sub.name] || "0",
      parseFloat(student.marks[sub.name]) >= (sub.maxMarks * 0.5) ? "Pass" : "Fail"
    ]);

    // Add bottom aggregate line
    tableBody.push(["GRAND TOTAL", totalMaxMarks, student.totalMarks, student.grade]);

    autoTable(doc, {
      startY: 88,
      head: [["Subject Description", "Maximum Marks", "Obtained Marks", "Result / Status"]],
      body: tableBody,
      theme: "grid",
      styles: { fontSize: 9, halign: "center", cellPadding: 2.5, textColor: theme.textDark },
      headStyles: { fillColor: theme.primary, textColor: [255, 255, 255], fontStyle: "bold" },
      alternateRowStyles: { fillColor: theme.bgLight },
      columnStyles: {
        0: { halign: "left" }
      },
      margin: { left: 20, right: 20 }
    });

    const finalY = doc.lastAutoTable.finalY || 140;

    // Feedback card box
    doc.setFillColor(theme.bgLight[0], theme.bgLight[1], theme.bgLight[2]); 
    doc.setDrawColor(theme.secondary[0], theme.secondary[1], theme.secondary[2]); 
    doc.rect(20, finalY + 8, 170, 20, "FD");
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(theme.primary[0], theme.primary[1], theme.primary[2]); doc.text("TEACHER REMARKS & FEEDBACK", 24, finalY + 13);
    
    // Choose dynamic comment from user's custom remarks pool for this grade
    const matchedRule = gradeRules ? gradeRules.find(r => r.grade === student.grade) : null;
    const remarksPool = matchedRule && matchedRule.remarks && matchedRule.remarks.length > 0 
      ? matchedRule.remarks 
      : ["Good effort, keep it up."];
    const randomComment = remarksPool[Math.floor(Math.random() * remarksPool.length)];
    
    doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.setTextColor(theme.textDark[0], theme.textDark[1], theme.textDark[2]); doc.text(randomComment, 24, finalY + 20);

    // Grade guide criteria scale
    doc.setFontSize(7.5);
    doc.setTextColor(theme.textMuted[0], theme.textMuted[1], theme.textMuted[2]);
    doc.text(scaleKey, 105, finalY + 36, { align: "center" });

    // Signature footer area
    const sigY = finalY + 58;
    doc.setDrawColor(theme.primary[0], theme.primary[1], theme.primary[2]); doc.setLineWidth(0.5);
    doc.line(20, sigY, 70, sigY);
    doc.line(140, sigY, 190, sigY);

    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(theme.textMuted[0], theme.textMuted[1], theme.textMuted[2]);
    doc.text("Teacher's Signature", 45, sigY + 6, { align: "center" });
    doc.text("Principal's Signature", 165, sigY + 6, { align: "center" });

    // Date in middle
    const displayDate = customDate || new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(theme.textMuted[0], theme.textMuted[1], theme.textMuted[2]);
    doc.text(`Date: ${displayDate}`, 105, sigY + 6, { align: "center" });

    // Add signature images if uploaded
    if (teacherSignatureBase64) {
      try {
        doc.addImage(teacherSignatureBase64, 'PNG', 27.5, sigY - 14, 35, 12);
      } catch (err) {
        console.error("Teacher signature render error:", err);
      }
    }
    if (principalSignatureBase64) {
      try {
        doc.addImage(principalSignatureBase64, 'PNG', 147.5, sigY - 14, 35, 12);
      } catch (err) {
        console.error("Principal signature render error:", err);
      }
    }
  });

  // Save PDF booklet
  doc.save(`${printedCount}_Student_Result_Cards.pdf`);
};
