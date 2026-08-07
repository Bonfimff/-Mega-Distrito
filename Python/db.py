"""Conexão com o MySQL do Mega Distrito (pool + helpers de consulta)."""

import os

import mysql.connector
from mysql.connector import pooling
from dotenv import load_dotenv

load_dotenv()

_pool = pooling.MySQLConnectionPool(
    pool_name="mega_distrito_pool",
    pool_size=5,
    host=os.environ.get("DB_HOST", "localhost"),
    port=int(os.environ.get("DB_PORT", 3306)),
    user=os.environ.get("DB_USER", "root"),
    password=os.environ.get("DB_PASSWORD", ""),
    database=os.environ.get("DB_NAME", "mega_distrito"),
    charset="utf8mb4",
)


def get_connection():
    return _pool.get_connection()


def query(sql, params=None, fetchone=False):
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(sql, params or ())
        result = cursor.fetchone() if fetchone else cursor.fetchall()
        cursor.close()
        return result
    finally:
        conn.close()


def execute(sql, params=None):
    """Para INSERT/UPDATE/DELETE. Retorna o lastrowid."""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(sql, params or ())
        conn.commit()
        last_id = cursor.lastrowid
        cursor.close()
        return last_id
    finally:
        conn.close()
