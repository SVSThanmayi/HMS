# Frontend AGENTS.md
## Angular 22 + Angular Material Engineering Rules

> This file defines frontend engineering and architecture rules only.
> It intentionally contains no product requirements, domain workflows, feature scope, or business rules.
> Functional behavior must come from the applicable requirements/specification files and explicit instructions.

---

## 1. Technology Baseline

Use the following frontend baseline for new work:

- Angular 22.x
- Angular Material 22.x
- Angular CDK 22.x
- TypeScript with strict mode enabled
- RxJS
- Angular Router
- Angular HttpClient
- Standalone Angular architecture
- Zoneless Angular change detection
- SCSS/CSS

Rules:

- Keep Angular, Angular Material, and Angular CDK on compatible matching majors.
- Use the latest stable patch/minor already approved for the workspace.
- Never use prerelease, `next`, RC, or experimental packages unless explicitly requested.
- Never upgrade Angular or major dependencies as a side effect of unrelated feature work.
- Use Angular CLI migrations for framework upgrades.
- Prefer Angular-native APIs before adding third-party packages.

---

## 2. Core Engineering Principles

- Use modern standalone Angular architecture.
- Organize code by feature/domain rather than by technical file type.
- Keep components focused on presentation and orchestration.
- Keep HTTP/data-access logic out of page components.
- Keep business-critical rules authoritative on the backend.
- Treat route guards and hidden UI as UX controls, never as security boundaries.
- Keep TypeScript strict and fully typed.
- Prefer explicit, simple code over clever abstractions.
- Avoid speculative abstractions.
- Create shared abstractions only after genuine repeated use appears.
- Keep state ownership clear and avoid multiple writable copies of the same data.
- Lazy-load major feature areas.
- Handle loading, empty, error, and success states intentionally.
- Preserve accessibility and keyboard behavior.
- Respect existing conventions when they are modern, consistent, and reasonable.
- Do not rewrite unrelated architecture while implementing a focused change.

---

## 3. Recommended Application Structure

Prefer feature-oriented organization.

```text
src/
  app/
    core/
      auth/
      config/
      guards/
      interceptors/
      layout/
      error-handling/

    shared/
      ui/
      directives/
      pipes/
      utilities/

    features/
      feature-a/
        data-access/
        models/
        pages/
        state/
        ui/
        feature-a.routes.ts

      feature-b/
        data-access/
        models/
        pages/
        state/
        ui/
        feature-b.routes.ts

    app.config.ts
    app.routes.ts

  styles/
    _tokens.scss
    _theme.scss
    _typography.scss
```

This is a direction, not a requirement to create empty folders.

Only create folders when real code belongs in them.

### Feature ownership

A feature should own its own:

- routes
- pages
- feature-specific UI components
- API/data-access services
- models
- local/feature state
- validators
- mappers
- tests

Do not move feature-specific code into `shared/` merely because it may be reusable someday.

---

## 4. `core/` Rules

`core/` is for app-wide singleton infrastructure only.

Good candidates:

- authentication infrastructure
- global app configuration
- global HTTP interceptors
- application shell/layout
- global guards
- global error handling
- session handling
- app-wide telemetry infrastructure

Do not put feature-specific services, models, or UI components in `core/`.

A service is not automatically `core` because it uses `providedIn: 'root'`.

---

## 5. `shared/` Rules

`shared/` contains reusable, feature-agnostic frontend building blocks.

Good candidates:

- reusable UI primitives
- generic directives
- generic pipes
- formatting helpers
- generic form controls
- reusable layout primitives

Rules:

- Shared code must not depend on a specific feature.
- If a component is used only by one feature, keep it in that feature.
- Avoid turning `shared/` into a dumping ground.
- Avoid vague folders such as `common`, `misc`, `helpers`, or `utils` unless ownership is genuinely cross-cutting and clear.

---

## 6. Standalone Angular Only

For new code:

- Use standalone components.
- Use standalone directives.
- Use standalone pipes.
- Bootstrap using `bootstrapApplication`.
- Configure app-wide providers through `ApplicationConfig`.
- Use route-level providers for route-scoped dependencies.

Do not create:

- feature NgModules
- `SharedModule`
- a giant `MaterialModule`

Use NgModules only when an existing third-party or legacy integration genuinely requires them.

---

## 7. Zoneless Angular

Angular 21+ is zoneless by default. Angular 22 code must remain zoneless-compatible.

Rules:

- Do not add Zone.js back unless explicitly required.
- Do not configure `provideZoneChangeDetection()` for normal Angular 22 apps.
- Prefer signals, Angular event bindings, `AsyncPipe`, and Angular-supported update mechanisms.
- Do not depend on `NgZone.onStable`, `onUnstable`, or `onMicrotaskEmpty`.
- Do not use `setTimeout()` to force Angular UI updates.
- Do not use `detectChanges()` as normal application architecture.
- Use `markForCheck()` only when an integration genuinely requires it.
- Prefer OnPush-compatible component patterns.

