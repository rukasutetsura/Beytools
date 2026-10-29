import { useState, useEffect } from 'react';

const KEY = 'beytools-username';
const PHOTO_KEY = 'beytools-user-photo';

export function useUsername() {
  const [username, setUsername] = useState(() => localStorage.getItem(KEY) || '');
  const [photo, setPhoto] = useState(() => localStorage.getItem(PHOTO_KEY) || '');

  useEffect(() => {
    const onStorage = () => {
      setUsername(localStorage.getItem(KEY) || '');
      setPhoto(localStorage.getItem(PHOTO_KEY) || '');
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const saveUsername = (name) => {
    const trimmed = name.trim();
    localStorage.setItem(KEY, trimmed);
    setUsername(trimmed);
  };

  const savePhoto = (url) => {
    if (url) {
      localStorage.setItem(PHOTO_KEY, url);
    } else {
      localStorage.removeItem(PHOTO_KEY);
    }
    setPhoto(url || '');
  };

  return { username, saveUsername, photo, savePhoto };
}