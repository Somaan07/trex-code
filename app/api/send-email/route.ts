import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize the email engine using your hidden security key
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { name, phone, email, address, service } = await request.json();

    // Fire the email alert out via Resend
    const data = await resend.emails.send({
      from: 'T-Rex Alerts <alerts@trexcanada.com>', // Free testing domain name
      to: 'info@trexcanada.com', // 👈 Put your email or your mom's email here!
      subject: `🦖 NEW LEAD: ${name} - ${service || 'Window Cleaning'}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #0B1629; max-width: 600px; border: 2px solid #C8882A; rounded: 12px;">
          <h2 style="color: #C8882A; margin-bottom: 20px;">⚡ New Quote Request Received!</h2>
          <p><strong>Customer Name:</strong> ${name}</p>
          <p><strong>Phone Number:</strong> ${phone}</p>
          <p><strong>Email Address:</strong> ${email}</p>
          <p><strong>Property Address:</strong> ${address}</p>
          <p><strong>Service Requested:</strong> ${service || 'Window Cleaning'}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">This lead was captured automatically and saved securely to your Supabase database.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Failed to send email alert:", error);
    return NextResponse.json({ success: false, error: 'Failed to dispatch email notification' }, { status: 500 });
  }
}