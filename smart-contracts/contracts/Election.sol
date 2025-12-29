// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Election {
    struct Candidate {
        string id;      // MongoDB ID (string)
        string name;
        uint256 voteCount;
    }

    // Mapping from MongoDB ID (string) to Candidate
    mapping(string => Candidate) public candidates;
    
    // List of candidate IDs to help frontend fetch them
    string[] public candidateIds;

    // Store the owner (deployer) address
    address public owner;

    // Events to log activity
    event CandidateAdded(string id, string name);
    event VoteCast(string candidateId, uint256 newVoteCount);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    // 1. Add Candidate (Only Admin/Backend)
    function addCandidate(string memory _id, string memory _name) public onlyOwner {
        // If it doesn't exist, add it to the list
        if (bytes(candidates[_id].id).length == 0) {
            candidateIds.push(_id);
        }
        
        candidates[_id] = Candidate(_id, _name, 0);
        emit CandidateAdded(_id, _name);
    }

    // 2. Cast Vote
    // Note: In this hybrid model, the Backend calls this function on behalf of the user.
    // The Backend ensures one-person-one-vote via Face ID.
    function vote(string memory _candidateId) public {
        require(bytes(candidates[_candidateId].id).length > 0, "Candidate does not exist");
        
        candidates[_candidateId].voteCount++;
        emit VoteCast(_candidateId, candidates[_candidateId].voteCount);
    }

    // 3. Get Candidate
    function getCandidate(string memory _id) public view returns (string memory, string memory, uint256) {
        Candidate memory c = candidates[_id];
        return (c.id, c.name, c.voteCount);
    }

    // 4. Get All Candidates (Helper)
    function getAllCandidates() public view returns (Candidate[] memory) {
        Candidate[] memory allCandidates = new Candidate[](candidateIds.length);
        for (uint i = 0; i < candidateIds.length; i++) {
            allCandidates[i] = candidates[candidateIds[i]];
        }
        return allCandidates;
    }
}
