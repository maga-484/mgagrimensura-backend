import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function enviarCorreoNuevaParcela(datos: {
  id: number;
  clienteNombre: string;
  clienteEmail: string;
  areaM2: number;
  perimetroM: number;
  fechaCreacion: string;
}): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || !process.env.RESEND_API_KEY) {
    console.log("📧 Email desactivado: falta RESEND_API_KEY o ADMIN_EMAIL");
    return;
  }

  const areaHa = (datos.areaM2 / 10000).toFixed(4);

  try {
    await resend.emails.send({
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
