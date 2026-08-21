export const raqiContact = {
  email: process.env.RAQI_CONTACT_EMAIL?.trim() || 'raqiofficial.bd@gmail.com',
  phone: process.env.RAQI_CONTACT_PHONE?.trim() || '+8801581-733912',
  facebookUrl: process.env.RAQI_FACEBOOK_URL?.trim() || 'https://www.facebook.com/raqiofficial.bd',
  instagramUrl: process.env.RAQI_INSTAGRAM_URL?.trim() || 'https://www.instagram.com/raqiofficial.bd',
} as const;
