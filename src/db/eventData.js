import Database from 'better-sqlite3';
import path     from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const dbPath     = path.join(__dirname, 'github.db');

const db = new Database(dbPath);
db.pragma('busy_timeout = 6000');

const insertStmt = db.prepare(`
  INSERT OR IGNORE INTO github_events
    (eventId,event,created_at,issueId,issueNumber,actorId,actorType,actorLogin,repositoryName,labelName)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

export const insertEventsBatch = (events, batchSize = 5000) => {
  events.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  const insertMany = db.transaction((rows) => {
    for (const r of rows) {
      insertStmt.run(
        r.id,
        r.event,
        new Date(r.created_at).getTime(),
        r.issueId,
        r.issueNumber,
        r.actorId,
        r.actorType,
        r.actorLogin,
        r.repositoryName,
        r.labelName
      );
    }
  });

  for (let i = 0; i < events.length; i += batchSize) {
    const slice = events.slice(i, i + batchSize);
    insertMany(slice);                              
  }
};

export const getEventsByIssueId = (issueId) => {
    const events = db.prepare(`SELECT * FROM github_events WHERE issueId = ? ORDER BY created_at ASC`).all(issueId);
    return events;
}

export const getNewestEventDateByIssueId = (issueId) => {
    const event = db.prepare(`SELECT created_at FROM github_events WHERE issueId = ? ORDER BY created_at DESC LIMIT 1`).get(issueId);
    if (event == null) {
        return null;
    } else {
        return +event.created_at;
    }
}

const insertIssueStmt = db.prepare(`
  INSERT OR IGNORE INTO issues
    (issueId, issueNumber, timeline, finalResolution, reopenCount, timeSpentInLabels)
  VALUES (?, ?, ?, ?, ?, ?)
`);

export const insertIssuesBatch = (issues, batchSize = 1000) => {
  const insertMany = db.transaction((rows) => {
    for (const r of rows) {
      insertIssueStmt.run(
        r.issueId,
        r.issueNumber,
        JSON.stringify(r.timeline),
        r.finalResolution,
        r.reopenCount,
        JSON.stringify(r.timeSpentInLabels)
      );
    }
  });

  for (let i = 0; i < issues.length; i += batchSize) {
    const slice = issues.slice(i, i + batchSize);
    insertMany(slice);
  }
};



