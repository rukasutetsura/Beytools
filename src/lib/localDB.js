const PREFIX = 'beytools-data-';
const subscribers = {};

function generateId() {
  return 'local-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

function load(name) {
  try { return JSON.parse(localStorage.getItem(PREFIX + name)) || []; } catch { return []; }
}

function save(name, records) {
  localStorage.setItem(PREFIX + name, JSON.stringify(records));
  notify(name, records);
}

function notify(name, records) {
  (subscribers[name] || []).forEach(cb => cb({ type: 'update', data: records }));
}

function applySort(records, sort) {
  if (!sort) return records;
  const desc = sort.startsWith('-');
  const field = desc ? sort.slice(1) : sort;
  return [...records].sort((a, b) => {
    const av = a[field], bv = b[field];
    if (av == null && bv == null) return 0;
    if (av == null) return desc ? 1 : -1;
    if (bv == null) return desc ? -1 : 1;
    if (av < bv) return desc ? 1 : -1;
    if (av > bv) return desc ? -1 : 1;
    return 0;
  });
}

function matchesQuery(record, query) {
  if (!query) return true;
  return Object.entries(query).every(([key, val]) => record[key] === val);
}

function createEntity(name) {
  return {
    async list(sort, limit) {
      let records = load(name);
      records = applySort(records, sort);
      if (limit) records = records.slice(0, limit);
      return records;
    },
    async filter(query, sort, limit) {
      let records = load(name).filter(r => matchesQuery(r, query));
      records = applySort(records, sort);
      if (limit) records = records.slice(0, limit);
      return records;
    },
    async get(id) {
      return load(name).find(r => r.id === id) || null;
    },
    async create(data) {
      const records = load(name);
      const now = new Date().toISOString();
      const record = { ...data, id: generateId(), created_date: now, updated_date: now };
      records.unshift(record);
      save(name, records);
      return record;
    },
    async update(id, data) {
      const records = load(name);
      const idx = records.findIndex(r => r.id === id);
      if (idx === -1) throw new Error('Record not found: ' + id);
      records[idx] = { ...records[idx], ...data, updated_date: new Date().toISOString() };
      save(name, records);
      return records[idx];
    },
    async delete(id) {
      save(name, load(name).filter(r => r.id !== id));
    },
    async bulkCreate(items) {
      const records = load(name);
      const now = new Date().toISOString();
      const newRecords = items.map(data => ({ ...data, id: generateId(), created_date: now, updated_date: now }));
      save(name, [...newRecords, ...records]);
      return newRecords;
    },
    async bulkUpdate(items) {
      const records = load(name);
      const map = Object.fromEntries(items.map(i => [i.id, i]));
      records.forEach((r, i) => {
        if (map[r.id]) records[i] = { ...r, ...map[r.id], updated_date: new Date().toISOString() };
      });
      save(name, records);
    },
    async deleteMany(query) {
      save(name, load(name).filter(r => !matchesQuery(r, query)));
    },
    async updateMany(query, update) {
      const records = load(name);
      records.forEach((r, i) => {
        if (matchesQuery(r, query)) {
          if (update.$set) Object.assign(records[i], update.$set);
          if (update.$unset) update.$unset.forEach(k => { delete records[i][k]; });
          if (update.$inc) Object.entries(update.$inc).forEach(([k, v]) => { records[i][k] = (records[i][k] || 0) + v; });
          records[i].updated_date = new Date().toISOString();
        }
      });
      save(name, records);
    },
    subscribe(callback) {
      if (!subscribers[name]) subscribers[name] = [];
      subscribers[name].push(callback);
      return () => { subscribers[name] = (subscribers[name] || []).filter(cb => cb !== callback); };
    },
    schema() { return null; },
  };
}

export const localDB = {
  entities: {
    Part: createEntity('Part'),
    Launcher: createEntity('Launcher'),
    Combo: createEntity('Combo'),
    LabTest: createEntity('LabTest'),
    Battle: createEntity('Battle'),
    Tournament: createEntity('Tournament'),
  },
};