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
import { Container, EthernetPort } from "lucide-react";
import { sign } from "crypto";


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
    const [mintLoading, setMintLoading] = useState<boolean>(false);
    const [mintShares, setMintShares] = useState<string>('');
    const [mintReceiver, setMintReceiver] = useState<string>('');
    const [redeemLoading, setRedeemLoading] = useState<boolean>(false);
    const [redeemShares, setRedeemShares] = useState<string>('');
    const [redeemReceiver, setRedeemReceiver] = useState<string>('');
    const [redeemOwner, setRedeemOwner] = useState<string>('');
    const [redeemAssets, setRedeemAssets] = useState<string>('');
    const [deposits, setDeposits] = useState<any[]>([]);
    const [withdraws, setWithdraws] = useState<any[]>([]);
    const [transfers, setTransfers] = useState<any[]>([]);
    const [approvals, setApprovals] = useState<any[]>([]);
    const [indexerLoading, setIndexerLoading] = useState<boolean>(false);
    const [indexerError, setIndexerError] = useState<string>('');
    const [indexerStatus, setIndexerStatus] = useState<string>('');
    const [connectingWallet, setConnectingWallet] = useState<boolean>(false);


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
    }, []);

    const connectWallet = async () => {
        try {
            if (!window.ethereum) return toast.error('Metamask in not installed!');
            setConnectingWallet(true);

            const requestAccounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            }) as string[];

            if (requestAccounts.length > 0) setAccount(requestAccounts[0]);


            const requestChainId = await window.ethereum.request({
                method: 'eth_chainId'
            }) as string;

            if (requestChainId) setChainId(requestChainId);
        } catch (error) {
            console.error(error);
            return toast.error('Failed to connect wallet!');
        } finally {
            setConnectingWallet(false);
        }
    }


    const getSignerContract = async (): Promise<Contract | null> => {
        if (!window.ethereum) {
            toast.error('MetaMask not installed!');
            return null;
        }
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        return new Contract(CONTRACT_ADDRESS, ABI, signer);
    };

    {/* erc-4626 functions*/ }
    const asset = async () => {
        try {
            if (!window.ethereum) return toast.error('Metamask not installed!', { position: 'top-center' });
            setAssetLoading(true);

            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new Contract(CONTRACT_ADDRESS, ABI, provider);

            const fetchAssetAddress = await contract?.asset();
            setAsssetAddress(fetchAssetAddress);
            toast.success('Asset contract loaded!', { position: 'top-center' });

        } catch (error) {
            console.error(error);
            return toast.error('Failed to load Asset Contract!')
        } finally {
            setAssetLoading(false);
        }
    }

    const totalAssets = async () => {
        try {
            if (!window.ethereum) return toast.error('Metamask not installed!', { position: 'top-center' });
            setTotalAssetsLoading(true);

            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new Contract(CONTRACT_ADDRESS, ABI, provider);

            const rawAssets = await contract?.totalAssets();
            const assetsValue = ethers.formatUnits(rawAssets, decimals);
            setAssetValue(assetsValue);
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
            if (!window.ethereum) return toast.error('Metamask not installed!', { position: 'top-center' });
            setTotalSupplyLoading(true);

            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new Contract(CONTRACT_ADDRESS, ABI, provider);

            const rawSupply = await contract?.totalSupply();
            const fetchSupply = ethers.formatUnits(rawSupply, decimals);
            setTotalSupplyValue(fetchSupply);
            toast.success('Total Shares Fetched!', { position: 'top-center' });

        } catch (error) {
            console.error(error);
            return toast.error('Failed to fetch shares!');
        } finally {
            setTotalSupplyLoading(false);
        }
    }

    const balanceOf = async (addressToCheck: string) => {
        try {
            if (!window.ethereum) return toast.error('Metamask not installed!', { position: 'top-center' });
            if (!ethers.isAddress(addressToCheck)) return toast.error('Invalid address!', { position: 'top-center' });
            setBalanceLoading(true);

            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new Contract(CONTRACT_ADDRESS, ABI, provider);

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
            if (!ethers.isAddress(receiver)) return toast.error('Invalid receiver address!', { position: 'top-center' });
            if (!ethers.isAddress(owner)) return toast.error('Invalid owner address!', { position: 'top-center' });
            setWithdrawLoading(true);

            const assetsInWei = ethers.parseUnits(assets, decimals);
            const contract = await getSignerContract();
            if (!contract) return;

            // ── Step 1: send transaction ──────────────────────────────────────
            setIndexerStatus('Sending transaction…');
            const tx = await contract.withdraw(assetsInWei, receiver, owner);

            // ── Step 2: wait for on-chain confirmation ────────────────────────
            setIndexerStatus('Mining transaction…');
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
                await balanceOf(receiver);
                await totalSupply();
            }

            // ── Step 3: sync the indexer UI ───────────────────────────────────
            setIndexerStatus('Syncing with indexer…');
            pollUntilUpdated(30_000, 3_000);
            setIndexerStatus('Success!');
        } catch (error) {
            console.error(error);
            setIndexerStatus('Failed');
            return toast.error('Failed to withdraw!', { position: 'top-center' });
        } finally {
            setWithdrawLoading(false);
            setTimeout(() => setIndexerStatus(''), 4_000);
        }
    };

    const redeem = async (shares: string, receiver: string, owner: string) => {
        try {
            if (!ethers.isAddress(receiver)) return toast.error('Invalid receiver address!');
            if (!ethers.isAddress(owner)) return toast.error('Invalid owner address!');

            setRedeemLoading(true);
            const sharedParsed = ethers.parseUnits(shares, decimals);

            const contract = await getSignerContract();
            if (!contract) return;

            // ── Step 1: send transaction ──────────────────────────────────────
            setIndexerStatus('Sending transaction…');
            const tx = await contract.redeem(sharedParsed, receiver, owner);

            // ── Step 2: wait for on-chain confirmation ────────────────────────
            setIndexerStatus('Mining transaction…');
            const receipt = await tx.wait();

            const parsedLogs = receipt.logs.map((log: any) => {
                try { return contract.interface.parseLog(log); }
                catch (error) { return error; }
            });

            const withdrawLogs = await parsedLogs.find((parsed: any) => parsed?.name === 'Withdraw');
            if (withdrawLogs) {
                const returnedAssets = ethers.formatUnits(withdrawLogs.args.assets, decimals);
                setRedeemAssets(returnedAssets);
                const { sender, receiver, owner, assets, shares } = await withdrawLogs.args;
                toast.success(`Redeem succesful! Redeemed ${ethers.formatUnits(assets, decimals)} from ${owner} to ${receiver}`);
                await balanceOf(owner);
                await balanceOf(receiver);
            }

            // ── Step 3: sync the indexer UI ───────────────────────────────────
            setIndexerStatus('Syncing with indexer…');
            pollUntilUpdated(30_000, 3_000);
            setIndexerStatus('Success!');
        } catch (error) {
            console.error(error);
            setIndexerStatus('Failed');
            return toast.error('Failed to redeem assets!');
        } finally {
            setRedeemLoading(false);
            setTimeout(() => setIndexerStatus(''), 4_000);
        }
    }

    const deposit = async (assets: string, receiver: string) => {
        try {
            setDepositLoading(true);
            if (!ethers.isAddress(receiver)) return toast.error('Invalid wallet address!');
            const assetsInWei = ethers.parseUnits(assets, decimals);

            const contract = await getSignerContract();
            if (!contract) return;

            // ── Step 1: send transaction ──────────────────────────────────────
            setIndexerStatus('Sending transaction…');
            const tx = await contract.deposit(assetsInWei, receiver);

            // ── Step 2: wait for on-chain confirmation ────────────────────────
            setIndexerStatus('Mining transaction…');
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
                const { sender, receiver, assets, shares } = await transferLogs.args;
                toast.success('Deposit successful!', { position: 'top-center' });
                await balanceOf(receiver);
                await totalSupply();
            }

            // ── Step 3: sync the indexer UI ───────────────────────────────────
            setIndexerStatus('Syncing with indexer…');
            pollUntilUpdated(30_000, 3_000);
            setIndexerStatus('Success!');
        } catch (error) {
            console.error(error);
            setIndexerStatus('Failed');
            return toast.error('Failed to deposit!')
        } finally {
            setDepositLoading(false);
            setTimeout(() => setIndexerStatus(''), 4_000);
        }
    }

    const mint = async (shares: string, receiver: string) => {
        try {
            if (!ethers.isAddress(receiver)) return toast.error("Incorrect recevier's address!", { position: 'top-center' });
            const formattedShares = ethers.parseUnits(shares, decimals);
            setMintLoading(true);

            const contract = await getSignerContract();
            if (!contract) return;

            // ── Step 1: send transaction ──────────────────────────────────────
            setIndexerStatus('Sending transaction…');
            const tx = await contract.mint(formattedShares, receiver);

            // ── Step 2: wait for on-chain confirmation ────────────────────────
            setIndexerStatus('Mining transaction…');
            const receipt = await tx.wait();

            const parsedLogs = receipt.logs.map((log: any) => {
                try { return contract.interface.parseLog(log); }
                catch (e) { return null };
            })

            const depositLogs = parsedLogs.find((parsed: any) => parsed?.name === 'Deposit');
            if (depositLogs) {
                const { sender, receivers, assets, shares } = await depositLogs.args;
                toast.success(`Mint success! Minted ${ethers.formatUnits(assets, decimals)} to ${receiver}`,
                    { position: 'top-center' });
                await balanceOf(receiver);
                await totalSupply();
            }

            // ── Step 3: sync the indexer UI ───────────────────────────────────
            setIndexerStatus('Syncing with indexer…');
            pollUntilUpdated(30_000, 3_000);
            setIndexerStatus('Success!');
        } catch (error) {
            console.error(error);
            setIndexerStatus('Failed');
            return toast.error('Failed to mint!', { position: 'top-center' })
        } finally {
            setMintLoading(false);
            setTimeout(() => setIndexerStatus(''), 4_000);
        }
    }

    const querySubgraph = async (query: string) => {
        const res = await fetch('https://api.studio.thegraph.com/query/1756082/vault-contract/1', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query }),
        });
        const json = await res.json();
        if (json.errors) throw new Error(json.errors[0].message);
        return json.data;
    };

    /**
     * One-shot fetch — used for manual Refresh and on mount.
     * Silently updates state; no success toast (avoids noise on auto-polls).
     */
    const fetchIndexerEvents = async () => {
        try {
            setIndexerLoading(true);
            setIndexerError('');

            const data = await querySubgraph(`{
              deposits(first: 10, orderBy: blockTimestamp, orderDirection: desc) {
                id sender owner assets shares blockTimestamp transactionHash
              }
              withdraws(first: 10, orderBy: blockTimestamp, orderDirection: desc) {
                id sender receiver owner assets shares blockTimestamp transactionHash
              }
              transfers(first: 10, orderBy: blockTimestamp, orderDirection: desc) {
                id from to value blockTimestamp transactionHash
              }
              approvals(first: 10, orderBy: blockTimestamp, orderDirection: desc) {
                id owner spender value blockTimestamp transactionHash
              }
            }`);

            setDeposits(data.deposits ?? []);
            setWithdraws(data.withdraws ?? []);
            setTransfers(data.transfers ?? []);
            setApprovals(data.approvals ?? []);
        } catch (error: any) {
            console.error(error);
            setIndexerError(error.message ?? 'Failed to fetch indexer events');
            toast.error('Failed to fetch indexer events!', { position: 'top-center' });
        } finally {
            setIndexerLoading(false);
        }
    };

    /**
     * pollUntilUpdated — mirrors the ERC-20 reference pattern.
     * After a write tx is mined, the indexer lags by a few seconds.
     * This polls until the top deposit/withdraw id changes (new event
     * has been indexed) or `maxWaitMs` is reached.
     */
    const pollUntilUpdated = (maxWaitMs: number, intervalMs: number) => {
        const snapshotId = deposits[0]?.id ?? withdraws[0]?.id ?? null;
        const deadline = Date.now() + maxWaitMs;

        const tick = async () => {
            if (Date.now() > deadline) return;
            try {
                const data = await querySubgraph(`{
                  deposits(first: 1, orderBy: blockTimestamp, orderDirection: desc) {
                    id
                  }
                  withdraws(first: 1, orderBy: blockTimestamp, orderDirection: desc) {
                    id
                  }
                }`);
                const latestId = data.deposits?.[0]?.id ?? data.withdraws?.[0]?.id ?? null;
                if (latestId && latestId !== snapshotId) {
                    // New event detected — do a full refresh
                    await fetchIndexerEvents();
                    return;
                }
            } catch (_) { /* silent */ }
            setTimeout(tick, intervalMs);
        };

        setTimeout(tick, intervalMs);
    };

    const isAnyLoading = walletLoading || totalAssetsLoading || assetLoading || totalSupplyLoading || balanceLoading || depositLoading || withdrawLoading || indexerLoading;

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
                            <Button
                                onClick={connectWallet}
                                size="sm"
                                className="bg-cyan-400 text-zinc-950 hover:bg-cyan-300"
                            >
                                Connect Wallet
                            </Button>
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
                            onClick={() => {
                                const addr = (balanceAddress.trim() || account);
                                if (!addr) return toast.error('No address provided!', { position: 'top-center' });
                                balanceOf(addr);
                            }}
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

                {/* ── Section divider: Mint ── */}
                <div className="flex items-center gap-3">
                    <Separator className="flex-1 bg-zinc-800" />
                    <span className="text-xs font-mono uppercase tracking-widest text-zinc-600">Mint</span>
                    <Separator className="flex-1 bg-zinc-800" />
                </div>

                {/* ── Write: Mint ── */}
                <Card className="border-zinc-800 bg-zinc-900/40">
                    <CardHeader>
                        <CardTitle className="text-base text-zinc-100">Mint Assets</CardTitle>
                        <CardDescription className="text-zinc-500">
                            Mint assets by passing in shares & a Receiver&apos;s address.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="mintAmount" className="text-xs text-zinc-400">
                                Shares
                            </Label>
                            <Input
                                id="mintAmount"
                                type="text"
                                value={mintShares}
                                onChange={(e) => setMintShares(e.target.value)}
                                disabled={mintLoading}
                                placeholder="0.0"
                                className="border-zinc-800 bg-zinc-950 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-cyan-400/40"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="mintReceiver" className="text-xs text-zinc-400">
                                Receiver Address
                            </Label>
                            <Input
                                id="mintReceiver"
                                type="text"
                                value={mintReceiver}
                                onChange={(e) => setMintReceiver(e.target.value)}
                                disabled={mintLoading}
                                placeholder="0x..."
                                className="border-zinc-800 bg-zinc-950 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-cyan-400/40"
                            />
                        </div>

                        <Button
                            onClick={() => mint(mintShares, mintReceiver)}
                            disabled={mintLoading || !account || !mintShares || !mintReceiver}
                            className="w-full bg-cyan-400 text-zinc-950 hover:bg-cyan-300"
                        >
                            {mintLoading ? (
                                <span className="flex items-center gap-2">
                                    <Spinner className="h-4 w-4" /> Minting…
                                </span>
                            ) : "Mint"}
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

                {/* ── Section divider: Redeem ── */}
                <div className="flex items-center gap-3">
                    <Separator className="flex-1 bg-zinc-800" />
                    <span className="text-xs font-mono uppercase tracking-widest text-zinc-600">Redeem</span>
                    <Separator className="flex-1 bg-zinc-800" />
                </div>

                {/* ── Write: Redeem ── */}
                <Card className="border-zinc-800 bg-zinc-900/40">
                    <CardHeader>
                        <CardTitle className="text-base text-zinc-100">Redeem Assets</CardTitle>
                        <CardDescription className="text-zinc-500">
                            Redeem owner&apos;s assets to a Receiver.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="redeemShares" className="text-xs text-zinc-400">
                                Shares
                            </Label>
                            <Input
                                id="redeemShares"
                                type="text"
                                value={redeemShares}
                                onChange={(e) => setRedeemShares(e.target.value)}
                                disabled={redeemLoading}
                                placeholder="0.0"
                                className="border-zinc-800 bg-zinc-950 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-cyan-400/40"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="redeemReceiver" className="text-xs text-zinc-400">
                                Receiver Address
                            </Label>
                            <Input
                                id="redeemReceiver"
                                type="text"
                                value={redeemReceiver}
                                onChange={(e) => setRedeemReceiver(e.target.value)}
                                disabled={redeemLoading}
                                placeholder="0x..."
                                className="border-zinc-800 bg-zinc-950 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-cyan-400/40"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="redeemOwner" className="text-xs text-zinc-400">
                                Owner Address
                            </Label>
                            <Input
                                id="redeemOwner"
                                type="text"
                                value={redeemOwner}
                                onChange={(e) => setRedeemOwner(e.target.value)}
                                disabled={redeemLoading}
                                placeholder="0x..."
                                className="border-zinc-800 bg-zinc-950 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-cyan-400/40"
                            />
                        </div>

                        <Button
                            onClick={() => redeem(redeemShares, redeemReceiver, redeemOwner)}
                            disabled={redeemLoading || !account || !redeemShares || !redeemReceiver || !redeemOwner}
                            className="w-full bg-cyan-400 text-zinc-950 hover:bg-cyan-300"
                        >
                            {redeemLoading ? (
                                <span className="flex items-center gap-2">
                                    <Spinner className="h-4 w-4" /> Redeeming…
                                </span>
                            ) : "Redeem"}
                        </Button>

                        {redeemAssets && (
                            <dl className="mt-1 divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-950/60 px-4">
                                <div className="flex items-center justify-between py-3">
                                    <dt className="text-xs text-zinc-500">Assets Redeemed</dt>
                                    <dd className="font-mono text-sm text-cyan-300">{redeemAssets}</dd>
                                </div>
                            </dl>
                        )}
                    </CardContent>
                </Card>

                {/* ── Section divider: Indexer ── */}
                <div className="flex items-center gap-3">
                    <Separator className="flex-1 bg-zinc-800" />
                    <span className="text-xs font-mono uppercase tracking-widest text-zinc-600">indexer</span>
                    <Separator className="flex-1 bg-zinc-800" />
                </div>

                {/* ── Read: Subgraph Event Feed ── */}
                <Card className="border-zinc-800 bg-zinc-900/40">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base text-zinc-100">Event Feed</CardTitle>
                                <CardDescription className="text-zinc-500">
                                    Live vault events indexed by The Graph.
                                </CardDescription>
                            </div>
                            <Button
                                onClick={fetchIndexerEvents}
                                disabled={indexerLoading}
                                variant="outline"
                                size="sm"
                                className="border-zinc-700 bg-transparent text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                            >
                                {indexerLoading ? (
                                    <span className="flex items-center gap-1.5">
                                        <Spinner className="h-3 w-3" />
                                        Syncing
                                    </span>
                                ) : (
                                    "Refresh"
                                )}
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="flex flex-col gap-4">
                        {/* Indexer status banner — live tx progress (shown during/after write tx) */}
                        {indexerStatus && (
                            <div className="flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
                                <span className="font-mono text-xs text-amber-300">{indexerStatus}</span>
                            </div>
                        )}

                        {/* Subgraph error */}
                        {indexerError && (
                            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2">
                                <p className="font-mono text-xs text-red-400">
                                    ⚠ {indexerError}
                                </p>
                                <p className="mt-1 text-xs text-zinc-500">
                                    Check that the subgraph endpoint is reachable and deployed correctly.
                                </p>
                            </div>
                        )}

                        {/* Deposits */}
                        {deposits.length > 0 && (
                            <div className="flex flex-col gap-2">
                                <p className="text-xs font-mono uppercase tracking-widest text-zinc-600">Deposits</p>
                                <dl className="divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-950/60 px-4">
                                    {deposits.map((d) => (
                                        <div key={d.id} className="flex items-center justify-between py-3">
                                            <dt className="flex flex-col gap-0.5">
                                                <span className="font-mono text-xs text-zinc-500">
                                                    {d.sender.slice(0, 6)}…{d.sender.slice(-4)}
                                                    {" → "}
                                                    {d.owner.slice(0, 6)}…{d.owner.slice(-4)}
                                                </span>
                                                <span className="font-mono text-[10px] text-zinc-700">
                                                    {new Date(Number(d.blockTimestamp) * 1000).toLocaleTimeString()}
                                                </span>
                                            </dt>
                                            <dd className="flex flex-col items-end gap-0.5">
                                                <span className="font-mono text-sm text-cyan-300">
                                                    {ethers.formatUnits(d.assets, 18)} assets
                                                </span>
                                                <span className="font-mono text-xs text-zinc-500">
                                                    {ethers.formatUnits(d.shares, 18)} shares
                                                </span>
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                        )}

                        {/* Withdraws */}
                        {withdraws.length > 0 && (
                            <div className="flex flex-col gap-2">
                                <p className="text-xs font-mono uppercase tracking-widest text-zinc-600">Withdraws</p>
                                <dl className="divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-950/60 px-4">
                                    {withdraws.map((w) => (
                                        <div key={w.id} className="flex items-center justify-between py-3">
                                            <dt className="flex flex-col gap-0.5">
                                                <span className="font-mono text-xs text-zinc-500">
                                                    {w.sender.slice(0, 6)}…{w.sender.slice(-4)}
                                                    {" → "}
                                                    {w.receiver.slice(0, 6)}…{w.receiver.slice(-4)}
                                                </span>
                                                <span className="font-mono text-[10px] text-zinc-700">
                                                    {new Date(Number(w.blockTimestamp) * 1000).toLocaleTimeString()}
                                                </span>
                                            </dt>
                                            <dd className="flex flex-col items-end gap-0.5">
                                                <span className="font-mono text-sm text-cyan-300">
                                                    {ethers.formatUnits(w.assets, 18)} assets
                                                </span>
                                                <span className="font-mono text-xs text-zinc-500">
                                                    {ethers.formatUnits(w.shares, 18)} shares
                                                </span>
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                        )}

                        {/* Transfers */}
                        {transfers.length > 0 && (
                            <div className="flex flex-col gap-2">
                                <p className="text-xs font-mono uppercase tracking-widest text-zinc-600">Transfers</p>
                                <dl className="divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-950/60 px-4">
                                    {transfers.map((t) => (
                                        <div key={t.id} className="flex items-center justify-between py-3">
                                            <dt className="flex flex-col gap-0.5">
                                                <span className="font-mono text-xs text-zinc-500">
                                                    {t.from.slice(0, 6)}…{t.from.slice(-4)}
                                                    {" → "}
                                                    {t.to.slice(0, 6)}…{t.to.slice(-4)}
                                                </span>
                                                <span className="font-mono text-[10px] text-zinc-700">
                                                    {new Date(Number(t.blockTimestamp) * 1000).toLocaleTimeString()}
                                                </span>
                                            </dt>
                                            <dd className="font-mono text-sm text-cyan-300">
                                                {ethers.formatUnits(t.value, 18)}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                        )}

                        {/* Approvals */}
                        {approvals.length > 0 && (
                            <div className="flex flex-col gap-2">
                                <p className="text-xs font-mono uppercase tracking-widest text-zinc-600">Approvals</p>
                                <dl className="divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-950/60 px-4">
                                    {approvals.map((a) => (
                                        <div key={a.id} className="flex items-center justify-between py-3">
                                            <dt className="flex flex-col gap-0.5">
                                                <span className="font-mono text-xs text-zinc-500">
                                                    {a.owner.slice(0, 6)}…{a.owner.slice(-4)}
                                                    {" approved "}
                                                    {a.spender.slice(0, 6)}…{a.spender.slice(-4)}
                                                </span>
                                                <span className="font-mono text-[10px] text-zinc-700">
                                                    {new Date(Number(a.blockTimestamp) * 1000).toLocaleTimeString()}
                                                </span>
                                            </dt>
                                            <dd className="font-mono text-sm text-emerald-300">
                                                {ethers.formatUnits(a.value, 18)}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                        )}

                        {/* Empty state — only shown when not loading, no error, and all arrays are empty */}
                        {!indexerLoading && !indexerError &&
                            !deposits.length && !withdraws.length && !transfers.length && !approvals.length && (
                                <p className="text-center font-mono text-xs text-zinc-600">
                                    No indexed events yet. Hit <span className="text-zinc-400">Refresh</span> to fetch from the subgraph.
                                </p>
                            )}

                    </CardContent>
                </Card>

            </div>
        </div>
    )
}