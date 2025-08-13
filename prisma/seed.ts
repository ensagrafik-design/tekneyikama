import { PrismaClient, Role, VesselType, JobStatus, MediaKind } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.media.deleteMany();
  await prisma.cleaningSectionProgress.deleteMany();
  await prisma.cleaningJob.deleteMany();
  await prisma.vesselSection.deleteMany();
  await prisma.vessel.deleteMany();
  await prisma.client.deleteMany();
  await prisma.sectionTemplate.deleteMany();
  await prisma.user.deleteMany();

  // Create section templates
  const sectionTemplates = await Promise.all([
    prisma.sectionTemplate.create({
      data: { name: 'Güverte', description: 'Ana güverte alanı', order: 1 },
    }),
    prisma.sectionTemplate.create({
      data: { name: 'Sintine', description: 'Tekne altı sintine alanı', order: 2 },
    }),
    prisma.sectionTemplate.create({
      data: { name: 'Başüstü', description: 'Üst güverte alanı', order: 3 },
    }),
    prisma.sectionTemplate.create({
      data: { name: 'Kaptan Köşkü', description: 'Yönetim bölümü', order: 4 },
    }),
    prisma.sectionTemplate.create({
      data: { name: 'Kabin', description: 'İç mekan kabin alanı', order: 5 },
    }),
    prisma.sectionTemplate.create({
      data: { name: 'Vinç', description: 'Vinç ve makine alanları', order: 6 },
    }),
    prisma.sectionTemplate.create({
      data: { name: 'Pruva', description: 'Ön bölüm', order: 7 },
    }),
    prisma.sectionTemplate.create({
      data: { name: 'Pupa', description: 'Arka bölüm', order: 8 },
    }),
  ]);

  console.log('Section templates created:', sectionTemplates.length);

  // Create users
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@reefclean.com',
      role: Role.ADMIN,
    },
  });

  const crewUser1 = await prisma.user.create({
    data: {
      name: 'Mehmet Temizci',
      email: 'mehmet@reefclean.com',
      role: Role.CREW,
    },
  });

  const crewUser2 = await prisma.user.create({
    data: {
      name: 'Ayşe Yıkama',
      email: 'ayse@reefclean.com',
      role: Role.CREW,
    },
  });

  const clientUser = await prisma.user.create({
    data: {
      name: 'Ahmet Müşteri',
      email: 'ahmet@example.com',
      role: Role.CLIENT,
    },
  });

  console.log('Users created');

  // Create clients
  const client1 = await prisma.client.create({
    data: {
      name: 'Marmara Yat Kulübü',
      phone: '+90 212 555 0101',
      email: 'info@marmarayat.com',
      companyName: 'Marmara Yat Kulübü Ltd.',
      address: 'Beşiktaş, İstanbul',
      billingNote: 'Aylık fatura düzenlenir',
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: 'Bodrum Marina',
      phone: '+90 252 555 0202',
      email: 'marina@bodrum.com',
      companyName: 'Bodrum Marina A.Ş.',
      address: 'Bodrum, Muğla',
      billingNote: 'Sezon sonu toplu ödeme',
    },
  });

  console.log('Clients created');

  // Create vessels
  const vessel1 = await prisma.vessel.create({
    data: {
      clientId: client1.id,
      name: 'Mavi Rüya',
      type: VesselType.YACHT,
      length: 25.5,
      width: 6.2,
      registrationNo: 'TR-34-2023-001',
      notes: 'Lüks yat, özel dikkat gerekir',
    },
  });

  const vessel2 = await prisma.vessel.create({
    data: {
      clientId: client1.id,
      name: 'Deniz Yıldızı',
      type: VesselType.BOAT,
      length: 12.0,
      width: 3.5,
      registrationNo: 'TR-34-2023-002',
      notes: 'Günlük tur teknesi',
    },
  });

  const vessel3 = await prisma.vessel.create({
    data: {
      clientId: client2.id,
      name: 'Egean Dream',
      type: VesselType.MOTORBOAT,
      length: 18.0,
      width: 4.8,
      registrationNo: 'TR-48-2023-003',
      notes: 'Hızlı motor teknesi',
    },
  });

  console.log('Vessels created');

  // Create vessel sections using templates
  const vesselSectionsData = [];
  const templates = sectionTemplates.slice(0, 5); // Use first 5 templates
  
  for (const vessel of [vessel1, vessel2, vessel3]) {
    for (let i = 0; i < templates.length; i++) {
      const template = templates[i];
      vesselSectionsData.push({
        vesselId: vessel.id,
        name: template.name,
        description: template.description,
        order: template.order,
      });
    }
  }

  const vesselSections = await Promise.all(
    vesselSectionsData.map(data => prisma.vesselSection.create({ data }))
  );

  console.log('Vessel sections created:', vesselSections.length);

  // Create cleaning jobs
  const job1 = await prisma.cleaningJob.create({
    data: {
      vesselId: vessel1.id,
      scheduledAt: new Date('2024-01-15T09:00:00'),
      startedAt: new Date('2024-01-15T09:15:00'),
      finishedAt: new Date('2024-01-15T14:30:00'),
      assignedTo: crewUser1.id,
      status: JobStatus.DONE,
      notes: 'Kapsamlı temizlik tamamlandı',
    },
  });

  const job2 = await prisma.cleaningJob.create({
    data: {
      vesselId: vessel2.id,
      scheduledAt: new Date('2024-01-20T10:00:00'),
      startedAt: new Date('2024-01-20T10:30:00'),
      assignedTo: crewUser2.id,
      status: JobStatus.IN_PROGRESS,
      notes: 'Rutin temizlik devam ediyor',
    },
  });

  const job3 = await prisma.cleaningJob.create({
    data: {
      vesselId: vessel3.id,
      scheduledAt: new Date('2024-01-25T08:00:00'),
      assignedTo: crewUser1.id,
      status: JobStatus.DRAFT,
      notes: 'Sezon başı genel temizlik',
    },
  });

  console.log('Cleaning jobs created');

  // Create cleaning progress for completed job
  const vessel1Sections = vesselSections.filter(vs => vs.vesselId === vessel1.id);
  const progressData = [
    { percent: 100, note: 'Güverte tamamen temizlendi' },
    { percent: 95, note: 'Sintine neredeyse bitti' },
    { percent: 100, note: 'Başüstü mükemmel durumda' },
    { percent: 90, note: 'Kaptan köşkü son rötuşlar' },
    { percent: 100, note: 'Kabin temizliği tamamlandı' },
  ];

  const progressRecords = await Promise.all(
    vessel1Sections.map((section, index) =>
      prisma.cleaningSectionProgress.create({
        data: {
          cleaningJobId: job1.id,
          vesselSectionId: section.id,
          percent: progressData[index].percent,
          note: progressData[index].note,
        },
      })
    )
  );

  // Create progress for in-progress job
  const vessel2Sections = vesselSections.filter(vs => vs.vesselId === vessel2.id);
  const inProgressData = [
    { percent: 75, note: 'Güverte devam ediyor' },
    { percent: 50, note: 'Sintine yarıda' },
    { percent: 30, note: 'Başüstü başlandı' },
    { percent: 0, note: 'Henüz başlanmadı' },
    { percent: 0, note: 'Henüz başlanmadı' },
  ];

  await Promise.all(
    vessel2Sections.map((section, index) =>
      prisma.cleaningSectionProgress.create({
        data: {
          cleaningJobId: job2.id,
          vesselSectionId: section.id,
          percent: inProgressData[index].percent,
          note: inProgressData[index].note,
        },
      })
    )
  );

  console.log('Cleaning progress created');

  // Create sample media records
  const sampleMedia = await Promise.all([
    prisma.media.create({
      data: {
        cleaningSectionProgressId: progressRecords[0].id,
        kind: MediaKind.BEFORE,
        url: 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg',
        caption: 'Güverte temizlik öncesi',
      },
    }),
    prisma.media.create({
      data: {
        cleaningSectionProgressId: progressRecords[0].id,
        kind: MediaKind.AFTER,
        url: 'https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg',
        caption: 'Güverte temizlik sonrası',
      },
    }),
    prisma.media.create({
      data: {
        cleaningSectionProgressId: progressRecords[1].id,
        kind: MediaKind.BEFORE,
        url: 'https://images.pexels.com/photos/1906658/pexels-photo-1906658.jpeg',
        caption: 'Sintine temizlik öncesi',
      },
    }),
    prisma.media.create({
      data: {
        cleaningSectionProgressId: progressRecords[1].id,
        kind: MediaKind.AFTER,
        url: 'https://images.pexels.com/photos/2467558/pexels-photo-2467558.jpeg',
        caption: 'Sintine temizlik sonrası',
      },
    }),
  ]);

  console.log('Sample media created:', sampleMedia.length);

  console.log('Database seeded successfully! 🌱');
  console.log('\nSample data created:');
  console.log(`- ${sectionTemplates.length} section templates`);
  console.log('- 4 users (1 admin, 2 crew, 1 client)');
  console.log('- 2 clients');
  console.log('- 3 vessels');
  console.log(`- ${vesselSections.length} vessel sections`);
  console.log('- 3 cleaning jobs');
  console.log(`- ${sampleMedia.length} media files`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });