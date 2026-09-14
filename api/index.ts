import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 跨域設定
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const dbUrl = process.env.DATABASE_URL;

  // 1. 檢查資料庫狀態端點
  if (req.url?.includes('/api/db-status') || req.url === '/api') {
    if (!dbUrl) {
      return res.status(200).json({
        connected: false,
        provider: 'none',
        message: '未設定 DATABASE_URL 環境變數，目前使用 LocalStorage 離線儲存。'
      });
    }

    try {
      const sql = neon(dbUrl);
      const test = await sql`SELECT 1 as connected`;
      
      // 自動檢查並建立資料表
      await sql`
        CREATE TABLE IF NOT EXISTS customers (
          id VARCHAR(100) PRIMARY KEY,
          data JSONB NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS vendors (
          id VARCHAR(100) PRIMARY KEY,
          data JSONB NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS products (
          id VARCHAR(100) PRIMARY KEY,
          data JSONB NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS quotations (
          id VARCHAR(100) PRIMARY KEY,
          data JSONB NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `;

      return res.status(200).json({
        connected: true,
        provider: 'neon',
        message: '已成功連線至 Neon PostgreSQL 雲端資料庫',
        tablesReady: true
      });
    } catch (err: any) {
      return res.status(200).json({
        connected: false,
        provider: 'neon-error',
        message: `連線失敗: ${err.message || '無法連線至資料庫'}`
      });
    }
  }

  // 2. 雙向同步端點 (Pull)
  if (req.url?.includes('/api/sync/pull')) {
    if (!dbUrl) {
      return res.status(200).json({ fromDb: false, customers: [], vendors: [], products: [], quotations: [] });
    }
    try {
      const sql = neon(dbUrl);
      const [cRows, vRows, pRows, qRows] = await Promise.all([
        sql`SELECT data FROM customers ORDER BY updated_at DESC`,
        sql`SELECT data FROM vendors ORDER BY updated_at DESC`,
        sql`SELECT data FROM products ORDER BY updated_at DESC`,
        sql`SELECT data FROM quotations ORDER BY updated_at DESC`
      ]);

      return res.status(200).json({
        fromDb: true,
        customers: cRows.map((r: any) => r.data),
        vendors: vRows.map((r: any) => r.data),
        products: pRows.map((r: any) => r.data),
        quotations: qRows.map((r: any) => r.data)
      });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  // 3. 批次推送到資料庫 (Push)
  if (req.url?.includes('/api/sync/push') && req.method === 'POST') {
    if (!dbUrl) return res.status(400).json({ error: 'No DATABASE_URL configured' });
    try {
      const sql = neon(dbUrl);
      const { customers, vendors, products, quotations } = req.body || {};

      if (Array.isArray(customers)) {
        for (const item of customers) {
          await sql`
            INSERT INTO customers (id, data, updated_at)
            VALUES (${item.id}, ${JSON.stringify(item)}::jsonb, NOW())
            ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
          `;
        }
      }
      if (Array.isArray(vendors)) {
        for (const item of vendors) {
          await sql`
            INSERT INTO vendors (id, data, updated_at)
            VALUES (${item.id}, ${JSON.stringify(item)}::jsonb, NOW())
            ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
          `;
        }
      }
      if (Array.isArray(products)) {
        for (const item of products) {
          await sql`
            INSERT INTO products (id, data, updated_at)
            VALUES (${item.id}, ${JSON.stringify(item)}::jsonb, NOW())
            ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
          `;
        }
      }
      if (Array.isArray(quotations)) {
        for (const item of quotations) {
          await sql`
            INSERT INTO quotations (id, data, updated_at)
            VALUES (${item.id}, ${JSON.stringify(item)}::jsonb, NOW())
            ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
          `;
        }
      }

      return res.status(200).json({ success: true, message: '雲端同步成功' });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  // 單筆 CRUD 端點 (Customers / Vendors / Products / Quotations)
  if (req.url?.startsWith('/api/customers')) {
    if (!dbUrl) return res.status(200).json({ success: true, localOnly: true });
    const sql = neon(dbUrl);
    if (req.method === 'POST') {
      const item = req.body;
      await sql`INSERT INTO customers (id, data, updated_at) VALUES (${item.id}, ${JSON.stringify(item)}::jsonb, NOW()) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`;
      return res.status(200).json({ success: true });
    }
    if (req.method === 'DELETE') {
      const id = req.url.split('/').pop();
      if (id) await sql`DELETE FROM customers WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    }
  }

  if (req.url?.startsWith('/api/vendors')) {
    if (!dbUrl) return res.status(200).json({ success: true, localOnly: true });
    const sql = neon(dbUrl);
    if (req.method === 'POST') {
      const item = req.body;
      await sql`INSERT INTO vendors (id, data, updated_at) VALUES (${item.id}, ${JSON.stringify(item)}::jsonb, NOW()) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`;
      return res.status(200).json({ success: true });
    }
    if (req.method === 'DELETE') {
      const id = req.url.split('/').pop();
      if (id) await sql`DELETE FROM vendors WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    }
  }

  if (req.url?.startsWith('/api/products')) {
    if (!dbUrl) return res.status(200).json({ success: true, localOnly: true });
    const sql = neon(dbUrl);
    if (req.method === 'POST') {
      const item = req.body;
      await sql`INSERT INTO products (id, data, updated_at) VALUES (${item.id}, ${JSON.stringify(item)}::jsonb, NOW()) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`;
      return res.status(200).json({ success: true });
    }
    if (req.method === 'DELETE') {
      const id = req.url.split('/').pop();
      if (id) await sql`DELETE FROM products WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    }
  }

  if (req.url?.startsWith('/api/quotations')) {
    if (!dbUrl) return res.status(200).json({ success: true, localOnly: true });
    const sql = neon(dbUrl);
    if (req.method === 'POST') {
      const item = req.body;
      await sql`INSERT INTO quotations (id, data, updated_at) VALUES (${item.id}, ${JSON.stringify(item)}::jsonb, NOW()) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`;
      return res.status(200).json({ success: true });
    }
    if (req.method === 'DELETE') {
      const id = req.url.split('/').pop();
      if (id) await sql`DELETE FROM quotations WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    }
  }

  return res.status(200).json({ message: 'QT SmartQuote API is online' });
}
