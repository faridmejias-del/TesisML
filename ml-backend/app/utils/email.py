import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

def enviar_correo(destino: str, asunto:str, mensaje:str):
    remitente = "fabianmejias2002@gmail.com"
    password = "ytcu tofz zelx xyku"

    msg = MIMEMultipart()
    msg['From'] = remitente
    msg['To'] = destino
    msg['Subject'] = asunto

    msg.attach(MIMEText(mensaje, 'plain'))

    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(remitente, password)
        text = msg.as_string()
        server.sendmail(remitente,destino,text)
        server.quit()
        print("Correo enviado")
    except Exception as e:
        print(f"error al enviar el correo {e}")