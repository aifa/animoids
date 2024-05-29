
// config/index.tsx

import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'

import { cookieStorage, createStorage } from 'wagmi'
import { arbitrumSepolia  } from 'wagmi/chains'

// Your WalletConnect Cloud project ID
export const projectId = '8f0dd36b42b8cbbe07415c4540c18610'

// Create a metadata object
const metadata = {
  name: 'Animoid row',
  description: 'Web3Modal Example',
  url: 'https://web3modal.com', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// Create wagmiConfig
const chains = [arbitrumSepolia] as const
export const customConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage
  }),
  //...wagmiOptions // Optional - Override createConfig parameters
})