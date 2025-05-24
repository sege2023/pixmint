import { useConnection } from "@solana/wallet-adapter-react";
import { useWallet } from "@solana/wallet-adapter-react";
import React, { useRef, useState } from "react";
import { Transaction, PublicKey, SystemProgram } from "@solana/web3.js";
const Mint = () => {
    const {connection} = useConnection();
    const {publicKey, sendTransaction } = useWallet();
    const [image, setImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader()
            reader.onload =() => setImage(reader.result as string)
            reader.readAsDataURL(file)
        }

    }
    const mintNFT = async () =>{
        if(!publicKey || !image) return;
        // const base64Image = image.split(',')[1];
        // const imageBuffer  = Buffer.from(base64Image, 'base64');
        // const metadata = {
        //     name: "Ghibli Pixel NFT",
        //     image: image,
        //     description: "Pixelated Ghibli-style artwork"
        // };
        // const metadataUri = JSON.stringify(metadata);
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: new PublicKey('NSckcGa8QbAm7WSu9CTZhzpJctYKGJwkXVGWUKktzNL'), // Replace with your program ID
                lamports: 100000000, // Amount to transfer
            })
        )
        await sendTransaction(transaction, connection);
    }
    return(
        <>
            <div className="mintContainer">
                <input 
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                ref={fileInputRef}
                />
                <button onClick={() => fileInputRef.current?.click()}>
                    {image ? 'Change Image' : 'Upload Image'}
                </button>
                {image && (
                    <div>
                        <img src={image} alt="Preview" style={{ maxWidth: '200px' }} />
                        <button onClick={mintNFT}>Mint NFT (0.1 SOL)</button>
                    </div>
                )}
            </div>
        </>
    )
}
export default Mint;