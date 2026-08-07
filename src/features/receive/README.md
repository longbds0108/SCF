# receive

Receiving payments: address/QR display and payment request links.

## Intended structure

As logic is added, this feature follows the shared convention:

```
receive/
├── components/   UI components scoped to this feature
├── hooks/        React Query hooks and other feature-specific hooks
├── services/     Stellar/SDK calls and business logic, framework-agnostic
├── store/        Zustand store, only if the feature needs local client state
└── types/        TypeScript types and Zod schemas for this feature
```

No business logic is implemented yet.
