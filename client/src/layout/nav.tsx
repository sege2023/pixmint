import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Transaction, Connection, PublicKey , TransactionInstruction} from "@solana/web3.js";

const Navbar = () => {
    const {publicKey, sendTransaction } = useWallet()
    const connectWallet = async() =>{
        const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
        const transaction = new Transaction().add(
            new TransactionInstruction({
                keys: [{ pubkey: publicKey, isSigner: true, isWritable: false }],
                programId: new PublicKey('YourProgramId'),
                data: Buffer.from([0]), // Replace [0] with your actual data
            })
        )
        const signature = await sendTransaction(transaction, connection);
        await connection.confirmTransaction(signature, 'processed');
    }
    return(
        <>
            <div>
                {/* <button onClick={connectWallet}>connect wallet</button> */}
                <WalletMultiButton/>
                <p>git test</p>
            </div>
        </>
    )
}
export default Navbar;