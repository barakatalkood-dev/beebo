const sequelize = require("../config/database");
const Service = require("../models/Service");

const services = [

  // =========================
  // Eyebrow & Eyelashes
  // =========================

  {
    name: "Eyebrow bleaching",
    description: "تشقير الحواجب",
    duration: 20,
    price: 3
  },
  {
    name: "Eyebrow tinting",
    description: "صبغ الحواجب",
    duration: 30,
    price: 5
  },
  {
    name: "Full face bleaching",
    description: "تشقير كامل الوجه",
    duration: 45,
    price: 3
  },
  {
    name: "Eyebrow lamination",
    description: "رفع الحواجب",
    duration: 60,
    price: 15
  },
  {
    name: "Eyelashes lifting",
    description: "تقويس الرموش",
    duration: 60,
    price: 20
  },
  {
    name: "Eyebrow lamination & Eyelashes lifting",
    description: "رفع الحواجب وتقويس الرموش",
    duration: 90,
    price: 30
  },


  // =========================
  // Hair Cut
  // =========================

  {
    name: "Bangs cut",
    description: "قص الغرة",
    duration: 15,
    price: 2
  },
  {
    name: "Split ends of hair",
    description: "قص أطراف الشعر",
    duration: 20,
    price: 3
  },
  {
    name: "New hair cut",
    description: "قصة شعر جديدة",
    duration: 45,
    price: 5
  },
  {
    name: "Gradient haircut",
    description: "قصة شعر مدرج",
    duration: 60,
    price: 7
  },


  // =========================
  // Hair Wash & Blow Dry
  // =========================

  {
    name: "Hair wash",
    description: "غسيل الشعر",
    duration: 20,
    price: 2
  },
  {
    name: "Hair blow dry",
    description: "تجفيف الشعر",
    duration: 30,
    price: 2
  },
  {
    name: "Blow dry for very short hair",
    description: "سشوار الشعر القصير جداً",
    duration: 30,
    price: 4
  },
  {
    name: "Blow dry for short hair",
    description: "سشوار الشعر القصير",
    duration: 40,
    price: 6
  },
  {
    name: "Blow dry for medium hair",
    description: "سشوار الشعر المتوسط",
    duration: 50,
    price: 8
  },
  {
    name: "Blow dry for long hair",
    description: "سشوار الشعر الطويل",
    duration: 60,
    price: 10
  },
  {
    name: "Blow dry for very long hair",
    description: "سشوار الشعر الطويل جداً",
    duration: 75,
    price: 15
  },


  // =========================
  // Massage
  // =========================

  {
    name: "Foot Massage 30 min",
    description: "مساج القدم 30 دقيقة",
    duration: 30,
    price: 10
  },
  {
    name: "Head and Shoulders Massage 30 min",
    description: "مساج الرأس والأكتاف 30 دقيقة",
    duration: 30,
    price: 10
  },
  {
    name: "Oil Massage Full Body 30 min",
    description: "مساج بالزيوت كامل الجسم 30 دقيقة",
    duration: 30,
    price: 20
  },
  {
    name: "Hot Stone Massage Full Body 1 hour",
    description: "مساج بالأحجار الساخنة كامل الجسم ساعة",
    duration: 60,
    price: 20
  },
  {
    name: "Beebo Aromatic Massage 30 min",
    description: "مساج بيبو العطري 30 دقيقة",
    duration: 30,
    price: 15
  },
  {
    name: "Beebo Aromatic Massage 1 hour",
    description: "مساج بيبو العطري ساعة",
    duration: 60,
    price: 20
  },


  // =========================
  // Wax
  // =========================

  {
    name: "Under arm wax",
    description: "واكس الإبط",
    duration: 15,
    price: 2
  },
  {
    name: "Half hand wax",
    description: "واكس نصف يد",
    duration: 20,
    price: 3
  },
  {
    name: "Half leg wax",
    description: "واكس نصف رجل",
    duration: 30,
    price: 4
  },
  {
    name: "Full hand wax",
    description: "واكس كامل اليد",
    duration: 40,
    price: 6
  },
  {
    name: "Full leg wax",
    description: "واكس كامل الرجل",
    duration: 50,
    price: 8
  },
  {
    name: "Stomach wax",
    description: "واكس البطن",
    duration: 30,
    price: 4
  },
  {
    name: "Back wax",
    description: "واكس الظهر",
    duration: 40,
    price: 6
  },
  {
    name: "Full body wax",
    description: "واكس كامل الجسم",
    duration: 120,
    price: 25
  }

];


async function seed() {
  try {

    await sequelize.authenticate();

    await Service.destroy({
      where: {}
    });

    await Service.bulkCreate(services);

    const count = await Service.count();

    console.log(`Inserted services: ${count}`);

    process.exit();

  } catch (error) {

    console.error(error);
    process.exit(1);

  }
}


seed();