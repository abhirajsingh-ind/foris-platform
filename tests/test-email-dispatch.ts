async function testEmail() {
  try {
    console.log('Testing email delivery to abhirajsingh0904@gmail.com with headers...');
    const response = await fetch('https://formsubmit.co/ajax/abhirajsingh0904@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'https://foris-forensics.gov.in',
        'Referer': 'https://foris-forensics.gov.in/auth',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      body: JSON.stringify({
        _subject: 'FORIS 2-Step Verification Code: 582910',
        _template: 'table',
        Officer: 'Dr. Abhiraj Singh (FEX-1024)',
        OTP_Code: '582910',
        Security_Notice: 'Your FORIS 2-Step Verification code is 582910. Valid for 5 minutes.',
      }),
    });

    const data = await response.json();
    console.log('FormSubmit Response:', data);
  } catch (err: any) {
    console.error('Error:', err.message);
  }
}

testEmail();
