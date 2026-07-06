Context: I have a design.md file (attached) that is the complete design system extracted from my ERC-20 Token Console project. I now need you to build the UI component for my ERC-4626 Vault Console — a new page — using this design system exactly and strictly.
Your constraints — non-negotiable:

Follow design.md as the single source of truth for every visual decision
Do not introduce any new colors, fonts, spacing values, or component patterns not present in design.md
Use the same stack: Next.js App Router, TypeScript, Tailwind CSS utility classes only, shadcn/ui components (Card, Button, Input, Label, Badge, Separator), sonner for toasts, and a <Spinner /> from ./ui/spinner
Dark mode only, zinc scale + cyan accent — exactly as specified in Section 2
All typography must follow Section 3 exactly — font-mono on all addresses/amounts, text-zinc-100 for primary text, text-zinc-500 for descriptions
No serif fonts anywhere — headings use text-xl font-semibold text-zinc-50, card titles use text-base text-zinc-100

What to build — ERC-4626 Vault Console sections:

Header — same pattern as Token Console header. Overline: ERC-4626, title: Vault Console, same status badge + wallet badge pattern
Vault Info (read) — fetch asset(), totalAssets(), totalSupply() from the vault contract. Outline button. Results in a <dl> panel
Share Balance (read) — input for wallet address, fetch balanceOf(). Outline button. Result in <dl> panel
Deposit (write) — inputs for amount and receiver address, calls deposit(assets, receiver). Primary cyan button
Withdraw (write) — inputs for amount, receiver, owner, calls withdraw(assets, receiver, owner). Primary cyan button
Section dividers between each group, labeled: VAULT INFO, BALANCE, DEPOSIT, WITHDRAW — same divider pattern from Section 5 of design.md

Also follow these UX conventions from Section 6:

Buttons disabled when isLoading || !account
All addresses truncated addr.slice(0,6)}...{addr.slice(-4)}
Result panels only render when data exists
Toast position top-center
Cyan for asset/share amounts, Emerald for approval-style values

Apply to: components/Contract-Interaction.tsx
