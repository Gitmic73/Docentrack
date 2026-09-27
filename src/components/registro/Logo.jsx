import React from 'react';
import { Image } from '@/components/ui/image';

const LOGO_URL = 'https://media.base44.com/images/public/6a798d7edb0c85c56a5ec6bd/622dcd048_2f24d86b-9647-47b3-879d-a84bb9db28e9.png';

export default function Logo({ size = 40, className = '' }) {
  return (
    <Image
      src={LOGO_URL}
      alt="Logo DocenTrack"
      fittingType="fit"
      className={`shrink-0 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}