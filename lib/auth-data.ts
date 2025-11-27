import type { User, Student } from "./types"

// Demo credentials for login
export const demoCredentials = {
  admin: {
    email: "admin@gmail.com",
    password: "admin123",
  },
  student: {
    email: "student@gmail.com",
    password: "student123",
  },
}

// Load from localStorage or use default
function loadStudentsFromStorage(): Map<string, Student> {
  if (typeof window === "undefined") {
    return new Map()
  }
  
  try {
    const stored = localStorage.getItem("vidhyarthi_students")
    if (stored) {
      const data = JSON.parse(stored)
      return new Map(data)
    }
  } catch (e) {
    console.error("Failed to load students from storage:", e)
  }
  
  return new Map([
    [
      "student@gmail.com",
      {
        id: "student-001",
        name: "John Doe",
        email: "student@gmail.com",
        phone: "+91 98765 43210",
        address: "123 Main St, Mumbai, Maharashtra 400001",
        dateOfBirth: "1995-05-15",
        gender: "male",
        education: "Bachelor's in Computer Science",
        occupation: "Software Developer",
        emergencyContact: "+91 98765 43211",
        bio: "Passionate about learning new technologies and building innovative solutions.",
        skills: ["JavaScript", "React", "Node.js"],
        linkedIn: "https://linkedin.com/in/johndoe",
        github: "https://github.com/johndoe",
        createdAt: "2025-01-01",
        password: "student123",
      },
    ],
  ])
}

export let registeredStudents: Map<string, Student> = loadStudentsFromStorage()

// Save students to localStorage
function saveStudentsToStorage() {
  if (typeof window === "undefined") return
  try {
    const data = Array.from(registeredStudents.entries())
    localStorage.setItem("vidhyarthi_students", JSON.stringify(data))
  } catch (e) {
    console.error("Failed to save students to storage:", e)
  }
}

// Demo users
export const demoUsers: Record<string, User> = {
  "admin@gmail.com": {
    id: "admin-001",
    name: "Admin User",
    email: "admin@gmail.com",
    role: "admin",
    createdAt: "2024-01-01",
  },
}

export function validateCredentials(email: string, password: string): User | null {
  // Check admin
  if (email === demoCredentials.admin.email && password === demoCredentials.admin.password) {
    return { ...demoUsers["admin@gmail.com"] }
  }

  // Check registered students
  const student = registeredStudents.get(email)
  if (student && student.password === password) {
    return {
      id: student.id,
      name: student.name,
      email: student.email,
      role: "student",
      phone: student.phone,
      address: student.address,
      dateOfBirth: student.dateOfBirth,
      gender: student.gender,
      education: student.education,
      occupation: student.occupation,
      emergencyContact: student.emergencyContact,
      bio: student.bio,
      skills: student.skills,
      linkedIn: student.linkedIn,
      github: student.github,
      createdAt: student.createdAt,
    }
  }

  return null
}

export function registerStudent(data: Omit<Student, "id" | "createdAt">): User {
  const id = `student-${Date.now()}`
  const newStudent: Student = {
    ...data,
    id,
    createdAt: new Date().toISOString().split("T")[0],
  }

  registeredStudents.set(data.email, newStudent)
  saveStudentsToStorage()

  return {
    id: newStudent.id,
    name: newStudent.name,
    email: newStudent.email,
    role: "student",
    phone: newStudent.phone,
    address: newStudent.address,
    dateOfBirth: newStudent.dateOfBirth,
    gender: newStudent.gender,
    education: newStudent.education,
    occupation: newStudent.occupation,
    emergencyContact: newStudent.emergencyContact,
    bio: newStudent.bio,
    skills: newStudent.skills,
    linkedIn: newStudent.linkedIn,
    github: newStudent.github,
    createdAt: newStudent.createdAt,
  }
}

export function getStudentByEmail(email: string): Student | undefined {
  return registeredStudents.get(email)
}

export function updateStudentProfile(email: string, data: Partial<Student>): User | null {
  const student = registeredStudents.get(email)
  if (!student) return null

  const updatedStudent: Student = {
    ...student,
    ...data,
  }

  registeredStudents.set(email, updatedStudent)
  saveStudentsToStorage()

  return {
    id: updatedStudent.id,
    name: updatedStudent.name,
    email: updatedStudent.email,
    role: "student",
    phone: updatedStudent.phone,
    address: updatedStudent.address,
    dateOfBirth: updatedStudent.dateOfBirth,
    gender: updatedStudent.gender,
    education: updatedStudent.education,
    occupation: updatedStudent.occupation,
    emergencyContact: updatedStudent.emergencyContact,
    bio: updatedStudent.bio,
    skills: updatedStudent.skills,
    linkedIn: updatedStudent.linkedIn,
    github: updatedStudent.github,
    createdAt: updatedStudent.createdAt,
  }
}

export function updateStudentPassword(email: string, newPassword: string): boolean {
  const student = registeredStudents.get(email)
  if (!student) return false

  student.password = newPassword
  registeredStudents.set(email, student)
  saveStudentsToStorage()
  return true
}

export function getAllStudents(): Student[] {
  return Array.from(registeredStudents.values())
}

