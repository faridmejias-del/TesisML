# ml-backend/app/templates/email_templates.py

def obtener_layout_base(contenido: str, color_principal: str = "#1976d2"):
    """Crea el cascarón común para todos los correos."""
    return f"""
    <html>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 40px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #eeeeee;">
            <div style="background-color: {color_principal}; padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">TesisML</h1>
            </div>
            <div style="padding: 40px; color: #444444; line-height: 1.6;">
                {contenido}
            </div>
            <div style="background-color: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; color: #999999;">
                © 2026 TesisML - Sistema de Análisis Predictivo.
            </div>
        </div>
    </body>
    </html>
    """

def template_verificacion(nombre: str, enlace: str):
    contenido = f"""
        <p style="font-size: 18px; margin-top: 0;">Hola <strong>{nombre}</strong>,</p>
        <p>Gracias por unirte. Para activar tu cuenta y empezar a monitorear el mercado, por favor verifica tu correo:</p>
        <div style="text-align: center; margin: 35px 0;">
            <a href="{enlace}" style="background-color: #1976d2; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Verificar mi Cuenta
            </a>
        </div>
        <p style="font-size: 13px; color: #888888; text-align: center;">Este enlace expira en 24 horas.</p>
    """
    return obtener_layout_base(contenido, color_principal="#1976d2")

def template_recuperacion(nombre: str, enlace: str):
    contenido = f"""
        <p style="font-size: 18px; margin-top: 0;">Hola <strong>{nombre}</strong>,</p>
        <p>Has solicitado restablecer tu contraseña. Haz clic en el botón para crear una nueva:</p>
        <div style="text-align: center; margin: 35px 0;">
            <a href="{enlace}" style="background-color: #d32f2f; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Restablecer Contraseña
            </a>
        </div>
        <p style="font-size: 12px; color: #d32f2f; font-weight: bold; text-align: center;">
            Este enlace es válido por solo 15 minutos.
        </p>
    """
    return obtener_layout_base(contenido, color_principal="#d32f2f")