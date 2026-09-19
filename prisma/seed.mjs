import "dotenv/config";
import prisma from "../src/utils/prisma.client.mjs";
import bcrypt from "bcryptjs";
import { geocodeAddress, calculateRoute } from "../src/services/route.service.mjs";

const DEMO_USER = {
    name: "Demo User",
    email: "demo@jobfin.test",
    password: "Password123!",
    homeAddress: "Jl. Braga No. 1, Bandung, Jawa Barat",
};

const DUMMY_JOBS = [
    { companyName: "Gojek", position: "Frontend Engineer", status: "interview", monthsAgo: 0, daysAgo: 2, companyAddress: "Jl. Kemang Selatan Raya, Jakarta Selatan", notes: "Interview HR selesai, nunggu jadwal technical test." },
    { companyName: "Tokopedia", position: "Fullstack Developer", status: "applied", monthsAgo: 0, daysAgo: 5, companyAddress: "Jl. Prof. Dr. Satrio, Jakarta Selatan", notes: "" },
    { companyName: "Traveloka", position: "React Developer", status: "offer", monthsAgo: 0, daysAgo: 10, companyAddress: "Jl. DR Ide Anak Agung Gde Agung, Jakarta Selatan", notes: "Nego salary, deadline respon 3 hari." },
    { companyName: "Telkomsel", position: "Backend Engineer", status: "rejected", monthsAgo: 1, daysAgo: 3, companyAddress: "Jl. Gatot Subroto, Bandung", notes: "Gagal di technical test." },
    { companyName: "Bank BCA", position: "IT Support", status: "applied", monthsAgo: 1, daysAgo: 12, companyAddress: "Jl. Asia Afrika, Bandung", notes: "" },
    { companyName: "Bukalapak", position: "Software Engineer", status: "interview", monthsAgo: 1, daysAgo: 20, companyAddress: "Jl. HR Rasuna Said, Jakarta Selatan", notes: "User interview minggu depan." },
    { companyName: "Dicoding Indonesia", position: "Web Developer", status: "accepted", monthsAgo: 2, daysAgo: 1, companyAddress: "Jl. PHH Mustofa, Bandung", notes: "Diterima! Mulai kerja bulan depan." },
    { companyName: "Bank Mandiri", position: "Junior Programmer", status: "rejected", monthsAgo: 2, daysAgo: 15, companyAddress: "Jl. Asia Afrika, Bandung", notes: "" },
    { companyName: "Shopee", position: "Frontend Developer", status: "applied", monthsAgo: 2, daysAgo: 25, companyAddress: "Jl. Jend. Sudirman, Jakarta Pusat", notes: "" },
    { companyName: "Telkom Indonesia", position: "Software Engineer Trainee", status: "interview", monthsAgo: 2, daysAgo: 8, companyAddress: "Jl. Japati, Bandung", notes: "Tahap wawancara user." },
    { companyName: "GudangAda", position: "Backend Developer", status: "applied", monthsAgo: 3, daysAgo: 2, companyAddress: "Jl. Casablanca Raya, Jakarta Selatan", notes: "" },
    { companyName: "Amartha", position: "Fullstack Engineer", status: "rejected", monthsAgo: 3, daysAgo: 18, companyAddress: "Jl. TB Simatupang, Jakarta Selatan", notes: "Overqualified katanya." },
    { companyName: "XL Axiata", position: "IT Programmer", status: "applied", monthsAgo: 3, daysAgo: 22, companyAddress: "Jl. DR Ide Anak Agung Gde Agung, Jakarta Selatan", notes: "" },
    { companyName: "PT Pos Indonesia", position: "Web Developer", status: "applied", monthsAgo: 0, daysAgo: 1, companyAddress: "Jl. Cilaki, Bandung", notes: "Baru submit lamaran hari ini." },
    { companyName: "Bank BNI", position: "Programmer Analyst", status: "interview", monthsAgo: 0, daysAgo: 7, companyAddress: "Jl. Braga, Bandung", notes: "Technical test online minggu ini." },
];

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function subDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
}

function subMonths(date, months) {
    const result = new Date(date);
    result.setMonth(result.getMonth() - months);
    return result;
}

async function main() {
    console.log("Seeding demo account...");

    const existing = await prisma.user.findUnique({ where: { email: DEMO_USER.email } });
    if (existing) {
        await prisma.jobApplication.deleteMany({ where: { userId: existing.id } });
        await prisma.user.delete({ where: { id: existing.id } });
        console.log("Akun demo lama dihapus, membuat ulang...");
    }

    console.log(`Geocoding alamat rumah: ${DEMO_USER.homeAddress}`);
    const home = await geocodeAddress(DEMO_USER.homeAddress);

    const hashedPassword = await bcrypt.hash(DEMO_USER.password, 10);

    const user = await prisma.user.create({
        data: {
            name: DEMO_USER.name,
            email: DEMO_USER.email,
            password: hashedPassword,
            provider: "local",
            emailVerifiedAt: new Date(),
            homeAddress: DEMO_USER.homeAddress,
            homeLat: home.lat,
            homeLng: home.lng,
            theme: "light",
        },
    });

    console.log(`User dibuat: ${user.email} (id: ${user.id})`);
    console.log(`Membuat ${DUMMY_JOBS.length} lamaran...`);

    const now = new Date();

    for (const [index, job] of DUMMY_JOBS.entries()) {
        const appliedDate = subDays(subMonths(now, job.monthsAgo), job.daysAgo);

        let routeData = {};

        try {
            await sleep(1100); // hormati rate limit Nominatim
            const company = await geocodeAddress(job.companyAddress);

            await sleep(1100);
            const route = await calculateRoute({
                fromLat: home.lat,
                fromLng: home.lng,
                toLat: company.lat,
                toLng: company.lng,
            });

            routeData = {
                companyLat: company.lat,
                companyLng: company.lng,
                distanceKm: route.distanceKm,
                durationMin: route.durationMin,
                routeGeometry: route.geometry,
                routeFetchedAt: new Date(),
            };

            console.log(`  [${index + 1}/${DUMMY_JOBS.length}] ${job.companyName} -> ${route.distanceKm} km`);
        } catch (err) {
            console.warn(`  [${index + 1}/${DUMMY_JOBS.length}] ${job.companyName} -> gagal geocode/rute, dilewati (${err.message})`);
        }

        await prisma.jobApplication.create({
            data: {
                userId: user.id,
                companyName: job.companyName,
                position: job.position,
                status: job.status,
                appliedDate,
                companyAddress: job.companyAddress,
                notes: job.notes || null,
                ...routeData,
            },
        });
    }

    console.log("\nSelesai! Login pakai akun berikut untuk testing:");
    console.log(`  Email    : ${DEMO_USER.email}`);
    console.log(`  Password : ${DEMO_USER.password}`);
}

main()
    .catch((err) => {
        console.error("Seed gagal:", err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
