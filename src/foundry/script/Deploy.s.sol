// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/hive/DfVideoScanner.sol";

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
        
        console.logString(
            string.concat(
                "DfVideoScanner deployed at: ", vm.toString(address(dfVideoScanner))
            )
        );

        vm.stopBroadcast();
    }
    
}
