# En la carpeta raíz de tu proyecto, crea un archivo check_user.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from api.models.user import User

# Conectar a la base de datos
engine = create_engine('sqlite:///./pentesting.db')
Session = sessionmaker(bind=engine)
db = Session()

# Buscar todos los usuarios
users = db.query(User).all()

print("Usuarios en la base de datos:")
for user in users:
    print(f"- Email: {user.email}")
    print(f"  Nombre: {user.name}")
    print(f"  Activo: {user.is_active}")
    print(f"  Role: {user.role}")
    print()

db.close()