Fix data-flow problems rather than forcing change detection.

---

## 8. TypeScript Rules

- Keep `strict` enabled.
- Do not use `any`.
- Do not use `as any`.
- Use `unknown` and narrow safely when the type is genuinely unknown.
- Avoid broad type assertions.
- Avoid non-null assertion `!` unless an invariant makes it unquestionably safe.
- Prefer inference for obvious local values.
- Explicitly type public contracts and API boundaries.
- Use `readonly` when reassignment is not intended.
- Prefer immutable state updates.
- Prefer discriminated unions for variant states.
- Avoid repeated magic strings.
- Centralize contract values where they represent API states/types.
- Never suppress TypeScript errors merely to make a build pass.
- Keep compiler errors and warnings clean.

---

## 9. File and Naming Conventions

Follow Angular naming conventions.

- Use kebab-case file names.
- Keep related component files aligned.
- Tests use `.spec.ts`.
- Prefer one primary concept per file.

Example:

```text
user-search.ts
user-search.html
user-search.scss
user-search.spec.ts
```

Avoid generic names such as:

- `helper.ts`
- `common.ts`
- `functions.ts`
- `misc.ts`
- `data.ts`

Name files after their actual responsibility.

---

## 10. Dependency Injection

Prefer Angular's `inject()` function in new code.

```ts
private readonly api = inject(UserApi);
private readonly router = inject(Router);
```

Rules:

- Keep injected dependencies `private` unless the template genuinely requires access.
- Prefer exposing state/view models instead of exposing services directly to templates.
- Use injection tokens for application configuration.
- Do not manually instantiate Angular services with `new`.
- Do not use service-locator patterns.
- Use route-level providers when service lifetime belongs to a lazy feature route tree.

---

## 11. Component Responsibilities

A page/container component may:

- read route state
- coordinate feature services/state
- trigger feature actions
- compose child components
- translate UI events into feature operations

A component should not:

- construct raw API URLs
- contain transport-specific parsing everywhere
- perform feature HTTP calls directly
- become the authoritative source for authorization
- contain large unrelated workflows
- perform expensive calculations repeatedly from templates
- mutate data received through inputs

Keep page components relatively thin.

Extract child components when they represent a meaningful UI responsibility, not merely to reduce line count.

---

## 12. Modern Component APIs

Prefer:

- `input()`
- `input.required()`
- `output()`
- `model()` only when genuine two-way component state is appropriate

Avoid introducing decorator-based `@Input()` / `@Output()` in new code unless local consistency strongly requires it.

Rules:

- Treat inputs as immutable.
- Never mutate input objects.
- Emit clear events from presentational components.
- Avoid components with dozens of boolean inputs.
- Prefer composition over giant configurable components.

---

## 13. Class Member Visibility

- Use `private` for implementation details.
- Use `protected` for values only used by the template.
- Use `public` only when the class API actually requires it.
- Mark stable references and injected dependencies `readonly`.

Example:

```ts
protected readonly isLoading = signal(false);
private readonly api = inject(ApiService);
```

---

## 14. Templates

Use modern Angular template control flow in new code:

- `@if`
- `@else`
- `@for`
- `@empty`
- `@switch`
- `@case`
- `@defer`

Rules:

- Always provide a stable tracking expression for `@for`.
- Never track by array index when a stable entity ID exists.
- Keep templates declarative.
- Avoid complex expressions and nested ternaries.
- Move derived values to `computed()` or prepared view models.
- Avoid expensive method calls from templates.
- Prefer semantic HTML.
- Avoid deeply nested conditional markup when a simpler view model can express the state.

---

## 15. Class and Style Bindings

Prefer direct bindings for simple cases:

```html
<div [class.active]="isActive()"></div>
<div [style.width.px]="width()"></div>
```

Prefer `class` and `style` bindings over `ngClass` and `ngStyle` when simple bindings are sufficient.

Do not manipulate classes through `ElementRef` for normal UI state.

---

## 16. Signals

Signals are the default choice for synchronous UI/application state.

Use:

- `signal()` for writable state
- `computed()` for derived state
- `linkedSignal()` only when its semantics genuinely fit
- `effect()` only for side effects

Rules:

- Keep one source of truth.
- Do not duplicate writable state that can be derived.
- Do not mutate state inside `computed()`.
- Do not hide network calls inside `computed()`.
- Expose readonly state when consumers must not mutate it.
- Avoid app-wide writable signals without explicit ownership.

---

## 17. `effect()` Rules

Use `effect()` only for actual side effects such as:

- browser API integration
- analytics
- persistence where explicitly appropriate
- synchronization with non-Angular systems

Do not use `effect()` to copy state between signals.

