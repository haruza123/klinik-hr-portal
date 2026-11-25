interface Env {
  DB: D1Database;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
  AUTH_SECRET: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...CORS_HEADERS,
    },
  });
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(str: string): Uint8Array {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((str.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function signToken(payload: Record<string, unknown>, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const header = toBase64Url(enc.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const body = toBase64Url(enc.encode(JSON.stringify(payload)));
  const signingInput = `${header}.${body}`;

  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(signingInput));
  return `${signingInput}.${toBase64Url(new Uint8Array(sig))}`;
}

async function verifyToken(
  token: string,
  secret: string
): Promise<{ email: string; exp: number } | null> {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, body, sig] = parts;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const valid = await crypto.subtle.verify(
    'HMAC',
    key,
    fromBase64Url(sig),
    enc.encode(`${header}.${body}`)
  );
  if (!valid) return null;

  try {
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(body)));
    if (!payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

async function requireAdmin(request: Request, env: Env): Promise<{ email: string } | Response> {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token) return json({ error: 'Unauthorized' }, 401);

  const secret = env.AUTH_SECRET || 'default-dev-secret-change-me';
  const payload = await verifyToken(token, secret);
  if (!payload) return json({ error: 'Invalid or expired token' }, 401);
  return { email: payload.email };
}

function mapQuestionRow(row: Record<string, unknown>) {
  return {
    id: row.id,
    slug: row.slug,
    category_id: row.category_id,
    question_text: row.question_text,
    answer: row.answer,
    question_order: row.question_order,
    is_required: Boolean(row.is_required),
    views: row.views ?? 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
    categories: row.category_name
      ? { id: row.category_id, name: row.category_name, slug: row.category_slug }
      : null,
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Health check
      if (path === '/' || path === '/api/health') {
        return json({ ok: true, service: 'klinik-hr-api' });
      }

      // Auth: Login
      if (path === '/api/auth/login' && request.method === 'POST') {
        const body = (await request.json().catch(() => ({}))) as {
          email?: string;
          password?: string;
        };
        const email = (body.email || '').trim().toLowerCase();
        const password = body.password || '';

        const adminEmail = (env.ADMIN_EMAIL || 'admin@klinikhr.id').trim().toLowerCase();
        const adminPassword = env.ADMIN_PASSWORD || '';

        if (!adminPassword || email !== adminEmail || password !== adminPassword) {
          return json({ error: 'Email atau password salah.' }, 401);
        }

        const secret = env.AUTH_SECRET || 'default-dev-secret-change-me';
        const token = await signToken(
          { email: adminEmail, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 },
          secret
        );
        return json({ token, user: { email: adminEmail } });
      }

      // Auth: Me
      if (path === '/api/auth/me' && request.method === 'GET') {
        const auth = await requireAdmin(request, env);
        if (auth instanceof Response) return auth;
        return json({ user: auth });
      }

      // Categories: List
      if (path === '/api/categories' && request.method === 'GET') {
        const { results } = await env.DB.prepare(
          'SELECT id, name, slug, description, created_at, updated_at FROM categories ORDER BY name ASC'
        ).all();
        return json({ data: results });
      }

      // Categories: Create (Admin)
      if (path === '/api/categories' && request.method === 'POST') {
        const auth = await requireAdmin(request, env);
        if (auth instanceof Response) return auth;

        const body = (await request.json()) as {
          name?: string;
          slug?: string | null;
          description?: string | null;
        };
        if (!body.name?.trim()) return json({ error: 'Nama kategori wajib diisi' }, 400);

        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        await env.DB.prepare(
          'INSERT INTO categories (id, name, slug, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
        )
          .bind(id, body.name.trim(), body.slug?.trim() || null, body.description?.trim() || null, now, now)
          .run();

        return json({ data: { id, name: body.name.trim(), slug: body.slug?.trim() || null } }, 201);
      }

      // Questions: List & Search
      if (path === '/api/questions' && request.method === 'GET') {
        const limit = Math.min(Number(url.searchParams.get('limit') || 50), 100);
        const categorySlug = url.searchParams.get('categorySlug')?.trim();
        const categoryId = url.searchParams.get('categoryId')?.trim();
        const excludeId = url.searchParams.get('excludeId')?.trim();
        const search = url.searchParams.get('search')?.trim();
        const sort = url.searchParams.get('sort') === 'views' ? 'q.views DESC, q.created_at DESC' : 'q.created_at DESC';

        const conditions: string[] = [];
        const bindings: unknown[] = [];

        let resolvedCategoryName: string | null = null;
        if (categorySlug) {
          const cat = await env.DB.prepare('SELECT id, name FROM categories WHERE slug = ? LIMIT 1')
            .bind(categorySlug)
            .first<{ id: string; name: string }>();
          if (cat) {
            conditions.push('q.category_id = ?');
            bindings.push(cat.id);
            resolvedCategoryName = cat.name;
          } else {
            return json({ data: [], categoryName: null });
          }
        } else if (categoryId) {
          conditions.push('q.category_id = ?');
          bindings.push(categoryId);
        }

        if (excludeId) {
          conditions.push('q.id != ?');
          bindings.push(excludeId);
        }

        if (search) {
          conditions.push('(LOWER(q.question_text) LIKE ? OR LOWER(q.answer) LIKE ?)');
          const pattern = `%${search.toLowerCase()}%`;
          bindings.push(pattern, pattern);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const sql = `
          SELECT q.id, q.slug, q.category_id, q.question_text, q.answer, q.question_order,
                 q.is_required, q.views, q.created_at, q.updated_at,
                 c.name AS category_name, c.slug AS category_slug
          FROM questions q
          LEFT JOIN categories c ON q.category_id = c.id
          ${whereClause}
          ORDER BY ${sort}
          LIMIT ?
        `;
        bindings.push(limit);

        const { results } = await env.DB.prepare(sql).bind(...bindings).all();
        return json({
          data: results.map((r) => mapQuestionRow(r as Record<string, unknown>)),
          categoryName: resolvedCategoryName,
        });
      }

      // Questions: Single by slug or id
      if (path.startsWith('/api/questions/') && request.method === 'GET') {
        const slugOrId = decodeURIComponent(path.slice('/api/questions/'.length));
        const row = await env.DB.prepare(
          `SELECT q.id, q.slug, q.category_id, q.question_text, q.answer, q.question_order,
                  q.is_required, q.views, q.created_at, q.updated_at,
                  c.name AS category_name, c.slug AS category_slug
           FROM questions q
           LEFT JOIN categories c ON q.category_id = c.id
           WHERE q.id = ? OR q.slug = ?
           LIMIT 1`
        )
          .bind(slugOrId, slugOrId)
          .first<Record<string, unknown>>();

        if (!row) return json({ error: 'Not found' }, 404);

        // Increment view count asynchronously
        await env.DB.prepare('UPDATE questions SET views = COALESCE(views, 0) + 1 WHERE id = ?')
          .bind(row.id)
          .run();

        return json({ data: mapQuestionRow(row) });
      }

      // Questions: Create (Admin)
      if (path === '/api/questions' && request.method === 'POST') {
        const auth = await requireAdmin(request, env);
        if (auth instanceof Response) return auth;

        const body = (await request.json()) as {
          question_text?: string;
          category_id?: string;
          answer?: string | null;
          slug?: string | null;
        };
        if (!body.question_text?.trim() || !body.category_id) {
          return json({ error: 'Pertanyaan dan kategori wajib diisi' }, 400);
        }

        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        await env.DB.prepare(
          `INSERT INTO questions (id, category_id, question_text, slug, answer, question_order, is_required, views, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, 0, 1, 0, ?, ?)`
        )
          .bind(
            id,
            body.category_id,
            body.question_text.trim(),
            body.slug?.trim() || id,
            body.answer ?? '',
            now,
            now
          )
          .run();

        return json({ data: { id } }, 201);
      }

      // Questions: Update (Admin)
      if (path.startsWith('/api/questions/') && request.method === 'PUT') {
        const auth = await requireAdmin(request, env);
        if (auth instanceof Response) return auth;

        const id = decodeURIComponent(path.slice('/api/questions/'.length));
        const body = (await request.json()) as {
          question_text?: string;
          category_id?: string;
          answer?: string | null;
          slug?: string | null;
        };
        if (!body.question_text?.trim() || !body.category_id) {
          return json({ error: 'Pertanyaan dan kategori wajib diisi' }, 400);
        }

        const now = new Date().toISOString();
        await env.DB.prepare(
          `UPDATE questions
           SET question_text = ?, category_id = ?, answer = ?, slug = ?, updated_at = ?
           WHERE id = ?`
        )
          .bind(
            body.question_text.trim(),
            body.category_id,
            body.answer ?? '',
            body.slug?.trim() || id,
            now,
            id
          )
          .run();

        return json({ ok: true });
      }

      // Questions: Delete (Admin)
      if (path.startsWith('/api/questions/') && request.method === 'DELETE') {
        const auth = await requireAdmin(request, env);
        if (auth instanceof Response) return auth;

        const id = decodeURIComponent(path.slice('/api/questions/'.length));
        await env.DB.prepare('DELETE FROM questions WHERE id = ?').bind(id).run();
        return json({ ok: true });
      }

      // Inquiries: Create (Public)
      if (path === '/api/inquiries' && request.method === 'POST') {
        const body = (await request.json()) as { question?: string; email?: string | null };
        if (!body.question?.trim()) return json({ error: 'Pertanyaan wajib diisi' }, 400);

        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        await env.DB.prepare('INSERT INTO inquiries (id, question, email, created_at) VALUES (?, ?, ?, ?)')
          .bind(id, body.question.trim(), body.email?.trim() || null, now)
          .run();

        return json({ data: { id } }, 201);
      }

      // Inquiries: List (Admin)
      if (path === '/api/inquiries' && request.method === 'GET') {
        const auth = await requireAdmin(request, env);
        if (auth instanceof Response) return auth;

        const { results } = await env.DB.prepare(
          'SELECT id, question, email, created_at FROM inquiries ORDER BY created_at DESC'
        ).all();
        return json({ data: results });
      }

      // Media: Upload Image (Admin)
      if (path === '/api/media' && request.method === 'POST') {
        const auth = await requireAdmin(request, env);
        if (auth instanceof Response) return auth;

        const formData = await request.formData();
        const file = formData.get('file');
        if (!(file instanceof File)) {
          return json({ error: 'File tidak ditemukan' }, 400);
        }
        if (!file.type.startsWith('image/')) {
          return json({ error: 'Hanya file gambar yang diperbolehkan' }, 400);
        }
        if (file.size > 1.5 * 1024 * 1024) {
          return json({ error: 'Ukuran gambar maksimal 1.5 MB' }, 400);
        }

        const id = crypto.randomUUID();
        const buffer = await file.arrayBuffer();
        const now = new Date().toISOString();
        await env.DB.prepare(
          'INSERT INTO media (id, filename, content_type, data, created_at) VALUES (?, ?, ?, ?, ?)'
        )
          .bind(id, file.name || 'image', file.type, buffer, now)
          .run();

        return json({ url: `${url.origin}/api/media/${id}`, id }, 201);
      }

      // Media: Serve Image (Public)
      if (path.startsWith('/api/media/') && request.method === 'GET') {
        const id = decodeURIComponent(path.slice('/api/media/'.length));
        const row = await env.DB.prepare('SELECT content_type, data FROM media WHERE id = ? LIMIT 1')
          .bind(id)
          .first<{ content_type: string; data: ArrayBuffer | number[] }>();

        if (!row) return new Response('Not found', { status: 404, headers: CORS_HEADERS });

        const bytes = row.data instanceof ArrayBuffer ? row.data : new Uint8Array(row.data).buffer;
        return new Response(bytes, {
          status: 200,
          headers: {
            'Content-Type': row.content_type || 'application/octet-stream',
            'Cache-Control': 'public, max-age=31536000, immutable',
            ...CORS_HEADERS,
          },
        });
      }

      return json({ error: 'Route not found' }, 404);
    } catch (err) {
      console.error(err);
      return json({ error: 'Internal server error' }, 500);
    }
  },
};
