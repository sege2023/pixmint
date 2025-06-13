import { useConnection } from "@solana/wallet-adapter-react";
import {create} from "ipfs-http-client";
// import { useEffect } from "react";
// import { useWallet } from "@solana/wallet-adapter-react";
import React, { useRef, useState , useEffect} from "react";
// import { Transaction, PublicKey, SystemProgram } from "@solana/web3.js";
const ipfs = create({ url: 'http://localhost:5001/api/v0' });
interface MintFormState {
    selectedFile: File | null;
    imagePreviewUrl: string | null;
    nftName: string;
    nftDescription: string;
    isMinting: boolean;
}
const Mint = () => {
    // const {connection} = useConnection();
    // const {publicKey, sendTransaction } = useWallet();
    // const [image, setImage] = useState<string | null>(null);
    const [formState, setFormState] = useState<MintFormState>({
        selectedFile: null,
        imagePreviewUrl: null,
        nftName: '',
        nftDescription: '',
        isMinting: false,
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const updateFormState = (updates: Partial<MintFormState>) => {
        setFormState(prevState => ({
            ...prevState,
            ...updates,
        }));
    };
    useEffect(() => {
        const testIpfsConnection = async () => {
            try {
                const version = await ipfs.version();
                console.log("IPFS client connected successfully! Version:", version);
            } catch (error) {
                console.error("IPFS client connection test failed:", error);
                // This is where you would see a connection refused error if it persists
            }
        };
        testIpfsConnection();
    }, []);
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                updateFormState({
                    selectedFile: file,
                    imagePreviewUrl: reader.result as string,
                });
            };
            reader.readAsDataURL(file);
        } else {
            updateFormState({
                selectedFile: null,
                imagePreviewUrl: null,
            });
        }
    };

    const uploadImageToIPFS = async (file:File) => {
        try {
            console.log(`uploading ${file.name} to IPFS ..`)
            const result = await ipfs.add(file, {pin:true})
            const cid = result.cid.toString();
            const ipfsUri = `ipfs://${cid}`;
            const gatewayUrl = `https://${cid}.ipfs.dweb.link/`;

            console.log("Image uploaded to IPFS:", { cid, ipfsUri, gatewayUrl });
            return { cid, ipfsUri, gatewayUrl };
        } catch (error) {
            console.error("Error uploading image to IPFS:", error);
            throw new Error("Failed to upload image to IPFS.");
        }
    }
    

    const uploadMetadataToIPFS = async (imageData:{ipfsUri:string}, name:string, description:string) => {
        const metaplexMetadata = {
            name: name || "Untitled NFT",
            symbol: "THEATRE", 
            description: description,
            image: imageData.ipfsUri,
            properties: {
                files: [{
                    uri: imageData.ipfsUri,
                    type: formState.selectedFile?.type || 'image/png', 
                }],
                category: 'image',
                creators: [
                    { address: 'YOUR_PROGRAM_PDA_OR_WALLET_PUBKEY', share: 70 },
                ]
        }
    }
        try {
            console.log(`uploading metadata for to IPFS ..`)
            const metadataBlob = new Blob([JSON.stringify(metaplexMetadata)], { type: 'application/json' });
            const result = await ipfs.add(metadataBlob, { pin: true });
            const metadataCid = result.cid.toString();
            const metadataUri = `ipfs://${metadataCid}`;
            const metadataGatewayUrl = `https://${metadataCid}.ipfs.dweb.link/`;
            console.log("Metadata uploaded to IPFS:", { metadataCid, metadataUri, metadataGatewayUrl });
            return { metadataCid, metadataUri, metadataGatewayUrl };
        } catch (error) {
            console.error("error uploading to ipfs", error);
            throw new Error("Failed to upload metadata to IPFS.");
        }
    }


    const mintNFT = async () => {
        const { selectedFile, nftName, nftDescription } = formState;
        if(!selectedFile){
            alert("Please select an image file to mint.");
            return;
        }
        try {
            const imageData = await uploadImageToIPFS(selectedFile);
            const metadata = await uploadMetadataToIPFS(imageData, nftName, nftDescription);
            console.log("Image and metadata uploaded successfully:", { imageData, metadata });

            console.log("NFT Metadata URI for Smart Contract:", metadata.metadataUri);
        } catch (error) {
            console.error("Miniting failed:", error);
            alert(`Minting failes ${(error as Error).message || "Unknown error"}`);
        }
    }
    // const mintNFT = async () =>{
    //     // if(!publicKey || !image) return;
    //     // const { selectedFile, nftName, nftDescription } = formState;
    //     // const base64Image = image.split(',')[1];
    //     // const imageBuffer  = Buffer.from(base64Image, 'base64');
    //     // const metadata = {
    //     //     name: "Ghibli Pixel NFT",
    //     //     image: image,
    //     //     description: "Pixelated Ghibli-style artwork"
    //     // };
    //     // const metadataUri = JSON.stringify(metadata);
    //     const transaction = new Transaction().add(
    //         SystemProgram.transfer({
    //             fromPubkey: publicKey,
    //             toPubkey: new PublicKey('NSckcGa8QbAm7WSu9CTZhzpJctYKGJwkXVGWUKktzNL'), // Replace with your program ID
    //             lamports: 100000000, // Amount to transfer
    //         })
    //     )
    //     await sendTransaction(transaction, connection);
    // }
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
                    {formState.imagePreviewUrl ? 'Change Image' : 'Upload Image'}
                </button>
                {formState.imagePreviewUrl && (
                    <div>
                        <img src={formState.imagePreviewUrl} alt="Preview" style={{ maxWidth: '200px' }} />
                        <div>
                            <label htmlFor="nftName">NFT Name:</label>
                            <input
                                id="nftName"
                                type="text"
                                value={formState.nftName}
                                onChange={(e) => updateFormState({ nftName: e.target.value })}
                                placeholder="e.g., Sunset over Solana"
                                disabled={formState.isMinting}
                            />
                        </div>
                        <div>
                            <label htmlFor="nftDescription">Description:</label>
                            <textarea
                                id="nftDescription"
                                value={formState.nftDescription}
                                onChange={(e) => updateFormState({ nftDescription: e.target.value })}
                                placeholder="A brief description of your artwork..."
                                rows={3}
                                disabled={formState.isMinting}
                            />
                        </div>
                        <button onClick={mintNFT}>Mint NFT (0.1 SOL)</button>
                    </div>
                )}0
            </div>
        </>
    )
}
export default Mint;