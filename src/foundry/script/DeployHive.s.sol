// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../src/galadriel/OpenAiChatGptVision.sol";
import "forge-std/Script.sol";


contract Deploy is Script {
    error InvalidPrivateKey(string);
    function run() public {

        uint256 deployerPrivateKey =  vm.envUint("DEPLOYER_PRIVATE_KEY");
        address jobManagerAddress = 0x7c9fc08E744B17692Dc32628407016D1CBE0a44D;

        if (deployerPrivateKey == 0) {
            revert InvalidPrivateKey(
                "You don't have a deployer account. Make sure you have set DEPLOYER_PRIVATE_KEY in .env or generate a new random account"
            );
        }

        vm.startBroadcast(deployerPrivateKey);
        DfVideoScanner dfVideoScanner =
            new DfVideoScanner(vm.addr(deployerPrivateKey), jobManagerAddress);
       // OpenAiChatGptVision openAiVision = new OpenAiChatGptVision(galadirielOracleAddress);
        console.logString(
            string.concat(
                "openAiVision deployed at: ", vm.toString(address(DfVideoScanner))
            )
        );

        vm.stopBroadcast();
    }
    
}