Bad architecture:

```text
Signal A
  ↓ effect
Signal B
  ↓ effect
Signal C
```

Use `computed()` for derivation instead.

Effects must have clear ownership and cleanup behavior.

---

## 18. RxJS

Use RxJS when stream semantics are natural.

Good uses:

- HTTP pipelines
- cancellation
- debounced search
- route/event composition
- WebSocket/event streams
- combining async sources
- ordered or concurrent async workflows
- retry/backoff where safe

Do not replace every Observable with signals.
Do not replace every signal with Observables.

Choose the abstraction based on semantics.

---

## 19. RxJS Concurrency Operators

Choose flattening operators intentionally:

- `switchMap` — cancel stale work when a new value supersedes it
- `concatMap` — preserve order and run sequentially
- `exhaustMap` — ignore new triggers while one operation is active
- `mergeMap` — run operations concurrently when concurrency is genuinely safe

Typical guidance:

- search/autocomplete → `switchMap`
- duplicate-submit protection → often `exhaustMap`
- ordered async queue → `concatMap`
- independent parallel operations → `mergeMap`

Never choose a flattening operator without considering its concurrency semantics.

---

## 20. Subscription Management

Prefer:

- `AsyncPipe`
- signals derived from observables
- Angular lifecycle-aware subscription patterns

When manual subscription is required:

- use `takeUntilDestroyed()`
- avoid unmanaged subscriptions
- avoid nested subscriptions

Bad:

```ts
this.a$.subscribe(a => {
  this.b$(a).subscribe(...);
});
```

Compose the streams instead.

---

## 21. Signal / Observable Interop

Use Angular interop deliberately:

- `toSignal()` when an Observable naturally drives synchronous UI state
- `toObservable()` when signal state must enter an RxJS pipeline

Do not repeatedly convert the same state back and forth.

Create conversions near the boundary and reuse them.

---

## 22. State Management Strategy

Default hierarchy:

1. Component-local signals for local UI state.
2. Feature service/store with signals for shared feature state.
3. RxJS for asynchronous orchestration and streams.
4. External global state library only when proven complexity justifies it.

Do not add NgRx, NGXS, Akita, Elf, Redux, or another state library by default.

A global state library requires an explicit architectural reason.

---

## 23. Feature Store Pattern

When shared feature state is needed, use a focused feature store/service.

A feature store should:

- own feature state
- expose readonly state
- expose `computed()` selectors
- expose explicit actions/methods
- delegate transport calls to data-access services
- keep components free from transport concerns

Do not create one global mega-store.
Do not turn every service into a store.

---

## 24. Server State

Treat backend data as server-owned state.

Rules:

- Avoid multiple independent writable copies of the same server entity.
- Update local state intentionally after mutations.
- Prefer re-fetch/invalidation when correctness is more important than optimistic complexity.
- Use optimistic updates only when rollback is safe and UX benefit is clear.
- Never fabricate backend success.
- Represent loading, empty, error, and success explicitly.

---

## 25. API Architecture

Page/components must not use `HttpClient` directly for feature API operations.

Preferred dependency direction:

```text
Page / Container
      ↓
Feature State / Orchestration
      ↓
Data Access / API
      ↓
HttpClient
```

A feature data-access area may contain:

```text
data-access/
  feature.api.ts
  feature.models.ts
  feature.mapper.ts
```

Do not create unnecessary layers for trivial features.

---

## 26. HttpClient Rules

- Configure HttpClient centrally with `provideHttpClient`.
- Prefer functional interceptors.
- Keep API base URLs in typed configuration, not feature code.
- Never hardcode production URLs.
- Type every request and response.
- Never return `Observable<any>`.
- Use `HttpParams` or typed helpers instead of manual query-string concatenation.
- Keep transport-specific details out of UI components.

---

## 27. HTTP Interceptors

Use functional interceptors for genuinely cross-cutting transport concerns.

Good interceptor concerns:

- authentication headers
- correlation/request IDs
- global transport metadata
- normalized transport-level errors

Do not put feature business logic in interceptors.
Do not make interceptors display feature-specific snackbars.
Do not blindly retry unsafe mutation requests.

Retry behavior must respect idempotency.

---

## 28. API Models and Mapping

Differentiate when useful between:

- request DTOs
- response DTOs
- view models
- editable form models

Do not create pointless duplicate types when the structures are genuinely identical.

Use mappers when:

- transport naming differs from UI naming
- transport representation differs substantially
- normalization is required
- backend shape changes should be isolated from UI code

Do not scatter ad-hoc response mapping through components.

---

## 29. Error Handling

Every server-backed UI must intentionally handle:

- loading
- success
- empty
- recoverable error
- unrecoverable error where applicable

Rules:

