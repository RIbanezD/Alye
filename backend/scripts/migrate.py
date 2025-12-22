# backend/scripts/migrate_database.py
import sys
import os

# Añadir el directorio raíz al path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from config.database import Base, engine
from api.models import *  # Import all models

def migrate_database():
    """Create all tables in the database"""
    try:
        print("=" * 60)
        print("🔄 Starting database migration...")
        print("=" * 60)
        
        # Drop all tables (⚠️ BE CAREFUL - This deletes all data)
        # Comment this line if you want to keep existing data
        # Base.metadata.drop_all(bind=engine)
        # print("🗑️  Old tables dropped")
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        
        print("=" * 60)
        print("✅ Database migration completed successfully!")
        print("=" * 60)
        print("\nTables created:")
        print("  ✓ users")
        print("  ✓ projects")
        print("  ✓ targets")
        print("  ✓ vulnerabilities")
        print("  ✓ scans")
        print("  ✓ tools")
        print("  ✓ tool_executions")
        print("  ✓ conversations")
        print("  ✓ messages")
        print("  ✓ reports")
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ Error during migration: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    migrate_database()
