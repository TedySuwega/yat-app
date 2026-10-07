/**
 * WhatsApp Automation using Fonnte API (https://fonnte.com)
 *
 * For Indonesia open-trip notifications without needing complex WhatsApp Business API setup.
 * Supports automated triggers on admin ping & booking confirmation.
 * Gracefully runs in mock mode when FONNTE_TOKEN is not configured.
 */

export interface WhatsAppSendParams {
  to: string;
  message: string;
}

export interface WhatsAppResult {
  success: boolean;
  message: string;
  isMock: boolean;
  rawResponse?: unknown;
}

export interface BookingWhatsAppDetails {
  id: string;
  fullName: string;
  destinationTitle: string;
  tripDates: string;
  seats: number;
  vibe: string;
  totalPrice: number;
  whatsapp: string;
}

export function buildBookingWhatsAppMessage(booking: BookingWhatsAppDetails): string {
  return (
    `🌴 *YoloTrips — Konfirmasi Registrasi Trip* 🌴\n\n` +
    `Halo *${booking.fullName}*! 👋\n` +
    `Registrasi kamu untuk open trip ke *${booking.destinationTitle}* (${booking.tripDates}) sudah kami terima dan terkonfirmasi!\n\n` +
    `📋 *Kode Booking*: ${booking.id}\n` +
    `🎟️ *Jumlah Kursi*: ${booking.seats} pax\n` +
    `✨ *Travel Vibe*: ${booking.vibe}\n` +
    `💵 *Total Pembayaran*: $${booking.totalPrice}\n\n` +
    `Siapkan barang bawaanmu sesuai checklist di web ya! Tim trip leader akan mengundang kamu ke WhatsApp Group koordinasi H-3 sebelum keberangkatan.\n\n` +
    `Ada pertanyaan atau mau request khusus? Cukup balas chat ini. YOLO! 🚀🏝️`
  );
}

export async function sendWhatsAppMessage({
  to,
  message,
}: WhatsAppSendParams): Promise<WhatsAppResult> {
  const token = process.env.FONNTE_TOKEN || process.env.FONNTE_API_KEY;
  // Clean phone number (strip whitespace, dashes, plus)
  let cleanPhone = to.replace(/\D/g, "");

  // If local Indonesian format starting with 08..., convert to 628...
  if (cleanPhone.startsWith("08")) {
    cleanPhone = "62" + cleanPhone.slice(1);
  }

  // Fallback / mock mode when token is absent or default
  if (!token || token === "your-fonnte-token-here" || token.startsWith("mock_")) {
    console.log("-----------------------------------------------------------------");
    console.log(`📱 [FONNTE MOCK] WhatsApp Simulated Notification to +${cleanPhone}`);
    console.log(message);
    console.log("-----------------------------------------------------------------");

    return {
      success: true,
      isMock: true,
      message: `[MOCK] WhatsApp notification successfully simulated to +${cleanPhone}`,
    };
  }

  try {
    const response = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        target: cleanPhone,
        message: message,
        countryCode: "62",
      }),
    });

    const data = await response.json();

    if (!response.ok || data.status === false) {
      console.warn("[FONNTE WARN] Fonnte API error response:", data);
      return {
        success: false,
        isMock: false,
        message: data.reason || data.message || "Failed to send WhatsApp message via Fonnte",
        rawResponse: data,
      };
    }

    return {
      success: true,
      isMock: false,
      message: `WhatsApp message sent via Fonnte to +${cleanPhone}`,
      rawResponse: data,
    };
  } catch (error: any) {
    console.error("[FONNTE ERROR] Network error contacting Fonnte API:", error);
    return {
      success: false,
      isMock: false,
      message: error?.message || "Network error contacting Fonnte WhatsApp API",
    };
  }
}

export async function sendBookingWhatsAppNotification(
  booking: BookingWhatsAppDetails
): Promise<WhatsAppResult> {
  const message = buildBookingWhatsAppMessage(booking);
  return sendWhatsAppMessage({
    to: booking.whatsapp,
    message,
  });
}
