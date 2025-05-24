import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import {
  ConnectionProvider,
  WalletProvider
} from '@solana/wallet-adapter-react';
import {
  PhantomWalletAdapter
} from '@solana/wallet-adapter-wallets';
import './App.css'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/home';
function App() {
  const wallets = [new PhantomWalletAdapter()];
  const network = WalletAdapterNetwork.Devnet;

  return (
    <>
      <ConnectionProvider endpoint={`https://api.${network}.solana.com`}>
        <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
                <BrowserRouter>
                  <Routes>
                    <Route path ='/' element = {<Home/>}/>
                  </Routes>
                </BrowserRouter>
            </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </>
  )
}

export default App
