use rusqlite::Connection;
use std::path::PathBuf;
use std::sync::Mutex;

pub struct Database(pub Mutex<Connection>);

impl Database {
    pub fn new(path: PathBuf) -> rusqlite::Result<Self> {
        std::fs::create_dir_all(path.parent().unwrap()).ok();
        let conn = Connection::open(path)?;
        super::init_db(&conn)?;
        Ok(Self(Mutex::new(conn)))
    }
}
