import { PrismaClient } from "@prisma/client";
import path from "path";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${path.join(process.cwd(), "prisma", "planforge.db")}`,
    },
  },
});

async function seedData() {
  console.log("🌱 Starting database seeding...");

  try {
    // Clear existing data
    console.log("🧹 Clearing existing data...");
    await prisma.taskDependency.deleteMany();
    await prisma.task.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.resource.deleteMany();
    await prisma.plan.deleteMany();

    // Create sample plans
    console.log("📋 Creating sample plans...");

    const plan1 = await prisma.plan.create({
      data: {
        title: "Launch Personal Blog",
        description:
          "Create and launch a personal blog using Next.js and deploy it to production",
        goal: "Build a professional blog to share technical knowledge and establish online presence",
        timeframe: "3 months",
        status: "ACTIVE",
      },
    });

    const plan2 = await prisma.plan.create({
      data: {
        title: "Learn Machine Learning",
        description:
          "Complete a comprehensive machine learning course and build practical projects",
        goal: "Gain proficiency in ML algorithms and build a portfolio of ML projects",
        timeframe: "6 months",
        status: "ACTIVE",
      },
    });

    const plan3 = await prisma.plan.create({
      data: {
        title: "Mobile App Development",
        description: "Develop and publish a React Native mobile application",
        goal: "Create a successful mobile app with 1000+ downloads",
        timeframe: "4 months",
        status: "COMPLETED",
      },
    });

    // Create milestones for Plan 1 (Blog)
    console.log("🎯 Creating milestones...");

    const milestone1_1 = await prisma.milestone.create({
      data: {
        title: "Setup Development Environment",
        description: "Configure Next.js, styling, and development tools",
        targetDate: new Date("2024-02-15"),
        status: "COMPLETED",
        order: 1,
        planId: plan1.id,
      },
    });

    const milestone1_2 = await prisma.milestone.create({
      data: {
        title: "Content Creation",
        description: "Write initial blog posts and create content strategy",
        targetDate: new Date("2024-03-15"),
        status: "IN_PROGRESS",
        order: 2,
        planId: plan1.id,
      },
    });

    const milestone1_3 = await prisma.milestone.create({
      data: {
        title: "Deployment & Launch",
        description: "Deploy to production and announce launch",
        targetDate: new Date("2024-04-01"),
        status: "TODO",
        order: 3,
        planId: plan1.id,
      },
    });

    // Create milestones for Plan 2 (ML)
    const milestone2_1 = await prisma.milestone.create({
      data: {
        title: "Foundation Learning",
        description: "Complete basic ML theory and mathematics",
        targetDate: new Date("2024-03-01"),
        status: "IN_PROGRESS",
        order: 1,
        planId: plan2.id,
      },
    });

    const milestone2_2 = await prisma.milestone.create({
      data: {
        title: "Practical Projects",
        description: "Build 3 ML projects with different algorithms",
        targetDate: new Date("2024-05-15"),
        status: "TODO",
        order: 2,
        planId: plan2.id,
      },
    });

    // Create tasks for Plan 1
    console.log("✅ Creating tasks...");

    const tasks1 = await Promise.all([
      prisma.task.create({
        data: {
          title: "Initialize Next.js project",
          description: "Set up Next.js with TypeScript and Tailwind CSS",
          status: "COMPLETED",
          priority: "HIGH",
          estimatedHours: 4,
          actualHours: 3,
          dueDate: new Date("2024-01-15"),
          completedAt: new Date("2024-01-14"),
          order: 1,
          planId: plan1.id,
          milestoneId: milestone1_1.id,
        },
      }),
      prisma.task.create({
        data: {
          title: "Design blog layout",
          description: "Create responsive design for blog posts and navigation",
          status: "COMPLETED",
          priority: "HIGH",
          estimatedHours: 8,
          actualHours: 10,
          dueDate: new Date("2024-01-25"),
          completedAt: new Date("2024-01-24"),
          order: 2,
          planId: plan1.id,
          milestoneId: milestone1_1.id,
        },
      }),
      prisma.task.create({
        data: {
          title: "Implement MDX support",
          description: "Add MDX support for writing blog posts in markdown",
          status: "COMPLETED",
          priority: "MEDIUM",
          estimatedHours: 6,
          actualHours: 8,
          dueDate: new Date("2024-02-05"),
          completedAt: new Date("2024-02-03"),
          order: 3,
          planId: plan1.id,
          milestoneId: milestone1_1.id,
        },
      }),
      prisma.task.create({
        data: {
          title: "Write first blog post",
          description: "Create an introductory blog post about the journey",
          status: "IN_PROGRESS",
          priority: "HIGH",
          estimatedHours: 4,
          actualHours: 2,
          dueDate: new Date("2024-02-20"),
          order: 4,
          planId: plan1.id,
          milestoneId: milestone1_2.id,
        },
      }),
      prisma.task.create({
        data: {
          title: "Create technical tutorials",
          description: "Write 5 technical tutorials on web development",
          status: "TODO",
          priority: "MEDIUM",
          estimatedHours: 20,
          dueDate: new Date("2024-03-10"),
          order: 5,
          planId: plan1.id,
          milestoneId: milestone1_2.id,
        },
      }),
      prisma.task.create({
        data: {
          title: "Setup analytics",
          description: "Implement Google Analytics and performance monitoring",
          status: "TODO",
          priority: "LOW",
          estimatedHours: 3,
          dueDate: new Date("2024-03-25"),
          order: 6,
          planId: plan1.id,
          milestoneId: milestone1_3.id,
        },
      }),
    ]);

    // Create tasks for Plan 2 (ML)
    const tasks2 = await Promise.all([
      prisma.task.create({
        data: {
          title: "Complete Linear Algebra course",
          description: "Finish Khan Academy linear algebra course",
          status: "COMPLETED",
          priority: "HIGH",
          estimatedHours: 40,
          actualHours: 45,
          dueDate: new Date("2024-01-30"),
          completedAt: new Date("2024-01-28"),
          order: 1,
          planId: plan2.id,
          milestoneId: milestone2_1.id,
        },
      }),
      prisma.task.create({
        data: {
          title: "Study Statistics fundamentals",
          description:
            "Learn probability, distributions, and hypothesis testing",
          status: "IN_PROGRESS",
          priority: "HIGH",
          estimatedHours: 30,
          actualHours: 15,
          dueDate: new Date("2024-02-28"),
          order: 2,
          planId: plan2.id,
          milestoneId: milestone2_1.id,
        },
      }),
      prisma.task.create({
        data: {
          title: "Build regression model",
          description:
            "Create a house price prediction model using linear regression",
          status: "TODO",
          priority: "MEDIUM",
          estimatedHours: 15,
          dueDate: new Date("2024-04-01"),
          order: 3,
          planId: plan2.id,
          milestoneId: milestone2_2.id,
        },
      }),
    ]);

    // Create tasks for Plan 3 (Mobile App - completed)
    const tasks3 = await Promise.all([
      prisma.task.create({
        data: {
          title: "Setup React Native development environment",
          description:
            "Install and configure React Native CLI, Android Studio, and Xcode",
          status: "COMPLETED",
          priority: "HIGH",
          estimatedHours: 8,
          actualHours: 10,
          dueDate: new Date("2023-09-15"),
          completedAt: new Date("2023-09-14"),
          order: 1,
          planId: plan3.id,
        },
      }),
      prisma.task.create({
        data: {
          title: "Design app UI/UX",
          description:
            "Create wireframes and design mockups for the mobile app",
          status: "COMPLETED",
          priority: "HIGH",
          estimatedHours: 20,
          actualHours: 25,
          dueDate: new Date("2023-10-01"),
          completedAt: new Date("2023-09-30"),
          order: 2,
          planId: plan3.id,
        },
      }),
      prisma.task.create({
        data: {
          title: "Implement core features",
          description: "Build main app functionality and navigation",
          status: "COMPLETED",
          priority: "HIGH",
          estimatedHours: 40,
          actualHours: 45,
          dueDate: new Date("2023-11-15"),
          completedAt: new Date("2023-11-12"),
          order: 3,
          planId: plan3.id,
        },
      }),
      prisma.task.create({
        data: {
          title: "Testing and debugging",
          description: "Comprehensive testing on iOS and Android devices",
          status: "COMPLETED",
          priority: "MEDIUM",
          estimatedHours: 15,
          actualHours: 18,
          dueDate: new Date("2023-12-01"),
          completedAt: new Date("2023-11-28"),
          order: 4,
          planId: plan3.id,
        },
      }),
      prisma.task.create({
        data: {
          title: "App Store submission",
          description: "Prepare and submit app to App Store and Google Play",
          status: "COMPLETED",
          priority: "HIGH",
          estimatedHours: 8,
          actualHours: 12,
          dueDate: new Date("2023-12-15"),
          completedAt: new Date("2023-12-10"),
          order: 5,
          planId: plan3.id,
        },
      }),
    ]);

    // Create task dependencies
    console.log("🔗 Creating task dependencies...");
    await prisma.taskDependency.create({
      data: {
        dependentId: tasks1[1].id, // Design blog layout
        prerequisiteId: tasks1[0].id, // Initialize Next.js project
      },
    });

    await prisma.taskDependency.create({
      data: {
        dependentId: tasks1[2].id, // Implement MDX support
        prerequisiteId: tasks1[1].id, // Design blog layout
      },
    });

    await prisma.taskDependency.create({
      data: {
        dependentId: tasks1[3].id, // Write first blog post
        prerequisiteId: tasks1[2].id, // Implement MDX support
      },
    });

    // Create resources
    console.log("📚 Creating resources...");
    await Promise.all([
      prisma.resource.create({
        data: {
          title: "Next.js Documentation",
          description: "Official Next.js documentation and guides",
          url: "https://nextjs.org/docs",
          type: "DOCUMENTATION",
          planId: plan1.id,
        },
      }),
      prisma.resource.create({
        data: {
          title: "Tailwind CSS Cheatsheet",
          description: "Quick reference for Tailwind CSS classes",
          url: "https://tailwindcss.com/docs",
          type: "REFERENCE",
          planId: plan1.id,
        },
      }),
      prisma.resource.create({
        data: {
          title: "MDX Documentation",
          description: "Guide for using MDX with React components",
          url: "https://mdxjs.com/docs/",
          type: "DOCUMENTATION",
          planId: plan1.id,
        },
      }),
      prisma.resource.create({
        data: {
          title: "Machine Learning Course",
          description: "Andrew Ng's Machine Learning course on Coursera",
          url: "https://www.coursera.org/learn/machine-learning",
          type: "COURSE",
          planId: plan2.id,
        },
      }),
      prisma.resource.create({
        data: {
          title: "Python for Data Science",
          description: "Comprehensive Python guide for data science",
          url: "https://pandas.pydata.org/docs/",
          type: "DOCUMENTATION",
          planId: plan2.id,
        },
      }),
    ]);

    // Create settings
    console.log("⚙️ Creating default settings...");
    await prisma.settings.upsert({
      where: { id: "settings" },
      update: {},
      create: {
        id: "settings",
        theme: "LIGHT",
        language: "en",
      },
    });

    console.log("✅ Database seeding completed successfully!");
    console.log(`📊 Created:`);
    console.log(`   - ${3} plans`);
    console.log(`   - ${5} milestones`);
    console.log(`   - ${14} tasks`);
    console.log(`   - ${3} task dependencies`);
    console.log(`   - ${5} resources`);
    console.log(`   - Default settings`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
if (require.main === module) {
  seedData()
    .then(() => {
      console.log("🎉 Seeding process completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Seeding process failed:", error);
      process.exit(1);
    });
}

export { seedData };
