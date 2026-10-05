import { NextRequest, NextResponse } from "next/server";
import midtransClient from "midtrans-client";
import { getDb } from "@/lib/db";
import { type DbBookingEnriched, mapBooking } from "@/lib/mappers";

export async function POST(req: NextRequest) {
  let body: { bookingId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { bookingId } = body;
  if (!bookingId) {
    return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
  }

  const db = getDb();
  const rawBooking = db
    .prepare(
      `SELECT b.*, d.title AS destination_title, t.start_date, t.end_date, t.year
       FROM bookings b
       JOIN destinations d ON b.destination_id = d.id
       JOIN open_trips t ON b.trip_id = t.id
       WHERE b.id = ?`
    )
    .get(bookingId) as DbBookingEnriched | undefined;

  if (!rawBooking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const booking = mapBooking(rawBooking);

  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;

  if (!serverKey || !clientKey) {
    console.log(
      `[Midtrans Mock] Returning mock Snap transaction token for booking ${bookingId}`
    );
    return NextResponse.json({
      token: `MOCK-SNAP-TOKEN-${bookingId}`,
      redirectUrl: `http://localhost:3000/book/${booking.destinationId}?success=true&bookingId=${bookingId}`,
      isMock: true,
    });
  }

  try {
    const snap = new midtransClient.Snap({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
      serverKey: serverKey,
      clientKey: clientKey,
    });

    const parameter = {
      transaction_details: {
        order_id: booking.id,
        gross_amount: booking.totalPrice,
      },
      customer_details: {
        first_name: booking.fullName,
        email: booking.email,
        phone: booking.whatsapp,
      },
      item_details: [
        {
          id: booking.destinationId,
          price: booking.totalPrice / booking.seats,
          quantity: booking.seats,
          name: booking.destinationTitle,
        },
      ],
    };

    const transaction = await snap.createTransaction(parameter);

    return NextResponse.json({
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
      isMock: false,
    });
  } catch (error) {
    console.error("Midtrans transaction creation error:", error);
    return NextResponse.json(
      { error: "Failed to initialize payment transaction" },
      { status: 500 }
    );
  }
}
