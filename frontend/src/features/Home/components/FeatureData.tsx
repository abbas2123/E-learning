import type { ReactNode } from "react";
import type { BulletColorClass } from "./FeatureBullet";
import VideoMeetingIllustration from "./illustrations/VideoMeetingIllustration";
import TeacherIllustration from "./illustrations/TeacherIllustration";
import QuizIllustration from "./illustrations/QuizIllustration";
import GradebookIllustration from "./illustrations/GradebookIllustration";
import DiscussionIllustration from "./illustrations/DiscussionIllustration";

export interface FeatureItem {
  id: string;
  title: string;
  highlightText?: string;
  description: string;
  bullets: Array<{ text: string; colorClass: BulletColorClass }>;
  illustration: ReactNode;
}

export const features: FeatureItem[] = [
  {
    id: "user-interface",
    title: "A user interface designed for the classroom",
    highlightText: "user interface",
    description:
      "Run interactive sessions, monitor participation, and keep every student engaged with meeting tools built specifically for digital learning.",
    bullets: [
      {
        text: "Teachers don't get lost in grid view and have a dedicated Podium space.",
        colorClass: "violet",
      },
      {
        text: "TA's and presenters can be moved to the front of the class seamlessly.",
        colorClass: "orange",
      },
      {
        text: "Teachers can easily see all students and class data at one time.",
        colorClass: "indigo",
      },
    ],
    illustration: <VideoMeetingIllustration />,
  },
  {
    id: "tools-for-teachers",
    title: "Tools For Teachers And Learners",
    highlightText: "Tools",
    description:
      "Class has a dynamic set of teaching tools built to be deployed and used during class. Teachers can handout assignments in real-time for students to complete and submit.",
    bullets: [
      {
        text: "Interactive lesson cards and structured study materials",
        colorClass: "cyan",
      },
      {
        text: "Smart planning tools with automated assignment deadlines",
        colorClass: "orange",
      },
      {
        text: "Instant progress insights for both teachers and students",
        colorClass: "pink",
      },
    ],
    illustration: <TeacherIllustration />,
  },
  {
    id: "quizzes-assessments",
    title: "Assessments, Quizzes, Tests",
    highlightText: "Quizzes,",
    description:
      "Easily launch live assignments, quizzes, and tests. Student results are automatically entered in the online gradebook for seamless evaluation.",
    bullets: [
      {
        text: "Mobile-friendly quiz cards with instant submission feedback",
        colorClass: "cyan",
      },
      {
        text: "Success badges and visual progress indicators",
        colorClass: "emerald",
      },
      {
        text: "Real-time scoring and automated gradebook synchronization",
        colorClass: "violet",
      },
    ],
    illustration: <QuizIllustration />,
  },
  {
    id: "class-management",
    title: "Class Management Tools for Educators",
    highlightText: "Class Management",
    description:
      "Class provides tools to help run and manage the class such as Class Roster, Attendance, and more. With the Gradebook, teachers can review and grade tests and quizzes in real-time.",
    bullets: [
      {
        text: "Visual scores and real-time progress bars across all courses",
        colorClass: "cyan",
      },
      {
        text: "Student avatars, live status tracking, and roster management",
        colorClass: "emerald",
      },
      {
        text: "Easy exporting, grade management, and report sharing",
        colorClass: "orange",
      },
    ],
    illustration: <GradebookIllustration />,
  },
  {
    id: "discussions",
    title: "One-on-One Discussions",
    highlightText: "One-on-One",
    description:
      "Teachers and teacher assistants can talk with students privately without leaving the digital classroom environment.",
    bullets: [
      {
        text: "Dedicated private discussion rooms with instant chat & video",
        colorClass: "cyan",
      },
      {
        text: "Pinned student questions and live private feedback notes",
        colorClass: "pink",
      },
      {
        text: "Clear next-step action tracking for individual student support",
        colorClass: "emerald",
      },
    ],
    illustration: <DiscussionIllustration />,
  },
];
