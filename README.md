# LAMF LMS Frontend

A static HTML, Bootstrap and JavaScript interface for the Loan Management System demo. The homepage introduces loan-against-mutual-fund workflows; the login and dashboard pages provide access to product, application, collateral, loan and repayment management.

## Local preview

Serve this directory with a static web server, for example `python -m http.server 8000`, then open `http://localhost:8000`.

The existing API connection is configured in `assets/js/config.js`. Login and dashboard operations require the separate LoanManagement Spring Boot API. Bootstrap is loaded from a CDN and requires an internet connection. No frontend package manifest, configured lint suite or build command is present.

## SEO metadata

All three HTML pages include page-specific descriptions, TheBenzzCreations author/creator metadata, Open Graph metadata and Twitter card metadata. Existing titles, branding and application code are preserved.

The homepage includes one WebSite JSON-LD block identifying the developer and one visible credit below the existing copyright. The developer link uses a normal same-tab hyperlink.

Production identity is recorded in `seo-sites.json`; see Canonical URL validation below. The developer credit is not evidence of a project deployment URL.

## Development & Maintenance

**Developed & Maintained by
[Khushal Sehrawat](https://github.com/khushalsehrawat)**
— Founder of
[TheBenzzCreations](https://www.thebenzzcreations.com/).

TheBenzzCreations is a digital development studio specializing in website development, custom software, mobile applications, e-commerce solutions and AI-powered business automation.

For development enquiries and collaborations, visit [TheBenzzCreations](https://www.thebenzzcreations.com/).

## Canonical URL validation

Run `python scripts/validate_seo.py` from this repository before publishing. The dependency-free check validates exact page canonicals, Open Graph URLs, website/application JSON-LD URLs, sitemap locations, robots sitemap references and literal framework site metadata against `seo-sites.json`. It checks deployment path prefixes as well as domains, so one GitHub Pages project cannot canonicalize to another.

Only URLs whose live HTML matched the local page on 2026-11-21 are configured. Unverified pages have no canonical or social URL; `python scripts/validate_seo.py --require-verified` also fails for those pending pages. Reverify the configuration if the deployment moves. Dynamic framework expressions still require runtime validation.

TheBenzzCreations attribution, creator organization URLs and existing normal same-tab developer credit links are preserved. These outbound attribution links are separate from site identity.
