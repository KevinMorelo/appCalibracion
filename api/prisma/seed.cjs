const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function main() {
  const cliente = await db.cliente.create({
    data: { nombre: 'Cliente Demo', nit: '900000000-1', ciudad: 'Bogotá' }
  });

  const metrologo = await db.user.create({
    data: { email: 'metrologo@demo.com', name: 'Metrólogo Demo', role: 'METROLOGO', passwordHash: 'x' }
  });

  const equipo = await db.equipo.create({
    data: { clienteId: cliente.id, tipo: 'Termohigrómetro', marca: 'Acme', modelo: 'TH-100', serie: 'S-001', inventario: 'INV-001' }
  });

  console.log('IDs de prueba =>', { clienteId: cliente.id, metrologoId: metrologo.id, equipoId: equipo.id });
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
