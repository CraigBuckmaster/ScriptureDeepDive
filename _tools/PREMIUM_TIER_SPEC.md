# Companion Study — Premium Tier Implementation Spec

## "Taste the Depth" Monetization Strategy

> **Pricing:** $4.99/mo or $39.99/yr or $149.99 lifetime
> **Target conversion:** 5-8% at maturity
> **Philosophy:** Gate tools, not content. Every scholar is free. Every feature is discoverable. Depth tools are premium. The free tier is the best free Bible study app on the market.
> **No free trial.** The free tier sells itself. Users upgrade when they're ready.

---

## 1. Complete Free vs Premium Breakdown

### FREE — "The Complete Study Bible"

Everything below is permanently free and unrestricted:

**Reading:**
- All 66 books, all chapters, all verse text (NIV, ESV, KJV)
- Verse Highlight Layer (VHL) — divine names, places, people, time, key terms
- Chapter-by-chapter navigation with QNav and swipe
- Dark mode, font size control

**Section-Level Panels (per section):**
- Historical context panel (`hist`) — always free
- Hebrew/Greek summary panel (`heb`) — always free
- Cross-references panel (`cross`) — basic panel, always free
- **ALL 54 scholar panels** — every commentator, every section, always free
- All non-scholar panels: `ctx`, `trans`, `src`, `rec`, `lit`, `themes`

**Chapter-Level Panels:**
- All chapter panels free: `ppl`, `trans`, `src`, `rec`, `lit`, `hebtext`, `thread`, `tx`, `debate`, `themes`

**Explore Tools (full access):**
- Maps — all 73 places, all 28 journey stories, full interactivity
- Timeline — all 543 events, era filtering, chapter deep-links
- Genealogy tree — all 282 people, zoom, search-to-node, era filtering
- People bios — all 282 entries with scripture deep-links
- Word studies — browse all 43, see basic definition + transliteration + key verse
- Prophecy chains — browse all 50, see chain overview + link count
- Concept explorer — browse all 20 themes, see description + key verses
- Difficult passages — browse all 53, see question + consensus + full scholarly responses

**Personal:**
- Notes with tags (unlimited)
- Bookmarks (unlimited)
- All highlight colors
- Full-text search (FTS5)
- 5 reading plans
- Basic TTS with speed control
- Verse of the Day
- Reading history + streaks
- Continue Reading card on HomeScreen

**Infrastructure:**
- Full offline access — zero network dependency
- All local data persists on device

---

### COMPANION+ — "Every Perspective, Every Tool"

#### A. Scholar Access (FREE — revised April 2026)

**All 54 scholars are free** across every section in every chapter. This is a strategic
decision: scholars are CS's #1 differentiator and the reason users stay. Locking them
behind a paywall would reduce engagement and word-of-mouth growth. Instead, premium
gates depth *tools* that power users want.

#### B. Deep Study Tools (the conversion engine)

| Feature | Free Experience | Premium Experience |
|---|---|---|
| **Interlinear Hebrew/Greek** | Not available (Hebrew summary panel is free) | Tap any verse → word-level view with morphology, parsing, lemma, transliteration, linked to word studies |
| **Concordance search** | Not available | Search by Strong's number across entire Bible |
| **Cross-reference threading** | Basic cross-refs panel (free) | 31 thematic threads with full passage context and navigation |
| **Content library** | Browse titles | Full article text for all 269 entries (chiasm, discourse, background) |
| **Discourse analysis** | Not available | Argument flow visualization for Romans, Galatians, Ephesians, Hebrews, 1 Corinthians |

#### C. Explorer Depth

| Feature | Free Experience | Premium Experience |
|---|---|---|
| **Difficult passages** | Browse all 53 + see question + consensus | Full multi-view scholarly responses (4-6 per passage with tradition labels, strengths, weaknesses) |
| **Prophecy chains** | Browse all 50 + see overview | Detailed passage analysis per link with fulfillment notes |
| **Concept explorer** | Browse all 20 + description + key verses | Progressive revelation journey — trace theme development Genesis to Revelation |
| **Word studies** | Browse all 43 + basic definition | Full lexicon entry, semantic range, occurrence map, related studies |

#### D. CS Pioneering Features (all premium)

| Feature | Gate Rationale |
|---|---|
| **Chiasm visualization** | Unique to CS. High perceived value. Academic users will pay. |
| **Genre-aware study guidance** | Unique to CS. Adapts reading experience per genre. |
| **Study coaching mode** | Unique to CS. Teaches hermeneutics while studying. |
| **Study depth tracking** | Unique to CS. Shows panel exploration per section. |
| **Intertextual allusion mapping** | Unique to CS. Shows OT echoes in NT context. |
| **Manuscript stories** | Unique to CS. Accessible textual criticism. |
| **Progressive revelation tracking** | Part of Concept Explorer premium depth. |

