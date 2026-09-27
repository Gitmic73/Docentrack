import React from 'react';
import { Image } from '@/components/ui/image';

const LOGO_URL = 'https://media.base44.com/images/public/6a798d7edb0c85c56a5ec6bd/4d69c4c06_generated_image.png';

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