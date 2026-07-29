import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function enviarCorreoNuevaParcela(datos: {
  id: number;
  clienteNombre: string;
  clienteEmail: string;
  areaM2: number;
  perimetroM: number;
  fechaCreacion: string;
}): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("Configuración de email incompleta. Saltando notificación.");
    return;
  }

  const areaHa = (datos.areaM2 / 10000).toFixed(4);

  const mailOptions = {
    from: `"Sistema Agrimensura" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `📍 Nueva parcela recibida — ${datos.clienteNombre}`,
    html: `
      <h2>Nueva parcela registrada</h2>
      <p><strong>Cliente:</strong> ${datos.clienteNombre}</p>
      <p><strong>Email:</strong> ${datos.clienteEmail}</p>
      <p><strong>Área:</strong> ${areaHa} ha (${datos.areaM2.toLocaleString("es-AR")} m²)</p>
      <p><strong>Perímetro:</strong> ${datos.perimetroM.toLocaleString("es-AR")} m</p>
      <p><strong>Fecha:</strong> ${new Date(datos.fechaCreacion).toLocaleString("es-AR")}</p>
      <p><strong>ID:</strong> ${datos.id}</p>
      <hr>
      <p>Ver en el panel de administración:</p>
      <a href="https://maga-484.github.io/mgagrimensura-admin/" target="_blank">
        Abrir panel
      </a>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Email de notificación enviado a", adminEmail);
  } catch (error) {
    console.error("❌ Error enviando email:", error);
  }
}
