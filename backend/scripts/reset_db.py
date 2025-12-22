import sys
import os

# Añadir el directorio raíz al path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from config.database import engine, Base
from api.models.user import User

def reset_database():
    """Reset database - DROP and CREATE all tables"""
    confirm = input("⚠️  This will DELETE all data. Are you sure? (yes/no): ")
    
    if confirm.lower() != 'yes':
        print("❌ Operation cancelled")
        return
    
    print("🗑️  Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    
    print("📦 Creating all tables...")
    Base.metadata.create_all(bind=engine)
    
    print("✅ Database reset completed!")
    print("💡 Run 'python scripts/create_admin.py' to create admin user")

if __name__ == "__main__":
    reset_database()
