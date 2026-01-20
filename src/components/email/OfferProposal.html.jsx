<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; }
    .email-wrapper { background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #08708E 0%, #065a72 100%); color: white; padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
    .header p { margin: 8px 0 0 0; font-size: 14px; opacity: 0.9; }
    .content { padding: 40px 30px; }
    .greeting { font-size: 16px; margin-bottom: 20px; }
    .message-box { background: #f0f9ff; border-left: 4px solid #08708E; padding: 15px; margin: 20px 0; }
    .offers-section { margin: 30px 0; }
    .offers-section h3 { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #08708E; }
    .offers-table { width: 100%; border-collapse: collapse; }
    .offers-table th { background: #f0f0f0; padding: 12px; text-align: left; font-weight: bold; font-size: 13px; border: 1px solid #e5e7eb; }
    .offers-table td { padding: 12px; border: 1px solid #e5e7eb; font-size: 13px; }
    .offers-table tr:nth-child(even) { background: #fafafa; }
    .cta-section { margin: 30px 0; text-align: center; }
    .cta-button { display: inline-block; background: #08708E; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; }
    .cta-button:hover { background: #065a72; }
    .footer-text { color: #6b7280; font-size: 13px; margin-top: 20px; }
    .divider { border-top: 1px solid #e5e7eb; margin: 20px 0; }
    .footer { background: #f3f4f6; padding: 20px 30px; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="email-wrapper">
      <div class="header">
        <h1>OnTrak Capital</h1>
        <p>Offer Proposal</p>
      </div>
      <div class="content">
        <div class="greeting">Hi {{recipientName}},</div>
        <div class="message-box">
          {{message}}
        </div>
        <div class="offers-section">
          <h3>Your Offers</h3>
          <table class="offers-table">
            <thead>
              <tr>
                <th>Offer</th>
                <th>Lender</th>
                <th>Funded Amount</th>
                <th>Payment Amount</th>
                <th>Term</th>
              </tr>
            </thead>
            <tbody>
              {{offersRows}}
            </tbody>
          </table>
        </div>
        <div class="cta-section">
          <a href="{{pdfLink}}" class="cta-button">View Full Proposal</a>
        </div>
        <div class="footer-text">
          <p>Please review the offers above and let us know if you have any questions. You can download the full proposal using the button above.</p>
        </div>
        <div class="divider"></div>
        <div style="margin-top: 30px;">
          <p>Best regards,<br><strong>{{senderName}}</strong></p>
        </div>
      </div>
      <div class="footer">
        <p>© {{year}} OnTrak Capital. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>