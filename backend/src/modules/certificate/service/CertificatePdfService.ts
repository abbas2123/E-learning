import PDFDocument from "pdfkit";
import type { CertificateDto } from "../interface/ICertificateRepository";

export class CertificatePdfService {
  async generatePdfBuffer(cert: CertificateDto): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: "A4",
          layout: "landscape",
          margin: 0,
        });

        const buffers: Buffer[] = [];
        doc.on("data", (chunk) => buffers.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(buffers)));
        doc.on("error", (err) => reject(err));

        const width = doc.page.width;
        const height = doc.page.height;

        // Background Outer Frame
        doc
          .rect(0, 0, width, height)
          .fill("#0F172A"); // Slate 900

        // Decorative Inner Border
        doc
          .rect(20, 20, width - 40, height - 40)
          .lineWidth(2)
          .stroke("#38BDF8"); // Sky 400

        doc
          .rect(28, 28, width - 56, height - 56)
          .lineWidth(1)
          .stroke("#6366F1"); // Indigo 500

        // Brand Logo / Header Text
        doc
          .font("Helvetica-Bold")
          .fontSize(28)
          .fillColor("#6366F1")
          .text("TOTC", 0, 70, { align: "center" });

        doc
          .font("Helvetica")
          .fontSize(10)
          .fillColor("#94A3B8")
          .text("E-LEARNING PLATFORM", 0, 105, { align: "center" });

        // Certificate Title
        doc
          .font("Helvetica-Bold")
          .fontSize(32)
          .fillColor("#F8FAFC")
          .text("CERTIFICATE OF COMPLETION", 0, 150, { align: "center" });

        // Subtitle
        doc
          .font("Helvetica")
          .fontSize(14)
          .fillColor("#CBD5E1")
          .text("THIS CERTIFIES THAT", 0, 210, { align: "center" });

        // Student Name
        doc
          .font("Helvetica-Bold")
          .fontSize(28)
          .fillColor("#38BDF8")
          .text(cert.studentName.toUpperCase(), 0, 245, { align: "center" });

        // Text
        doc
          .font("Helvetica")
          .fontSize(14)
          .fillColor("#CBD5E1")
          .text("HAS SUCCESSFULLY COMPLETED THE ONLINE COURSE", 0, 295, {
            align: "center",
          });

        // Course Title
        doc
          .font("Helvetica-Bold")
          .fontSize(24)
          .fillColor("#818CF8")
          .text(`"${cert.courseTitle}"`, 0, 330, { align: "center" });

        // Footer details divider line
        doc
          .moveTo(150, 390)
          .lineTo(width - 150, 390)
          .lineWidth(1)
          .stroke("#334155");

        // Metadata grid at bottom
        const issuedDateStr = new Date(cert.issuedAt).toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          },
        );

        doc
          .font("Helvetica-Bold")
          .fontSize(10)
          .fillColor("#94A3B8")
          .text(`Certificate ID: ${cert.certificateId}`, 150, 420, {
            width: 250,
            align: "left",
          });

        doc
          .font("Helvetica-Bold")
          .fontSize(10)
          .fillColor("#94A3B8")
          .text(`Issued Date: ${issuedDateStr}`, width - 400, 420, {
            width: 250,
            align: "right",
          });

        // Verification Link
        doc
          .font("Helvetica")
          .fontSize(9)
          .fillColor("#64748B")
          .text(`Verify online: ${cert.verificationUrl}`, 0, 465, {
            align: "center",
          });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}
