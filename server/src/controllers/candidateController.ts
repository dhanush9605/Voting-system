import { Request, Response } from 'express';
import Candidate from '../models/Candidate';
import Election from '../models/Election';
import { contract } from '../config/blockchain';

// @desc    Create a new candidate
// @route   POST /api/candidates
// @access  Private/Admin
export const createCandidate = async (req: Request, res: Response) => {
    try {
        const { name, party, manifesto, imageUrl, electionId } = req.body;

        let targetElectionId = electionId;
        if (!targetElectionId) {
            const activeElection = await Election.findOne({ status: 'active' });
            if (!activeElection) {
                return res.status(400).json({ message: 'No active election to add candidates to.' });
            }
            targetElectionId = activeElection._id;
        }

        const candidate = await Candidate.create({
            name,
            party,
            manifesto,
            imageUrl,
            electionId: targetElectionId
        });

        res.status(201).json(candidate);

        // --- BLOCKCHAIN INTEGRATION ---
        try {
            // Remove dynamic import and use static import
            if (contract) {
                console.log(`🔗 Adding candidate ${candidate.name} to blockchain...`);
                // Note: mongoDB _id is an object, cast to string
                const tx = await contract.addCandidate(candidate._id.toString(), candidate.name);
                console.log(`✅ Candidate added to blockchain! Tx Hash: ${tx.hash}`);
            }
        } catch (bcError) {
            console.error("⚠️ Blockchain sync failed (Add Candidate):", bcError);
        }
        // -----------------------------
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all candidates
// @route   GET /api/candidates
// @access  Public (or Protected)
export const getAllCandidates = async (req: Request, res: Response) => {
    try {
        const { electionId } = req.query;
        let query: any = {};
        
        if (electionId) {
            query.electionId = electionId;
        } else {
            const activeElection = await Election.findOne({ status: 'active' });
            if (activeElection) {
                query.electionId = activeElection._id;
            }
        }

        const candidates = await Candidate.find(query).sort({ name: 1 });
        res.json(candidates);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a candidate
// @route   PUT /api/candidates/:id
// @access  Private/Admin
export const updateCandidate = async (req: Request, res: Response) => {
    try {
        const { name, party, manifesto, imageUrl } = req.body;
        const candidate = await Candidate.findById(req.params.id);

        if (candidate) {
            candidate.name = name || candidate.name;
            candidate.party = party || candidate.party;
            candidate.manifesto = manifesto || candidate.manifesto;
            candidate.imageUrl = imageUrl || candidate.imageUrl;

            const updatedCandidate = await candidate.save();
            res.json(updatedCandidate);
        } else {
            res.status(404).json({ message: 'Candidate not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a candidate
// @route   DELETE /api/candidates/:id
// @access  Private/Admin
export const deleteCandidate = async (req: Request, res: Response) => {
    try {
        const candidate = await Candidate.findById(req.params.id);

        if (candidate) {
            await candidate.deleteOne();
            res.json({ message: 'Candidate removed' });
        } else {
            res.status(404).json({ message: 'Candidate not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
