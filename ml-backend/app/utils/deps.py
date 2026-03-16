# app/utils/deps.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.sessions import get_db
from app.services.usuario_service import UsuarioService
from app.schemas.schemas import TokenData
from app.models.usuario import Usuario

# Define la ruta donde los usuarios enviarán sus credenciales
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def obtener_usuario_actual(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Usuario:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales inválidas o token expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Desencriptamos el token usando nuestra SECRET_KEY
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        usuario_id: int = payload.get("sub")
        if usuario_id is None:
            raise credentials_exception
        token_data = TokenData(id_usuario=usuario_id)
    except JWTError:
        raise credentials_exception
        
    # Buscamos al usuario en la BD para asegurar que sigue existiendo y está activo
    usuario = UsuarioService.obtener_usuario(db, usuario_id=token_data.id_usuario)
    if usuario is None or not usuario.Activo:
        raise credentials_exception
        
    return usuario