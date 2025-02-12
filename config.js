// config.js
module.exports = {
  allowedOrigins: [
    //'https://your-allowed-origin1.com',
    //'https://your-allowed-origin2.com'
    // 'https://another-allowed-origin.com' // Temporarily commented out
  ],
  disallowedOrigins: [
    'https://your-disallowed-origin1.com',
    'https://your-disallowed-origin2.com'
  ],
  allowedDestinations: [
    //'https://www.google.com',
    'https://www.example.com'
  ],
  disallowedDestinations: [
    'https://www.disallowed-destination.com',
    'https://www.malicious-site.com',
    //'https://www.google.com',
  ]
};
