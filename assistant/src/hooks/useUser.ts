'use client';

import { getUserInfo, requestLogout } from '../services/UserController';
import useSWR from 'swr';
import { popupCenter } from '../utils/popcenter';
import { useEffect } from 'react';

function useUser({ apiDomain, webDomain = 'https://petercat.ai', fingerprint }: { apiDomain: string; fingerprint: string; webDomain?: string }) {
  const { data: user, isLoading, mutate } = useSWR(
    ['user.info'],
    async () => getUserInfo(apiDomain, { clientId: fingerprint }),
    { suspense: false },
  );


  const doLogin = () => {
    console.log('call do Login', webDomain);
    popupCenter({
      url: `${webDomain}/user/login`,
      title: 'Login',
      w: 600,
      h: 400,
    });
  }

  const handleLoginPostMessage = (event: MessageEvent) => {
    if (event.origin !== location.origin) {
      return;
    }

    const { status } = event.data;
    if (status === 'success') {
      mutate();
    }
  };

  useEffect(() => {
    window.addEventListener('message', handleLoginPostMessage);
    return () => {
      window.removeEventListener('message', handleLoginPostMessage);
    }
  }, []);

  const doLogout = async () => {
    await requestLogout(apiDomain);
    mutate();
  }


  return {
    user,
    isLoading,
    actions: {
      doLogin,
      doLogout,
    },
  };
}

export default useUser;
