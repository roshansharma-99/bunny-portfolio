import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "No messages or transcript provided for summary" },
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

    // Compile stylized HTML table block layout
    const tableRows = messages
      .map((m: any) => {
        const senderColor = m.sender === "user" ? "#22d3ee" : "#a855f7";
        const senderName = m.sender === "user" ? "Recruiter" : "Bunny AI";
        const timeStr = m.timestamp
          ? new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "N/A";
        return `
          <tr style="border-bottom: 1px solid #27272a;">
            <td style="padding: 12px 10px; color: ${senderColor}; font-weight: bold; vertical-align: top; font-family: monospace;">${senderName}</td>
            <td style="padding: 12px 10px; color: #e4e4e7; line-height: 1.5; vertical-align: top; white-space: pre-line;">${m.text}</td>
            <td style="padding: 12px 10px; color: #71717a; font-size: 12px; vertical-align: top; font-family: monospace;">${timeStr}</td>
          </tr>
        `;
      })
      .join("");

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 650px; margin: 0 auto; padding: 25px; border: 1px solid #27272a; border-radius: 12px; background-color: #09090b; color: #f4f4f5;">
        <h2 style="color: #a855f7; border-bottom: 2px solid #a855f7; padding-bottom: 12px; margin-top: 0; font-weight: 800; tracking: tight;">🚀 New Recruiter Lead: Chat Intelligence Breakdown</h2>
        <p style="font-size: 15px; color: #a1a1aa; line-height: 1.6; margin-bottom: 20px;">An active recruiter has completed a session with the Bunny AI Chat representative. Below is the full conversation transcript for your review:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
          <thead>
            <tr style="background-color: #18181b; border-bottom: 2px solid #27272a;">
              <th style="padding: 12px 10px; text-align: left; color: #a855f7; font-weight: 700; width: 100px;">Sender</th>
              <th style="padding: 12px 10px; text-align: left; color: #a855f7; font-weight: 700;">Message</th>
              <th style="padding: 12px 10px; text-align: left; color: #a855f7; font-weight: 700; width: 80px;">Time</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        
        <p style="margin-top: 30px; font-size: 11px; color: #52525b; border-top: 1px solid #27272a; padding-top: 20px; text-align: center; font-style: italic;">
          This chat session summary was dispatched autonomously via Resend API integration.
        </p>
      </div>
    `;

    // Try sending from portfolio@yourdomain.com first as requested
    let { data, error } = await resend.emails.send({
      from: "portfolio@yourdomain.com",
      to: "roshansharma12001@gmail.com",
      subject: "🚀 New Recruiter Lead: Chat Intelligence Breakdown",
      html: htmlContent,
    });

    // Fall back to onboarding@resend.dev if domain verification fails (sandbox mode fallback)
    if (error) {
      console.warn(
        "Failed to send email from portfolio@yourdomain.com (possibly unverified domain). Retrying with onboarding@resend.dev fallback. Error details:",
        error
      );
      const fallbackResult = await resend.emails.send({
        from: "onboarding@resend.dev",
        to: "roshansharma12001@gmail.com",
        subject: "🚀 New Recruiter Lead: Chat Intelligence Breakdown",
        html: htmlContent,
      });
      data = fallbackResult.data;
      error = fallbackResult.error;
    }

    if (error) {
      return NextResponse.json(
        { error: `Resend error: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Error in chat summary route:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
