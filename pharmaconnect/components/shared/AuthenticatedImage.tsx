'use client';

import { useEffect, useState } from 'react';
import type { ImgHTMLAttributes } from 'react';
import { getAuthToken } from '@/lib/api';

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & { src: string };

export function AuthenticatedImage({ src, ...props }: Props) {
  const managed = src.startsWith('/uploads/public/');
  const token = getAuthToken();
  const [image, setImage] = useState<{ source: string; url: string; token: string } | null>(null);

  useEffect(() => {
    if (!managed || !token) return;
    const controller = new AbortController();
    let objectUrl: string | undefined;
    void fetch(src, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
      signal: controller.signal,
    }).then(async response => {
      if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) return;
      const file = await response.blob();
      if (controller.signal.aborted || token !== getAuthToken()) return;
      objectUrl = URL.createObjectURL(file);
      setImage({ source: src, url: objectUrl, token });
    }).catch(() => {});

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [managed, src, token]);

  if (managed && token && (image?.source !== src || image.token !== token)) return null;
  return <img {...props} src={managed && token ? image?.url : src} />;
}
