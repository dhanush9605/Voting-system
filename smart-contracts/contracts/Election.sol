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
    event CandidateRemoved(string id);
    event VoteCast(string candidateId, uint256 newVoteCount);
    event VotesReset(string[] candidateIds);

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
    // Secured with onlyOwner because the Backend calls this function on behalf of the user.
    // The Backend ensures one-person-one-vote via Face ID.
    function vote(string memory _candidateId) public onlyOwner {
        require(bytes(candidates[_candidateId].id).length > 0, "Candidate does not exist");
        
        candidates[_candidateId].voteCount++;
        emit VoteCast(_candidateId, candidates[_candidateId].voteCount);
    }

    // 3. Reset Votes
    // Reset votes to 0 for a specific list of candidates
    function resetVotes(string[] calldata _ids) external onlyOwner {
        for (uint i = 0; i < _ids.length; i++) {
            if (bytes(candidates[_ids[i]].id).length > 0) {
                candidates[_ids[i]].voteCount = 0;
            }
        }
        emit VotesReset(_ids);
    }

    // 4. Remove Candidate
    // Removes a candidate from the mapping and the array
    function removeCandidate(string calldata _id) external onlyOwner {
        require(bytes(candidates[_id].id).length > 0, "Candidate does not exist");

        // Remove from mapping
        delete candidates[_id];

        // Remove from array (swap with last element and pop)
        for (uint i = 0; i < candidateIds.length; i++) {
            // String comparison in solidity
            if (keccak256(abi.encodePacked(candidateIds[i])) == keccak256(abi.encodePacked(_id))) {
                candidateIds[i] = candidateIds[candidateIds.length - 1];
                candidateIds.pop();
                break;
            }
        }

        emit CandidateRemoved(_id);
    }

    // 5. Get Candidate
    function getCandidate(string memory _id) public view returns (string memory, string memory, uint256) {
        Candidate memory c = candidates[_id];
        return (c.id, c.name, c.voteCount);
    }

    // 6. Get All Candidates (Helper)
    function getAllCandidates() public view returns (Candidate[] memory) {
        Candidate[] memory allCandidates = new Candidate[](candidateIds.length);
        for (uint i = 0; i < candidateIds.length; i++) {
            allCandidates[i] = candidates[candidateIds[i]];
        }
        return allCandidates;
    }
}
