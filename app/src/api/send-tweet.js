import { web3 } from '@project-serum/anchor'
import { useWorkspace } from '@/composables'
import { Tweet } from '@/models'

export const sendTweet = async (topic, content) => {
    const { wallet, program, connection } = useWorkspace()
    const tweet = web3.Keypair.generate()

    try {
        // Validate input lengths to match Rust program constraints
        if (topic.length > 50) {
            throw new Error('Topic is too long. Maximum length is 50 characters.')
        }
        if (content.length > 280) {
            throw new Error('Content is too long. Maximum length is 280 characters.')
        }

        const balance = await connection.getBalance(wallet.value.publicKey)
        console.log('Wallet balance:', balance / web3.LAMPORTS_PER_SOL, 'SOL')

        // Create the transaction
        const tx = await program.methods
            .sendTweet(topic, content)
            .accounts({
                author: wallet.value.publicKey,
                tweet: tweet.publicKey,
                systemProgram: web3.SystemProgram.programId,
            })
            .signers([tweet])
            .transaction()

        // Get a fresh blockhash
        const { blockhash } = await connection.getLatestBlockhash('confirmed')
        tx.recentBlockhash = blockhash
        tx.feePayer = wallet.value.publicKey

        // Sign with both the wallet and the tweet keypair
        const signedTx = await wallet.value.signTransaction(tx)
        signedTx.partialSign(tweet)

        // Send the transaction
        const signature = await connection.sendRawTransaction(signedTx.serialize(), {
            skipPreflight: false,
            preflightCommitment: 'confirmed'
        })
        console.log('Transaction sent:', signature)

        // Wait for confirmation
        await connection.confirmTransaction(signature, 'confirmed')
        console.log('Transaction confirmed:', signature)

        // Now fetch the newly created account
        const tweetAccount = await program.account.tweet.fetch(tweet.publicKey)
        console.log('Tweet account:', tweetAccount)
        return new Tweet(tweet.publicKey, tweetAccount)
    } catch (error) {
        console.error('Error sending tweet:', error)
        throw error
    }
}
