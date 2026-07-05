# API Reference

All authenticated endpoints require a valid Auth.js session cookie.

Responses use JSON unless noted:

```json
{ "success": true, "data": {}, "message": "..." }
{ "success": false, "error": "..." }
```

## Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET/POST | `/api/auth/[...nextauth]` | — | Auth.js handlers |
| POST | `/api/auth/register` | Public | Create account (rate limited) |

## Visiting cards

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/visiting-cards` | List user cards |
| POST | `/api/visiting-cards` | Create card |
| GET | `/api/visiting-cards/[id]` | Get card |
| PUT | `/api/visiting-cards/[id]` | Update card |
| DELETE | `/api/visiting-cards/[id]` | Delete card |

## Categories

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/categories` | List user categories with counts |
| POST | `/api/categories` | Create category |
| GET | `/api/categories/[id]` | Category with user contacts |
| PUT | `/api/categories/[id]` | Update category |
| DELETE | `/api/categories/[id]` | Delete category |
| GET | `/api/categories/[id]/assign` | Cards available to assign |
| POST | `/api/categories/[id]/assign` | Assign cards |
| DELETE | `/api/categories/[id]/assign` | Remove cards from category |

## Search

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/search` | Advanced search with filters and sort |

Query params: `q`, `name`, `company`, `phone`, `email`, `city`, `state`, `gst`, `categoryId`, `tag`, `sort`

## Upload & OCR

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/upload/card-image` | Upload front/back image (max 5MB) |
| GET | `/api/uploads/cards/[userId]/[filename]` | Serve private image (owner only) |
| POST | `/api/ocr/parse` | Parse image text with OCR |

## AI

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/ai/analyze` | Analyze contact fields |
| GET | `/api/ai/duplicates` | Scan all duplicates |
| POST | `/api/ai/smart-search` | Parse natural language query |
| GET | `/api/ai/summary/[id]` | Contact summary |

## Import / export

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/export/contacts` | Export CSV or Excel |
| POST | `/api/import/contacts` | Import contacts file |
| GET | `/api/reports/[type]` | PDF report download |

Report types: `all`, `category`, `monthly`

## Settings

| Method | Path | Description |
|--------|------|-------------|
| PUT | `/api/settings/profile` | Update name/email |
| DELETE | `/api/settings/account` | Delete account |
| GET | `/api/settings/backup` | Download JSON backup |
| GET | `/api/settings/export-all` | Download full data export |
| POST | `/api/settings/restore` | Restore backup (merge/replace) |

## Error codes

| Status | Meaning |
|--------|---------|
| 400 | Validation or business rule error |
| 401 | Not authenticated |
| 403 | Forbidden (e.g. accessing another user's upload) |
| 404 | Resource not found |
| 429 | Rate limit exceeded |
| 500 | Unexpected server error |

## Validation

Request bodies are validated with Zod schemas in `lib/validations/`. Invalid input returns `400` with the first error message.

## Security notes

- Categories are scoped per user
- Card images require authentication to view
- Direct access to `/uploads/cards/` is blocked
- Registration is rate-limited by IP
- Upload MIME types are verified by magic bytes, not client headers
