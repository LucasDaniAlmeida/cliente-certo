<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Internal commercial reads and mutations use authenticated TanStack server functions and user-scoped Supabase clients, so database access and role enforcement cannot be bypassed through the UI.
- Only administrative account listing and role assignment use the server-only admin client after verifying the caller's admin role.
- Customer imports use a serialized database function for atomic duplicate checks across concurrent imports; Excel parsing and column mapping stay in the browser.
- Protected pages live under the pathless authenticated layout; public sign-in and recovery pages remain at top level to support email links.
