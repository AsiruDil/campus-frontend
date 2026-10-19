export const DEFAULT_PROFILE_IMAGE = '/profile.png';

export function profileImageUrl(value) {
  if (!value || value === 'profile.png' || /^https?:\/\/(avatar\.iran\.liara\.run|ui-avatars\.com)\//i.test(value)) return DEFAULT_PROFILE_IMAGE;
  if (value.startsWith('/api/users/avatar/')) return new URL(value, import.meta.env.VITE_BACKEND_URL || window.location.origin).href;
  return value;
}

export function useDefaultProfileImage(event) {
  const image = event.currentTarget;
  if (image.getAttribute('src') !== DEFAULT_PROFILE_IMAGE) image.src = DEFAULT_PROFILE_IMAGE;
}
