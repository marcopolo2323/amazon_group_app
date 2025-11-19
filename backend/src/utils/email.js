const nodemailer = require('nodemailer');

let transporter;
function getTransporter() {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: String(SMTP_SECURE || '').toLowerCase() === 'true',
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  } else {
    transporter = null;
  }
  return transporter;
}

async function sendEmail({ to, subject, text, html }) {
  const t = getTransporter();
  if (!t) {
    console.log('[email:dev] No transporter configured, logging email:', { to, subject, text });
    return false;
  }
  
  try {
    console.log('[email] Attempting to send email to:', to);
    
    // Crear una promesa con timeout
    const emailPromise = t.sendMail({ 
      from: process.env.SMTP_FROM || process.env.SMTP_USER, 
      to, 
      subject, 
      text, 
      html 
    });
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Email timeout after 30 seconds')), 30000);
    });
    
    await Promise.race([emailPromise, timeoutPromise]);
    console.log('[email] Email sent successfully to:', to);
    return true;
  } catch (error) {
    console.error('[email] Failed to send email:', error.message);
    // No lanzar el error, solo loggearlo y devolver false
    return false;
  }
}

module.exports = { sendEmail };