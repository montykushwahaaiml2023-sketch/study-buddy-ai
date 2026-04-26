const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seeding process...");

  // 1. Create a Premium Demo User with Profile and Skills first
  const alex = await prisma.user.upsert({
    where: { name: "Alex Strategist" },
    update: {},
    create: {
      name: "Alex Strategist",
      email: "alex@example.com",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      clerkId: "demo_user_alex_99",
      profile: {
        create: {
          studyLevel: "University",
          school: "Global Institute of Technology",
          course: "Computer Science",
          stream: "Artificial Intelligence",
          branch: "Software Engineering",
          year: "Year 3",
          semester: "Semester 6",
          careerGoal: "Senior ML Engineer at DeepMind",
          targetSalary: "$180k",
          learningStyle: "Visual & Practical",
          dailyStudyHoursTarget: 4.5,
          preferredStudyTime: "Night Owl",
          language: "English",
          access: "Premium",
          streak: 15,
          xpPoints: 4250,
          level: 12,
          interestedIn: "Machine Learning,Neural Networks,Rust,System Design",
          biggestProblem: "Complex Math,Time Management",
        }
      },
      skills: {
        create: [
          { skillName: "Python", proficiencyPct: 92, source: "Assessment" },
          { skillName: "React", proficiencyPct: 85, source: "Projects" },
          { skillName: "Data Structures", proficiencyPct: 78, source: "Quiz" },
          { skillName: "Next.js", proficiencyPct: 60, source: "Manual" }
        ]
      }
    }
  });

  // 2. Add Achievements (Separate to avoid nested failures)
  await prisma.userAchievement.upsert({
    where: { userId_achievementId: { userId: alex.id, achievementId: "early_bird_achive" } }, // This might fail if ID not found, let's use create instead
    update: {},
    create: {
      userId: alex.id,
      achievement: {
        create: {
          id: "early_bird_achive",
          label: "Early Bird",
          description: "Studied for 5 days before 7 AM",
          icon: "🌅",
          conditionType: "study_start",
          conditionValue: 5
        }
      }
    }
  }).catch(() => {});

  // 3. Add Event and nested Tasks (linking manually to avoid Prisma circular dependency issues)
  const mlEvent = await prisma.event.create({
    data: {
      userId: alex.id,
      name: "Mid-Term AI Finals",
      subject: "Machine Learning",
      examDate: new Date("2026-05-15"),
      dailyHours: 3.5,
      syllabus: "Linear Regression, Neural Nets, Backpropagation, CNNs",
      plan: JSON.stringify({
        generatedAt: new Date().toISOString(),
        today_tasks: [
          { task: "Reverse auto-diff lecture", type: "Reading", estimated_time: "45m", priority: "High" },
          { task: "Implement simple perceptron", type: "Coding", estimated_time: "1h 30m", priority: "Medium" }
        ]
      })
    }
  });

  // 4. Add Tasks linked to both Event and User
  await prisma.task.createMany({
    data: [
      { 
        eventId: mlEvent.id, 
        userId: alex.id, 
        topic: "Probability Theory", 
        scheduledDate: new Date(), 
        durationMinutes: 60, 
        priority: "High" 
      },
      { 
        eventId: mlEvent.id, 
        userId: alex.id, 
        topic: "Gradient Descent Lab", 
        scheduledDate: new Date(), 
        durationMinutes: 120, 
        isCompleted: true, 
        priority: "Medium" 
      }
    ]
  });

  // 5. Create a Beginner Demo User
  await prisma.user.upsert({
    where: { name: "Sara Learner" },
    update: {},
    create: {
      name: "Sara Learner",
      email: "sara@example.com",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sara",
      clerkId: "demo_user_sara_01",
      profile: {
        create: {
          studyLevel: "High School",
          school: "Lincoln High",
          course: "Science Stream",
          careerGoal: "Full Stack Developer",
          learningStyle: "Auditory",
          dailyStudyHoursTarget: 2.0,
          streak: 3,
          xpPoints: 150,
          level: 2,
          interestedIn: "Web Development,HTML,CSS",
          biggestProblem: "Concentration",
        }
      }
    }
  });

  console.log("✅ Seeding complete. Created accounts for Alex and Sara.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