- Never swallow errors.
- Never leave loading state active after failure.
- Do not show raw backend stack traces.
- Use clear user-facing messages.
- Keep diagnostic detail only where safe.
- Allow feature-specific handling after global transport normalization.
- Do not reduce every failure to a useless generic message when a safer specific message is available.

---

## 30. Forms Strategy

Angular 22 supports both:

- strictly typed Reactive Forms
- stable Signal Forms

Choose one approach consistently within a feature/form.

### Prefer strictly typed Reactive Forms when:

- an existing area already uses them
- complex dynamic `FormGroup`/`FormArray` behavior is required
- mature Angular Material form integration is desirable
- existing validation infrastructure is reactive-form based

### Signal Forms may be used when:

- the feature is new
- signal-native form state improves clarity
- the Angular Material controls being used integrate cleanly
- the team intentionally chooses the approach

Do not mix Reactive Forms and Signal Forms inside one form without a strong reason.
Do not use untyped forms.

---

## 31. Reactive Forms Rules

- Use strictly typed forms.
- Prefer `NonNullableFormBuilder` when null is not a valid value.
- Use `FormArray` for homogeneous dynamic collections.
- Use `FormRecord` for dynamic keyed controls where appropriate.
- Keep reusable validators focused and typed.
- Keep feature-specific validation near the owning feature.
- Frontend validation improves UX; backend validation remains authoritative.
- Prevent duplicate submission while a mutation is active.
- Preserve user input after recoverable submission failure.

---

## 32. Signal Forms Rules

When Signal Forms are selected:

- keep the form model strongly typed
- define validation through schemas where appropriate
- keep validation logic out of templates
- do not put unrelated application state into the form model
- test form logic independently when practical
- do not adopt Signal Forms merely because they are newer
- verify Material compatibility for the controls used

---

## 33. Form UX Rules

- Every field needs a visible or accessible label.
- Required fields must be understandable.
- Validation messages must explain the problem.
- Do not show every validation error before interaction unless submission was attempted.
- Preserve intentional input after recoverable errors.
- Disable only controls that are truly disabled.
- Use readonly when the value is readable but not editable.
- Do not use placeholders as the only label.
- Use appropriate input types and autocomplete attributes.
- Break very large forms into logical sections when that improves usability.

---

## 34. Routing

Use Angular Router with feature-local lazy routes.

Recommended:

```text
app.routes.ts
features/feature-a/feature-a.routes.ts
features/feature-b/feature-b.routes.ts
```

Rules:

- Lazy-load major feature areas.
- Keep route definitions close to the feature.
- Use `loadComponent` for standalone page routes where appropriate.
- Use `loadChildren` for route groups.
- Use route-level providers for feature-scoped services.
- Provide a deliberate not-found route.
- Do not place sensitive data in URLs.
- Prefer IDs over serialized objects in route parameters.
- Do not rely on navigation state as the only durable source of required page data.

---

## 35. Guards and Resolvers

Route guards are for navigation UX only.

Use guards for:

- authentication navigation
- permission/role navigation
- unsaved-change warnings where appropriate

Rules:

- Backend must enforce authorization independently.
- Keep guards small.
- Do not use guards as business-rule engines.
- Avoid large data loads inside guards.
- Use resolvers only when navigation genuinely must wait for required data.

---

## 36. Lazy Loading and Deferrable Views

- Lazy-load major feature areas.
- Keep the initial shell lean.
- Do not create artificial chunks for tiny components.
- Use `@defer` for expensive, secondary, non-critical UI where it produces real value.

Good `@defer` candidates:

- heavy charts
- secondary analytics
- expensive rarely-viewed widgets

Do not defer content that must be immediately visible or interactive.

Provide appropriate placeholder/loading/error states where needed.

---

## 37. Angular Material as Primary UI Library

Use Angular Material consistently for standard application controls.

Prefer Material for:

- form fields
- inputs
- autocomplete
- select
- datepicker
- buttons
- icons
- dialogs
- snackbars
- menus
- tabs
- steppers
- tables
- paginator
- sort
- tooltips
- sidenav
- toolbar
- expansion panels
- progress indicators

Use Angular CDK when Material does not provide the needed visual component but CDK provides the behavioral primitive.

Do not introduce another UI component library casually.

---

## 38. Material Imports

Do not create a giant Material import/export module.

In standalone components, import only the Material pieces actually used by the component.

This keeps dependencies explicit and supports tree-shaking.

Do not globally import all Material components for convenience.

---

## 39. Material 3 Theming

Use Angular Material's supported Material 3 theming APIs.

Rules:

- Centralize theme creation.
- Include Material core styles only as required by the supported theming API; avoid duplicate theme emission.
- Define color, typography, and density intentionally.
- Centralize light/dark theme behavior if multiple themes are supported.
- Use Material theming APIs for Material components.
- Use application design tokens for custom UI.
- Do not read or depend on Material theme internals directly.
- Do not copy Material internal styles into application code.

