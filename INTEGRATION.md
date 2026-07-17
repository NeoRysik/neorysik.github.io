# Secure launch checklist

## MailerLite delivery
1. In MailerLite, create a group named **In Memory — Four Chapter Readers**.
2. Create an embedded form with first name and email, double opt-in enabled.
3. Copy only the public HTTPS form action into `config.js`. Do not add an API token.
4. Create an automation triggered when a subscriber joins that group: send the welcome email immediately and include a button to the chapter PDF hosted in MailerLite's file manager (or another stable HTTPS file host).
5. Authenticate `neorysik.com` in MailerLite using the DNS records MailerLite provides. Send from an address at the domain (for example `readers@neorysik.com`) and route replies to `neorysik@gmail.com`.

## Google Sheet
Use MailerLite as the source of truth and sync confirmed subscribers to Google Sheets with MailerLite's supported integration, Zapier, Make, or a Google Apps Script webhook. Grant access through each service's OAuth screen. Never share a Google password or place Google credentials in this repository. Suggested columns: timestamp, email, first name, signup source, consent status.

## Purchase link
Replace the Amazon search URL in `index.html` with the book's canonical Amazon detail-page URL once the ASIN is known. Add Bookshop.org, Barnes & Noble, Kobo, and other links as distribution becomes live.

## Dor Atid domain
GitHub Pages accepts one custom domain per site. Keep `www.neorysik.com` as the canonical domain and configure `doratid.com` and `www.doratid.com` at the registrar as permanent (301) redirects to `https://www.neorysik.com/#imprint`. Enable HTTPS forwarding. Do not expose registrar credentials.

## Access
For future help, invite a collaborator to this GitHub repository with the least permission needed. Use provider-native collaborator invitations or OAuth connections for MailerLite and Google. Never send passwords, recovery codes, API keys, or DNS-account credentials by email or chat.
