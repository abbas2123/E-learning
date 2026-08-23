import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import "dotenv/config";
import { UserModel, UserRole, AuthProvider, UserStatus } from "./modules/auth/Repository/database/User";
import { CategoryModel } from "./modules/admin/Repository/database/Category";
import { CourseModel, CourseLevel, CourseStatus } from "./modules/course/repository/database/Course";
import { EnrollmentModel } from "./modules/admin/Repository/database/Enrollment";
import { NotificationModel } from "./modules/admin/Repository/database/Notification";
import { SectionModel } from "./modules/curriculum/database/Section";
import { LessonModel } from "./modules/curriculum/database/Lesson";

async function seed() {
  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/totc-elearning";
  console.log(`[Seed] Connecting to MongoDB: ${mongoUri}`);

  await mongoose.connect(mongoUri);
  console.log("[Seed] Connected successfully.");

  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash("admin123", salt);
  const instructorPassword = await bcrypt.hash("instructor123", salt);
  const studentPassword = await bcrypt.hash("student123", salt);

  // 1. Users
  const usersData = [
    {
      id: "usr-admin-01",
      name: "Platform Administrator",
      email: "admin@totc.com",
      password: adminPassword,
      role: UserRole.ADMIN,
      provider: AuthProvider.LOCAL,
      status: UserStatus.ACTIVE,
      isVerified: true,
      isBlocked: false,
    },
    {
      id: "usr-inst-01",
      name: "Dr. Sarah Jenkins",
      email: "instructor@totc.com",
      password: instructorPassword,
      role: UserRole.INSTRUCTOR,
      provider: AuthProvider.LOCAL,
      status: UserStatus.ACTIVE,
      isVerified: true,
      isBlocked: false,
    },
    {
      id: "usr-stud-01",
      name: "Alex Johnson",
      email: "student@totc.com",
      password: studentPassword,
      role: UserRole.STUDENT,
      provider: AuthProvider.LOCAL,
      status: UserStatus.ACTIVE,
      isVerified: true,
      isBlocked: false,
    },
  ];

  for (const u of usersData) {
    await UserModel.findOneAndUpdate({ email: u.email }, u, { upsert: true, new: true });
  }
  console.log(`[Seed] Seeded ${usersData.length} core users.`);

  // 2. Categories
  const categoriesData = [
    { id: "cat-1", name: "Web Development", slug: "web-development", iconName: "Code", color: "blue" },
    { id: "cat-2", name: "Frontend", slug: "frontend", iconName: "Layout", color: "indigo" },
    { id: "cat-3", name: "Backend", slug: "backend", iconName: "Server", color: "purple" },
    { id: "cat-4", name: "Database", slug: "database", iconName: "Database", color: "emerald" },
    { id: "cat-5", name: "Programming", slug: "programming", iconName: "Terminal", color: "amber" },
    { id: "cat-6", name: "UI/UX Design", slug: "ui-ux-design", iconName: "Figma", color: "rose" },
  ];

  for (const c of categoriesData) {
    await CategoryModel.findOneAndUpdate({ id: c.id }, c, { upsert: true, new: true });
  }
  console.log(`[Seed] Seeded ${categoriesData.length} categories.`);

  // 3. Courses
  const coursesData = [
    {
      id: "crs-mern-01",
      title: "Full Stack MERN Development",
      slug: "full-stack-mern-development",
      description: "Build modern, production-ready full-stack applications using React, Node.js, Express, and MongoDB.",
      thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
      category: "Web Development",
      level: CourseLevel.INTERMEDIATE,
      language: "English",
      price: 2999,
      discountPrice: 1999,
      duration: 42,
      status: CourseStatus.PUBLISHED,
      createdBy: "usr-inst-01",
      requirements: ["Basic HTML/CSS", "JavaScript fundamentals"],
      learningOutcomes: ["Master MERN architecture", "Build RESTful APIs", "Deploy to Vercel & Render"],
    },
    {
      id: "crs-react-02",
      title: "Advanced React & Next.js Masterclass",
      slug: "advanced-react-nextjs-masterclass",
      description: "Master React Server Components, App Router, state management, and performance optimization.",
      thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80",
      category: "Frontend",
      level: CourseLevel.ADVANCED,
      language: "English",
      price: 3499,
      discountPrice: 2499,
      duration: 36,
      status: CourseStatus.PUBLISHED,
      createdBy: "usr-inst-01",
      requirements: ["Solid JavaScript ES6+", "Basic React understanding"],
      learningOutcomes: ["Next.js App Router", "Server Side Rendering", "State Management with Zustand"],
    },
    {
      id: "crs-node-03",
      title: "Node.js & Express Microservices",
      slug: "nodejs-express-microservices",
      description: "Design scalable backend microservices, clean architecture patterns, JWT auth, and Docker deployment.",
      thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
      category: "Backend",
      level: CourseLevel.INTERMEDIATE,
      language: "English",
      price: 2499,
      discountPrice: 1799,
      duration: 30,
      status: CourseStatus.PUBLISHED,
      createdBy: "usr-inst-01",
      requirements: ["Basic JavaScript / Node.js"],
      learningOutcomes: ["Clean Architecture in Node", "REST & Express middleware", "MongoDB Mongoose ORM"],
    },
    {
      id: "crs-db-04",
      title: "MongoDB & Database Architecture",
      slug: "mongodb-database-architecture",
      description: "Learn schema design, indexing strategies, aggregation pipelines, and performance tuning.",
      thumbnail: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=800&q=80",
      category: "Database",
      level: CourseLevel.BEGINNER,
      language: "English",
      price: 1999,
      discountPrice: 1499,
      duration: 20,
      status: CourseStatus.PUBLISHED,
      createdBy: "usr-inst-01",
      requirements: ["No prerequisites required"],
      learningOutcomes: ["NoSQL database modeling", "Complex Aggregations", "Database Indexing"],
    },
  ];

  for (const crs of coursesData) {
    await CourseModel.findOneAndUpdate({ id: crs.id }, crs, { upsert: true, new: true });
  }
  console.log(`[Seed] Seeded ${coursesData.length} courses.`);

  // 4. Initial Enrollment
  const enrollmentData = {
    id: "enr-01",
    studentId: "usr-stud-01",
    studentName: "Alex Johnson",
    studentEmail: "student@totc.com",
    courseId: "crs-mern-01",
    courseTitle: "Full Stack MERN Development",
    amountPaid: 2999,
    paymentMethod: "Stripe",
    status: "completed",
  };

  await EnrollmentModel.findOneAndUpdate({ id: enrollmentData.id }, enrollmentData, { upsert: true, new: true });
  console.log("[Seed] Seeded initial enrollment.");

  // 5. System Notifications
  const notificationsData = [
    {
      id: "notif-1",
      title: "Welcome to TOTC Admin",
      message: "The platform environment has been configured and verified successfully.",
      type: "system",
      read: false,
    },
    {
      id: "notif-2",
      title: "New Course Submission",
      message: "Dr. Sarah Jenkins submitted 'Full Stack MERN Development' for approval.",
      type: "approval",
      read: false,
    },
  ];

  for (const n of notificationsData) {
    await NotificationModel.findOneAndUpdate({ id: n.id }, n, { upsert: true, new: true });
  }
  console.log(`[Seed] Seeded ${notificationsData.length} initial notifications.`);

  // 6. Curriculum Sections & Lessons
  const sectionsData = [
    {
      id: "sec-mern-01",
      courseId: "crs-mern-01",
      title: "Module 1: MERN Stack Foundation & Setup",
      description: "Overview of full-stack development, tooling, and environment setup.",
      order: 1,
    },
    {
      id: "sec-mern-02",
      courseId: "crs-mern-01",
      title: "Module 2: Building Express & Node REST APIs",
      description: "Deep dive into Express routes, controllers, and MongoDB integration.",
      order: 2,
    },
  ];

  for (const sec of sectionsData) {
    await SectionModel.findOneAndUpdate({ id: sec.id }, sec, { upsert: true, new: true });
  }

  const lessonsData = [
    {
      id: "les-mern-01",
      sectionId: "sec-mern-01",
      courseId: "crs-mern-01",
      title: "Welcome & Course Overview",
      description: "Introduction to the MERN architecture and project structure.",
      type: "video",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      duration: 10,
      order: 1,
      isPreview: true,
    },
    {
      id: "les-mern-02",
      sectionId: "sec-mern-01",
      courseId: "crs-mern-01",
      title: "Setting up Node & Express Environment",
      description: "Configuring package.json, TypeScript, and ESLint.",
      type: "video",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      duration: 15,
      order: 2,
      isPreview: false,
    },
    {
      id: "les-mern-03",
      sectionId: "sec-mern-02",
      courseId: "crs-mern-01",
      title: "Designing MongoDB Schemas with Mongoose",
      description: "Defining models, indexes, and validation rules.",
      type: "video",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      duration: 25,
      order: 1,
      isPreview: false,
    },
  ];

  for (const les of lessonsData) {
    await LessonModel.findOneAndUpdate({ id: les.id }, les, { upsert: true, new: true });
  }
  console.log(`[Seed] Seeded ${sectionsData.length} sections and ${lessonsData.length} lessons.`);

  await mongoose.disconnect();
  console.log("[Seed] Completed successfully!");
}

seed().catch((err) => {
  console.error("[Seed] Error during seeding:", err);
  process.exit(1);
});