---

## 40. Styling Material Components

Preferred customization order:

1. Use the documented component API.
2. Use documented Material theming APIs.
3. Use documented tokens/CSS variables where supported.
4. Style application wrappers/layout outside the component.
5. Build a custom component when the required design fundamentally differs.

Do not:

- target undocumented internal Material CSS classes
- rely on internal Material DOM structure
- use `::ng-deep` in new code
- copy/paste private Material implementation CSS

If an unavoidable legacy override exists, isolate and document it.

---

## 41. Angular CDK

Prefer CDK primitives instead of rebuilding complex infrastructure.

Use CDK where appropriate for:

- overlay
- accessibility/focus helpers
- drag and drop
- clipboard
- virtual scrolling
- portals

Do not hand-roll these primitives unless CDK genuinely cannot satisfy the requirement.

---

## 42. Tables and Large Lists

For data-heavy screens:

- use typed row models
- support loading/empty/error states
- paginate large datasets
- perform filtering/sorting on the server when data volume requires it
- avoid rendering unbounded records
- preserve accessible table semantics
- use virtual scrolling only when it solves a measured problem

Do not build a universal mega-table with dozens of configuration flags until repeated use clearly justifies it.

---

## 43. Dialogs

Dialogs should:

- have one clear purpose
- receive typed input data
- return typed results
- provide explicit confirm/cancel behavior
- manage focus correctly

Do not place large multi-page workflows inside dialogs.

Use pages for workflows that are too large for a focused modal interaction.

---

## 44. Search and Autocomplete

For remote autocomplete/search:

- debounce input
- use `distinctUntilChanged()`
- avoid meaningless requests for empty/too-short terms where appropriate
- use `switchMap()` to cancel stale requests
- show loading state
- show no-results state
- keep selected model separate from display text
- handle network errors cleanly
- do not fetch entire large datasets merely to filter in the browser

---

## 45. Loading and Mutation State

Avoid one global loading boolean for the whole application.

Use operation-specific state such as:

```text
isPageLoading
isSaving
isDeleting
isSearching
isRefreshing
```

Rules:

- Do not block unrelated UI for a small background request.
- Prevent duplicate mutations while the same operation is active.
- Show success only after confirmed success.
- Restore interaction correctly after errors.

---

## 46. Empty States

Every list/data screen must intentionally handle:

- no records
- no filter matches
- no search results

An empty state is not an error state.

Provide a relevant action when one logically exists.

---

## 47. Accessibility

Target WCAG AA behavior.

Rules:

- Use semantic HTML before ARIA.
- Every form control needs an accessible label.
- All interactive controls must be keyboard accessible.
- Icon-only buttons require accessible names.
- Focus must remain visible.
- Dialog focus must be managed correctly.
- Validation errors must be perceivable.
- Never communicate state using color alone.
- Maintain sufficient contrast.
- Respect reduced-motion preferences for substantial animation.
- Avoid positive `tabindex`.
- Do not use clickable `<div>` elements when a `<button>` or `<a>` is correct.

Do not break Material/CDK accessibility behavior with custom styling.

---

## 48. Keyboard Interaction

For custom interactive controls:

- follow standard ARIA interaction patterns
- support expected keyboard behavior
- keep focus order logical
- allow Escape to dismiss appropriate overlays
- never trap focus accidentally
- use CDK accessibility utilities where appropriate

Do not invent unusual keyboard behavior without a strong UX reason.

---

## 49. Performance

- Lazy-load major features.
- Keep initial bundles small.
- Use `NgOptimizedImage` where appropriate.
- Use `@defer` for heavy non-critical content.
- Use stable list tracking.
- Use signals/computed values rather than repeated expensive template work.
- Paginate large collections.
- Do not load huge reference datasets unnecessarily.
- Keep third-party dependencies minimal.
- Prefer CSS Grid/Flexbox over JavaScript layout calculation.
- Profile before adding complex performance abstractions.

---

## 50. Image Rules

Use `NgOptimizedImage` for suitable application images.

Rules:

- provide dimensions/aspect ratio where practical
- prioritize only true LCP images
- lazy-load non-critical images
- avoid large base64 image state
- avoid unnecessarily oversized assets
- provide meaningful alt text
- use empty alt text for decorative imagery

---

## 51. Browser API Access

Do not scatter direct usage of browser globals throughout components.

Examples:

```text
window
document
localStorage
sessionStorage
navigator
```

Wrap significant browser concerns in focused services/utilities when that improves testability and platform safety.

Use Angular abstractions where appropriate.

If SSR is enabled, guard browser-only behavior.

---

## 52. SSR and Hydration

Do not add SSR merely because Angular supports it.

Use SSR when there is a product reason such as:

- SEO
- social previews
- improved public first render

If SSR/hydration is enabled:

