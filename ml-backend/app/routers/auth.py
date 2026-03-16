# app/routers/auth.py
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.db.sessions import get_db
from app.core.config import settings
from app.schemas.schemas import Token
from app.services.usuario_service import UsuarioService
from app.utils.security import create_access_token
from app.exceptions import InvalidDataError

router = APIRouter(prefix="/api/v1/auth", tags=["Autenticación"])

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    try:
        # Reemplazamos las dos líneas de buscar y verificar por el método unificado
        # que ya creaste en tu capa de servicios (verificar_y_autenticar).
        # form_data.username contiene el email enviado por el usuario
        usuario = UsuarioService.verificar_y_autenticar(
            db=db, 
            email=form_data.username, 
            password=form_data.password
        )
        
        # Si llega aquí, la contraseña es correcta y el usuario está activo.
        # Generar Token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(usuario.IdUsuario), "rol": usuario.IdRol}, 
            expires_delta=access_token_expires
        )
        
        return {"access_token": access_token, "token_type": "bearer"}
        
    except InvalidDataError as e:
        # Atrapamos el error específico de credenciales que arroja tu servicio
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )