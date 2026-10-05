import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export interface BookingEmailData {
  bookingId: string;
  fullName: string;
  email: string;
  destinationTitle: string;
  seats: number;
  totalPrice: number;
  startDate?: string;
  endDate?: string;
}

export async function sendBookingConfirmationEmail(data: BookingEmailData) {
  if (!resend) {
    console.log(
      `[Email Mock] Skipping email dispatch for ${data.bookingId} (RESEND_API_KEY not set)`
    );
    return { success: true, mocked: true };
  }

  try {
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || "YoloTrips <onboarding@resend.dev>",
      to: [data.email],
      subject: `🎉 Booking Confirmed! Ticket: ${data.bookingId}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 12px;">
          <h2 style="color: #ff3366;">You're going to ${data.destinationTitle}! 🌴</h2>
          <p>Hi <strong>${data.fullName}</strong>,</p>
          <p>Your booking has been successfully confirmed. Get ready for an epic adventure!</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Ticket ID:</strong> ${data.bookingId}</p>
            <p style="margin: 5px 0;"><strong>Destination:</strong> ${data.destinationTitle}</p>
            <p style="margin: 5px 0;"><strong>Seats:</strong> ${data.seats}</p>
            <p style="margin: 5px 0;"><strong>Total Paid:</strong> IDR ${data.totalPrice.toLocaleString()}</p>
          </div>

          <p style="color: #666; font-size: 14px;">If you have any questions, feel free to contact us on WhatsApp.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999;">YoloTrips - Modern Open Trip Platform</p>
        </div>
      `,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("Error sending booking email:", error);
    return { success: false, error };
  }
}
