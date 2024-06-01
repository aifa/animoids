// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/galadriel/OpenAiChatGptVision.sol";

contract Deploy is Script {
    error InvalidPrivateKey(string);
    function run() public {

        uint256 deployerPrivateKey =  vm.envUint("DEPLOYER_PRIVATE_KEY");
        address jobManagerAddress = 0x7c9fc08E744B17692Dc32628407016D1CBE0a44D;

        address galadirielOracleAddress = 0x4168668812C94a3167FCd41D12014c5498D74d7e;

        if (deployerPrivateKey == 0) {
            revert InvalidPrivateKey(
                "You don't have a deployer account. Make sure you have set DEPLOYER_PRIVATE_KEY in .env or generate a new random account"
            );
        }

        vm.startBroadcast(deployerPrivateKey);
        //DfVideoScanner dfVideoScanner =
         //   new DfVideoScanner(vm.addr(deployerPrivateKey), jobManagerAddress);
        OpenAiChatGptVision openAiVision = new OpenAiChatGptVision(galadirielOracleAddress);
        console.logString(
            string.concat(
                "openAiVision deployed at: ", vm.toString(address(openAiVision))
            )
        );

        vm.stopBroadcast();
    }
    
}
