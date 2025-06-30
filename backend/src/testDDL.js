const { parse } = require('pgsql-ast-parser');

module.exports = function ddlToMermaid(sql) {
  const ast = parse(sql);
  const tables = {};
  const relations = new Set();
  const pendingRelations = [];

  const ensureTable = t => { if (!tables[t]) tables[t] = []; };

  const addRelation = (child, parent, col) => {
    if (!child || !parent) return;
    pendingRelations.push({ child, parent, col });
  };

  ast.forEach(node => {
    if (node.type !== 'create table') return;
    const tbl = node.name.name;
    tables[tbl] = [];

    node.columns.forEach(col => {
      const pk = (col.constraints || []).some(c => c.type === 'primary key');
      const line = `${col.dataType.name} ${col.name.name}${pk ? ' PK' : ''}`;
      tables[tbl].push('    ' + line.trimEnd());

      const fk = (col.constraints || []).find(c => c.type === 'reference');
      if (fk) addRelation(tbl, fk.foreignTable?.name || fk.references?.name, col.name.name);
    });

    (node.constraints || []).forEach(cst => {
      if (cst.type !== 'foreign key') return;
      const cols = (cst.columns || cst.localColumns || []).map(c => c.name).join(',') || 'fk';
      const parent = cst.foreignTable.name;
      addRelation(tbl, parent, cols);
    });
    pendingRelations.forEach(({ child, parent, col }) => {
      if (tables[parent]) {
        relations.add(`  ${child} }o--|| ${parent} : "${col}"`);
      }
    });
  });

  let mmd = 'erDiagram\n';
  Object.entries(tables).forEach(([t, cols]) => {
    // nếu bảng không có cột (rất hiếm) thêm cột giả hợp lệ
    const body = cols.length ? cols.join('\n') : '    bigint dummy_id';
    mmd += `  ${t} {\n${body}\n  }\n`;
  });
  relations.forEach(r => (mmd += r + '\n'));
  return mmd;
};
