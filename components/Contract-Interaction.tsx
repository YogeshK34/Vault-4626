"use client"
/*eslint-disable*/

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner";
import { Spinner } from "./ui/spinner";
import { Label } from "./ui/label";
import { Contract, ethers } from 'ethers';
import { ABI, CONTRACT_ADDRESS } from "@/config";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";


export const ContractInteraction = () => {
    const [account, setAccount] = useState<string>('');
    const [chainId, setChainId] = useState<string>('');
    const [assetAddress, setAsssetAddress] = useState<string>('');
    const [assetValue, setAssetValue] = useState<string>('');
    const [assetLoading, setAssetLoading] = useState<boolean>(false);
    const [totalAssetsLoading, setTotalAssetsLoading] = useState<boolean>(false);
    const [totalSupplyValue, setTotalSupplyValue] = useState<string>('');
    const [totalSupplyLoading, setTotalSupplyLoading] = useState<boolean>(false);
    const [balance, setBalance] = useState<string>('');
    const [balanceLoading, setBalanceLoading] = useState<boolean>(false);
    const [balanceAddress, setBalanceAddress] = useState<string>('');
    const [depositLoading, setDepositLoading] = useState<boolean>(false);
    const [depositValue, setDepositValue] = useState<string>('');
    const [depositReceiver, setDepositReceiver] = useState<string>('');
    const [withdrawLoading, setWithdrawLoading] = useState<boolean>(false);
    const [withdrawAmount, setWithdrawAmount] = useState<string>('');
    const [withdrawReceiver, setWithdrawReceiver] = useState<string>('');
    const [withdrawOwner, setWithdrawOwner] = useState<string>('');
    const [withdrawShares, setWithdrawShares] = useState<string>('');
    const [walletLoading, setWalletLoading] = useState<boolean>(false);


    const decimals = 18;

    useEffect(() => {
        const checkExistingWallet = async () => {
            try {
                setWalletLoading(true);

                const fetchAccounts = await window.ethereum?.request({
                    method: 'eth_accounts'
                }) as string[];

                if (fetchAccounts.length > 0) setAccount(fetchAccounts[0]), toast.success('Wallet loaded!', { position: 'top-center' });

                const fetchChain = await window.ethereum?.request({
                    method: 'eth_chainId'
                }) as string;

                if (fetchChain) setChainId(fetchChain);

            } catch (error) {
                console.error(error);
                return toast.error('Failed to load wallet!')
            } finally {
                setWalletLoading(false);
            }
        }

        if (!window.ethereum) toast.info('Metamask not installed!');
        checkExistingWallet();

        const handleAccountChanged = async (accounts: string[]) => {
            try {
                if (accounts.length > 0) setAccount(accounts[0]), toast.success('Wallet changed!', { position: 'top-center' });

            } catch (error) {
                return console.error(error);
            };
        };

        const handleChainChanged = async (chainId: string) => {
            try {
                if (chainId) setChainId(chainId), toast.success('Chain changed!', { position: 'top-center' });
            } catch (error) {
                return console.error(error);
            };
        };

        window.ethereum?.on('accountsChanged', handleAccountChanged);
        window.ethereum?.on('chainChanged', handleChainChanged);

        return () => {
            window.ethereum?.removeListener('accountsChanged', handleAccountChanged);
            window.ethereum?.removeListener('chainChanged', handleChainChanged);
        }
    }, [])


    const provider = useMemo(() => {
        if (typeof window === 'undefined') return null;
        if (!window.ethereum) {
            toast.error('Metamask not installed!');
            return null;
        }
        return new ethers.BrowserProvider(window.ethereum);
    }, [])

    const getProvider = async () => {
        if (!provider) return toast.error('Metamask in not installed!');
        return provider;
    };

    const contract = useMemo(() => {
        if (!provider || !ethers.isAddress(CONTRACT_ADDRESS)) {
            toast.error('Metamask not installed or wrong contract address!');
            return null;
        }
        return new Contract(CONTRACT_ADDRESS, ABI, provider);
    }, [provider, CONTRACT_ADDRESS])

    {/* erc-4626 functions*/ }
    const asset = async () => {
        try {
            setAssetLoading(true);

            const fetchAssetAddress = await contract?.asset();
            setAsssetAddress(fetchAssetAddress);
            toast.error('Asset contract loaded!', { position: 'top-center' });

        } catch (error) {
            console.error(error);
            return toast.error('Failed to load Asset Contract!')
        } finally {
            setAssetLoading(false);
        }
    }

    const totalAssets = async () => {
        try {
            setTotalAssetsLoading(true);

            const assetValue = await contract?.totalAssets();
            setAssetValue(assetValue);

            toast.success('Assets fetched successfully!', { position: 'top-center' })

        } catch (error) {
            console.error(error);
            return toast.error('Failed to load assets!')
        } finally {
            setTotalAssetsLoading(false);
        }
    };

    const totalSupply = async () => {
        try {
            setTotalSupplyLoading(true);

            const rawSupply = await contract?.totalSupply();
            const fetchSupply = ethers.formatUnits(rawSupply, decimals ?? 18);
            setTotalSupplyValue(fetchSupply);

            toast.success('Total Shares Supply Fetched!', { position: 'top-center' });

        } catch (error) {
            console.error(error);
            return toast.error('Failed to fetch total share supply!');
        } finally {
            setTotalSupplyLoading(false);
        }
    }

    const balanceOf = async (addressToCheck: string) => {
        try {
            if (!ethers.isAddress(addressToCheck)) return toast.error('Invalid address!', { position: 'top-center' });
            setBalanceLoading(true);
            const rawBalance = await contract?.balanceOf(addressToCheck);
            const balance = ethers.formatUnits(rawBalance, decimals ?? 18);

            setBalance(balance);
            toast.success(`Balance fetched!`, { position: 'top-center' });
        } catch (error) {
            console.error(error);
            return toast.error('Failed to fetch balance!')
        } finally {
            setBalanceLoading(false);
        }
    };

    const withdraw = async (assets: string, receiver: string, owner: string) => {
        try {
            if (!window.ethereum) return toast.error('MetaMask not installed!');
            if (!ethers.isAddress(receiver)) return toast.error('Invalid receiver address!', { position: 'top-center' });
            if (!ethers.isAddress(owner)) return toast.error('Invalid owner address!', { position: 'top-center' });
            setWithdrawLoading(true);

            const assetsInWei = ethers.parseUnits(assets, decimals);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new Contract(CONTRACT_ADDRESS, ABI, signer);

            const tx = await contract.withdraw(assetsInWei, receiver, owner);
            const receipt = await tx.wait();

            const parsedLogs = receipt.logs.map((log: any) => {
                try { return contract.interface.parseLog(log); }
                catch (e) { return null; }
            });

            const withdrawLog = parsedLogs.find((p: any) => p?.name === 'Withdraw');
            if (withdrawLog) {
                const sharesReturned = ethers.formatUnits(withdrawLog.args.shares, decimals);
                setWithdrawShares(sharesReturned);
                toast.success(`Withdrawn! Shares burned: ${sharesReturned}`, { position: 'top-center' });
                await balanceOf(owner);
                await totalSupply();
            }
        } catch (error) {
            console.error(error);
            return toast.error('Failed to withdraw!');
        } finally {
            setWithdrawLoading(false);
        }
    };

    const deposit = async (assets: string, receiver: string) => {
        try {
            if (!window.ethereum) return 'Metamask not installed!'
            setDepositLoading(true);
            if (!ethers.isAddress(receiver)) return toast.error('Invalid wallet address!');
            const assetsInWei = ethers.parseUnits(assets, decimals);

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            const contract = new Contract(CONTRACT_ADDRESS, ABI, signer);
            const tx = await contract.deposit(assetsInWei, receiver);
            const receipt = await tx.wait();

            const parsedLogs = receipt.logs.map((log: any) => {
                try {
                    return contract.interface.parseLog(log);
                } catch (error) {
                    return console.error(error);
                }
            });

            const transferLogs = parsedLogs.find((parsed: any) => parsed?.name === 'Deposit');

            if (transferLogs) {
                const { sender, receiver, assets, shares } = await transferLogs;
                toast.success('Deposit successful!');
                await balanceOf(account);
                await balanceOf(receiver);
                await totalSupply();
            }

        } catch (error) {
            console.error(error);
            return toast.error('Failed to deposit!')
        } finally {
            setDepositLoading(false);
        }
    }

    const isAnyLoading = walletLoading || totalAssetsLoading || assetLoading || totalSupplyLoading || balanceLoading || depositLoading || withdrawLoading;

    return (
        <div className="min-h-screen w-full bg-zinc-950 py-16 px-4 text-zinc-100">
            <div className="mx-auto flex w-full max-w-xl flex-col gap-6">

                {/* ── Header ── */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500">
                            ERC-4626
                        </span>
                        <h1 className="text-xl font-semibold text-zinc-50">Vault Console</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Status dot */}
                        <Badge variant="outline"
                            className="gap-1.5 border-zinc-800 bg-zinc-900/60 font-mono text-xs text-zinc-400">
                            <span className={`h-1.5 w-1.5 rounded-full ${isAnyLoading ? "animate-pulse bg-amber-400" : "bg-emerald-400"}`} />
                            {isAnyLoading ? "processing" : "idle"}
                        </Badge>

                        {account ? (
                            <>
                                {/* Chain badge */}
                                <Badge variant="outline"
                                    className="border-zinc-800 bg-zinc-900/60 font-mono text-xs text-zinc-400">
                                    {chainId}
                                </Badge>
                                {/* Wallet badge */}
                                <Badge variant="outline"
                                    className="border-zinc-800 bg-zinc-900/60 font-mono text-xs text-cyan-300">
                                    {account.slice(0, 6)}...{account.slice(-4)}
                                </Badge>
                            </>
                        ) : (
                            <span className="font-mono text-xs text-zinc-600">No wallet</span>
                        )}
                    </div>
                </div>

                {/* ── Read: Vault Info ── */}
                <Card className="border-zinc-800 bg-zinc-900/40">
                    <CardHeader>
                        <CardTitle className="text-base text-zinc-100">Vault Info</CardTitle>
                        <CardDescription className="text-zinc-500">
                            Read-only state from the ERC-4626 vault contract.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">

                        <div className="flex flex-row flex-wrap gap-3">
                            <Button
                                onClick={asset}
                                disabled={assetLoading || !account}
                                variant="outline"
                                className="flex-1 min-w-0 border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-800 hover:text-zinc-50"
                            >
                                {assetLoading ? (
                                    <span className="flex items-center gap-2">
                                        <Spinner className="h-4 w-4" /> Fetching…
                                    </span>
                                ) : "Asset Address"}
                            </Button>

                            <Button
                                onClick={totalAssets}
                                disabled={totalAssetsLoading || !account}
                                variant="outline"
                                className="flex-1 min-w-0 border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-800 hover:text-zinc-50"
                            >
                                {totalAssetsLoading ? (
                                    <span className="flex items-center gap-2">
                                        <Spinner className="h-4 w-4" /> Fetching…
                                    </span>
                                ) : "Total Assets"}
                            </Button>

                            <Button
                                onClick={totalSupply}
                                disabled={totalSupplyLoading || !account}
                                variant="outline"
                                className="flex-1 min-w-0 border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-800 hover:text-zinc-50"
                            >
                                {totalSupplyLoading ? (
                                    <span className="flex items-center gap-2">
                                        <Spinner className="h-4 w-4" /> Fetching…
                                    </span>
                                ) : "Total Supply"}
                            </Button>
                        </div>

                        {/* Results panel */}
                        {(assetAddress || assetValue || totalSupplyValue) && (
                            <dl className="mt-1 divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-950/60 px-4">
                                {assetAddress && (
                                    <div className="flex items-center justify-between py-3">
                                        <dt className="text-xs text-zinc-500">Asset Contract</dt>
                                        <dd className="truncate font-mono text-xs text-cyan-300 max-w-[60%]" title={assetAddress}>
                                            {assetAddress.slice(0, 10)}…{assetAddress.slice(-8)}
                                        </dd>
                                    </div>
                                )}
                                {assetValue && (
                                    <div className="flex items-center justify-between py-3">
                                        <dt className="text-xs text-zinc-500">Total Assets</dt>
                                        <dd className="font-mono text-sm text-cyan-300">{assetValue}</dd>
                                    </div>
                                )}
                                {totalSupplyValue && (
                                    <div className="flex items-center justify-between py-3">
                                        <dt className="text-xs text-zinc-500">Total Supply</dt>
                                        <dd className="font-mono text-sm text-cyan-300">{totalSupplyValue}</dd>
                                    </div>
                                )}
                            </dl>
                        )}
                    </CardContent>
                </Card>

                {/* ── Section divider ── */}
                <div className="flex items-center gap-3">
                    <Separator className="flex-1 bg-zinc-800" />
                    <span className="text-xs font-mono uppercase tracking-widest text-zinc-600">balance</span>
                    <Separator className="flex-1 bg-zinc-800" />
                </div>

                {/* ── Read: Balance ── */}
                <Card className="border-zinc-800 bg-zinc-900/40">
                    <CardHeader>
                        <CardTitle className="text-base text-zinc-100">Share Balance</CardTitle>
                        <CardDescription className="text-zinc-500">
                            Fetch the vault share balance for any wallet address.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="balanceAddress" className="text-xs text-zinc-400">
                                Wallet Address
                            </Label>
                            <Input
                                id="balanceAddress"
                                type="text"
                                value={balanceAddress}
                                onChange={(e) => setBalanceAddress(e.target.value)}
                                disabled={balanceLoading}
                                placeholder="0x..."
                                className="border-zinc-800 bg-zinc-950 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-cyan-400/40"
                            />
                        </div>

                        <Button
                            onClick={() => balanceOf(balanceAddress || account)}
                            disabled={balanceLoading || !account}
                            variant="outline"
                            className="w-full border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-800 hover:text-zinc-50"
                        >
                            {balanceLoading ? (
                                <span className="flex items-center gap-2">
                                    <Spinner className="h-4 w-4" /> Fetching…
                                </span>
                            ) : "Fetch Balance"}
                        </Button>

                        {balance && (
                            <dl className="mt-1 divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-950/60 px-4">
                                <div className="flex items-center justify-between py-3">
                                    <dt className="text-xs text-zinc-500">Shares</dt>
                                    <dd className="font-mono text-sm text-cyan-300">{balance}</dd>
                                </div>
                            </dl>
                        )}
                    </CardContent>
                </Card>

                {/* ── Section divider ── */}
                <div className="flex items-center gap-3">
                    <Separator className="flex-1 bg-zinc-800" />
                    <span className="text-xs font-mono uppercase tracking-widest text-zinc-600">deposit</span>
                    <Separator className="flex-1 bg-zinc-800" />
                </div>

                {/* ── Write: Deposit ── */}
                <Card className="border-zinc-800 bg-zinc-900/40">
                    <CardHeader>
                        <CardTitle className="text-base text-zinc-100">Deposit Assets</CardTitle>
                        <CardDescription className="text-zinc-500">
                            Deposit underlying assets and receive vault shares in return.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="depositValue" className="text-xs text-zinc-400">
                                Amount (in token units)
                            </Label>
                            <Input
                                id="depositValue"
                                type="number"
                                value={depositValue}
                                onChange={(e) => setDepositValue(e.target.value)}
                                required
                                disabled={depositLoading}
                                placeholder="0.0"
                                className="border-zinc-800 bg-zinc-950 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-cyan-400/40"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="depositReceiver" className="text-xs text-zinc-400">
                                Receiver Address
                            </Label>
                            <Input
                                id="depositReceiver"
                                type="text"
                                value={depositReceiver}
                                onChange={(e) => setDepositReceiver(e.target.value)}
                                required
                                disabled={depositLoading}
                                placeholder="0x..."
                                className="border-zinc-800 bg-zinc-950 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-cyan-400/40"
                            />
                        </div>

                        <Button
                            onClick={() => deposit(depositValue, depositReceiver)}
                            disabled={depositLoading || !account || !depositValue || !depositReceiver}
                            className="w-full bg-cyan-400 text-zinc-950 hover:bg-cyan-300"
                        >
                            {depositLoading ? (
                                <span className="flex items-center gap-2">
                                    <Spinner className="h-4 w-4" /> Depositing…
                                </span>
                            ) : "Deposit"}
                        </Button>

                    </CardContent>
                </Card>

                {/* ── Section divider: WITHDRAW ── */}
                <div className="flex items-center gap-3">
                    <Separator className="flex-1 bg-zinc-800" />
                    <span className="text-xs font-mono uppercase tracking-widest text-zinc-600">withdraw</span>
                    <Separator className="flex-1 bg-zinc-800" />
                </div>

                {/* ── Write: Withdraw ── */}
                <Card className="border-zinc-800 bg-zinc-900/40">
                    <CardHeader>
                        <CardTitle className="text-base text-zinc-100">Withdraw Assets</CardTitle>
                        <CardDescription className="text-zinc-500">
                            Burn shares and withdraw underlying assets from the vault.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="withdrawAmount" className="text-xs text-zinc-400">
                                Amount (in token units)
                            </Label>
                            <Input
                                id="withdrawAmount"
                                type="number"
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                disabled={withdrawLoading}
                                placeholder="0.0"
                                className="border-zinc-800 bg-zinc-950 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-cyan-400/40"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="withdrawReceiver" className="text-xs text-zinc-400">
                                Receiver Address
                            </Label>
                            <Input
                                id="withdrawReceiver"
                                type="text"
                                value={withdrawReceiver}
                                onChange={(e) => setWithdrawReceiver(e.target.value)}
                                disabled={withdrawLoading}
                                placeholder="0x..."
                                className="border-zinc-800 bg-zinc-950 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-cyan-400/40"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="withdrawOwner" className="text-xs text-zinc-400">
                                Owner Address
                            </Label>
                            <Input
                                id="withdrawOwner"
                                type="text"
                                value={withdrawOwner}
                                onChange={(e) => setWithdrawOwner(e.target.value)}
                                disabled={withdrawLoading}
                                placeholder="0x..."
                                className="border-zinc-800 bg-zinc-950 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-cyan-400/40"
                            />
                        </div>

                        <Button
                            onClick={() => withdraw(withdrawAmount, withdrawReceiver, withdrawOwner)}
                            disabled={withdrawLoading || !account || !withdrawAmount || !withdrawReceiver || !withdrawOwner}
                            className="w-full bg-cyan-400 text-zinc-950 hover:bg-cyan-300"
                        >
                            {withdrawLoading ? (
                                <span className="flex items-center gap-2">
                                    <Spinner className="h-4 w-4" /> Withdrawing…
                                </span>
                            ) : "Withdraw"}
                        </Button>

                        {withdrawShares && (
                            <dl className="mt-1 divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-950/60 px-4">
                                <div className="flex items-center justify-between py-3">
                                    <dt className="text-xs text-zinc-500">Shares Burned</dt>
                                    <dd className="font-mono text-sm text-cyan-300">{withdrawShares}</dd>
                                </div>
                            </dl>
                        )}

                    </CardContent>
                </Card>

            </div>
        </div>
    )
}