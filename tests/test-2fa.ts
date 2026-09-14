async function testPhone2FA() {
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ badgeId: 'FEX-1024', password: '{123FORIS@' }),
  });
  const loginData = await loginRes.json();
  console.log('1. Login Success:', loginData.user?.name);

  const token = loginData.token;

  const otpRes = await fetch('http://localhost:5000/api/auth/send-2fa-otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  const otpData = await otpRes.json();
  console.log('2. SMS OTP Dispatched To:', otpData.phoneNumber, 'Code:', otpData.demoOtp);

  const verifyRes = await fetch('http://localhost:5000/api/auth/verify-2fa-otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ otp: otpData.demoOtp }),
  });
  const verifyData = await verifyRes.json();
  console.log('3. Verification Result:', verifyData);
}

testPhone2FA();