#### E. Personal Upgrades

| Feature | Free | Premium |
|---|---|---|
| Highlight colors | All colors | Collections + organization tools |
| Reading plans | 5 plans | All 10 plans |
| TTS | Basic voice, speed control | Premium voices (AWS Polly / ElevenLabs) |
| Cross-device sync | None (device-local) | Supabase-backed cloud sync, offline-first |
| PDF export | None | Formatted study notes with scholar citations |
| Verse image cards | None | Branded shareable image generation |

---

## 2. Revenue Projections (Updated)

All figures net of Apple's 30% commission. Uses CloudFlare R2 hybrid infrastructure model.

### Assumptions

| Parameter | Conservative | Moderate | Aggressive |
|---|---|---|---|
| Year 1 end users | 40,000 | 100,000 | 330,000 |
| Conversion rate | 4% | 6% | 8% |
| Monthly vs Annual split | 30/70 | 25/75 | 20/80 |
| Lifetime purchases (first 6mo) | 200 | 500 | 1,500 |

### Net Revenue Per Subscriber (after Apple's 30%)

| Plan | Gross | Net | Net/month |
|---|---|---|---|
| Monthly ($4.99) | $4.99 | $3.49 | $3.49 |
| Annual ($39.99) | $39.99 | $27.99 | $2.33 |
| Lifetime ($149.99) | $149.99 | $104.99 | one-time |

### Year 1 Revenue (Moderate Scenario)

| Month | Users | Premium | Monthly Rev | Annual Rev | Lifetime Rev | Total Rev | Infra Cost | Profit |
|---|---|---|---|---|---|---|---|---|
| M1 | 1,000 | 60 | $52 | $112 | $5,833 | $5,997 | $20 | $5,977 |
| M3 | 6,000 | 360 | $314 | $670 | $5,833 | $6,817 | $20 | $6,797 |
| M6 | 24,000 | 1,440 | $1,257 | $2,681 | $5,833 | $9,771 | $244 | $9,527 |
| M9 | 55,000 | 3,300 | $2,882 | $6,145 | $0 | $9,027 | $244 | $8,783 |
| M12 | 100,000 | 6,000 | $5,240 | $11,173 | $0 | $16,413 | $244 | $16,169 |

**Year 1 total (moderate):** ~$127K revenue, ~$2.7K cost, **~$124K profit**

### 5-Year Summary (Moderate, 6% conversion)

| Year | Users | Revenue | Cost | Profit | Margin |
|---|---|---|---|---|---|
| 1 | 1K → 100K | $127K | $2.7K | $124K | 98% |
| 2 | 100K → 240K | $290K | $27K | $263K | 91% |
| 3 | 240K → 362K | $411K | $28K | $383K | 93% |
| 4 | 362K → 475K | $460K | $28K | $432K | 94% |
| 5 | 475K → 590K | $522K | $28K | $494K | 95% |

**5-year cumulative: ~$1.8M revenue, ~$114K cost, ~$1.7M profit**

---

## 3. Scholar Access (Revised April 2026)

**All 54 scholars are free.** No scholar selection algorithm is needed.

The original spec gated scholars (2 free per section, rest locked). This was revised because:
1. Scholars are CS's #1 differentiator — locking them reduces engagement
2. Word-of-mouth growth depends on users experiencing the full scholar breadth
3. Premium revenue is better served by gating *depth tools* (interlinear, concordance, content library, threading) that power users want
4. The free tier must be the best free Bible study app — that requires all scholars

---

## 4. Upgrade Prompt UX

### Design Principles
- **Contextual, not blocking** — the prompt appears where the user wants more, not on a separate paywall screen
- **Respectful** — one tap dismisses. No "Are you sure?" No countdown timers. No guilt.
- **Value-forward** — always says what you GET, never what you're missing
- **Consistent design language** — gold accent, scroll-style framing, Cinzel header

### Prompt Variants

**A. Premium Feature Tap (Interlinear, Concordance, Content Library, etc.)**
Trigger: User taps a premium feature entry point.
```
┌─────────────────────────────────────────┐
│  ✦  Interlinear Hebrew & Greek          │
│                                         │
│  Tap any verse to see the original      │
│  language — morphology, parsing, lemma, │
│  and links to word studies.             │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  Unlock with Companion+         │    │
│  └─────────────────────────────────┘    │
│                                         │
│                            [Not Now]    │
└─────────────────────────────────────────┘
```

