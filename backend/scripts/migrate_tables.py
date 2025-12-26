import sys
from pathlib import Path

# Agregar el directorio raíz al path
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy import text
from config.database import engine, Base
from api.models.project_export import ProjectExport
from api.models.project import Project
from api.models.user import User

def migrate():
    """Add exports table and relationships"""
    print("🔄 Iniciando migración...")
    
    try:
        # Crear todas las tablas (incluida project_exports)
        Base.metadata.create_all(bind=engine)
        print("✅ Tabla 'project_exports' creada exitosamente")
        
        print("✅ Migración completada")
        
    except Exception as e:
        print(f"❌ Error en la migración: {e}")
        raise

if __name__ == "__main__":
    migrate()
