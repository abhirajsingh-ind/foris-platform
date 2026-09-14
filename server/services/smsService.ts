interface SendSmsParams {
  phoneNumber: string;
  otp: string;
  officerName: string;
  badgeId: string;
  ipAddress?: string;
}

export async function sendSmsOtp({
  phoneNumber,
  otp,
  officerName,
  badgeId,
  ipAddress = '127.0.0.1',
}: SendSmsParams): Promise<{ delivered: boolean; mode: 'gateway' | 'simulated'; messageId?: string }> {
  const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91 ${phoneNumber}`;

  console.log('\n======================================================');
  console.log('📱 [FORIS SECURE SMS GATEWAY DISPATCH]');
  console.log(`📞 Recipient Mobile  : ${formattedPhone}`);
  console.log(`👤 Officer           : ${officerName} (${badgeId})`);
  console.log(`🔑 6-Digit SMS OTP   : ${otp}`);
  console.log(`💬 Message Content   : <#> FORIS SFSL Security: Your 2-Step verification code for ${officerName} is ${otp}. Valid for 5 minutes. Do not share. /foris.gov.in`);
  console.log(`⏰ Valid Until       : 5 Minutes (Expires at ${new Date(Date.now() + 5 * 60 * 1000).toLocaleTimeString()})`);
  console.log('======================================================\n');

  // Optional: If FAST2SMS_API_KEY or TWILIO credentials are provided in .env
  const fast2SmsKey = process.env.FAST2SMS_API_KEY;
  if (fast2SmsKey && fast2SmsKey.trim() !== '') {
    try {
      const cleanNumber = phoneNumber.replace(/[^0-9]/g, '').slice(-10);
      const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': fast2SmsKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otp,
          numbers: cleanNumber,
        }),
      });
      const data = await res.json();
      console.log('[SMS GATEWAY] Fast2SMS Response:', data);
      return { delivered: true, mode: 'gateway', messageId: data.request_id };
    } catch (err: any) {
      console.error('[SMS GATEWAY ERROR] Fast2SMS dispatch failed:', err.message);
    }
  }

  return { delivered: true, mode: 'simulated' };
}
