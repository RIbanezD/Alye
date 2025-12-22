# backend/config/seeds.py
from sqlalchemy.orm import Session
from api.models.user import User, UserRole
from api.utils.password import get_password_hash
import logging

logger = logging.getLogger(__name__)

def seed_default_users(db: Session):
    """Create default users if they don't exist"""
    
    # Lista de usuarios por defecto
    default_users = [
        {
            "name": "Administrator",
            "email": "admin@alye.com",
            "password": "Admin123!",
            "role": UserRole.ADMIN,
            "organization": "Alye Security",
            "bio": "System Administrator"
        },
        # Puedes agregar más usuarios aquí
    ]
    
    for user_data in default_users:
        existing_user = db.query(User).filter(User.email == user_data["email"]).first()
        
        if not existing_user:
            new_user = User(
                name=user_data["name"],
                email=user_data["email"],
                hashed_password=get_password_hash(user_data["password"]),
                role=user_data["role"],
                organization=user_data.get("organization"),
                bio=user_data.get("bio"),
                is_active=True
            )
            db.add(new_user)
            logger.info(f"✅ Created default user: {user_data['email']}")
        else:
            logger.info(f"ℹ️  User already exists: {user_data['email']}")
    
    try:
        db.commit()
    except Exception as e:
        logger.error(f"❌ Error seeding users: {e}")
        db.rollback()
        raise
