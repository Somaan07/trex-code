import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize the email engine using your hidden security key
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { name, phone, email, address, service } = await request.json();

    // 1. Fire the internal email alert out to your parents
    const data = await resend.emails.send({
      from: 'T-Rex Alerts <alerts@trexcanada.com>', 
      to: 'info@trexcanada.com', 
      subject: `🦖 NEW LEAD: ${name} - ${service || 'Window Cleaning'}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #0B1629; max-width: 600px; border: 2px solid #C8882A; border-radius: 12px;">
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

    // 2. Fire the professional confirmation email back to the customer instantly
    if (email) {
      await resend.emails.send({
        from: 'T-Rex Window & Eaves <info@trexcanada.com>',
        to: email, // Sends to whatever email the customer typed into the form box
        subject: `Thank you for contacting T-Rex Window & Eaves Cleaning!`,
        html: `
          <div style="font-family: sans-serif; padding: 30px; color: #0B1629; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #0B1629; margin: 0; font-size: 24px; font-weight: 800;">T-Rex Window & Eaves Cleaning</h1>
              <p style="color: #C8882A; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; font-size: 12px; margin: 5px 0 0 0;">Premium Exterior Maintenance Since 2007</p>
            </div>
            
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            
            <p>Hi <strong>${name}</strong>,</p>
            
            <p>Thank you for reaching out to us! We have successfully received your request for a free estimate, and our team is already reviewing your details.</p>
            
            <div style="background-color: #F4F6FA; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #0B1629; font-size: 14px;">📋 Request Summary:</h3>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Service:</strong> ${service || 'Window Cleaning'}</p>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Property Address:</strong> ${address}</p>
            </div>
            
            <p><strong>What happens next?</strong></p>
            <p>Our office coordinator will review your property details and contact you via phone or email within <strong>one business day</strong> with your customized quote or to arrange a quick assessment visit.</p>
            
            <p>If you have any immediate questions, feel free to give us a call directly at <a href="tel:4165318739" style="color: #1A9E4F; font-weight: bold; text-decoration: none;">416-531-TREX (8739)</a>.</p>
            
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            
            <p style="font-size: 14px; color: #666; margin-bottom: 0;">Best regards,</p>
            <p style="font-weight: bold; color: #0B1629; margin-top: 5px;">The T-Rex Team</p>
            
            <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 30px;">
              © 2026 T-Rex Window & Eaves Cleaning INC. · Fully Insured · Proudly Serving the GTA
            </p>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Failed to send email alert:", error);
    return NextResponse.json({ success: false, error: 'Failed to dispatch email notification' }, { status: 500 });
  }
}