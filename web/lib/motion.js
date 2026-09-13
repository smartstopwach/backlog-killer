'use client';
export const isSmall = () =>
  typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
export const dur = (x) => (isSmall() ? 0.7 : x);
export const pointerFine = () =>
  typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches;