- do not assume browser globals exist on the server
- avoid non-deterministic server/client markup
- avoid DOM mutation before hydration
- keep templates hydration-safe
- use Angular platform APIs appropriately
- use deferred/incremental hydration only where it provides real value

---

## 53. Frontend Security Rules

The browser is not a trusted security boundary.

Rules:

- Never place secrets in Angular environment files.
- Treat all shipped configuration as public.
- Never expose database credentials or private API keys.
- Never rely on hidden buttons or disabled controls for authorization.
- Never rely only on route guards.
- Avoid unsafe HTML rendering.
- Do not bypass Angular sanitization without explicit security review.
- Avoid `innerHTML` when normal bindings/components can render the content.
- Never log auth tokens, passwords, or sensitive data.
- Keep sensitive data out of URLs.
- Minimize sensitive client-side persistence.

---

## 54. Authentication Architecture

Authentication implementation must follow the backend/session contract.

Frontend architecture must:

- centralize auth state
- centralize session/token handling
- centralize auth HTTP behavior
- centralize session-expiry behavior
- centralize logout cleanup
- avoid per-feature auth implementations

Do not invent a token-storage strategy independently of the security design.

UI role checks are convenience only; backend authorization remains authoritative.

---

## 55. Application Configuration

Use typed, centralized application configuration.

Good candidates:

- API base URL
- public environment identity
- build metadata
- non-secret feature flags

Rules:

- do not scatter environment/config access through features
- do not store secrets
- fail clearly when required public configuration is missing

---

## 56. Styling and Design Tokens

Centralize reusable visual primitives such as:

- spacing
- typography
- border radius
- elevation
- semantic colors
- layout sizes
- breakpoints where needed

Do not repeat magic values throughout many components.

Do not create a token for every one-off number.

Use Material theming for Material components and application design tokens for custom application UI.

---

## 57. Global Styles

Global styles should be limited to:

- reset/base styles
- typography foundation
- Material theme
- design tokens
- application-shell behavior
- truly global utilities

Feature-specific styles belong with the feature/component.

Do not fix local layout problems by adding broad global selectors.

---

## 58. Responsive Design

- Prefer CSS Grid and Flexbox.
- Use logical breakpoints.
- Avoid JavaScript width calculations for normal responsive layout.
- Avoid fixed pixel widths for primary page structures.
- Avoid horizontal scrolling for standard forms/pages.
- Test narrow screens, normal desktop, large desktop, zoom, and long content.

Responsive architecture should be structural rather than a collection of arbitrary patches.

---

## 59. Notifications and Snackbars

Use snackbars for short transient feedback such as:

- save success
- copy success
- simple non-blocking error

Do not use snackbars for:

- critical decisions
- long error details
- complex workflows

Keep snackbar infrastructure reusable while message meaning remains feature-owned.

---

## 60. Dates and Time

Use one consistent strategy.

Rules:

- use explicit transport date/time formats
- do not parse dates with manual string slicing
- centralize display formatting patterns
- keep timezone handling explicit
- do not assume local timezone semantics for server timestamps
- use Material Datepicker adapters consistently when applicable
- avoid multiple date libraries unless genuinely required

---

## 61. Internationalization Readiness

Even when localization is not enabled:

- avoid concatenating sentences from fragments
- avoid logic based on displayed text
- allow layouts to tolerate text expansion
- keep user-facing strings structured enough to migrate later

Do not add a full i18n framework unless required.

---

## 62. Testing Strategy

Tests should verify observable behavior rather than implementation details.

Prioritize:

1. pure logic
2. feature store/state behavior
3. form validation
4. component interaction
5. routing/guards
6. data-access behavior
7. critical end-to-end journeys

Use the test runner already configured by the Angular workspace.

Do not switch test frameworks casually.

---

## 63. Component Tests

Component tests should verify things such as:

- rendered state
- user interaction
- outputs/events
- validation feedback
- loading state
- empty state
- error state
- accessibility-critical behavior

Do not test private methods merely because they exist.

Prefer interacting with the DOM through user-observable behavior.

---

## 64. Angular Material Test Harnesses

Use Angular Material component harnesses where they make tests more stable and meaningful.

Prefer harnesses over brittle selectors into Material internal DOM.

Do not test undocumented Material implementation structure.

---

## 65. Data-Access Tests

Data-access tests should verify relevant behavior such as:

- HTTP method
- endpoint
- request params
- request payload
- response typing/mapping
- error behavior

Do not duplicate backend unit tests in frontend tests.

---

## 66. End-to-End Tests

Keep E2E coverage focused on high-value complete journeys.

Do not attempt to E2E-test every component variation.

Use stable semantic selectors rather than brittle CSS structure.

---

## 67. Logging

Do not leave uncontrolled `console.log()` calls in production code.

Never log:

