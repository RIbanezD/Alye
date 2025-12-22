# backend/scripts/create_admin.py
import sys
import os

# Añadir el directorio raíz del backend al path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy.orm import Session
from config.database import SessionLocal, init_db
from api.models.user import User, UserRole
from api.utils.password import get_password_hash

def create_admin_user():
    """Create default admin user"""
    # Initialize database
    init_db()
    
    db: Session = SessionLocal()
    
    try:
        # Check if admin already exists
        admin = db.query(User).filter(User.email == "admin@alye.com").first()
        
        if admin:
            print("=" * 50)
            print("⚠️  Admin user already exists")
            print("=" * 50)
            print(f"📧 Email:    {admin.email}")
            print(f"👤 Name:     {admin.name}")
            print(f"🔑 Role:     {admin.role}")
            print(f"✅ Active:   {admin.is_active}")
            print(f"🏢 Org:      {admin.organization or 'N/A'}")
            print("=" * 50)
            print("\n💡 Tip: Use these credentials to login:")
            print("   Email:    admin@alye.com")
            print("   Password: Admin123!")
            print("=" * 50)
            return
        
        # Create admin user
        admin_user = User(
            name="Administrator",
            email="admin@alye.com",
            hashed_password=get_password_hash("Admin123!"),
            role=UserRole.ADMIN,
            organization="Alye Security",
            bio="System Administrator",
            is_active=True
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("=" * 50)
        print("✅ Admin user created successfully!")
        print("=" * 50)
        print(f"📧 Email:    admin@alye.com")
        print(f"🔑 Password: Admin123!")
        print(f"👤 Role:     {admin_user.role}")
        print(f"✅ Active:   {admin_user.is_active}")
        print(f"🏢 Org:      {admin_user.organization}")
        print("=" * 50)
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()