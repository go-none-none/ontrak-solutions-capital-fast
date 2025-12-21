<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Application is Still Available</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    
                    <tr>
                        <td style="background: linear-gradient(135deg, #08708E 0%, #065a72 50%, #1e293b 100%); padding: 40px 30px; text-align: center;">
                            <a href="https://ontrak.co" style="display: inline-block;">
                                <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6932157da76cc7fc545d1203/38ae07730_customcolor_logo_transparent_background2.png" alt="OnTrak Solutions" style="height: 80px; width: auto; margin-bottom: 20px; display: block; filter: brightness(0) invert(1);">
                            </a>
                            <h1 style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0; line-height: 1.3;">Checking In</h1>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="color: #0f172a; font-size: 18px; margin: 0 0 20px 0; font-weight: 600;">Hi {!Lead.FirstName},</p>
                            
                            <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                I wanted to check in one more time. Your application is still available, and I'm here to help if you need anything.
                            </p>

                            <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                If now isn't the right time, I completely understand. Just let me know, and I'll follow up when it works better for you.
                            </p>

                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 10px 0;">
                                        <a href="https://ontrak.co/application/?rep={!Owner.Alias}&rid={!Lead.Id}" style="display: inline-block; background: linear-gradient(to right, #08708E, #065a72); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 30px; box-shadow: 0 4px 6px rgba(8, 112, 142, 0.2);">
                                            Complete Application
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">

                            <p style="color: #64748b; font-size: 15px; line-height: 1.6; margin: 0;">
                                <strong style="color: #0f172a;">Reach out anytime:</strong><br>
                                <a href="tel:{!Owner.Phone}" style="color: #08708E; text-decoration: none; font-weight: 600;">{!Owner.Phone}</a> | <a href="mailto:{!Owner.Email}" style="color: #08708E; text-decoration: none;">{!Owner.Email}</a>
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="color: #0f172a; font-size: 16px; font-weight: 600; margin: 0 0 4px 0;">Best regards,</p>
                            <p style="color: #0f172a; font-size: 16px; font-weight: 600; margin: 0 0 4px 0;">{!Owner.Name}</p>
                            <p style="color: #64748b; font-size: 14px; margin: 0 0 15px 0;">Funding Specialist | OnTrak Solutions</p>
                            <p style="color: #94a3b8; font-size: 12px; margin: 15px 0 0 0; line-height: 1.6;">
                                © 2025 OnTrak Solutions LLC. All rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>