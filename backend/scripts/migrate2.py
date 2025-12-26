# backend/scripts/migrate_complete.py
import sys
import os

# Añadir el directorio raíz al path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from config.database import Base, engine
from api.models import *  # Import all models including new ones

def migrate_database():
    """Create all tables in the database"""
    try:
        print("=" * 60)
        print("🔄 Starting complete database migration...")
        print("=" * 60)
        
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
        print("  ✓ project_files         ← NEW")
        print("  ✓ project_exports       ← NEW")
        print("=" * 60)
        
        # Create uploads directory
        uploads_dir = os.path.join(os.path.dirname(__file__), '..', 'uploads')
        os.makedirs(uploads_dir, exist_ok=True)
        print("\n📁 Uploads directory created/verified")
        
    except Exception as e:
        print(f"❌ Error during migration: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    migrate_database()
