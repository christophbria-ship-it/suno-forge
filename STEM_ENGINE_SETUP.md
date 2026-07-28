# Forge Studio v4 Stem Engine Setup

Forge v4 keeps the complete generator and adds a mobile-first instrument subtraction workspace.

## Required Vercel environment variables

Add these variables to Preview and Production in the Vercel project settings:

- `BLOB_READ_WRITE_TOKEN` — created by connecting a Vercel Blob store to the project.
- `REPLICATE_API_TOKEN` — API token from the Replicate account that will pay for GPU separation jobs.
- `STEM_ACCESS_CODE` — a private password chosen for Forge. Enter the same value in the Forge mobile stem workspace.

Redeploy the latest `main` commit after the variables are added.

## Processing route

1. The phone uploads audio directly to Vercel Blob using a short-lived client token.
2. Forge starts a Replicate SAM Audio prediction for the requested instrument or sound.
3. Forge polls the prediction until it returns the isolated target and residual mix.
4. The phone previews both results and downloads the residual mix.
5. Forge deletes the temporary Vercel Blob input.

## Security and limits

- Stem endpoints reject requests without the private `STEM_ACCESS_CODE`.
- Prediction starts are limited to four jobs per hour per connection.
- Uploads are limited to 100 MB.
- Upload paths and returned URLs are allowlisted.
- Temporary uploads are deleted after success, failure, or cancellation.
- Replicate output URLs are temporary and should be downloaded immediately.

Only upload audio that you own or have permission to process.
