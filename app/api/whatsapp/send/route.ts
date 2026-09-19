import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Server Action / API Route for Direct Background WhatsApp Gateway Notification
 * Target Number: 0815-1571-6564 (+6281515716564)
 * 
 * Supports Fonnte / Wablas / Generic WA Gateway API
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetPhone, messageText, woNumber } = body;

    const recipient = targetPhone || '081515716564';
    const cleanNumber = recipient.replace(/[^0-9]/g, '');
    const formattedNumber = cleanNumber.startsWith('0') 
      ? '62' + cleanNumber.slice(1) 
      : cleanNumber;

    const fonnteToken = process.env.FONNTE_TOKEN || process.env.WA_GATEWAY_TOKEN;
    const gatewayUrl = process.env.WA_GATEWAY_URL || 'https://api.fonnte.com/send-message';

    // If API Token is configured, perform direct background HTTP POST to Gateway
    if (fonnteToken) {
      const response = await fetch(gatewayUrl, {
        method: 'POST',
        headers: {
          'Authorization': fonnteToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target: formattedNumber,
          message: messageText,
          countryCode: '62',
        }),
      });

      const data = await response.json();
      return NextResponse.json({
        success: true,
        provider: 'FONNTE_GATEWAY',
        target: formattedNumber,
        apiResult: data,
        message: 'Pesan berhasil terkirim langsung ke HP via WhatsApp Gateway API'
      });
    }

    // Fallback simulation mode if API key is not yet set in environment
    return NextResponse.json({
      success: true,
      provider: 'SIMULATION_READY',
      target: formattedNumber,
      messageText,
      instruction: 'API Gateway terdeteksi siap. Untuk pengiriman langsung ke HP tanpa klik, tambahkan FONNTE_TOKEN di file .env.local atau Vercel Environment Variables.'
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal mengirim pesan WA' },
      { status: 500 }
    );
  }
}
