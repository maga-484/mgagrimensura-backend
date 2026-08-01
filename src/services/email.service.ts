import { Resend } from "resend";

let resend: Resend | null = null;

function getResend() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

export async function enviarCorreoNuevaParcela(datos: {
  id: number;
  clienteNombre: string;
  clienteEmail: string;
  areaM2: number;
  perimetroM: number;
  fechaCreacion: string;
}): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  const client = getResend();

  if (!client || !adminEmail) {
    console.log("📧 Email omitido: falta RESEND_API_KEY o ADMIN_EMAIL");
    console.log("   Parcela guardada:", datos.clienteNombre, `ID:${datos.id}`);
    return;
  }

  const areaHa = (datos.areaM2 / 10000).toFixed(4);

  try {
    await client.emails.send({
      from: "Sistema Agrimensura <onboarding@resend.dev>",
      to: adminEmail,
      subject: `📍 Nueva parcela — ${datos.clienteNombre}`,
      html: `
        <h2>Nueva parcela registrada</h2>
        <p><strong>Cliente:</strong> ${datos.clienteNombre}</p>
        <p><strong>Email:</strong> ${datos.clienteEmail}</p>
        <p><strong>Área:</strong> ${areaHa} ha</p>
        <p><strong>Perímetro:</strong> ${datos.perimetroM.toLocaleString("es-AR")} m</p>
        <p><strong>Fecha:</strong> ${new Date(datos.fechaCreacion).toLocaleString("es-AR")}</p>
        <p><strong>ID:</strong> ${datos.id}</p>
        <hr>
        <a href="https://maga-484.github.io/mgagrimensura-admin/">Abrir panel</a>
      `,
    });
    console.log("✅ Email enviado a", adminEmail);
  } catch (error) {
    console.error("❌ Error enviando email:", error);
  }
}
export async function enviarCorreoACliente(datos: {
  id: number;
  clienteNombre: string;
  clienteEmail: string;
  estado: string;
  asunto: string;
  mensaje: string;
}): Promise<void> {
  const client = getResend();

  if (!client || !process.env.ADMIN_EMAIL) {
    console.log(
      "📧 Email a cliente omitido: falta RESEND_API_KEY o ADMIN_EMAIL",
    );
    return;
  }

  try {
    await client.emails.send({
      from: "Sistema Agrimensura <onboarding@resend.dev>",
      to: datos.clienteEmail,
      subject: datos.asunto,
      html: `
        <h2>Hola ${datos.clienteNombre},</h2>
        <p>${datos.mensaje}</p>
        <p><strong>ID de parcela:</strong> ${datos.id}</p>
        <p><strong>Estado actual:</strong> ${datos.estado}</p>
        <hr>
        <p>Sistema de Gestión Agrimensura</p>
      `,
    });
    console.log("✅ Email enviado a cliente:", datos.clienteEmail);
  } catch (error) {
    console.error("❌ Error enviando email a cliente:", error);
  }
}
