import { useState, useEffect } from 'react';
import { AppConfig, UserSession, showConnect, type UserData } from '@stacks/connect';
import { STACKS_TESTNET } from '@stacks/network';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

export const useStacks = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const data = userSession.loadUserData();
      setUserData(data);
      setAddress(data.profile.stxAddress.testnet);
    }
  }, []);

  const connectWallet = () => {
    showConnect({
      appDetails: {
        name: 'Stacks Market',
        icon: window.location.origin + '/vite.svg',
      },
      userSession,
      onFinish: () => {
        const data = userSession.loadUserData();
        setUserData(data);
        setAddress(data.profile.stxAddress.testnet);
      },
      onCancel: () => {
        console.log('User cancelled connection');
      },
    });
  };

  const disconnectWallet = () => {
    userSession.signUserOut();
    setUserData(null);
    setAddress(null);
  };

  return {
    connectWallet,
    disconnectWallet,
    userData,
    address,
    userSession,
    network: STACKS_TESTNET,
  };
};
