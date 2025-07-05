const fs = require('fs');
const { Client } = require('pg');
// const { diffLines } = require('diff');
// const pgInfo = require('@wmfs/pg-info');
// const pgDiffSync = require('@wmfs/pg-diff-sync');
const dbdiff = require('./pg-schema-diff');

const SOURCE = 'postgres://guest:12345@localhost:5432/project_intern';
const TARGET = 'postgres://guest:12345@localhost:5432/postgres';
const SCHEMA = 'public';

const keepTables = ['orders'];
const keepFuncs = ['get_all_users_by_email_into_cursor_1'];
const OUTPUT_SQL = 'migrate_selected.sql';

const allLines = [];
dbdiff.logger = (msg) => allLines.push(msg);

dbdiff.compareDatabases(
  {
    current: { conn: TARGET, schema: SCHEMA },
    target: { conn: SOURCE, schema: SCHEMA }
  },
  async (err) => {
    if (err) { console.error('So sánh lỗi:', err); process.exit(1); }

    const filtered = allLines.filter((l) => {
      const low = l.toLowerCase();
      return keepTables.some(t => low.includes(` ${t.toLowerCase()} `) || low.includes(`"${t.toLowerCase()}"`))
        || keepFuncs.some(f => low.includes(f.toLowerCase()));
    });

    if (!filtered.length) {
      console.log('Không có diff cho bảng/hàm được chỉ định.');
      return;
    }

    fs.writeFileSync(OUTPUT_SQL, filtered.join('\n') + '\n');
    console.log(` Đã ghi ${filtered.length} dòng SQL vào ${OUTPUT_SQL}`);

    try {
      await runSqlOnTarget(filtered);
      console.log('🎉 Đã migrate xong 2 bảng & 2 hàm.');
    } catch (e) {
      console.error('Lỗi khi chạy migrate:', e);
    } finally {
      process.exit();
    }
  }
);
async function runSqlOnTarget(sqlArr) {
  const client = new Client({ connectionString: TARGET });
  await client.connect();
  try {
    await client.query('BEGIN');
    for (const stmt of sqlArr) {
      console.log('>>', stmt);
      // await client.query(stmt);
    }
    // await client.query('COMMIT');
  } catch (err) {
    // await client.query('ROLLBACK');
    throw err;
  } finally {
    await client.end();
  }
}
// const comparison = {
//   current: { conn: 'postgres://guest:12345@localhost:5432/postgres', schema: 'public' },
//   target: { conn: 'postgres://guest:12345@localhost:5432/project_intern', schema: 'public' }
// };

// dbdiff.compareDatabases(comparison, (err) => {
//   if (err) return console.error(err);

//   // Lọc bảng/hàm mong muốn
//   const filtered = sqlLines.filter(line => {
//     // bảng
//     if (keepTables.some(t => line.includes(` ${t} `) || line.includes(`"${t}"`))) return true;
//     // hàm
//     if (keepFuncs.some(f => line.includes(f))) return true;
//     return false;
//   });

//   if (!filtered.length) {
//     console.log('Không thấy diff cho bảng/hàm cần quan tâm.');
//   } else {
//     console.log('===== DIFF đã lọc =====');
//     console.log(filtered.join('\n'));
//   }
// });

// console.log(dbdiff.compareDatabases.toString())





// // const NEW_SQL_PATH = `./testSql.sql`
// const FUNC_SIGNATURE1 = 'public.get_all_users_by_email_into_cursor_1(character varying, integer)';
// const FUNC_SIGNATURE2 = 'public.get_all_users_by_email_into_cursor_1(character varying, integer, integer)'; // hàm trên DB
// const connectString1 = `postgres://guest:12345@localhost:5432/project_intern`;
// const connectString2 = `postgres://guest:12345@localhost:5432/postgres`;

// async function inspect(url) {
//   const client = new Client({ connectionString: url });
//   await client.connect();
//   const meta = await pgInfo({
//     client, schemas: [
//       'public'
//     ]
//   });
//   await client.end();
//   return meta;
// }

// const keepTables = ['users', 'orders'];
// const keepFuncs = ['get_all_users_by_email_into_cursor_1', 'get_all_users_by_email_into_cursor_1'];

// function prune(meta) {
//   // Giữ bảng
//   Object.keys(meta.tables).forEach(t => {
//     if (!keepTables.includes(t.split('.').pop())) delete meta.tables[t];
//   });
//   // Giữ hàm
//   Object.keys(meta.functions).forEach(f => {
//     if (!keepFuncs.includes(f.split('.').pop())) delete meta.functions[f];
//   });
//   return meta;
// }
// (async () => {
//   const [srcJSON, dstJSON] = await Promise.all([inspect(connectString1), inspect(connectString2)]);
//   // console.log(srcJSON.schemas.public.tables, dstJSON.schemas.public.tables);
//   // console.dir(srcJSON.schemas.public.tables['orders'], { depth: null });
//   // console.dir(dstJSON.schemas.public.tables, { depth: null })
//   const statements = pgDiffSync(prune(dstJSON.schemas.public), prune(srcJSON.schemas.public.tables['orders'].functions));
//   console.log(statements.join('\n') || ' Không có khác biệt');
// })();

// (async () => {
//   // 1‑– Kết nối
//   const client1 = new Client({ connectionString: connectString1 });
//   const client2 = new Client({ connectionString: connectString2 });
//   await client1.connect();
//   await client2.connect();

//   // 2‑– Lấy DDL hiện có
//   const data1 = await client1.query(
//     'SELECT pg_get_functiondef($1::regprocedure) AS ddl',
//     [FUNC_SIGNATURE1]
//   );
//   const data2 = await client2.query(
//     'SELECT pg_get_functiondef($1::regprocedure) AS ddl',
//     [FUNC_SIGNATURE2]
//   );
//   const oldDDL = data1.rows[0]?.ddl || '';
//   const newDDL = data2.rows[0]?.ddl || '';

//   // 3‑– So sánh
//   const diff = diffLines(oldDDL, newDDL);
//   const hasChange = diff.some(p => p.added || p.removed);

//   if (!hasChange) {
//     console.log('✅ Không có thay đổi, skip migration.');
//     return;
//   }

//   // 4‑– Sinh script: thay CREATE ➜ CREATE OR REPLACE
//   const patch = newDDL.replace(/CREATE FUNCTION/i, 'CREATE OR REPLACE FUNCTION');

//   console.log('\n===== DIFF =====');
//   diff.forEach(p => process.stdout.write(
//     (p.added ? '+ ' : p.removed ? '- ' : '  ') + p.value
//   ));

//   console.log('\n===== PATCH TO APPLY =====\n');
//   console.log(patch);

//   // 5‑– (Tuỳ chọn) Thực thi ngay
//   // await client.query(patch);

//   await client1.end();
//   await client2.end();
// })();