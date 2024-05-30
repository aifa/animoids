// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./ICoopHiveJobManager.sol";
import "./ICoopHiveJobClient.sol";

contract DfVideoScanner is Ownable, Initializable, ICoopHiveJobClient {
    address private jobManagerAddress;
    ICoopHiveJobManager private jobManagerContract;

    mapping(uint256 => string) private jobResults;

    event JobCreated(uint256 id, string folderCID);

    event JobCompleted(uint256 id, string dealId, string dataId);

    constructor(address _owner, address _jobManagerAddress) Ownable(_owner) {
        initialize(_jobManagerAddress);
    }

    function initialize(address _jobManagerAddress) public initializer {
        setJobManagerAddress(_jobManagerAddress);
    }

    function setJobManagerAddress(address _jobManagerAddress) public onlyOwner {
        require(_jobManagerAddress != address(0), "Job manager address");
        jobManagerAddress = _jobManagerAddress;
        jobManagerContract = ICoopHiveJobManager(jobManagerAddress);
    }

    function getJobResult(uint256 _jobID) public view returns (string memory) {
        return jobResults[_jobID];
    }

    function runVideoScanner(string memory folderCID) public {
        string[] memory inputs = new string[](1);
        inputs[0] = string(abi.encodePacked("inputCid=", folderCID));
        uint256 id = jobManagerContract.runJob("github.com/aifa/animoids-df:v0.0.14", inputs, msg.sender);

        emit JobCreated(id, folderCID);
    }

    function submitResults(uint256 id, string memory dealId, string memory dataId) public override {
        jobResults[id] = dataId;
        emit JobCompleted(id, dealId, dataId);
    }
}
