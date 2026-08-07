# send

Unified send flow for XLM and other assets, including fee estimation and the sign-and-submit
pipeline.

## Intended structure

As logic is added, this feature follows the shared convention:

```
send/
├── components/   UI components scoped to this feature
├── hooks/        React Query hooks and other feature-specific hooks
├── services/     Stellar/SDK calls and business logic, framework-agnostic
├── store/        Zustand store, only if the feature needs local client state
└── types/        TypeScript types and Zod schemas for this feature
```

No business logic is implemented yet.
