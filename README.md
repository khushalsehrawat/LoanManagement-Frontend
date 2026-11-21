# LAMF LMS Frontend

A static HTML, Bootstrap and JavaScript interface for the Loan Management System demo. The homepage introduces loan-against-mutual-fund workflows; the login and dashboard pages provide access to product, application, collateral, loan and repayment management.

## Local preview

Serve this directory with a static web server, for example `python -m http.server 8000`, then open `http://localhost:8000`.

The existing API connection is configured in `assets/js/config.js`. Login and dashboard operations require the separate LoanManagement Spring Boot API. Bootstrap is loaded from a CDN and requires an internet connection. No frontend package manifest, configured lint suite or build command is present.

## SEO metadata

All three HTML pages include page-specific descriptions, TheBenzzCreations author/creator metadata, Open Graph metadata and Twitter card metadata. Existing titles, branding and application code are preserved.

The homepage includes one WebSite JSON-LD block identifying the developer and one visible credit below the existing copyright. The developer link uses a normal same-tab hyperlink.

The public frontend URL has not been verified. Canonical links, `og:url` and the WebSite `url` are omitted until that URL is confirmed. The backend API URL in `assets/js/config.js` and the developer website must not be used as the frontend's canonical URL. No dedicated social preview image is configured. Structured data does not guarantee search rich results.

## Development & Maintenance

**Developed & Maintained by
[Khushal Sehrawat](https://github.com/khushalsehrawat)**
— Founder of
[TheBenzzCreations](https://www.thebenzzcreations.com/).

TheBenzzCreations is a digital development studio specializing in website development, custom software, mobile applications, e-commerce solutions and AI-powered business automation.

For development enquiries and collaborations, visit [TheBenzzCreations](https://www.thebenzzcreations.com/).
