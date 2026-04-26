import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const rawData = await req.json();

    if (!rawData.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Split data into User-related and Profile-related
    // For this demo, we use the name as the unique identifier
    
    // 1. Sanitize unique fields to avoid constraint violations on empty strings
    const userUpdate = {
      name: rawData.name,
      email: rawData.email && rawData.email.trim() !== "" ? rawData.email : null,
      avatarUrl: rawData.avatarUrl,
      clerkId: rawData.clerkId && rawData.clerkId.trim() !== "" ? rawData.clerkId : null,
    };

    const profileUpdate = {
      studyLevel: rawData.studyLevel,
      school: rawData.school,
      course: rawData.course,
      stream: rawData.stream,
      branch: rawData.branch,
      year: rawData.year,
      semester: rawData.semester,
      careerGoal: rawData.careerGoal,
      targetSalary: rawData.targetSalary,
      learningStyle: rawData.learningStyle,
      language: rawData.language || "English",
      access: rawData.access,
      streak: parseInt(rawData.streak) || 0,
      xpPoints: parseInt(rawData.xpPoints) || 0,
      level: parseInt(rawData.level) || 1,
      interestedIn: Array.isArray(rawData.interestedIn) ? rawData.interestedIn.filter(Boolean).join(",") : "",
      biggestProblem: Array.isArray(rawData.biggestProblem) ? rawData.biggestProblem.filter(Boolean).join(",") : "",
      careerRoadmapJson: rawData.careerRoadmap ? JSON.stringify(rawData.careerRoadmap) : null,
    };

    // Use a transaction to update User, Profile, Skills, and Events
    const updatedUser = await prisma.$transaction(async (tx) => {
      // 1. Upsert User and Profile
      // For 1-to-1 relations in Prisma, nested upsert inside update is standard
      const u = await tx.user.upsert({
        where: { name: rawData.name },
        update: {
          ...userUpdate,
          profile: {
            upsert: {
              create: profileUpdate,
              update: profileUpdate,
            }
          }
        },
        create: {
          ...userUpdate,
          profile: {
            create: profileUpdate
          }
        }
      });

      // 2. Sync Skills (Deduplicate to avoid unique constraint violations)
      if (Array.isArray(rawData.skills)) {
        await tx.skill.deleteMany({ where: { userId: u.id } });
        
        const skillMap = new Map();
        rawData.skills.forEach((s: any) => {
          const name = (typeof s === 'string' ? s : (s.skillName || s.name || "Skill")).trim();
          if (name && !skillMap.has(name)) {
            skillMap.set(name, {
              userId: u.id,
              skillName: name,
              performancePct: typeof s === 'object' ? (s.proficiencyPct || s.performancePct || 50) : 50,
              source: typeof s === 'object' ? (s.source || "manual") : "manual"
            });
          }
        });

        const skillsToCreate = Array.from(skillMap.values());
        if (skillsToCreate.length > 0) {
          // Note: Using individual creates if createMany has issues with some drivers, 
          // but modern SQLite/PostgreSQL supports it fine.
          await tx.skill.createMany({ 
            data: skillsToCreate.map(s => ({
              userId: s.userId,
              skillName: s.skillName,
              proficiencyPct: s.performancePct,
              source: s.source
            }))
          });
        }
      }

      // 3. Sync Events
      if (Array.isArray(rawData.events)) {
        await tx.event.deleteMany({ where: { userId: u.id } });
        const eventsToCreate = rawData.events
          .filter((e: any) => e && e.name)
          .map((e: any) => {
            let examDate = new Date();
            try {
              const d = new Date(e.date || e.examDate || Date.now());
              if (!isNaN(d.getTime())) examDate = d;
            } catch (err) { /* ignore and use now */ }

            return {
              userId: u.id,
              name: e.name,
              subject: e.subject || e.name,
              examDate: examDate,
              dailyHours: parseFloat(e.dailyHours) || 2.0,
              syllabus: e.syllabus || "",
              plan: e.plan ? (typeof e.plan === 'object' ? JSON.stringify(e.plan) : String(e.plan)) : null
            };
          });

        if (eventsToCreate.length > 0) {
          await tx.event.createMany({ data: eventsToCreate });
        }
      }

      return await tx.user.findUnique({
        where: { id: u.id },
        include: {
          profile: true,
          skills: true,
          events: true,
          achievements: true,
        }
      });
    }, {
      timeout: 10000 // Increase timeout for complex syncs
    });

    if (!updatedUser) throw new Error("Sync failed to return user");

    // Flatten for the frontend UserContext which expects a merged object
    // Also split strings back to arrays and parse plans
    const mergedUser = {
      ...updatedUser,
      ...(updatedUser.profile || {}),
      interestedIn: updatedUser.profile?.interestedIn ? updatedUser.profile.interestedIn.split(",").filter(Boolean) : [],
      biggestProblem: updatedUser.profile?.biggestProblem ? updatedUser.profile.biggestProblem.split(",").filter(Boolean) : [],
      careerRoadmap: updatedUser.profile?.careerRoadmapJson ? JSON.parse(updatedUser.profile.careerRoadmapJson) : null,
      events: updatedUser.events?.map(ev => {
        let plan = ev.plan;
        if (typeof plan === 'string' && plan.trim() !== "") {
          try {
            plan = JSON.parse(plan);
          } catch (e) { /* keep as string if parse fails */ }
        }
        return {
          ...ev,
          plan,
          date: ev.examDate
        };
      }) || [],
      skills: updatedUser.skills || []
    };

    return NextResponse.json({ success: true, user: mergedUser });
  } catch (error: any) {
    console.error("Sync Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
    try {
      const { searchParams } = new URL(req.url);
      const name = searchParams.get("name");
  
      if (!name) {
        return NextResponse.json({ error: "Name is required" }, { status: 400 });
      }
  
      const user = await prisma.user.findUnique({
        where: { name },
        include: {
          profile: true,
          skills: true,
          achievements: true,
          events: true,
          weakAreas: true,
        }
      });
      
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Flatten for the frontend
      const mergedUser = {
        ...user,
        ...(user.profile || {}),
        interestedIn: user.profile?.interestedIn ? user.profile.interestedIn.split(",").filter(Boolean) : [],
        biggestProblem: user.profile?.biggestProblem ? user.profile.biggestProblem.split(",").filter(Boolean) : [],
        careerRoadmap: user.profile?.careerRoadmapJson ? JSON.parse(user.profile.careerRoadmapJson) : null,
        events: user.events?.map(ev => {
          let plan = ev.plan;
          if (typeof plan === 'string' && plan.trim() !== "") {
            try {
              plan = JSON.parse(plan);
            } catch (e) { /* keep as string if parse fails */ }
          }
          return {
            ...ev,
            plan,
            date: ev.examDate
          };
        }) || [],
        skills: user.skills || []
      };
  
      return NextResponse.json({ success: true, user: mergedUser });
    } catch (error: any) {
      console.error("Fetch Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
