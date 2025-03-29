import { useAnchorWallet } from 'solana-wallets-vue'
import idl from '@/idl/solana_twitter.json'
import { Program, AnchorProvider, setProvider } from "@coral-xyz/anchor";
import { Connection } from '@solana/web3.js'

// const programId = new PublicKey(idl.address) // Ensure this matches the correct field in your IDL
let workspace = null
const commitment = 'confirmed'
const preflightCommitment = 'confirmed'

export const useWorkspace = () => workspace

export const initWorkspace = () => {
    const connection = new Connection(import.meta.env.VITE_CLUSTER_URL, {
        commitment,
        confirmTransactionInitialTimeout: 60000
    })

    const wallet = useAnchorWallet();

    const provider = new AnchorProvider(connection, wallet, {
        commitment,
        preflightCommitment
    });
    setProvider(provider);

    const program = new Program(idl, provider);

    workspace = {
        wallet,
        connection,
        provider,
        program
    }
}
