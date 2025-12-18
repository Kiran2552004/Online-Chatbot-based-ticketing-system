import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdir } from 'fs/promises';
import { existsSync, createWriteStream } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Generate a PDF ticket for a booking
 * @param {Object} bookingData - Booking information
 * @param {string} bookingData.bookingId - Booking ID
 * @param {string} bookingData.userName - User's name
 * @param {string} bookingData.museumName - Museum name
 * @param {Date} bookingData.date - Booking date
 * @param {number} bookingData.ticketCount - Number of tickets
 * @param {number} bookingData.amount - Total amount
 * @returns {Promise<string>} Path to the generated PDF file
 */
export const generateTicketPDF = async (bookingData) => {
  const { bookingId, userName, museumName, date, ticketCount, amount } = bookingData;

  // Ensure tickets directory exists
  const ticketsDir = join(__dirname, '..', 'tickets');
  if (!existsSync(ticketsDir)) {
    await mkdir(ticketsDir, { recursive: true });
  }

  const pdfPath = join(ticketsDir, `${bookingId}.pdf`);
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  // Create write stream
  const fileStream = createWriteStream(pdfPath);
  doc.pipe(fileStream);

  // Generate QR Code as data URL
  const qrDataURL = await QRCode.toDataURL(bookingId, {
    width: 200,
    margin: 2,
  });

  // Extract base64 data from data URL
  const qrBase64 = qrDataURL.split(',')[1];
  const qrBuffer = Buffer.from(qrBase64, 'base64');

  // Header
  doc.fontSize(28)
     .fillColor('#667eea')
     .text('MUSEUM TICKET', { align: 'center' });

  doc.moveDown(0.5);

  // Booking ID
  doc.fontSize(20)
     .fillColor('#764ba2')
     .text(`Booking ID: ${bookingId}`, { align: 'center' });

  doc.moveDown(1);

  // QR Code
  doc.image(qrBuffer, {
    fit: [150, 150],
    align: 'center',
    valign: 'center',
  });

  doc.moveDown(1);

  // Ticket Details Box
  const detailsStartY = doc.y;
  doc.rect(50, detailsStartY, 495, 200)
     .fillColor('#f9f9f9')
     .fill();

  doc.fontSize(14)
     .fillColor('#333');

  let yPos = detailsStartY + 20;
  const lineHeight = 25;

  // User Name
  doc.fontSize(12)
     .fillColor('#666')
     .text('Guest Name:', 70, yPos);
  doc.fontSize(14)
     .fillColor('#333')
     .text(userName, 200, yPos);
  yPos += lineHeight;

  // Museum Name
  doc.fontSize(12)
     .fillColor('#666')
     .text('Museum:', 70, yPos);
  doc.fontSize(14)
     .fillColor('#333')
     .text(museumName, 200, yPos);
  yPos += lineHeight;

  // Date
  doc.fontSize(12)
     .fillColor('#666')
     .text('Visit Date:', 70, yPos);
  doc.fontSize(14)
     .fillColor('#333')
     .text(new Date(date).toLocaleDateString('en-IN', {
       weekday: 'long',
       year: 'numeric',
       month: 'long',
       day: 'numeric',
     }), 200, yPos);
  yPos += lineHeight;

  // Ticket Count
  doc.fontSize(12)
     .fillColor('#666')
     .text('Number of Tickets:', 70, yPos);
  doc.fontSize(14)
     .fillColor('#333')
     .text(`${ticketCount}`, 200, yPos);
  yPos += lineHeight;

  // Amount
  doc.fontSize(12)
     .fillColor('#666')
     .text('Total Amount:', 70, yPos);
  doc.fontSize(16)
     .fillColor('#667eea')
     .font('Helvetica-Bold');
  // Ensure amount is a number and format it properly, clean any non-numeric characters
  const numericAmount = typeof amount === 'number' ? amount : parseFloat(String(amount).replace(/[^\d.]/g, '')) || 0;
  const amountString = Math.round(numericAmount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  doc.text(`Rs. ${amountString}`, 200, yPos);
  yPos += lineHeight;

  // Timestamp
  doc.fontSize(10)
     .fillColor('#999')
     .font('Helvetica')
     .text(`Issued on: ${new Date().toLocaleString('en-IN')}`, 70, yPos + 10, {
       align: 'left',
     });

  doc.moveDown(2);

  // Footer
  doc.fontSize(10)
     .fillColor('#999')
     .text('Please present this ticket at the museum entrance.', { align: 'center' });
  doc.text('For any queries, please contact support.', { align: 'center' });

  // Finalize PDF
  doc.end();

  // Wait for the stream to finish
  await new Promise((resolve, reject) => {
    fileStream.on('finish', () => resolve());
    fileStream.on('error', reject);
  });

  return pdfPath;
};

