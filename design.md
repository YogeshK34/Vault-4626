# 🎨 Design System Guide — ERC-20 Token Console

> Extracted from `components/Contract-Interaction.tsx`.
> Pass this file to any agent to replicate the same UI style.

---

## 1. Stack & Dependencies

- **Framework**: Next.js (App Router) with TypeScript
- **Styling**: Tailwind CSS (utility-first, no custom CSS files)
- **Component library**: [shadcn/ui](https://ui.shadcn.com/) — `Card`, `Button`, `Input`, `Label`, `Badge`, `Separator`
- **Notifications**: `sonner` toast (`toast.success`, `toast.error`, `toast.info`)
- **Custom component**: `<Spinner />` from `./ui/spinner`

---

## 2. Color Palette

All colors are from Tailwind's **zinc** scale (dark mode only) with **cyan** as the primary accent.

| Role                     | Tailwind Class(es)                                           | Notes                        |
|--------------------------|--------------------------------------------------------------|------------------------------|
| Page background          | `bg-zinc-950`                                                | Root container               |
| Card background          | `bg-zinc-900/40`                                             | Semi-transparent             |
| Input background         | `bg-zinc-950`                                                | Full opacity                 |
| Data panel background    | `bg-zinc-950/60`                                             | Result `<dl>` blocks         |
| Primary CTA button       | `bg-cyan-400 text-zinc-950 hover:bg-cyan-300`               | Write/deploy/send actions    |
| Outline button           | `border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-800 hover:text-zinc-50` | Read/fetch actions |
| Ghost button             | `text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300`        | Minor actions (e.g. "Clear") |
| Primary text             | `text-zinc-100` / `text-zinc-50`                             | Headings, content            |
| Secondary text           | `text-zinc-400` / `text-zinc-500`                            | Labels, descriptions         |
| Muted / disabled text    | `text-zinc-600`                                              | Timestamps, empty states     |
| Accent — values          | `text-cyan-300`                                              | Token amounts, addresses     |
| Accent — approvals       | `text-emerald-300`                                           | Approval amounts             |
| Status dot — idle        | `bg-emerald-400`                                             | Header badge                 |
| Status dot — processing  | `bg-amber-400 animate-pulse`                                 | Header badge                 |
| Warning banner           | `border-amber-500/30 bg-amber-500/10 text-amber-300`         | Indexer status banner        |
| Error banner             | `border-red-500/30 bg-red-500/10 text-red-400`               | Subgraph/fetch errors        |
| Card & divider borders   | `border-zinc-800`                                            | All cards, `<dl>` panels     |

---

## 3. Typography

| Element                  | Tailwind Classes                                                    |
|--------------------------|---------------------------------------------------------------------|
| Overline / section label | `text-xs font-mono uppercase tracking-[0.2em] text-zinc-500`        |
| Page title               | `text-xl font-semibold text-zinc-50`                                |
| Card title               | `text-base text-zinc-100` (via `CardTitle`)                        |
| Card description         | `text-zinc-500` (via `CardDescription`)                            |
| Form label               | `text-xs text-zinc-400`                                             |
| Data key (`dt`)          | `text-xs text-zinc-500`                                             |
| Data value (`dd`)        | `font-mono text-sm text-zinc-100` or `text-cyan-300`               |
| Monospace address        | `font-mono text-xs text-zinc-500 truncate`                          |
| Timestamp                | `font-mono text-[10px] text-zinc-700`                              |
| Section divider text     | `text-xs font-mono uppercase tracking-widest text-zinc-600`         |
| Code inline              | `<code className="text-zinc-300">`                                  |

---

## 4. Layout & Spacing

```
Root wrapper:   min-h-screen w-full bg-zinc-950 py-16 px-4 text-zinc-100
Inner column:   mx-auto flex w-full max-w-xl flex-col gap-6
```

- **Max width**: `max-w-xl` — single centered column, never wider
- **Between cards**: `gap-6`
- **Inside `CardContent`**: `flex flex-col gap-4`
- **Form field wrapper**: `flex flex-col gap-1.5`
- **Two-column grid** (e.g. Name + Symbol): `grid grid-cols-2 gap-3`
- **Inline icon + text**: `flex items-center gap-2`

---

## 5. Component Patterns

### Card

```tsx
<Card className="border-zinc-800 bg-zinc-900/40">
  <CardHeader>
    <CardTitle className="text-base text-zinc-100">Title</CardTitle>
    <CardDescription className="text-zinc-500">
      Short description of what this section does.
    </CardDescription>
  </CardHeader>
  <CardContent className="flex flex-col gap-4">
    {/* fields and button here */}
  </CardContent>
</Card>
```

---

### Form Field

```tsx
<div className="flex flex-col gap-1.5">
  <Label htmlFor="fieldId" className="text-xs text-zinc-400">
    Field label
  </Label>
  <Input
    id="fieldId"
    type="text"
    value={value}
    onChange={(e) => setValue(e.target.value)}
    placeholder="0x..."
    className="border-zinc-800 bg-zinc-950 font-mono text-sm text-zinc-100
               placeholder:text-zinc-600 focus-visible:ring-cyan-400/40"
  />
</div>
```

> Use `type="number"` for numeric fields. Keep `font-mono` on all address/amount inputs.

---

### Primary Button (write / deploy / send)

```tsx
<Button
  onClick={handler}
  disabled={loading || !account}
  className="w-full bg-cyan-400 text-zinc-950 hover:bg-cyan-300"
>
  {loading ? (
    <span className="flex items-center gap-2">
      <Spinner className="h-4 w-4" />
      Loading label
    </span>
  ) : (
    "Action label"
  )}
</Button>
```

---

### Outline Button (read / fetch)

```tsx
<Button
  onClick={handler}
  disabled={loading || !account}
  variant="outline"
  className="w-full border-zinc-700 bg-transparent text-zinc-100
             hover:bg-zinc-800 hover:text-zinc-50"
>
  {loading ? (
    <span className="flex items-center gap-2">
      <Spinner className="h-4 w-4" />
      Fetching
    </span>
  ) : (
    "Fetch label"
  )}
</Button>
```

---

### Ghost Button (minor / destructive-light)

```tsx
<Button
  onClick={handler}
  disabled={loading}
  variant="ghost"
  size="sm"
  className="self-start text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
>
  Clear
</Button>
```

---

### Data Result Panel (`<dl>`)

Used to display key-value results after reading a contract or fetching a balance.

```tsx
<dl className="mt-1 divide-y divide-zinc-800 rounded-lg border border-zinc-800
               bg-zinc-950/60 px-4">
  <div className="flex items-center justify-between py-3">
    <dt className="text-xs text-zinc-500">Key</dt>
    <dd className="font-mono text-sm text-zinc-100">Value</dd>
  </div>
  {/* Cyan accent for token amounts / addresses */}
  <div className="flex items-center justify-between py-3">
    <dt className="text-xs text-zinc-500">Symbol</dt>
    <dd className="font-mono text-sm text-cyan-300">TKN</dd>
  </div>
  {/* Truncated address */}
  <div className="flex items-center justify-between py-3">
    <dt className="text-xs text-zinc-500">Address</dt>
    <dd className="truncate font-mono text-xs text-zinc-400" title={fullAddress}>
      {fullAddress}
    </dd>
  </div>
</dl>
```

---

### Section Divider

```tsx
<div className="flex items-center gap-3">
  <Separator className="flex-1 bg-zinc-800" />
  <span className="text-xs font-mono uppercase tracking-widest text-zinc-600">
    section label
  </span>
  <Separator className="flex-1 bg-zinc-800" />
</div>
```

---

### Header with Status Badge + Wallet Badge

```tsx
<div className="flex items-center justify-between">
  <div className="flex flex-col gap-1">
    <span className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500">
      ERC-20
    </span>
    <h1 className="text-xl font-semibold text-zinc-50">Token Console</h1>
  </div>

  <div className="flex items-center gap-2">
    {/* Processing / idle dot */}
    <Badge variant="outline"
      className="gap-1.5 border-zinc-800 bg-zinc-900/60 font-mono text-xs text-zinc-400">
      <span className={`h-1.5 w-1.5 rounded-full ${
        loading ? "animate-pulse bg-amber-400" : "bg-emerald-400"
      }`} />
      {loading ? "processing" : "idle"}
    </Badge>

    {account ? (
      <>
        {/* Network badge */}
        <Badge variant="outline"
          className="border-zinc-800 bg-zinc-900/60 font-mono text-xs text-zinc-400">
          Sepolia
        </Badge>
        {/* Wallet address badge */}
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
```

---

### Status / Info Banners

```tsx
{/* Processing / warning */}
<div className="flex items-center gap-2 rounded-md border border-amber-500/30
                bg-amber-500/10 px-3 py-2">
  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
  <span className="font-mono text-xs text-amber-300">{statusMessage}</span>
</div>

{/* Error */}
<div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2">
  <p className="font-mono text-xs text-red-400">⚠ {errorMessage}</p>
  <p className="mt-1 text-xs text-zinc-500">
    Additional hint with <code className="text-zinc-300">inline code</code>.
  </p>
</div>
```

---

### Event Feed List (Transfers / Approvals)

```tsx
<div className="flex flex-col gap-2">
  <p className="text-xs font-mono uppercase tracking-widest text-zinc-600">
    Transfers
  </p>
  <dl className="divide-y divide-zinc-800 rounded-lg border border-zinc-800
                 bg-zinc-950/60 px-4">
    {items.map((evt) => (
      <div key={evt.id} className="flex items-center justify-between py-3">
        <dt className="flex flex-col gap-0.5">
          <span className="font-mono text-xs text-zinc-500">
            {evt.from.slice(0, 6)}…{evt.from.slice(-4)}
            {" → "}
            {evt.to.slice(0, 6)}…{evt.to.slice(-4)}
          </span>
          <span className="font-mono text-[10px] text-zinc-700">
            {new Date(Number(evt.blockTimestamp) * 1000).toLocaleTimeString()}
          </span>
        </dt>
        {/* Cyan for transfer values, Emerald for approval values */}
        <dd className="font-mono text-sm text-cyan-300">{evt.value}</dd>
      </div>
    ))}
  </dl>
</div>
```

---

## 6. UX Conventions

| Convention | Detail |
|---|---|
| **Loading state** | Replace button label with `<Spinner h-4 w-4 /> Loading text` inside `flex items-center gap-2` |
| **Disabled rule** | Buttons disabled when `isLoading \|\| !account` (wallet required) |
| **Address display** | Always truncate: `addr.slice(0,6)}...{addr.slice(-4)}` |
| **Monospace rule** | All addresses, amounts, symbols, and hash-like data use `font-mono` |
| **Accent by type** | Cyan (`text-cyan-300`) for balances/transfers; Emerald (`text-emerald-300`) for approvals |
| **Conditional panels** | Result panels only mount when data is present — no empty shells |
| **Toast position** | `{ position: 'top-center' }` on all `toast.success` calls |
| **Toast types** | `toast.success`, `toast.error`, `toast.info` from `sonner` |
| **Empty state text** | `text-center font-mono text-xs text-zinc-600` |

