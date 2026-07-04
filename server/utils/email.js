const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'ArtVault <onboarding@resend.dev>';

/**
 * Send a welcome email after registration
 */
const sendWelcomeEmail = async (to, name, role) => {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Welcome to ArtVault! 🎨',
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #121212; color: #faf8f5; padding: 40px; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-family: 'Playfair Display', serif; font-size: 32px; color: #c9a84c; margin: 0;">ArtVault</h1>
            <p style="color: #888; margin-top: 8px;">Digital Art Marketplace</p>
          </div>
          <h2 style="font-size: 24px; margin-bottom: 16px;">Welcome, ${name}! 👋</h2>
          <p style="color: #ccc; line-height: 1.6;">
            Your account has been created as <strong style="color: #c9a84c;">${role}</strong>.
            ${role === 'artist'
              ? 'Start uploading your artwork and reach collectors worldwide.'
              : 'Explore our curated gallery and discover unique digital art.'}
          </p>
          <div style="text-align: center; margin-top: 32px;">
            <a href="${role === 'artist' ? `${process.env.CLIENT_URL}/dashboard/artist` : `${process.env.CLIENT_URL}/marketplace`}" style="display: inline-block; background: #c9a84c; color: #121212; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600;">
              ${role === 'artist' ? 'Go to Studio' : 'Browse Gallery'}
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #2e2e2e; margin: 32px 0;" />
          <p style="color: #666; font-size: 12px; text-align: center;">© ArtVault. All rights reserved.</p>
        </div>
      `,
    });
    console.log(`Welcome email sent to ${to}`);
  } catch (err) {
    console.error('Failed to send welcome email:', err.message);
  }
};

/**
 * Send purchase confirmation email to buyer
 */
const sendPurchaseEmail = async (to, buyerName, artworkTitle, amount, certificateId) => {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Purchase Confirmed: ${artworkTitle} 🎉`,
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #121212; color: #faf8f5; padding: 40px; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-family: 'Playfair Display', serif; font-size: 32px; color: #c9a84c; margin: 0;">ArtVault</h1>
          </div>
          <h2 style="font-size: 22px; margin-bottom: 16px;">Purchase Confirmed! 🎉</h2>
          <p style="color: #ccc; line-height: 1.6;">Hi ${buyerName}, your purchase is complete.</p>
          <div style="background: #1e1e1e; border: 1px solid #2e2e2e; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0 0 8px; color: #888; font-size: 12px; text-transform: uppercase;">Artwork</p>
            <p style="margin: 0 0 16px; font-size: 18px; font-weight: 600;">${artworkTitle}</p>
            <p style="margin: 0 0 8px; color: #888; font-size: 12px; text-transform: uppercase;">Amount</p>
            <p style="margin: 0 0 16px; font-size: 18px; color: #c9a84c; font-weight: 600;">₹${Number(amount).toLocaleString('en-IN')}</p>
            <p style="margin: 0 0 8px; color: #888; font-size: 12px; text-transform: uppercase;">Certificate ID</p>
            <p style="margin: 0; font-size: 14px; color: #c9a84c; font-family: monospace;">${certificateId}</p>
          </div>
          <p style="color: #ccc; line-height: 1.6;">
            You can download your artwork and certificate from your <a href="${process.env.CLIENT_URL}/dashboard/buyer" style="color: #c9a84c;">dashboard</a>.
          </p>
          <hr style="border: none; border-top: 1px solid #2e2e2e; margin: 32px 0;" />
          <p style="color: #666; font-size: 12px; text-align: center;">© ArtVault. All rights reserved.</p>
        </div>
      `,
    });
    console.log(`Purchase email sent to ${to}`);
  } catch (err) {
    console.error('Failed to send purchase email:', err.message);
  }
};

/**
 * Send sale notification email to artist
 */
const sendSaleNotificationEmail = async (to, artistName, artworkTitle, amount) => {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `You made a sale! "${artworkTitle}" 💰`,
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #121212; color: #faf8f5; padding: 40px; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-family: 'Playfair Display', serif; font-size: 32px; color: #c9a84c; margin: 0;">ArtVault</h1>
          </div>
          <h2 style="font-size: 22px; margin-bottom: 16px;">New Sale! 💰</h2>
          <p style="color: #ccc; line-height: 1.6;">
            Congratulations ${artistName}! Someone just purchased your artwork.
          </p>
          <div style="background: #1e1e1e; border: 1px solid #2e2e2e; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0 0 8px; color: #888; font-size: 12px; text-transform: uppercase;">Artwork</p>
            <p style="margin: 0 0 16px; font-size: 18px; font-weight: 600;">${artworkTitle}</p>
            <p style="margin: 0 0 8px; color: #888; font-size: 12px; text-transform: uppercase;">You Earned</p>
            <p style="margin: 0; font-size: 24px; color: #c9a84c; font-weight: 700;">₹${Number(amount).toLocaleString('en-IN')}</p>
          </div>
          <div style="text-align: center; margin-top: 24px;">
            <a href="${process.env.CLIENT_URL}/dashboard/artist" style="display: inline-block; background: #c9a84c; color: #121212; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600;">View Dashboard</a>
          </div>
          <hr style="border: none; border-top: 1px solid #2e2e2e; margin: 32px 0;" />
          <p style="color: #666; font-size: 12px; text-align: center;">© ArtVault. All rights reserved.</p>
        </div>
      `,
    });
    console.log(`Sale notification email sent to ${to}`);
  } catch (err) {
    console.error('Failed to send sale notification email:', err.message);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendPurchaseEmail,
  sendSaleNotificationEmail,
};
