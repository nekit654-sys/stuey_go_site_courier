// Script to call the generate-hash backend function

const url = "https://functions.poehali.dev/367a9d53-4bd8-4e2c-94b2-0b1d114df77a";
const payload = {
  password: "12345678"
};

try {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  console.log(`Status Code: ${response.status}`);
  
  const data = await response.json();
  console.log('Response:', JSON.stringify(data, null, 2));
  
  if (response.ok && data.hash) {
    console.log('\n===================');
    console.log('Generated Hash:');
    console.log(data.hash);
    console.log('===================');
  }
} catch (error) {
  console.error('Error:', error.message);
}
