import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaTwitter } from "../target/types/solana_twitter"; 
import { assert } from 'chai';
import * as bs58 from "bs58";

describe("solana-twitter", () => {
  const program = anchor.workspace.SolanaTwitter as Program<SolanaTwitter>;


  it("It can send twits", async () => {
    const tweet = anchor.web3.Keypair.generate();
     await program.methods.sendTweet("Hello, World!", "Hello, World!")
      .accounts({
        tweet: tweet.publicKey,
        author: (program.provider as anchor.AnchorProvider).wallet.publicKey,
       // systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([
        tweet,
      ]).rpc()

      const tweetAccount = await program.account.tweet.fetch(tweet.publicKey);
      
      assert.equal(tweetAccount.author.toBase58(), (program.provider as anchor.AnchorProvider).wallet.publicKey.toBase58());
      assert.equal(tweetAccount.topic, "Hello, World!");
      assert.equal(tweetAccount.content, "Hello, World!");
      assert.ok(tweetAccount.timestam);
  
  });

  it("it can send tweets without topic", async () => {
    const tweet = anchor.web3.Keypair.generate();
    await program.methods.sendTweet("", "gm")
      .accounts({
        tweet: tweet.publicKey,
        author: (program.provider as anchor.AnchorProvider).wallet.publicKey,
       // systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([
        tweet,
      ]).rpc()

      const tweetAccount = await program.account.tweet.fetch(tweet.publicKey);
      
      assert.equal(tweetAccount.author.toBase58(), (program.provider as anchor.AnchorProvider).wallet.publicKey.toBase58());
      assert.equal(tweetAccount.topic, "");
      assert.equal(tweetAccount.content, "gm");
      assert.ok(tweetAccount.timestam);
  });

  it("it can send tweets from a different author", async () => {
    const tweet = anchor.web3.Keypair.generate();
    // Generate another user and airdrop them some SOL.
    const otherUser = anchor.web3.Keypair.generate();
    const signature = await program.provider.connection.requestAirdrop(otherUser.publicKey, 1000000000);
    await program.provider.connection.confirmTransaction(
      signature,
      'confirmed'
    );

    await program.methods.sendTweet("", "gm")
      .accounts({
        tweet: tweet.publicKey,
        author: otherUser.publicKey,
       // systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([
        otherUser,
        tweet,
      ]).rpc()

      const tweetAccount = await program.account.tweet.fetch(tweet.publicKey);
      
      assert.equal(tweetAccount.author.toBase58(), otherUser.publicKey.toBase58());
      assert.equal(tweetAccount.topic, "");
      assert.equal(tweetAccount.content, "gm");
      assert.ok(tweetAccount.timestam);
  });

  it('cannot provide a topic with more than 50 characters', async () => {
    try {
        const tweet = anchor.web3.Keypair.generate();
        const topicWith51Chars = 'x'.repeat(51);
        await program.methods.sendTweet(topicWith51Chars, "gm")
        .accounts({
          tweet: tweet.publicKey,
          author: (program.provider as anchor.AnchorProvider).wallet.publicKey,
         // systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([
          tweet,
        ]).rpc()
    } catch (error) {
        assert.equal(error.error.errorMessage, 'The topic is too long.');
        return;
    }

    assert.fail('The instruction should have failed with a 51-character topic.');
  });

  it('cannot provide a content with more than 280 characters', async () => {
    try {
        const tweet = anchor.web3.Keypair.generate();
        const contentith281Chars = 'x'.repeat(281);
        await program.methods.sendTweet('', contentith281Chars)
        .accounts({
          tweet: tweet.publicKey,
          author: (program.provider as anchor.AnchorProvider).wallet.publicKey,
         // systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([
          tweet,
        ]).rpc()
    } catch (error) {
        assert.equal(error.error.errorMessage, 'The content is too long.');
        return;
    }

    assert.fail('The instruction should have failed with a 281-character content.');
  });

  it('can fetch all tweets', async () => {
    const tweetAccounts = await program.account.tweet.all();
    assert.equal(tweetAccounts.length, 3);
  });

  it('can fetch tweets from a specific authors', async () => {
    const authorPublicKey = program.provider.publicKey;
    const tweetAccounts = await program.account.tweet.all([
      {
        memcmp: {
          offset: 8,
          bytes: authorPublicKey.toBase58(),
        }
      }
    ])
      

    assert.equal(tweetAccounts.length, 2);
    assert.ok(tweetAccounts.every((tweet) => tweet.account.author.toBase58() === authorPublicKey.toBase58()));
  })

  it('can be filtered by topic', async () => {
    const tweetAccounts = await program.account.tweet.all([
      {
        memcmp: {
          offset: 8 + 32 + 8 + 4,
          bytes: bs58.encode(Buffer.from('Hello, World!')),
        }
      }
    ])

    assert.equal(tweetAccounts.length, 1);
    assert.ok(tweetAccounts.every((tweet) => tweet.account.topic === 'Hello, World!'));
  });

});
