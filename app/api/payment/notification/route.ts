import { NextRequest, NextResponse } from "next/server";
import midtransClient from "midtrans-client";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  let notificationJson: any;
  try {
    notificationJson = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;

  if (serverKey && clientKey) {
    try {
      const snap = new midtransClient.Snap({
        isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
        serverKey: serverKey,
        clientKey: clientKey,
      });

      const statusResponse = await snap.transaction.notification(notificationJson);
      const orderId = statusResponse.order_id;
      const transactionStatus = statusResponse.transaction_status;
      const fraudStatus = statusResponse.fraud_status;

      const db = getDb();

      if (transactionStatus === "capture" || transactionStatus === "settlement") {
        if (fraudStatus === "accept" || !fraudStatus) {
          db.prepare("UPDATE bookings SET status = 'confirmed', payment_ref = ? WHERE id = ?").run(
            statusResponse.transaction_id || "MIDTRANS-SETTLED",
            orderId
          );
        }
      } else if (
        transactionStatus === "cancel" ||
        transactionStatus === "deny" ||
        transactionStatus === "expire"
      ) {
        db.prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ?").run(orderId);
      }

      return NextResponse.json({ status: "OK" });
    } catch (e) {
      console.error("Midtrans webhook error:", e);
      return NextResponse.json({ error: "Notification processing failed" }, { status: 500 });
    }
  }

  // Fallback Mock Webhook
  const { orderId, status } = notificationJson;
  if (orderId) {
    const db = getDb();
    const targetStatus = status === "failed" ? "cancelled" : "confirmed";
    db.prepare("UPDATE bookings SET status = ?, payment_ref = ? WHERE id = ?").run(
      targetStatus,
      `MOCK-REF-${Date.now()}`,
      orderId
    );
    return NextResponse.json({ status: "OK", mocked: true });
  }

  return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
}
