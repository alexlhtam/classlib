// icons.tsx — inline SVG icon set (currentColor). NOT a client module: these
// are pure functions returning JSX and are called inline from both server
// components (e.g. {I.back(12)}) and client components, so they must live
// outside the 'use client' boundary.

export const I = {
  search: (s = 14) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="7" cy="7" r="5" /><path d="m11 11 3 3" /></svg>
  ),
  plus: (s = 14) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M8 3v10M3 8h10" /></svg>
  ),
  pencil: (s = 14) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m11 2 3 3-8 8H3v-3z" /></svg>
  ),
  check: (s = 14) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m3 8 3 3 7-7" /></svg>
  ),
  eye: (s = 14) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" /><circle cx="8" cy="8" r="2" /></svg>
  ),
  arrow: (s = 14) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 8h10m-4-4 4 4-4 4" /></svg>
  ),
  back: (s = 14) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M13 8H3m4-4-4 4 4 4" /></svg>
  ),
  doc: (s = 14) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 1.5h7l3 3V14a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V2a.5.5 0 0 1 .5-.5z" /><path d="M10 1.5v3h3" /></svg>
  ),
  pr: (s = 14) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="4" cy="3.5" r="1.5" /><circle cx="4" cy="12.5" r="1.5" /><circle cx="12" cy="12.5" r="1.5" /><path d="M4 5v6M9 4l3 3v4" /><path d="M9 4h-2" /></svg>
  ),
};
