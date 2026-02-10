'use client';

import dynamic from 'next/dynamic';

export const RichTextEditor = dynamic(
  () => import('@/components/RichTextEditor').then((m) => m.RichTextEditor),
  { ssr: false }
);
