import { defineConfig } from '@wagmi/cli'
import {foundry} from '@wagmi/cli/plugins'
import { erc20Abi } from 'viem'

export default defineConfig({
  out: 'src/generated.ts',
  contracts: [
    {
      name: 'DfVideoScanner',
      address: '0xC7f2Cf4845C6db0e1a1e91ED41Bcd0FcC1b0E141',  
     //abi: "../../foundry/out/DfVideoScanner.sol/DfVideoScanner.json",
    }
  ],
  plugins: [    
  foundry({
    project: '../../foundry',
    artifacts: 'out/',

  }),],
})