- passwords
- authentication tokens
- secrets
- sensitive personal data
- complete sensitive server payloads

Technical logging should be intentional and safe.

---

## 68. Comments and TODOs

Comments should explain **why**, not restate the code.

Remove obsolete commented-out code.

TODOs must be specific and actionable.

Avoid vague TODOs such as:

```text
TODO fix later
```

---

## 69. Avoid Premature Abstractions

Do not create these by default:

- base page classes
- generic CRUD frameworks
- universal form builders
- universal modal engines
- universal mega-tables
- repository layers
- facade layers

Create an abstraction only when repeated complexity proves it useful.

A few repeated explicit lines are often better than an abstraction nobody understands.

---

## 70. Prefer Composition Over Inheritance

Avoid inheritance-heavy Angular architecture such as:

```text
BasePageComponent
BaseCrudComponent
BaseFormComponent
BaseApiService
```

Prefer:

- composition
- services
- pure functions
- directives
- reusable components
- dependency injection

Use inheritance only when there is a clear, proven need.

---

## 71. Pipes

Pipes are for presentation transformations.

Good:

- formatting
- simple deterministic display transformations

Bad:

- HTTP requests
- permission decisions
- state transitions
- business workflows
- side effects

Prefer pure pipes.

---

## 72. Directives

Create a directive when there is reusable host-element behavior.

Do not create directives merely to move a few lines out of a template.

A directive must have a clear reusable responsibility.

---

## 73. Services

A service must have one clear purpose.

Appropriate responsibilities include:

- API access
- feature state
- feature orchestration
- browser integration
- cross-cutting application infrastructure

Avoid god services with unrelated responsibilities.

Use a pure function instead of a service when no Angular dependency/state is needed.

---

## 74. Pure Utilities

Pure utilities should:

- be deterministic
- avoid mutation
- have no Angular injection dependency
- stay near the owning feature unless truly cross-feature
- have responsibility-specific names

Do not build generic utility dumping grounds.

---

## 75. Immutability

Prefer immutable state updates.

Do not mutate:

- component inputs
- shared arrays/objects
- cached server entities
- signal values in place without an explicit update/set

Prefer patterns such as:

```ts
items.update(current => [...current, item]);
```

---

## 76. Async User Actions

For save/update/delete operations:

- expose explicit pending state
- prevent accidental duplicate submission
- show success only after confirmed success
- handle errors
- preserve user input after recoverable failure
- restore interaction correctly

Do not pretend an operation succeeded unless implementing a deliberate optimistic workflow with safe rollback.

---

## 77. Destructive Actions

For significant destructive actions:

- make the consequence clear
- require confirmation when appropriate
- prevent duplicate triggering
- expose pending state
- handle server rejection correctly
- preserve an audit-friendly UI flow where applicable

Do not permanently remove local state before confirmation unless rollback exists.

---

## 78. Concurrency Awareness

Assume server state may change independently of the current browser.

Frontend rules:

- revalidate important operations with the server
- handle conflicts gracefully
- do not treat stale UI state as authority
- avoid race conditions in autocomplete/search
- avoid duplicate mutation races
- respect server concurrency/version controls when provided

---

## 79. Status Presentation

Never represent state through color alone.

Use a combination of:

- text
- icon
- semantic label
- color

Ensure assistive technology can understand the status.

---

## 80. Icon Rules

- Use one consistent icon system where possible.
- Prefer Material icons when they satisfy the need.
- Icon-only buttons require accessible labels.
- Do not add a large icon library when existing icons already cover the requirement.
- Do not use icons as the only explanation when meaning would be ambiguous.

---

## 81. Feature Flags

If feature flags are used:

- centralize access
- type flag names
- keep checks near routing/composition boundaries
- avoid scattered string checks
- remove obsolete flags after rollout

Do not use feature flags as permanent architecture.

---

## 82. AI / Agent Coding Rules

When an AI coding agent modifies this Angular frontend:

1. Inspect existing architecture before generating code.
2. Reuse existing modern patterns where appropriate.
3. Do not invent product behavior.
4. Do not create NgModules for new standalone features.
5. Do not generate `any`.
6. Do not call feature APIs directly from page components.
7. Do not add dependencies without necessity.
8. Do not create empty speculative folders/files.
9. Do not create abstractions for hypothetical future use.
10. Do not modify unrelated files.
11. Prefer the smallest coherent change.
12. Preserve strict typing.
13. Preserve zoneless compatibility.
14. Preserve accessibility.
15. Remove unused imports and dead code.
16. Follow workspace lint/format rules.
17. Update relevant tests when behavior changes.
18. Run type checking, tests, lint, and production build before declaring completion when tooling is available.

---

## 83. Prohibited Patterns

Do not introduce these patterns in new code:

