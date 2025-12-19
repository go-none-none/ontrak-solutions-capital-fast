html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Received – Now Under Review</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    
                    <!-- Header with Logo -->
                    <tr>
                        <td style="background: #ffffff; padding: 30px 30px 20px 30px; text-align: center; border-bottom: 1px solid #e2e8f0;">
                            <a href="https://ontrak.co" style="display: inline-block;">
                                <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6932157da76cc7fc545d1203/38ae07730_customcolor_logo_transparent_background2.png" alt="OnTrak Solutions" style="height: 80px; width: auto; display: block;">
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td style="background: linear-gradient(135deg, #08708E 0%, #065a72 50%, #1e293b 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0; line-height: 1.3;">Application Received</h1>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="color: #0f172a; font-size: 18px; margin: 0 0 20px 0; font-weight: 600;">Hi {!Opportunity.Contact.FirstName},</p>
                            
                            <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                I've got your application right here, and I'm reviewing it now with our team. You'll hear from me with an update very soon!
                            </p>

                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f9ff; border-left: 4px solid #08708E; border-radius: 8px; margin: 30px 0;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <p style="color: #08708E; font-size: 14px; font-weight: 600; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">✓ Next Steps</p>
                                        <p style="color: #0f172a; font-size: 15px; margin: 0;">Our team is carefully reviewing your application. You'll hear from us within 24-48 hours.</p>
                                    </td>
                                </tr>
                            </table>

                            <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                You can check your application status anytime using the link below.
                            </p>

                            <!-- CTA Buttons -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 10px 0;">
                                        <a href="https://ontrak.co/Status?rid={!Opportunity.Id}" style="display: inline-block; background: linear-gradient(to right, #08708E, #065a72); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 30px; box-shadow: 0 4px 6px rgba(8, 112, 142, 0.2); margin: 5px;">
                                            Check Application Status
                                        </a>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding: 10px 0;">
                                        <a href="https://ontrak.co/Contact" style="display: inline-block; background-color: #ffffff; color: #08708E; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 30px; border: 2px solid #08708E; margin: 5px;">
                                            Contact Us
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">

                            <p style="color: #64748b; font-size: 15px; line-height: 1.6; margin: 0;">
                                <strong style="color: #0f172a;">Questions?</strong><br>
                                Contact me directly at <a href="tel:{!Owner.Phone}" style="color: #08708E; text-decoration: none; font-weight: 600;">{!Owner.Phone}</a> or reply to this email.
                            </p>
                        </td>
                    </tr>

                    <!-- Navigation Links -->
                    <tr>
                        <td style="background-color: #ffffff; padding: 20px 30px; border-top: 1px solid #e2e8f0;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <table cellpadding="0" cellspacing="0" style="display: inline-block;">
                                            <tr>
                                                <td style="padding: 0 10px;">
                                                   <a href="https://ontrak.co/Status?rid={!Opportunity.Id}" style="color: #64748b; text-decoration: none; font-size: 14px; font-weight: 500;">Check Status</a>
                                                </td>
                                                <td style="padding: 0 10px; color: #e2e8f0;">|</td>
                                                <td style="padding: 0 10px;">
                                                   <a href="https://ontrak.co/FAQ" style="color: #64748b; text-decoration: none; font-size: 14px; font-weight: 500;">FAQ</a>
                                                </td>
                                                <td style="padding: 0 10px; color: #e2e8f0;">|</td>
                                                <td style="padding: 0 10px;">
                                                   <a href="https://ontrak.co/Contact" style="color: #64748b; text-decoration: none; font-size: 14px; font-weight: 500;">Contact</a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="color: #0f172a; font-size: 16px; font-weight: 600; margin: 0 0 4px 0;">Best regards,</p>
                            <p style="color: #0f172a; font-size: 16px; font-weight: 600; margin: 0 0 4px 0;">{!Owner.Name}</p>
                            <p style="color: #64748b; font-size: 14px; margin: 0 0 15px 0;">Funding Specialist | OnTrak Solutions</p>
                            <p style="color: #64748b; font-size: 14px; margin: 0 0 8px 0;">
                                Direct: <a href="tel:{!Owner.Phone}" style="color: #08708E; text-decoration: none;">{!Owner.Phone}</a><br>
                                Email: <a href="mailto:{!Owner.Email}" style="color: #08708E; text-decoration: none;">{!Owner.Email}</a>
                            </p>
                            <p style="color: #94a3b8; font-size: 12px; margin: 15px 0 0 0; line-height: 1.6;">
                                © 2024 OnTrak Solutions LLC. All rights reserved.<br>
                                <a href="https://ontrak.co/PrivacyPolicy" style="color: #94a3b8; text-decoration: underline;">Privacy Policy</a> • 
                                <a href="https://ontrak.co/TermsOfService" style="color: #94a3b8; text-decoration: underline;">Terms of Service</a>
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>