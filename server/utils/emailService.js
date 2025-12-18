import nodemailer from 'nodemailer';

// Only create transporter if email credentials are available
const getTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  
  if (!emailUser || !emailPass) {
    return null;
  }
  
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
};

export const sendBookingConfirmation = async (email, bookingData) => {
  const transporter = getTransporter();
  
  if (!transporter) {
    console.warn('⚠️  Email credentials not configured. Skipping email send.');
    return { success: false, error: 'Email service not configured' };
  }
  
  const { museumName, date, ticketCount, amount, bookingId } = bookingData;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Museum Booking Confirmation - ${bookingId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .detail-row { margin: 15px 0; padding: 10px; background: white; border-radius: 5px; }
          .detail-label { font-weight: bold; color: #667eea; }
          .booking-id { font-size: 24px; font-weight: bold; color: #764ba2; text-align: center; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎫 Booking Confirmed!</h1>
          </div>
          <div class="content">
            <p>Thank you for booking with us!</p>
            <div class="booking-id">${bookingId}</div>
            <div class="detail-row">
              <span class="detail-label">Museum:</span> ${museumName}
            </div>
            <div class="detail-row">
              <span class="detail-label">Date:</span> ${new Date(date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div class="detail-row">
              <span class="detail-label">Number of Tickets:</span> ${ticketCount}
            </div>
            <div class="detail-row">
              <span class="detail-label">Total Amount:</span> ₹${amount.toLocaleString('en-IN')}
            </div>
            <p style="margin-top: 20px;">We look forward to seeing you at the museum!</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

// @desc    Send booking confirmation email with PDF attachment
// @param   {string} userEmail - User's email address
// @param   {Object} bookingData - Booking information
// @param   {string} pdfPath - Path to the PDF file to attach
export const sendTicketEmail = async (userEmail, bookingData, pdfPath) => {
  const transporter = getTransporter();
  
  if (!transporter) {
    console.warn('⚠️  Email credentials not configured. Skipping email send.');
    return { success: false, error: 'Email service not configured' };
  }

  const fs = await import('fs');
  const path = await import('path');

  const { museumName, date, ticketCount, amount, bookingId, userName } = bookingData;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Your Museum Ticket Confirmation',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .detail-row { margin: 15px 0; padding: 10px; background: white; border-radius: 5px; }
          .detail-label { font-weight: bold; color: #667eea; }
          .booking-id { font-size: 24px; font-weight: bold; color: #764ba2; text-align: center; margin: 20px 0; }
          .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎫 Your Museum Ticket</h1>
          </div>
          <div class="content">
            <p>Dear ${userName},</p>
            <p>Thank you for booking with us! Your ticket is attached to this email.</p>
            <div class="booking-id">${bookingId}</div>
            <div class="detail-row">
              <span class="detail-label">Museum:</span> ${museumName}
            </div>
            <div class="detail-row">
              <span class="detail-label">Date:</span> ${new Date(date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div class="detail-row">
              <span class="detail-label">Number of Tickets:</span> ${ticketCount}
            </div>
            <div class="detail-row">
              <span class="detail-label">Total Amount:</span> ₹${amount.toLocaleString('en-IN')}
            </div>
            <p style="margin-top: 20px;">Please find your ticket PDF attached. Present it at the museum entrance.</p>
            <div class="footer">
              <p>We look forward to seeing you at the museum!</p>
              <p>For any queries, please contact our support team.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    attachments: [
      {
        filename: `ticket-${bookingId}.pdf`,
        path: pdfPath,
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

export const sendSupportTicketConfirmation = async (email, ticketData) => {
  const transporter = getTransporter();
  
  if (!transporter) {
    console.warn('⚠️  Email credentials not configured. Skipping email send.');
    return { success: false, error: 'Email service not configured' };
  }
  
  const { ticketId, name, issueType, description } = ticketData;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Support Ticket Created - ${ticketId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .detail-row { margin: 15px 0; padding: 10px; background: white; border-radius: 5px; }
          .detail-label { font-weight: bold; color: #f5576c; }
          .ticket-id { font-size: 24px; font-weight: bold; color: #f5576c; text-align: center; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎫 Support Ticket Created</h1>
          </div>
          <div class="content">
            <p>Hello ${name},</p>
            <p>Your support ticket has been created successfully.</p>
            <div class="ticket-id">${ticketId}</div>
            <div class="detail-row">
              <span class="detail-label">Issue Type:</span> ${issueType}
            </div>
            <div class="detail-row">
              <span class="detail-label">Description:</span> ${description}
            </div>
            <p style="margin-top: 20px;">Our team will review your ticket and get back to you soon.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