- feature NgModules
- `SharedModule`
- giant `MaterialModule`
- `any`
- `as any`
- untyped forms
- direct feature `HttpClient` calls in components
- unmanaged subscriptions
- nested subscriptions
- giant global stores
- god services
- duplicated writable state
- manual DOM manipulation for normal Angular UI
- `::ng-deep`
- styling Material private internals
- business logic in templates
- expensive template method calls
- effects used for ordinary derived state
- hardcoded production API URLs
- secrets in Angular environment files
- arbitrary `setTimeout()` change-detection fixes
- routine `detectChanges()` calls
- guards treated as authorization security
- index-based list tracking when stable IDs exist
- speculative generic frameworks
- silent error swallowing

---

## 84. Recommended New Feature Workflow

When implementing a new frontend feature:

1. Read the applicable functional specification.
2. Identify the feature boundary.
3. Define route ownership.
4. Define typed API contracts.
5. Implement the data-access layer.
6. Add feature state only if needed.
7. Choose and define the form approach if needed.
8. Build the page/container.
9. Extract meaningful UI components.
10. Handle loading/empty/error/success states.
11. Add navigation/authorization UX where applicable.
12. Add tests.
13. Verify accessibility.
14. Verify responsive behavior.
15. Run lint/type checks/tests.
16. Run production build.
17. Remove unused/dead code.
18. Confirm unrelated architecture was not changed.

---

## 85. Frontend Definition of Done

Frontend work is complete only when applicable checks pass.

### Architecture

- [ ] Code is in the correct feature boundary.
- [ ] Standalone architecture is preserved.
- [ ] No unnecessary global abstractions were introduced.
- [ ] Lazy-loading boundaries remain appropriate.
- [ ] Angular/Material/CDK versions remain compatible.

### Type Safety

- [ ] Strict TypeScript checks pass.
- [ ] No new `any`.
- [ ] No unsafe broad casts.
- [ ] API contracts are typed.
- [ ] Forms are typed.

### Angular

- [ ] Signals are used appropriately.
- [ ] Effects are used only for side effects.
- [ ] RxJS concurrency operators are intentional.
- [ ] Subscriptions cannot leak.
- [ ] Zoneless compatibility is preserved.
- [ ] Stable tracking is used in repeated lists.

### API and State

- [ ] Components do not directly implement feature HTTP calls.
- [ ] Loading state is handled.
- [ ] Empty state is handled where applicable.
- [ ] Error state is handled.
- [ ] Success state is accurate.
- [ ] Duplicate submissions are prevented where necessary.

### Angular Material

- [ ] Material public APIs are used.
- [ ] No brittle internal DOM/CSS overrides were added.
- [ ] Theme rules are respected.
- [ ] Component imports are focused.
- [ ] Material test harnesses are used where they improve tests.

### UX and Accessibility

- [ ] Forms have clear validation.
- [ ] Pending actions have feedback.
- [ ] Responsive behavior is correct.
- [ ] Keyboard behavior is reasonable.
- [ ] Semantic HTML is used.
- [ ] Inputs have accessible labels.
- [ ] Icon-only controls have accessible names.
- [ ] Dialog/focus behavior is correct.
- [ ] Status meaning does not depend on color alone.

### Quality

- [ ] Lint passes.
- [ ] Relevant tests pass.
- [ ] Production build passes.
- [ ] No unused imports remain.
- [ ] No dead/commented-out code remains.
- [ ] No secrets were added.
- [ ] No unrelated dependencies or architecture changes were introduced.

---

## 86. Final Dependency Direction

Prefer this direction:

```text
Page / Container
      ↓
Feature State / Orchestration
      ↓
Data Access / API
      ↓
HttpClient
```

And for UI composition:

```text
Page
  ↓
Feature UI Components
  ↓
Shared UI Primitives
  ↓
Angular Material / CDK
```

Rules:

- Shared UI must not depend on features.
- Data-access code must not depend on page components.
- Feature state must not depend on Material DOM details.
- UI components must not become backend-authoritative business engines.

The frontend should remain modular, strongly typed, lazy-loaded, zoneless-compatible, accessible, testable, and straightforward for another Angular engineer or coding agent to understand.

---

## 87. Portal Layout & Background Standards

For all application portals (Receptionist Desk, Patient Portal, Doctor Portal, Admin Portal, etc.):

- **Background Color**: Use White Smoke (`#f5f5f5` / `.portal-bg` / `bg-[#f5f5f5]`).
- **No Background Animations**: Do not add floating ambient orbs, particle drifts, or background blur animations to portals. Keep portal workspaces clean and distraction-free.
- **Surface & Cards**: Use solid white (`bg-white`), neutral borders (`border-slate-200`), and subtle shadows (`shadow-xs` / `shadow-sm`) for high legibility and contrast against the white smoke backdrop.
- **Top Navigation & Sidebars**: Use solid white (`bg-white`) with bottom/right `border-slate-200` borders.

