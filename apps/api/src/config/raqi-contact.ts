import { ConfigService } from '@nestjs/config';

export const raqiContact = (config: ConfigService) => ({
  email: config.get<string>('RAQI_CONTACT_EMAIL') || 'raqiofficial.bd@gmail.com',
  facebookUrl: config.get<string>('RAQI_FACEBOOK_URL') || 'https://www.facebook.com/raqiofficial.bd',
  instagramUrl: config.get<string>('RAQI_INSTAGRAM_URL') || 'https://www.instagram.com/raqiofficial.bd',
});

export const compactSocialUrl = (value: string) => value.replace(/^https?:\/\/(?:www\.)?/, '').replace(/\/$/, '');
