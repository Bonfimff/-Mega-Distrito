"""Envio de e-mails transacionais (códigos de recuperação de senha) via SMTP.

Credenciais lidas de Python/credencial.env — nunca comitar esse arquivo.
Para Gmail: SMTP_USER é o e-mail completo e SMTP_PASSWORD é uma "senha de
app" gerada em https://myaccount.google.com/apppasswords (a senha normal da
conta Google não funciona com SMTP).
"""

import os
import smtplib
from email.mime.text import MIMEText
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / "credencial.env")

SMTP_HOST = os.environ.get("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", 587))
SMTP_USER = os.environ.get("SMTP_USER")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD")
SMTP_FROM = os.environ.get("SMTP_FROM", SMTP_USER)


def enviar_email(destinatario, assunto, corpo_html):
    if not SMTP_USER or not SMTP_PASSWORD:
        print(f"[email_service] Credenciais SMTP ausentes — e-mail para {destinatario} não enviado.")
        return False

    msg = MIMEText(corpo_html, "html", "utf-8")
    msg["Subject"] = assunto
    msg["From"] = SMTP_FROM
    msg["To"] = destinatario

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_FROM, [destinatario], msg.as_string())
        return True
    except Exception as erro:
        print(f"[email_service] Falha ao enviar e-mail para {destinatario}: {erro}")
        return False


def enviar_codigo_recuperacao(destinatario, nome, codigo):
    primeiro_nome = nome.split(" ")[0]
    corpo = f"""
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #2e7d32;">Mega Distrito</h2>
            <p>Olá, {primeiro_nome}!</p>
            <p>Recebemos uma solicitação para redefinir sua senha. Use o código abaixo para continuar:</p>
            <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1565c0; text-align: center;
                      padding: 16px; background: #f4f6f8; border-radius: 8px;">{codigo}</p>
            <p>Esse código expira em 15 minutos. Se você não solicitou a redefinição de senha, pode ignorar este e-mail.</p>
        </div>
    """
    return enviar_email(destinatario, "Seu código de recuperação — Mega Distrito", corpo)


def enviar_codigo_confirmacao(destinatario, nome, codigo):
    primeiro_nome = nome.split(" ")[0]
    corpo = f"""
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #2e7d32;">Mega Distrito</h2>
            <p>Olá, {primeiro_nome}!</p>
            <p>Falta pouco para ativar sua conta. Use o código abaixo para confirmar seu cadastro:</p>
            <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #2e7d32; text-align: center;
                      padding: 16px; background: #f4f6f8; border-radius: 8px;">{codigo}</p>
            <p>Esse código expira em 15 minutos. Se você não fez esse cadastro, pode ignorar este e-mail.</p>
        </div>
    """
    return enviar_email(destinatario, "Confirme seu cadastro — Mega Distrito", corpo)
