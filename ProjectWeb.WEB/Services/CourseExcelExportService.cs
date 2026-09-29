using ClosedXML.Excel;
using ProjectWeb.Domain.DTO.CourseManagement;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace ProjectWeb.WEB.Services
{
    /// <summary>
    /// Generates the 9-sheet Course Excel Report matching the reference template.
    /// Sheet order: Total | Cosolidated List | Received Amount | Basic RCC | Practice | Jr.Camping | Sr Trekking | Instructor and Official | Expenses
    /// </summary>
    public class CourseExcelExportService
    {
        // =====================================================
        // RECEIVER & FIELD HELPERS
        // =====================================================
        private static string GetReceiverName(string? rawId)
        {
            var s = (rawId ?? "").Trim();
            if (s == "1" || s.Equals("dipto", StringComparison.OrdinalIgnoreCase)) return "Dipto";
            if (s == "2" || s.Equals("bank", StringComparison.OrdinalIgnoreCase)) return "Bank";
            if (s == "3" || s.Equals("prabir", StringComparison.OrdinalIgnoreCase)) return "Prabir";
            return string.IsNullOrWhiteSpace(s) ? "" : s;
        }

        private static string GetParticipantName(CourseEnrollmentDto e)
        {
            if (!string.IsNullOrWhiteSpace(e.ParticipantName)) return e.ParticipantName;
            if (!string.IsNullOrWhiteSpace(e.FullName)) return e.FullName;
            if (!string.IsNullOrWhiteSpace(e.Name)) return e.Name;
            return "-";
        }

        private static string GetParticipantPhone(CourseEnrollmentDto e)
        {
            if (!string.IsNullOrWhiteSpace(e.Phone)) return e.Phone;
            if (!string.IsNullOrWhiteSpace(e.PhoneNumber)) return e.PhoneNumber;
            return "";
        }

        private static string GetOfficialName(CourseOfficialDto o)
        {
            if (!string.IsNullOrWhiteSpace(o.OfficialName)) return o.OfficialName;
            if (!string.IsNullOrWhiteSpace(o.FullName)) return o.FullName;
            if (!string.IsNullOrWhiteSpace(o.Name)) return o.Name;
            if (!string.IsNullOrWhiteSpace(o.ParticipantName)) return o.ParticipantName;
            return "-";
        }

        private static (decimal amtPaid, string payMode) GetPaymentInfo(
            CourseEnrollmentDto enroll,
            Dictionary<long, List<CoursePaymentDto>> payByEnroll,
            Dictionary<string, List<CoursePaymentDto>> payByName)
        {
            List<CoursePaymentDto> ep = new();
            long id1 = enroll.CourseEnrollmentId > 0 ? enroll.CourseEnrollmentId : enroll.EnrollmentId;
            long id2 = enroll.Id;
            var pName = GetParticipantName(enroll).Trim().ToUpper();

            if (id1 > 0 && payByEnroll.TryGetValue(id1, out var list1))
                ep = list1;
            else if (id2 > 0 && payByEnroll.TryGetValue(id2, out var list2))
                ep = list2;
            else if (!string.IsNullOrWhiteSpace(pName) && pName != "-" && payByName.TryGetValue(pName, out var list3))
                ep = list3;
            else if (enroll.Payments != null && enroll.Payments.Count > 0)
                ep = enroll.Payments;

            decimal amtPaid = ep.Sum(p => p.Amount > 0 ? p.Amount : p.PaymentAmount ?? 0);
            if (amtPaid == 0 && enroll.TotalPaid > 0)
                amtPaid = enroll.TotalPaid;

            string receiver = "";
            if (ep.Count > 0)
            {
                var r = ep.Last().PaymentReceiver;
                if (!string.IsNullOrWhiteSpace(r)) receiver = GetReceiverName(r);
            }
            string payMode = !string.IsNullOrWhiteSpace(receiver) ? $"PAID TO {receiver.ToUpper()}" : "";

            return (amtPaid, payMode);
        }

        // =====================================================
        // COURSE NAME GROUPING
        // =====================================================
        private static readonly string[] BasicRccKeywords = { "BASIC", "RCC", "ROCK CLIMBING" };
        private static readonly string[] PracticeKeywords = { "PRACTICE", "PRACTISE", "PRAC" };
        private static readonly string[] JrCampingKeywords = { "JUNIOR", "JR", "CAMP" };
        private static readonly string[] SrTrekkingKeywords = { "SENIOR", "SR", "TREK", "TREKKING" };
        private static readonly string[] InstructorKeywords = { "INSTRUCTOR", "OFFICIAL", "OFFICAL" };

        private static string GetCourseGroup(CourseEnrollmentDto e)
        {
            var combined = $"{e.CourseName} {e.BatchName} {e.CourseCode}".ToUpper();
            if (InstructorKeywords.Any(k => combined.Contains(k))) return "INSTRUCTOR";
            if (SrTrekkingKeywords.Any(k => combined.Contains(k))) return "SR_TREKKING";
            if (JrCampingKeywords.Any(k => combined.Contains(k))) return "JR_CAMPING";
            if (PracticeKeywords.Any(k => combined.Contains(k))) return "PRACTICE";
            if (BasicRccKeywords.Any(k => combined.Contains(k))) return "BASIC_RCC";
            return "BASIC_RCC";
        }

        // =====================================================
        // MAIN ENTRY POINT
        // =====================================================
        public byte[] GenerateReport(
            List<CourseEnrollmentDto> enrollments,
            List<CoursePaymentDto> payments,
            List<CourseRefundDto> refunds,
            List<CourseOfficialDto> officials,
            List<CourseExpenseDto> expenses,
            int? year)
        {
            enrollments ??= new List<CourseEnrollmentDto>();
            payments ??= new List<CoursePaymentDto>();
            refunds ??= new List<CourseRefundDto>();
            officials ??= new List<CourseOfficialDto>();
            expenses ??= new List<CourseExpenseDto>();

            // Auto-detect officials if officials list is empty but enrollments contain officials
            if (officials.Count == 0)
            {
                var offEnrollments = enrollments.Where(e => GetCourseGroup(e) == "INSTRUCTOR").ToList();
                if (offEnrollments.Count > 0)
                {
                    officials = offEnrollments.Select(oe => new CourseOfficialDto
                    {
                        CourseOfficialId = oe.CourseEnrollmentId > 0 ? oe.CourseEnrollmentId : oe.EnrollmentId,
                        OfficialName = GetParticipantName(oe),
                        Amount = oe.TotalPaid,
                        PaymentStatus = "PAID"
                    }).ToList();
                }
            }

            var activeEnrollments = enrollments
                .Where(e =>
                {
                    var st = (e.EnrollmentStatus ?? e.Status ?? "").ToUpper();
                    return st != "CANCELLED" && st != "CANCELED" && GetCourseGroup(e) != "INSTRUCTOR";
                })
                .ToList();

            var basicRcc = activeEnrollments.Where(e => GetCourseGroup(e) == "BASIC_RCC").ToList();
            var practice = activeEnrollments.Where(e => GetCourseGroup(e) == "PRACTICE").ToList();
            var jrCamping = activeEnrollments.Where(e => GetCourseGroup(e) == "JR_CAMPING").ToList();
            var srTrekking = activeEnrollments.Where(e => GetCourseGroup(e) == "SR_TREKKING").ToList();

            int reportYear = year ?? DateTime.Now.Year;

            using var workbook = new XLWorkbook();

            BuildTotalSheet(workbook, enrollments, basicRcc, practice, jrCamping, srTrekking, officials, payments, refunds, expenses, reportYear);
            BuildConsolidatedListSheet(workbook, basicRcc, practice, jrCamping, srTrekking, officials, reportYear);
            BuildReceivedAmountSheet(workbook, basicRcc, practice, jrCamping, srTrekking, officials, payments, reportYear);
            BuildCourseSheet(workbook, "Basic RCC", basicRcc, payments, reportYear);
            BuildCourseSheet(workbook, "Practice", practice, payments, reportYear);
            BuildJrCampingSheet(workbook, jrCamping, payments, reportYear);
            BuildCourseSheet(workbook, "Sr Trekking", srTrekking, payments, reportYear);
            BuildInstructorSheet(workbook, officials, reportYear);
            BuildExpensesSheet(workbook, expenses, payments, refunds, reportYear);

            using var ms = new MemoryStream();
            workbook.SaveAs(ms);
            return ms.ToArray();
        }

        // =====================================================
        // SHEET 1: Total
        // =====================================================
        private void BuildTotalSheet(
            IXLWorkbook wb,
            List<CourseEnrollmentDto> allEnrollments,
            List<CourseEnrollmentDto> basicRcc,
            List<CourseEnrollmentDto> practice,
            List<CourseEnrollmentDto> jrCamping,
            List<CourseEnrollmentDto> srTrekking,
            List<CourseOfficialDto> officials,
            List<CoursePaymentDto> payments,
            List<CourseRefundDto> refunds,
            List<CourseExpenseDto> expenses,
            int year)
        {
            var ws = wb.Worksheets.Add("Total");

            int rccCount = basicRcc.Count;
            int pracCount = practice.Count;
            int jrCount = jrCamping.Count;
            int srCount = srTrekking.Count;
            int officialCount = officials.Count;
            int totalTrainee = rccCount + pracCount + jrCount + srCount;
            int grandTotal = totalTrainee + officialCount;

            decimal totalDipto = payments.Where(p => GetReceiverName(p.PaymentReceiver) == "Dipto").Sum(p => p.Amount > 0 ? p.Amount : p.PaymentAmount ?? 0);
            decimal totalBank = payments.Where(p => GetReceiverName(p.PaymentReceiver) == "Bank").Sum(p => p.Amount > 0 ? p.Amount : p.PaymentAmount ?? 0);
            decimal totalPrabir = payments.Where(p => GetReceiverName(p.PaymentReceiver) == "Prabir").Sum(p => p.Amount > 0 ? p.Amount : p.PaymentAmount ?? 0);
            decimal totalOther = payments.Where(p =>
            {
                var n = GetReceiverName(p.PaymentReceiver);
                return n != "Dipto" && n != "Bank" && n != "Prabir";
            }).Sum(p => p.Amount > 0 ? p.Amount : p.PaymentAmount ?? 0);

            decimal totalCollection = payments.Sum(p => p.Amount > 0 ? p.Amount : p.PaymentAmount ?? 0);
            if (totalCollection == 0 && allEnrollments.Any(e => e.TotalPaid > 0))
            {
                totalCollection = allEnrollments.Sum(e => e.TotalPaid);
            }

            decimal totalRefund = refunds.Sum(r => r.RefundAmount);
            if (totalRefund == 0)
            {
                totalRefund = allEnrollments.Sum(e => e.TotalRefund);
            }

            decimal totalExpense = expenses.Sum(e => e.Amount);
            decimal netIncome = totalCollection - totalRefund - totalExpense;

            SetBold(ws, "C8", "Basic Rock Climbing"); ws.Cell("D8").Value = rccCount;
            SetBold(ws, "H8", "TOTAL"); SetBold(ws, "I8", "BOYS"); SetBold(ws, "J8", "GIRLS");
            SetBold(ws, "C9", "Practise"); ws.Cell("D9").Value = pracCount;
            SetBold(ws, "G9", "RCC"); ws.Cell("H9").Value = rccCount;
            SetBold(ws, "C10", "Junior Camping"); ws.Cell("D10").Value = jrCount;
            SetBold(ws, "G10", "PRACTISE"); ws.Cell("H10").Value = pracCount;
            SetBold(ws, "C11", "Senior Trekking"); ws.Cell("D11").Value = srCount;
            SetBold(ws, "G11", "JR CAMPING"); ws.Cell("H11").Value = jrCount;
            SetBold(ws, "G12", "SENIOR TREKKING"); ws.Cell("H12").Value = srCount;
            SetBold(ws, "C13", "TOTAL TRAINEE"); ws.Cell("D13").Value = totalTrainee;
            SetBold(ws, "G13", "INSTRUCTOR AND OFFICIAL"); ws.Cell("H13").Value = officialCount;
            SetBold(ws, "C14", "Instructor and Official"); ws.Cell("D14").Value = officialCount;
            SetBold(ws, "C16", "TOTAL"); ws.Cell("D16").Value = grandTotal;

            SetBold(ws, "C19", "Paid to Prabir Biswas"); ws.Cell("D19").Value = totalPrabir;
            SetBold(ws, "C20", "Paid to Dipto"); ws.Cell("D20").Value = totalDipto;
            SetBold(ws, "C22", "Paid to Bank / CC A/C"); ws.Cell("D22").Value = totalBank;
            SetBold(ws, "C24", "Paid in Cash"); ws.Cell("D24").Value = totalOther;

            ws.Cell("D26").Value = totalCollection;
            ws.Cell("D26").Style.Font.Bold = true;
            ws.Cell("D26").Style.Fill.BackgroundColor = XLColor.LightYellow;

            SetBold(ws, "C27", "Refund"); ws.Cell("D27").Value = totalRefund;
            SetBold(ws, "C28", "Expense"); ws.Cell("D28").Value = totalExpense;
            SetBold(ws, "C29", "Net Income"); ws.Cell("D29").Value = netIncome;
            ws.Cell("D29").Style.Font.Bold = true;
            ws.Cell("D29").Style.Fill.BackgroundColor = XLColor.LightGreen;

            foreach (var addr in new[] { "D19", "D20", "D22", "D24", "D26", "D27", "D28", "D29" })
                ws.Cell(addr).Style.NumberFormat.Format = "#,##0.00";

            ws.Columns().AdjustToContents();
        }

        // =====================================================
        // SHEET 2: Cosolidated List  (exact spelling)
        // =====================================================
        private void BuildConsolidatedListSheet(
            IXLWorkbook wb,
            List<CourseEnrollmentDto> basicRcc,
            List<CourseEnrollmentDto> practice,
            List<CourseEnrollmentDto> jrCamping,
            List<CourseEnrollmentDto> srTrekking,
            List<CourseOfficialDto> officials,
            int year)
        {
            var ws = wb.Worksheets.Add("Cosolidated List");

            ws.Cell("E2").Value = $"Climbers' Circle Course {year}";
            ws.Range("E2:N2").Merge();
            ws.Cell("E2").Style.Font.Bold = true;
            ws.Cell("E2").Style.Font.FontSize = 13;
            ws.Cell("E2").Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

            string[] hdrCols = { "B","C","D","E","F","G","H","I","J","K","L","M","N","O","P" };
            string[] hdrVals = { "SNO","BASIC RCC","M/F","Remarks","PRACTISE","M/F","Remarks","JR CAMPING","M/F","Remarks","SR TREKKING","M/F","Remarks",$"INSTRUCTORS AND OFFICIALS DEC {year}","M/F" };
            for (int i = 0; i < hdrCols.Length; i++)
            {
                ws.Cell($"{hdrCols[i]}3").Value = hdrVals[i];
                ApplyHeaderStyle(ws.Cell($"{hdrCols[i]}3"));
            }

            int maxRows = new[] { basicRcc.Count, practice.Count, jrCamping.Count, srTrekking.Count, officials.Count }.Max();
            if (maxRows == 0) maxRows = 1;

            for (int i = 0; i < maxRows; i++)
            {
                int rowNum = i + 4;
                ws.Cell($"B{rowNum}").Value = i + 1;
                if (i < basicRcc.Count) ws.Cell($"C{rowNum}").Value = GetParticipantName(basicRcc[i]);
                if (i < practice.Count) ws.Cell($"F{rowNum}").Value = GetParticipantName(practice[i]);
                if (i < jrCamping.Count) ws.Cell($"I{rowNum}").Value = GetParticipantName(jrCamping[i]);
                if (i < srTrekking.Count) ws.Cell($"L{rowNum}").Value = GetParticipantName(srTrekking[i]);
                if (i < officials.Count) ws.Cell($"O{rowNum}").Value = GetOfficialName(officials[i]);
            }

            ws.Columns().AdjustToContents();
        }

        // =====================================================
        // SHEET 3: Received Amount
        // =====================================================
        private void BuildReceivedAmountSheet(
            IXLWorkbook wb,
            List<CourseEnrollmentDto> basicRcc,
            List<CourseEnrollmentDto> practice,
            List<CourseEnrollmentDto> jrCamping,
            List<CourseEnrollmentDto> srTrekking,
            List<CourseOfficialDto> officials,
            List<CoursePaymentDto> payments,
            int year)
        {
            var ws = wb.Worksheets.Add("Received Amount");

            string[] lCols = { "B","C","D","E","F","G" };
            string[] lHdrs = { "NAME","Course","Amount Paid","Payment Mode","Pending Amount","Payment Mode for Pending" };
            string[] rCols = { "I","J","K","L","M" };
            string[] rHdrs = { "NAME","Amount Paid","Payment Mode","Pending Amount","Payment Mode for Pending" };
            for (int i = 0; i < lHdrs.Length; i++) { ws.Cell($"{lCols[i]}1").Value = lHdrs[i]; ApplyHeaderStyle(ws.Cell($"{lCols[i]}1")); }
            for (int i = 0; i < rHdrs.Length; i++) { ws.Cell($"{rCols[i]}1").Value = rHdrs[i]; ApplyHeaderStyle(ws.Cell($"{rCols[i]}1")); }

            ws.Cell("B2").Value = "Trainees"; ws.Cell("B2").Style.Font.Bold = true;
            ws.Cell("I2").Value = "Instructor and Official"; ws.Cell("I2").Style.Font.Bold = true;

            var payByEnroll = payments.GroupBy(p => p.EnrollmentId > 0 ? p.EnrollmentId : p.CourseEnrollmentId).ToDictionary(g => g.Key, g => g.ToList());
            var payByName = payments.Where(p => !string.IsNullOrWhiteSpace(p.ParticipantName)).GroupBy(p => p.ParticipantName.Trim().ToUpper()).ToDictionary(g => g.Key, g => g.ToList());

            var allTrainees = basicRcc.Select(e => (e, "RCC"))
                .Concat(practice.Select(e => (e, "PRACTISE")))
                .Concat(jrCamping.Select(e => (e, "JR CAMPING")))
                .Concat(srTrekking.Select(e => (e, "SR TREKKING")))
                .ToList();

            int maxRows = Math.Max(allTrainees.Count, officials.Count);
            if (maxRows == 0) maxRows = 1;

            decimal traineeTotal = 0;

            for (int i = 0; i < maxRows; i++)
            {
                int rowNum = i + 3;
                if (i < allTrainees.Count)
                {
                    var (enroll, courseLabel) = allTrainees[i];
                    var (amtPaid, payRec) = GetPaymentInfo(enroll, payByEnroll, payByName);
                    traineeTotal += amtPaid;
                    decimal fee = enroll.TotalCourseFee > 0 ? enroll.TotalCourseFee : enroll.CourseFee ?? 0;
                    decimal pending = fee > 0 ? Math.Max(0, fee - amtPaid) : enroll.TotalDue;

                    ws.Cell($"B{rowNum}").Value = GetParticipantName(enroll);
                    ws.Cell($"C{rowNum}").Value = courseLabel;
                    if (amtPaid > 0)
                    {
                        ws.Cell($"D{rowNum}").Value = amtPaid;
                        ws.Cell($"D{rowNum}").Style.NumberFormat.Format = "#,##0.00";
                    }
                    else
                    {
                        ws.Cell($"D{rowNum}").Value = "-";
                    }
                    ws.Cell($"E{rowNum}").Value = payRec;
                    if (pending > 0)
                    {
                        ws.Cell($"F{rowNum}").Value = pending;
                        ws.Cell($"F{rowNum}").Style.NumberFormat.Format = "#,##0.00";
                        ws.Cell($"G{rowNum}").Value = "PENDING";
                    }
                }

                if (i < officials.Count)
                {
                    var off = officials[i];
                    ws.Cell($"I{rowNum}").Value = GetOfficialName(off);
                    if (off.Amount > 0)
                    {
                        ws.Cell($"J{rowNum}").Value = off.Amount;
                        ws.Cell($"J{rowNum}").Style.NumberFormat.Format = "#,##0.00";
                    }
                    ws.Cell($"K{rowNum}").Value = (off.PaymentStatus ?? "").ToUpper() == "PAID" ? "PAID" : "";
                    decimal offPending = (off.PaymentStatus ?? "").ToUpper() == "PAID" ? 0 : off.Amount;
                    if (offPending > 0)
                    {
                        ws.Cell($"L{rowNum}").Value = offPending;
                        ws.Cell($"L{rowNum}").Style.NumberFormat.Format = "#,##0.00";
                    }
                }
            }

            int totalRow = maxRows + 4;
            ws.Cell($"C{totalRow}").Value = "TOTAL COLLECTED";
            ws.Cell($"D{totalRow}").Value = traineeTotal;
            ws.Cell($"D{totalRow}").Style.Font.Bold = true;
            ws.Cell($"D{totalRow}").Style.NumberFormat.Format = "#,##0.00";

            ws.Columns().AdjustToContents();
        }

        // =====================================================
        // SHEET 4, 5, 7: Basic RCC / Practice / Sr Trekking
        // =====================================================
        private void BuildCourseSheet(IXLWorkbook wb, string sheetName, List<CourseEnrollmentDto> enrollments, List<CoursePaymentDto> payments, int year)
        {
            var ws = wb.Worksheets.Add(sheetName);

            string titleText = sheetName == "Basic RCC"
                ? $"ROCK CLIMBING TRAINEES Dec {year} for RCC"
                : sheetName == "Practice"
                    ? $"ROCK CLIMBING (PRACTICE ROPE) Dec {year}"
                    : $"SENIOR TREKKING Dec {year}";

            ws.Cell("C2").Value = titleText;
            ws.Range("C2:J2").Merge();
            ws.Cell("C2").Style.Font.Bold = true;
            ws.Cell("C2").Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

            string[] hdrs = { "SL NO","NAME","Phone no","Course","Sex","Age","Food Habit","Reference","Amount Paid","Payment Mode","Form Submitted","Father/Mother's Name","Address","Date of Birth","Profession","Mother Tongue","Height","Weight","Blood Group","Mail ID" };
            string[] cl = { "A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T" };
            for (int c = 0; c < hdrs.Length; c++) { ws.Cell($"{cl[c]}3").Value = hdrs[c]; ApplyHeaderStyle(ws.Cell($"{cl[c]}3")); }

            var payByEnroll = payments.GroupBy(p => p.EnrollmentId > 0 ? p.EnrollmentId : p.CourseEnrollmentId).ToDictionary(g => g.Key, g => g.ToList());
            var payByName = payments.Where(p => !string.IsNullOrWhiteSpace(p.ParticipantName)).GroupBy(p => p.ParticipantName.Trim().ToUpper()).ToDictionary(g => g.Key, g => g.ToList());

            for (int i = 0; i < enrollments.Count; i++)
            {
                var e = enrollments[i];
                int rowNum = i + 4;
                var (amtPaid, payMode) = GetPaymentInfo(e, payByEnroll, payByName);

                ws.Cell($"A{rowNum}").Value = i + 1;
                ws.Cell($"B{rowNum}").Value = GetParticipantName(e);
                ws.Cell($"C{rowNum}").Value = GetParticipantPhone(e);
                ws.Cell($"D{rowNum}").Value = !string.IsNullOrEmpty(e.CourseName) ? e.CourseName.ToUpper() : sheetName.ToUpper();
                if (amtPaid > 0)
                {
                    ws.Cell($"I{rowNum}").Value = amtPaid;
                    ws.Cell($"I{rowNum}").Style.NumberFormat.Format = "#,##0.00";
                }
                else
                {
                    ws.Cell($"I{rowNum}").Value = "-";
                }
                ws.Cell($"J{rowNum}").Value = payMode;
                ws.Cell($"K{rowNum}").Value = e.FormSubmitted ? "Yes" : "No";
                ws.Cell($"T{rowNum}").Value = e.Email;
            }

            int sumRow = Math.Max(enrollments.Count, 1) + 6;
            var pg = payments.GroupBy(p => GetReceiverName(p.PaymentReceiver)).ToDictionary(g => g.Key, g => g.Sum(p => p.Amount > 0 ? p.Amount : p.PaymentAmount ?? 0));
            ws.Cell($"J{sumRow}").Value = "PAID TO PRABIR"; ws.Cell($"K{sumRow}").Value = pg.GetValueOrDefault("Prabir", 0); ws.Cell($"K{sumRow}").Style.NumberFormat.Format = "#,##0.00";
            ws.Cell($"J{sumRow+1}").Value = "PAID TO DIPTO"; ws.Cell($"K{sumRow+1}").Value = pg.GetValueOrDefault("Dipto", 0); ws.Cell($"K{sumRow+1}").Style.NumberFormat.Format = "#,##0.00";
            ws.Cell($"J{sumRow+2}").Value = "PAID TO BANK"; ws.Cell($"K{sumRow+2}").Value = pg.GetValueOrDefault("Bank", 0); ws.Cell($"K{sumRow+2}").Style.NumberFormat.Format = "#,##0.00";

            ws.Columns().AdjustToContents();
        }

        // =====================================================
        // SHEET 6: Jr.Camping
        // =====================================================
        private void BuildJrCampingSheet(IXLWorkbook wb, List<CourseEnrollmentDto> enrollments, List<CoursePaymentDto> payments, int year)
        {
            var ws = wb.Worksheets.Add("Jr.Camping");

            ws.Cell("E2").Value = $"JUNIOR CAMPING Dec {year}";
            ws.Range("E2:I2").Merge();
            ws.Cell("E2").Style.Font.Bold = true;
            ws.Cell("E2").Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

            string[] hdrs = { "SL NO","NAME","Phone no","Course","Sex","Age","Food Habit","Reference","Amount Paid","Payment Mode","Form Submitted","Father/Mother's Name","Address","Date of Birth","Profession","Mother Tongue","Height","Weight","Blood Group","Mail ID","Physical Problem" };
            string[] cl = { "A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U" };
            for (int c = 0; c < hdrs.Length; c++) { ws.Cell($"{cl[c]}3").Value = hdrs[c]; ApplyHeaderStyle(ws.Cell($"{cl[c]}3")); }

            var payByEnroll = payments.GroupBy(p => p.EnrollmentId > 0 ? p.EnrollmentId : p.CourseEnrollmentId).ToDictionary(g => g.Key, g => g.ToList());
            var payByName = payments.Where(p => !string.IsNullOrWhiteSpace(p.ParticipantName)).GroupBy(p => p.ParticipantName.Trim().ToUpper()).ToDictionary(g => g.Key, g => g.ToList());

            for (int i = 0; i < enrollments.Count; i++)
            {
                var e = enrollments[i];
                int rowNum = i + 4;
                var (amtPaid, payMode) = GetPaymentInfo(e, payByEnroll, payByName);

                ws.Cell($"A{rowNum}").Value = i + 1;
                ws.Cell($"B{rowNum}").Value = GetParticipantName(e);
                ws.Cell($"C{rowNum}").Value = GetParticipantPhone(e);
                ws.Cell($"D{rowNum}").Value = !string.IsNullOrEmpty(e.CourseName) ? e.CourseName.ToUpper() : "JR CAMPING";
                if (amtPaid > 0)
                {
                    ws.Cell($"I{rowNum}").Value = amtPaid;
                    ws.Cell($"I{rowNum}").Style.NumberFormat.Format = "#,##0.00";
                }
                else
                {
                    ws.Cell($"I{rowNum}").Value = "-";
                }
                ws.Cell($"J{rowNum}").Value = payMode;
                ws.Cell($"K{rowNum}").Value = e.FormSubmitted ? "Yes" : "No";
                ws.Cell($"T{rowNum}").Value = e.Email;
                ws.Cell($"U{rowNum}").Value = "No";
            }

            int sumRow = Math.Max(enrollments.Count, 1) + 6;
            var pg = payments.GroupBy(p => GetReceiverName(p.PaymentReceiver)).ToDictionary(g => g.Key, g => g.Sum(p => p.Amount > 0 ? p.Amount : p.PaymentAmount ?? 0));
            ws.Cell($"J{sumRow}").Value = "PAID TO PRABIR"; ws.Cell($"K{sumRow}").Value = pg.GetValueOrDefault("Prabir", 0); ws.Cell($"K{sumRow}").Style.NumberFormat.Format = "#,##0.00";
            ws.Cell($"J{sumRow+1}").Value = "PAID TO DIPTO"; ws.Cell($"K{sumRow+1}").Value = pg.GetValueOrDefault("Dipto", 0); ws.Cell($"K{sumRow+1}").Style.NumberFormat.Format = "#,##0.00";
            ws.Cell($"J{sumRow+2}").Value = "PAID TO BANK"; ws.Cell($"K{sumRow+2}").Value = pg.GetValueOrDefault("Bank", 0); ws.Cell($"K{sumRow+2}").Style.NumberFormat.Format = "#,##0.00";

            ws.Columns().AdjustToContents();
        }

        // =====================================================
        // SHEET 8: Instructor and Official
        // =====================================================
        private void BuildInstructorSheet(IXLWorkbook wb, List<CourseOfficialDto> officials, int year)
        {
            var ws = wb.Worksheets.Add("Instructor and Official");

            ws.Cell("C2").Value = $"INSTRUCTORS AND OFFICIALS DEC {year}";
            ws.Range("C2:D2").Merge();
            ws.Cell("C2").Style.Font.Bold = true;

            string[] hdrCols = { "C","D","E","F","G","H" };
            string[] hdrVals = { "Sno","Name","HWH-TAMNA","TAMNA-HWH","Amount Paid","Payment Mode" };
            for (int i = 0; i < hdrCols.Length; i++) { ws.Cell($"{hdrCols[i]}3").Value = hdrVals[i]; ApplyHeaderStyle(ws.Cell($"{hdrCols[i]}3")); }

            for (int i = 0; i < officials.Count; i++)
            {
                var off = officials[i];
                int rowNum = i + 5;
                ws.Cell($"C{rowNum}").Value = i + 1;
                ws.Cell($"D{rowNum}").Value = GetOfficialName(off);
                ws.Cell($"E{rowNum}").Value = off.HowrahToDestination;
                ws.Cell($"F{rowNum}").Value = off.DestinationToHowrah;
                if (off.Amount > 0)
                {
                    ws.Cell($"G{rowNum}").Value = off.Amount;
                    ws.Cell($"G{rowNum}").Style.NumberFormat.Format = "#,##0.00";
                }
                ws.Cell($"H{rowNum}").Value = (off.PaymentStatus ?? "").ToUpper() == "PAID" ? "PAID" : "";
            }

            int totalRow = Math.Max(officials.Count, 1) + 6;
            ws.Cell($"F{totalRow}").Value = "TOTAL";
            ws.Cell($"G{totalRow}").Value = officials.Sum(o => o.Amount);
            ws.Cell($"G{totalRow}").Style.Font.Bold = true;
            ws.Cell($"G{totalRow}").Style.NumberFormat.Format = "#,##0.00";

            ws.Columns().AdjustToContents();
        }

        // =====================================================
        // SHEET 9: Expenses
        // =====================================================
        private void BuildExpensesSheet(IXLWorkbook wb, List<CourseExpenseDto> expenses, List<CoursePaymentDto> payments, List<CourseRefundDto> refunds, int year)
        {
            var ws = wb.Worksheets.Add("Expenses");

            ApplyHeaderStyle(ws.Cell("C3")); ws.Cell("C3").Value = "Deposit";
            ApplyHeaderStyle(ws.Cell("D3")); ws.Cell("D3").Value = "Amount";
            ApplyHeaderStyle(ws.Cell("F3")); ws.Cell("F3").Value = "Expense";
            ApplyHeaderStyle(ws.Cell("G3")); ws.Cell("G3").Value = "Expense Made By";
            ApplyHeaderStyle(ws.Cell("H3")); ws.Cell("H3").Value = "Amount";

            decimal diptoTotal = payments.Where(p => GetReceiverName(p.PaymentReceiver) == "Dipto").Sum(p => p.Amount > 0 ? p.Amount : p.PaymentAmount ?? 0);
            decimal prabirTotal = payments.Where(p => GetReceiverName(p.PaymentReceiver) == "Prabir").Sum(p => p.Amount > 0 ? p.Amount : p.PaymentAmount ?? 0);
            decimal bankTotal = payments.Where(p => GetReceiverName(p.PaymentReceiver) == "Bank").Sum(p => p.Amount > 0 ? p.Amount : p.PaymentAmount ?? 0);
            decimal totalDeposit = payments.Sum(p => p.Amount > 0 ? p.Amount : p.PaymentAmount ?? 0);

            ws.Cell("C4").Value = "Cash deposited to Prabir Biswas"; ws.Cell("D4").Value = prabirTotal; ws.Cell("D4").Style.NumberFormat.Format = "#,##0.00";
            ws.Cell("C5").Value = "Cash deposited to Dipto"; ws.Cell("D5").Value = diptoTotal; ws.Cell("D5").Style.NumberFormat.Format = "#,##0.00";
            ws.Cell("C6").Value = "Cash deposited to Bank / CC A/C"; ws.Cell("D6").Value = bankTotal; ws.Cell("D6").Style.NumberFormat.Format = "#,##0.00";
            ws.Cell("C7").Value = "TOTAL"; ws.Cell("D7").Value = totalDeposit; ws.Cell("D7").Style.Font.Bold = true; ws.Cell("D7").Style.NumberFormat.Format = "#,##0.00";

            for (int i = 0; i < expenses.Count; i++)
            {
                var exp = expenses[i];
                int rowNum = i + 4;
                ws.Cell($"F{rowNum}").Value = !string.IsNullOrEmpty(exp.Description) ? exp.Description : exp.ExpenseCategory;
                ws.Cell($"G{rowNum}").Value = GetReceiverName(exp.PaidBy);
                ws.Cell($"H{rowNum}").Value = exp.Amount;
                ws.Cell($"H{rowNum}").Style.NumberFormat.Format = "#,##0.00";
            }

            var byReceiver = expenses.GroupBy(e => GetReceiverName(e.PaidBy)).ToDictionary(g => g.Key, g => g.Sum(e => e.Amount));
            int summaryStart = Math.Max(expenses.Count + 4, 10) + 2;

            ws.Cell($"C{summaryStart}").Value = "Total expense by Dipto"; ws.Cell($"D{summaryStart}").Value = byReceiver.GetValueOrDefault("Dipto", 0); ws.Cell($"D{summaryStart}").Style.NumberFormat.Format = "#,##0.00";
            ws.Cell($"C{summaryStart+1}").Value = "Total expense by Prabir Biswas"; ws.Cell($"D{summaryStart+1}").Value = byReceiver.GetValueOrDefault("Prabir", 0); ws.Cell($"D{summaryStart+1}").Style.NumberFormat.Format = "#,##0.00";
            ws.Cell($"C{summaryStart+2}").Value = "Total expense by Bank"; ws.Cell($"D{summaryStart+2}").Value = byReceiver.GetValueOrDefault("Bank", 0); ws.Cell($"D{summaryStart+2}").Style.NumberFormat.Format = "#,##0.00";
            ws.Cell($"C{summaryStart+3}").Value = "TOTAL EXPENSE"; ws.Cell($"D{summaryStart+3}").Value = expenses.Sum(e => e.Amount); ws.Cell($"D{summaryStart+3}").Style.Font.Bold = true; ws.Cell($"D{summaryStart+3}").Style.NumberFormat.Format = "#,##0.00";

            int inHandStart = summaryStart + 5;
            ws.Cell($"C{inHandStart}").Value = "Cash In Hand with Dipto"; ws.Cell($"D{inHandStart}").Value = diptoTotal - byReceiver.GetValueOrDefault("Dipto", 0); ws.Cell($"D{inHandStart}").Style.NumberFormat.Format = "#,##0.00";
            ws.Cell($"C{inHandStart+1}").Value = "Cash In Hand with Prabir Biswas"; ws.Cell($"D{inHandStart+1}").Value = prabirTotal - byReceiver.GetValueOrDefault("Prabir", 0); ws.Cell($"D{inHandStart+1}").Style.NumberFormat.Format = "#,##0.00";
            ws.Cell($"C{inHandStart+2}").Value = "Cash In Hand with Bank"; ws.Cell($"D{inHandStart+2}").Value = bankTotal - byReceiver.GetValueOrDefault("Bank", 0); ws.Cell($"D{inHandStart+2}").Style.NumberFormat.Format = "#,##0.00";

            ws.Columns().AdjustToContents();
        }

        // =====================================================
        // HELPERS
        // =====================================================
        private static void ApplyHeaderStyle(IXLCell cell)
        {
            cell.Style.Font.Bold = true;
            cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#D9E1F2");
            cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
        }

        private static void SetBold(IXLWorksheet ws, string addr, string val)
        {
            ws.Cell(addr).Value = val;
            ws.Cell(addr).Style.Font.Bold = true;
        }
    }
}
