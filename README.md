# Vault 4626

A dark-themed, browser-based console for interacting with an ERC-4626 vault deployed on **Sepolia**. Reads vault state directly from the chain and streams live events from a **The Graph** subgraph.

---

## What's inside

| Layer | Stack |
|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS v4, shadcn/ui |
| Web3 | ethers.js v6, MetaMask (injected provider) |
| Indexer | The Graph (Studio) — AssemblyScript subgraph |
| Notifications | Sonner toasts |

---

## Contracts (Sepolia)

| Contract | Address |
|---|---|
| ERC-4626 Vault | `0x78d82788C682d7d487753Bd9df8c0fd2557BCFA1` |
| Underlying Asset | `0x109916Bcc350C331c48Bef12D6ADA1a640758E64` |

---

## UI features

- **Vault Info** — fetch asset contract address, total assets, total supply
- **Share Balance** — `balanceOf` for any address
- **Deposit / Mint** — write with MetaMask, receipt parsed for event args
- **Withdraw / Redeem** — write with MetaMask, shares burned shown on receipt
- **Event Feed** — live subgraph feed (Deposits, Withdraws, Transfers, Approvals)
  - Amber status banner tracks each tx: *Sending → Mining → Syncing → Success*
  - Auto-polls after every write until a new indexed event appears (30 s max)
  - Manual **Refresh** button in the card header

---

## Subgraph

Deployed to The Graph Studio, indexing from block `11209945` on Sepolia.

**Indexed events:** `Deposit`, `Withdraw`, `Transfer`, `Approval`

**Schema:** `vault-contract/schema.graphql`  
**Mapping:** `vault-contract/src/erc-4626.ts`

GraphQL endpoint:
```
https://api.studio.thegraph.com/query/1756082/vault-contract/1
```

---

## Local setup

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and connect MetaMask to **Sepolia**.

> The vault and asset contracts are already deployed — no local chain needed.

---

## Project structure

```
├── app/                  # Next.js app router
├── components/
│   └── Contract-Interaction.tsx   # main vault console component
├── config.ts             # contract address + ABI
├── vault-contract/       # The Graph subgraph
│   ├── schema.graphql
│   ├── subgraph.yaml
│   └── src/erc-4626.ts
```
