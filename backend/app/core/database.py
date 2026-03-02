"""
Async database engine + session factory.
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings


# async engine (for fastapi endpoints)
async_engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,
)

AsyncSessionLocal = async_sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# sync engine (for celery workers + alembic)
sync_engine = create_engine(
    settings.DATABASE_URL_SYNC,
    echo=False,
    pool_size=5,
)

SyncSessionLocal = sessionmaker(bind=sync_engine)


# base model class
class Base(DeclarativeBase):
    pass


# dependency for fastapi
async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
