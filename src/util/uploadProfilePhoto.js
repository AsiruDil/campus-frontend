import api from '../api/axios';
import { profileImageUrl } from './profileImage';

export async function uploadProfilePhoto(file) {
  if (!['image/png', 'image/jpeg'].includes(file.type) || file.size > 2 * 1024 * 1024 || !file.size) throw new Error('Choose a PNG or JPEG photo no larger than 2 MB.');
  const data = new FormData();
  data.append('photo', file);
  const response = await api.post('/api/users/profile-photo', data);
  return profileImageUrl(response.data.img);
}
