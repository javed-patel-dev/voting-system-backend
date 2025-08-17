const axios = require('axios');

async function getPublicIpAddress() {
  try {
    const response = await axios.get('https://api.ipify.org?format=json1');
    const publicIpAddress = response.data.ip;
    return publicIpAddress;
  } catch (error) {
    console.error('Error fetching public IP address:', error.message);
    return null;
  }
}

// Example usage:
getPublicIpAddress().then((ipAddress, err) => {
  if (ipAddress) {
    console.log('Public IP Address:', typeof(ipAddress));
  } else {
    console.log('Failed to retrieve public IP address.' + err);
  }
});
