import { ConfigService } from '@nestjs/config';

export const raqiContact = (config: ConfigService) => ({
  email: config.get<string>('RAQI_CONTACT_EMAIL') || 'raqiofficial.bd@gmail.com',
  phone: config.get<string>('RAQI_CONTACT_PHONE') || '+8801581-733912',
  facebookUrl: config.get<string>('RAQI_FACEBOOK_URL') || 'https://www.facebook.com/raqiofficial.bd',
  instagramUrl: config.get<string>('RAQI_INSTAGRAM_URL') || 'https://www.instagram.com/raqiofficial.bd',
});
