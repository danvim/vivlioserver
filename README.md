# vivlioserver

This is a personal project aiming to create a PDF rendering service accepting trusted HTML as input.

This project adapted code from `@vivliostyle/cli` to create a minimum api that just generates PDFs from single page HTML documents.

Upon the first request, the browser starts up at the back, and all requests use the same browser context, which should improve efficiency due to resource caching and a warmed browser environment.

## Run

```shell
pnpm dev
```

Check out `http://localhost:5400/ui` for Swagger docs.
