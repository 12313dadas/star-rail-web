import { api } from './api';

export async function uploadBattleVideo(file: File): Promise<string> {
  const form = new FormData();
  form.append('video', file);
  const res = await api.post<{ url: string }>('/squads/upload-video', form);
  return res.url;
}
