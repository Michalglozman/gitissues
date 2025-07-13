import sqlite3 from "sqlite3";

const execute = (db, sql) => {
  return new Promise((resolve, reject) => {
    db.run(sql, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

const main = async () => {
    const db = new sqlite3.Database("src/db/github.db");
    try {
      await execute(
        db,
        `CREATE TABLE IF NOT EXISTS github_events (
          id INTEGER PRIMARY KEY,
          eventId INTEGER UNIQUE,
          event TEXT NOT NULL,
          created_at INTEGER NOT NULL, 
          issueId INTEGER,
          issueNumber INTEGER,
          actorId INTEGER,
          actorType TEXT,
          actorLogin TEXT,
          repositoryName TEXT,
          labelName TEXT
        )`
      );
      console.log("GitHub events table created successfully");

      await execute(
        db,
        `CREATE TABLE IF NOT EXISTS issues (
          id INTEGER PRIMARY KEY,
          issueId INTEGER UNIQUE,
          issueNumber INTEGER NOT NULL,
          timeline TEXT,
          finalResolution TEXT,
          reopenCount INTEGER,
          timeSpentInLabels TEXT
        )`
      );
      console.log("Issues table created successfully");
    } catch (error) {
      console.log(error);
    } finally {
      db.close();
    }
  };
  
  main();