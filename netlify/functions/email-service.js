require('dotenv').config();
const nodemailer = require('nodemailer');

const sendVerificationEmail = async (email, code) => {
    console.log(`[Email Service] Attempting to send verification code ${code} to ${email}`);

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('[Email Service] WARNING: SMTP_USER or SMTP_PASS not found. Using MOCK mode.');
        console.log('**************************************************');
        console.log(`VERIFICATION CODE FOR ${email}: ${code}`);
        console.log('**************************************************');
        return true;
    }

    const smtpConfig = process.env.SMTP_HOST
        ? {
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        }
        : {
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        };

    const transporter = nodemailer.createTransport(smtpConfig);

    const mailOptions = {
        from: `"Aldea AI" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Aldea AI: Электрондық поштаны растау коды',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; rounded: 12px;">
                <h2 style="color: #2563eb; text-align: center;">Aldea AI</h2>
                <p style="font-size: 16px; color: #374151;">Сәлеметсіз бе!</p>
                <p style="font-size: 16px; color: #374151;">Төмендегі 6 таңбалы кодты пайдаланып, тіркелгіңізді растаңыз:</p>
                <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111827;">${code}</span>
                </div>
                <p style="font-size: 14px; color: #6b7280; text-align: center;">Егер сіз бұл тіркелгіні жасамаған болсаңыз, осы электрондық хатты елемеңіз.</p>
                <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                <p style="font-size: 12px; color: #9ca3af; text-align: center;">© 2026 Aldea Academy. Барлық құқықтар қорғалған.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Message sent to ${email}`);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

module.exports = { sendVerificationEmail };
