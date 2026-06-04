import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: Request) {
  try {
    const { name, email, selectedDate, selectedTime } = await request.json();

    if (!name || !email || !selectedDate || !selectedTime) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Resend API key is not configured" },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);

    const emailResponse = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "roshansharma12001@gmail.com",
      subject: "📅 New Portfolio Interview Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #6d28d9; border-bottom: 2px solid #6d28d9; padding-bottom: 10px; margin-top: 0;">📅 New Interview Request Secured</h2>
          <p style="font-size: 15px; color: #333; line-height: 1.5;">You have received a new software engineering interview request from your portfolio website:</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tbody>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #666; width: 120px; border-bottom: 1px solid #f0f0f0;">Name:</td>
                <td style="padding: 8px 0; color: #111; border-bottom: 1px solid #f0f0f0;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #666; border-bottom: 1px solid #f0f0f0;">Email:</td>
                <td style="padding: 8px 0; color: #111; border-bottom: 1px solid #f0f0f0;"><a href="mailto:${email}" style="color: #6d28d9; text-decoration: none;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #666; border-bottom: 1px solid #f0f0f0;">Scheduled Date:</td>
                <td style="padding: 8px 0; color: #6d28d9; font-weight: bold; border-bottom: 1px solid #f0f0f0;">June ${selectedDate}, 2026</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #666; border-bottom: 1px solid #f0f0f0;">Selected Time:</td>
                <td style="padding: 8px 0; color: #6d28d9; font-weight: bold; border-bottom: 1px solid #f0f0f0;">${selectedTime}</td>
              </tr>
            </tbody>
          </table>
          <p style="margin-top: 25px; font-size: 11px; color: #888; border-top: 1px solid #eee; padding-top: 15px; text-align: center; font-style: italic;">
            This email was dispatched autonomously via Resend API integration.
          </p>
        </div>
      `
    });

    if (emailResponse.error) {
      return NextResponse.json(
        { error: emailResponse.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: emailResponse.data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
