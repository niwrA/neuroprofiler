# Neuroprofile Vue prototype

A static, client-side Vue 3 implementation of the Neuroprofile functional specification.

## Run locally

```sh
npm install
npm run dev
```

Create a production build with:

```sh
npm run build
```

The production output is written to `dist/` and can be served by any static host.

## Implemented prototype flows

- Product landing page and evidence boundaries
- 22-question continuous self-assessment with 88 behaviourally anchored scenario options
- Multidimensional character sheet
- Interactive personality web with context overlays and accessible text data
- Five-domain orbital overview
- Multiple locally stored profiles with user-defined or memorable anonymous names
- Profile dropdown for quick switching, renaming and deletion
- Multi-profile comparison with overlaid personality webs and exact domain bars
- Context comparisons for work, friends, partner and holiday
- Broad private context intake covering work, learning, living, relationships and friendship patterns
- Ten tailored scenario questions per applicable context, stored separately per profile
- Guided sequence: context description, general baseline, then the next unfinished context
- Context-specific scenes for work, learning, home, social circles, relationships and holidays
- Construct-aligned prompts: every scene ends with the precise question its four anchored answers address
- Expanded living and social-circle choices, including living apart together and interest-based groups
- Measured-versus-illustrative evidence labels, context radar overlays, difference thresholds and written interpretations
- Non-diagnostic indicators for future optional follow-up modules
- Interactive stat explanations
- One-minute context check-in interface
- Local wearable-file privacy preview
- Browser-local persistence and deletion
- Privacy-reduced JSON export
- Responsive and keyboard-accessible interaction patterns

## Important status

The questions, scores, context offsets, narratives and rhythm data are illustrative prototype material. They are not clinically or psychometrically validated and must not be used for diagnosis or consequential decisions.

Before public release, follow the validation, licensing, accessibility, security and governance work described in the functional specification.