**C. Difficult Passages Depth**
Trigger: User taps "View Scholarly Responses" on a difficult passage.
```
┌─────────────────────────────────────────┐
│  ✦  6 Scholarly Responses Available     │
│                                         │
│  See how scholars from different        │
│  traditions approach this passage,      │
│  with strengths and weaknesses of       │
│  each interpretation.                   │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  Unlock with Companion+         │    │
│  └─────────────────────────────────┘    │
│                                         │
│                            [Not Now]    │
└─────────────────────────────────────────┘
```

**D. Personal Feature (Highlights, Sync, Export)**
Trigger: User tries to use a 4th highlight color, or taps sync/export.
```
┌─────────────────────────────────────────┐
│  ✦  Unlimited Highlight Colors          │
│                                         │
│  Organize your study with unlimited     │
│  colors and collections.                │
│                                         │
│  Also includes: cross-device sync,      │
│  PDF export, and premium TTS voices.    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  Upgrade to Companion+          │    │
│  └─────────────────────────────────┘    │
│                                         │
│                            [Not Now]    │
└─────────────────────────────────────────┘
```

### Upgrade Prompt Frequency Limits
- **Feature lock tap:** show every time (user-initiated)
- **Proactive prompt (no tap):** maximum once per session, only after 3+ chapters read. Shows as a subtle banner, not a modal.

---

## 5. Subscription Screen

Accessible from: Settings → "Companion+" row, any upgrade prompt "Learn more" link.

```
┌─────────────────────────────────────────┐
│                                         │
│        ✦ Companion+ ✦                   │
│  Every Perspective. Every Tool.         │
│                                         │
│  ┌─────────┐ ┌─────────┐ ┌──────────┐  │
│  │ Monthly  │ │ Annual  │ │ Lifetime │  │
│  │ $4.99/mo │ │$39.99/yr│ │ $149.99  │  │
│  │          │ │SAVE 33% │ │ ONE TIME │  │
│  └─────────┘ └─────────┘ └──────────┘  │
│                                         │
│  ✓ Interlinear Hebrew & Greek           │
│  ✓ Concordance search                   │
│  ✓ Cross-reference threading            │
│  ✓ Content library (269 articles)       │
│  ✓ Word study depth + lexicon           │
│  ✓ Prophecy chain detail                │
│  ✓ Concept explorer depth               │
│  ✓ Chiasm visualization                 │
│  ✓ Discourse analysis                   │
│  ✓ All 10 reading plans                 │
│  ✓ Cross-device sync                    │
│  ✓ Premium TTS voices                   │
│  ✓ PDF study export                     │
│  ✓ Verse image cards                    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │       Subscribe Now              │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [Restore Purchase]                     │
│                                         │
│  Cancel anytime. Your study data is     │
│  always yours, even if you cancel.      │
│                                         │
└─────────────────────────────────────────┘
```

### Cancellation Behavior
- Premium features revert to free tier
- **All user data persists** — notes, highlights, bookmarks are never deleted
- Highlights created with premium colors remain visible but user can't add new ones with those colors
- Reading plans in progress continue but can't start new premium plans
- Cloud sync stops but local data remains

---

## 6. Implementation Plan

### New Files

| File | Purpose |
|---|---|
| `app/src/stores/premiumStore.ts` | Zustand store: `isPremium`, `purchaseType`, `expiresAt`, `restorePurchase()` |
| `app/src/services/purchases.ts` | expo-in-app-purchases or RevenueCat SDK wrapper |
| `app/src/components/UpgradePrompt.tsx` | Reusable modal with variant props (scholar, feature, personal) |
| `app/src/screens/SubscriptionScreen.tsx` | Full subscription screen with plan selection |
| `app/src/hooks/usePremium.ts` | `const { isPremium, showUpgrade } = usePremium()` — used everywhere |

### Modified Files

| File | Change |
|---|---|
| `PanelRenderer.tsx` | Check `isPremium` before rendering premium depth features (interlinear, concordance, content library). |
| `PanelButton.tsx` | Add lock icon variant for premium depth tools. |
| `SettingsScreen.tsx` | Add "Companion+" row with subscription status. |
| `ExploreMenuScreen.tsx` | Mark premium Explore features with subtle ✦ indicator. |
| `DifficultPassageDetailScreen.tsx` | Gate scholarly responses behind premium check. |
| `ProphecyDetailScreen.tsx` | Gate detailed link analysis behind premium. |
| `ConceptDetailScreen.tsx` | Gate progressive revelation view behind premium. |
| `WordStudyDetailScreen.tsx` | Gate full lexicon depth behind premium. |
| `ChapterScreen.tsx` | Integrate premium checks for pioneering features (chiasm, coaching, etc.). |
| `useHomeData.ts` | Add Companion+ upsell card to HomeScreen for free users (after 5+ chapters). |

