import QRCode from 'qrcode';

export async function generateLocalNetworkQR() {
  try {
    // Get local IP addresses
    const response = await fetch('http://localhost:5173/api/network');
    const { addresses } = await response.json();
    
    // Generate QR code for each address
    const qrCodes = await Promise.all(
      addresses.map(async (address: string) => {
        const url = `http://${address}:5173`;
        const qrDataUrl = await QRCode.toDataURL(url, {
          width: 300,
          margin: 2,
        });
        return { url, qrDataUrl };
      })
    );
    
    return qrCodes;
  } catch (error) {
    console.error('Error generating network QR codes:', error);
    return [];
  }
}