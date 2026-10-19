'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { loadBuyNow, clearBuyNow } from '@/lib/buyNow';

export default function SuccessEffects({
  clearCartNow,
  refreshWhilePending,
}: {
  clearCartNow: boolean;
  refreshWhilePending: boolean;
}) {
  const { clearCart } = useCart();
  const router = useRouter();
  const cleared = useRef(false);

  useEffect(() => {
    if (clearCartNow && !cleared.current) {
      cleared.current = true;
      // Buy Now walin awoth cart eka thiyenna dennama, Buy Now item eka witharak ain karanna
      if (loadBuyNow()) clearBuyNow();
      else clearCart();
    }
  }, [clearCartNow, clearCart]);

  useEffect(() => {
    if (!refreshWhilePending) return;
    let tries = 0;
    const id = setInterval(() => {
      tries += 1;
      router.refresh();
      if (tries >= 10) clearInterval(id);
    }, 3000);
    return () => clearInterval(id);
  }, [refreshWhilePending, router]);

  return null;
}