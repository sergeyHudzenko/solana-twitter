import { useWorkspace } from '@/composables'
import { Tweet } from '@/models'

export const getTweet = async (publicKey) => {
    const { program } = useWorkspace()
    const account = await program.account.tweet.fetch(publicKey);
    return new Tweet(publicKey, account)
}