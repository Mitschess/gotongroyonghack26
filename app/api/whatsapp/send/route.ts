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

    const recipient = targetPhone || '081916323073';
    const cleanNumber = recipient.replace(/[^0-9]/g, '');
    const formattedNumber = cleanNumber.startsWith('0') 
      ? '62' + cleanNumber.slice(1) 
      : cleanNumber;

    const fonnteToken = process.env.FONNTE_TOKEN || process.env.WA_GATEWAY_TOKEN;
    const gatewayUrl = process.env.WA_GATEWAY_URL || 'https://api.fonnte.com/send';

    // If API Token is configured, perform direct background HTTP POST to Gateway
    if (fonnteToken) {
      console.log(`[WA GATEWAY] Sending notification to ${formattedNumber} via Fonnte...`);

      // Fonnte accepts FormData natively
      const formData = new FormData();
      formData.append('target', formattedNumber);
      formData.append('message', messageText);
      formData.append('countryCode', '62');

      const response = await fetch(gatewayUrl, {
        method: 'POST',
        headers: {
          'Authorization': fonnteToken.trim(),
        },
        body: formData,
      });

      const data = await response.json();
      console.log('[WA GATEWAY RESPONSE]', data);

      const isSuccess = data?.status === true || data?.status === 'true';

      return NextResponse.json({
        success: isSuccess,
        provider: 'FONNTE_GATEWAY',
        target: formattedNumber,
        apiResult: data,
        message: isSuccess 
          ? 'Pesan berhasil terkirim langsung ke HP via WhatsApp Gateway API'
          : `Gagal dari Fonnte Gateway: ${data?.reason || data?.message || JSON.stringify(data)}`
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
