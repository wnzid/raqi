export const raqiContact = {
  email: process.env.RAQI_CONTACT_EMAIL?.trim() || 'raqiofficial.bd@gmail.com',
  facebookUrl: process.env.RAQI_FACEBOOK_URL?.trim() || 'https://www.facebook.com/raqiofficial.bd',
  instagramUrl: process.env.RAQI_INSTAGRAM_URL?.trim() || 'https://www.instagram.com/raqiofficial.bd',
} as const;
