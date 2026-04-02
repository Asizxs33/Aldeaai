import os
import psycopg2
import psycopg2.pool
from dotenv import load_dotenv

load_dotenv()

_pool = None


def get_pool():
    global _pool
    if _pool is None:
        _pool = psycopg2.pool.ThreadedConnectionPool(
            minconn=1,
            maxconn=10,
            dsn=os.environ["DATABASE_URL"],
            sslmode="require",
        )
    return _pool


def query(sql: str, params=None):
    pool = get_pool()
    conn = pool.getconn()
    try:
        with conn.cursor() as cur:
            cur.execute(sql, params or ())
            conn.commit()
            try:
                rows = cur.fetchall()
                cols = [d[0] for d in cur.description]
                return [dict(zip(cols, row)) for row in rows]
            except psycopg2.ProgrammingError:
                return []
    except Exception:
        conn.rollback()
        raise
    finally:
        pool.putconn(conn)