### Content Pipeline Impact

**None for Option A (algorithmic scholar selection).** The algorithm runs at render time using existing panel data.

If specific chapters need hand-curated scholar pairs later, add an optional `free_scholars` array to section JSON. The algorithm checks for this override first, then falls back to the priority algorithm.

### Dependencies

| Package | Purpose |
|---|---|
| `expo-in-app-purchases` OR `react-native-purchases` (RevenueCat) | Apple/Google subscription handling |
| Supabase (Phase 14) | Premium status sync across devices |

**RevenueCat vs expo-in-app-purchases:** RevenueCat ($0 until $2.5K MRR, then 1%) handles subscription logic, receipt validation, analytics, and cross-platform status. Worth the 1% for reduced implementation complexity. expo-in-app-purchases is free but requires you to build receipt validation, status management, and analytics yourself.

**Recommendation:** Start with RevenueCat. The 1% fee at $17.5K MRR is $175/mo — trivial compared to the engineering time saved.

---

## 7. App Store Configuration

### Apple (App Store Connect)
- Create 3 subscription products in a single subscription group:
  - `companion_plus_monthly` — $4.99/mo, auto-renewing
  - `companion_plus_annual` — $39.99/yr, auto-renewing
  - `companion_plus_lifetime` — $149.99, non-consumable (one-time purchase)
- Set annual as the "featured" plan (Apple highlights this in the subscription sheet)
- Enable "Offer Codes" for promotional distribution

### Google (Play Console)
- Create matching subscription products
- Enable "Grace period" (3 days) and "Account hold" (30 days)
- Lifetime is a one-time "in-app product" not a subscription

### Both Platforms
- **Restore Purchases** button must be visible on SubscriptionScreen and in Settings
- Apple rejects apps without restore functionality
- Subscription terms must be visible before purchase

---

## 8. Metrics to Track

Once analytics are implemented (from the App Analysis recommendations):

| Metric | Purpose | Target |
|---|---|---|
| Upgrade prompt impression rate | How often users see the prompt | Track per variant (scholar, feature, personal) |
| Upgrade prompt → subscribe rate | Conversion funnel | >10% of prompt views → subscription screen |
| Subscription screen → purchase rate | Final conversion | >30% of screen views → purchase |
| Overall free → premium rate | Top-line conversion | 5-8% at 90 days |
| Churn rate (monthly) | Retention | <5% monthly |
| Plan mix (monthly/annual/lifetime) | Revenue optimization | Target 25% monthly / 60% annual / 15% lifetime |
| Most-tapped premium feature | Feature signal | Informs development priority |
| Cancellation reason | Retention improvement | Survey on cancel |

---

## 9. Launch Sequence

| Step | When | What |
|---|---|---|
| 1 | Before premium features ship | Build `premiumStore`, `usePremium`, `UpgradePrompt` infrastructure |
| 2 | Before premium features ship | Integrate RevenueCat SDK, configure products in App Store Connect + Play Console |
| 3 | With premium features | Add lock icons to PanelButton for depth tools |
| 5 | With premium features | Gate each premium feature (interlinear, concordance, etc.) as they ship |
| 6 | With premium features | Build SubscriptionScreen |
| 7 | With premium features | Add Companion+ row to SettingsScreen |
| 8 | Post-launch | Add HomeScreen upsell card (after 5+ chapters read) |
| 9 | Post-launch | Add StoreReview prompt (after 3+ chapters, never shown to users who just dismissed an upgrade prompt) |
| 10 | Ongoing | Monitor metrics, A/B test prompt copy, adjust scholar selection |

---

## 10. What Happens If Someone Cancels

This is critical for review management. Users who feel punished for canceling leave 1-star reviews.

**On cancellation:**
- Premium features revert to free tier at end of billing period
- All user-created data remains: notes, highlights (all colors visible), bookmarks, reading progress
- Cloud sync stops but local data persists
- No data is deleted, ever
- A subtle "Welcome back" banner appears in Settings: "Your Companion+ subscription has ended. Your study data is safe. [Resubscribe]"

**On lifetime purchase:**
- Never expires
- If Apple/Google receipt validation fails (server down), grace period of 7 days with full access
- Lifetime purchasers should be treated as VIPs in any future support interactions
