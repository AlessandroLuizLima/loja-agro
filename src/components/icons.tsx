import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function PawIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <ellipse cx="6" cy="9" rx="2.2" ry="2.8" />
      <ellipse cx="10" cy="5.2" rx="2.2" ry="2.8" />
      <ellipse cx="14.5" cy="5.2" rx="2.2" ry="2.8" />
      <ellipse cx="18.5" cy="9" rx="2.2" ry="2.8" />
      <path d="M12.2 11c-3 0-6.2 4.3-6.2 6.6 0 1.9 1.5 2.9 3.2 2.9 1.4 0 2-.6 3-.6s1.6.6 3 .6c1.7 0 3.2-1 3.2-2.9 0-2.3-3.2-6.6-6.2-6.6z" />
    </svg>
  );
}

export function PixIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 2.5 7.7 6.8h.5c.9 0 1.8.4 2.4 1l1.4 1.4 1.4-1.4c.6-.6 1.5-1 2.4-1h.5zM5.8 8.7 2.5 12l3.3 3.3h2.4c.4 0 .8-.2 1.1-.5L11 13.1a1.6 1.6 0 0 0 0-2.2L9.3 9.2c-.3-.3-.7-.5-1.1-.5zm10 0c-.4 0-.8.2-1.1.5L13 10.9a1.6 1.6 0 0 0 0 2.2l1.7 1.7c.3.3.7.5 1.1.5h2.4l3.3-3.3-3.3-3.3zM12 14.8l-1.4 1.4c-.6.6-1.5 1-2.4 1h-.5l4.3 4.3 4.3-4.3h-.5c-.9 0-1.8-.4-2.4-1z" />
    </svg>
  );
}

export function WhatsAppIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.3-.4.8-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.7-.3z" />
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

export function FacebookIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M14 8V6.5c0-.7.2-1.1 1.2-1.1H17V2.2C16.6 2.1 15.6 2 14.5 2 12 2 10.5 3.5 10.5 6.2V8H8v3.4h2.5V22H14V11.4h2.8l.4-3.4z" />
    </svg>
  );
}

export function TikTokIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M16.6 2h-3.3v13.4a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9.2a6.3 6.3 0 1 0 5.3 6.2V8.6A7.6 7.6 0 0 0 21 10V6.7c-2.4 0-4.4-2-4.4-4.7z" />
    </svg>
  );
}

export function YouTubeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M22 8.2a3 3 0 0 0-2.1-2.1C18 5.6 12 5.6 12 5.6s-6 0-7.9.5A3 3 0 0 0 2 8.2 31 31 0 0 0 1.6 12c0 1.3.1 2.6.4 3.8a3 3 0 0 0 2.1 2.1c1.9.5 7.9.5 7.9.5s6 0 7.9-.5a3 3 0 0 0 2.1-2.1c.3-1.2.4-2.5.4-3.8s-.1-2.6-.4-3.8zM10 15.1V8.9l5.2 3.1z" />
    </svg>
  );
}
