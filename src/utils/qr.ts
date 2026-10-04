import QRCode from 'qrcode';

export function getAssetDeepLink(itemId: string): string {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    return `${origin}${pathname}?asset=${encodeURIComponent(itemId)}`;
  }
  return `https://shutterbuck.local/?asset=${encodeURIComponent(itemId)}`;
}

export async function generateAssetQrDataUrl(itemId: string): Promise<string> {
  const deepLink = getAssetDeepLink(itemId);
  try {
    const dataUrl = await QRCode.toDataURL(deepLink, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate QR code:', err);
    throw err;
  }
}
